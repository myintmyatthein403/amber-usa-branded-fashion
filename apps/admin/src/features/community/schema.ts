import { z } from 'zod';

export const CommunityPostSchema = z.object({
  id: z.string().uuid().optional(),
  user: z.string().min(1, 'Username is required'),
  handle: z.string().min(1, 'Handle is required'),
  comment: z.string().min(1, 'Comment is required'),
  image: z.string().min(1, 'Image is required'),
  stars: z.number().min(1).max(5).default(5),
  likes: z.number().min(0).default(0),
  isActive: z.boolean().default(true),
});

export type CommunityPost = z.infer<typeof CommunityPostSchema> & { id: string };