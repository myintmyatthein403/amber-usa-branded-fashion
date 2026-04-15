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

  async validateStock(items: Array<{ productId: string; variantId?: string; quantity: number }>) {
    const results = [];

    for (const item of items) {
      if (item.variantId) {
        const variant = await this.prisma.variant.findUnique({
          where: { id: item.variantId },
          include: { product: true }
        });

        if (!variant) {
          results.push({ ...item, inStock: false, available: 0, error: 'Variant not found' });
          continue;
        }

        const isPreOrder = variant.isPreOrder || variant.product.isPreOrder;
        if (isPreOrder) {
          results.push({ ...item, inStock: true, isPreOrder: true });
        } else {
          results.push({
            ...item,
            inStock: variant.stock >= item.quantity,
            available: variant.stock,
            isPreOrder: false
          });
        }
      } else {
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId }
        });

        if (!product) {
          results.push({ ...item, inStock: false, available: 0, error: 'Product not found' });
          continue;
        }

        // For digital items (Gift Cards), category is 'Gift Card' and they don't have variants in this system
        // We assume they are always in stock.
        const isDigital = product.name.includes('Gift Card'); // Simple check for now
        
        results.push({
          ...item,
          inStock: isDigital || product.isPreOrder ? true : true, // Default to true for now if no variant
          isPreOrder: product.isPreOrder,
          isDigital
        });
      }
    }

    return results;
  }
}
