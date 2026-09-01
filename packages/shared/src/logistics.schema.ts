import { z } from 'zod';

export const WarehouseLocationSchema = z.enum(['USA', 'MYANMAR']);

export const WarehouseSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Warehouse name is required'),
  location: WarehouseLocationSchema.default('USA'),
  address: z.string().optional().nullable(),
});

export type Warehouse = z.infer<typeof WarehouseSchema>;

export const UpdateWarehouseSchema = WarehouseSchema.partial();

export type UpdateWarehouseInput = z.infer<typeof UpdateWarehouseSchema>;

export const InventorySchema = z.object({
  variantId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
  warehouseId: z.string().uuid(),
  quantity: z.number().min(0, 'Quantity cannot be negative'),
}).refine((d) => !!d.variantId !== !!d.productId, {
  message: 'Exactly one of variantId or productId is required',
});

export type Inventory = z.infer<typeof InventorySchema>;

// SET replaces the warehouse's absolute quantity (the original behavior —
// e.g. a physical recount). DELTA applies a +/- change and records that
// change (not the resulting total) on the StockMovement ledger, which is
// what makes DAMAGE/SALE/RESTOCK entries actually self-explanatory instead
// of requiring the operator to mentally diff two absolute numbers.
export const StockAdjustmentModeSchema = z.enum(['SET', 'DELTA']);
export type StockAdjustmentMode = z.infer<typeof StockAdjustmentModeSchema>;

export const StockMovementReasonSchema = z.enum([
  'ADJUSTMENT',
  'RECEIVING',
  'DAMAGE',
  'SALE',
  'RESTOCK',
]);
export type StockMovementReasonInput = z.infer<typeof StockMovementReasonSchema>;

export const UpdateStockSchema = z.object({
  variantId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
  warehouseId: z.string().uuid(),
  mode: StockAdjustmentModeSchema.default('SET'),
  quantity: z.number(),
  reason: StockMovementReasonSchema.optional(),
  note: z.string().optional(),
}).refine((d) => !!d.variantId !== !!d.productId, {
  message: 'Exactly one of variantId or productId is required',
}).refine((d) => d.mode === 'DELTA' || d.quantity >= 0, {
  message: 'Quantity cannot be negative in SET mode',
  path: ['quantity'],
}).refine((d) => d.mode !== 'DELTA' || d.quantity !== 0, {
  message: 'Delta quantity cannot be zero',
  path: ['quantity'],
});

export type UpdateStockInput = z.infer<typeof UpdateStockSchema>;

export const TransferStockSchema = z.object({
  variantId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
  fromWarehouseId: z.string().uuid(),
  toWarehouseId: z.string().uuid(),
  quantity: z.number().positive('Quantity must be greater than zero'),
  note: z.string().optional(),
}).refine((d) => !!d.variantId !== !!d.productId, {
  message: 'Exactly one of variantId or productId is required',
}).refine((d) => d.fromWarehouseId !== d.toWarehouseId, {
  message: 'Origin and destination warehouse must differ',
  path: ['toWarehouseId'],
});

export type TransferStockInput = z.infer<typeof TransferStockSchema>;

export const BulkTransferStockSchema = z.object({
  fromWarehouseId: z.string().uuid(),
  toWarehouseId: z.string().uuid(),
  items: z.array(
    z.object({
      variantId: z.string().uuid().optional(),
      productId: z.string().uuid().optional(),
      quantity: z.number().positive('Quantity must be greater than zero'),
    }).refine((d) => !!d.variantId !== !!d.productId, {
      message: 'Exactly one of variantId or productId is required',
    }),
  ).min(1, 'At least one item is required'),
  note: z.string().optional(),
}).refine((d) => d.fromWarehouseId !== d.toWarehouseId, {
  message: 'Origin and destination warehouse must differ',
  path: ['toWarehouseId'],
});

export type BulkTransferStockInput = z.infer<typeof BulkTransferStockSchema>;

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
  product: z.object({
    id: z.string(),
    name: z.string(),
    images: z.array(z.string()),
  }).optional(),
});

export type Variant = z.infer<typeof VariantSchema>;

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
