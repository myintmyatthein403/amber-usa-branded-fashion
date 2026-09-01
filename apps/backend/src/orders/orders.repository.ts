import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Order, OrderStatus, PaymentStatus, Coupon, Prisma } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderStatusChangedEvent } from '../common/events/domain.events';
import { CouponsRepository } from '../coupons/coupons.repository';

@Injectable()
export class OrdersRepository {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
    private couponsRepository: CouponsRepository,
  ) {}

  async create(
    orderData: any,
    warehouseId: string,
    itemsWithPreOrderInfo: any[],
    calculatedTotal: number,
    lockedExchangeRate?: number,
    depositAmount?: number | null,
    balanceDue?: number,
    couponInfo?: { coupon: Coupon; discountAmount: number },
  ): Promise<Order> {
    return this.prisma.$transaction(async (tx) => {
      for (const item of itemsWithPreOrderInfo) {
        if (item.variantId && !item.isPreOrder) {
          if (warehouseId) {
            const updatedInventory = await tx.inventory.updateMany({
              where: {
                variantId: item.variantId,
                warehouseId,
                quantity: { gte: item.quantity },
              },
              data: { quantity: { decrement: item.quantity } },
            });

            if (updatedInventory.count === 0) {
              throw new BadRequestException(
                `Insufficient stock for item: ${item.name} in selected warehouse.`,
              );
            }
          }

          const updatedVariant = await tx.variant.updateMany({
            where: {
              id: item.variantId,
              stock: { gte: item.quantity },
            },
            data: { stock: { decrement: item.quantity } },
          });

          if (updatedVariant.count === 0) {
            throw new BadRequestException(
              `Insufficient total stock for item: ${item.name}.`,
            );
          }
        } else if (!item.variantId && !item.isPreOrder && !item.isDigital) {
          if (warehouseId) {
            const existingInv = await tx.inventory.findUnique({
              where: {
                productId_warehouseId: { productId: item.productId, warehouseId },
              },
            });
            // Only enforce/decrement the per-warehouse row if one exists —
            // legacy simple products with no Inventory rows yet keep working
            // exactly as before (stock tracked only on Product.stock).
            if (existingInv) {
              const updatedInventory = await tx.inventory.updateMany({
                where: {
                  productId: item.productId,
                  warehouseId,
                  quantity: { gte: item.quantity },
                },
                data: { quantity: { decrement: item.quantity } },
              });

              if (updatedInventory.count === 0) {
                throw new BadRequestException(
                  `Insufficient stock for item: ${item.name} in selected warehouse.`,
                );
              }
            }
          }

          const updatedProduct = await tx.product.updateMany({
            where: { id: item.productId, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } },
          });

          if (updatedProduct.count === 0) {
            throw new BadRequestException(
              `Insufficient stock for item: ${item.name}.`,
            );
          }
        }
      }

      let order: Order;
      let retries = 3;
      while (retries > 0) {
        try {
          const timestamp = Date.now().toString().slice(-4);
          const random = Math.floor(1000 + Math.random() * 9000);
          const orderNumber = `AMB-${new Date().getFullYear()}-${timestamp}-${random}`;

          order = await tx.order.create({
            data: {
              orderNumber,
              status: 'PENDING',
              paymentStatus: 'PENDING',
              totalAmount: calculatedTotal,
              currency: orderData.currency || 'USD',
              lockedExchangeRate: lockedExchangeRate ?? null,
              market: orderData.market ?? null,
              shippingCountry: orderData.shippingCountry ?? null,
              paymentMethod: orderData.paymentMethod,
              paymentReference: orderData.paymentReference ?? null,
              shippingAddress: orderData.shippingAddress,
              customerName: orderData.customerName ?? null,
              customerEmail: orderData.customerEmail ?? null,
              customerPhone: orderData.customerPhone ?? null,
              street: orderData.street ?? null,
              city: orderData.city ?? null,
              state: orderData.state ?? null,
              township: orderData.township ?? null,
              zipCode: orderData.zipCode ?? null,
              deliveryMethodId: orderData.deliveryMethodId ?? null,
              deliveryFee: orderData.deliveryFee ?? null,
              userId: orderData.userId || null,
              warehouseId,
              hasPreOrderItems: itemsWithPreOrderInfo.some((i) => i.isPreOrder),
              depositAmount: depositAmount ?? null,
              balanceDue: depositAmount != null ? balanceDue ?? 0 : null,
              couponCode: couponInfo?.coupon.code ?? null,
              discountAmount: couponInfo?.discountAmount ?? null,
              items: {
                create: itemsWithPreOrderInfo.map((item) => ({
                  productId: item.productId,
                  variantId: item.variantId,
                  name: item.name,
                  price: item.price,
                  currencyCode: item.currencyCode ?? 'USD',
                  unitPriceUsd: item.unitPriceUsd ?? item.price,
                  isUsd: item.isUsd ?? true,
                  quantity: item.quantity,
                  image: item.image ?? '',
                  size: item.size,
                  isPreOrder: item.isPreOrder,
                  expectedShippingDate: item.expectedShippingDate,
                  isDigital: item.isDigital ?? false,
                })),
              },
            },
            include: { items: true },
          });

          // Redeem inside the same transaction the order is created in —
          // a failed redemption (e.g. usage limit hit by a concurrent
          // checkout between validation and this point) rolls the whole
          // order back rather than creating an order with an unredeemed
          // coupon applied.
          if (couponInfo) {
            await this.couponsRepository.redeem(
              tx,
              couponInfo.coupon,
              order.id,
              orderData.userId || undefined,
            );
          }

          return order;
        } catch (error) {
          if (error.code === 'P2002' && retries > 1) {
            retries--;
            continue;
          }
          throw error;
        }
      }
      throw new Error('Failed to generate unique order number');
    });
  }

  async findById(id: string): Promise<Order | null> {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        user: { select: { id: true, email: true, name: true } },
      },
    });
  }

  async findMany(
    where: Prisma.OrderWhereInput,
    skip?: number,
    take?: number,
    orderBy?: any,
  ): Promise<[Order[], number]> {
    return Promise.all([
      this.prisma.order.findMany({
        where,
        include: { items: true, user: { select: { name: true, email: true } } },
        orderBy,
        skip,
        take,
      }),
      this.prisma.order.count({ where }),
    ]);
  }

  async findByUser(userId: string): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    return this.prisma.order.update({ where: { id }, data: { status } });
  }

  async updatePaymentStatus(
    id: string,
    paymentStatus: PaymentStatus,
  ): Promise<Order> {
    return this.prisma.order.update({ where: { id }, data: { paymentStatus } });
  }

  async updateStripeInfo(
    id: string,
    stripePaymentIntentId: string,
  ): Promise<Order> {
    return this.prisma.order.update({
      where: { id },
      data: { stripePaymentIntentId },
    });
  }

  async update(id: string, data: any): Promise<Order> {
    return this.prisma.order.update({ where: { id }, data });
  }

  async bulkUpdateStatus(ids: string[], status: OrderStatus) {
    return this.prisma.$transaction(async (tx) => {
      for (const id of ids) {
        // Mirror the single-order updateOrderStatus path: cancelling must
        // restock. The bulk path previously skipped this entirely, silently
        // leaving stock decremented for every order in the batch.
        if (status === 'CANCELLED') {
          const existing = await tx.order.findUnique({
            where: { id },
            select: { status: true },
          });
          if (existing && existing.status !== 'CANCELLED') {
            await this.doRestock(tx, id);
          }
        }
        await tx.order.update({ where: { id }, data: { status } });
      }
    });
  }

  async bulkUpdatePaymentStatus(ids: string[], paymentStatus: PaymentStatus) {
    return this.prisma.$transaction(async (tx) => {
      for (const id of ids) {
        await tx.order.update({ where: { id }, data: { paymentStatus } });
      }
    });
  }

  async restock(orderId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await this.doRestock(tx, orderId);
    });
  }

  async restockWithTransaction(
    tx: Prisma.TransactionClient,
    orderId: string,
  ): Promise<void> {
    await this.doRestock(tx, orderId);
  }

  private async doRestock(
    tx: Prisma.TransactionClient,
    orderId: string,
  ): Promise<void> {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) return;

    // Atomically claim the restock (false -> true) before touching any
    // inventory. Two concurrent callers (e.g. an admin cancel racing a
    // payment-failure webhook) both landing here previously double-credited
    // stock, since the old code only checked `restocked` on read and wrote
    // `restocked: true` unconditionally at the end. Postgres row-locks the
    // order during this UPDATE, so only one concurrent transaction can win
    // the `restocked: false` match — the loser sees count === 0 and returns
    // without incrementing anything.
    const claimed = await tx.order.updateMany({
      where: { id: orderId, restocked: false },
      data: { restocked: true },
    });
    if (claimed.count === 0) return;

    for (const item of order.items) {
      if (item.variantId && !item.isPreOrder) {
        if (order.warehouseId) {
          await tx.inventory.update({
            where: {
              variantId_warehouseId: {
                variantId: item.variantId,
                warehouseId: order.warehouseId,
              },
            },
            data: { quantity: { increment: item.quantity } },
          });
        }
        await tx.variant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        });
      } else if (!item.variantId && !item.isPreOrder && !item.isDigital) {
        if (order.warehouseId) {
          const existingInv = await tx.inventory.findUnique({
            where: {
              productId_warehouseId: {
                productId: item.productId,
                warehouseId: order.warehouseId,
              },
            },
          });
          if (existingInv) {
            await tx.inventory.update({
              where: {
                productId_warehouseId: {
                  productId: item.productId,
                  warehouseId: order.warehouseId,
                },
              },
              data: { quantity: { increment: item.quantity } },
            });
          }
        }
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    return this.prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: true,
        user: { select: { id: true, email: true, name: true } },
      },
    });
  }

  async delete(id: string): Promise<Order> {
    return this.prisma.order.delete({ where: { id } });
  }

  async countPending(): Promise<number> {
    return this.prisma.order.count({ where: { status: 'PENDING' } });
  }

  async findWarehouseWithStock(
    target: { variantId?: string; productId?: string },
    quantity: number,
  ) {
    // Deterministic tiebreak: prefer the warehouse holding the most stock
    // for this item, rather than whatever Postgres happened to return first
    // with no ORDER BY. Reduces the odds this specific warehouse runs out
    // again soon and makes warehouse selection reproducible/testable.
    return this.prisma.inventory.findFirst({
      where: { ...target, quantity: { gte: quantity } },
      orderBy: { quantity: 'desc' },
    });
  }

  // Finds a single warehouse that can fulfill every line item in the cart,
  // not just the first one. The old caller only ever checked item[0]'s
  // availability, then routed the WHOLE order to that warehouse regardless
  // of whether it actually had the other items in stock — createOrder would
  // then fail deep inside the transaction on the first item that warehouse
  // didn't carry. This doesn't add true per-item split-shipment (every item
  // still ships from one warehouse), but it picks a warehouse that's
  // actually capable of fulfilling the whole order when one exists.
  async findWarehouseSatisfyingAllItems(
    items: { variantId?: string; productId?: string; quantity: number }[],
  ): Promise<string | null> {
    if (items.length === 0) return null;

    const perItemCandidates = await Promise.all(
      items.map((item) =>
        this.prisma.inventory.findMany({
          where: {
            ...(item.variantId
              ? { variantId: item.variantId }
              : { productId: item.productId }),
            quantity: { gte: item.quantity },
          },
          select: { warehouseId: true, quantity: true },
        }),
      ),
    );

    const [first, ...rest] = perItemCandidates;
    const candidateIds = new Set(first.map((c) => c.warehouseId));
    for (const candidates of rest) {
      const idsForItem = new Set(candidates.map((c) => c.warehouseId));
      for (const id of Array.from(candidateIds)) {
        if (!idsForItem.has(id)) candidateIds.delete(id);
      }
    }
    if (candidateIds.size === 0) return null;

    // Deterministic tiebreak among warehouses that can fulfill everything:
    // prefer the one with the most total headroom across all items.
    const totalsByWarehouse = new Map<string, number>();
    for (const candidates of perItemCandidates) {
      for (const c of candidates) {
        if (!candidateIds.has(c.warehouseId)) continue;
        totalsByWarehouse.set(
          c.warehouseId,
          (totalsByWarehouse.get(c.warehouseId) ?? 0) + c.quantity,
        );
      }
    }
    const [bestWarehouseId] = Array.from(totalsByWarehouse.entries()).sort(
      (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
    )[0];
    return bestWarehouseId;
  }

  async findDefaultWarehouse(location: string) {
    return this.prisma.warehouse.findFirst({ where: { location } });
  }

  async findAnyWarehouse() {
    return this.prisma.warehouse.findFirst();
  }

  // Batched variants/products/price-overrides lookups: createOrder fetches
  // everything up front for the whole cart instead of running 3 sequential
  // queries per line item, which meant a 20-item cart cost 60+ round-trips
  // on the checkout critical path.
  async findVariantsForOrder(ids: string[]) {
    if (ids.length === 0) return [];
    return this.prisma.variant.findMany({
      where: { id: { in: ids } },
      include: { product: true },
    });
  }

  async findProductsForOrder(ids: string[]) {
    if (ids.length === 0) return [];
    return this.prisma.product.findMany({ where: { id: { in: ids } } });
  }

  async findPriceOverridesForOrder(
    variantIds: string[],
    productIds: string[],
    currencyCode: string,
  ) {
    if (variantIds.length === 0 && productIds.length === 0) return [];
    return this.prisma.productPrice.findMany({
      where: {
        currencyCode,
        OR: [
          ...(variantIds.length ? [{ variantId: { in: variantIds } }] : []),
          ...(productIds.length ? [{ productId: { in: productIds } }] : []),
        ],
      },
    });
  }

  async findByIdWithItems(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: { items: true, warehouse: true },
    });
  }
}
