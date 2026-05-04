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

export type Variant = z.infer<typeof VariantSchema>;

export type VariantProduct = {
  id: string;
  name: string;
};