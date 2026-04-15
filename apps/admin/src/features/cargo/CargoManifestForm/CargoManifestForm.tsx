import React from 'react';
import { Loader2 } from 'lucide-react';

interface CargoManifestFormProps {
  warehouses: any[] | null;
  variants: any[] | null;
  formData: any;
  setFormData: (data: any) => void;
  selectedVariantId: string;
  setSelectedVariantId: (id: string) => void;
  selectedQuantity: number;
  setSelectedQuantity: (qty: number) => void;
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  submitting: boolean;
}

export const CargoManifestForm: React.FC<CargoManifestFormProps> = ({
  warehouses,
  variants,
  formData,
  setFormData,
  selectedVariantId,
  setSelectedVariantId,
  selectedQuantity,
  setSelectedQuantity,
  onAddItem,
  onRemoveItem,
  onSubmit,
  onCancel,
  submitting
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-8 py-4 animate-in fade-in slide-in-from-bottom-4">
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-gray-500">Origin Warehouse</label>
          <select
            required
            value={formData.originId}
            onChange={(e) => setFormData({ ...formData, originId: e.target.value })}
            className="w-full h-12 border-b border-gray-200 bg-transparent px-0 py-2 text-base font-medium focus:border-primary focus:outline-none transition-colors rounded-none"
          >
            <option value="">Select Origin</option>
            {warehouses?.map((w: any) => (
              <option key={w.id} value={w.id}>{w.name} ({w.location})</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-gray-500">Destination Warehouse</label>
          <select
            required
            value={formData.destinationId}
            onChange={(e) => setFormData({ ...formData, destinationId: e.target.value })}
            className="w-full h-12 border-b border-gray-200 bg-transparent px-0 py-2 text-base font-medium focus:border-primary focus:outline-none transition-colors rounded-none"
          >
            <option value="">Select Destination</option>
            {warehouses?.map((w: any) => (
              <option key={w.id} value={w.id}>{w.name} ({w.location})</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-gray-500">Logistics Carrier</label>
          <input
            type="text"
            placeholder="e.g. DHL, FedEx, Local Cargo"
            value={formData.carrier}
            onChange={(e) => setFormData({ ...formData, carrier: e.target.value })}
            className="w-full h-12 border-b border-gray-200 bg-transparent px-0 py-2 text-base font-medium placeholder:text-gray-300 focus:border-primary focus:outline-none transition-colors rounded-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-gray-500">Tracking Number</label>
          <input
            type="text"
            placeholder="Assignment pending..."
            value={formData.trackingNumber}
            onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
            className="w-full h-12 border-b border-gray-200 bg-transparent px-0 py-2 text-base font-mono font-medium placeholder:text-gray-300 focus:border-primary focus:outline-none transition-colors rounded-none"
          />
        </div>
      </div>

      <div className="space-y-4 pt-4">
         <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Manifest Items</h4>
         <div className="flex gap-4 items-end bg-muted/30 p-4 border border-border">
            <div className="flex-1 space-y-2">
               <label className="text-[8px] uppercase font-bold text-muted-foreground">Select SKU</label>
               <select
                 value={selectedVariantId}
                 onChange={(e) => setSelectedVariantId(e.target.value)}
                 className="w-full h-10 bg-white border border-border px-3 text-xs focus:border-primary focus:outline-none"
               >
                 <option value="">Select Variant</option>
                 {variants?.map((v: any) => (
                   <option key={v.id} value={v.id}>{v.product.name} - {v.size} / {v.color} ({v.sku})</option>
                 ))}
               </select>
            </div>
            <div className="w-24 space-y-2">
               <label className="text-[8px] uppercase font-bold text-muted-foreground">Quantity</label>
               <input
                 type="number"
                 min="1"
                 value={selectedQuantity}
                 onChange={(e) => setSelectedQuantity(parseInt(e.target.value))}
                 className="w-full h-10 bg-white border border-border px-3 text-xs focus:border-primary focus:outline-none"
               />
            </div>
            <button 
              type="button" 
              onClick={onAddItem}
              className="h-10 px-6 bg-secondary text-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all"
            >
              Add
            </button>
         </div>

         <div className="border border-border">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-muted/50 border-b border-border">
                     <th className="px-4 py-2 text-[8px] font-bold uppercase text-muted-foreground">Item Specification</th>
                     <th className="px-4 py-2 text-[8px] font-bold uppercase text-muted-foreground text-center">QTY</th>
                     <th className="px-4 py-2 text-[8px] font-bold uppercase text-muted-foreground text-right">Action</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-border">
                  {formData.items.length === 0 ? (
                    <tr><td colSpan={3} className="px-4 py-8 text-center text-[10px] text-muted-foreground italic">Manifest is currently empty.</td></tr>
                  ) : formData.items.map((item: any) => {
                    const v = variants?.find((v: any) => v.id === item.variantId);
                    return (
                      <tr key={item.variantId}>
                         <td className="px-4 py-3">
                            <div className="text-xs font-bold">{v?.product?.name}</div>
                            <div className="text-[9px] font-mono text-muted-foreground uppercase">{v?.sku} / {v?.size} - {v?.color}</div>
                         </td>
                         <td className="px-4 py-3 text-center text-xs font-mono font-bold">{item.quantity}</td>
                         <td className="px-4 py-3 text-right">
                            <button type="button" onClick={() => onRemoveItem(item.variantId)} className="text-destructive hover:text-destructive/70">Remove</button>
                         </td>
                      </tr>
                    );
                  })}
               </tbody>
            </table>
         </div>
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t border-border">
        <button
          type="button"
          onClick={onCancel}
          className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground px-4 transition-colors"
        >
          Discard
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-3 bg-primary text-primary-foreground px-10 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-xl"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          Launch Shipment Manifest
        </button>
      </div>
    </form>
  );
};
