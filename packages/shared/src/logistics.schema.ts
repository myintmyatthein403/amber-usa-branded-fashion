import { z } from 'zod';

export const WarehouseSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Warehouse name is required'),
  location: z.enum(['USA', 'MYANMAR']),
  address: z.string().optional().nullable(),
});

export type Warehouse = z.infer<typeof WarehouseSchema>;

export const InventorySchema = z.object({
  variantId: z.string().uuid(),
  warehouseId: z.string().uuid(),
  quantity: z.number().min(0, 'Quantity cannot be negative'),
});

export type Inventory = z.infer<typeof InventorySchema>;
