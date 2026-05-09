import { z } from 'zod';

export const WarehouseLocationSchema = z.enum(['USA', 'MYANMAR']);

export const WarehouseSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Warehouse name is required'),
  location: WarehouseLocationSchema.default('USA'),
  address: z.string().optional().nullable(),
});

export type Warehouse = z.infer<typeof WarehouseSchema>;

export const InventorySchema = z.object({
  variantId: z.string().uuid(),
  warehouseId: z.string().uuid(),
  quantity: z.number().min(0, 'Quantity cannot be negative'),
});

export type Inventory = z.infer<typeof InventorySchema>;

export const CargoStatusSchema = z.enum([
  'PREPARING',
  'DEPARTED',
  'IN_TRANSIT',
  'ARRIVED_MYANMAR',
  'CUSTOMS_CLEARANCE',
  'READY_FOR_DISTRIBUTION',
  'COMPLETED',
]);

export type CargoStatus = z.infer<typeof CargoStatusSchema>;

export const VariantSchema = z.object({
  id: z.string().uuid().optional(),
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().optional(),
  size: z.string().min(1, 'Size is required'),
  color: z.string().min(1, 'Color is required'),
  stock: z.number().min(0),
  price: z.number().optional(),
  images: z.array(z.string()).default([]),
  isPreOrder: z.boolean().default(false),
  warehouseId: z.string().optional(),
  lowStockThreshold: z.number().min(0).default(5),
  weight: z.number().min(0).default(0),
  productId: z.string().uuid().optional(),
});

export type Variant = z.infer<typeof VariantSchema> & { id: string; product?: { id: string; name: string; images: string[] } };

export interface CargoShipment {
  id: string;
  shipmentNumber: string;
  status: CargoStatus;
  carrier?: string;
  trackingNumber?: string;
  origin: { name: string; location: string };
  destination: { name: string; location: string };
  items?: unknown[];
  _count: { items: number };
  createdAt: string;
}
