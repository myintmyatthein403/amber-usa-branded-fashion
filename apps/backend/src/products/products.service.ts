import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Product, Prisma } from '@prisma/client';
import { ProductsRepository } from './products.repository';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private productsRepository: ProductsRepository
  ) {}

  async createProduct(data: any): Promise<Product> {
    const sanitizedData = this.prisma.sanitizeData(data);
    return this.productsRepository.create(sanitizedData);
  }

  async getAllProducts(params: {
    isFeatured?: boolean;
    isNewArrival?: boolean;
    isBestSeller?: boolean;
    onSale?: boolean;
    categoryId?: string;
    brandId?: string;
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<any> {
    const { 
      isFeatured, 
      isNewArrival, 
      isBestSeller, 
      onSale, 
      categoryId, 
      brandId,
      page,
      limit,
      search
    } = params;
    
    const where: Prisma.ProductWhereInput = {
      isFeatured,
      isNewArrival,
      isBestSeller,
      onSale,
      categoryId,
      brandId,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (!page && !limit && !search) {
      return this.productsRepository.findAllSimple(where);
    }
    
    const currentPage = Number(page) || 1;
    const currentLimit = Number(limit) || 20;
    const skip = (currentPage - 1) * currentLimit;
    
    const [data, total] = await this.productsRepository.findAll(where, skip, currentLimit);

    return {
      data,
      meta: {
        total,
        page: currentPage,
        limit: currentLimit,
        totalPages: Math.ceil(total / currentLimit),
      }
    };
  }

  async getProductById(id: string): Promise<Product | null> {
    const product = await this.productsRepository.findById(id);
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async updateProduct(id: string, data: any): Promise<Product> {
    const sanitizedData = this.prisma.sanitizeData(data);
    return this.productsRepository.update(id, sanitizedData);
  }

  async deleteProduct(id: string): Promise<Product> {
    return this.productsRepository.delete(id);
  }

  async validateStock(items: Array<{ productId: string; variantId?: string; quantity: number }>) {
    const results = [];

    for (const item of items) {
      if (item.variantId) {
        const variant = await this.productsRepository.findVariantById(item.variantId);

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
        const product = await this.productsRepository.findProductSimpleById(item.productId);

        if (!product) {
          results.push({ ...item, inStock: false, available: 0, error: 'Product not found' });
          continue;
        }

        const isDigital = product.name.includes('Gift Card');
        
        results.push({
          ...item,
          inStock: isDigital || product.isPreOrder ? true : (product.stock >= item.quantity),
          available: product.stock,
          isPreOrder: product.isPreOrder,
          isDigital
        });
      }
    }

    return results;
  }
}
