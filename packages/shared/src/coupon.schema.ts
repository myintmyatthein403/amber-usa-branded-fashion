import { z } from 'zod';

// Base object kept separate from the refined CouponSchema below so callers
// that need `.partial()` (e.g. a PATCH endpoint) have something to call it
// on — z.ZodEffects (what `.refine()` returns) has no `.partial()` method.
export const CouponObjectSchema = z.object({
  id: z.string().uuid().optional(),
  code: z.string().min(1, 'Code is required'),
  description: z.string().optional().nullable(),
  discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'BUY_X_GET_Y', 'FREE_SHIPPING']).default('PERCENTAGE'),
  discountValue: z.coerce.number().min(0),
  minOrderAmount: z.coerce.number().optional().nullable(),
  maxDiscount: z.coerce.number().optional().nullable(),
  expiryDate: z.string().optional().nullable(),
  usageLimit: z.coerce.number().int().optional().nullable(),
  usageCount: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
  scopeType: z.enum(['ORDER', 'PRODUCT', 'CATEGORY']).default('ORDER'),
  scopeProductId: z.string().uuid().optional().nullable(),
  scopeCategoryId: z.string().uuid().optional().nullable(),
  buyQuantity: z.coerce.number().int().positive().optional().nullable(),
  getQuantity: z.coerce.number().int().positive().optional().nullable(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const CouponSchema = CouponObjectSchema.refine(
  (d) => d.scopeType !== 'PRODUCT' || !!d.scopeProductId,
  { message: 'scopeProductId is required when scopeType is PRODUCT', path: ['scopeProductId'] },
).refine(
  (d) => d.scopeType !== 'CATEGORY' || !!d.scopeCategoryId,
  { message: 'scopeCategoryId is required when scopeType is CATEGORY', path: ['scopeCategoryId'] },
).refine(
  (d) => d.discountType !== 'BUY_X_GET_Y' || (!!d.buyQuantity && !!d.getQuantity),
  { message: 'buyQuantity and getQuantity are required for BUY_X_GET_Y coupons', path: ['buyQuantity'] },
);

export type Coupon = z.infer<typeof CouponSchema>;

export const ApplyCouponSchema = z.object({
  code: z.string().min(1, 'Coupon code is required'),
  items: z.array(z.object({
    productId: z.string().uuid(),
    categoryId: z.string().uuid().optional().nullable(),
    quantity: z.number().int().positive(),
    lineTotal: z.number().nonnegative(),
  })).min(1),
  orderTotal: z.number().nonnegative(),
});

export type ApplyCouponInput = z.infer<typeof ApplyCouponSchema>;

export interface ApplyCouponResult {
  valid: boolean;
  discountAmount: number;
  freeShipping: boolean;
  message?: string;
}

// --- Wholesale / tiered pricing ---
export const CreatePriceTierSchema = z.object({
  productId: z.string().uuid().optional(),
  variantId: z.string().uuid().optional(),
  minQuantity: z.coerce.number().int().min(1),
  price: z.coerce.number().min(0),
  currencyCode: z.string().default('USD'),
}).refine((d) => !d.productId !== !d.variantId, {
  message: 'Exactly one of productId or variantId is required',
});

export type CreatePriceTierInput = z.infer<typeof CreatePriceTierSchema>;

// --- Admin-curated recommendation overrides ---
export const CreateRecommendationSchema = z.object({
  productId: z.string().uuid(),
  recommendedProductId: z.string().uuid(),
  type: z.enum(['RELATED', 'FREQUENTLY_BOUGHT_TOGETHER']),
  position: z.coerce.number().int().default(0),
});

export type CreateRecommendationInput = z.infer<typeof CreateRecommendationSchema>;

// --- Per-currency product price overrides ---
export const CreateProductPriceSchema = z.object({
  productId: z.string().uuid().optional(),
  variantId: z.string().uuid().optional(),
  currencyCode: z.string().min(1),
  price: z.coerce.number().min(0),
}).refine((d) => !d.productId !== !d.variantId, {
  message: 'Exactly one of productId or variantId is required',
});

export type CreateProductPriceInput = z.infer<typeof CreateProductPriceSchema>;

// --- Serial number / warranty unit tracking ---
export const CreateSerialNumbersSchema = z.object({
  variantId: z.string().uuid(),
  serialNumbers: z.array(z.string().min(1)).min(1),
});

export type CreateSerialNumbersInput = z.infer<typeof CreateSerialNumbersSchema>;
