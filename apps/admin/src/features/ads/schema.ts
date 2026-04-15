import { z } from 'zod';

export enum AdPlacement {
  TOP_BAR = 'TOP_BAR',
  HOME_HERO = 'HOME_HERO',
  HOME_BANNER = 'HOME_BANNER',
  PRODUCT_PAGE = 'PRODUCT_PAGE',
  POPUP = 'POPUP'
}

export enum AdStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED'
}

export const adSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  imageUrl: z.string().url('Invalid image URL'),
  linkUrl: z.string().optional(),
  placement: z.nativeEnum(AdPlacement),
  status: z.nativeEnum(AdStatus),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  priority: z.number().int().min(0)
});

export type AdFormData = z.infer<typeof adSchema>;

export interface Ad extends AdFormData {
  id: string;
  createdAt: string;
}
