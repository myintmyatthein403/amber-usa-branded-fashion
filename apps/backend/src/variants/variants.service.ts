import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class VariantsService {
  constructor(private prisma: PrismaService) {}

  async createVariant(data: any) {
    const sanitizedData = this.prisma.sanitizeData(data);
    const { warehouseId, ...variantData } = sanitizedData;
    
    // Use transaction to ensure data integrity (Finding 2)
    return this.prisma.$transaction(async (tx) => {
      const variant = await tx.variant.create({ 
        data: {
          ...variantData,
          stock: variantData.stock || 0
        }
      });

      // If a warehouse was selected, create the initial inventory record
      if (warehouseId && variant.stock > 0) {
        await tx.inventory.create({
          data: {
            variantId: variant.id,
            warehouseId: warehouseId,
            quantity: variant.stock
          }
        });
      }

      return variant;
    });
  }

  async getAllVariants(productId?: string) {
    if (productId) {
      return this.prisma.variant.findMany({ where: { productId } });
    }
    return this.prisma.variant.findMany({ include: { product: true } });
  }

  async updateVariant(id: string, data: any) {
    const sanitizedData = this.prisma.sanitizeData(data);
    const { stock, ...rest } = sanitizedData;

    return this.prisma.$transaction(async (tx) => {
      const variant = await tx.variant.findUnique({ 
        where: { id },
        include: { inventory: true }
      });

      if (!variant) throw new NotFoundException('Variant not found');

      // If stock is being updated directly, we need to decide how to reconcile with Inventory.
      // For simplicity and to satisfy Finding 1, we prevent direct stock updates 
      // or at least ensure they are handled via Logistics if multiple warehouses exist.
      // If the variant only has one inventory record, we can update it.
      if (stock !== undefined) {
        if (variant.inventory.length > 1) {
          throw new BadRequestException('Cannot update stock directly for variants with multiple warehouse inventories. Use Logistics Management instead.');
        }

        if (variant.inventory.length === 1) {
          await tx.inventory.update({
            where: { id: variant.inventory[0].id },
            data: { quantity: stock }
          });
        } else {
          // If no inventory records exist but stock is provided, 
          // we might want to create a default inventory record if we knew which warehouse.
          // For now, just allow updating the cached stock field but warn it's not ideal.
          // Better: block it and force logistics.
          throw new BadRequestException('No inventory record found for this variant. Please add stock via Logistics Management.');
        }
      }

      return tx.variant.update({ 
        where: { id }, 
        data: {
          ...rest,
          ...(stock !== undefined ? { stock } : {})
        } 
      });
    });
  }

  async deleteVariant(id: string) {
    return this.prisma.variant.delete({ where: { id } });
  }
}
