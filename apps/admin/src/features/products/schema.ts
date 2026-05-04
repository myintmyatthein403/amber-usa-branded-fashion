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

export type Variant = z.infer<typeof VariantSchema>;
export type Product = z.infer<typeof ProductSchema>;
export type Category = z.infer<typeof CategorySchema>;
export type Brand = z.infer<typeof BrandSchema>;
export type Warehouse = { id: string; name: string; location: string };

export type Meta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type CreateProductInput = {
  name: string;
  slug: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  shortDescription?: string | null;
  description?: string | null;
  detail?: string | null;
  note?: string | null;
  price: string | number;
  compareAtPrice?: string | number | null;
  isUsdPrice?: boolean;
  isFeatured?: boolean;
  onSale?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isPreOrder?: boolean;
  preOrderShippingDate?: string | null;
  preOrderNote?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  tags?: string[];
  images?: string[];
  categoryId?: string | null;
  brandId?: string | null;
  saleId?: string | null;
  collectionIds?: string[];
  variants?: Array<{
    id?: string;
    sku?: string;
    barcode?: string | null;
    size: string;
    color: string;
    stock?: number;
    lowStockThreshold?: number;
    price?: string | number | null;
    compareAtPrice?: string | number | null;
    weight?: string | number | null;
    images?: string[];
    isPreOrder?: boolean;
    preOrderShippingDate?: string | null;
  }>;
};

export type CreateVariantInput = {
  sku?: string;
  barcode?: string | null;
  size: string;
  color: string;
  stock?: number;
  lowStockThreshold?: number;
  price?: string | number | null;
  compareAtPrice?: string | number | null;
  weight?: string | number | null;
  images?: string[];
  isPreOrder?: boolean;
  preOrderShippingDate?: string | null;
};

export type ProductWithRelations = Product & {
  brand?: { id: string; name: string; logo?: string };
  category?: { id: string; name: string };
  sale?: { id: string; name: string };
  collections?: { id: string; name: string }[];
};

export type Sale = { id: string; name: string };
export type Collection = { id: string; name: string };