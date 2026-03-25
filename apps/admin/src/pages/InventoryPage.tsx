import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Search, 
  Loader2, 
  ArrowUpDown, 
  Package, 
  Warehouse as WarehouseIcon,
  Globe,
  Filter,
  RefreshCcw,
  LayoutGrid,
  List,
  Edit2,
  Plus,
  Minus
} from 'lucide-react';
import { useFetch } from '../hooks/useCrud';
import { apiService } from '../services/api.service';
import { API_ROUTES } from '../config/constants';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Modal } from '../components/admin/Modal';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface InventoryItem {
  id: string;
  variantId: string;
  warehouseId: string;
  quantity: number;
  warehouse: {
    id: string;
    name: string;
    location: string;
  };
  variant: {
    id: string;
    sku: string;
    size: string;
    color: string;
    stock: number;
    product: {
      id: string;
      name: string;
      images: string[];
    };
  };
}

export const InventoryPage: React.FC = () => {
  const { data: rawInventory, loading, refresh } = useFetch<InventoryItem>(API_ROUTES.LOGISTICS.INVENTORY);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [filterLocation, setFilterLocation] = useState<string>('ALL');

  // Adjustment Modal State
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  const [adjustmentQty, setAdjustmentQty] = useState(0);

  const openAdjustModal = (group: any, warehouseId?: string) => {
    setSelectedVariant(group.variant);
    setSelectedWarehouseId(warehouseId || '');
    const currentQty = warehouseId ? (group.stocks[warehouseId] || 0) : 0;
    setAdjustmentQty(currentQty);
    setAdjustModalOpen(true);
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVariant || !selectedWarehouseId) return;

    setSubmitting(true);
    try {
      await apiService(API_ROUTES.LOGISTICS.UPDATE_STOCK, {
        method: 'PATCH',
        body: {
          variantId: selectedVariant.id,
          warehouseId: selectedWarehouseId,
          quantity: adjustmentQty
        }
      });
      setAdjustModalOpen(false);
      refresh();
    } catch (error) {
      console.error('Failed to adjust stock:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Group inventory by variant
  const groupedInventory = React.useMemo(() => {
    if (!rawInventory) return [];

    const groups: Record<string, {
      variant: InventoryItem['variant'],
      stocks: Record<string, number>,
      total: number
    }> = {};

    rawInventory.forEach(item => {
      if (!groups[item.variantId]) {
        groups[item.variantId] = {
          variant: item.variant,
          stocks: {},
          total: 0
        };
      }
      groups[item.variantId].stocks[item.warehouse.id] = item.quantity;
      groups[item.variantId].total += item.quantity;
    });

    return Object.values(groups).filter(group => {
      const matchesSearch = group.variant.product.name.toLowerCase().includes(search.toLowerCase()) || 
                           group.variant.sku.toLowerCase().includes(search.toLowerCase());
      
      if (filterLocation === 'ALL') return matchesSearch;
      
      // Check if any warehouse in this group matches the location filter
      const hasStockInLocation = Object.keys(group.stocks).some(wId => {
        const warehouse = rawInventory.find(inv => inv.warehouse.id === wId)?.warehouse;
        return warehouse?.location === filterLocation;
      });
      
      return matchesSearch && hasStockInLocation;
    });
  }, [rawInventory, search, filterLocation]);

  const warehouses = React.useMemo(() => {
    if (!rawInventory) return [];
    const unique = new Map();
    rawInventory.forEach(item => {
      unique.set(item.warehouse.id, item.warehouse);
    });
    return Array.from(unique.values());
  }, [rawInventory]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase leading-none">Global Stock Ledger</span>
          <h2 className="text-4xl font-serif text-foreground tracking-tight">Inventory Distribution</h2>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="flex items-center bg-muted/50 border border-border p-1">
              <button 
                onClick={() => setViewMode('table')}
                className={cn("p-2 transition-colors", viewMode === 'table' ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground")}
              >
                <List size={16} />
              </button>
              <button 
                onClick={() => setViewMode('grid')}
                className={cn("p-2 transition-colors", viewMode === 'grid' ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground")}
              >
                <LayoutGrid size={16} />
              </button>
           </div>
           <button 
             onClick={() => refresh()}
             className="flex items-center gap-3 bg-secondary text-foreground px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-primary hover:text-primary-foreground transition-all duration-300"
           >
             <RefreshCcw size={14} /> Refresh Data
           </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card border border-border p-6 shadow-sm">
         <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input 
              type="text"
              placeholder="Filter by product name or SKU..."
              className="w-full h-12 bg-muted/30 border border-border pl-12 pr-4 text-sm focus:border-primary focus:outline-none transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
         </div>

         <div className="flex items-center gap-6 w-full md:w-auto">
            <div className="flex items-center gap-3">
               <Filter size={14} className="text-primary" />
               <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Region:</span>
               <select 
                 className="bg-transparent border-b border-border py-1 text-[10px] font-bold uppercase tracking-widest focus:border-primary focus:outline-none cursor-pointer"
                 value={filterLocation}
                 onChange={(e) => setFilterLocation(e.target.value)}
               >
                  <option value="ALL">All Regions</option>
                  <option value="USA">United States</option>
                  <option value="MYANMAR">Myanmar</option>
               </select>
            </div>
         </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic animate-pulse">Synchronizing Global Stock Levels...</div>
      ) : groupedInventory.length === 0 ? (
        <div className="py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic border border-dashed border-border">No inventory items found matching your criteria.</div>
      ) : viewMode === 'table' ? (
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
                          onClick={() => openAdjustModal(group, w.id)}
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
                      onClick={() => openAdjustModal(group)}
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
           {groupedInventory.map((group) => (
             <div key={group.variant.id} className="bg-card border border-border p-6 space-y-6 hover:border-primary/30 transition-all group shadow-sm">
                <div className="flex items-start justify-between">
                   <div className="w-16 h-16 bg-muted border border-border flex items-center justify-center overflow-hidden">
                      {group.variant.product.images?.[0] ? (
                        <img src={group.variant.product.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Package size={20} className="text-muted-foreground/30" />
                      )}
                   </div>
                   <div className="text-right">
                      <div className="text-2xl font-serif font-bold text-primary">{group.total}</div>
                      <div className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Global Stock</div>
                   </div>
                </div>

                <div className="space-y-1">
                   <h4 className="text-sm font-bold text-foreground leading-tight group-hover:text-primary transition-colors">{group.variant.product.name}</h4>
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
                        <span className="font-mono font-bold text-foreground">{group.stocks[w.id] || 0}</span>
                     </div>
                   ))}
                </div>
             </div>
           ))}
        </div>
      )}

      {/* Adjust Stock Modal */}
      <Modal 
        isOpen={adjustModalOpen} 
        onClose={() => setAdjustModalOpen(false)} 
        title="Physical Inventory Adjustment"
        size="md"
      >
        {selectedVariant && (
          <form onSubmit={handleAdjustStock} className="space-y-8 py-4 animate-in fade-in slide-in-from-bottom-4">
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
                     onChange={(e) => {
                       setSelectedWarehouseId(e.target.value);
                       // Update adjustmentQty to current value in this warehouse
                       const group = groupedInventory.find(g => g.variant.id === selectedVariant.id);
                       if (group) setAdjustmentQty(group.stocks[e.target.value] || 0);
                     }}
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
                        onClick={() => setAdjustmentQty(prev => Math.max(0, prev - 1))}
                        className="w-12 h-12 bg-secondary text-foreground flex items-center justify-center hover:bg-destructive hover:text-white transition-all"
                      >
                        <Minus size={16} />
                      </button>
                      <input 
                        type="number"
                        min="0"
                        value={adjustmentQty}
                        onChange={(e) => setAdjustmentQty(parseInt(e.target.value) || 0)}
                        className="flex-1 h-12 bg-muted/20 border-b border-border text-center text-2xl font-serif font-bold focus:border-primary focus:outline-none"
                      />
                      <button 
                        type="button" 
                        onClick={() => setAdjustmentQty(prev => prev + 1)}
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
                  onClick={() => setAdjustModalOpen(false)}
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
        )}
      </Modal>
    </div>
  );
};
