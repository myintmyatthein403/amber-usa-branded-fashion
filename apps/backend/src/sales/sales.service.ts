import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Sale, Prisma } from '@prisma/client';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async createSale(data: Prisma.SaleCreateInput & { productIds?: string[] }): Promise<Sale> {
    const sanitizedData = this.prisma.sanitizeData(data);
    const { productIds, ...saleData } = sanitizedData;
    const sale = await this.prisma.sale.create({
      data: saleData as Prisma.SaleCreateInput,
    });

    if (productIds && productIds.length > 0) {
      await this.syncProducts(sale.id, productIds);
    }

    return sale;
  }

  async getAllSales(): Promise<Sale[]> {
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

  async getActiveSales(): Promise<Sale[]> {
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

  async getSaleById(id: string): Promise<Sale | null> {
    return this.prisma.sale.findUnique({
      where: { id },
      include: {
        products: true,
      },
    });
  }

  async updateSale(id: string, data: Prisma.SaleUpdateInput & { productIds?: string[] }): Promise<Sale> {
    const sanitizedData = this.prisma.sanitizeData(data);
    const { productIds, ...saleData } = sanitizedData;
    const sale = await this.prisma.sale.update({
      where: { id },
      data: saleData as Prisma.SaleUpdateInput,
    });

    if (productIds) {
      await this.syncProducts(id, productIds);
    }

    return sale;
  }

  async deleteSale(id: string): Promise<Sale> {
    // Before deleting, reset product onSale status
    await this.prisma.product.updateMany({
      where: { saleId: id },
      data: { saleId: null, onSale: false }
    });
    
    return this.prisma.sale.delete({
      where: { id },
    });
  }

  async syncProducts(saleId: string, productIds: string[]) {
    // 1. Remove sale association from all products currently in this sale
    await this.prisma.product.updateMany({
      where: { saleId: saleId },
      data: { saleId: null, onSale: false },
    });

    // 2. Add sale association to new products
    if (productIds.length > 0) {
      await this.prisma.product.updateMany({
        where: { id: { in: productIds } },
        data: { saleId: saleId, onSale: true },
      });
    }
  }

  async addProductToSale(saleId: string, productId: string) {
    return this.prisma.product.update({
      where: { id: productId },
      data: {
        saleId: saleId,
        onSale: true,
      },
    });
  }

  async removeProductFromSale(productId: string) {
    return this.prisma.product.update({
      where: { id: productId },
      data: {
        saleId: null,
        onSale: false,
      },
    });
  }
}
