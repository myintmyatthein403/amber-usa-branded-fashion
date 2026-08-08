import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Product, Prisma, Variant } from '@prisma/client';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { recomputeAndSyncStock } from '../logistics/inventory-target.util';
type VariantInput = CreateProductDto['variants'][number] & {
  warehouseId?: string;
  warehouseAllocations?: Array<{ warehouseId: string; quantity: number }>;
};

@Injectable()
export class ProductsRepository {
  constructor(private prisma: PrismaService) {}

  private resolveCurrencyCode(
    currencyCode?: string,
    isUsdPrice?: boolean,
  ): string {
    if (currencyCode) return currencyCode;
    if (isUsdPrice === false) return 'MMK';
    return 'USD';
  }

  private buildVariantData(
    v: VariantInput,
    productId: string,
    productCurrency: string,
  ): Prisma.VariantCreateInput {
    const currencyCode =
      v.currencyCode ?? productCurrency;
    return {
      sku: v.sku,
      barcode: v.barcode,
      size: v.size,
      color: v.color,
      stock: 0,
      lowStockThreshold: Number(v.lowStockThreshold) || 5,
      buyPrice: v.buyPrice ? Number(v.buyPrice) : undefined,
      price: v.price ? Number(v.price) : undefined,
      compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : undefined,
      currencyCode,
      weight: Number(v.weight) || 0,
      images: v.images || [],
      isPreOrder: v.isPreOrder || false,
      preOrderShippingDate: v.preOrderShippingDate
        ? new Date(v.preOrderShippingDate)
        : undefined,
      attributeSelections: v.attributeSelections
        ? (v.attributeSelections as Prisma.InputJsonValue)
        : undefined,
      product: { connect: { id: productId } },
    };
  }

  private buildVariantUpdateData(
    v: VariantInput,
    productCurrency: string,
  ): Prisma.VariantUpdateInput {
    const data: Prisma.VariantUpdateInput = {
      sku: v.sku,
      barcode: v.barcode,
      size: v.size,
      color: v.color,
      lowStockThreshold: Number(v.lowStockThreshold) || 5,
      buyPrice: v.buyPrice ? Number(v.buyPrice) : undefined,
      price: v.price ? Number(v.price) : undefined,
      compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : undefined,
      currencyCode: v.currencyCode ?? productCurrency,
      weight: Number(v.weight) || 0,
      images: v.images || [],
      isPreOrder: v.isPreOrder || false,
      preOrderShippingDate: v.preOrderShippingDate
        ? new Date(v.preOrderShippingDate)
        : undefined,
    };
    if (v.attributeSelections !== undefined && v.attributeSelections !== null) {
      data.attributeSelections =
        v.attributeSelections as Prisma.InputJsonValue;
    } else if (v.attributeSelections === null) {
      data.attributeSelections = Prisma.JsonNull;
    }
    return data;
  }

  private async syncVariantInventory(
    tx: Prisma.TransactionClient,
    variantId: string,
    v: VariantInput,
  ): Promise<void> {
    const allocations =
      v.warehouseAllocations?.filter(
        (a: { warehouseId: string; quantity: number }) => a.quantity > 0,
      ) ?? [];

    if (allocations.length > 0) {
      await tx.inventory.deleteMany({ where: { variantId } });
      for (const alloc of allocations) {
        await tx.inventory.create({
          data: {
            variantId,
            warehouseId: alloc.warehouseId,
            quantity: alloc.quantity,
          },
        });
      }
    } else if (v.warehouseId && Number(v.stock) > 0) {
      const existing = await tx.inventory.findUnique({
        where: {
          variantId_warehouseId: {
            variantId,
            warehouseId: v.warehouseId,
          },
        },
      });
      if (existing) {
        await tx.inventory.update({
          where: { id: existing.id },
          data: { quantity: Number(v.stock) },
        });
      } else {
        await tx.inventory.create({
          data: {
            variantId,
            warehouseId: v.warehouseId,
            quantity: Number(v.stock),
          },
        });
      }
    } else if (Number(v.stock) > 0 && !allocations.length) {
      const wh =
        (await tx.warehouse.findFirst({ where: { location: 'USA' } })) ||
        (await tx.warehouse.findFirst());
      if (wh) {
        await tx.inventory.upsert({
          where: {
            variantId_warehouseId: { variantId, warehouseId: wh.id },
          },
          create: {
            variantId,
            warehouseId: wh.id,
            quantity: Number(v.stock),
          },
          update: { quantity: Number(v.stock) },
        });
      }
    }

    await recomputeAndSyncStock(tx, { variantId });
  }

