import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
  Patch,
  Delete,
  Query,
  UsePipes,
} from '@nestjs/common';
import { Request } from 'express';
import { OrdersService } from './orders.service';
import { StripeService } from '../stripe/stripe.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { OrderSchema, OrderStatus, PaymentStatus } from '@amber/shared';
import { CreateOrderDto, OrderStatusDto, PaymentStatusDto, BulkOrderStatusDto, BulkPaymentStatusDto } from './dto/order.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
    role: string;
    permissions: string[];
  };
}

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly stripeService: StripeService,
  ) {}

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  @UsePipes(new ZodValidationPipe(OrderSchema.omit({ id: true, orderNumber: true })))
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order successfully created.' })
  createOrder(@Req() req: AuthenticatedRequest, @Body() data: CreateOrderDto) {
    const userId = req.user?.userId || '';
    const parts = data.shippingAddress.split(',').map(s => s.trim());
    const nameParts = parts[0]?.split(' ') || [];
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    const address = parts[1] || '';
    const city = parts[2] || '';
    const phone = parts[3] || '';
    const orderData = {
      userId,
      email: '',
      firstName,
      lastName,
      address,
      city,
      phone,
      shippingMethod: '',
      paymentMethod: data.paymentMethod,
      totalAmount: data.totalAmount,
      currency: data.currency,
      deliveryFee: undefined,
      warehouseId: undefined,
      items: data.items.map(item => ({
        productId: item.productId,
        variantId: item.variantId || undefined,
        name: item.name,
        price: item.price,
        isUsd: item.isUsd,
        quantity: item.quantity,
        image: item.image,
        size: item.size || undefined,
      })),
    };
    return this.ordersService.createOrder(orderData);
  }

  @Post(':id/verify-payment')
  @ApiOperation({ summary: 'Verify order payment status with Stripe' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  async verifyPayment(@Param('id') id: string) {
    return this.stripeService.verifyPayment(id);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user orders' })
  getMyOrders(@Req() req: AuthenticatedRequest) {
    return this.ordersService.getOrdersByUser(req.user.userId);
  }

  @Get('pending-count')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get count of pending orders' })
  getPendingCount() {
    return this.ordersService.getPendingOrdersCount();
  }

  @Get('track/:orderNumber')
  @ApiOperation({ summary: 'Track order by order number' })
  @ApiParam({
    name: 'orderNumber',
    description: 'Public order number (e.g. AMB-2026-...)',
  })
  getOrderByNumber(@Param('orderNumber') orderNumber: string) {
    return this.ordersService.getOrderByNumber(orderNumber);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get order details by ID' })
  getOrder(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.ordersService.getOrderById(id, req.user);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all orders (Admin only)' })
  getAllOrders(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('paymentStatus') paymentStatus?: string,
    @Query('search') search?: string,
  ) {
    return this.ordersService.getAllOrders({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      status: status as OrderStatus | undefined,
      paymentStatus: paymentStatus as PaymentStatus | undefined,
      search,
    });
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update order status' })
  updateOrderStatus(@Param('id') id: string, @Body() body: OrderStatusDto) {
    return this.ordersService.updateOrderStatus(id, body.status as OrderStatus);
  }

  @Patch(':id/payment-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update payment status' })
  updatePaymentStatus(@Param('id') id: string, @Body() body: PaymentStatusDto) {
    return this.ordersService.updatePaymentStatus(id, body.status as PaymentStatus);
  }

  @Patch('bulk-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk update order status' })
  bulkUpdateStatus(@Body() body: BulkOrderStatusDto) {
    return this.ordersService.bulkUpdateStatus(body.ids, body.status as OrderStatus);
  }

  @Patch('bulk-payment-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk update payment status' })
  bulkUpdatePaymentStatus(@Body() body: BulkPaymentStatusDto) {
    return this.ordersService.bulkUpdatePaymentStatus(body.ids, body.status as PaymentStatus);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an order' })
  deleteOrder(@Param('id') id: string) {
    return this.ordersService.deleteOrder(id);
  }
}
