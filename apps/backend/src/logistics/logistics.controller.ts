import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiQuery } from '@nestjs/swagger';
import { LogisticsService } from './logistics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CargoStatus } from '@prisma/client';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  WarehouseSchema,
  type Warehouse,
  UpdateWarehouseSchema,
  type UpdateWarehouseInput,
  UpdateStockSchema,
  type UpdateStockInput,
  TransferStockSchema,
  type TransferStockInput,
  BulkTransferStockSchema,
  type BulkTransferStockInput,
  CreateCargoShipmentSchema,
  CargoStatusSchema,
  type CreateCargoShipmentInput,
} from '@amber/shared';
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

@ApiTags('Logistics')
@Controller('logistics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPERADMIN')
@ApiBearerAuth()
export class LogisticsController {
  constructor(private readonly logisticsService: LogisticsService) {}

  @Get('warehouses')
  @ApiOperation({ summary: 'Get all warehouses' })
  getAllWarehouses() {
    return this.logisticsService.getAllWarehouses();
  }

  @Post('warehouses')
  @ApiOperation({ summary: 'Create a new warehouse' })
  createWarehouse(@Body(new ZodValidationPipe(WarehouseSchema)) data: Warehouse) {
    return this.logisticsService.createWarehouse(data);
  }

  @Patch('warehouses/:id')
  @ApiOperation({ summary: 'Update a warehouse' })
  @ApiParam({ name: 'id', description: 'Warehouse ID' })
  updateWarehouse(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateWarehouseSchema)) data: UpdateWarehouseInput,
  ) {
    return this.logisticsService.updateWarehouse(id, data);
  }

  @Get('inventory')
  @ApiOperation({ summary: 'Get inventory overview' })
  getInventoryOverview() {
    return this.logisticsService.getInventoryOverview();
  }

  @Get('inventory/:variantId')
  @ApiOperation({ summary: 'Get inventory for a specific variant' })
  @ApiParam({ name: 'variantId', description: 'Variant ID' })
  getInventoryByVariant(@Param('variantId') variantId: string) {
    return this.logisticsService.getInventoryForItem({ variantId });
  }

  @Get('inventory/product/:productId')
  @ApiOperation({ summary: 'Get inventory for a specific simple product' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  getInventoryByProduct(@Param('productId') productId: string) {
    return this.logisticsService.getInventoryForItem({ productId });
  }

  @Get('inventory/warehouse/:warehouseId')
  @ApiOperation({ summary: 'Get inventory for a specific warehouse' })
  @ApiParam({ name: 'warehouseId', description: 'Warehouse ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  getInventoryByWarehouse(
    @Param('warehouseId') warehouseId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.logisticsService.getInventoryByWarehouse(warehouseId, {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      search,
    });
  }

  @Patch('inventory/update')
  @ApiOperation({ summary: 'Update stock level (absolute set or +/- delta with a reason)' })
  updateStock(
    @Req() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe(UpdateStockSchema)) data: UpdateStockInput,
  ) {
    return this.logisticsService.updateStock(
      { variantId: data.variantId, productId: data.productId },
      data.warehouseId,
      data.quantity,
      data.reason,
      data.note,
      req.user?.userId,
      data.mode,
    );
  }

  @Post('inventory/transfer')
  @ApiOperation({ summary: 'Transfer stock between warehouses' })
  transferStock(
    @Req() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe(TransferStockSchema)) data: TransferStockInput,
  ) {
    return this.logisticsService.transferStock({
      ...data,
      userId: req.user?.userId,
    });
  }

  @Post('inventory/bulk-transfer')
  @ApiOperation({ summary: 'Bulk transfer stock between warehouses' })
  bulkTransfer(
    @Req() req: AuthenticatedRequest,
    @Body(new ZodValidationPipe(BulkTransferStockSchema)) data: BulkTransferStockInput,
  ) {
    return this.logisticsService.bulkTransferStock({
      ...data,
      userId: req.user?.userId,
    });
  }

  @Get('inventory/low-stock')
  @ApiOperation({ summary: 'Get variants/products at or below low stock threshold' })
  getLowStock() {
    return this.logisticsService.getLowStockItems();
  }

  @Get('cargo')
  @ApiOperation({ summary: 'Get all cargo shipments' })
  getAllCargoShipments() {
    return this.logisticsService.getAllCargoShipments();
  }

  @Post('cargo')
  @ApiOperation({ summary: 'Create a new cargo shipment' })
  createCargoShipment(
    @Body(new ZodValidationPipe(CreateCargoShipmentSchema))
    data: CreateCargoShipmentInput,
  ) {
    return this.logisticsService.createCargoShipment(data);
  }

  @Get('cargo/:id')
  @ApiOperation({ summary: 'Get cargo shipment details' })
  @ApiParam({ name: 'id', description: 'Cargo Shipment ID' })
  getCargoDetails(@Param('id') id: string) {
    return this.logisticsService.getCargoDetails(id);
  }

  @Patch('cargo/:id/status')
  @ApiOperation({ summary: 'Update cargo shipment status' })
  @ApiParam({ name: 'id', description: 'Cargo Shipment ID' })
  updateCargoStatus(
    @Param('id') id: string,
    @Body('status', new ZodValidationPipe(CargoStatusSchema)) status: CargoStatus,
  ) {
    return this.logisticsService.updateCargoStatus(id, status);
  }
}
