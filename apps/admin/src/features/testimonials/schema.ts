import { z } from 'zod';

export const TestimonialSchema = z.object({
  id: z.string().uuid().optional(),
  text: z.string().min(1, 'Testimonial text is required'),
  author: z.string().min(1, 'Author name is required'),
  location: z.string().optional(),
  role: z.string().optional(),
  rating: z.number().min(1).max(5).default(5),
  isActive: z.boolean().default(true),
});

export type Testimonial = z.infer<typeof TestimonialSchema> & { id: string };