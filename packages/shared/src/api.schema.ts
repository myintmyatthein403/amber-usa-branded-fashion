import { z } from 'zod';

export const ApiVariantSchema = z.object({
  id: z.string(),
  sku: z.string(),
  barcode: z.string().nullable(),
  size: z.string(),
  color: z.string(),
  stock: z.number(),
  price: z.union([z.number(), z.string()]).nullable(),
  compareAtPrice: z.union([z.number(), z.string()]).nullable(),
  images: z.array(z.string()),
  isPreOrder: z.boolean(),
  preOrderShippingDate: z.string().nullable(),
});

export type ApiVariant = z.infer<typeof ApiVariantSchema>;

export const ApiProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  visibility: z.enum(['USA', 'MYANMAR', 'BOTH', 'PRE_ORDER_ONLY']).optional(),
  price: z.union([z.number(), z.string()]),
  compareAtPrice: z.union([z.number(), z.string()]).nullable(),
  isUsdPrice: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  onSale: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isPreOrder: z.boolean().default(false),
  preOrderShippingDate: z.string().nullable(),
  preOrderNote: z.string().nullable(),
  description: z.string().nullable(),
  detail: z.string().nullable(),
  shortDescription: z.string().nullable(),
  note: z.string().nullable(),
  metaTitle: z.string().nullable(),
  metaDescription: z.string().nullable(),
  tags: z.array(z.string()),
  images: z.array(z.string()),
  sizes: z.array(z.string()).default([]),
  colors: z.array(z.string()).default([]),
  categoryId: z.string().nullable(),
  brandId: z.string().nullable(),
  saleId: z.string().nullable(),
  category: z.object({
    id: z.string(),
    name: z.string(),
  }).nullable(),
  brand: z.object({
    id: z.string(),
    name: z.string(),
    logo: z.string().nullable(),
  }).nullable(),
  variants: z.array(ApiVariantSchema).default([]),
  reviews: z.array(z.object({
    id: z.string(),
    rating: z.number(),
    comment: z.string().nullable(),
    userName: z.string(),
    createdAt: z.string(),
  })).default([]),
});

export type ApiProduct = z.infer<typeof ApiProductSchema>;

export const ApiReviewSchema = z.object({
  id: z.string(),
  rating: z.number(),
  comment: z.string().nullable(),
  userName: z.string(),
  userProfileUrl: z.string().nullable(),
  createdAt: z.string(),
  platform: z.enum(['WEBSITE', 'FACEBOOK', 'INSTAGRAM', 'TIKTOK']).default('WEBSITE'),
});

export type ApiReview = z.infer<typeof ApiReviewSchema>;

export const CartItemSchema = z.object({
  productId: z.string(),
  variantId: z.string().nullable(),
  name: z.string(),
  price: z.number(),
  quantity: z.number(),
  image: z.string(),
  size: z.string().nullable(),
  color: z.string().nullable(),
  isUsd: z.boolean().default(true),
  isPreOrder: z.boolean().default(false),
});

export type CartItem = z.infer<typeof CartItemSchema>;

export const CheckoutDataSchema = z.object({
  items: z.array(CartItemSchema),
  subtotal: z.number(),
  discount: z.number().default(0),
  shipping: z.number().default(0),
  total: z.number(),
  currency: z.string().default('USD'),
});

export type CheckoutData = z.infer<typeof CheckoutDataSchema>;

export const ApiErrorSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
});

export type ApiError = z.infer<typeof ApiErrorSchema>;

export const OrderTimelineSchema = z.object({
  status: z.string(),
  date: z.string(),
  description: z.string(),
});

export type OrderTimeline = z.infer<typeof OrderTimelineSchema>;

export const OrderSchema = z.object({
  id: z.string(),
  orderNumber: z.string(),
  status: z.string(),
  paymentStatus: z.string(),
  totalAmount: z.number(),
  currency: z.string(),
  paymentMethod: z.string(),
  shippingAddress: z.string(),
  userId: z.string().nullable(),
  createdAt: z.string(),
  items: z.array(CartItemSchema),
});

export type Order = z.infer<typeof OrderSchema>;

export const GiftCardOptionSchema = z.object({
  amount: z.string(),
  label: z.string(),
});

export type GiftCardOption = z.infer<typeof GiftCardOptionSchema>;

export const PaginatedMetaSchema = z.object({
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export type PaginatedMeta = z.infer<typeof PaginatedMetaSchema>;

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: z.array(dataSchema),
    meta: PaginatedMetaSchema,
  });

export const ApiCategoryBaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
  parentId: z.string().nullable().optional(),
  metaTitle: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
  parent: z.object({ id: z.string(), name: z.string(), slug: z.string().optional() }).nullable().optional(),
  subcategories: z.array(z.object({ id: z.string(), name: z.string() })).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type ApiCategoryBase = z.infer<typeof ApiCategoryBaseSchema>;

export const PaginatedCategoriesResponse = PaginatedResponseSchema(ApiCategoryBaseSchema);
export type PaginatedCategoriesResponse = z.infer<typeof PaginatedCategoriesResponse>;