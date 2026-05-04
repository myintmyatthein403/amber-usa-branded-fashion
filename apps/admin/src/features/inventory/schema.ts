import { z } from 'zod';

export const InventoryItemSchema = z.object({
  id: z.string(),
  variantId: z.string(),
  warehouseId: z.string(),
  quantity: z.number(),
  warehouse: z.object({
    id: z.string(),
    name: z.string(),
    location: z.string(),
  }),
  variant: z.object({
    id: z.string(),
    sku: z.string(),
    size: z.string(),
    color: z.string(),
    stock: z.number(),
    product: z.object({
      id: z.string(),
      name: z.string(),
      images: z.array(z.string()),
    }),
  }),
});

export const WarehouseSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Warehouse name is required'),
  location: z.enum(['USA', 'MYANMAR']),
  address: z.string().optional().nullable(),
});

export type InventoryItem = z.infer<typeof InventoryItemSchema>;
export type Warehouse = z.infer<typeof WarehouseSchema>;

export interface GroupedInventory {
  variant: { id: string; sku: string; size: string; color: string; stock: number; product: { id: string; name: string; images: string[] } };
  stocks: Record<string, number>;
  total: number;
}