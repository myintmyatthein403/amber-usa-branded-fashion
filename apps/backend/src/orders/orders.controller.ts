import { Controller, Post, Get, Body, Param, UseGuards, Req, Patch, Delete, Query } from '@nestjs/common';
import { Request } from 'express';
import { OrdersService } from './orders.service';
import { StripeService } from '../stripe/stripe.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
    role: string;
    permissions: string[];
  };
}

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly stripeService: StripeService
  ) {}

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  createOrder(@Req() req: AuthenticatedRequest, @Body() data: any) {
    const userId = req.user?.userId || null;
    return this.ordersService.createOrder({ ...data, userId });
  }

  @Post(':id/verify-payment')
  async verifyPayment(@Param('id') id: string) {
    return this.stripeService.verifyPayment(id);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  getMyOrders(@Req() req: AuthenticatedRequest) {
    return this.ordersService.getOrdersByUser(req.user.userId);
  }

  @Get('pending-count')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  getPendingCount() {
    return this.ordersService.getPendingOrdersCount();
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  getOrder(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.ordersService.getOrderById(id, req.user);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  getAllOrders(@Query() query: any) {
    return this.ordersService.getAllOrders(query);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  updateOrderStatus(@Param('id') id: string, @Body('status') status: any) {
    return this.ordersService.updateOrderStatus(id, status);
  }

  @Patch(':id/payment-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  updatePaymentStatus(@Param('id') id: string, @Body('status') status: any) {
    return this.ordersService.updatePaymentStatus(id, status);
  }

  @Patch('bulk-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  bulkUpdateStatus(@Body() data: { ids: string[], status: any }) {
    return this.ordersService.bulkUpdateStatus(data.ids, data.status);
  }

  @Patch('bulk-payment-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  bulkUpdatePaymentStatus(@Body() data: { ids: string[], status: any }) {
    return this.ordersService.bulkUpdatePaymentStatus(data.ids, data.status);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  deleteOrder(@Param('id') id: string) {
    return this.ordersService.deleteOrder(id);
  }
}
