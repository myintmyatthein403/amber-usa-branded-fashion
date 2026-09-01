import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PriceTier } from '@prisma/client';

@Injectable()
export class PriceTiersRepository {
  constructor(private prisma: PrismaService) {}

  async findForTarget(target: { productId?: string; variantId?: string }): Promise<PriceTier[]> {
    return this.prisma.priceTier.findMany({
      where: target,
      orderBy: { minQuantity: 'asc' },
    });
  }

  async create(data: {
    productId?: string;
    variantId?: string;
    minQuantity: number;
    price: number;
    currencyCode?: string;
  }): Promise<PriceTier> {
    return this.prisma.priceTier.create({ data });
  }

  async delete(id: string): Promise<PriceTier> {
    return this.prisma.priceTier.delete({ where: { id } });
  }

  // The best-matching tier is the one with the highest minQuantity that
  // doesn't exceed the ordered quantity — e.g. tiers at 10/25/50 units and
  // an order of 30 units matches the 25-unit tier, not 10 or 50.
  async findApplicableTier(
    target: { productId?: string; variantId?: string },
    quantity: number,
    currencyCode: string,
  ): Promise<PriceTier | null> {
    return this.prisma.priceTier.findFirst({
      where: { ...target, minQuantity: { lte: quantity }, currencyCode },
      orderBy: { minQuantity: 'desc' },
    });
  }

  // Batched lookup for checkout: fetches every tier row for the whole cart's
  // variant/product IDs in one query, letting callers pick the best match
  // per line item in-memory instead of one findFirst per item.
  async findManyForTargets(
    variantIds: string[],
    productIds: string[],
  ): Promise<PriceTier[]> {
    if (variantIds.length === 0 && productIds.length === 0) return [];
    return this.prisma.priceTier.findMany({
      where: {
        OR: [
          ...(variantIds.length ? [{ variantId: { in: variantIds } }] : []),
          ...(productIds.length ? [{ productId: { in: productIds } }] : []),
        ],
      },
    });
  }
}
