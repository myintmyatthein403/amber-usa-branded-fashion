import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Product, Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async createProduct(data: Prisma.ProductCreateInput): Promise<Product> {
    return this.prisma.product.create({
      data,
    });
  }

  async getAllProducts(params: {
    isFeatured?: boolean;
    isNewArrival?: boolean;
    isBestSeller?: boolean;
    onSale?: boolean;
    categoryId?: string;
    brandId?: string;
  } = {}): Promise<Product[]> {
    const { isFeatured, isNewArrival, isBestSeller, onSale, categoryId, brandId } = params;
    
    return this.prisma.product.findMany({
      where: {
        isFeatured,
        isNewArrival,
        isBestSeller,
        onSale,
        categoryId,
        brandId,
      },
      include: {
        category: true,
        brand: true,
        variants: true,
        sale: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getProductById(id: string): Promise<Product | null> {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        variants: true,
        sale: true,
        reviews: {
          where: { isApproved: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async updateProduct(id: string, data: Prisma.ProductUpdateInput): Promise<Product> {
    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  async deleteProduct(id: string): Promise<Product> {
    return this.prisma.product.delete({
      where: { id },
    });
  }
}
