import { z } from 'zod';

export const FooterSectionSchema = z.object({
  id: z.string().uuid().optional(),
  companyName: z.string().min(1, 'Company Name is required'),
  companySubtitle: z.string().min(1, 'Company Subtitle is required'),
  companyDescription: z.string().min(1, 'Company Description is required'),
  instagramUrl: z.string().url('Invalid URL for Instagram').optional().or(z.literal('')),
  facebookUrl: z.string().url('Invalid URL for Facebook').optional().or(z.literal('')),
  contactAddress: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email('Invalid Email Address').optional().or(z.literal('')),
  copyrightText: z.string().optional(),
  isActive: z.boolean(),
});

export type FooterSection = z.infer<typeof FooterSectionSchema> & { id: string };
export type CreateFooterInput = z.infer<typeof FooterSectionSchema>;
