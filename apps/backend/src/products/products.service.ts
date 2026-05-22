import { Injectable, NotFoundException } from '@nestjs/common';
import { Product, Prisma } from '@prisma/client';
import { ProductsRepository } from './products.repository';
import { AttributesService } from '../attributes/attributes.service';
import { sanitizeData } from '../common/utils/data-sanitizer';
import {
  CreateProductDto,
  UpdateProductDto,
  StockValidationItemDto,
} from './dto/product.dto';

export interface ProductListParams {
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  onSale?: boolean;
  categoryId?: string;
  brandId?: string;
  currencyCode?: string;
  market?: 'US' | 'MM';
  warehouseLocation?: 'USA' | 'MYANMAR';
  inStock?: boolean;
  priceMin?: number;
  priceMax?: number;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  attributeFilters?: Record<string, string>;
  page?: number;
  limit?: number;
  search?: string;
  publicOnly?: boolean;
}

@Injectable()
export class ProductsService {
  constructor(
    private productsRepository: ProductsRepository,
    private attributesService: AttributesService,
  ) {}

  private async normalizeVariants<T extends { attributeSelections?: unknown }>(
    variants?: T[],
  ): Promise<T[] | undefined> {
    if (!variants?.length) return variants;
    return Promise.all(
      variants.map(async (variant) => ({
        ...variant,
        attributeSelections: await this.attributesService.validateSelections(
          variant.attributeSelections as Record<string, string> | null,
        ),
      })),
    );
  }

  private buildWhere(params: ProductListParams): Prisma.ProductWhereInput {
    const where: Prisma.ProductWhereInput = {
      isFeatured: params.isFeatured,
      isNewArrival: params.isNewArrival,
      isBestSeller: params.isBestSeller,
      onSale: params.onSale,
      categoryId: params.categoryId,
      brandId: params.brandId,
    };

    if (params.publicOnly) {
      where.status = 'PUBLISHED';
    } else if (params.status) {
      where.status = params.status;
    }

    if (params.market) {
      const allowedVisibilities: any[] = ['BOTH'];
      if (params.market === 'US') {
        allowedVisibilities.push('USA');
      } else {
        allowedVisibilities.push('MYANMAR');
        allowedVisibilities.push('PRE_ORDER_ONLY');
      }
      where.visibility = { in: allowedVisibilities };
    }

    if (params.currencyCode) {
      where.currencyCode = params.currencyCode;
    }

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { slug: { contains: params.search, mode: 'insensitive' } },
        { shortDescription: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params.priceMin !== undefined || params.priceMax !== undefined) {
      where.price = {};
      if (params.priceMin !== undefined) {
        (where.price as Prisma.DecimalFilter).gte = params.priceMin;
      }
      if (params.priceMax !== undefined) {
        (where.price as Prisma.DecimalFilter).lte = params.priceMax;
      }
    }

    const variantFilters: Prisma.VariantWhereInput[] = [];

    if (params.inStock) {
      variantFilters.push({ stock: { gt: 0 } });
    }

    if (params.warehouseLocation) {
      variantFilters.push({
        inventory: {
          some: {
            quantity: { gt: 0 },
            warehouse: { location: params.warehouseLocation },
          },
        },
      });
    }

    if (params.attributeFilters) {
      for (const [attrId, valueId] of Object.entries(params.attributeFilters)) {
        if (!valueId || valueId === 'All') continue;
        variantFilters.push({
          attributeSelections: {
            path: [attrId],
            equals: valueId,
          },
        });
      }
    }

    if (variantFilters.length > 0) {
      where.variants = { some: { AND: variantFilters } };
    }

    return where;
  }

  async createProduct(data: CreateProductDto): Promise<Product> {
    const sanitizedData = sanitizeData(data);
    if (sanitizedData.variants) {
      sanitizedData.variants = (await this.normalizeVariants(
        sanitizedData.variants as CreateProductDto['variants'],
      )) as CreateProductDto['variants'];
    }
    return this.productsRepository.create(sanitizedData);
  }

  async getAllProducts(params: ProductListParams = {}) {
    const where = this.buildWhere(params);
    const { page, limit, search } = params;

    if (!page && !limit && !search && !params.publicOnly) {
      return this.productsRepository.findAllSimple(where);
    }

    const currentPage = Number(page) || 1;
    const currentLimit = Number(limit) || 20;
    const skip = (currentPage - 1) * currentLimit;

    const [data, total] = await this.productsRepository.findAll(
      where,
      skip,
      currentLimit,
    );

    return {
      data,
      meta: {
        total,
        page: currentPage,
        limit: currentLimit,
        totalPages: Math.ceil(total / currentLimit),
      },
    };
  }

  async getProductById(id: string, publicOnly = false): Promise<Product | null> {
    const product = await this.productsRepository.findById(id);
    if (!product) throw new NotFoundException('Product not found');
    if (publicOnly && product.status !== 'PUBLISHED') {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    const product = await this.productsRepository.findBySlug(slug);
    if (!product || product.status !== 'PUBLISHED') {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async updateProduct(
    id: string,
    data: UpdateProductDto,
    draft = false,
  ): Promise<Product> {
    const sanitizedData = sanitizeData(data);
    if (!draft && sanitizedData.variants) {
      sanitizedData.variants = (await this.normalizeVariants(
        sanitizedData.variants as UpdateProductDto['variants'],
      )) as UpdateProductDto['variants'];
    }
    return this.productsRepository.update(id, sanitizedData);
  }

  async deleteProduct(id: string): Promise<Product> {
    return this.productsRepository.delete(id);
  }

  async publishScheduled(): Promise<number> {
    return this.productsRepository.publishScheduled();
  }

  async validateStock(items: StockValidationItemDto[]) {
    const results = [];

    for (const item of items) {
      if (item.variantId) {
        const variant = await this.productsRepository.findVariantById(
          item.variantId,
        );

        if (!variant) {
          results.push({
            ...item,
            inStock: false,
            available: 0,
            error: 'Variant not found',
          });
          continue;
        }

        const isPreOrder =
          variant.isPreOrder ||
          variant.product.isPreOrder ||
          variant.product.visibility === 'PRE_ORDER_ONLY';
        if (isPreOrder) {
          results.push({ ...item, inStock: true, isPreOrder: true });
        } else {
          const warehouseStock = variant.inventory?.reduce(
            (sum, inv) => sum + inv.quantity,
            0,
          ) ?? variant.stock;
          results.push({
            ...item,
            inStock: warehouseStock >= item.quantity,
            available: warehouseStock,
            isPreOrder: false,
          });
        }
      } else {
        const product = await this.productsRepository.findProductSimpleById(
          item.productId,
        );

        if (!product) {
          results.push({
            ...item,
            inStock: false,
            available: 0,
            error: 'Product not found',
          });
          continue;
        }

        const isDigital = product.name.includes('Gift Card');

        results.push({
          ...item,
          inStock:
            isDigital ||
            product.isPreOrder ||
            product.visibility === 'PRE_ORDER_ONLY'
              ? true
              : product.stock >= item.quantity,
          available: product.stock,
          isPreOrder:
            product.isPreOrder || product.visibility === 'PRE_ORDER_ONLY',
          isDigital,
        });
      }
    }

    return results;
  }
}
