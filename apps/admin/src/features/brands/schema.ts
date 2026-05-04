import { z } from 'zod';

export const BrandSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Brand name is required'),
  logo: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
});

export type Brand = z.infer<typeof BrandSchema> & { id: string };