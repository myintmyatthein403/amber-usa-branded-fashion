import { z } from 'zod';

export const VariantBaseSchema = z.object({
  id: z.string().uuid().optional(),
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().optional().nullable(),
  size: z.string().min(1, 'Size is required'),
  color: z.string().min(1, 'Color is required'),
  stock: z.number().min(0, 'Stock cannot be negative').default(0),
  lowStockThreshold: z.number().min(0).default(5),
  price: z.union([z.number(), z.string()]).optional().nullable(),
  compareAtPrice: z.union([z.number(), z.string()]).optional().nullable(),
  weight: z.union([z.number(), z.string()]).optional().nullable(),
  images: z.array(z.string()).default([]),
  isPreOrder: z.boolean().default(false),
  preOrderShippingDate: z.string().optional().nullable(),
  attributeSelections: z.record(z.string(), z.string()).optional().nullable(),
});

export const ProductStatusSchema = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);

export const ProductBaseSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().min(1, 'Slug is required'),
  status: ProductStatusSchema.default('DRAFT'),
  shortDescription: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  detail: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
  price: z.union([z.number(), z.string()]).refine(
    (val) => val !== '',
    { message: 'Price is required' }
  ),
  compareAtPrice: z.union([z.number(), z.string()]).optional().nullable(),
  isUsdPrice: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  onSale: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isPreOrder: z.boolean().default(false),
  preOrderShippingDate: z.string().optional().nullable(),
  preOrderNote: z.string().optional().nullable(),
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
  page: z.number().optional(),
  limit: z.number().optional(),
  search: z.string().optional(),
});

export type VariantBase = z.infer<typeof VariantBaseSchema>;
export type ProductBase = z.infer<typeof ProductBaseSchema>;
export type ProductStatus = z.infer<typeof ProductStatusSchema>;
export type CategoryBase = z.infer<typeof CategoryBaseSchema>;
export type BrandBase = z.infer<typeof BrandBaseSchema>;
export type ProductFiltersBase = z.infer<typeof ProductFiltersBaseSchema>;