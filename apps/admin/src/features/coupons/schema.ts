import { z } from 'zod';

export const CouponDiscountTypeSchema = z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'BUY_X_GET_Y', 'FREE_SHIPPING']);
export const CouponScopeTypeSchema = z.enum(['ORDER', 'PRODUCT', 'CATEGORY']);

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
  scopeType: CouponScopeTypeSchema.default('ORDER'),
  scopeProductId: z.string().nullable().optional(),
  scopeCategoryId: z.string().nullable().optional(),
  buyQuantity: z.number().nullable().optional(),
  getQuantity: z.number().nullable().optional(),
});

export type Coupon = z.infer<typeof CouponSchema> & { id: string };