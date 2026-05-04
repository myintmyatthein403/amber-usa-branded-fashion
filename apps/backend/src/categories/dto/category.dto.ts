import { z } from 'zod';
import { CategorySchema, BrandSchema } from '@amber/shared';

export const CreateCategoryDto = CategorySchema;
export const UpdateCategoryDto = CategorySchema.partial();

export type CreateCategoryDto = z.infer<typeof CreateCategoryDto>;
export type UpdateCategoryDto = z.infer<typeof UpdateCategoryDto>;

export const CreateBrandDto = BrandSchema;
export const UpdateBrandDto = BrandSchema.partial();

export type CreateBrandDto = z.infer<typeof CreateBrandDto>;
export type UpdateBrandDto = z.infer<typeof UpdateBrandDto>;