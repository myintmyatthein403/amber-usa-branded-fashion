import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Product, Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async createProduct(data: any): Promise<Product> {
    const sanitizedData = this.prisma.sanitizeData(data);
    const { variants, ...productData } = sanitizedData;

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          ...productData,
        },
      });

      if (variants && variants.length > 0) {
        // Find a default warehouse for initial stock (Finding 1 & 2)
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

    // Backward compatibility: if no pagination or search, return full list
    if (!page && !limit && !search) {
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
    
    const currentPage = Number(page) || 1;
    const currentLimit = Number(limit) || 20;
    const skip = (currentPage - 1) * currentLimit;
    
    const [data, total] = await Promise.all([
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
        take: currentLimit,
      }),
      this.prisma.product.count({ where }),
    ]);

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

  async updateProduct(id: string, data: any): Promise<Product> {
    const sanitizedData = this.prisma.sanitizeData(data);
    const { variants, ...productData } = sanitizedData;

    return this.prisma.$transaction(async (tx) => {
      // 1. Update the core product data
      const product = await tx.product.update({
        where: { id },
        data: productData,
      });

      // 2. Sync variants if provided
      if (variants) {
        // Get existing variant IDs for this product
        const existingVariants = await tx.variant.findMany({
          where: { productId: id },
          select: { id: true, sku: true }
        });
        const existingIds = existingVariants.map(v => v.id);
        
        // Identify variants to delete (those in DB but NOT in incoming request)
        // Note: For variants, we usually rely on IDs or SKU for matching
        const incomingIds = variants.map((v: any) => v.id).filter(Boolean);
        let idsToDelete = existingIds.filter(eid => !incomingIds.includes(eid));

        // Safety check: Don't delete variants that are referenced in orders
        if (idsToDelete.length > 0) {
          const referencedVariants = await tx.orderItem.findMany({
            where: { variantId: { in: idsToDelete } },
            select: { variantId: true }
          });
          const referencedIds = referencedVariants.map(rv => rv.variantId as string);
          idsToDelete = idsToDelete.filter(id => !referencedIds.includes(id));
        }

        // Delete removed variants that are NOT referenced
        if (idsToDelete.length > 0) {
          await tx.variant.deleteMany({
            where: { id: { in: idsToDelete } }
          });
        }

        // Upsert incoming variants
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

          // If it has an ID and that ID exists in this product's variants, update it
          if (v.id && existingIds.includes(v.id)) {
            const variant = await tx.variant.findUnique({
              where: { id: v.id },
              include: { inventory: true }
            });

            if (variant && variantData.stock !== undefined) {
              // Reconcile stock with Inventory (Finding 1)
              if (variant.inventory.length > 1) {
                // To avoid corruption, we don't allow direct stock updates if multiple warehouses are involved
                // But for bulk product update, we might want to just update the first one or skip it.
                // Given the risk, let's only update if exactly one record exists.
                delete (variantData as any).stock; 
              } else if (variant.inventory.length === 1) {
                await tx.inventory.update({
                  where: { id: variant.inventory[0].id },
                  data: { quantity: variantData.stock }
                });
              } else {
                // Create a default inventory record if none exists
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
            // Check if SKU or Barcode already exists globally to avoid unique constraint error
            const existingVariant = await tx.variant.findFirst({
               where: { 
                 OR: [
                   { sku: v.sku },
                   ...(variantData.barcode ? [{ barcode: variantData.barcode }] : [])
                 ]
               }
            });

            if (existingVariant) {
               // If it exists but belongs to this product, update it
               if (existingVariant.productId === id) {
                  await tx.variant.update({
                    where: { id: existingVariant.id },
                    data: variantData
                  });
               } else {
                 // Error: SKU/Barcode belongs to another product
                 const conflictField = existingVariant.sku === v.sku ? 'SKU' : 'Barcode';
                 const conflictValue = existingVariant.sku === v.sku ? v.sku : variantData.barcode;
                 throw new Error(`${conflictField} "${conflictValue}" already exists for another product.`);
               }
            } else {
              // Create new
              const newVariant = await tx.variant.create({
                data: variantData
              });

              // Create inventory record (Finding 1 & 2)
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
