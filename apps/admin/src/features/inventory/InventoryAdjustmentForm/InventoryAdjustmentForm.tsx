import React from 'react';
import { Package, Minus, Plus, Loader2 } from 'lucide-react';
import { Warehouse } from '../schema';

interface InventoryAdjustmentFormProps {
  selectedVariant: any;
  selectedWarehouseId: string;
  adjustmentQty: number;
  warehouses: Warehouse[];
  submitting: boolean;
  onWarehouseChange: (id: string) => void;
  onQtyChange: (qty: number) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const InventoryAdjustmentForm: React.FC<InventoryAdjustmentFormProps> = ({
  selectedVariant,
  selectedWarehouseId,
  adjustmentQty,
  warehouses,
  submitting,
  onWarehouseChange,
  onQtyChange,
  onSubmit,
  onCancel
}) => {
  if (!selectedVariant) return null;

  return (
    <form onSubmit={onSubmit} className="space-y-8 py-4 animate-in fade-in slide-in-from-bottom-4">
       <div className="flex items-center gap-6 p-6 bg-muted/30 border border-border">
          <div className="w-20 h-20 bg-background border border-border flex items-center justify-center overflow-hidden">
             {selectedVariant.product.images?.[0] ? (
               <img src={selectedVariant.product.images[0]} alt="" className="w-full h-full object-cover" />
             ) : (
               <Package size={24} className="text-muted-foreground/30" />
             )}
          </div>
          <div>
             <div className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Target Specification</div>
             <div className="text-lg font-serif font-bold text-foreground leading-tight">{selectedVariant.product.name}</div>
             <div className="text-[9px] font-mono text-muted-foreground uppercase mt-1">{selectedVariant.sku} • {selectedVariant.size} • {selectedVariant.color}</div>
          </div>
       </div>

       <div className="space-y-6">
          <div className="space-y-2">
             <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Logistics Node (Warehouse)</label>
             <select
               required
               value={selectedWarehouseId}
               onChange={(e) => onWarehouseChange(e.target.value)}
               className="w-full h-12 border-b border-border bg-transparent px-0 py-2 text-sm font-bold uppercase tracking-widest focus:border-primary focus:outline-none transition-colors"
             >
               <option value="">Select Warehouse</option>
               {warehouses.map(w => (
                 <option key={w.id} value={w.id}>{w.name} ({w.location})</option>
               ))}
             </select>
          </div>

          <div className="space-y-4">
             <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Adjusted Quantity</label>
             <div className="flex items-center gap-6">
                <button 
                  type="button" 
                  onClick={() => onQtyChange(Math.max(0, adjustmentQty - 1))}
                  className="w-12 h-12 bg-secondary text-foreground flex items-center justify-center hover:bg-destructive hover:text-white transition-all"
                >
                  <Minus size={16} />
                </button>
                <input 
                  type="number"
                  min="0"
                  value={adjustmentQty}
                  onChange={(e) => onQtyChange(parseInt(e.target.value) || 0)}
                  className="flex-1 h-12 bg-muted/20 border-b border-border text-center text-2xl font-serif font-bold focus:border-primary focus:outline-none"
                />
                <button 
                  type="button" 
                  onClick={() => onQtyChange(adjustmentQty + 1)}
                  className="w-12 h-12 bg-secondary text-foreground flex items-center justify-center hover:bg-primary hover:text-white transition-all"
                >
                  <Plus size={16} />
                </button>
             </div>
             <p className="text-[9px] text-muted-foreground italic text-center uppercase tracking-wider">
                This action will directly override the current ledger value for this warehouse.
             </p>
          </div>
       </div>

       <div className="flex justify-end gap-4 pt-6 border-t border-border">
          <button
            type="button"
            onClick={onCancel}
            className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground px-4 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !selectedWarehouseId}
            className="flex items-center gap-3 bg-primary text-primary-foreground px-10 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-xl"
          >
            {submitting && <Loader2 size={16} className="animate-spin" />}
            Commit Adjustment
          </button>
       </div>
    </form>
  );
};