  private async syncProductInventory(
    tx: Prisma.TransactionClient,
    productId: string,
    data: {
      stock?: number;
      warehouseId?: string;
      warehouseAllocations?: Array<{ warehouseId: string; quantity: number }>;
    },
  ): Promise<void> {
    const allocations =
      data.warehouseAllocations?.filter((a) => a.quantity > 0) ?? [];

    if (allocations.length > 0) {
      await tx.inventory.deleteMany({ where: { productId } });
      for (const alloc of allocations) {
        await tx.inventory.create({
          data: {
            productId,
            warehouseId: alloc.warehouseId,
            quantity: alloc.quantity,
          },
        });
      }
    } else if (data.warehouseId && Number(data.stock) > 0) {
      const existing = await tx.inventory.findUnique({
        where: {
          productId_warehouseId: {
            productId,
            warehouseId: data.warehouseId,
          },
        },
      });
      if (existing) {
        await tx.inventory.update({
          where: { id: existing.id },
          data: { quantity: Number(data.stock) },
        });
      } else {
        await tx.inventory.create({
          data: {
            productId,
            warehouseId: data.warehouseId,
            quantity: Number(data.stock),
          },
        });
      }
    } else if (Number(data.stock) > 0 && !allocations.length) {
      const wh =
        (await tx.warehouse.findFirst({ where: { location: 'USA' } })) ||
        (await tx.warehouse.findFirst());
      if (wh) {
        await tx.inventory.upsert({
          where: {
            productId_warehouseId: { productId, warehouseId: wh.id },
          },
          create: {
            productId,
            warehouseId: wh.id,
            quantity: Number(data.stock),
          },
          update: { quantity: Number(data.stock) },
        });
      }
    }

    await recomputeAndSyncStock(tx, { productId });
  }

  private sanitizeProductData(
    data: Record<string, unknown>,
  ): Record<string, unknown> {
    const currencyCode = this.resolveCurrencyCode(
      data.currencyCode as string | undefined,
      data.isUsdPrice as boolean | undefined,
    );
    return {
      ...data,
      currencyCode,
      isUsdPrice: currencyCode === 'USD',
      publishAt: data.publishAt ? new Date(data.publishAt as string) : undefined,
      expiryDate: data.expiryDate ? new Date(data.expiryDate as string) : undefined,
    };
  }

