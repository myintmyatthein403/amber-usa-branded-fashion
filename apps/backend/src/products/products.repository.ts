import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Product, Prisma, Variant } from '@prisma/client';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
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
      v.warehouseAllocations?.filter((a) => a.quantity > 0) ?? [];

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

    const total = await tx.inventory.aggregate({
      where: { variantId },
      _sum: { quantity: true },
    });
    await tx.variant.update({
      where: { id: variantId },
      data: { stock: total._sum.quantity ?? 0 },
    });
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
    };
  }

  async create(data: CreateProductDto): Promise<Product> {
    const {
      variants,
      collectionIds,
      categoryId,
      brandId,
      saleId,
      ...productData
    } = data as CreateProductDto & {
      variants?: VariantInput[];
      collectionIds?: string[];
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

  async findAll(
    where: Prisma.ProductWhereInput,
    skip?: number,
    take?: number,
  ): Promise<[Product[], number]> {
    return Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: true,
          brand: true,
          variants: { include: { inventory: { include: { warehouse: true } } } },
          sale: true,
          collections: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.product.count({ where }),
    ]);
  }

  async findAllSimple(where: Prisma.ProductWhereInput): Promise<Product[]> {
    return this.prisma.product.findMany({
      where,
      include: {
        category: true,
        brand: true,
        variants: { include: { inventory: { include: { warehouse: true } } } },
        sale: true,
        collections: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

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
      ...productData
    } = data as UpdateProductDto & {
      variants?: VariantInput[];
      collectionIds?: string[];
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

  async findProductSimpleById(id: string) {
    return this.prisma.product.findUnique({ where: { id } });
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
}
