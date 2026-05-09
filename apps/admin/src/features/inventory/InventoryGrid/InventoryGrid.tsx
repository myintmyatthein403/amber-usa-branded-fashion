import React from 'react';
import { Package } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { GroupedInventory, Warehouse } from '../schema';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface InventoryGridProps {
  groupedInventory: GroupedInventory[];
  warehouses: Warehouse[];
}

export const InventoryGrid: React.FC<InventoryGridProps> = ({ 
  groupedInventory, 
  warehouses 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
       {groupedInventory.map((group) => {
         const prod = group.variant.product;
         const images = prod?.images || [];
         const name = prod?.name || '';
         return (
         <div key={group.variant.id} className="bg-card border border-border p-6 space-y-6 hover:border-primary/30 transition-all group shadow-sm">
            <div className="flex items-start justify-between">
               <div className="w-16 h-16 bg-muted border border-border flex items-center justify-center overflow-hidden">
                  {images[0] ? (
                    <img src={images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Package size={20} className="text-muted-foreground/30" />
                  )}
               </div>
                <div className="text-right">
                   <div className="text-2xl font-serif font-bold text-primary">{group.totalStock}</div>
                   <div className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Global Stock</div>
                </div>
            </div>

            <div className="space-y-1">
               <h4 className="text-sm font-bold text-foreground leading-tight group-hover:text-primary transition-colors">{name}</h4>
               <p className="text-[10px] font-mono text-muted-foreground">{group.variant.sku} • {group.variant.size} • {group.variant.color}</p>
            </div>

            <div className="pt-6 border-t border-border space-y-3">
                {warehouses.map(w => (
                  <div key={w.id} className="flex justify-between items-center text-[10px]">
                     <div className="flex items-center gap-2">
                        <span className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          w.location === 'USA' ? "bg-blue-500" : "bg-emerald-500"
                        )}></span>
                        <span className="font-bold uppercase tracking-widest text-muted-foreground">{w.name}</span>
                     </div>
                     <span className="font-mono font-bold text-foreground">{group.stocks[w.id!] || 0}</span>
                  </div>
                ))}
            </div>
         </div>
         );
       })}
    </div>
  );
};
