import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CargoShipment, Warehouse, Inventory, Prisma } from '@prisma/client';
import {
  InventoryTarget,
  inventoryUniqueWhere,
  inventoryFilterWhere,
  recomputeAndSyncStock,
} from './inventory-target.util';

@Injectable()
export class LogisticsRepository {
  constructor(private prisma: PrismaService) {}

  async findAllWarehouses() {
    return this.prisma.warehouse.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { inventory: true },
        },
      },
    });
  }

  async findWarehouseById(id: string) {
    return this.prisma.warehouse.findUnique({
      where: { id },
    });
  }

  async createWarehouse(data: Record<string, unknown>): Promise<Warehouse> {
    return this.prisma.warehouse.create({
      data: data as unknown as Prisma.WarehouseUncheckedCreateInput,
    });
  }

  async updateWarehouse(
    id: string,
    data: Record<string, unknown>,
  ): Promise<Warehouse> {
    return this.prisma.warehouse.update({
      where: { id },
      data: data as unknown as Prisma.WarehouseUncheckedUpdateInput,
    });
  }

  async deleteWarehouse(id: string): Promise<Warehouse> {
    return this.prisma.warehouse.delete({
      where: { id },
    });
  }

  async findAllInventory() {
    return this.prisma.inventory.findMany({
      include: {
        warehouse: true,
        variant: { include: { product: true } },
      },
    });
  }

  async findInventoryByWarehouse(
    warehouseId: string,
    options?: { page?: number; limit?: number; search?: string },
  ) {
    const { page = 1, limit = 20, search } = options || {};
    const skip = (page - 1) * limit;

    const where: any = { warehouseId };

    if (search) {
      where.OR = [
        {
          variant: {
            product: { name: { contains: search, mode: 'insensitive' } },
          },
        },
        { variant: { sku: { contains: search, mode: 'insensitive' } } },
        { product: { name: { contains: search, mode: 'insensitive' } } },
        { product: { slug: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.inventory.findMany({
        where,
        include: {
          variant: { include: { product: true } },
          product: true,
        },
        skip,
        take: limit,
      }),
      this.prisma.inventory.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findInventoryForItem(target: InventoryTarget) {
    return this.prisma.inventory.findMany({
      where: inventoryFilterWhere(target),
      include: { warehouse: true },
    });
  }

  async createInventory(data: {
    variantId: string;
    warehouseId: string;
    quantity: number;
  }): Promise<Inventory> {
    return this.prisma.inventory.create({
      data,
    });
  }

  async updateInventory(
    id: string,
    data: { quantity: number },
  ): Promise<Inventory> {
    return this.prisma.inventory.update({
      where: { id },
      data,
    });
  }

  async deleteInventory(id: string): Promise<Inventory> {
    return this.prisma.inventory.delete({
      where: { id },
    });
  }

  async findAllInventoryWithDetails() {
    return this.prisma.inventory.findMany({
      include: {
        warehouse: true,
        variant: { include: { product: true } },
        product: true,
      },
      orderBy: [{ warehouse: { location: 'asc' } }],
    });
  }

  async findInventory(target: InventoryTarget, warehouseId: string) {
    return this.prisma.inventory.findUnique({
      where: inventoryUniqueWhere(target, warehouseId) as Prisma.InventoryWhereUniqueInput,
    });
  }

  async upsertInventory(
    target: InventoryTarget,
    warehouseId: string,
    quantity: number,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const inventory = await tx.inventory.upsert({
        where: inventoryUniqueWhere(target, warehouseId) as Prisma.InventoryWhereUniqueInput,
        update: { quantity },
        create: { ...target, warehouseId, quantity },
      });

      await recomputeAndSyncStock(tx, target);

      return inventory;
    });
  }

  // Applies a +/- delta to a warehouse's Inventory row. Negative deltas
  // (e.g. DAMAGE write-offs) use the same guarded updateMany pattern as
  // every other decrement in this codebase — WHERE quantity >= |delta| —
  // so a write-off can't drive stock negative. Positive deltas (e.g.
  // RESTOCK from a return) upsert with increment.
  async adjustInventoryDelta(
    target: InventoryTarget,
    warehouseId: string,
    delta: number,
  ) {
    return this.prisma.$transaction(async (tx) => {
      if (delta < 0) {
        const decremented = await tx.inventory.updateMany({
          where: {
            ...inventoryFilterWhere(target),
            warehouseId,
            quantity: { gte: -delta },
          },
          data: { quantity: { decrement: -delta } },
        });
        if (decremented.count === 0) {
          throw new BadRequestException(
            `Insufficient stock for item ${target.variantId ?? target.productId} in this warehouse`,
          );
        }
      } else {
        await tx.inventory.upsert({
          where: inventoryUniqueWhere(target, warehouseId) as Prisma.InventoryWhereUniqueInput,
          update: { quantity: { increment: delta } },
          create: { ...target, warehouseId, quantity: delta },
        });
      }

      await recomputeAndSyncStock(tx, target);

      return tx.inventory.findUnique({
        where: inventoryUniqueWhere(target, warehouseId) as Prisma.InventoryWhereUniqueInput,
      });
    });
  }

  // --- Cargo ---
  async createCargoShipment(data: {
    shipmentNumber: string;
    originId: string;
    destinationId: string;
    carrier?: string;
    trackingNumber?: string;
    departureDate?: string;
    notes?: string;
    items: (InventoryTarget & { quantity: number })[];
  }): Promise<CargoShipment> {
    return this.prisma.cargoShipment.create({
      data: {
        shipmentNumber: data.shipmentNumber,
        originId: data.originId,
        destinationId: data.destinationId,
        carrier: data.carrier,
        trackingNumber: data.trackingNumber,
        departureDate: data.departureDate,
        notes: data.notes,
        items: {
          create: data.items.map((item) => ({
            variantId: item.variantId,
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: { include: { variant: true, product: true } },
        origin: true,
        destination: true,
      },
    });
  }

  async findAllCargoShipments() {
    return this.prisma.cargoShipment.findMany({
      include: {
        origin: true,
        destination: true,
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findCargoById(id: string) {
    return this.prisma.cargoShipment.findUnique({
      where: { id },
      include: {
        origin: true,
        destination: true,
        items: {
          include: {
            variant: {
              include: { product: true },
            },
            product: true,
          },
        },
      },
    });
  }

  async updateCargo(id: string, data: Prisma.CargoShipmentUpdateInput) {
    return this.prisma.cargoShipment.update({
      where: { id },
      data,
      include: {
        items: true,
        origin: true,
        destination: true,
      },
    });
  }

  async transferInventory(
    target: InventoryTarget,
    fromWarehouseId: string,
    toWarehouseId: string,
    quantity: number,
  ) {
    return this.prisma.$transaction(async (tx) => {
      await this.guardedDecrementAndCredit(
        tx,
        target,
        fromWarehouseId,
        toWarehouseId,
        quantity,
      );

      await recomputeAndSyncStock(tx, target);
    });
  }

  // Decrements origin stock only if enough is available (atomic, race-safe
  // WHERE quantity >= N guard — mirrors the pattern already used for order
  // stock decrements), then credits the destination. Throws inside the
  // transaction on insufficient stock so the whole transfer rolls back.
  private async guardedDecrementAndCredit(
    tx: Prisma.TransactionClient,
    target: InventoryTarget,
    fromWarehouseId: string,
    toWarehouseId: string,
    quantity: number,
  ) {
    const decremented = await tx.inventory.updateMany({
      where: {
        ...inventoryFilterWhere(target),
        warehouseId: fromWarehouseId,
        quantity: { gte: quantity },
      },
      data: { quantity: { decrement: quantity } },
    });
    if (decremented.count === 0) {
      throw new BadRequestException(
        `Insufficient stock for item ${target.variantId ?? target.productId} at origin warehouse`,
      );
    }

    await tx.inventory.upsert({
      where: inventoryUniqueWhere(target, toWarehouseId) as Prisma.InventoryWhereUniqueInput,
      update: { quantity: { increment: quantity } },
      create: { ...target, warehouseId: toWarehouseId, quantity },
    });
  }

  // Atomically transfers every item in one transaction, so a mid-batch
  // insufficient-stock failure rolls back the entire bulk transfer rather
  // than leaving earlier items committed.
  async bulkTransferInventory(
    items: (InventoryTarget & { quantity: number })[],
    fromWarehouseId: string,
    toWarehouseId: string,
    meta: { note?: string; userId?: string } = {},
  ) {
    return this.prisma.$transaction(async (tx) => {
      for (const item of items) {
        const target: InventoryTarget = {
          variantId: item.variantId,
          productId: item.productId,
        };

        await this.guardedDecrementAndCredit(
          tx,
          target,
          fromWarehouseId,
          toWarehouseId,
          item.quantity,
        );

        await recomputeAndSyncStock(tx, target);

        await tx.stockMovement.create({
          data: {
            variantId: item.variantId,
            productId: item.productId,
            fromWarehouseId,
            toWarehouseId,
            quantity: item.quantity,
            reason: 'TRANSFER',
            note: meta.note,
            userId: meta.userId,
          },
        });
      }
    });
  }

  async updateCargoWithInventory(
    id: string,
    cargoData: Prisma.CargoShipmentUpdateInput,
    inventoryUpdates: Array<InventoryTarget & { warehouseId: string; quantity: number }>,
  ) {
    return this.prisma.$transaction(async (tx) => {
      for (const update of inventoryUpdates) {
        const target: InventoryTarget = { variantId: update.variantId, productId: update.productId };

        if (update.quantity < 0) {
          // Origin deduction: guard atomically against insufficient stock
          // instead of trusting a pre-check made outside this transaction.
          const decremented = await tx.inventory.updateMany({
            where: {
              ...inventoryFilterWhere(target),
              warehouseId: update.warehouseId,
              quantity: { gte: -update.quantity },
            },
            data: { quantity: { decrement: -update.quantity } },
          });
          if (decremented.count === 0) {
            throw new BadRequestException(
              `Insufficient stock for item ${update.variantId ?? update.productId} in origin warehouse`,
            );
          }
        } else {
          await tx.inventory.upsert({
            where: inventoryUniqueWhere(target, update.warehouseId) as Prisma.InventoryWhereUniqueInput,
            update: { quantity: { increment: update.quantity } },
            create: {
              ...target,
              warehouseId: update.warehouseId,
              quantity: update.quantity,
            },
          });
        }

        await recomputeAndSyncStock(tx, target);
      }

      return tx.cargoShipment.update({
        where: { id },
        data: cargoData,
        include: {
          items: true,
          origin: true,
          destination: true,
        },
      });
    });
  }

  // Compares the cached Variant.stock/Product.stock fields against
  // SUM(Inventory.quantity) for every item that actually has Inventory rows.
  // Only flags drift — does not correct it, since silently "fixing" the
  // cache could mask a real bug in whatever wrote it out of sync.
  async findStockDrift(): Promise<{
    variantDrift: Array<{ variantId: string; cached: number; actual: number }>;
    productDrift: Array<{ productId: string; cached: number; actual: number }>;
  }> {
    const [variantSums, productSums] = await Promise.all([
      this.prisma.inventory.groupBy({
        by: ['variantId'],
        where: { variantId: { not: null } },
        _sum: { quantity: true },
      }),
      this.prisma.inventory.groupBy({
        by: ['productId'],
        where: { productId: { not: null } },
        _sum: { quantity: true },
      }),
    ]);

    const variantIds = variantSums
      .map((v) => v.variantId)
      .filter((id): id is string => Boolean(id));
    const productIds = productSums
      .map((p) => p.productId)
      .filter((id): id is string => Boolean(id));

    const [variants, products] = await Promise.all([
      variantIds.length
        ? this.prisma.variant.findMany({
            where: { id: { in: variantIds } },
            select: { id: true, stock: true },
          })
        : Promise.resolve([]),
      productIds.length
        ? this.prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, stock: true },
          })
        : Promise.resolve([]),
    ]);

    const variantStockById = new Map(variants.map((v) => [v.id, v.stock]));
    const productStockById = new Map(products.map((p) => [p.id, p.stock]));

    const variantDrift = variantSums
      .filter((v) => v.variantId)
      .map((v) => ({
        variantId: v.variantId as string,
        cached: variantStockById.get(v.variantId as string) ?? 0,
        actual: v._sum.quantity ?? 0,
      }))
      .filter((d) => d.cached !== d.actual);

    const productDrift = productSums
      .filter((p) => p.productId)
      .map((p) => ({
        productId: p.productId as string,
        cached: productStockById.get(p.productId as string) ?? 0,
        actual: p._sum.quantity ?? 0,
      }))
      .filter((d) => d.cached !== d.actual);

    return { variantDrift, productDrift };
  }
}
