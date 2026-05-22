import { z } from 'zod';

export const HeroSectionSchema = z.object({
  id: z.string().uuid().optional(),
  badge: z.string().optional(),
  titlePartOne: z.string().min(1, 'Title Part One is required'),
  titlePartTwo: z.string().optional(),
  titleItalic: z.boolean(),
  description: z.string().min(1, 'Description is required'),
  ctaPrimaryText: z.string().min(1, 'Primary CTA Text is required'),
  ctaPrimaryLink: z.string().min(1, 'Primary CTA Link is required'),
  ctaSecondaryText: z.string().min(1, 'Secondary CTA Text is required'),
  ctaSecondaryLink: z.string().min(1, 'Secondary CTA Link is required'),
  imageMain: z.string().optional().or(z.literal('')),
  imageSecondary: z.string().optional().or(z.literal('')),
  isActive: z.boolean(),
});

export type HeroSection = z.infer<typeof HeroSectionSchema> & { id: string };

export type CreateHeroInput = {
  badge?: string;
  titlePartOne: string;
  titlePartTwo?: string;
  titleItalic: boolean;
  description: string;
  ctaPrimaryText: string;
  ctaPrimaryLink: string;
  ctaSecondaryText: string;
  ctaSecondaryLink: string;
  imageMain: string;
  imageSecondary?: string;
  isActive: boolean;
};