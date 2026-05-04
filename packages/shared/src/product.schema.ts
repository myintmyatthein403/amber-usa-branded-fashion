import { z } from 'zod';

export const VariantSchema = z.object({
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
});

export const ProductSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().min(1, 'Slug is required'),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  shortDescription: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  detail: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
  price: z.union([z.number(), z.string()]).refine(val => val !== '', 'Price is required'),
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
  variants: z.array(VariantSchema).default([]),
});

export const ProductFiltersSchema = z.object({
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

export type Variant = z.infer<typeof VariantSchema>;
export type Product = z.infer<typeof ProductSchema>;
export type ProductFilters = z.infer<typeof ProductFiltersSchema>;

export const CategorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Category name is required'),
});

export const BrandSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Brand name is required'),
  logo: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
});

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
