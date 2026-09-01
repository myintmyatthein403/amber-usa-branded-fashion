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
import { CouponsService } from '../coupons/coupons.service';
import { PriceTiersService } from '../price-tiers/price-tiers.service';
import { normalizePrice, toUsd, calculateDepositTotal } from '@amber/shared';

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
    private couponsService: CouponsService,
    private priceTiersService: PriceTiersService,
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
    couponCode?: string;
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
    const itemsWithPreOrderInfo: any[] = [];
    let calculatedTotal = 0;
    const orderCurrency = data.currency || 'USD';

    if (!warehouseId) {
      // Prefer a warehouse that can fulfill every item in the cart, not
      // just the first one — falls back to the old first-item-only match
      // when no single warehouse carries everything (still routes the
      // whole order to one warehouse either way; true per-item split
      // fulfillment would need a bigger fulfillment-model change).
      warehouseId =
        (await this.ordersRepository.findWarehouseSatisfyingAllItems(
          data.items.map((item) => ({
            variantId: item.variantId,
            productId: item.productId,
            quantity: item.quantity,
          })),
        )) ?? undefined;

      if (!warehouseId) {
        const firstItem = data.items[0];
        if (firstItem) {
          const inventory = await this.ordersRepository.findWarehouseWithStock(
            firstItem.variantId
              ? { variantId: firstItem.variantId }
              : { productId: firstItem.productId },
            firstItem.quantity,
          );
          warehouseId = inventory?.warehouseId;
        }
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

    // Fetch every variant/product/price-override this cart needs up front,
    // in a fixed number of queries regardless of cart size, instead of the
    // ~3 sequential queries per line item this loop used to run (a 20-item
    // cart previously cost 60+ round-trips on the checkout critical path).
    const variantIds = data.items
      .filter((item) => item.variantId)
      .map((item) => item.variantId!);
    const variantlessProductIds = data.items
      .filter((item) => !item.variantId)
      .map((item) => item.productId);

    const [variants, products] = await Promise.all([
      this.ordersRepository.findVariantsForOrder(variantIds),
      this.ordersRepository.findProductsForOrder(variantlessProductIds),
    ]);
    const variantById = new Map(variants.map((v) => [v.id, v]));
    const productById = new Map(products.map((p) => [p.id, p]));

    const priceOverrides = await this.ordersRepository.findPriceOverridesForOrder(
      variantIds,
      variantlessProductIds,
      orderCurrency,
    );
    const priceOverrideByVariantId = new Map(
      priceOverrides.filter((p) => p.variantId).map((p) => [p.variantId!, p]),
    );
    const priceOverrideByProductId = new Map(
      priceOverrides.filter((p) => !p.variantId && p.productId).map((p) => [p.productId!, p]),
    );

    const resolved = data.items.map((item) => {
      let isPreOrder = false;
      let isDigital = false;
      let expectedShippingDate = null;
      let dbPrice = 0;
      let depositAmount: number | null = null;
      let categoryId: string | null = null;
      let currencyCode = item.currencyCode || (item.isUsd ? 'USD' : 'MMK');

      if (item.variantId) {
        const variant = variantById.get(item.variantId);
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
        const productDeposit = (
          variant.product as { depositAmount?: unknown }
        ).depositAmount;
        depositAmount = productDeposit != null ? Number(productDeposit) : null;
        categoryId = (variant.product as { categoryId?: string | null }).categoryId ?? null;
      } else {
        const product = productById.get(item.productId);
        if (!product)
          throw new NotFoundException(`Product not found: ${item.productId}`);

        dbPrice = Number(product.price);
        currencyCode =
          (product as { currencyCode?: string }).currencyCode || currencyCode;
        isPreOrder = product.isPreOrder;
        isDigital = (product as { isDigital?: boolean }).isDigital ?? false;
        expectedShippingDate = product.preOrderShippingDate;
        const productDeposit = (product as { depositAmount?: unknown })
          .depositAmount;
        depositAmount = productDeposit != null ? Number(productDeposit) : null;
        categoryId = (product as { categoryId?: string | null }).categoryId ?? null;
      }

      // True multi-currency pricing: an explicit, independently-curated
      // ProductPrice for this exact order currency takes priority over the
      // default FX-conversion-from-the-base-price path — e.g. a MMK price
      // that isn't just USD*rate because the business prices that market
      // differently. Falls back silently when no override exists (the
      // common case), leaving the existing FX conversion untouched.
      const priceOverride = item.variantId
        ? priceOverrideByVariantId.get(item.variantId)
        : priceOverrideByProductId.get(item.productId);
      if (priceOverride) {
        dbPrice = Number(priceOverride.price);
        currencyCode = orderCurrency;
      }

      return { item, dbPrice, currencyCode, isPreOrder, isDigital, depositAmount, categoryId, expectedShippingDate };
    });

    // Quantity-break wholesale pricing: the best-matching tier (if any) for
    // each line item's resolved currency/quantity overrides the base price.
    // Batched the same way — one query for the whole cart's tiers instead of
    // one per line item. Falls back silently to dbPrice when no tier
    // applies, which is the common case (most products have no PriceTier).
    const tierPrices = await this.priceTiersService.getApplicablePricesForOrder(
      resolved.map((r) => ({
        variantId: r.item.variantId,
        productId: r.item.variantId ? undefined : r.item.productId,
        quantity: r.item.quantity,
        currencyCode: r.currencyCode,
      })),
    );

    resolved.forEach((r, index) => {
      const { item, isPreOrder, isDigital, depositAmount, categoryId, expectedShippingDate } = r;
      let { dbPrice, currencyCode } = r;

      const tierPrice = tierPrices[index];
      if (tierPrice != null) {
        dbPrice = tierPrice;
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
        isDigital,
        depositAmount,
        expectedShippingDate,
        categoryId,
        lineTotal: lineInOrderCurrency,
      });
    });

    calculatedTotal += data.deliveryFee || 0;

    let couponResult: Awaited<ReturnType<CouponsService['validateAndCompute']>> | null = null;
    if (data.couponCode) {
      couponResult = await this.couponsService.validateAndCompute(
        data.couponCode,
        itemsWithPreOrderInfo.map((i) => ({
          productId: i.productId,
          categoryId: i.categoryId,
          quantity: i.quantity,
          lineTotal: i.lineTotal,
        })),
        calculatedTotal,
      );
      calculatedTotal -= couponResult.discountAmount;
      if (couponResult.freeShipping) {
        calculatedTotal -= data.deliveryFee || 0;
      }
      calculatedTotal = Math.max(0, calculatedTotal);
    }

    const paymentMethodRow = await this.prisma.paymentMethod.findFirst({
      where: { name: data.paymentMethod },
    });
    const settings = await this.prisma.settings.findUnique({
      where: { id: 'global' },
    });

    const isCodMethod =
      (paymentMethodRow as { isCod?: boolean } | null)?.isCod ?? false;
    let codDepositApplies = false;
    if (
      isCodMethod &&
      settings?.codDepositAmount != null &&
      settings?.codDepositOrderThreshold != null
    ) {
      const pastPaidOrderCount = data.userId
        ? await this.prisma.order.count({
            where: {
              userId: data.userId,
              paymentStatus: { in: ['PAID', 'PARTIALLY_PAID'] },
            },
          })
        : 0;
      codDepositApplies = pastPaidOrderCount < settings.codDepositOrderThreshold;
    }

    const { depositAmount, balanceDue } = calculateDepositTotal(
      itemsWithPreOrderInfo,
      data.deliveryFee || 0,
      orderCurrency,
      lockedExchangeRate ?? 1,
      {
        isCod: codDepositApplies,
        codDepositAmount:
          settings?.codDepositAmount != null
            ? Number(settings.codDepositAmount)
            : null,
      },
      calculatedTotal,
    );

    const order = await this.ordersRepository.create(
      data,
      warehouseId,
      itemsWithPreOrderInfo,
      calculatedTotal,
      lockedExchangeRate,
      depositAmount,
      balanceDue,
      couponResult
        ? { coupon: couponResult.coupon, discountAmount: couponResult.discountAmount }
        : undefined,
    );

    // Best-effort serial-number assignment for variants that track them —
    // deliberately outside the order-creation transaction and non-blocking:
    // this is traceability/warranty metadata, not stock correctness (that's
    // already guarded atomically in ordersRepository.create), so a failure
    // here must never roll back or fail an otherwise-valid order.
    await this.assignSerialNumbers(order.id).catch((err) => {
      console.error(`Failed to assign serial numbers for order ${order.id}:`, err);
    });

    return order;
  }

  private async assignSerialNumbers(orderId: string): Promise<void> {
    const orderItems = await this.prisma.orderItem.findMany({
      where: { orderId, variantId: { not: null } },
      include: { variant: true },
    });
    for (const item of orderItems) {
      if (!item.variant?.tracksSerialNumbers || !item.variantId) continue;

      const available = await this.prisma.serialNumber.findMany({
        where: { variantId: item.variantId, status: 'AVAILABLE' },
        take: item.quantity,
      });
      for (const serial of available) {
        await this.prisma.serialNumber.updateMany({
          where: { id: serial.id, status: 'AVAILABLE' },
          data: { status: 'SOLD', orderItemId: item.id },
        });
      }
    }
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

    const hasBalanceDue =
      order.balanceDue != null && Number(order.balanceDue) > 0;

    await this.ordersRepository.update(orderId, {
      paymentStatus: hasBalanceDue ? 'PARTIALLY_PAID' : 'PAID',
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

  async settleBalance(orderId: string, adminUserId: string) {
    const order = await this.ordersRepository.findById(orderId);
    if (!order) throw new NotFoundException('Order not found');

    if (order.paymentStatus !== 'PARTIALLY_PAID') {
      throw new BadRequestException(
        'Only partially paid orders have a balance to settle',
      );
    }

    return this.ordersRepository.update(orderId, {
      paymentStatus: 'PAID',
      balanceDue: 0,
      balanceSettledAt: new Date(),
      balanceSettledBy: adminUserId,
    });
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

  async markRefunded(id: string) {
    const order = await this.ordersRepository.findById(id);
    if (!order) throw new NotFoundException('Order not found');

    const oldStatus = order.status;
    // Same double-restock guards deleteOrder already uses, since refund can
    // race with an admin cancellation of the same order.
    if (
      !order.restocked &&
      order.status !== 'CANCELLED' &&
      order.paymentStatus !== 'FAILED'
    ) {
      await this.ordersRepository.restock(id);
    }

    if (order.status !== 'REFUNDED') {
      await this.ordersRepository.updateStatus(id, 'REFUNDED');
      this.eventEmitter.emit(
        'order.status_changed',
        new OrderStatusChangedEvent(id, oldStatus, 'REFUNDED'),
      );
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

    // Two distinct abandonment paths land here, both left PENDING/PENDING
    // forever with stock already decremented if nothing acts on them:
    // (a) manual payment methods where the customer never uploaded proof,
    // and (b) Stripe checkouts abandoned before any payment_intent webhook
    // fires — no FAILED transition ever happens, so updatePaymentStatus's
    // restock path never runs for them. Stripe orders never populate
    // paymentProofUrl either way, so they're gated explicitly by payment
    // method rather than relying on that field being incidentally null.
    const staleOrders = await this.prisma.order.findMany({
      where: {
        status: 'PENDING',
        paymentStatus: 'PENDING',
        createdAt: { lt: oneHourAgo },
      },
      select: { id: true, paymentMethod: true, paymentProofUrl: true },
    });

    const staleToCancel = staleOrders.filter((order) =>
      isManualPaymentMethod(order.paymentMethod)
        ? order.paymentProofUrl == null
        : true,
    );

    for (const order of staleToCancel) {
      try {
        await this.updateOrderStatus(order.id, 'CANCELLED');
      } catch (error) {
        console.error(`Failed to cleanup stale order ${order.id}:`, error);
      }
    }

    return staleToCancel.length;
  }
}
