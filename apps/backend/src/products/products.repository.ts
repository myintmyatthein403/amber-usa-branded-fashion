import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Product, Prisma, Variant } from '@prisma/client';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

type VariantInput = CreateProductDto['variants'][number];

@Injectable()
export class ProductsRepository {
  constructor(private prisma: PrismaService) {}

  private buildVariantData(
    v: VariantInput,
    productId: string,
  ): Prisma.VariantCreateInput {
    return {
      sku: v.sku,
      barcode: v.barcode,
      size: v.size,
      color: v.color,
      stock: Number(v.stock) || 0,
      lowStockThreshold: Number(v.lowStockThreshold) || 5,
      price: v.price ? Number(v.price) : undefined,
      compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : undefined,
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

  private buildVariantUpdateData(v: VariantInput): Prisma.VariantUpdateInput {
    const data: Prisma.VariantUpdateInput = {
      sku: v.sku,
      barcode: v.barcode,
      size: v.size,
      color: v.color,
      stock: Number(v.stock) || 0,
      lowStockThreshold: Number(v.lowStockThreshold) || 5,
      price: v.price ? Number(v.price) : undefined,
      compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : undefined,
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

  async create(data: CreateProductDto): Promise<Product> {
    const {
      variants,
      collectionIds,
      categoryId,
      brandId,
      saleId,
      ...productData
    } = data as CreateProductDto & {
      variants?: unknown[];
      collectionIds?: string[];
    };

    const sanitizedData: Record<string, unknown> = { ...productData };
    if (categoryId != null) sanitizedData.categoryId = categoryId;
    if (brandId != null) sanitizedData.brandId = brandId;
    if (saleId != null) sanitizedData.saleId = saleId;

    const {
      category,
      brand,
      variants: _v,
      collections: _c,
      ...createData
    } = sanitizedData;

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          ...createData,
          collections: collectionIds
            ? {
                connect: collectionIds.map((id: string) => ({ id })),
              }
            : undefined,
        } as any,
      });

      if (variants && (variants as unknown[]).length > 0) {
        const defaultWarehouse =
          (await tx.warehouse.findFirst({
            where: { location: 'USA' },
          })) || (await tx.warehouse.findFirst());

        for (const v of variants as CreateProductDto['variants']) {
          const variant = await tx.variant.create({
            data: this.buildVariantData(v, product.id),
          });

          if (defaultWarehouse && variant.stock > 0) {
            await tx.inventory.create({
              data: {
                variantId: variant.id,
                warehouseId: defaultWarehouse.id,
                quantity: variant.stock,
              },
            });
          }
        }
      }

      return tx.product.findUnique({
        where: { id: product.id },
        include: {
          category: true,
          brand: true,
          variants: true,
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
          variants: true,
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
        variants: true,
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
        variants: true,
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
      variants?: unknown[];
      collectionIds?: string[];
    };

    const sanitizedData: Record<string, unknown> = { ...productData };
    if (categoryId !== undefined) sanitizedData.categoryId = categoryId || null;
    if (brandId !== undefined) sanitizedData.brandId = brandId || null;
    if (saleId !== undefined) sanitizedData.saleId = saleId || null;

    const { category, brand, variants: _v, ...updateData } = sanitizedData;

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { id },
        data: {
          ...updateData,
          collections: collectionIds
            ? {
                set: collectionIds.map((id: string) => ({ id })),
              }
            : undefined,
        } as any,
      });

      if (variants) {
        const existingVariants = await tx.variant.findMany({
          where: { productId: id },
          select: { id: true, sku: true },
        });
        const existingIds = existingVariants.map((v) => v.id);

        const incomingIds = (variants as unknown[])
          .map((v: any) => v.id)
          .filter(Boolean);
        let idsToDelete = existingIds.filter(
          (eid) => !incomingIds.includes(eid),
        );

        if (idsToDelete.length > 0) {
          const referencedVariants = await tx.orderItem.findMany({
            where: { variantId: { in: idsToDelete } },
            select: { variantId: true },
          });
          const referencedIds = referencedVariants.map(
            (rv) => rv.variantId as string,
          );
          idsToDelete = idsToDelete.filter((id) => !referencedIds.includes(id));
        }

        if (idsToDelete.length > 0) {
          await tx.variant.deleteMany({
            where: { id: { in: idsToDelete } },
          });
        }

        for (const v of variants as CreateProductDto['variants']) {
          const variantData = this.buildVariantUpdateData(v);

          if (v.id && existingIds.includes(v.id)) {
            const variant = await tx.variant.findUnique({
              where: { id: v.id },
              include: { inventory: true },
            });

            const stockQty = Number(v.stock) || 0;
            if (variant && stockQty !== undefined) {
              if (variant.inventory.length > 1) {
                delete (variantData as { stock?: number }).stock;
              } else if (variant.inventory.length === 1) {
                await tx.inventory.update({
                  where: { id: variant.inventory[0].id },
                  data: { quantity: stockQty },
                });
              } else {
                const defaultWarehouse =
                  (await tx.warehouse.findFirst({
                    where: { location: 'USA' },
                  })) || (await tx.warehouse.findFirst());

                if (defaultWarehouse) {
                  await tx.inventory.create({
                    data: {
                      variantId: variant.id,
                      warehouseId: defaultWarehouse.id,
                      quantity: stockQty,
                    },
                  });
                }
              }
            }

            await tx.variant.update({
              where: { id: v.id },
              data: variantData,
            });
          } else {
            const existingVariant = await tx.variant.findFirst({
              where: {
                OR: [
                  { sku: v.sku },
                  ...(v.barcode ? [{ barcode: v.barcode }] : []),
                ],
              },
            });

            if (existingVariant) {
              if (existingVariant.productId === id) {
                await tx.variant.update({
                  where: { id: existingVariant.id },
                  data: variantData,
                });
              } else {
                const conflictField =
                  existingVariant.sku === v.sku ? 'SKU' : 'Barcode';
                const conflictValue =
                  existingVariant.sku === v.sku ? v.sku : variantData.barcode;
                throw new Error(
                  `${conflictField} "${conflictValue}" already exists for another product.`,
                );
              }
            } else {
              const newVariant = await tx.variant.create({
                data: this.buildVariantData(v, id),
              });

              if (newVariant.stock > 0) {
                const defaultWarehouse =
                  (await tx.warehouse.findFirst({
                    where: { location: 'USA' },
                  })) || (await tx.warehouse.findFirst());

                if (defaultWarehouse) {
                  await tx.inventory.create({
                    data: {
                      variantId: newVariant.id,
                      warehouseId: defaultWarehouse.id,
                      quantity: newVariant.stock,
                    },
                  });
                }
              }
            }
          }
        }
      }

      return tx.product.findUnique({
        where: { id },
        include: {
          category: true,
          brand: true,
          variants: true,
          sale: true,
        },
      });
    }) as Promise<Product>;
  }

  async delete(id: string): Promise<Product> {
    return this.prisma.product.delete({
      where: { id },
    });
  }

  async findVariantById(id: string) {
    return this.prisma.variant.findUnique({
      where: { id },
      include: { product: true },
    });
  }

  async findProductSimpleById(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
    });
  }
}
