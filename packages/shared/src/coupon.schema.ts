import { z } from 'zod';

export const CouponSchema = z.object({
  id: z.string().uuid().optional(),
  code: z.string().min(1, 'Code is required'),
  description: z.string().optional().nullable(),
  discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']).default('PERCENTAGE'),
  discountValue: z.coerce.number().min(0),
  minOrderAmount: z.coerce.number().optional().nullable(),
  maxDiscount: z.coerce.number().optional().nullable(),
  expiryDate: z.string().optional().nullable(),
  usageLimit: z.coerce.number().int().optional().nullable(),
  usageCount: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Coupon = z.infer<typeof CouponSchema>;
