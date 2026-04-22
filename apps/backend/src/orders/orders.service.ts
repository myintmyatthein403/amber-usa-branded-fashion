import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { OrdersRepository } from './orders.repository';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private ordersRepository: OrdersRepository
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
    totalAmount: number;
    currency: string;
    deliveryFee?: number;
    warehouseId?: string;
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
    let warehouseId = data.warehouseId;
    const itemsWithPreOrderInfo = [];
    let calculatedTotal = 0;

    // 1. Resolve Warehouse & Validate Stock/Prices
    if (!warehouseId) {
      const firstItem = data.items.find(item => item.variantId);
      if (firstItem && firstItem.variantId) {
        const inventory = await this.ordersRepository.findWarehouseWithStock(firstItem.variantId, firstItem.quantity);
        warehouseId = inventory?.warehouseId;
      }
    }

    if (!warehouseId) {
      warehouseId = (await this.ordersRepository.findDefaultWarehouse('MYANMAR'))?.id || (await this.ordersRepository.findAnyWarehouse())?.id;
    }

    if (!warehouseId) {
      throw new BadRequestException('No fulfillment warehouse available');
    }

    for (const item of data.items) {
      let isPreOrder = false;
      let expectedShippingDate = null;
      let dbPrice = 0;

      if (item.variantId) {
        const variant = await this.ordersRepository.findVariantForOrder(item.variantId);
        if (!variant) throw new NotFoundException(`Variant not found: ${item.variantId}`);
        
        dbPrice = Number(variant.price || variant.product.price);
        isPreOrder = variant.isPreOrder || variant.product.isPreOrder;
        expectedShippingDate = variant.preOrderShippingDate || variant.product.preOrderShippingDate;
      } else {
        const product = await this.ordersRepository.findProductForOrder(item.productId);
        if (!product) throw new NotFoundException(`Product not found: ${item.productId}`);
        
        dbPrice = Number(product.price);
        isPreOrder = product.isPreOrder;
        expectedShippingDate = product.preOrderShippingDate;
      }

      calculatedTotal += dbPrice * item.quantity;
      itemsWithPreOrderInfo.push({
        ...item,
        price: dbPrice,
        isPreOrder,
        expectedShippingDate
      });
    }

    calculatedTotal += (data.deliveryFee || 0);

    // 2. Delegate to Repository for transactional atomic creation
    return this.ordersRepository.create(data, warehouseId, itemsWithPreOrderInfo, calculatedTotal);
  }

  async getOrderById(id: string, user?: { userId: string; role: string }) {
    const order = await this.ordersRepository.findById(id);
    if (!order) throw new NotFoundException(`Order with ID ${id} not found`);

    if (user) {
      const isOwner = order.userId === user.userId;
      const isAdmin = ['ADMIN', 'SUPERADMIN'].includes(user.role);
      if (!isOwner && !isAdmin) throw new ForbiddenException('No permission to access this order');
    } else {
      throw new ForbiddenException('Authentication required');
    }

    return order;
  }

  async updateOrderStatus(id: string, status: OrderStatus) {
    const order = await this.ordersRepository.findById(id);
    if (!order) throw new NotFoundException('Order not found');

    if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
      await this.ordersRepository.restock(order.id);
    }

    return this.ordersRepository.updateStatus(id, status);
  }

  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus) {
    const order = await this.ordersRepository.findById(id);
    if (!order) throw new NotFoundException('Order not found');

    if (paymentStatus === 'FAILED' && order.paymentStatus !== 'FAILED') {
      await this.ordersRepository.restock(order.id);
    }

    return this.ordersRepository.updatePaymentStatus(id, paymentStatus);
  }

  async bulkUpdateStatus(ids: string[], status: OrderStatus) {
    return this.ordersRepository.bulkUpdateStatus(ids, status);
  }

  async bulkUpdatePaymentStatus(ids: string[], paymentStatus: PaymentStatus) {
    return this.ordersRepository.bulkUpdatePaymentStatus(ids, paymentStatus);
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
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { shippingAddress: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [orders, total] = await this.ordersRepository.findMany(
      where, 
      skip, 
      Number(limit), 
      { [sortBy]: sortOrder }
    );

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
    const order = await this.ordersRepository.findById(id);
    if (order && !order.restocked && order.status !== 'CANCELLED' && order.paymentStatus !== 'FAILED') {
      await this.ordersRepository.restock(id);
    }
    return this.ordersRepository.delete(id);
  }

  async getPendingOrdersCount() {
    return this.ordersRepository.countPending();
  }
}
