import { z } from 'zod';
import { InventorySchema, WarehouseSchema, VariantSchema } from '@amber/shared';
import type { Inventory, Warehouse, Variant } from '@amber/shared';

export { InventorySchema, WarehouseSchema, VariantSchema };
export type { Inventory, Warehouse, Variant };

export interface GroupedInventory {
  variant: Variant & { id: string };
  product: { id: string; name: string; images: string[] };
  stocks: Record<string, number>;
  totalStock: number;
}