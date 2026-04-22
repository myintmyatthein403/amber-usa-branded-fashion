import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Product, Prisma, Variant } from '@prisma/client';

@Injectable()
export class ProductsRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: any): Promise<Product> {
    const { variants, ...productData } = data;

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          ...productData,
        },
      });

      if (variants && variants.length > 0) {
        const defaultWarehouse = await tx.warehouse.findFirst({
          where: { location: 'USA' }
        }) || await tx.warehouse.findFirst();

        for (const v of variants) {
          const variant = await tx.variant.create({
            data: {
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
              preOrderShippingDate: v.preOrderShippingDate,
              productId: product.id
            }
          });

          if (defaultWarehouse && variant.stock > 0) {
            await tx.inventory.create({
              data: {
                variantId: variant.id,
                warehouseId: defaultWarehouse.id,
                quantity: variant.stock
              }
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
        }
      });
    }) as Promise<Product>;
  }

  async findAll(where: Prisma.ProductWhereInput, skip?: number, take?: number): Promise<[Product[], number]> {
    return Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: true,
          brand: true,
          variants: true,
          sale: true,
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
        reviews: {
          where: { isApproved: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async update(id: string, data: any): Promise<Product> {
    const { variants, ...productData } = data;

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { id },
        data: productData,
      });

      if (variants) {
        const existingVariants = await tx.variant.findMany({
          where: { productId: id },
          select: { id: true, sku: true }
        });
        const existingIds = existingVariants.map(v => v.id);
        
        const incomingIds = variants.map((v: any) => v.id).filter(Boolean);
        let idsToDelete = existingIds.filter(eid => !incomingIds.includes(eid));

        if (idsToDelete.length > 0) {
          const referencedVariants = await tx.orderItem.findMany({
            where: { variantId: { in: idsToDelete } },
            select: { variantId: true }
          });
          const referencedIds = referencedVariants.map(rv => rv.variantId as string);
          idsToDelete = idsToDelete.filter(id => !referencedIds.includes(id));
        }

        if (idsToDelete.length > 0) {
          await tx.variant.deleteMany({
            where: { id: { in: idsToDelete } }
          });
        }

        for (const v of variants) {
          const variantData = {
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
            preOrderShippingDate: v.preOrderShippingDate,
            productId: id
          };

          if (v.id && existingIds.includes(v.id)) {
            const variant = await tx.variant.findUnique({
              where: { id: v.id },
              include: { inventory: true }
            });

            if (variant && variantData.stock !== undefined) {
              if (variant.inventory.length > 1) {
                delete (variantData as any).stock; 
              } else if (variant.inventory.length === 1) {
                await tx.inventory.update({
                  where: { id: variant.inventory[0].id },
                  data: { quantity: variantData.stock }
                });
              } else {
                const defaultWarehouse = await tx.warehouse.findFirst({
                  where: { location: 'USA' }
                }) || await tx.warehouse.findFirst();
                
                if (defaultWarehouse) {
                  await tx.inventory.create({
                    data: {
                      variantId: variant.id,
                      warehouseId: defaultWarehouse.id,
                      quantity: variantData.stock
                    }
                  });
                }
              }
            }

            await tx.variant.update({
              where: { id: v.id },
              data: variantData
            });
          } else {
            const existingVariant = await tx.variant.findFirst({
               where: { 
                 OR: [
                   { sku: v.sku },
                   ...(variantData.barcode ? [{ barcode: variantData.barcode }] : [])
                 ]
               }
            });

            if (existingVariant) {
               if (existingVariant.productId === id) {
                  await tx.variant.update({
                    where: { id: existingVariant.id },
                    data: variantData
                  });
               } else {
                 const conflictField = existingVariant.sku === v.sku ? 'SKU' : 'Barcode';
                 const conflictValue = existingVariant.sku === v.sku ? v.sku : variantData.barcode;
                 throw new Error(`${conflictField} "${conflictValue}" already exists for another product.`);
               }
            } else {
              const newVariant = await tx.variant.create({
                data: variantData
              });

              if (newVariant.stock > 0) {
                const defaultWarehouse = await tx.warehouse.findFirst({
                  where: { location: 'USA' }
                }) || await tx.warehouse.findFirst();

                if (defaultWarehouse) {
                  await tx.inventory.create({
                    data: {
                      variantId: newVariant.id,
                      warehouseId: defaultWarehouse.id,
                      quantity: newVariant.stock
                    }
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
          sale: true
        }
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
      include: { product: true }
    });
  }

  async findProductSimpleById(id: string) {
    return this.prisma.product.findUnique({
      where: { id }
    });
  }
}
