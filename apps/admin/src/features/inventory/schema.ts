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

export type InventoryItem = z.infer<typeof InventoryItemSchema>;

export interface GroupedInventory {
  variant: InventoryItem['variant'];
  stocks: Record<string, number>;
  total: number;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
}
