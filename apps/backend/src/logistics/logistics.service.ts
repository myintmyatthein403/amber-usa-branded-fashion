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
import { InventoryTarget, assertValidTarget } from './inventory-target.util';

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
  async getInventoryForItem(target: InventoryTarget) {
    assertValidTarget(target);
    return this.logisticsRepository.findInventoryForItem(target);
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
    target: InventoryTarget,
    warehouseId: string,
    quantity: number,
    reason: 'ADJUSTMENT' | 'RECEIVING' | 'DAMAGE' | 'SALE' | 'RESTOCK' = 'ADJUSTMENT',
    note?: string,
    userId?: string,
    mode: 'SET' | 'DELTA' = 'SET',
  ) {
    assertValidTarget(target);

    if (mode === 'DELTA') {
      if (quantity === 0) {
        throw new BadRequestException('Delta quantity cannot be zero');
      }
      const result = await this.logisticsRepository.adjustInventoryDelta(
        target,
        warehouseId,
        quantity,
      );
      // DELTA entries record the actual change (e.g. -5 for a damage
      // write-off), unlike SET entries below which historically recorded
      // the resulting absolute total — see StockAdjustmentModeSchema.
      await this.prisma.stockMovement.create({
        data: {
          variantId: target.variantId,
          productId: target.productId,
          toWarehouseId: quantity > 0 ? warehouseId : undefined,
          fromWarehouseId: quantity < 0 ? warehouseId : undefined,
          quantity: Math.abs(quantity),
          reason,
          note,
          userId,
        },
      });
      return result;
    }

    const safeQuantity = Math.max(0, quantity);
    const result = await this.logisticsRepository.upsertInventory(
      target,
      warehouseId,
      safeQuantity,
    );
    await this.prisma.stockMovement.create({
      data: {
        variantId: target.variantId,
        productId: target.productId,
        toWarehouseId: warehouseId,
        quantity: safeQuantity,
        reason,
        note,
        userId,
      },
    });
    return result;
  }

  async transferStock(data: InventoryTarget & {
    fromWarehouseId: string;
    toWarehouseId: string;
    quantity: number;
    note?: string;
    userId?: string;
  }) {
    assertValidTarget(data);
    const target: InventoryTarget = { variantId: data.variantId, productId: data.productId };

    const fromWh = await this.prisma.warehouse.findUnique({
      where: { id: data.fromWarehouseId },
    });
    const toWh = await this.prisma.warehouse.findUnique({
      where: { id: data.toWarehouseId },
    });

    await this.logisticsRepository.transferInventory(
      target,
      data.fromWarehouseId,
      data.toWarehouseId,
      data.quantity,
    );

    await this.prisma.stockMovement.create({
      data: {
        variantId: data.variantId,
        productId: data.productId,
        fromWarehouseId: data.fromWarehouseId,
        toWarehouseId: data.toWarehouseId,
        quantity: data.quantity,
        reason: 'TRANSFER',
        note: data.note,
        userId: data.userId,
      },
    });

    // Any transfer that crosses warehouse locations gets cargo tracking —
    // previously hardcoded to the literal pair 'USA' -> 'MYANMAR', which
    // silently skipped tracking for any other location combination (e.g. a
    // third warehouse, or the reverse direction). Location is still a free
    // -text field (see WarehouseLocationSchema), but this at least stops
    // assuming there are only ever two possible values.
    if (fromWh && toWh && fromWh.location !== toWh.location) {
      await this.createCargoShipment({
        originId: data.fromWarehouseId,
        destinationId: data.toWarehouseId,
        notes: `Auto-created from stock transfer. ${data.note ?? ''}`,
        items: [{ ...target, quantity: data.quantity }],
      });
    }

    return { success: true };
  }

  async bulkTransferStock(data: {
    fromWarehouseId: string;
    toWarehouseId: string;
    items: (InventoryTarget & { quantity: number })[];
    note?: string;
    userId?: string;
  }) {
    const fromWh = await this.prisma.warehouse.findUnique({
      where: { id: data.fromWarehouseId },
    });
    const toWh = await this.prisma.warehouse.findUnique({
      where: { id: data.toWarehouseId },
    });

    if (!fromWh || !toWh) {
      throw new NotFoundException('One or both warehouses not found');
    }

    data.items.forEach(assertValidTarget);

    // Single transaction: a mid-batch insufficient-stock failure rolls back
    // every item in the batch rather than leaving earlier items committed.
    await this.logisticsRepository.bulkTransferInventory(
      data.items,
      data.fromWarehouseId,
      data.toWarehouseId,
      { note: data.note, userId: data.userId },
    );

    // Create cargo shipment for any cross-location transfer (see comment in
    // transferStock above — no longer hardcoded to USA -> MYANMAR only).
    if (fromWh.location !== toWh.location) {
      await this.createCargoShipment({
        originId: data.fromWarehouseId,
        destinationId: data.toWarehouseId,
        notes: `Bulk transfer cargo. ${data.note ?? ''}`,
        items: data.items,
      });
    }

    return { success: true, itemCount: data.items.length };
  }

  async getLowStockItems() {
    const variants = await this.prisma.variant.findMany({
      include: { product: true, inventory: { include: { warehouse: true } } },
    });
    // reorderPoint (when an operator has set one) takes priority over the
    // display-only lowStockThreshold — it's the actual "go reorder now"
    // signal; lowStockThreshold remains the fallback for items that have
    // never had a reorder point configured.
    const lowVariants = variants
      .filter((v) => v.stock <= (v.reorderPoint ?? v.lowStockThreshold))
      .map((v) => ({ type: 'variant' as const, ...v }));

    const products = await this.prisma.product.findMany({
      where: { variants: { none: {} } },
      include: { inventory: { include: { warehouse: true } } },
    });
    const lowProducts = products
      .filter((p) => p.stock <= (p.reorderPoint ?? p.lowStockThreshold))
      .map((p) => ({ type: 'product' as const, ...p }));

    return [...lowVariants, ...lowProducts];
  }

  // Scheduled sweep (see LogisticsScheduler) — no transactional-email
  // provider is configured in this environment (same situation as
  // EmailService's password-reset path), so this is the same "log clearly,
  // wire a real notification channel in later" pattern used there and in
  // reconcileStock below, rather than a silent no-op.
  async checkReorderAlerts(): Promise<{ count: number }> {
    const lowStockItems = await this.getLowStockItems();

    for (const item of lowStockItems) {
      const name =
        item.type === 'variant'
          ? `${item.product.name} (${item.sku})`
          : item.name;
      const threshold = item.reorderPoint ?? item.lowStockThreshold;
      this.logger.warn(
        `Reorder alert: ${item.type} "${name}" at stock=${item.stock}, threshold=${threshold}`,
      );
    }
    if (lowStockItems.length) {
      this.logger.warn(`Reorder sweep found ${lowStockItems.length} item(s) at or below threshold`);
    }

    return { count: lowStockItems.length };
  }

  // --- Cargo Management ---
  async createCargoShipment(data: {
    originId: string;
    destinationId: string;
    carrier?: string;
    trackingNumber?: string;
    notes?: string;
    items: (InventoryTarget & { quantity: number })[];
  }) {
    data.items.forEach(assertValidTarget);
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
    const inventoryUpdates: Array<InventoryTarget & { warehouseId: string; quantity: number }> = [];
    const cargoUpdateData: Prisma.CargoShipmentUpdateInput = { status };

    // 1. Handle Origin Deduction (Moving away from PREPARING)
    // Sufficiency is guarded atomically inside updateCargoWithInventory's
    // transaction, not here — a pre-check outside the transaction would be
    // a TOCTOU race against concurrent status transitions on this shipment.
    if (status !== 'PREPARING' && !shipment.originDeducted) {
      for (const item of shipment.items) {
        inventoryUpdates.push({
          variantId: item.variantId,
          productId: item.productId,
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
          productId: item.productId,
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

  // Detects drift between cached Variant/Product.stock and the true
  // SUM(Inventory.quantity) — logs a warning per item plus a summary count.
  // Does not auto-correct: see findStockDrift's comment for why.
  async reconcileStock(): Promise<{ variantDriftCount: number; productDriftCount: number }> {
    const { variantDrift, productDrift } = await this.logisticsRepository.findStockDrift();

    for (const d of variantDrift) {
      this.logger.warn(
        `Stock drift: Variant ${d.variantId} cached stock=${d.cached} but SUM(Inventory)=${d.actual}`,
      );
    }
    for (const d of productDrift) {
      this.logger.warn(
        `Stock drift: Product ${d.productId} cached stock=${d.cached} but SUM(Inventory)=${d.actual}`,
      );
    }
    if (variantDrift.length || productDrift.length) {
      this.logger.warn(
        `Stock reconciliation found drift on ${variantDrift.length} variant(s) and ${productDrift.length} product(s)`,
      );
    }

    return {
      variantDriftCount: variantDrift.length,
      productDriftCount: productDrift.length,
    };
  }
}
