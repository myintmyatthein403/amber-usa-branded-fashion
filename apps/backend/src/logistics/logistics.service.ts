import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { LogisticsRepository } from './logistics.repository';
import { CargoStatus, Prisma, Warehouse } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ShipmentStatusChangedEvent } from '../common/events/domain.events';
import { sanitizeData } from '../common/utils/data-sanitizer';

@Injectable()
export class LogisticsService {
  private readonly logger = new Logger(LogisticsService.name);

  constructor(
    private logisticsRepository: LogisticsRepository,
    private eventEmitter: EventEmitter2,
  ) {}

  // --- Warehouse Management ---
  async getAllWarehouses() {
    return this.logisticsRepository.findAllWarehouses();
  }

  async createWarehouse(data: Record<string, unknown>) {
    return this.logisticsRepository.createWarehouse(data as unknown as Warehouse);
  }

  async updateWarehouse(id: string, data: Record<string, unknown>) {
    return this.logisticsRepository.updateWarehouse(id, data);
  }

  // --- Inventory Management ---
  async getInventoryByVariant(variantId: string) {
    return this.logisticsRepository.findInventoryByVariant(variantId);
  }

  async getInventoryByWarehouse(warehouseId: string, options?: { page?: number; limit?: number; search?: string }) {
    return this.logisticsRepository.findInventoryByWarehouse(warehouseId, options);
  }

  async updateStock(variantId: string, warehouseId: string, quantity: number) {
    const safeQuantity = Math.max(0, quantity);
    return this.logisticsRepository.upsertInventory(
      variantId,
      warehouseId,
      safeQuantity,
    );
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
        if (
          error.code === 'P2002' &&
          (error.meta?.target as string[])?.includes('shipmentNumber')
        ) {
          retries--;
          continue;
        }
        throw error;
      }
    }
    throw new BadRequestException(
      'Failed to generate a unique shipment number',
    );
  }

  async updateCargoStatus(id: string, status: CargoStatus) {
    const shipment = await this.logisticsRepository.findCargoById(id);
    if (!shipment) throw new NotFoundException('Shipment not found');

    const oldStatus = shipment.status;
    const inventoryUpdates: Array<{
      variantId: string;
      warehouseId: string;
      quantity: number;
    }> = [];
    const cargoUpdateData: Prisma.CargoShipmentUpdateInput = { status };

    // 1. Handle Origin Deduction (Moving away from PREPARING)
    if (status !== 'PREPARING' && !shipment.originDeducted) {
      for (const item of shipment.items) {
        const inventory = await this.logisticsRepository.findInventory(
          item.variantId,
          shipment.originId,
        );
        if (!inventory || inventory.quantity < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for variant ${item.variantId} in origin warehouse`,
          );
        }
        inventoryUpdates.push({
          variantId: item.variantId,
          warehouseId: shipment.originId,
          quantity: -item.quantity,
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
          quantity: item.quantity,
        });
      }
      cargoUpdateData.destinationAdded = true;
      cargoUpdateData.arrivalDate = new Date();
    }

    let result: any;
    if (inventoryUpdates.length > 0) {
      result = await this.logisticsRepository.updateCargoWithInventory(
        id,
        cargoUpdateData,
        inventoryUpdates,
      );
    } else {
      result = await this.logisticsRepository.updateCargo(id, cargoUpdateData);
    }

    if (oldStatus !== status) {
      this.eventEmitter.emit(
        'shipment.status_changed',
        new ShipmentStatusChangedEvent(id, oldStatus, status),
      );
    }

    return result;
  }

  async getInventoryOverview() {
    return this.logisticsRepository.findAllInventoryWithDetails();
  }

  async getAllCargoShipments() {
    return this.logisticsRepository.findAllCargoShipments();
  }

  async getCargoDetails(id: string) {
    return this.logisticsRepository.findCargoById(id);
  }
}
