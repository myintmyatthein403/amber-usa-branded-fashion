import { z } from 'zod';

export const WarehouseSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Warehouse name is required'),
  location: z.enum(['USA', 'MYANMAR']),
  address: z.string().optional().nullable(),
});

export const InventorySchema = z.object({
  variantId: z.string().uuid(),
  warehouseId: z.string().uuid(),
  quantity: z.number().min(0, 'Quantity cannot be negative'),
});

export const CargoItemSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
});

export const CargoShipmentSchema = z.object({
  id: z.string().uuid().optional(),
  shipmentNumber: z.string().optional(),
  status: z.enum([
    'PREPARING',
    'DEPARTED',
    'IN_TRANSIT',
    'ARRIVED_MYANMAR',
    'CUSTOMS_CLEARANCE',
    'READY_FOR_DISTRIBUTION',
    'COMPLETED',
  ]).default('PREPARING'),
  carrier: z.string().optional().nullable(),
  trackingNumber: z.string().optional().nullable(),
  originId: z.string().uuid('Origin warehouse is required'),
  destinationId: z.string().uuid('Destination warehouse is required'),
  departureDate: z.string().optional().nullable(),
  arrivalDate: z.string().optional().nullable(),
  items: z.array(CargoItemSchema).min(1, 'Cargo must have at least one item'),
  notes: z.string().optional().nullable(),
});

export type Warehouse = z.infer<typeof WarehouseSchema>;
export type Inventory = z.infer<typeof InventorySchema>;
export type CargoItem = z.infer<typeof CargoItemSchema>;
export type CargoShipment = z.infer<typeof CargoShipmentSchema>;
