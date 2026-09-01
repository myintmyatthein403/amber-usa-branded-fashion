import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, ReturnItemCondition } from '@prisma/client';

const RETURN_INCLUDE = {
  items: { include: { orderItem: true } },
  order: {
    select: { id: true, orderNumber: true, userId: true, warehouseId: true },
  },
  user: { select: { id: true, name: true, email: true } },
} satisfies Prisma.ReturnRequestInclude;

@Injectable()
export class ReturnsRepository {
  constructor(private prisma: PrismaService) {}

  async createReturnRequest(
    orderId: string,
    userId: string | null,
    reason: string,
    comments: string | undefined,
    items: { orderItemId: string; quantity: number }[],
  ) {
    return this.prisma.$transaction(async (tx) => {
      for (const item of items) {
        const orderItem = await tx.orderItem.findUnique({
          where: { id: item.orderItemId },
        });
        if (!orderItem || orderItem.orderId !== orderId) {
          throw new BadRequestException(
            `Order item ${item.orderItemId} does not belong to this order`,
          );
        }

        // A previously REJECTED return for this line item doesn't consume
        // its returnable quantity — every other status does, so the same
        // unit can't be claimed by two simultaneously-open return requests.
        const alreadyClaimed = await tx.returnItem.aggregate({
          where: {
            orderItemId: item.orderItemId,
            returnRequest: { status: { not: 'REJECTED' } },
          },
          _sum: { quantity: true },
        });
        const usedQty = alreadyClaimed._sum.quantity ?? 0;
        if (usedQty + item.quantity > orderItem.quantity) {
          throw new BadRequestException(
            `Return quantity for "${orderItem.name}" exceeds the quantity ordered`,
          );
        }
      }

      return tx.returnRequest.create({
        data: {
          orderId,
          userId,
          reason,
          comments,
          items: {
            create: items.map((i) => ({
              orderItemId: i.orderItemId,
              quantity: i.quantity,
            })),
          },
        },
        include: RETURN_INCLUDE,
      });
    });
  }

  async findById(id: string) {
    return this.prisma.returnRequest.findUnique({
      where: { id },
      include: RETURN_INCLUDE,
    });
  }

  async findMany(where: Prisma.ReturnRequestWhereInput) {
    return this.prisma.returnRequest.findMany({
      where,
      include: RETURN_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(
    id: string,
    status: 'APPROVED' | 'REJECTED',
    processedBy: string,
    rejectionReason?: string,
  ) {
    const existing = await this.prisma.returnRequest.findUnique({ where: { id } });
    if (!existing) return null;

    return this.prisma.returnRequest.update({
      where: { id },
      data: {
        status,
        processedAt: new Date(),
        processedBy,
        comments:
          status === 'REJECTED' && rejectionReason
            ? [existing.comments, `Rejection reason: ${rejectionReason}`]
                .filter(Boolean)
                .join(' | ')
            : existing.comments,
      },
      include: RETURN_INCLUDE,
    });
  }

  async markItemReceived(returnItemId: string, condition: ReturnItemCondition) {
    return this.prisma.returnItem.update({
      where: { id: returnItemId },
      data: { condition, receivedAt: new Date() },
    });
  }

  // Promotes the request to RECEIVED once at least one item has come back,
  // and to COMPLETED once every item has. Never regresses a request that's
  // already COMPLETED/REJECTED.
  async syncStatusAfterReceiving(returnRequestId: string) {
    const items = await this.prisma.returnItem.findMany({
      where: { returnRequestId },
    });
    if (items.length === 0) return;

    const allReceived = items.every((i) => i.receivedAt != null);
    const anyReceived = items.some((i) => i.receivedAt != null);

    if (allReceived) {
      await this.prisma.returnRequest.updateMany({
        where: { id: returnRequestId, status: { notIn: ['REJECTED'] } },
        data: { status: 'COMPLETED' },
      });
    } else if (anyReceived) {
      await this.prisma.returnRequest.updateMany({
        where: { id: returnRequestId, status: { in: ['APPROVED', 'REQUESTED'] } },
        data: { status: 'RECEIVED' },
      });
    }
  }
}
