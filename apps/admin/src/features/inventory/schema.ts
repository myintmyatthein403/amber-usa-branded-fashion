import { z } from 'zod';
import { InventorySchema, WarehouseSchema, VariantSchema, type LogisticVariant as Variant } from '@amber/shared';
import type { Inventory, Warehouse } from '@amber/shared';

export { InventorySchema, WarehouseSchema, VariantSchema };
export type { Inventory, Warehouse, Variant };

export interface GroupedInventory {
  variant: Variant & { id: string };
  product: { id: string; name: string; images: string[] };
  stocks: Record<string, number>;
  totalStock: number;
}