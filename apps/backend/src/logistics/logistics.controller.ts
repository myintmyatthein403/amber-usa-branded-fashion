import { Controller, Get, Post, Patch, Body, Param, UseGuards, UsePipes } from '@nestjs/common';
import { LogisticsService } from './logistics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CargoStatus } from '@prisma/client';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { WarehouseSchema, CargoShipmentSchema } from '@amber/shared';

@Controller('logistics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPERADMIN')
export class LogisticsController {
  constructor(private readonly logisticsService: LogisticsService) {}

  @Get('warehouses')
  getAllWarehouses() {
    return this.logisticsService.getAllWarehouses();
  }

  @Post('warehouses')
  @UsePipes(new ZodValidationPipe(WarehouseSchema))
  createWarehouse(@Body() data: any) {
    return this.logisticsService.createWarehouse(data);
  }

  @Get('inventory')
  getInventoryOverview() {
    return this.logisticsService.getInventoryOverview();
  }

  @Get('inventory/:variantId')
  getInventoryByVariant(@Param('variantId') variantId: string) {
    return this.logisticsService.getInventoryByVariant(variantId);
  }

  @Get('inventory/warehouse/:warehouseId')
  getInventoryByWarehouse(@Param('warehouseId') warehouseId: string) {
    return this.logisticsService.getInventoryByWarehouse(warehouseId);
  }

  @Patch('inventory/update')
  updateStock(@Body() data: { variantId: string; warehouseId: string; quantity: number }) {
    return this.logisticsService.updateStock(data.variantId, data.warehouseId, data.quantity);
  }

  @Get('cargo')
  getAllCargoShipments() {
    return this.logisticsService.getAllCargoShipments();
  }

  @Post('cargo')
  @UsePipes(new ZodValidationPipe(CargoShipmentSchema))
  createCargoShipment(@Body() data: any) {
    return this.logisticsService.createCargoShipment(data);
  }

  @Get('cargo/:id')
  getCargoDetails(@Param('id') id: string) {
    return this.logisticsService.getCargoDetails(id);
  }

  @Patch('cargo/:id/status')
  updateCargoStatus(@Param('id') id: string, @Body('status') status: CargoStatus) {
    return this.logisticsService.updateCargoStatus(id, status);
  }
}
