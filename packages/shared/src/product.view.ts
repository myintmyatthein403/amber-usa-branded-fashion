import { z } from 'zod';
import { VariantBaseSchema, ProductBaseSchema, CategoryBaseSchema, BrandBaseSchema, ProductFiltersBaseSchema } from './product.base';

export const VariantViewSchema = VariantBaseSchema.extend({
  id: z.string().uuid(),
});

export const CategoryViewSchema = CategoryBaseSchema.extend({
  id: z.string().uuid(),
  parent: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
      slug: z.string().optional(),
    })
    .nullable()
    .optional(),
  subcategories: z
    .array(z.object({ id: z.string().uuid(), name: z.string(), slug: z.string().optional() }))
    .optional(),
});

export const BrandViewSchema = BrandBaseSchema.extend({
  id: z.string().uuid(),
});

export const ProductViewSchema = ProductBaseSchema.extend({
  id: z.string().uuid(),
  variants: z.array(VariantViewSchema).default([]),
  category: CategoryViewSchema.nullable(),
  brand: BrandViewSchema.nullable(),
  sale: z.object({ id: z.string(), name: z.string() }).nullable(),
  collections: z.array(z.object({ id: z.string(), name: z.string() })).nullable(),
});

export const ProductWithRelationsSchema = ProductViewSchema;

export const MetaSchema = z.object({
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export const PaginatedProductsSchema = z.object({
  data: z.array(ProductViewSchema),
  meta: MetaSchema,
});

export const ProductFiltersSchema = ProductFiltersBaseSchema;

export type VariantView = z.infer<typeof VariantViewSchema>;
export type CategoryView = z.infer<typeof CategoryViewSchema>;
export type BrandView = z.infer<typeof BrandViewSchema>;
export type ProductView = z.infer<typeof ProductViewSchema>;
export type ProductWithRelations = z.infer<typeof ProductWithRelationsSchema>;
export type Meta = z.infer<typeof MetaSchema>;
export type PaginatedProducts = z.infer<typeof PaginatedProductsSchema>;
export type ProductFilters = z.infer<typeof ProductFiltersSchema>;