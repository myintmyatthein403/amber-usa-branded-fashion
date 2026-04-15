import { z } from 'zod';

export const BrandSchema = z.object({
  id: z.string(),
  name: z.string(),
  logo: z.string().optional(),
  note: z.string().optional(),
});

export type Brand = z.infer<typeof BrandSchema>;
