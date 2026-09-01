import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReturnsRepository } from './returns.repository';
import { LogisticsService } from '../logistics/logistics.service';

// Site-wide fallback when neither the product nor its category overrides
// the return window — matches the value already implied by
// cleanupStaleOrders-style "a month is the norm" defaults elsewhere in
// e-commerce; there's no Settings field for this yet, so it's a constant.
const DEFAULT_RETURN_WINDOW_DAYS = 30;

@Injectable()
export class ReturnsService {
  constructor(
    private prisma: PrismaService,
    private returnsRepository: ReturnsRepository,
    private logisticsService: LogisticsService,
  ) {}

  async createReturnRequest(
    orderId: string,
    user: { userId: string; role: string },
    reason: string,
    comments: string | undefined,
    items: { orderItemId: string; quantity: number }[],
  ) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');

    const isOwner = order.userId === user.userId;
    const isAdmin = ['ADMIN', 'SUPERADMIN'].includes(user.role);
    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('No permission to request a return for this order');
    }

    // Mirrors the frontend's existing gate on the "Request Refund" button
    // (only shown for COMPLETED orders) — an order that hasn't been
    // delivered yet has nothing to physically return.
    if (order.status !== 'COMPLETED') {
      throw new BadRequestException(
        'Returns can only be requested for completed orders',
      );
    }

    // Return-window check: Product.returnWindowDaysOverride takes priority
    // over Category.returnWindowDaysOverride, which takes priority over the
    // site-wide default. order.updatedAt is used as the "completed at"
    // timestamp — the order model doesn't track a separate completion time,
    // and updatedAt reflects the most recent status transition, which for a
    // COMPLETED order is exactly that transition.
    const orderItems = await this.prisma.orderItem.findMany({
      where: { id: { in: items.map((i) => i.orderItemId) } },
      include: { product: { include: { category: true } } },
    });
    const daysSinceCompletion =
      (Date.now() - order.updatedAt.getTime()) / (1000 * 60 * 60 * 24);
    for (const orderItem of orderItems) {
      const windowDays =
        orderItem.product.returnWindowDaysOverride ??
        orderItem.product.category?.returnWindowDaysOverride ??
        DEFAULT_RETURN_WINDOW_DAYS;
      if (daysSinceCompletion > windowDays) {
        throw new BadRequestException(
          `The return window for "${orderItem.name}" (${windowDays} days) has passed`,
        );
      }
    }

    return this.returnsRepository.createReturnRequest(
      orderId,
      user.userId,
      reason,
      comments,
      items,
    );
  }

  async getReturnRequest(id: string, user: { userId: string; role: string }) {
    const returnRequest = await this.returnsRepository.findById(id);
    if (!returnRequest) throw new NotFoundException('Return request not found');

    const isOwner = returnRequest.order.userId === user.userId;
    const isAdmin = ['ADMIN', 'SUPERADMIN'].includes(user.role);
    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('No permission to view this return request');
    }

    return returnRequest;
  }

  async getMyReturnRequests(userId: string) {
    return this.returnsRepository.findMany({ userId });
  }

  async getAllReturnRequests(status?: string) {
    return this.returnsRepository.findMany(
      status ? { status: status as any } : {},
    );
  }

  async updateStatus(
    id: string,
    status: 'APPROVED' | 'REJECTED',
    adminUserId: string,
    rejectionReason?: string,
  ) {
    const existing = await this.returnsRepository.findById(id);
    if (!existing) throw new NotFoundException('Return request not found');
    if (existing.status !== 'REQUESTED') {
      throw new BadRequestException(
        `Cannot ${status.toLowerCase()} a return request that is already ${existing.status}`,
      );
    }

    return this.returnsRepository.updateStatus(
      id,
      status,
      adminUserId,
      rejectionReason,
    );
  }

  // Admin receiving flow: for each physically-received item, RESELLABLE
  // credits it back into the order's fulfillment warehouse (via the same
  // guarded DELTA adjustment path everything else in logistics uses);
  // DAMAGED logs a DAMAGE StockMovement for the audit trail but does not
  // touch Inventory — a damaged unit doesn't go back into sellable stock.
  async receiveItems(
    returnRequestId: string,
    items: { returnItemId: string; condition: 'RESELLABLE' | 'DAMAGED' }[],
    adminUserId: string,
  ) {
    const returnRequest = await this.returnsRepository.findById(returnRequestId);
    if (!returnRequest) throw new NotFoundException('Return request not found');

    if (!['APPROVED', 'RECEIVED'].includes(returnRequest.status)) {
      throw new BadRequestException(
        'Return request must be approved before items can be received',
      );
    }

    const warehouseId = returnRequest.order.warehouseId;

    for (const { returnItemId, condition } of items) {
      const returnItem = returnRequest.items.find((i) => i.id === returnItemId);
      if (!returnItem) {
        throw new BadRequestException(
          `Return item ${returnItemId} does not belong to this return request`,
        );
      }
      if (returnItem.receivedAt) continue; // already processed — idempotent

      const orderItem = returnItem.orderItem;
      const target = {
        variantId: orderItem.variantId ?? undefined,
        productId: orderItem.variantId ? undefined : orderItem.productId,
      };

      if (condition === 'RESELLABLE' && warehouseId) {
        await this.logisticsService.updateStock(
          target,
          warehouseId,
          returnItem.quantity,
          'RESTOCK',
          `Return received (order ${returnRequest.order.orderNumber})`,
          adminUserId,
          'DELTA',
        );
      } else if (condition === 'DAMAGED') {
        await this.prisma.stockMovement.create({
          data: {
            variantId: target.variantId,
            productId: target.productId,
            toWarehouseId: warehouseId ?? undefined,
            quantity: returnItem.quantity,
            reason: 'DAMAGE',
            note: `Damaged return received (order ${returnRequest.order.orderNumber}) — not restocked`,
            userId: adminUserId,
          },
        });
      }

      await this.returnsRepository.markItemReceived(returnItemId, condition);
    }

    await this.returnsRepository.syncStatusAfterReceiving(returnRequestId);

    return this.returnsRepository.findById(returnRequestId);
  }
}
