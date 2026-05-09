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
  category: z.object({
    id: z.string(),
    name: z.string(),
  }).optional().nullable(),
  brand: z.object({
    id: z.string(),
    name: z.string(),
    logo: z.string().optional().nullable(),
  }).optional().nullable(),
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
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
});

export type ProductQueryDto = z.infer<typeof ProductQueryDto>;

export const StockValidationItemDto = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional(),
  quantity: z.number().min(1),
});

export type StockValidationItemDto = z.infer<typeof StockValidationItemDto>;