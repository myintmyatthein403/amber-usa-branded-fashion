import React, { useState } from 'react';
import { 
  Box, 
  MapPin, 
  Plus, 
  Loader2, 
  Search,
  ChevronRight,
  Warehouse as WarehouseIcon,
  Globe,
  ArrowRightLeft,
  Package
} from 'lucide-react';
import { Modal } from '../components/admin/Modal';
import { useFetch } from '../hooks/useCrud';
import { apiService } from '../services/api.service';
import { API_ROUTES } from '../config/constants';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Warehouse {
  id: string;
  name: string;
  location: 'USA' | 'MYANMAR';
  address?: string;
  _count?: {
    inventory: number;
  };
}

export const WarehousesPage: React.FC = () => {
  const { data: warehouses, loading, refresh } = useFetch<Warehouse>(API_ROUTES.LOGISTICS.WAREHOUSES);
  const [modalOpen, setModalOpen] = useState(false);
  const [inventoryModalOpen, setInventoryModalOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [warehouseInventory, setWarehouseInventory] = useState<any[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [inventorySearch, setInventorySearch] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: 'USA',
    address: ''
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiService(API_ROUTES.LOGISTICS.WAREHOUSES, {
        method: 'POST',
        body: formData
      });
      setModalOpen(false);
      setFormData({ name: '', location: 'USA', address: '' });
      refresh();
    } catch (error) {
      console.error('Failed to create warehouse:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const openInventory = async (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setInventoryModalOpen(true);
    setLoadingInventory(true);
    try {
      const data = await apiService(API_ROUTES.LOGISTICS.INVENTORY_BY_WAREHOUSE(warehouse.id));
      setWarehouseInventory(data);
    } catch (error) {
      console.error('Failed to fetch warehouse inventory:', error);
    } finally {
      setLoadingInventory(false);
    }
  };

  const filteredInventory = warehouseInventory.filter(item => 
    item.variant.product.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
    item.variant.sku.toLowerCase().includes(inventorySearch.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-end justify-between">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase leading-none">Logistics Hub</span>
          <h2 className="text-4xl font-serif text-foreground tracking-tight">Warehouses</h2>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-3 bg-primary text-primary-foreground px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-primary/90 transition-all duration-300 shadow-xl"
        >
          <Plus size={14} /> Establish New Node
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic animate-pulse">Scanning Global Infrastructure...</div>
        ) : warehouses?.length === 0 ? (
          <div className="col-span-full py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic">No warehouse nodes registered.</div>
        ) : warehouses?.map((w) => (
          <div key={w.id} className="group bg-card border border-border p-8 shadow-sm hover:border-primary/30 transition-all duration-500 relative overflow-hidden">
             {/* Background Decoration */}
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
                      <div className="text-xl font-mono font-bold text-foreground">{w._count?.inventory || 0} <span className="text-[10px] text-muted-foreground font-normal">SKUs</span></div>
                   </div>
                   <button 
                     onClick={() => openInventory(w)}
                     className="p-3 bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300 rounded-full"
                   >
                      <ChevronRight size={16} />
                   </button>
                </div>
             </div>
          </div>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Establish New Logistics Node">
        <form onSubmit={handleCreate} className="space-y-8 py-4">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Warehouse Designation</label>
              <input 
                required
                placeholder="e.g., North American Central Hub"
                className="w-full h-14 bg-muted/30 border border-border px-4 text-sm focus:border-primary focus:outline-none transition-all"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Geographic Jurisdiction</label>
              <select 
                className="w-full h-14 bg-muted/30 border border-border px-4 text-[10px] font-bold uppercase tracking-widest focus:border-primary focus:outline-none transition-all cursor-pointer"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              >
                <option value="USA">United States of America</option>
                <option value="MYANMAR">Myanmar (Burma)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Full Address Protocol</label>
              <textarea 
                rows={3}
                placeholder="Secure logistics facility address..."
                className="w-full p-4 bg-muted/30 border border-border text-sm focus:border-primary focus:outline-none transition-all"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-6 border-t border-border flex justify-end">
            <button 
              type="submit" 
              disabled={submitting}
              className="bg-primary text-primary-foreground px-10 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-3"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              Initialize Warehouse
            </button>
          </div>
        </form>
      </Modal>

      {/* Warehouse Inventory View Modal */}
      <Modal 
        isOpen={inventoryModalOpen} 
        onClose={() => setInventoryModalOpen(false)} 
        title={selectedWarehouse ? `Inventory: ${selectedWarehouse.name}` : 'Warehouse Inventory'}
        size="lg"
      >
        <div className="space-y-8 py-6 animate-in fade-in slide-in-from-bottom-4">
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input 
                type="text"
                placeholder="Search local stock..."
                className="w-full h-12 bg-muted/30 border border-border pl-12 pr-4 text-sm focus:border-primary focus:outline-none transition-all"
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
              />
           </div>

           <div className="border border-border max-h-[500px] overflow-y-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-muted/50 border-b border-border sticky top-0 z-10">
                       <th className="px-6 py-4 text-[10px] font-bold uppercase text-muted-foreground">Product Specification</th>
                       <th className="px-6 py-4 text-[10px] font-bold uppercase text-muted-foreground text-center">In-Stock</th>
                       <th className="px-6 py-4 text-[10px] font-bold uppercase text-muted-foreground text-right">SKU</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-border">
                    {loadingInventory ? (
                      <tr><td colSpan={3} className="px-6 py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic animate-pulse">Querying Local Ledger...</td></tr>
                    ) : filteredInventory.length === 0 ? (
                      <tr><td colSpan={3} className="px-6 py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic">No items found in this location.</td></tr>
                    ) : filteredInventory.map((item: any) => (
                      <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 bg-muted border border-border flex items-center justify-center overflow-hidden">
                                  {item.variant.product.images?.[0] ? (
                                    <img src={item.variant.product.images[0]} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <Package size={14} className="text-muted-foreground/30" />
                                  )}
                               </div>
                               <div>
                                  <div className="text-sm font-bold text-foreground">{item.variant.product.name}</div>
                                  <div className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">{item.variant.size} • {item.variant.color}</div>
                               </div>
                            </div>
                         </td>
                         <td className="px-6 py-4 text-center">
                            <span className="text-sm font-mono font-bold px-3 py-1 bg-secondary border border-border">
                               {item.quantity}
                            </span>
                         </td>
                         <td className="px-6 py-4 text-right">
                            <div className="text-[10px] font-mono text-muted-foreground">{item.variant.sku}</div>
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      </Modal>
    </div>
  );
};
