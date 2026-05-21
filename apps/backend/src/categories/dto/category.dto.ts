import { z } from 'zod';
import { CategoryBaseSchema, BrandBaseSchema, CategoryReorderSchema } from '@amber/shared';

export const CreateCategoryDto = CategoryBaseSchema.extend({
  slug: z.string().regex(/^[a-z0-9-_]+$/, 'Slug must be alphanumeric/hyphens').optional(),
  description: z.string().optional().nullable(),
  image: z.string().url().optional().nullable(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  displayOrder: z.number().int().default(0),
  parentId: z.string().uuid().optional().nullable(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
});

export const UpdateCategoryDto = CreateCategoryDto.partial();

export type CreateCategoryDto = z.infer<typeof CreateCategoryDto>;
export type UpdateCategoryDto = z.infer<typeof UpdateCategoryDto>;

export const CategoryReorderDto = CategoryReorderSchema;
export type CategoryReorderDto = z.infer<typeof CategoryReorderDto>;

export const CreateBrandDto = BrandBaseSchema;
export const UpdateBrandDto = BrandBaseSchema.partial();

export type CreateBrandDto = z.infer<typeof CreateBrandDto>;
export type UpdateBrandDto = z.infer<typeof UpdateBrandDto>;
