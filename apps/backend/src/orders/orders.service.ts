import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
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
    totalAmount: number; // Still received but will be validated
    currency: string;
    deliveryFee?: number;
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
    return this.prisma.$transaction(async (tx) => {
      let hasPreOrderItems = false;
      const itemsWithPreOrderInfo = [];
      let calculatedTotal = 0;

      for (const item of data.items) {
        let isPreOrder = false;
        let expectedShippingDate = null;
        let variant = null;
        let product = null;
        let dbPrice = 0;

        if (item.variantId) {
          variant = await tx.variant.findUnique({
            where: { id: item.variantId },
            include: { product: true }
          });
          
          if (!variant) {
            throw new NotFoundException(`Variant not found: ${item.variantId}`);
          }

          // Use DB price for total calculation
          dbPrice = Number(variant.price || variant.product.price);
          isPreOrder = variant.isPreOrder || variant.product.isPreOrder;
          expectedShippingDate = variant.preOrderShippingDate || variant.product.preOrderShippingDate;

          // Stock Check for Non-PreOrder Items
          if (!isPreOrder) {
            try {
              // Atomic conditional update to prevent lost-update/overselling (Finding 1)
              await tx.variant.update({
                where: { 
                  id: variant.id,
                  stock: { gte: item.quantity }
                },
                data: { stock: { decrement: item.quantity } }
              });
            } catch (error) {
              if (error.code === 'P2025') { // Record not found (because stock < quantity)
                throw new BadRequestException(`Insufficient stock for item: ${item.name} (${item.size}). Available: ${variant.stock}`);
              }
              throw error;
            }
          }

        } else {
          product = await tx.product.findUnique({
            where: { id: item.productId }
          });
          
          if (!product) {
            throw new NotFoundException(`Product not found: ${item.productId}`);
          }
          
          dbPrice = Number(product.price);
          isPreOrder = product.isPreOrder;
          expectedShippingDate = product.preOrderShippingDate;
        }

        calculatedTotal += dbPrice * item.quantity;
        if (isPreOrder) hasPreOrderItems = true;

        itemsWithPreOrderInfo.push({
          ...item,
          price: dbPrice, // Override with DB price
          isPreOrder,
          expectedShippingDate
        });
      }

      // Add delivery fee to calculation
      const deliveryFee = data.deliveryFee || 0;
      calculatedTotal += deliveryFee;

      // Note: We should probably check if calculatedTotal matches data.totalAmount or just use calculatedTotal.
      // For security, we MUST use calculatedTotal.

      // Retry logic for order number generation (Finding 4)
      let order: any;
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
          break; // Success
        } catch (error) {
          if (error.code === 'P2002' && retries > 1) { // Unique constraint violation
            retries--;
            continue;
          }
          throw error;
        }
      }

      return order;
    });
  }

  async getOrderById(id: string, user?: { userId: string; role: string }) {
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

    // Ownership check (Finding 1)
    if (user) {
      const isOwner = order.userId === user.userId;
      const isAdmin = ['ADMIN', 'SUPERADMIN'].includes(user.role);
      
      if (!isOwner && !isAdmin) {
        throw new ForbiddenException('You do not have permission to access this order');
      }
    } else {
      // If no user object is passed, but route is OptionalJwtAuthGuard, 
      // we might want to strictly forbid or allow depending on context.
      // Typically, for order tracking of guest orders, we might use a special token or just orderNumber + email.
      // For this specific finding, let's enforce that if we can't verify ownership, we restrict data.
      throw new ForbiddenException('Authentication required to access order details');
    }

    return order;
  }

  async updateOrderStatus(id: string, status: OrderStatus) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!order) throw new NotFoundException('Order not found');

    // If moving to CANCELLED, restock items (Finding 2)
    if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
      await this.restockItems(order.id);
    }

    return this.prisma.order.update({
      where: { id },
      data: { status },
    });
  }

  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!order) throw new NotFoundException('Order not found');

    // If payment fails, restock (Finding 2)
    if (paymentStatus === 'FAILED' && order.paymentStatus !== 'FAILED') {
      await this.restockItems(order.id);
    }

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

  async restockItems(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (!order || order.restocked) return;

    await this.prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        if (item.variantId && !item.isPreOrder) {
          await tx.variant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } }
          });
        }
      }

      await tx.order.update({
        where: { id: orderId },
        data: { restocked: true }
      });
    });
  }

  async deleteOrder(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true }
    });

    if (order && !order.restocked && order.status !== 'CANCELLED' && order.paymentStatus !== 'FAILED') {
      await this.restockItems(id);
    }

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
