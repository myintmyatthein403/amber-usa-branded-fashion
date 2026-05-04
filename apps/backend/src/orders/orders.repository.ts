import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Order, OrderStatus, PaymentStatus, Prisma } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderStatusChangedEvent } from '../common/events/domain.events';

@Injectable()
export class OrdersRepository {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(
    orderData: any,
    warehouseId: string,
    itemsWithPreOrderInfo: any[],
    calculatedTotal: number,
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
              paymentMethod: orderData.paymentMethod,
              shippingAddress: `${orderData.firstName} ${orderData.lastName}, ${orderData.address}, ${orderData.city}. Phone: ${orderData.phone}`,
              userId: orderData.userId,
              warehouseId,
              hasPreOrderItems: itemsWithPreOrderInfo.some((i) => i.isPreOrder),
              items: {
                create: itemsWithPreOrderInfo.map((item) => ({
                  productId: item.productId,
                  variantId: item.variantId,
                  name: item.name,
                  price: item.price,
                  isUsd: item.isUsd ?? true,
                  quantity: item.quantity,
                  image: item.image,
                  size: item.size,
                  isPreOrder: item.isPreOrder,
                  expectedShippingDate: item.expectedShippingDate,
                })),
              },
            },
            include: { items: true },
          });
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

  async findMany(where: Prisma.OrderWhereInput, skip?: number, take?: number, orderBy?: any): Promise<[Order[], number]> {
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

  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<Order> {
    return this.prisma.order.update({ where: { id }, data: { paymentStatus } });
  }

  async updateStripeInfo(id: string, stripePaymentIntentId: string): Promise<Order> {
    return this.prisma.order.update({ where: { id }, data: { stripePaymentIntentId } });
  }

  async bulkUpdateStatus(ids: string[], status: OrderStatus) {
    return this.prisma.$transaction(async (tx) => {
      for (const id of ids) {
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
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order || order.restocked) return;

    await this.prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        if (item.variantId && !item.isPreOrder) {
          if (order.warehouseId) {
            await tx.inventory.update({
              where: { variantId_warehouseId: { variantId: item.variantId, warehouseId: order.warehouseId } },
              data: { quantity: { increment: item.quantity } },
            });
          }
          await tx.variant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }
      await tx.order.update({ where: { id: orderId }, data: { restocked: true } });
    });
  }

  async restockWithTransaction(tx: any, orderId: string): Promise<void> {
    const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!order || order.restocked) return;

    for (const item of order.items) {
      if (item.variantId && !item.isPreOrder) {
        if (order.warehouseId) {
          await tx.inventory.update({
            where: { variantId_warehouseId: { variantId: item.variantId, warehouseId: order.warehouseId } },
            data: { quantity: { increment: item.quantity } },
          });
        }
        await tx.variant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }
    await tx.order.update({ where: { id: orderId }, data: { restocked: true } });
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    return this.prisma.order.findUnique({
      where: { orderNumber },
      include: { items: true, user: { select: { id: true, email: true, name: true } } },
    });
  }

  async delete(id: string): Promise<Order> {
    return this.prisma.order.delete({ where: { id } });
  }

  async countPending(): Promise<number> {
    return this.prisma.order.count({ where: { status: 'PENDING' } });
  }

  async findWarehouseWithStock(variantId: string, quantity: number) {
    return this.prisma.inventory.findFirst({ where: { variantId, quantity: { gte: quantity } } });
  }

  async findDefaultWarehouse(location: string) {
    return this.prisma.warehouse.findFirst({ where: { location } });
  }

  async findAnyWarehouse() {
    return this.prisma.warehouse.findFirst();
  }

  async findVariantForOrder(id: string) {
    return this.prisma.variant.findUnique({ where: { id }, include: { product: true } });
  }

  async findProductForOrder(id: string) {
    return this.prisma.product.findUnique({ where: { id } });
  }

  async findByIdWithItems(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: { items: true, warehouse: true },
    });
  }
}