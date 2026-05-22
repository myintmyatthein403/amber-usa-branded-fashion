import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { OrdersRepository } from './orders.repository';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderStatusChangedEvent } from '../common/events/domain.events';
import { ExchangeRateHelper } from '../currencies/exchange-rate.helper';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { normalizePrice, toUsd } from '@amber/shared';

const STRIPE_METHOD_NAMES = ['stripe', 'credit card'];

function isManualPaymentMethod(paymentMethod: string): boolean {
  const lower = paymentMethod.toLowerCase();
  return !STRIPE_METHOD_NAMES.some((s) => lower.includes(s));
}

@Injectable()
export class OrdersService {
  constructor(
    private ordersRepository: OrdersRepository,
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
    private exchangeRateHelper: ExchangeRateHelper,
    private cloudinaryService: CloudinaryService,
  ) {}

  async createOrder(data: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    phone: string;
    shippingMethod: string;
    paymentMethod: string;
    paymentReference?: string;
    totalAmount: number;
    currency: string;
    market?: string;
    shippingCountry?: string;
    deliveryFee?: number;
    deliveryMethodId?: string;
    warehouseId?: string;
    shippingAddress: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    street?: string;
    state?: string;
    township?: string;
    zipCode?: string;
    items: Array<{
      productId: string;
      variantId?: string;
      name: string;
      price: number;
      isUsd: boolean;
      currencyCode?: string;
      quantity: number;
      image: string;
      size?: string;
    }>;
  }) {
    let warehouseId = data.warehouseId;
    const itemsWithPreOrderInfo = [];
    let calculatedTotal = 0;
    const orderCurrency = data.currency || 'USD';

    if (!warehouseId) {
      const firstItem = data.items.find((item) => item.variantId);
      if (firstItem && firstItem.variantId) {
        const inventory = await this.ordersRepository.findWarehouseWithStock(
          firstItem.variantId,
          firstItem.quantity,
        );
        warehouseId = inventory?.warehouseId;
      }
    }

    if (!warehouseId) {
      warehouseId =
        (await this.ordersRepository.findDefaultWarehouse('MYANMAR'))?.id ||
        (await this.ordersRepository.findAnyWarehouse())?.id;
    }

    if (!warehouseId) {
      throw new BadRequestException('No fulfillment warehouse available');
    }

    const lockedExchangeRate = await this.exchangeRateHelper.getRateForOrder(
      orderCurrency,
    );

    for (const item of data.items) {
      let isPreOrder = false;
      let expectedShippingDate = null;
      let dbPrice = 0;
      let currencyCode = item.currencyCode || (item.isUsd ? 'USD' : 'MMK');

      if (item.variantId) {
        const variant = await this.ordersRepository.findVariantForOrder(
          item.variantId,
        );
        if (!variant)
          throw new NotFoundException(`Variant not found: ${item.variantId}`);

        dbPrice = Number(variant.price || variant.product.price);
        currencyCode =
          (variant as { currencyCode?: string }).currencyCode ||
          (variant.product as { currencyCode?: string }).currencyCode ||
          currencyCode;
        isPreOrder = variant.isPreOrder || variant.product.isPreOrder;
        expectedShippingDate =
          variant.preOrderShippingDate || variant.product.preOrderShippingDate;
      } else {
        const product = await this.ordersRepository.findProductForOrder(
          item.productId,
        );
        if (!product)
          throw new NotFoundException(`Product not found: ${item.productId}`);

        dbPrice = Number(product.price);
        currencyCode =
          (product as { currencyCode?: string }).currencyCode || currencyCode;
        isPreOrder = product.isPreOrder;
        expectedShippingDate = product.preOrderShippingDate;
      }

      const unitPriceUsd = toUsd(dbPrice, currencyCode, lockedExchangeRate);
      const lineInOrderCurrency = normalizePrice(
        dbPrice * item.quantity,
        currencyCode,
        orderCurrency,
        lockedExchangeRate,
      );
      calculatedTotal += lineInOrderCurrency;

      itemsWithPreOrderInfo.push({
        ...item,
        price: dbPrice,
        currencyCode,
        unitPriceUsd,
        isUsd: currencyCode === 'USD',
        isPreOrder,
        expectedShippingDate,
      });
    }

    calculatedTotal += data.deliveryFee || 0;

    return this.ordersRepository.create(
      data,
      warehouseId,
      itemsWithPreOrderInfo,
      calculatedTotal,
      lockedExchangeRate,
    );
  }

  async uploadPaymentProof(
    orderId: string,
    userId: string,
    file: Express.Multer.File,
  ) {
    const order = await this.ordersRepository.findById(orderId);
    if (!order) throw new NotFoundException('Order not found');

    if (order.userId && order.userId !== userId) {
      throw new ForbiddenException('You can only upload proof for your own orders');
    }

    if (!isManualPaymentMethod(order.paymentMethod)) {
      throw new BadRequestException(
        'Payment proof upload is only for manual payment methods',
      );
    }

    if (order.paymentStatus !== 'PENDING' && order.paymentStatus !== 'REJECTED') {
      throw new BadRequestException(
        'Payment proof can only be uploaded while payment is pending or after rejection',
      );
    }

    const result = await this.cloudinaryService.uploadFile(file, {
      folder: `amber-brand-fashion/payment-proofs/${orderId}`,
    });

    const url = (result as { secure_url?: string }).secure_url;
    if (!url) {
      throw new BadRequestException('Failed to upload payment proof');
    }

    return this.ordersRepository.update(orderId, {
      paymentProofUrl: url,
      paymentProofUploadedAt: new Date(),
      paymentStatus: 'PENDING',
      manualPaymentRejectionReason: null,
      manualPaymentReviewedAt: null,
      manualPaymentReviewedBy: null,
    });
  }

  async confirmManualPayment(orderId: string, adminUserId: string) {
    const order = await this.ordersRepository.findById(orderId);
    if (!order) throw new NotFoundException('Order not found');

    if (!isManualPaymentMethod(order.paymentMethod)) {
      throw new BadRequestException('Not a manual payment order');
    }

    if (!order.paymentProofUrl) {
      throw new BadRequestException(
        'Cannot confirm payment without uploaded proof',
      );
    }

    if (order.paymentStatus === 'PAID') {
      throw new BadRequestException('Order is already paid');
    }

    await this.ordersRepository.update(orderId, {
      paymentStatus: 'PAID',
      status: 'PROCESSING',
      manualPaymentReviewedAt: new Date(),
      manualPaymentReviewedBy: adminUserId,
      manualPaymentRejectionReason: null,
    });

    const updated = await this.ordersRepository.findById(orderId);
    if (updated && order.status !== 'PROCESSING') {
      this.eventEmitter.emit(
        'order.status_changed',
        new OrderStatusChangedEvent(orderId, order.status, 'PROCESSING'),
      );
    }

    return updated;
  }

  async rejectManualPayment(
    orderId: string,
    adminUserId: string,
    reason: string,
  ) {
    const order = await this.ordersRepository.findById(orderId);
    if (!order) throw new NotFoundException('Order not found');

    if (!isManualPaymentMethod(order.paymentMethod)) {
      throw new BadRequestException('Not a manual payment order');
    }

    await this.ordersRepository.update(orderId, {
      paymentStatus: 'REJECTED',
      manualPaymentReviewedAt: new Date(),
      manualPaymentReviewedBy: adminUserId,
      manualPaymentRejectionReason: reason,
    });

    return this.ordersRepository.findById(orderId);
  }

  async getOrderById(id: string, user?: { userId: string; role: string }) {
    const order = await this.ordersRepository.findById(id);
    if (!order) throw new NotFoundException(`Order with ID ${id} not found`);

    if (user) {
      const isOwner = order.userId === user.userId;
      const isAdmin = ['ADMIN', 'SUPERADMIN'].includes(user.role);
      if (!isOwner && !isAdmin)
        throw new ForbiddenException('No permission to access this order');
    } else {
      throw new ForbiddenException('Authentication required');
    }

    return order;
  }

  async updateOrderStatus(id: string, status: OrderStatus) {
    const order = await this.ordersRepository.findById(id);
    if (!order) throw new NotFoundException('Order not found');

    const oldStatus = order.status;
    if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
      await this.ordersRepository.restock(order.id);
    }

    const updatedOrder = await this.ordersRepository.updateStatus(id, status);

    if (oldStatus !== status) {
      this.eventEmitter.emit(
        'order.status_changed',
        new OrderStatusChangedEvent(id, oldStatus, status),
      );
    }

    return updatedOrder;
  }

  async updateOrderTracking(
    id: string,
    trackingData: {
      carrier?: string;
      trackingNumber?: string;
      warehouseId?: string;
    },
  ) {
    const order = await this.ordersRepository.findById(id);
    if (!order) throw new NotFoundException('Order not found');

    const updateData: Record<string, string> = {};
    if (trackingData.carrier) updateData.carrier = trackingData.carrier;
    if (trackingData.trackingNumber)
      updateData.trackingNumber = trackingData.trackingNumber;
    if (trackingData.warehouseId)
      updateData.warehouseId = trackingData.warehouseId;

    return this.ordersRepository.update(id, updateData);
  }

  async updatePaymentStatus(
    id: string,
    paymentStatus: PaymentStatus,
    options?: { skipRestock?: boolean },
  ) {
    const order = await this.ordersRepository.findById(id);
    if (!order) throw new NotFoundException('Order not found');

    if (paymentStatus === 'FAILED' && order.paymentStatus !== 'FAILED') {
      const previousStatus = order.paymentStatus;
      try {
        await this.prisma.$transaction(async (tx) => {
          await tx.order.update({
            where: { id },
            data: { paymentStatus: 'FAILED' },
          });
          await this.ordersRepository.restockWithTransaction(tx, id);
        });
      } catch (error) {
        await this.ordersRepository.updatePaymentStatus(id, previousStatus);
        throw new BadRequestException(
          'Failed to process payment failure: stock rollback failed',
        );
      }
    } else {
      await this.ordersRepository.updatePaymentStatus(id, paymentStatus);
    }

    return this.ordersRepository.findById(id);
  }

  async bulkUpdateStatus(ids: string[], status: OrderStatus) {
    return this.ordersRepository.bulkUpdateStatus(ids, status);
  }

  async bulkUpdatePaymentStatus(ids: string[], paymentStatus: PaymentStatus) {
    return this.ordersRepository.bulkUpdatePaymentStatus(ids, paymentStatus);
  }

  async getOrderByNumber(orderNumber: string) {
    const order = await this.ordersRepository.findByOrderNumber(orderNumber);
    if (!order)
      throw new NotFoundException(`Order with number ${orderNumber} not found`);
    return order;
  }

  async getOrdersByUser(userId: string) {
    return this.ordersRepository.findByUser(userId);
  }

  async getAllOrders(query: {
    page?: number;
    limit?: number;
    search?: string;
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    awaitingPaymentReview?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      paymentStatus,
      awaitingPaymentReview,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;

    if (awaitingPaymentReview) {
      where.paymentStatus = 'PENDING';
      where.paymentProofUrl = { not: null };
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { shippingAddress: { contains: search, mode: 'insensitive' } },
        { paymentReference: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [orders, total] = await this.ordersRepository.findMany(
      where,
      skip,
      Number(limit),
      { [sortBy]: sortOrder },
    );

    return {
      data: orders,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async deleteOrder(id: string) {
    const order = await this.ordersRepository.findById(id);
    if (
      order &&
      !order.restocked &&
      order.status !== 'CANCELLED' &&
      order.paymentStatus !== 'FAILED'
    ) {
      await this.ordersRepository.restock(id);
    }
    return this.ordersRepository.delete(id);
  }

  async getPendingOrdersCount() {
    return this.ordersRepository.countPending();
  }

  async cleanupStaleOrders() {
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const staleOrders = await this.prisma.order.findMany({
      where: {
        status: 'PENDING',
        paymentStatus: 'PENDING',
        paymentProofUrl: null,
        createdAt: { lt: oneHourAgo },
      },
      select: { id: true },
    });

    for (const order of staleOrders) {
      try {
        await this.updateOrderStatus(order.id, 'CANCELLED');
      } catch (error) {
        console.error(`Failed to cleanup stale order ${order.id}:`, error);
      }
    }

    return staleOrders.length;
  }
}
