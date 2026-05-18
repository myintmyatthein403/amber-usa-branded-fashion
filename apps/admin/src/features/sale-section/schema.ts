import { z } from 'zod';

export const SaleSectionSchema = z.object({
  id: z.string().uuid().optional(),
  badge: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  titleItalic: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  endDate: z.string().min(1, 'End date is required'),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
  imageMain: z.string().optional().or(z.literal('')),
  imageUrl: z.string().url().optional().or(z.literal('')),
  isActive: z.boolean().default(false),
});

export type SaleSection = z.infer<typeof SaleSectionSchema> & { id: string };
export type SaleSectionWithUrl = SaleSection & { imageUrl?: string | null };