import { z } from 'zod';

export const VariantProductSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const VariantSchema = z.object({
  id: z.string().uuid().optional(),
  size: z.string().min(1, 'Size is required'),
  color: z.string().min(1, 'Color is required'),
  stock: z.number().min(0),
  productId: z.string().min(1, 'Product selection is required'),
  warehouseId: z.string().optional(),
});

export type VariantProduct = z.infer<typeof VariantProductSchema>;
export type Variant = z.infer<typeof VariantSchema> & {
  id: string;
  product?: VariantProduct;
};
