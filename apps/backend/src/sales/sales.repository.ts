import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Sale, Prisma } from '@prisma/client';

@Injectable()
export class SalesRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.SaleCreateInput): Promise<Sale> {
    return this.prisma.sale.create({
      data,
    });
  }

  async findAll(): Promise<Sale[]> {
    return this.prisma.sale.findMany({
      include: {
        products: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
          }
        },
      },
      orderBy: { createdAt: 'desc' },
    });
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
          }
        ],
      },
      include: {
        products: true,
      },
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

  async resetProductsInSale(saleId: string) {
    return this.prisma.product.updateMany({
      where: { saleId },
      data: { saleId: null, onSale: false }
    });
  }

  async updateProductsSaleAssociation(productIds: string[], saleId: string | null, onSale: boolean) {
    if (productIds.length === 0) return;
    return this.prisma.product.updateMany({
      where: { id: { in: productIds } },
      data: { saleId, onSale },
    });
  }

  async updateProductSale(productId: string, saleId: string | null, onSale: boolean) {
    return this.prisma.product.update({
      where: { id: productId },
      data: { saleId, onSale },
    });
  }
}
