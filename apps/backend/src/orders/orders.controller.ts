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
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { OrdersService } from './orders.service';
import { StripeService } from '../stripe/stripe.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  CreateOrderSchema,
  OrderStatus,
  PaymentStatus,
} from '@amber/shared';
import {
  CreateOrderDto,
  OrderStatusDto,
  PaymentStatusDto,
  BulkOrderStatusDto,
  BulkPaymentStatusDto,
  TrackingUpdateDto,
  RejectManualPaymentDto,
} from './dto/order.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';

interface AuthenticatedRequest extends Request {
  user?: {
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
  @UsePipes(new ZodValidationPipe(CreateOrderSchema))
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order successfully created.' })
  createOrder(@Req() req: AuthenticatedRequest, @Body() data: CreateOrderDto) {
    const userId = req.user?.userId || '';

    const customerName =
      data.customerName ||
      (data.shippingAddress.split(',')[0]?.trim() ?? 'Customer');
    const parts = data.shippingAddress.split(',').map((s) => s.trim());
    const legacyNameParts = parts[0]?.split(' ') || [];
    const firstName =
      data.customerName?.split(' ')[0] || legacyNameParts[0] || '';
    const lastName =
      data.customerName?.split(' ').slice(1).join(' ') ||
      legacyNameParts.slice(1).join(' ') ||
      '';

    const orderData = {
      userId,
      email: data.customerEmail || req.user?.email || '',
      firstName,
      lastName,
      address: data.street || parts[1] || '',
      city: data.city || parts[2] || '',
      phone: data.customerPhone || parts[parts.length - 1]?.replace(/^Phone:\s*/i, '') || '',
      shippingMethod: data.deliveryMethodId || '',
      paymentMethod: data.paymentMethod,
      paymentReference: data.paymentReference,
      totalAmount: data.totalAmount,
      currency: data.currency,
      market: data.market,
      shippingCountry: data.shippingCountry,
      deliveryFee: data.deliveryFee,
      deliveryMethodId: data.deliveryMethodId,
      shippingAddress: data.shippingAddress,
      customerName: data.customerName || customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      street: data.street,
      state: data.state,
      township: data.township,
      zipCode: data.zipCode,
      warehouseId: undefined,
      items: data.items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId || undefined,
        name: item.name,
        price: item.price,
        isUsd: item.isUsd,
        currencyCode: item.currencyCode,
        quantity: item.quantity,
        image: item.image,
        size: item.size || undefined,
      })),
    };
    return this.ordersService.createOrder(orderData);
  }

  @Post(':id/payment-proof')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload manual payment proof screenshot' })
  uploadPaymentProof(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({
            fileType: /(jpg|jpeg|png|webp|gif|pdf)$/i,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.ordersService.uploadPaymentProof(
      id,
      req.user!.userId,
      file,
    );
  }

  @Post(':id/confirm-manual-payment')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirm manual payment after reviewing proof' })
  confirmManualPayment(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.ordersService.confirmManualPayment(id, req.user!.userId);
  }

  @Post(':id/reject-manual-payment')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject manual payment proof' })
  rejectManualPayment(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: RejectManualPaymentDto,
  ) {
    return this.ordersService.rejectManualPayment(
      id,
      req.user!.userId,
      body.reason,
    );
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
    return this.ordersService.getOrdersByUser(req.user!.userId);
  }

  @Get('pending-count')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get count of pending orders' })
  getPendingCount() {
    return this.ordersService.getPendingOrdersCount();
  }

  @Post('cleanup')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cleanup stale pending orders' })
  async cleanupOrders() {
    const count = await this.ordersService.cleanupStaleOrders();
    return { message: `Cleaned up ${count} stale orders` };
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
    @Query('awaitingPaymentReview') awaitingPaymentReview?: string,
  ) {
    return this.ordersService.getAllOrders({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      status: status as OrderStatus | undefined,
      paymentStatus: paymentStatus as PaymentStatus | undefined,
      search,
      awaitingPaymentReview: awaitingPaymentReview === 'true',
    });
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update order status' })
  updateOrderStatus(@Param('id') id: string, @Body() body: OrderStatusDto) {
    return this.ordersService.updateOrderStatus(id, body.status);
  }

  @Patch(':id/payment-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update payment status' })
  updatePaymentStatus(@Param('id') id: string, @Body() body: PaymentStatusDto) {
    return this.ordersService.updatePaymentStatus(id, body.status);
  }

  @Patch('bulk-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk update order status' })
  bulkUpdateStatus(@Body() body: BulkOrderStatusDto) {
    return this.ordersService.bulkUpdateStatus(body.ids, body.status);
  }

  @Patch('bulk-payment-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk update payment status' })
  bulkUpdatePaymentStatus(@Body() body: BulkPaymentStatusDto) {
    return this.ordersService.bulkUpdatePaymentStatus(body.ids, body.status);
  }

  @Patch(':id/tracking')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update order tracking information' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  updateOrderTracking(
    @Param('id') id: string,
    @Body() body: TrackingUpdateDto,
  ) {
    return this.ordersService.updateOrderTracking(id, body);
  }

  @Post(':id/refund')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Process refund for an order' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  async processRefund(
    @Param('id') id: string,
    @Body()
    body: {
      amount?: number;
      reason?:
        | 'requested_by_customer'
        | 'fraudulent'
        | 'duplicate'
        | 'expired_uncaptured_charge';
    },
  ) {
    return this.stripeService.createRefund(id, body.amount, body.reason);
  }

  @Get(':id/refunds')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get refund history for an order' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  async getRefunds(@Param('id') id: string) {
    return this.stripeService.getRefunds(id);
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
