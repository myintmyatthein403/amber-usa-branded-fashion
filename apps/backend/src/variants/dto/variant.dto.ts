import { z } from 'zod';
import { VariantSchema } from '@amber/shared';

export const CreateVariantDto = VariantSchema;
export const UpdateVariantDto = VariantSchema.partial();

export type CreateVariantDto = z.infer<typeof CreateVariantDto>;
export type UpdateVariantDto = z.infer<typeof UpdateVariantDto>;

export const VariantStockUpdateDto = z.object({
  stock: z.number().min(0, 'Stock cannot be negative'),
});

export type VariantStockUpdateDto = z.infer<typeof VariantStockUpdateDto>;
