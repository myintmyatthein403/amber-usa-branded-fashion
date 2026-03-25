import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

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
    totalAmount: number;
    currency: string;
    items: Array<{
      productId: string;
      variantId?: string;
      name: string;
      price: number;
      isUsd: boolean;
      quantity: number;
      image: string;
      size?: string;
    }>;
  }) {
    // Generate an order number (e.g., AMB-2026-XXXX)
    const orderNumber = `AMB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    return this.prisma.$transaction(async (tx) => {
      let hasPreOrderItems = false;
      const itemsWithPreOrderInfo = [];

      for (const item of data.items) {
        let isPreOrder = false;
        let expectedShippingDate = null;
        let variant = null;
        let product = null;

        if (item.variantId) {
          variant = await tx.variant.findUnique({
            where: { id: item.variantId },
            include: { product: true }
          });
          
          if (!variant) {
            throw new NotFoundException(`Variant not found: ${item.variantId}`);
          }

          isPreOrder = variant.isPreOrder || variant.product.isPreOrder;
          expectedShippingDate = variant.preOrderShippingDate || variant.product.preOrderShippingDate;

          // Stock Check for Non-PreOrder Items
          if (!isPreOrder) {
            if (variant.stock < item.quantity) {
              throw new BadRequestException(`Insufficient stock for item: ${item.name} (${item.size}). Available: ${variant.stock}`);
            }
            // Decrement stock
            await tx.variant.update({
              where: { id: variant.id },
              data: { stock: variant.stock - item.quantity }
            });
          }

        } else {
          // Logic for products without variants (if any)
          product = await tx.product.findUnique({
            where: { id: item.productId }
          });
          
          if (!product) {
            throw new NotFoundException(`Product not found: ${item.productId}`);
          }
          
          isPreOrder = product.isPreOrder;
          expectedShippingDate = product.preOrderShippingDate;
          // Note: If product has no variants, we might need stock on product level? 
          // Schema doesn't show stock on Product, only Variant. 
          // Assuming all purchasable items have variants or unlimited stock if no variant logic exists (or it's handled elsewhere).
          // For now, no stock check on product-level items without variants (e.g. digital goods?) or just skip.
        }

        if (isPreOrder) hasPreOrderItems = true;

        itemsWithPreOrderInfo.push({
          ...item,
          isPreOrder,
          expectedShippingDate
        });
      }

      return tx.order.create({
        data: {
          orderNumber,
          status: 'PENDING',
          paymentStatus: 'PENDING', // default
          totalAmount: data.totalAmount,
          currency: data.currency || 'USD',
          paymentMethod: data.paymentMethod,
          shippingAddress: `${data.firstName} ${data.lastName}, ${data.address}, ${data.city}. Phone: ${data.phone}`,
          userId: data.userId,
          hasPreOrderItems,
          items: {
            create: itemsWithPreOrderInfo.map(item => ({
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
        include: {
          items: true,
        }
      });
    });
  }

  async getOrderById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          }
        }
      }
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async updateOrderStatus(id: string, status: OrderStatus) {
    return this.prisma.order.update({
      where: { id },
      data: { status },
    });
  }

  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus) {
    return this.prisma.order.update({
      where: { id },
      data: { paymentStatus },
    });
  }

  async bulkUpdateStatus(ids: string[], status: OrderStatus) {
    return this.prisma.order.updateMany({
      where: { id: { in: ids } },
      data: { status },
    });
  }

  async bulkUpdatePaymentStatus(ids: string[], paymentStatus: PaymentStatus) {
    return this.prisma.order.updateMany({
      where: { id: { in: ids } },
      data: { paymentStatus },
    });
  }

  async getOrdersByUser(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      }
    });
  }

  async getAllOrders(query: {
    page?: number;
    limit?: number;
    search?: string;
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      status, 
      paymentStatus,
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = query;
    
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (status) {
      where.status = status;
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }
    
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { shippingAddress: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          items: true,
          user: {
            select: {
              name: true,
              email: true,
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: Number(limit),
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      }
    };
  }

  async deleteOrder(id: string) {
    return this.prisma.order.delete({
      where: { id },
    });
  }

  async getPendingOrdersCount() {
    return this.prisma.order.count({
      where: {
        status: 'PENDING',
      },
    });
  }
}
