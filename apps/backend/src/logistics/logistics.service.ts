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
import { PrismaService } from '../prisma/prisma.service';

const CARGO_TRANSITIONS: Record<CargoStatus, CargoStatus[]> = {
  PREPARING: ['DEPARTED', 'PREPARING'],
  DEPARTED: ['IN_TRANSIT', 'PREPARING'],
  IN_TRANSIT: ['ARRIVED_MYANMAR', 'DEPARTED'],
  ARRIVED_MYANMAR: ['CUSTOMS_CLEARANCE', 'READY_FOR_DISTRIBUTION', 'IN_TRANSIT'],
  CUSTOMS_CLEARANCE: ['READY_FOR_DISTRIBUTION', 'ARRIVED_MYANMAR'],
  READY_FOR_DISTRIBUTION: ['COMPLETED', 'CUSTOMS_CLEARANCE'],
  COMPLETED: ['COMPLETED'],
};

const DESTINATION_CREDIT_STATUSES: CargoStatus[] = [
  'ARRIVED_MYANMAR',
  'READY_FOR_DISTRIBUTION',
  'COMPLETED',
];

@Injectable()
export class LogisticsService {
  private readonly logger = new Logger(LogisticsService.name);

  constructor(
    private logisticsRepository: LogisticsRepository,
    private eventEmitter: EventEmitter2,
    private prisma: PrismaService,
  ) {}

  // --- Warehouse Management ---
  async getAllWarehouses() {
    return this.logisticsRepository.findAllWarehouses();
  }

  async createWarehouse(data: Record<string, unknown>) {
    return this.logisticsRepository.createWarehouse(
      data as unknown as Warehouse,
    );
  }

  async updateWarehouse(id: string, data: Record<string, unknown>) {
    return this.logisticsRepository.updateWarehouse(id, data);
  }

  // --- Inventory Management ---
  async getInventoryByVariant(variantId: string) {
    return this.logisticsRepository.findInventoryByVariant(variantId);
  }

  async getInventoryByWarehouse(
    warehouseId: string,
    options?: { page?: number; limit?: number; search?: string },
  ) {
    return this.logisticsRepository.findInventoryByWarehouse(
      warehouseId,
      options,
    );
  }

  async updateStock(
    variantId: string,
    warehouseId: string,
    quantity: number,
    reason: 'ADJUSTMENT' | 'RECEIVING' = 'ADJUSTMENT',
    note?: string,
    userId?: string,
  ) {
    const safeQuantity = Math.max(0, quantity);
    const result = await this.logisticsRepository.upsertInventory(
      variantId,
      warehouseId,
      safeQuantity,
    );
    await this.prisma.stockMovement.create({
      data: {
        variantId,
        toWarehouseId: warehouseId,
        quantity: safeQuantity,
        reason,
        note,
        userId,
      },
    });
    return result;
  }

  async transferStock(data: {
    variantId: string;
    fromWarehouseId: string;
    toWarehouseId: string;
    quantity: number;
    note?: string;
    userId?: string;
  }) {
    const fromInv = await this.logisticsRepository.findInventory(
      data.variantId,
      data.fromWarehouseId,
    );
    if (!fromInv || fromInv.quantity < data.quantity) {
      throw new BadRequestException('Insufficient stock at origin warehouse');
    }

    const fromWh = await this.prisma.warehouse.findUnique({
      where: { id: data.fromWarehouseId },
    });
    const toWh = await this.prisma.warehouse.findUnique({
      where: { id: data.toWarehouseId },
    });

    await this.logisticsRepository.transferInventory(
      data.variantId,
      data.fromWarehouseId,
      data.toWarehouseId,
      data.quantity,
    );

    await this.prisma.stockMovement.create({
      data: {
        variantId: data.variantId,
        fromWarehouseId: data.fromWarehouseId,
        toWarehouseId: data.toWarehouseId,
        quantity: data.quantity,
        reason: 'TRANSFER',
        note: data.note,
        userId: data.userId,
      },
    });

    if (
      fromWh &&
      toWh &&
      fromWh.location !== toWh.location &&
      fromWh.location === 'USA' &&
      toWh.location === 'MYANMAR'
    ) {
      await this.createCargoShipment({
        originId: data.fromWarehouseId,
        destinationId: data.toWarehouseId,
        notes: `Auto-created from stock transfer. ${data.note ?? ''}`,
        items: [{ variantId: data.variantId, quantity: data.quantity }],
      });
    }

    return { success: true };
  }

  async getLowStockVariants() {
    const variants = await this.prisma.variant.findMany({
      include: { product: true, inventory: { include: { warehouse: true } } },
    });
    return variants.filter((v) => v.stock <= v.lowStockThreshold);
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

    const allowed = CARGO_TRANSITIONS[shipment.status] ?? [];
    if (!allowed.includes(status)) {
      throw new BadRequestException(
        `Invalid status transition from ${shipment.status} to ${status}`,
      );
    }

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

    // 2. Handle Destination Addition (ARRIVED_MYANMAR, READY_FOR_DISTRIBUTION, or COMPLETED)
    if (
      DESTINATION_CREDIT_STATUSES.includes(status) &&
      !shipment.destinationAdded
    ) {
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
