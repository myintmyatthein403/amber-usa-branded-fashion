import { z } from 'zod';

export const WarehouseLocationSchema = z.enum(['USA', 'MYANMAR']);

export const WarehouseSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Warehouse name is required'),
  location: WarehouseLocationSchema.default('USA'),
  address: z.string().optional(),
});

export type Warehouse = z.infer<typeof WarehouseSchema> & { id: string };