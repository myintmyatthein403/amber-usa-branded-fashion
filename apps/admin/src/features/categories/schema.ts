import { z } from 'zod';

export const CategorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Category name is required'),
  slug: z.string().optional(),
  description: z.string().optional(),
  image: z.string().url().optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  displayOrder: z.number().int().default(0),
  parentId: z.string().uuid().optional().nullable(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  parent: z.any().optional(),
  subcategories: z.array(z.any()).optional(),
  _count: z.object({ products: z.number() }).optional(),
});

export type Category = z.infer<typeof CategorySchema> & { id: string };