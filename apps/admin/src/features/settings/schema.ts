import { z } from 'zod';

export const SettingsSchema = z.object({
  id: z.string().uuid().optional(),
  privacyPolicy: z.string().nullable().optional(),
  termsConditions: z.string().nullable().optional(),
  usdToMmkRate: z.union([z.string(), z.number()]).transform((val) => 
    typeof val === 'string' ? parseFloat(val) : val
  ),
  stripePublishableKey: z.string().nullable().optional(),
  stripeSecretKey: z.string().nullable().optional(),
  stripeWebhookSecret: z.string().nullable().optional(),
});

export type Settings = z.infer<typeof SettingsSchema> & { id: string };