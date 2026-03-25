import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class VariantsService {
  constructor(private prisma: PrismaService) {}

  async createVariant(data: any) {
    const { warehouseId, ...variantData } = data;
    
    const variant = await this.prisma.variant.create({ 
      data: {
        ...variantData,
        stock: variantData.stock || 0
      }
    });

    // If a warehouse was selected, create the initial inventory record
    if (warehouseId && variant.stock > 0) {
      await this.prisma.inventory.create({
        data: {
          variantId: variant.id,
          warehouseId: warehouseId,
          quantity: variant.stock
        }
      });
    }

    return variant;
  }

  async getAllVariants(productId?: string) {
    if (productId) {
      return this.prisma.variant.findMany({ where: { productId } });
    }
    return this.prisma.variant.findMany({ include: { product: true } });
  }

  async updateVariant(id: string, data: Prisma.VariantUpdateInput) {
    return this.prisma.variant.update({ where: { id }, data });
  }

  async deleteVariant(id: string) {
    return this.prisma.variant.delete({ where: { id } });
  }
}
