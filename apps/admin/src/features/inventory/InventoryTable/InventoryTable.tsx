import React from 'react';
import { Package, Edit2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { GroupedInventory, Warehouse } from '../schema';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface InventoryTableProps {
  groupedInventory: GroupedInventory[];
  warehouses: Warehouse[];
  onAdjust: (group: GroupedInventory, warehouseId?: string) => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({ 
  groupedInventory, 
  warehouses, 
  onAdjust 
}) => {
  return (
    <div className="border border-border bg-card shadow-sm overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[1000px]">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="px-8 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">Product Details</th>
            <th className="px-8 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">SKU / Specs</th>
            {warehouses.map(w => (
              <th key={w.id} className="px-8 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase text-center">
                <div className="flex flex-col items-center gap-1">
                   <span className={cn(
                     "px-2 py-0.5 rounded-full text-[7px] border",
                     w.location === 'USA' ? "bg-blue-500/10 border-blue-500/20 text-blue-500" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                   )}>{w.location}</span>
                   {w.name.split(' ')[0]}
                </div>
              </th>
            ))}
            <th className="px-8 py-5 text-[10px] font-bold tracking-[0.2em] text-primary uppercase text-center bg-primary/5 border-l border-border">Global Total</th>
            <th className="px-8 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {groupedInventory.map((group) => (
            <tr key={group.variant.id} className="group hover:bg-muted/50 transition-colors duration-300">
              <td className="px-8 py-5">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-muted border border-border flex items-center justify-center overflow-hidden">
                      {group.variant.product.images?.[0] ? (
                        <img src={group.variant.product.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Package size={16} className="text-muted-foreground/30" />
                      )}
                   </div>
                   <div className="space-y-1">
                      <div className="text-sm font-bold text-foreground leading-tight group-hover:text-primary transition-colors">{group.variant.product.name}</div>
                      <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Master ID: {group.variant.id.substring(0,8)}</div>
                   </div>
                </div>
              </td>
              <td className="px-8 py-5">
                <div className="space-y-1.5">
                   <div className="text-xs font-mono font-bold text-foreground">{group.variant.sku}</div>
                   <div className="flex gap-2">
                      <span className="px-2 py-0.5 bg-secondary text-[8px] font-bold uppercase tracking-widest border border-border">{group.variant.size}</span>
                      <span className="px-2 py-0.5 bg-secondary text-[8px] font-bold uppercase tracking-widest border border-border">{group.variant.color}</span>
                   </div>
                </div>
              </td>
              {warehouses.map(w => {
                const qty = group.stocks[w.id] || 0;
                return (
                  <td key={w.id} className="px-8 py-5 text-center">
                    <button 
                      onClick={() => onAdjust(group, w.id)}
                      className={cn(
                        "text-sm font-mono font-bold hover:text-primary hover:underline underline-offset-4 decoration-dashed",
                        qty === 0 ? "text-muted-foreground/30" : "text-foreground"
                      )}>
                      {qty}
                    </button>
                  </td>
                );
              })}
              <td className="px-8 py-5 text-center bg-primary/5 border-l border-border">
                <div className="flex flex-col items-center">
                   <span className={cn(
                     "text-lg font-serif font-bold",
                     group.total > 0 ? "text-primary" : "text-destructive"
                   )}>
                     {group.total}
                   </span>
                   <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Units</span>
                </div>
              </td>
              <td className="px-8 py-5 text-right">
                <button 
                  onClick={() => onAdjust(group)}
                  className="p-2.5 bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                >
                   <Edit2 size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
