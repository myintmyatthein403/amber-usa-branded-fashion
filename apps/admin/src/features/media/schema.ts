import { z } from 'zod';

export const MediaItemSchema = z.object({
  id: z.string().uuid(),
  url: z.string().url(),
  publicId: z.string(),
  fileName: z.string(),
  format: z.string(),
  size: z.number(),
  width: z.number().optional(),
  height: z.number().optional(),
  createdAt: z.string().datetime(),
});

export type MediaItem = z.infer<typeof MediaItemSchema>;