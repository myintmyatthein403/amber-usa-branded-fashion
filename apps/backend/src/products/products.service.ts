import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Product, Prisma } from '@prisma/client';
import { ProductsRepository } from './products.repository';
import { AttributesService } from '../attributes/attributes.service';
import { LogisticsService } from '../logistics/logistics.service';
import { sanitizeData } from '../common/utils/data-sanitizer';
import {
  CreateProductDto,
  UpdateProductDto,
  StockValidationItemDto,
  ImportProductRowDto,
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
  includeInventory?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Allow-list: prevents arbitrary/unsafe field names reaching Prisma's
// orderBy from public, unauthenticated query params.
const SORTABLE_FIELDS = new Set([
  'createdAt',
  'price',
  'name',
  'isFeatured',
  'isNewArrival',
  'isBestSeller',
]);

@Injectable()
export class ProductsService {
  constructor(
    private productsRepository: ProductsRepository,
    private attributesService: AttributesService,
    private logisticsService: LogisticsService,
  ) {}

  private stripCostFields<T extends Record<string, unknown>>(product: T): T {
    const { cost, ...rest } = product as Record<string, unknown>;
    const variants = Array.isArray(rest.variants)
      ? rest.variants.map(({ buyPrice, ...v }: Record<string, unknown>) => v)
      : rest.variants;
    return { ...rest, variants } as unknown as T;
  }

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

    if (params.inStock) {
      where.AND = [
        ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
        {
          OR: [
            { variants: { some: { stock: { gt: 0 } } } },
            { variants: { none: {} }, stock: { gt: 0 } },
          ],
        },
      ];
    }

    const variantFilters: Prisma.VariantWhereInput[] = [];

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

    const sortBy =
      params.sortBy && SORTABLE_FIELDS.has(params.sortBy) ? params.sortBy : 'createdAt';
    const sortOrder = params.sortOrder === 'asc' ? 'asc' : 'desc';
    const options = {
      includeInventory: params.includeInventory,
      orderBy: { [sortBy]: sortOrder } as Prisma.ProductOrderByWithRelationInput,
    };

    if (!page && !limit && !search) {
      const data = await this.productsRepository.findAllSimple(where, options);
      return params.publicOnly
        ? data.map((p) => this.stripCostFields(p as unknown as Record<string, unknown>))
        : data;
    }

    const currentPage = Number(page) || 1;
    const currentLimit = Number(limit) || 20;
    const skip = (currentPage - 1) * currentLimit;

    const [data, total] = await this.productsRepository.findAll(
      where,
      skip,
      currentLimit,
      options,
    );

    return {
      data: params.publicOnly
        ? data.map((p) => this.stripCostFields(p as unknown as Record<string, unknown>))
        : data,
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
    return publicOnly
      ? this.stripCostFields(product as unknown as Record<string, unknown>) as unknown as Product
      : product;
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    const product = await this.productsRepository.findBySlug(slug);
    if (!product || product.status !== 'PUBLISHED') {
      throw new NotFoundException('Product not found');
    }
    return this.stripCostFields(product as unknown as Record<string, unknown>) as unknown as Product;
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

    if (sanitizedData.stock !== undefined) {
      const incomingVariants = sanitizedData.variants as
        | UpdateProductDto['variants']
        | undefined;
      const hasIncomingVariants =
        Array.isArray(incomingVariants) && incomingVariants.length > 0;

      if (!hasIncomingVariants) {
        const existingVariantCount = await this.productsRepository.countVariants(id);
        if (existingVariantCount === 0) {
          const inventoryCount = await this.productsRepository.countInventoryRows(id);
          if (inventoryCount > 1) {
            throw new BadRequestException(
              'Cannot update stock directly for products with multiple warehouse inventories. Use Logistics Management instead.',
            );
          }
          if (
            inventoryCount === 0 &&
            !sanitizedData.warehouseId &&
            !(sanitizedData.warehouseAllocations as unknown[] | undefined)?.length
          ) {
            throw new BadRequestException(
              'No inventory record found for this product. Please add stock via Logistics Management.',
            );
          }
        }
      }
    }

    return this.productsRepository.update(id, sanitizedData);
  }

  async deleteProduct(id: string): Promise<Product> {
    return this.productsRepository.delete(id);
  }

  async publishScheduled(): Promise<number> {
    return this.productsRepository.publishScheduled();
  }

  // Facet counts for the shop filter sidebar. Each dimension is counted
  // against a where-clause that excludes that same dimension's own filter,
  // so "Brand" counts reflect category/price/search/etc. already applied,
  // not the brand selection itself (standard faceted-search semantics).
  async getProductFacets(params: ProductListParams = {}) {
    const brandWhere = this.buildWhere({ ...params, brandId: undefined });
    const categoryWhere = this.buildWhere({ ...params, categoryId: undefined });

    const [brands, categories] = await Promise.all([
      this.productsRepository.countByBrand(brandWhere),
      this.productsRepository.countByCategory(categoryWhere),
    ]);

    return { brands, categories };
  }

  // Bulk import: updates existing variants matched by SKU (price, currency,
  // buy price, per-warehouse stock). Does not create new products/variants —
  // a flat CSV row can't safely supply category/slug/images, so rows whose
  // SKU doesn't already exist are reported as errors rather than guessed at.
  async importProducts(rows: ImportProductRowDto[], dryRun = false, userId?: string) {
    const errors: string[] = [];
    const validRows: Array<{ row: ImportProductRowDto; variantId: string }> = [];

    for (const row of rows) {
      const variant = await this.productsRepository.findVariantBySku(row.sku);
      if (!variant) {
        errors.push(
          `SKU not found: ${row.sku}. Import only updates existing variants; create the product first.`,
        );
        continue;
      }
      validRows.push({ row, variantId: variant.id });
    }

    if (dryRun || errors.length) {
      return {
        dryRun: true,
        preview: validRows.map((v) => v.row),
        errors,
      };
    }

    let warehousesByLocation: Record<string, string> | null = null;
    let imported = 0;

    for (const { row, variantId } of validRows) {
      const fieldUpdate: Prisma.VariantUpdateInput = {};
      if (row.price) fieldUpdate.price = Number(row.price);
      if (row.currencyCode) fieldUpdate.currencyCode = row.currencyCode;
      if (row.buyPrice) fieldUpdate.buyPrice = Number(row.buyPrice);
      if (Object.keys(fieldUpdate).length > 0) {
        await this.productsRepository.updateVariantFields(variantId, fieldUpdate);
      }

      if (row.stock && row.warehouseLocation) {
        if (!warehousesByLocation) {
          const warehouses = (await this.logisticsService.getAllWarehouses()) as Array<{
            id: string;
            location: string;
          }>;
          warehousesByLocation = Object.fromEntries(
            warehouses.map((w) => [w.location, w.id]),
          );
        }
        const warehouseId = warehousesByLocation[row.warehouseLocation];
        if (!warehouseId) {
          errors.push(
            `No warehouse found for location "${row.warehouseLocation}" (SKU ${row.sku})`,
          );
          continue;
        }
        await this.logisticsService.updateStock(
          { variantId },
          warehouseId,
          Number(row.stock),
          'RECEIVING',
          'Bulk CSV import',
          userId,
        );
      }

      imported++;
    }

    return { imported, errors };
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

        const isDigital = (product as { isDigital?: boolean }).isDigital ?? false;

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
