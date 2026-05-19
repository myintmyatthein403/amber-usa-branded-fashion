import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CargoShipment, Warehouse, Inventory, Prisma } from '@prisma/client';

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
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.inventory.findMany({
        where,
        include: {
          variant: { include: { product: true } },
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

  async findInventoryByVariant(variantId: string) {
    return this.prisma.inventory.findMany({
      where: { variantId },
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
      },
      orderBy: [
        { variant: { productId: 'asc' } },
        { warehouse: { location: 'asc' } },
      ],
    });
  }

  async findInventory(variantId: string, warehouseId: string) {
    return this.prisma.inventory.findUnique({
      where: {
        variantId_warehouseId: { variantId, warehouseId },
      },
    });
  }

  async upsertInventory(
    variantId: string,
    warehouseId: string,
    quantity: number,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const inventory = await tx.inventory.upsert({
        where: {
          variantId_warehouseId: { variantId, warehouseId },
        },
        update: { quantity },
        create: { variantId, warehouseId, quantity },
      });

      const totalStock = await tx.inventory.aggregate({
        where: { variantId },
        _sum: { quantity: true },
      });

      await tx.variant.update({
        where: { id: variantId },
        data: { stock: totalStock._sum.quantity || 0 },
      });

      return inventory;
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
    items: { variantId: string; quantity: number }[];
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
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: { include: { variant: true } },
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

  async updateCargoWithInventory(
    id: string,
    cargoData: Prisma.CargoShipmentUpdateInput,
    inventoryUpdates: Array<{
      variantId: string;
      warehouseId: string;
      quantity: number;
    }>,
  ) {
    return this.prisma.$transaction(async (tx) => {
      for (const update of inventoryUpdates) {
        await tx.inventory.upsert({
          where: {
            variantId_warehouseId: {
              variantId: update.variantId,
              warehouseId: update.warehouseId,
            },
          },
          update: { quantity: { increment: update.quantity } },
          create: {
            variantId: update.variantId,
            warehouseId: update.warehouseId,
            quantity: Math.max(0, update.quantity),
          },
        });

        const totalStock = await tx.inventory.aggregate({
          where: { variantId: update.variantId },
          _sum: { quantity: true },
        });

        await tx.variant.update({
          where: { id: update.variantId },
          data: { stock: totalStock._sum.quantity || 0 },
        });
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
}
