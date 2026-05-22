import { z } from 'zod';
import { BrandSchema } from '@amber/shared';

export const CreateBrandDto = BrandSchema;
export const UpdateBrandDto = BrandSchema.partial();

export type CreateBrandDto = z.infer<typeof CreateBrandDto>;
export type UpdateBrandDto = z.infer<typeof UpdateBrandDto>;