  async create(data: CreateProductDto): Promise<Product> {
    const {
      variants,
      collectionIds,
      categoryId,
      brandId,
      saleId,
      warehouseId,
      warehouseAllocations,
      ...productData
    } = data as CreateProductDto & {
      variants?: VariantInput[];
      collectionIds?: string[];
      warehouseId?: string;
      warehouseAllocations?: Array<{ warehouseId: string; quantity: number }>;
    };

    const sanitized = this.sanitizeProductData({
      ...productData,
      categoryId,
      brandId,
      saleId,
    } as Record<string, unknown>);
    const productCurrency = sanitized.currencyCode as string;

    const {
      category: _cat,
      brand: _br,
      variants: _v,
      collections: _c,
      ...createData
    } = sanitized;

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          ...createData,
          collections: collectionIds
            ? { connect: collectionIds.map((id: string) => ({ id })) }
            : undefined,
        } as Prisma.ProductCreateInput,
      });

      if (variants?.length) {
        for (const v of variants) {
          const variant = await tx.variant.create({
            data: this.buildVariantData(v, product.id, productCurrency),
          });
          await this.syncVariantInventory(tx, variant.id, v);
        }
      } else {
        await this.syncProductInventory(tx, product.id, {
          stock: createData.stock as number | undefined,
          warehouseId,
          warehouseAllocations,
        });
      }

      return tx.product.findUnique({
        where: { id: product.id },
        include: {
          category: true,
          brand: true,
          variants: { include: { inventory: { include: { warehouse: true } } } },
          sale: true,
          collections: true,
        },
      });
    }) as Promise<Product>;
  }

  // List/grid views never render per-warehouse inventory breakdown (only the
  // detail page and CSV export do), so the default list include skips the
  // variants -> inventory -> warehouse join entirely.
  private listInclude(includeInventory = false): Prisma.ProductInclude {
    return {
      category: true,
      brand: true,
      variants: includeInventory
        ? { include: { inventory: { include: { warehouse: true } } } }
        : true,
      sale: true,
      collections: true,
    };
  }

  async findAll(
    where: Prisma.ProductWhereInput,
    skip?: number,
    take?: number,
    options?: { includeInventory?: boolean; orderBy?: Prisma.ProductOrderByWithRelationInput },
  ): Promise<[Product[], number]> {
    return Promise.all([
      this.prisma.product.findMany({
        where,
        include: this.listInclude(options?.includeInventory),
        orderBy: options?.orderBy ?? { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.product.count({ where }),
    ]);
  }

  async findAllSimple(
    where: Prisma.ProductWhereInput,
    options?: { includeInventory?: boolean; orderBy?: Prisma.ProductOrderByWithRelationInput },
  ): Promise<Product[]> {
    return this.prisma.product.findMany({
      where,
      include: this.listInclude(options?.includeInventory),
      orderBy: options?.orderBy ?? { createdAt: 'desc' },
    });
  }

  // Reasonable cap on approved reviews returned with a product detail page —
  // previously unbounded, so a heavily-reviewed product could return hundreds
  // of reviews in a single payload.
  private static readonly REVIEWS_TAKE = 50;

  async findById(id: string): Promise<Product | null> {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        variants: { include: { inventory: { include: { warehouse: true } } } },
        sale: true,
        collections: true,
        reviews: {
          where: { isApproved: true },
          orderBy: { createdAt: 'desc' },
          take: ProductsRepository.REVIEWS_TAKE,
        },
      },
    });
  }

  async findBySlug(slug: string): Promise<Product | null> {
    return this.prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        brand: true,
        variants: { include: { inventory: { include: { warehouse: true } } } },
        sale: true,
        collections: true,
        reviews: {
          where: { isApproved: true },
          orderBy: { createdAt: 'desc' },
          take: ProductsRepository.REVIEWS_TAKE,
        },
      },
    });
  }

  async update(id: string, data: UpdateProductDto): Promise<Product> {
    const {
      variants,
      collectionIds,
      categoryId,
      brandId,
      saleId,
      warehouseId,
      warehouseAllocations,
      ...productData
    } = data as UpdateProductDto & {
      variants?: VariantInput[];
      collectionIds?: string[];
      warehouseId?: string;
      warehouseAllocations?: Array<{ warehouseId: string; quantity: number }>;
    };

    const sanitized = this.sanitizeProductData({
      ...productData,
      ...(categoryId !== undefined && { categoryId: categoryId || null }),
      ...(brandId !== undefined && { brandId: brandId || null }),
      ...(saleId !== undefined && { saleId: saleId || null }),
    } as Record<string, unknown>);
    const productCurrency = (sanitized.currencyCode as string) || 'USD';

    const { category: _cat2, brand: _br2, variants: _v2, ...updateData } =
      sanitized;

    return this.prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          ...updateData,
          collections: collectionIds
            ? { set: collectionIds.map((cid: string) => ({ id: cid })) }
            : undefined,
        } as Prisma.ProductUpdateInput,
      });

      if (variants) {
        const existingVariants = await tx.variant.findMany({
          where: { productId: id },
          select: { id: true },
        });
        const existingIds = existingVariants.map((ev) => ev.id);
        const incomingIds = variants.map((v) => v.id).filter(Boolean) as string[];
        let idsToDelete = existingIds.filter((eid) => !incomingIds.includes(eid));

        if (idsToDelete.length > 0) {
          const referenced = await tx.orderItem.findMany({
            where: { variantId: { in: idsToDelete } },
            select: { variantId: true },
          });
          const refIds = referenced.map((r) => r.variantId as string);
          idsToDelete = idsToDelete.filter((did) => !refIds.includes(did));
        }

        if (idsToDelete.length > 0) {
          await tx.variant.deleteMany({ where: { id: { in: idsToDelete } } });
        }

        for (const v of variants) {
          const variantData = this.buildVariantUpdateData(v, productCurrency);

          if (v.id && existingIds.includes(v.id)) {
            await tx.variant.update({
              where: { id: v.id },
              data: variantData,
            });
            await this.syncVariantInventory(tx, v.id, v);
          } else {
            const newVariant = await tx.variant.create({
              data: this.buildVariantData(v, id, productCurrency),
            });
            await this.syncVariantInventory(tx, newVariant.id, v);
          }
        }

        const remainingVariantCount = await tx.variant.count({
          where: { productId: id },
        });
        if (remainingVariantCount === 0) {
          await this.syncProductInventory(tx, id, {
            stock: updateData.stock as number | undefined,
            warehouseId,
            warehouseAllocations,
          });
        }
      } else {
        const existingVariantCount = await tx.variant.count({
          where: { productId: id },
        });
        if (existingVariantCount === 0) {
          await this.syncProductInventory(tx, id, {
            stock: updateData.stock as number | undefined,
            warehouseId,
            warehouseAllocations,
          });
        }
      }

      return tx.product.findUnique({
        where: { id },
        include: {
          category: true,
          brand: true,
          variants: { include: { inventory: { include: { warehouse: true } } } },
          sale: true,
          collections: true,
        },
      });
    }) as Promise<Product>;
  }

  async delete(id: string): Promise<Product> {
    return this.prisma.product.delete({ where: { id } });
  }

  async findVariantById(id: string) {
    return this.prisma.variant.findUnique({
      where: { id },
      include: { product: true, inventory: true },
    });
  }

  async findVariantBySku(sku: string) {
    return this.prisma.variant.findUnique({ where: { sku } });
  }

  async updateVariantFields(
    id: string,
    data: Prisma.VariantUpdateInput,
  ): Promise<Variant> {
    return this.prisma.variant.update({ where: { id }, data });
  }

  async findProductSimpleById(id: string) {
    return this.prisma.product.findUnique({ where: { id } });
  }

  async countVariants(productId: string): Promise<number> {
    return this.prisma.variant.count({ where: { productId } });
  }

  async countInventoryRows(productId: string): Promise<number> {
    return this.prisma.inventory.count({ where: { productId } });
  }

  async publishScheduled(): Promise<number> {
    const result = await this.prisma.product.updateMany({
      where: {
        status: 'DRAFT',
        publishAt: { lte: new Date() },
      },
      data: { status: 'PUBLISHED' },
    });
    return result.count;
  }

  async countByBrand(
    where: Prisma.ProductWhereInput,
  ): Promise<Array<{ id: string; name: string; count: number }>> {
    const groups = await this.prisma.product.groupBy({
      by: ['brandId'],
      where,
      _count: { _all: true },
    });
    const brandIds = groups
      .map((g) => g.brandId)
      .filter((id): id is string => Boolean(id));
    if (brandIds.length === 0) return [];

    const brands = await this.prisma.brand.findMany({
      where: { id: { in: brandIds } },
      select: { id: true, name: true },
    });
    const nameById = new Map(brands.map((b) => [b.id, b.name]));

    return groups
      .filter((g): g is typeof g & { brandId: string } => Boolean(g.brandId))
      .map((g) => ({
        id: g.brandId,
        name: nameById.get(g.brandId) ?? 'Unknown',
        count: g._count._all,
      }));
  }

  async countByCategory(
    where: Prisma.ProductWhereInput,
  ): Promise<Array<{ id: string; name: string; count: number }>> {
    const groups = await this.prisma.product.groupBy({
      by: ['categoryId'],
      where,
      _count: { _all: true },
    });
    const categoryIds = groups
      .map((g) => g.categoryId)
      .filter((id): id is string => Boolean(id));
    if (categoryIds.length === 0) return [];

    const categories = await this.prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    });
    const nameById = new Map(categories.map((c) => [c.id, c.name]));

    return groups
      .filter((g): g is typeof g & { categoryId: string } => Boolean(g.categoryId))
      .map((g) => ({
        id: g.categoryId,
        name: nameById.get(g.categoryId) ?? 'Unknown',
        count: g._count._all,
      }));
  }
}
