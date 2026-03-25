import React, { useState, useMemo } from 'react';
import { Tag, Plus, Trash2, Edit2, Loader2, Calendar, Percent, Banknote, CheckCircle2, XCircle, ShoppingBag, Info, Search, X } from 'lucide-react';
import { Modal } from '../components/admin/Modal';
import { useFetch, useDelete } from '../hooks/useCrud';
import { apiService } from '../services/api.service';
import { API_ROUTES } from '../config/constants';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Product {
  id: string;
  name: string;
  price: number;
  onSale: boolean;
  images?: string[];
}

interface Sale {
  id: string;
  name: string;
  slug: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue?: number;
  products?: Product[];
}

export const SalesPage: React.FC = () => {
  const { data: sales, loading, refresh } = useFetch<Sale>(API_ROUTES.SALES.BASE);
  const { data: allProducts } = useFetch<Product>(API_ROUTES.PRODUCTS.BASE);
  const { deleteItem } = useDelete(API_ROUTES.SALES.BASE);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  
  const [formData, setFormData] = useState({ 
    name: '', 
    slug: '',
    description: '', 
    discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED_AMOUNT', 
    discountValue: 0,
    startDate: '',
    endDate: '',
    isActive: true,
    productIds: [] as string[]
  });

  const [productSearch, setProductSearch] = useState('');

  const filteredProducts = useMemo(() => {
    if (!allProducts) return [];
    return allProducts.filter(p => 
      p.name.toLowerCase().includes(productSearch.toLowerCase())
    );
  }, [allProducts, productSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const endpoint = editingSale 
        ? API_ROUTES.SALES.BY_ID(editingSale.id)
        : API_ROUTES.SALES.BASE;
      
      const method = editingSale ? 'PATCH' : 'POST';

      const cleanedData = {
        ...formData,
        discountValue: formData.discountValue ? Number(formData.discountValue) : null,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
      };

      await apiService(endpoint, {
        method,
        body: cleanedData,
      });

      setModalOpen(false);
      setEditingSale(null);
      refresh();
    } catch (error) {
      console.error('Failed to save sale:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteItem(id, 'Are you sure you want to delete this sale event?');
    if (success) refresh();
  };

  const openAddModal = () => {
    setEditingSale(null);
    setFormData({ 
      name: '', 
      slug: '',
      description: '', 
      discountType: 'PERCENTAGE', 
      discountValue: 0,
      startDate: '',
      endDate: '',
      isActive: true,
      productIds: []
    });
    setModalOpen(true);
  };

  const openEditModal = (sale: Sale) => {
    setEditingSale(sale);
    setFormData({ 
      name: sale.name, 
      slug: sale.slug,
      description: sale.description || '',
      discountType: sale.discountType,
      discountValue: sale.discountValue || 0,
      startDate: sale.startDate ? new Date(sale.startDate).toISOString().split('T')[0] : '',
      endDate: sale.endDate ? new Date(sale.endDate).toISOString().split('T')[0] : '',
      isActive: sale.isActive,
      productIds: sale.products?.map(p => p.id) || []
    });
    setModalOpen(true);
  };

  const toggleProductSelection = (productId: string) => {
    setFormData(prev => ({
      ...prev,
      productIds: prev.productIds.includes(productId)
        ? prev.productIds.filter(id => id !== productId)
        : [...prev.productIds, productId]
    }));
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-end justify-between">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase leading-none">Promotional Events</span>
          <h2 className="text-4xl font-serif text-foreground tracking-tight">Sales Campaigns</h2>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-3 bg-foreground text-primary-foreground px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all duration-300 shadow-xl shadow-black/5"
        >
          <Plus size={18} /> New Sale Event
        </button>
      </div>

      <div className="border border-border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">Event Name</th>
              <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">Benefit</th>
              <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase text-center">Involved Products</th>
              <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase text-center">Status</th>
              <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase text-right">Options</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={5} className="px-10 py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic animate-pulse">Loading Campaign Data...</td></tr>
            ) : !sales || sales.length === 0 ? (
              <tr><td colSpan={5} className="px-10 py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic">No sale events found.</td></tr>
            ) : (
              sales.map((sale) => (
                <tr key={sale.id} className="group hover:bg-muted/50 transition-colors duration-300">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-secondary border border-border flex items-center justify-center">
                        <Tag size={18} className="text-primary/40" />
                      </div>
                      <div className="space-y-1">
                        <div className="text-lg font-serif text-foreground tracking-wide">{sale.name}</div>
                        <div className="text-[9px] font-mono text-muted-foreground/40 uppercase tracking-widest">
                          {sale.slug}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="text-sm font-bold text-foreground">
                      {sale.discountValue ? (
                        sale.discountType === 'PERCENTAGE' ? `${sale.discountValue}% OFF` : `$${sale.discountValue} OFF`
                      ) : 'VARIES'}
                    </div>
                  </td>
                  <td className="px-10 py-6 text-center">
                     <span className="text-xs font-bold text-primary bg-primary/5 px-3 py-1 border border-primary/10">
                        {sale.products?.length || 0} Products
                     </span>
                  </td>
                  <td className="px-10 py-6 text-center">
                    <div className="flex justify-center">
                      {sale.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                          <CheckCircle2 size={12} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-muted-foreground text-[10px] font-bold uppercase tracking-wider border border-border">
                          <XCircle size={12} /> Inactive
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button 
                        onClick={() => openEditModal(sale)}
                        className="p-2.5 text-muted-foreground hover:text-foreground transition-colors duration-300"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(sale.id)}
                        className="p-2.5 text-muted-foreground hover:text-destructive transition-colors duration-300"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editingSale ? 'Modify Campaign Parameters' : 'Initialize New Sale Event'}
      >
        <form onSubmit={handleSubmit} className="space-y-8 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
             {/* Left Column: Core Data */}
             <div className="space-y-6">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary flex items-center gap-2">
                    <Info size={14} /> Campaign Identity
                  </h4>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Event Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => {
                          const name = e.target.value;
                          const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                          setFormData({ ...formData, name, slug });
                        }}
                        className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-xl font-serif placeholder:text-muted-foreground/20 focus:border-primary focus:outline-none transition-colors duration-300 rounded-none"
                        placeholder="e.g. Thingyan Sale"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Slug (URL)</label>
                      <input
                        type="text"
                        required
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-sm font-mono focus:border-primary focus:outline-none transition-colors duration-300 rounded-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                   <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary flex items-center gap-2">
                    <Percent size={14} /> Discount Logistics
                  </h4>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Discount Type</label>
                      <select
                        value={formData.discountType}
                        onChange={(e) => setFormData({ ...formData, discountType: e.target.value as 'PERCENTAGE' | 'FIXED_AMOUNT' })}
                        className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-sm font-bold uppercase tracking-widest focus:border-primary focus:outline-none transition-colors duration-300 rounded-none cursor-pointer"
                      >
                        <option value="PERCENTAGE">Percentage (%)</option>
                        <option value="FIXED_AMOUNT">Fixed Amount ($)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground flex items-center gap-2">
                        {formData.discountType === 'PERCENTAGE' ? <Percent size={12}/> : <Banknote size={12}/>} Default Value
                      </label>
                      <input
                        type="number"
                        value={formData.discountValue}
                        onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                        className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-lg font-mono focus:border-primary focus:outline-none transition-colors duration-300 rounded-none"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                   <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary flex items-center gap-2">
                    <Calendar size={14} /> Schedule
                  </h4>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Start Date</label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full h-10 border border-border bg-transparent px-4 text-sm focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">End Date</label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full h-10 border border-border bg-transparent px-4 text-sm focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <label htmlFor="isActive" className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground cursor-pointer">
                    Campaign Active & Visible
                  </label>
                </div>
             </div>

             {/* Right Column: Product Selection */}
             <div className="space-y-6 flex flex-col h-full border-l border-border pl-10">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center justify-between">
                     <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary flex items-center gap-2">
                        <ShoppingBag size={14} /> Selective Product Scope
                     </h4>
                     <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5">{formData.productIds.length} SELECTED</span>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={14} />
                    <input
                      type="text"
                      placeholder="Search Master Catalog..."
                      className="w-full h-10 border border-border bg-muted/20 pl-10 pr-4 text-xs focus:border-primary focus:outline-none transition-all"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {filteredProducts.map((product) => {
                      const isSelected = formData.productIds.includes(product.id);
                      return (
                        <div 
                          key={product.id} 
                          onClick={() => toggleProductSelection(product.id)}
                          className={cn(
                            "flex items-center justify-between p-3 border transition-all cursor-pointer group",
                            isSelected 
                              ? "bg-primary/5 border-primary/20" 
                              : "border-border hover:border-primary/40 hover:bg-muted/30"
                          )}
                        >
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-secondary border border-border overflow-hidden">
                                 {product.images?.[0] ? (
                                   <img src={product.images[0]} className="w-full h-full object-cover" />
                                 ) : (
                                   <ShoppingBag size={14} className="m-auto mt-3 text-muted-foreground/30" />
                                 )}
                              </div>
                              <div>
                                 <div className="text-[11px] font-bold text-foreground leading-none mb-1">{product.name}</div>
                                 <div className="text-[9px] font-mono text-muted-foreground">${product.price}</div>
                              </div>
                           </div>
                           <div className={cn(
                             "w-4 h-4 rounded-full border flex items-center justify-center transition-all",
                             isSelected ? "bg-primary border-primary text-white" : "border-muted-foreground/20"
                           )}>
                             {isSelected && <CheckCircle2 size={10} />}
                           </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-primary/5 p-4 border border-primary/10 space-y-2">
                   <div className="flex items-start gap-3">
                      <Info size={14} className="text-primary mt-0.5 shrink-0" />
                      <p className="text-[9px] text-muted-foreground leading-relaxed uppercase tracking-widest font-bold">
                        Products selected will be automatically tagged with "ON SALE" status once the campaign is initialized.
                      </p>
                   </div>
                </div>
             </div>
          </div>

          <div className="flex justify-end gap-4 pt-10 border-t border-border mt-6">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground px-4 transition-colors duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-3 bg-foreground text-primary-foreground px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-colors duration-300 disabled:opacity-50 shadow-xl shadow-black/5"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {editingSale ? 'Update Campaign Definition' : 'Execute Sale Launch'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
