import React from 'react';
import { Search, Loader2, Package, Box, Grid, List } from 'lucide-react';
import { Warehouse } from '../schema';
import { Pagination } from '../../../components/admin/Pagination';

interface WarehouseInventoryProps {
  warehouse: Warehouse | null;
  inventorySearch: string;
  setInventorySearch: (value: string) => void;
  inventory: any[];
  loadingInventory: boolean;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
}

export const WarehouseInventory: React.FC<WarehouseInventoryProps> = ({
  warehouse,
  inventorySearch,
  setInventorySearch,
  inventory,
  loadingInventory,
  pagination,
  onPageChange,
  viewMode,
  setViewMode,
}) => {
  const handleLimitChange = (limit: number) => {
    // Not implemented for inventory - using fixed limit
  };

  return (
    <div className="space-y-8 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between border-b border-border pb-8">
        <div className="space-y-1">
          <h3 className="text-2xl font-serif text-foreground">{warehouse?.name}</h3>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{warehouse?.location} JURISDICTION</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
            <input 
              type="text" 
              placeholder="Search by product or SKU..." 
              value={inventorySearch}
              onChange={(e) => setInventorySearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setInventorySearch(inventorySearch)}
              className="w-full bg-secondary border border-border pl-10 pr-4 py-2.5 text-[10px] uppercase tracking-widest focus:border-primary focus:outline-none transition-colors" 
            />
          </div>
          <div className="flex items-center border border-border">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-foreground text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-foreground text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Grid size={16} />
            </button>
          </div>
        </div>
      </div>

      {loadingInventory ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-primary" size={32} />
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground italic">Auditing Stock Levels...</p>
        </div>
      ) : inventory.length === 0 ? (
        <div className="py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic">No matching inventory units found.</div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {inventory.map((item) => (
            <div key={item.id} className="group flex flex-col bg-card border border-border hover:border-primary/30 transition-all duration-300 overflow-hidden">
              <div className="aspect-square bg-secondary border-b border-border overflow-hidden">
                {item.variant.product.images?.[0] ? (
                  <img src={item.variant.product.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={32} className="text-muted-foreground/30" />
                  </div>
                )}
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <div className="text-sm font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">{item.variant.product.name}</div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[9px] font-mono font-bold text-muted-foreground bg-muted px-2 py-0.5 border border-border">{item.variant.sku}</span>
                  </div>
                  <div className="text-[9px] font-bold uppercase tracking-widest text-primary mt-1">{item.variant.size} / {item.variant.color}</div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Stock</span>
                  <div className="text-lg font-mono font-bold text-foreground flex items-center gap-1">
                    <Box size={14} className="text-primary/40"/>
                    {item.stock}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2">
          {inventory.map((item) => (
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

      {pagination.totalPages > 1 && (
        <div className="pt-6 border-t border-border">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={onPageChange}
            onLimitChange={handleLimitChange}
          />
        </div>
      )}
    </div>
  );
};