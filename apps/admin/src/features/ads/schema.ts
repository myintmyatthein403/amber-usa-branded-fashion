import { z } from 'zod';

export const AdPlacementSchema = z.enum(['TOP_BAR', 'HOME_HERO', 'HOME_BANNER', 'PRODUCT_PAGE', 'POPUP']);
export const AdStatusSchema = z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']);
export const AdSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  imageUrl: z.string().url('Invalid image URL'),
  linkUrl: z.string().optional(),
  placement: AdPlacementSchema,
  status: AdStatusSchema,
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  priority: z.number().int().min(0)
});

export const AdPlacement = {
  TOP_BAR: 'TOP_BAR',
  HOME_HERO: 'HOME_HERO',
  HOME_BANNER: 'HOME_BANNER',
  PRODUCT_PAGE: 'PRODUCT_PAGE',
  POPUP: 'POPUP'
} as const;

export type AdPlacement = 'TOP_BAR' | 'HOME_HERO' | 'HOME_BANNER' | 'PRODUCT_PAGE' | 'POPUP';

export const AdStatus = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  ARCHIVED: 'ARCHIVED'
} as const;

export type AdStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

export type Ad = {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  placement: AdPlacement;
  status: AdStatus;
  startDate?: string | null;
  endDate?: string | null;
  priority: number;
  createdAt: string;
};

export type AdFormData = {
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  placement: AdPlacement;
  status: AdStatus;
  startDate?: string | null;
  endDate?: string | null;
  priority: number;
};

export type CreateAdInput = AdFormData & { id?: string };