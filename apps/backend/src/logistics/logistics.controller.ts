import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { LogisticsService } from './logistics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CargoStatus } from '@prisma/client';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { WarehouseSchema, CreateCargoShipmentSchema, CargoStatusSchema, type CreateCargoShipmentInput } from '@amber/shared';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';

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
  @UsePipes(new ZodValidationPipe(WarehouseSchema))
  @ApiOperation({ summary: 'Create a new warehouse' })
  createWarehouse(@Body() data: any) {
    return this.logisticsService.createWarehouse(data);
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
    return this.logisticsService.getInventoryByVariant(variantId);
  }

  @Get('inventory/warehouse/:warehouseId')
  @ApiOperation({ summary: 'Get inventory for a specific warehouse' })
  @ApiParam({ name: 'warehouseId', description: 'Warehouse ID' })
  getInventoryByWarehouse(@Param('warehouseId') warehouseId: string) {
    return this.logisticsService.getInventoryByWarehouse(warehouseId);
  }

  @Patch('inventory/update')
  @ApiOperation({ summary: 'Update stock level' })
  updateStock(
    @Body() data: { variantId: string; warehouseId: string; quantity: number },
  ) {
    return this.logisticsService.updateStock(
      data.variantId,
      data.warehouseId,
      data.quantity,
    );
  }

  @Get('cargo')
  @ApiOperation({ summary: 'Get all cargo shipments' })
  getAllCargoShipments() {
    return this.logisticsService.getAllCargoShipments();
  }

  @Post('cargo')
  @UsePipes(new ZodValidationPipe(CreateCargoShipmentSchema))
  @ApiOperation({ summary: 'Create a new cargo shipment' })
  createCargoShipment(@Body() data: CreateCargoShipmentInput) {
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
    @Body('status') status: CargoStatus,
  ) {
    return this.logisticsService.updateCargoStatus(id, status);
  }
}
