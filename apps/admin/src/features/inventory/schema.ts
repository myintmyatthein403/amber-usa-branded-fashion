import { z } from 'zod';
import { InventorySchema, WarehouseSchema, VariantSchema, type LogisticVariant as Variant } from '@amber/shared';
import type { Inventory, Warehouse } from '@amber/shared';

export { InventorySchema, WarehouseSchema, VariantSchema };
export type { Inventory, Warehouse, Variant };

export interface GroupedInventory {
  kind: 'variant' | 'product';
  id: string;
  displayName: string;
  images: string[];
  sku?: string;
  size?: string;
  color?: string;
  product: { id: string; name: string; images: string[] };
  stocks: Record<string, number>;
  totalStock: number;
}

export function formatInventoryRowLabel(item: {
  variantId?: string | null;
  productId?: string | null;
  variant?: { sku?: string; size?: string; color?: string; product?: { id: string; name: string; images: string[] } } | null;
  product?: { id: string; name: string; images: string[] } | null;
}) {
  const isVariant = !!item.variantId;
  const product = isVariant ? item.variant?.product : item.product;
  return {
    kind: (isVariant ? 'variant' : 'product') as 'variant' | 'product',
    name: product?.name || '',
    images: product?.images || [],
    sku: isVariant ? item.variant?.sku : undefined,
    size: isVariant ? item.variant?.size : undefined,
    color: isVariant ? item.variant?.color : undefined,
  };
}
