import { z } from 'zod';

export const GiftCardSchema = z.object({
  id: z.string().uuid().optional(),
  code: z.string().min(1, 'Code is required'),
  initialBalance: z.number().min(0),
  currentBalance: z.number().min(0),
  expiryDate: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
  note: z.string().nullable().optional(),
});

export type GiftCard = z.infer<typeof GiftCardSchema> & { id: string };
