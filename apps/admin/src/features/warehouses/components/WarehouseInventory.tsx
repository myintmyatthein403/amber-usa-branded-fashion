import React from 'react';
import { Search, Loader2, Package, Box } from 'lucide-react';
import { Warehouse } from '../schema';

interface WarehouseInventoryProps {
  warehouse: Warehouse | null;
  inventorySearch: string;
  setInventorySearch: (value: string) => void;
  filteredInventory: any[];
  loadingInventory: boolean;
}

export const WarehouseInventory: React.FC<WarehouseInventoryProps> = ({
  warehouse,
  inventorySearch,
  setInventorySearch,
  filteredInventory,
  loadingInventory
}) => {
  return (
    <div className="space-y-8 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between border-b border-border pb-8">
        <div className="space-y-1">
          <h3 className="text-2xl font-serif text-foreground">{warehouse?.name}</h3>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{warehouse?.location} JURISDICTION</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
          <input 
            type="text" 
            placeholder="Search by product or SKU..." 
            value={inventorySearch}
            onChange={(e) => setInventorySearch(e.target.value)}
            className="w-full bg-secondary border border-border pl-10 pr-4 py-2.5 text-[10px] uppercase tracking-widest focus:border-primary focus:outline-none transition-colors" 
          />
        </div>
      </div>

      {loadingInventory ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-primary" size={32} />
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground italic">Auditing Stock Levels...</p>
        </div>
      ) : filteredInventory.length === 0 ? (
        <div className="py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic">No matching inventory units found.</div>
      ) : (
        <div className="grid grid-cols-1 gap-2">
          {filteredInventory.map((item) => (
            <div key={item.id} className="group flex items-center justify-between p-4 bg-card border border-border hover:border-primary/30 transition-all duration-300">
               <div className="flex items-center gap-6">
                  <div className="w-12 h-16 bg-secondary flex-shrink-0 border border-border overflow-hidden">
                     {item.variant.product.images?.[0] && <img src={item.variant.product.images[0]} className="w-full h-full object-cover" />}
                  </div>
                  <div>
                     <div className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{item.variant.product.name}</div>
                     <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[9px] font-mono font-bold text-muted-foreground bg-muted px-2 py-0.5 border border-border">{item.variant.sku}</span>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-primary">{item.variant.size} / {item.variant.color}</span>
                     </div>
                  </div>
               </div>
               <div className="text-right space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Available Allocation</div>
                  <div className="text-xl font-mono font-bold text-foreground flex items-center justify-end gap-2">
                     <Box size={16} className="text-primary/40"/>
                     {item.stock}
                  </div>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
