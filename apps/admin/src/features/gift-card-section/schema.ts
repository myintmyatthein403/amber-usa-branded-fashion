import { z } from 'zod';

export const GiftCardSectionSchema = z.object({
  id: z.string().uuid().optional(),
  badge: z.string().nullable().optional(),
  title: z.string().min(1, 'Title is required'),
  titleSecondary: z.string().nullable().optional(),
  description: z.string().min(1, 'Description is required'),
  ctaText: z.string().nullable().optional(),
  ctaLink: z.string().nullable().optional(),
  cardTitle: z.string().min(1, 'Card title is required'),
  cardAmount: z.string().min(1, 'Card amount is required'),
  cardType: z.string().min(1, 'Card type is required'),
  amounts: z.array(z.string()).min(1, 'At least one amount is required'),
  isActive: z.boolean().default(false),
});

export type GiftCardSection = z.infer<typeof GiftCardSectionSchema> & { id: string };
