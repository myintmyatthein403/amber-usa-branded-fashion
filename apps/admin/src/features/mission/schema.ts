import { z } from 'zod';

export const MissionSectionSchema = z.object({
  id: z.string().uuid().optional(),
  badge: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  titleItalic: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  descriptionSecondary: z.string().optional(),
  featureOneTitle: z.string().optional(),
  featureOneDescription: z.string().optional(),
  featureTwoTitle: z.string().optional(),
  featureTwoDescription: z.string().optional(),
  trustBadgeText: z.string().optional(),
  imageMain: z.string().url('Invalid URL for Main Image'),
  imageSecondary: z.string().url('Invalid URL for Secondary Image').optional().or(z.literal('')),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
  isActive: z.boolean(),
});

export type MissionSection = z.infer<typeof MissionSectionSchema> & { id: string };
export type CreateMissionInput = z.infer<typeof MissionSectionSchema>;
