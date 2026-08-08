import { z } from 'zod';
import {
  ProductBaseSchema,
  VariantBaseSchema,
  CategoryBaseSchema,
  BrandBaseSchema,
  ProductFiltersBaseSchema,
  isPreOrderShippingDateValid,
  PRE_ORDER_SHIPPING_DATE_REQUIRED_ISSUE,
  isPreOrderShippingDateAbsent,
  PRE_ORDER_SHIPPING_DATE_FORBIDDEN_ISSUE,
} from './product.base';

const PreOrderFields = z.object({
  isPreOrder: z.boolean().optional().default(false),
  preOrderShippingDate: z.string().optional().nullable(),
});

export const VariantSchema = VariantBaseSchema.merge(PreOrderFields)
  .refine(isPreOrderShippingDateValid, PRE_ORDER_SHIPPING_DATE_REQUIRED_ISSUE)
  .refine(isPreOrderShippingDateAbsent, PRE_ORDER_SHIPPING_DATE_FORBIDDEN_ISSUE);

export const ProductSchema = ProductBaseSchema.extend({
  isPreOrder: z.boolean().default(false),
  preOrderShippingDate: z.string().optional().nullable(),
  variants: z.array(VariantSchema).default([]),
  category: z.object({
    id: z.string(),
    name: z.string(),
  }).optional().nullable(),
  brand: z.object({
    id: z.string(),
    name: z.string(),
    logo: z.string().optional().nullable(),
  }).optional().nullable(),
})
  .refine(isPreOrderShippingDateValid, PRE_ORDER_SHIPPING_DATE_REQUIRED_ISSUE)
  .refine(isPreOrderShippingDateAbsent, PRE_ORDER_SHIPPING_DATE_FORBIDDEN_ISSUE);

export const ProductFiltersSchema = ProductFiltersBaseSchema;

export const CategorySchema = CategoryBaseSchema;

export const BrandSchema = BrandBaseSchema;

export type Variant = z.infer<typeof VariantSchema>;
export type Product = z.infer<typeof ProductSchema>;
export type ProductFilters = z.infer<typeof ProductFiltersSchema>;
export type Category = z.infer<typeof CategorySchema>;
export type Brand = z.infer<typeof BrandSchema>;
export type ProductWithRelations = Product & {
  category?: Category | null;
  brand?: Brand | null;
  sale?: { id: string; name: string } | null;
  collections?: { id: string; name: string }[] | null;
};

export interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type CreateProductInput = z.infer<typeof ProductSchema>;
export type CreateVariantInput = z.infer<typeof VariantSchema>;

export {
  VariantBaseSchema,
  ProductBaseSchema,
  ProductStatusSchema,
  CategoryBaseSchema,
  BrandBaseSchema,
  ProductFiltersBaseSchema,
  type VariantBase,
  type ProductBase,
  type ProductStatus,
  type CategoryBase,
  type BrandBase,
  type ProductFiltersBase,
} from './product.base';