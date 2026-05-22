import { Package, Truck, MapPin, ShieldCheck, CheckCircle2, Clock, ExternalLink } from 'lucide-react';
import { z } from 'zod';
import { CargoStatusSchema, VariantSchema, WarehouseSchema, type LogisticVariant as Variant } from '@amber/shared';
import type { CargoStatus, Warehouse, CargoShipment } from '@amber/shared';

export { CargoStatusSchema, VariantSchema, WarehouseSchema };
export type { CargoStatus, Variant, Warehouse, CargoShipment };

export interface GroupedInventory {
  variant: Variant & { id: string };
  product: { id: string; name: string; images: string[] };
  warehouses: { warehouseId: string; warehouseName: string; quantity: number }[];
  totalStock: number;
}

export const STATUS_CONFIG: Record<CargoStatus, { label: string; icon: typeof Package; color: string; bg: string; border: string }> = {
  PREPARING: { label: 'Preparing', icon: Package, color: 'text-slate-500', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
  DEPARTED: { label: 'Departed USA', icon: ExternalLink, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  IN_TRANSIT: { label: 'In Transit', icon: Truck, color: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
  ARRIVED_MYANMAR: { label: 'Arrived Myanmar', icon: MapPin, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  CUSTOMS_CLEARANCE: { label: 'Customs', icon: ShieldCheck, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  READY_FOR_DISTRIBUTION: { label: 'Ready', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  COMPLETED: { label: 'Inventory Synced', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-600/10', border: 'border-emerald-600/20' },
};