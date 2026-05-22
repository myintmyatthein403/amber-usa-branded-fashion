import React from 'react';
import { Warehouse as WarehouseIcon, MapPin, ChevronRight, Pencil } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Warehouse } from '../schema';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface WarehouseListProps {
  warehouses: Warehouse[] | null;
  onOpenInventory: (warehouse: Warehouse) => void;
  onEdit: (warehouse: Warehouse) => void;
}

export const WarehouseList: React.FC<WarehouseListProps> = ({ warehouses, onOpenInventory, onEdit }) => {
  if (!warehouses || warehouses.length === 0) {
    return (
      <div className="col-span-full py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic">No warehouse nodes registered.</div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {warehouses.map((w) => (
        <div key={w.id} className="group bg-card border border-border p-8 shadow-sm hover:border-primary/30 transition-all duration-500 relative overflow-hidden">
           <div className="absolute -right-4 -bottom-4 text-muted-foreground/5 group-hover:text-primary/5 transition-colors duration-500">
              <WarehouseIcon size={120} />
           </div>

           <div className="relative z-10 space-y-6">
              <div className="flex items-start justify-between">
                 <div className={cn(
                   "px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest border",
                   w.location === 'USA' ? "bg-blue-500/10 border-blue-500/20 text-blue-500" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                 )}>
                    {w.location}
                 </div>
                 <div className="text-[10px] font-mono text-muted-foreground/40">ID: {w.id.substring(0,8)}</div>
              </div>

              <div className="space-y-2">
                 <h3 className="text-2xl font-serif text-foreground group-hover:text-primary transition-colors">{w.name}</h3>
                 <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-widest truncate">{w.address || 'Standard Protocol Address'}</span>
                 </div>
              </div>

<div className="pt-6 border-t border-border flex items-center justify-between">
                  <div className="space-y-1">
                     <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Managed Stock</div>
                     <div className="text-xl font-mono font-bold text-foreground">{(w as any)._count?.inventory || 0} <span className="text-[10px] text-muted-foreground font-normal">SKUs</span></div>
                  </div>
                  <div className="flex items-center gap-2">
                     <button 
                       onClick={() => onEdit(w)}
                       className="p-3 bg-secondary text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-300 rounded-full"
                       title="Edit"
                     >
                       <Pencil size={16} />
                     </button>
                     <button 
                       onClick={() => onOpenInventory(w)}
                       className="p-3 bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300 rounded-full"
                     >
                       <ChevronRight size={16} />
                     </button>
                  </div>
               </div>
           </div>
        </div>
      ))}
    </div>
  );
};
