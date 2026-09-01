import { z } from 'zod';
import {
  ProductSchema,
  ProductBaseSchema,
  VariantSchema,
  VariantBaseSchema,
  CategorySchema,
  BrandSchema,
  ProductFiltersSchema,
} from '@amber/shared';

export const CreateProductDto = ProductSchema;

const ProductUpdateBase = ProductBaseSchema.extend({
  isPreOrder: z.boolean().optional(),
  preOrderShippingDate: z.string().optional(),
  variants: z.array(VariantBaseSchema).default([]),
  category: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .optional()
    .nullable(),
  brand: z
    .object({
      id: z.string(),
      name: z.string(),
      logo: z.string().optional().nullable(),
    })
    .optional()
    .nullable(),
});

export const UpdateProductDto = ProductUpdateBase.partial();
export const ProductFilterDto = ProductFiltersSchema;

export type CreateProductDto = z.infer<typeof CreateProductDto>;
export type UpdateProductDto = z.infer<typeof UpdateProductDto>;
export type ProductFilterDto = z.infer<typeof ProductFilterDto>;

export const CreateVariantDto = VariantSchema;
export const UpdateVariantDto = VariantBaseSchema.partial();

export type CreateVariantDto = z.infer<typeof CreateVariantDto>;
export type UpdateVariantDto = z.infer<typeof UpdateVariantDto>;

export const CreateCategoryDto = CategorySchema;
export const UpdateCategoryDto = CategorySchema.partial();

export type CreateCategoryDto = z.infer<typeof CreateCategoryDto>;
export type UpdateCategoryDto = z.infer<typeof UpdateCategoryDto>;

export const CreateBrandDto = BrandSchema;
export const UpdateBrandDto = BrandSchema.partial();

export type CreateBrandDto = z.infer<typeof CreateBrandDto>;
export type UpdateBrandDto = z.infer<typeof UpdateBrandDto>;

export const ProductQueryDto = z.object({
  isFeatured: z.string().optional(),
  isNewArrival: z.string().optional(),
  isBestSeller: z.string().optional(),
  onSale: z.string().optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  // Comma-separated product IDs — used by recently-viewed/recommendation
  // rails to batch-fetch a known set of products in one request.
  ids: z.string().optional(),
  currencyCode: z.string().optional(),
  market: z.enum(['US', 'MM']).optional(),
  warehouseLocation: z.string().optional(),
  inStock: z.string().optional(),
  priceMin: z.string().optional(),
  priceMax: z.string().optional(),
  status: z.string().optional(),
  attributeFilters: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type ProductQueryDto = z.infer<typeof ProductQueryDto>;

export const StockValidationItemDto = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional(),
  quantity: z.number().min(1),
});

export type StockValidationItemDto = z.infer<typeof StockValidationItemDto>;

// Bulk import updates existing variants only (matched by SKU) — price,
// currency, buy price, and per-warehouse stock. It deliberately does not
// create new products/variants from arbitrary CSV rows, since those require
// category/slug/images and other fields a flat row can't safely supply.
export const ImportProductRowDto = z.object({
  sku: z.string().min(1),
  productName: z.string().min(1),
  price: z.string().optional(),
  currencyCode: z.string().optional(),
  buyPrice: z.string().optional(),
  stock: z.string().optional(),
  warehouseLocation: z.enum(['USA', 'MYANMAR']).optional(),
});

export const ImportProductsDto = z.object({
  rows: z.array(ImportProductRowDto).min(1, 'At least one row is required'),
  dryRun: z.boolean().optional(),
});

export type ImportProductRowDto = z.infer<typeof ImportProductRowDto>;
export type ImportProductsDto = z.infer<typeof ImportProductsDto>;
