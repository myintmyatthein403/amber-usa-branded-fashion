import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Sale, DiscountType, Prisma } from '@prisma/client';

@Injectable()
export class SalesRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.SaleCreateInput): Promise<Sale> {
    return this.prisma.sale.create({
      data,
    });
  }

  async findAll(options?: { page?: number; limit?: number; search?: string }) {
    const { page = 1, limit = 10, search } = options || {};
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.sale.findMany({
        where,
        include: {
          products: {
            select: {
              id: true,
              name: true,
              price: true,
              images: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.sale.count({ where }),
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

  async findActive() {
    const now = new Date();
    return this.prisma.sale.findMany({
      where: {
        isActive: true,
        OR: [
          {
            startDate: { lte: now },
            endDate: { gte: now },
          },
          {
            startDate: null,
            endDate: null,
          },
          {
            startDate: { lte: now },
            endDate: null,
          },
        ],
      },
      include: {
        products: true,
      },
    });
  }

  // All time-boxed sales (has a startDate or endDate) — the scheduler only
  // needs to sweep these; open-ended sales' pricing is instead applied
  // immediately when a product is associated (see applySalePricing below).
  async findTimeBoxed(): Promise<Sale[]> {
    return this.prisma.sale.findMany({
      where: { OR: [{ startDate: { not: null } }, { endDate: { not: null } }] },
      include: { products: { select: { id: true, onSale: true } } },
    });
  }

  async findById(id: string): Promise<Sale | null> {
    return this.prisma.sale.findUnique({
      where: { id },
      include: {
        products: true,
      },
    });
  }

  async update(id: string, data: Prisma.SaleUpdateInput): Promise<Sale> {
    return this.prisma.sale.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Sale> {
    return this.prisma.sale.delete({
      where: { id },
    });
  }

  isSaleWindowActive(
    sale: Pick<Sale, 'isActive' | 'startDate' | 'endDate'>,
    now: Date = new Date(),
  ): boolean {
    if (!sale.isActive) return false;
    if (sale.startDate && sale.startDate > now) return false;
    if (sale.endDate && sale.endDate < now) return false;
    return true;
  }

  private computeSalePrice(
    basePrice: Prisma.Decimal | number,
    discountType: DiscountType,
    discountValue: Prisma.Decimal | number | null,
  ): number {
    const base = Number(basePrice);
    const value = Number(discountValue ?? 0);
    if (discountType === 'PERCENTAGE') {
      return Math.max(0, Math.round(base * (1 - value / 100) * 100) / 100);
    }
    if (discountType === 'FIXED_AMOUNT') {
      return Math.max(0, Math.round((base - value) * 100) / 100);
    }
    // BUY_X_GET_Y / FREE_SHIPPING are cart-level coupon concepts, not a flat
    // product-price discount — a Sale using either just doesn't discount price.
    return base;
  }

  // Snapshots the pre-sale price into compareAtPrice (Sale display's
  // existing "original price" field) and writes the discounted price —
  // idempotent: a product already onSale is left untouched, so calling this
  // repeatedly (e.g. every scheduler tick) never double-discounts.
  async applySalePricing(productId: string, sale: Sale): Promise<void> {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product || product.onSale) return;

    const newPrice = this.computeSalePrice(product.price, sale.discountType, sale.discountValue);
    await this.prisma.product.update({
      where: { id: productId },
      data: { compareAtPrice: product.price, price: newPrice, onSale: true },
    });
  }

  // Restores the pre-sale price from compareAtPrice and clears the sale
  // pricing flag. Idempotent for the same reason as applySalePricing.
  async revertSalePricing(productId: string): Promise<void> {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.onSale) return;

    if (product.compareAtPrice != null) {
      await this.prisma.product.update({
        where: { id: productId },
        data: { price: product.compareAtPrice, compareAtPrice: null, onSale: false },
      });
    } else {
      await this.prisma.product.update({
        where: { id: productId },
        data: { onSale: false },
      });
    }
  }

  async resetProductsInSale(saleId: string) {
    const products = await this.prisma.product.findMany({
      where: { saleId },
      select: { id: true },
    });
    for (const p of products) {
      await this.revertSalePricing(p.id);
    }
    return this.prisma.product.updateMany({
      where: { saleId },
      data: { saleId: null, onSale: false },
    });
  }

  async updateProductsSaleAssociation(
    productIds: string[],
    saleId: string | null,
    onSale: boolean,
    sale?: Sale,
  ) {
    if (productIds.length === 0) return;
    await this.prisma.product.updateMany({
      where: { id: { in: productIds } },
      data: { saleId },
    });
    if (onSale && sale && this.isSaleWindowActive(sale)) {
      for (const productId of productIds) {
        await this.applySalePricing(productId, sale);
      }
    } else if (!onSale) {
      for (const productId of productIds) {
        await this.revertSalePricing(productId);
      }
    }
  }

  async updateProductSale(
    productId: string,
    saleId: string | null,
    onSale: boolean,
    sale?: Sale,
  ) {
    await this.prisma.product.update({
      where: { id: productId },
      data: { saleId },
    });
    if (onSale && sale && this.isSaleWindowActive(sale)) {
      await this.applySalePricing(productId, sale);
    } else if (!onSale) {
      await this.revertSalePricing(productId);
    }
    return this.prisma.product.findUnique({ where: { id: productId } });
  }
}
