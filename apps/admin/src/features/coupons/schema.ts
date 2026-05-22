import { z } from 'zod';

export const CouponDiscountTypeSchema = z.enum(['PERCENTAGE', 'FIXED_AMOUNT']);

export const CouponSchema = z.object({
  id: z.string().uuid().optional(),
  code: z.string().min(1, 'Code is required'),
  description: z.string().nullable().optional(),
  discountType: CouponDiscountTypeSchema.default('PERCENTAGE'),
  discountValue: z.number().min(0),
  minOrderAmount: z.number().nullable().optional(),
  maxDiscount: z.number().nullable().optional(),
  expiryDate: z.string().nullable().optional(),
  usageLimit: z.number().nullable().optional(),
  usageCount: z.number().default(0),
  isActive: z.boolean().default(true),
});

export type Coupon = z.infer<typeof CouponSchema> & { id: string };