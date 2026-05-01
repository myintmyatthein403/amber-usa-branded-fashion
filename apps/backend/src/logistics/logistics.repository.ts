import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Warehouse, Inventory, CargoShipment, CargoStatus, Prisma } from '@prisma/client';

@Injectable()
export class LogisticsRepository {
  constructor(private prisma: PrismaService) {}

  // --- Warehouse ---
  async findAllWarehouses() {
    return this.prisma.warehouse.findMany({
      include: {
        _count: {
          select: { inventory: true }
        }
      }
    });
  }

  async createWarehouse(data: Prisma.WarehouseCreateInput): Promise<Warehouse> {
    return this.prisma.warehouse.create({ data });
  }

  async findWarehouseById(id: string): Promise<Warehouse | null> {
    return this.prisma.warehouse.findUnique({ where: { id } });
  }

  // --- Inventory ---
  async findAllInventoryWithDetails() {
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
  }

  async findInventoryByVariant(variantId: string) {
    return this.prisma.inventory.findMany({
      where: { variantId },
      include: { warehouse: true }
    });
  }

  async findInventoryByWarehouse(warehouseId: string) {
    return this.prisma.inventory.findMany({
      where: { warehouseId },
      include: { 
        variant: {
          include: { product: true }
        }
      }
    });
  }

  async findInventory(variantId: string, warehouseId: string) {
    return this.prisma.inventory.findUnique({
      where: {
        variantId_warehouseId: { variantId, warehouseId }
      }
    });
  }

  async upsertInventory(variantId: string, warehouseId: string, quantity: number) {
    return this.prisma.$transaction(async (tx) => {
      const inventory = await tx.inventory.upsert({
        where: {
          variantId_warehouseId: { variantId, warehouseId }
        },
        update: { quantity },
        create: { variantId, warehouseId, quantity }
      });

      // Update global stock summary in Variant model
      const totalStock = await tx.inventory.aggregate({
        where: { variantId },
        _sum: { quantity: true }
      });

      await tx.variant.update({
        where: { id: variantId },
        data: { stock: totalStock._sum.quantity || 0 }
      });

      return inventory;
    });
  }

  // --- Cargo ---
  async createCargoShipment(data: any): Promise<CargoShipment> {
    return this.prisma.cargoShipment.create({
      data: {
        shipmentNumber: data.shipmentNumber,
        originId: data.originId,
        destinationId: data.destinationId,
        carrier: data.carrier,
        trackingNumber: data.trackingNumber,
        notes: data.notes,
        items: {
          create: data.items.map((item: any) => ({
            variantId: item.variantId,
            quantity: item.quantity
          }))
        }
      },
      include: {
        items: { include: { variant: true } },
        origin: true,
        destination: true
      }
    });
  }

  async findAllCargoShipments() {
    return this.prisma.cargoShipment.findMany({
      include: {
        origin: true,
        destination: true,
        _count: { select: { items: true } }
      },
      orderBy: { createdAt: 'desc' }
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
              include: { product: true }
            }
          }
        }
      }
    });
  }

  async updateCargo(id: string, data: Prisma.CargoShipmentUpdateInput) {
    return this.prisma.cargoShipment.update({
      where: { id },
      data,
      include: {
        items: true,
        origin: true,
        destination: true
      }
    });
  }

  async updateCargoWithInventory(
    id: string, 
    cargoData: Prisma.CargoShipmentUpdateInput,
    inventoryUpdates: Array<{ variantId: string; warehouseId: string; quantity: number }>
  ) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Update Inventory
      for (const update of inventoryUpdates) {
        await tx.inventory.upsert({
          where: {
            variantId_warehouseId: { 
              variantId: update.variantId, 
              warehouseId: update.warehouseId 
            }
          },
          update: { quantity: { increment: update.quantity } },
          create: { 
            variantId: update.variantId, 
            warehouseId: update.warehouseId, 
            quantity: Math.max(0, update.quantity) 
          }
        });

        // Update Variant global stock
        const totalStock = await tx.inventory.aggregate({
          where: { variantId: update.variantId },
          _sum: { quantity: true }
        });

        await tx.variant.update({
          where: { id: update.variantId },
          data: { stock: totalStock._sum.quantity || 0 }
        });
      }

      // 2. Update Cargo Shipment
      return tx.cargoShipment.update({
        where: { id },
        data: cargoData,
        include: {
          items: true,
          origin: true,
          destination: true
        }
      });
    });
  }
}
