import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CargoStatus } from '@prisma/client';

@Injectable()
export class LogisticsService {
  constructor(private prisma: PrismaService) {}

  // --- Warehouse Management ---
  async getAllWarehouses() {
    return this.prisma.warehouse.findMany({
      include: {
        _count: {
          select: { inventory: true }
        }
      }
    });
  }

  async createWarehouse(data: { name: string; location: string; address?: string }) {
    return this.prisma.warehouse.create({ data });
  }

  // --- Inventory Management ---
  async getInventoryByVariant(variantId: string) {
    return this.prisma.inventory.findMany({
      where: { variantId },
      include: { warehouse: true }
    });
  }

  async getInventoryByWarehouse(warehouseId: string) {
    return this.prisma.inventory.findMany({
      where: { warehouseId },
      include: { 
        variant: {
          include: { product: true }
        }
      }
    });
  }

  async updateStock(variantId: string, warehouseId: string, quantity: number) {
    // Upsert inventory record
    const inventory = await this.prisma.inventory.upsert({
      where: {
        variantId_warehouseId: { variantId, warehouseId }
      },
      update: { quantity },
      create: { variantId, warehouseId, quantity }
    });

    // Update global stock summary in Variant model
    const totalStock = await this.prisma.inventory.aggregate({
      where: { variantId },
      _sum: { quantity: true }
    });

    await this.prisma.variant.update({
      where: { id: variantId },
      data: { stock: totalStock._sum.quantity || 0 }
    });

    return inventory;
  }

  // --- Cargo Management ---
  async createCargoShipment(data: {
    originId: string;
    destinationId: string;
    carrier?: string;
    trackingNumber?: string;
    items: { variantId: string; quantity: number }[];
  }) {
    const shipmentNumber = `CARGO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    return this.prisma.cargoShipment.create({
      data: {
        shipmentNumber,
        originId: data.originId,
        destinationId: data.destinationId,
        carrier: data.carrier,
        trackingNumber: data.trackingNumber,
        items: {
          create: data.items.map(item => ({
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

  async updateCargoStatus(id: string, status: CargoStatus) {
    const shipment = await this.prisma.cargoShipment.findUnique({
      where: { id },
      include: { items: true, destination: true, origin: true }
    });

    if (!shipment) throw new NotFoundException('Shipment not found');

    // If status is moving to DEPARTED, ensure stock exists and deduct it from origin
    if (status === 'DEPARTED' && shipment.status === 'PREPARING') {
      for (const item of shipment.items) {
        const inventory = await this.prisma.inventory.findUnique({
          where: { variantId_warehouseId: { variantId: item.variantId, warehouseId: shipment.originId } }
        });

        if (!inventory || inventory.quantity < item.quantity) {
          throw new BadRequestException(`Insufficient stock for variant ${item.variantId} in origin warehouse`);
        }
      }

      // Deduct from origin
      for (const item of shipment.items) {
        await this.addStockToWarehouse(item.variantId, shipment.originId, -item.quantity);
      }
    }

    const updatedShipment = await this.prisma.cargoShipment.update({
      where: { id },
      data: { 
        status,
        arrivalDate: status === 'COMPLETED' ? new Date() : undefined,
        departureDate: status === 'DEPARTED' ? new Date() : undefined
      }
    });

    // If shipment is COMPLETED, move inventory to destination
    if (status === 'COMPLETED') {
      for (const item of shipment.items) {
        // Add to destination stock
        await this.addStockToWarehouse(item.variantId, shipment.destinationId, item.quantity);
      }
    }

    return updatedShipment;
  }

  async getInventoryOverview() {
    const inventory = await this.prisma.inventory.findMany({
      include: {
        warehouse: true,
        variant: {
          include: {
            product: true
          }
        }
      },
      orderBy: [
        { variant: { productId: 'asc' } },
        { warehouse: { location: 'asc' } }
      ]
    });

    return inventory;
  }

  private async addStockToWarehouse(variantId: string, warehouseId: string, addQty: number) {
    const current = await this.prisma.inventory.findUnique({
      where: { variantId_warehouseId: { variantId, warehouseId } }
    });

    const newQty = (current?.quantity || 0) + addQty;
    await this.updateStock(variantId, warehouseId, newQty);
  }

  async getAllCargoShipments() {
    return this.prisma.cargoShipment.findMany({
      include: {
        origin: true,
        destination: true,
        _count: { select: { items: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getCargoDetails(id: string) {
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
}
