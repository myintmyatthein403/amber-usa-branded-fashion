import { z } from 'zod';

export const VariantSchema = z.object({
  id: z.string().optional(),
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().optional(),
  size: z.string().min(1, 'Size is required'),
  color: z.string().min(1, 'Color is required'),
  stock: z.number().min(0),
  lowStockThreshold: z.number().min(0).default(5),
  price: z.number().optional(),
  compareAtPrice: z.number().optional(),
  weight: z.number().optional(),
  images: z.array(z.string()).default([]),
  isPreOrder: z.boolean().default(false),
  preOrderShippingDate: z.string().nullable().optional(),
});

export const ProductSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().min(1, 'Slug is required'),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  brandId: z.string().optional(),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  note: z.string().optional(),
  tags: z.array(z.string()).default([]),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  price: z.string().min(1, 'Price is required'),
  compareAtPrice: z.string().optional(),
  isUsdPrice: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  onSale: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isPreOrder: z.boolean().default(false),
  preOrderShippingDate: z.string().nullable().optional(),
  preOrderNote: z.string().optional(),
  images: z.array(z.string()).default([]),
  categoryId: z.string().optional(),
  saleId: z.string().optional(),
  collectionIds: z.array(z.string()).default([]),
  variants: z.array(VariantSchema).default([]),
});

export type Variant = z.infer<typeof VariantSchema>;
export type Product = z.infer<typeof ProductSchema> & {
  id: string;
  brand?: { id: string; name: string; logo?: string };
  category?: { id: string; name: string };
  sale?: { id: string; name: string };
  collections?: { id: string; name: string }[];
};

export type Category = { id: string; name: string };
export type Brand = { id: string; name: string; logo?: string };
export type Sale = { id: string; name: string };
export type Collection = { id: string; name: string };

export type Meta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
