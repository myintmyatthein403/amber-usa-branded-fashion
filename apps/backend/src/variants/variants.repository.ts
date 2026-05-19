import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Variant, Prisma } from '@prisma/client';
import { CreateVariantDto, UpdateVariantDto } from './dto/variant.dto';

@Injectable()
export class VariantsRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateVariantDto): Promise<Variant> {
    const { warehouseId, ...variantData } = data as CreateVariantDto & {
      warehouseId?: string;
    };
    return this.prisma.$transaction(async (tx) => {
      const variant = await tx.variant.create({
        data: {
          ...variantData,
          stock: variantData.stock || 0,
        } as Prisma.VariantUncheckedCreateInput,
      });

      if (warehouseId && variant.stock > 0) {
        await tx.inventory.create({
          data: {
            variantId: variant.id,
            warehouseId: warehouseId,
            quantity: variant.stock,
          },
        });
      }

      return variant;
    });
  }

  async findAll(productId?: string): Promise<Variant[]> {
    if (productId) {
      return this.prisma.variant.findMany({
        where: { productId },
        orderBy: { size: 'asc' },
      });
    }
    return this.prisma.variant.findMany({
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.variant.findUnique({
      where: { id },
      include: { inventory: true, product: true },
    });
  }

  async update(id: string, data: UpdateVariantDto): Promise<Variant> {
    const { stock, ...rest } = data as UpdateVariantDto & { stock?: number };
    return this.prisma.variant.update({
      where: { id },
      data: {
        ...rest,
        ...(stock !== undefined ? { stock } : {}),
      } as Prisma.VariantUncheckedUpdateInput,
    });
  }

  async updateWithInventory(
    id: string,
    data: Partial<UpdateVariantDto>,
    inventoryId: string,
    stock: number,
  ): Promise<Variant> {
    return this.prisma.$transaction(async (tx) => {
      await tx.inventory.update({
        where: { id: inventoryId },
        data: { quantity: stock },
      });

      return tx.variant.update({
        where: { id },
        data: {
          ...data,
          stock,
        } as Prisma.VariantUncheckedUpdateInput,
      });
    });
  }

  async delete(id: string): Promise<Variant> {
    return this.prisma.variant.delete({ where: { id } });
  }
}
