import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Product, Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async createProduct(data: any): Promise<Product> {
    const sanitizedData = this.prisma.sanitizeData(data);
    const { variants, ...productData } = sanitizedData;

    return this.prisma.product.create({
      data: {
        ...productData,
        variants: variants && variants.length > 0 ? {
          create: variants.map((v: any) => ({
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
          }))
        } : undefined
      },
      include: {
        category: true,
        brand: true,
        variants: true,
        sale: true,
      }
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
              await tx.variant.create({
                data: variantData
              });
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
