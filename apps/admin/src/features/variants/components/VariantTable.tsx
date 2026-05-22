import React from 'react';
import { Trash2, Edit2, Package, Power } from 'lucide-react';
import { Variant } from '../schema';

interface VariantTableProps {
  variants: Variant[];
  onEdit: (variant: Variant) => void;
  onDelete: (id: string) => void;
}

export const VariantTable: React.FC<VariantTableProps> = ({ variants, onEdit, onDelete }) => {
  if (variants.length === 0) {
    return (
      <div className="py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic border border-border bg-background">
        No stock variants detected.
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden border border-border bg-background">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Product Identification</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Configuration</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground text-center">Inventory Status</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {variants.map((variant) => (
            <tr key={variant.id} className="group hover:bg-muted/30 transition-colors duration-300">
              <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-secondary/50 text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 rounded-none border border-border">
                    <Package size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold uppercase tracking-tight text-foreground">
                      {(variant as any).product?.name || (variant as any).productName || 'Unlinked Product'}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{variant.sku || 'No SKU'}</span>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-secondary text-[10px] font-bold uppercase tracking-widest border border-border">
                    {variant.size}
                  </span>
                  <div className="flex items-center gap-2 px-3 py-1 bg-secondary border border-border">
                    <span className="w-2 h-2 rounded-full ring-1 ring-border shadow-sm" style={{ backgroundColor: variant.color.toLowerCase() }}></span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{variant.color}</span>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col items-center gap-1.5">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${variant.stock > (variant.lowStockThreshold || 5) ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`}></div>
                    <span className="text-sm font-mono font-bold text-foreground">{variant.stock.toLocaleString()}</span>
                  </div>
                  <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Units in stock</span>
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button 
                    onClick={() => onEdit(variant)} 
                    className="p-2.5 text-muted-foreground hover:text-foreground transition-colors"
                    title="Refine Variant"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => variant.id && onDelete(variant.id)} 
                    className="p-2.5 text-muted-foreground hover:text-destructive transition-colors"
                    title="Delete Variant"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
