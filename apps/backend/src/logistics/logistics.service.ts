import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LogisticsRepository } from './logistics.repository';
import { CargoStatus, Prisma } from '@prisma/client';

@Injectable()
export class LogisticsService {
  private readonly logger = new Logger(LogisticsService.name);

  constructor(
    private prisma: PrismaService,
    private logisticsRepository: LogisticsRepository
  ) {}

  // --- Warehouse Management ---
  async getAllWarehouses() {
    return this.logisticsRepository.findAllWarehouses();
  }

  async createWarehouse(data: { name: string; location: string; address?: string }) {
    const sanitizedData = this.prisma.sanitizeData(data) as Prisma.WarehouseCreateInput;
    return this.logisticsRepository.createWarehouse(sanitizedData);
  }

  // --- Inventory Management ---
  async getInventoryByVariant(variantId: string) {
    return this.logisticsRepository.findInventoryByVariant(variantId);
  }

  async getInventoryByWarehouse(warehouseId: string) {
    return this.logisticsRepository.findInventoryByWarehouse(warehouseId);
  }

  async updateStock(variantId: string, warehouseId: string, quantity: number) {
    const safeQuantity = Math.max(0, quantity);
    return this.logisticsRepository.upsertInventory(variantId, warehouseId, safeQuantity);
  }

  // --- Cargo Management ---
  async createCargoShipment(data: {
    originId: string;
    destinationId: string;
    carrier?: string;
    trackingNumber?: string;
    notes?: string;
    items: { variantId: string; quantity: number }[];
  }) {
    let retries = 5;
    while (retries > 0) {
      try {
        const shipmentNumber = `CARGO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        return await this.logisticsRepository.createCargoShipment({
          ...data,
          shipmentNumber,
        });
      } catch (error) {
        if (error.code === 'P2002' && (error.meta?.target as string[])?.includes('shipmentNumber')) {
          retries--;
          continue;
        }
        throw error;
      }
    }
    throw new BadRequestException('Failed to generate a unique shipment number');
  }

  async updateCargoStatus(id: string, status: CargoStatus) {
    const shipment = await this.logisticsRepository.findCargoById(id);
    if (!shipment) throw new NotFoundException('Shipment not found');

    const inventoryUpdates: Array<{ variantId: string; warehouseId: string; quantity: number }> = [];
    const cargoUpdateData: Prisma.CargoShipmentUpdateInput = { status };

    // 1. Handle Origin Deduction (Moving away from PREPARING)
    if (status !== 'PREPARING' && !shipment.originDeducted) {
      for (const item of shipment.items) {
        const inventory = await this.logisticsRepository.findInventory(item.variantId, shipment.originId);
        if (!inventory || inventory.quantity < item.quantity) {
          throw new BadRequestException(`Insufficient stock for variant ${item.variantId} in origin warehouse`);
        }
        inventoryUpdates.push({ 
          variantId: item.variantId, 
          warehouseId: shipment.originId, 
          quantity: -item.quantity 
        });
      }
      cargoUpdateData.originDeducted = true;
      cargoUpdateData.departureDate = new Date();
    }

    // 2. Handle Destination Addition (Marking as COMPLETED)
    if (status === 'COMPLETED' && !shipment.destinationAdded) {
      for (const item of shipment.items) {
        inventoryUpdates.push({ 
          variantId: item.variantId, 
          warehouseId: shipment.destinationId, 
          quantity: item.quantity 
        });
      }
      cargoUpdateData.destinationAdded = true;
      cargoUpdateData.arrivalDate = new Date();
    }

    if (inventoryUpdates.length > 0) {
      return this.logisticsRepository.updateCargoWithInventory(id, cargoUpdateData, inventoryUpdates);
    }

    return this.logisticsRepository.updateCargo(id, cargoUpdateData);
  }

  async getInventoryOverview() {
    return this.logisticsRepository.findAllWarehouses().then(async warehouses => {
      // Simplified overview logic or keep current
      return this.prisma.inventory.findMany({
        include: {
          warehouse: true,
          variant: { include: { product: true } }
        },
        orderBy: [
          { variant: { productId: 'asc' } },
          { warehouse: { location: 'asc' } }
        ]
      });
    });
  }

  async getAllCargoShipments() {
    return this.logisticsRepository.findAllCargoShipments();
  }

  async getCargoDetails(id: string) {
    return this.logisticsRepository.findCargoById(id);
  }
}
