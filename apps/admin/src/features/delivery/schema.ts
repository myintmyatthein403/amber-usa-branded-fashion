import { z } from 'zod';

export const DeliveryMethodSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().nullable().optional(),
  price: z.number().min(0),
  isUsdPrice: z.boolean().default(false),
  isDigital: z.boolean().default(false),
  estimatedDays: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
  freeOverAmount: z.number().nullable().optional(),
  logoUrl: z.string().nullable().optional(),
  logoLink: z.string().nullable().optional(),
  locationPrices: z.record(z.number()).nullable().optional(),
});

export type DeliveryMethod = z.infer<typeof DeliveryMethodSchema> & { id: string };
export type CreateDeliveryMethodInput = z.infer<typeof DeliveryMethodSchema>;