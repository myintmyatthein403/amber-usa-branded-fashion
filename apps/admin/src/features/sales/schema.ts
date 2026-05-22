import { z } from 'zod';

export const SaleDiscountTypeSchema = z.enum(['PERCENTAGE', 'FIXED_AMOUNT']);

export const SaleSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Sale name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
  discountType: SaleDiscountTypeSchema.default('PERCENTAGE'),
  discountValue: z.number().min(0).optional(),
  productIds: z.array(z.string()).default([]),
});

export type Sale = z.infer<typeof SaleSchema> & {
  id: string;
  products?: { id: string; name: string; price: number; onSale: boolean; images?: string[] }[];
};

export type SaleProduct = {
  id: string;
  name: string;
  price: number;
  onSale: boolean;
  images?: string[];
};