import { z } from 'zod';

export const CategoryReorderItemSchema = z.object({
  id: z.string().uuid(),
  parentId: z.string().uuid().nullable(),
  displayOrder: z.number().int().min(0),
});

export const CategoryReorderSchema = z
  .array(CategoryReorderItemSchema)
  .min(1, 'At least one category is required');

export type CategoryReorderItem = z.infer<typeof CategoryReorderItemSchema>;
export type CategoryReorderPayload = z.infer<typeof CategoryReorderSchema>;
