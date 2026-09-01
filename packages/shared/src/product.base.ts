import { z } from 'zod';

// Shared cross-field pre-order validation, previously duplicated across
// VariantSchema, ProductSchema (product.schema.ts), and PreOrderValidation
// (product.input.ts) — each with its own copy of the same two predicates and
// error messages. Deliberately exported as plain functions/constants applied
// via `.refine(fn, message)` at each call site (rather than a generic
// "wrap the whole schema" helper) — a generic function returning ZodEffects
// doesn't survive packages/shared's .d.ts emission losslessly, which
// silently erased unrelated fields (e.g. warehouseAllocations) from the
// inferred type in downstream packages when tried.
type PreOrderShape = { isPreOrder?: boolean; preOrderShippingDate?: string | null };

export function isPreOrderShippingDateValid(data: PreOrderShape): boolean {
  return !(data.isPreOrder && !data.preOrderShippingDate);
}
export const PRE_ORDER_SHIPPING_DATE_REQUIRED_ISSUE: { message: string; path: string[] } = {
  message: 'preOrderShippingDate is required when isPreOrder is true',
  path: ['preOrderShippingDate'],
};

export function isPreOrderShippingDateAbsent(data: PreOrderShape): boolean {
  return !(!data.isPreOrder && data.preOrderShippingDate);
}
export const PRE_ORDER_SHIPPING_DATE_FORBIDDEN_ISSUE: { message: string; path: string[] } = {
  message: 'preOrderShippingDate should not be set when isPreOrder is false',
  path: ['preOrderShippingDate'],
};

export const WarehouseAllocationSchema = z.object({
  warehouseId: z.string().uuid(),
  quantity: z.number().min(0),
});

export const VariantBaseSchema = z.object({
  id: z.string().uuid().optional(),
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().optional().nullable(),
  size: z.string().min(1, 'Size is required'),
  color: z.string().min(1, 'Color is required'),
  stock: z.number().min(0, 'Stock cannot be negative').default(0),
  lowStockThreshold: z.number().min(0).default(5),
  buyPrice: z.union([z.number(), z.string()]).optional().nullable(),
  price: z.union([z.number(), z.string()]).optional().nullable(),
  compareAtPrice: z.union([z.number(), z.string()]).optional().nullable(),
  currencyCode: z.enum(['USD', 'MMK', 'THB']).default('USD'),
  weight: z.union([z.number(), z.string()]).optional().nullable(),
  images: z.array(z.string()).default([]),
  isPreOrder: z.boolean().default(false),
  preOrderShippingDate: z.string().optional().nullable(),
  attributeSelections: z.record(z.string(), z.string()).optional().nullable(),
  warehouseId: z.string().uuid().optional(),
  warehouseAllocations: z.array(WarehouseAllocationSchema).optional(),
});

export const ProductStatusSchema = z.enum(['DRAFT', 'IN_REVIEW', 'PUBLISHED', 'ARCHIVED']);
export const ProductVisibilitySchema = z.enum(['USA', 'MYANMAR', 'BOTH', 'PRE_ORDER_ONLY']);

export const ProductBaseSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().min(1, 'Slug is required'),
  status: ProductStatusSchema.default('DRAFT'),
  visibility: ProductVisibilitySchema.default('BOTH'),
  shortDescription: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  detail: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
  price: z.union([z.number(), z.string()]).refine(
    (val) => val !== '',
    { message: 'Price is required' }
  ),
  compareAtPrice: z.union([z.number(), z.string()]).optional().nullable(),
  cost: z.union([z.number(), z.string()]).optional().nullable(),
  stock: z.number().min(0, 'Stock cannot be negative').default(0),
  lowStockThreshold: z.number().min(0).default(5),
  warehouseId: z.string().uuid().optional(),
  warehouseAllocations: z.array(WarehouseAllocationSchema).optional(),
  isDigital: z.boolean().default(false),
  currencyCode: z.enum(['USD', 'MMK', 'THB']).default('USD'),
  isUsdPrice: z.boolean().default(true),
  publishAt: z.string().optional().nullable(),
  isFeatured: z.boolean().default(false),
  onSale: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isPreOrder: z.boolean().default(false),
  preOrderShippingDate: z.string().optional().nullable(),
  preOrderNote: z.string().optional().nullable(),
  depositAmount: z.union([z.number(), z.string()]).optional().nullable(),
  expiryDate: z.string().optional().nullable(),
  warrantyMonths: z.number().int().optional().nullable(),
  returnWindowDaysOverride: z.number().int().optional().nullable(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
  categoryId: z.string().optional().nullable(),
  brandId: z.string().optional().nullable(),
  saleId: z.string().optional().nullable(),
  collectionIds: z.array(z.string()).default([]),
});

export const CategoryBaseSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Category name is required'),
  slug: z.string().regex(/^[a-z0-9-_]+$/, 'Slug must be alphanumeric/hyphens').optional(),
  description: z.string().optional().nullable(),
  image: z.string().url().or(z.literal('')).optional().nullable(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  hasExpiry: z.boolean().default(false),
  displayOrder: z.number().int().default(0),
  parentId: z.string().uuid().optional().nullable(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
});

export const BrandBaseSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Brand name is required'),
  logo: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
});

export const ProductFiltersBaseSchema = z.object({
  isFeatured: z.boolean().optional(),
  isNewArrival: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  onSale: z.boolean().optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  currencyCode: z.enum(['USD', 'MMK', 'THB']).optional(),
  warehouseLocation: z.enum(['USA', 'MYANMAR']).optional(),
  inStock: z.boolean().optional(),
  priceMin: z.number().optional(),
  priceMax: z.number().optional(),
  status: z.enum(['DRAFT', 'IN_REVIEW', 'PUBLISHED', 'ARCHIVED']).optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
  search: z.string().optional(),
  attributeFilters: z.record(z.string(), z.string()).optional(),
});

export type VariantBase = z.infer<typeof VariantBaseSchema>;
export type ProductBase = z.infer<typeof ProductBaseSchema>;
export type ProductStatus = z.infer<typeof ProductStatusSchema>;
export type CategoryBase = z.infer<typeof CategoryBaseSchema>;
export type BrandBase = z.infer<typeof BrandBaseSchema>;
export type ProductFiltersBase = z.infer<typeof ProductFiltersBaseSchema>;