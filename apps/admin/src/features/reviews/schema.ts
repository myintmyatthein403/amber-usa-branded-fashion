import { z } from 'zod';

export const ReviewPlatformSchema = z.enum(['WEBSITE', 'FACEBOOK', 'INSTAGRAM', 'TIKTOK']);

export const ReviewProductSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const ReviewSchema = z.object({
  id: z.string().uuid().optional(),
  rating: z.number().min(1).max(5),
  comment: z.string().nullable().optional(),
  userName: z.string().min(1, 'User name is required'),
  userProfileUrl: z.string().nullable().optional(),
  platform: ReviewPlatformSchema.default('WEBSITE'),
  isApproved: z.boolean().default(true),
  productId: z.string().min(1, 'Product selection is required'),
});

export type ReviewProduct = z.infer<typeof ReviewProductSchema>;
export type Review = z.infer<typeof ReviewSchema> & {
  id: string;
  product: ReviewProduct;
  createdAt: string;
};
