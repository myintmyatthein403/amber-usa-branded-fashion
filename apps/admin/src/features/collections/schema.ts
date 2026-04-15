import { z } from 'zod';

export const CollectionSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
});

export type Collection = z.infer<typeof CollectionSchema> & { id: string };
