import { z } from 'zod';

export const CategorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Category name is required'),
});

export type Category = z.infer<typeof CategorySchema> & { id: string };