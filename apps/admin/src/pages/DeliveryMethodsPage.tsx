import React, { useState } from 'react';
import { Truck, Plus, Trash2, Edit2, Loader2, Save, X, Check, Minus } from 'lucide-react';
import { Modal } from '../components/admin/Modal';
import { useFetch, useDelete } from '../hooks/useCrud';
import { apiService } from '../services/api.service';
import { API_ROUTES } from '../config/constants';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DeliveryMethod {
  id: string;
  name: string;
  description?: string;
  price: string;
  isUsdPrice: boolean;
  estimatedDays?: string;
  isActive: boolean;
  freeOverAmount?: string;
}

export const DeliveryMethodsPage: React.FC = () => {
  const { data: methods, loading, refresh } = useFetch<DeliveryMethod>(API_ROUTES.DELIVERY_METHODS.BASE);
  const { deleteItem } = useDelete(API_ROUTES.DELIVERY_METHODS.BASE);

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingMethod, setEditingMethod] = useState<DeliveryMethod | null>(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    isUsdPrice: false,
    estimatedDays: '',
    isActive: true,
    freeOverAmount: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const endpoint = editingMethod 
        ? API_ROUTES.DELIVERY_METHODS.BY_ID(editingMethod.id) 
        : API_ROUTES.DELIVERY_METHODS.BASE;
      
      const method = editingMethod ? 'PATCH' : 'POST';

      await apiService(endpoint, {
        method,
        body: {
          ...form,
          price: parseFloat(form.price),
          freeOverAmount: form.freeOverAmount ? parseFloat(form.freeOverAmount) : null
        },
      });

      setModalOpen(false);
      refresh();
    } catch (error) {
      console.error('Failed to save delivery method:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const openAddModal = () => {
    setEditingMethod(null);
    setForm({ 
      name: '', description: '', price: '', 
      isUsdPrice: false, estimatedDays: '', 
      isActive: true, freeOverAmount: '' 
    });
    setModalOpen(true);
  };

  const openEditModal = (method: DeliveryMethod) => {
    setEditingMethod(method);
    setForm({ 
      name: method.name, 
      description: method.description || '', 
      price: method.price.toString(),
      isUsdPrice: method.isUsdPrice,
      estimatedDays: method.estimatedDays || '',
      isActive: method.isActive,
      freeOverAmount: method.freeOverAmount?.toString() || ''
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const success = await deleteItem(id, 'Are you sure you want to delete this delivery method?');
    if (success) refresh();
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-end justify-between">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase leading-none">Logistics Configuration</span>
          <h2 className="text-4xl font-serif text-foreground tracking-tight">Delivery Methods</h2>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-3 bg-foreground text-primary-foreground px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all duration-300 shadow-xl shadow-black/5"
        >
          <Plus size={18} /> New Method
        </button>
      </div>

      <div className="border border-border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">Method Name</th>
              <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">Estimated Time</th>
              <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase text-center">Status</th>
              <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase text-center">Price</th>
              <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase text-right">Options</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={5} className="px-10 py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic animate-pulse">Syncing Logistics Data...</td></tr>
            ) : !methods || methods.length === 0 ? (
              <tr><td colSpan={5} className="px-10 py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic">No delivery methods defined.</td></tr>
            ) : (
              methods.map((method) => (
                <tr key={method.id} className="group hover:bg-muted/30 transition-colors duration-300">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-secondary flex items-center justify-center border border-border">
                        <Truck size={20} className="text-primary" />
                      </div>
                      <div className="space-y-1">
                        <div className="text-lg font-serif text-foreground tracking-wide">{method.name}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest line-clamp-1 max-w-[200px]">{method.description || 'No description provided'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      {method.estimatedDays || 'Not specified'}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-center">
                    <span className={cn(
                      "text-[9px] font-bold uppercase tracking-widest px-2 py-1 border",
                      method.isActive ? "border-emerald-500/20 text-emerald-500 bg-emerald-50/10" : "border-amber-500/20 text-amber-500 bg-amber-50/10"
                    )}>
                      {method.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-sm font-bold text-foreground tracking-tight">
                        {parseFloat(method.price).toLocaleString()} {method.isUsdPrice ? 'USD' : 'MMK'}
                      </span>
                      {method.freeOverAmount && parseFloat(method.freeOverAmount) > 0 && (
                        <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-widest">
                          Free over {parseFloat(method.freeOverAmount).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button onClick={() => openEditModal(method)} className="p-2.5 text-muted-foreground hover:text-foreground transition-colors duration-300">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(method.id)} className="p-2.5 text-muted-foreground hover:text-destructive transition-colors duration-300">
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
        title={editingMethod ? `Edit Method: ${editingMethod.name}` : 'New Delivery Protocol'}
      >
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Display Name</label>
            <input 
              type="text" 
              required 
              value={form.name} 
              onChange={(e) => setForm({ ...form, name: e.target.value })} 
              className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-lg font-serif placeholder:text-muted-foreground/20 focus:border-primary focus:outline-none transition-colors duration-300 rounded-none" 
              placeholder="e.g. Premium Express (Yangon)" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Logistics Description</label>
            <textarea 
              value={form.description} 
              onChange={(e) => setForm({ ...form, description: e.target.value })} 
              className="w-full h-24 border border-input bg-transparent p-4 text-sm focus:border-primary focus:outline-none transition-colors duration-300 rounded-none resize-none" 
              placeholder="Details about delivery zones, terms, or special conditions..." 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Delivery Fee</label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" checked={form.isUsdPrice} onChange={(e) => setForm({...form, isUsdPrice: e.target.checked})} className="w-4 h-4 accent-primary" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">USD Base</span>
                </label>
              </div>
              <input 
                type="number" 
                required 
                value={form.price} 
                onChange={(e) => setForm({ ...form, price: e.target.value })} 
                className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-lg font-mono focus:border-primary focus:outline-none transition-colors duration-300 rounded-none" 
                placeholder="0.00" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Estimated Delivery Time</label>
              <input 
                type="text" 
                value={form.estimatedDays} 
                onChange={(e) => setForm({ ...form, estimatedDays: e.target.value })} 
                className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-sm font-bold uppercase tracking-widest focus:border-primary focus:outline-none transition-colors duration-300 rounded-none" 
                placeholder="e.g. 24-48 HOURS" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Free Shipping Threshold</label>
              <input 
                type="number" 
                value={form.freeOverAmount} 
                onChange={(e) => setForm({ ...form, freeOverAmount: e.target.value })} 
                className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-lg font-mono focus:border-primary focus:outline-none transition-colors duration-300 rounded-none" 
                placeholder="0.00 (Optional)" 
              />
              <p className="text-[9px] text-muted-foreground/60 italic uppercase tracking-widest">Delivery fee becomes zero if subtotal exceeds this amount.</p>
            </div>
            <div className="flex items-center gap-6 pt-6">
               <label className="flex items-center gap-3 cursor-pointer group">
                 <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({...form, isActive: e.target.checked})} className="w-5 h-5 accent-primary" />
                 <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">Activate Method</span>
               </label>
            </div>
          </div>

          <div className="flex justify-end pt-10 border-t border-border">
            <button 
              type="submit" 
              disabled={submitting} 
              className="flex items-center gap-3 bg-foreground text-primary-foreground px-10 py-4 text-xs font-bold uppercase tracking-[0.3em] hover:bg-primary transition-colors duration-500 disabled:opacity-50"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {editingMethod ? 'Update Protocol' : 'Initialize Protocol'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
