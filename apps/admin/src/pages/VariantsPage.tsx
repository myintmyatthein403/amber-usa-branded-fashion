import React, { useEffect, useState } from 'react';
import { Layers, Plus, Trash2, Edit2, Loader2, Package } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAdminUIStore } from '../store/useAdminUIStore';
import { Modal } from '../components/admin/Modal';
import { API_ROUTES } from '../config/constants';
import { apiService } from '../services/api.service';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Product {
  id: string;
  name: string;
}

interface Variant {
  id: string;
  size: string;
  color: string;
  stock: number;
  productId: string;
  product?: Product;
}

export const VariantsPage: React.FC = () => {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
  const [formData, setFormData] = useState({
    productId: '',
    size: '',
    color: '',
    stock: '0',
    warehouseId: ''
  });
  
  const token = useAdminUIStore((state) => state.token);

  const fetchVariants = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/variants`);
      const data = await response.json();
      setVariants(data);
    } catch (error) {
      console.error('Failed to fetch variants:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await apiService(API_ROUTES.PRODUCTS.BASE);
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const data = await apiService(API_ROUTES.LOGISTICS.WAREHOUSES);
      setWarehouses(data);
    } catch (error) {
      console.error('Failed to fetch warehouses:', error);
    }
  };

  useEffect(() => {
    fetchVariants();
    fetchProducts();
    fetchWarehouses();
  }, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editingVariant 
        ? API_ROUTES.VARIANTS.BY_ID(editingVariant.id)
        : API_ROUTES.VARIANTS.BASE;

      const method = editingVariant ? 'PATCH' : 'POST';

      await apiService(url, {
        method,
        body: {
          ...formData,
          stock: parseInt(formData.stock)
        },
      });

      setModalOpen(false);
      setEditingVariant(null);
      setFormData({ productId: '', size: '', color: '', stock: '0', warehouseId: '' });
      fetchVariants();
    } catch (error) {
      console.error('Failed to save variant:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteVariant = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await apiService(API_ROUTES.VARIANTS.BY_ID(id), { 
        method: 'DELETE'
      });
      fetchVariants();
    } catch (error) {
      console.error('Failed to delete variant:', error);
    }
  };

  const openAddModal = () => {
    setEditingVariant(null);
    setFormData({ productId: '', size: '', color: '', stock: '0', warehouseId: '' });
    setModalOpen(true);
  };

  const openEditModal = (variant: Variant) => {
    setEditingVariant(variant);
    setFormData({ 
      productId: variant.productId.toString(),
      size: variant.size,
      color: variant.color,
      stock: variant.stock.toString(),
      warehouseId: ''
    });
    setModalOpen(true);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-end justify-between">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold tracking-[0.3em] text-[#C9A962] uppercase leading-none">Inventory Control</span>
          <h2 className="text-4xl font-serif text-[#0F0F0F] tracking-tight">Stock Variants</h2>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-3 bg-[#0F0F0F] text-white px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#C9A962] transition-all duration-300 shadow-xl shadow-black/5"
        >
          <Plus size={18} /> Add New Variant
        </button>
      </div>

      <div className="border border-gray-100 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">Product Piece</th>
              <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">Size</th>
              <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">Colorway</th>
              <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">Availability</th>
              <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase text-right">Options</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={5} className="px-10 py-20 text-center text-xs font-medium text-gray-400 uppercase tracking-widest italic animate-pulse">Accessing Vault...</td></tr>
            ) : variants.length === 0 ? (
              <tr><td colSpan={5} className="px-10 py-20 text-center text-xs font-medium text-gray-400 uppercase tracking-widest italic">No variants registered in inventory.</td></tr>
            ) : (
              variants.map((variant) => (
                <tr key={variant.id} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#FAF8F5] border border-gray-100 flex items-center justify-center">
                        <Package size={16} className="text-[#C9A962]" />
                      </div>
                      <span className="text-lg font-serif text-[#0F0F0F] tracking-wide">{variant.product?.name || 'Unknown Item'}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <span className="px-3 py-1.5 border border-gray-100 bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-[#0F0F0F]">
                      {variant.size}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-[13px] font-medium text-gray-500 uppercase tracking-wide">
                    {variant.color}
                  </td>
                  <td className="px-10 py-6">
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-[0.15em]",
                      variant.stock > 0 ? 'text-[#C9A962]' : 'text-red-400'
                    )}>
                      {variant.stock} UNITS IN STOCK
                    </span>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openEditModal(variant)}
                        className="p-2.5 text-gray-400 hover:text-[#0F0F0F] transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => deleteVariant(variant.id)}
                        className="p-2.5 text-gray-400 hover:text-red-500 transition-colors"
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
        title={editingVariant ? 'Modify Variant' : 'New Stock Variant'}
      >
        <form onSubmit={handleSubmit} className="space-y-8 py-4 animate-in fade-in slide-in-from-bottom-4">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-gray-500">Parent Product</label>
            <select
              required
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              className="w-full h-12 border-b border-gray-200 bg-transparent px-0 py-2 text-base font-medium focus:border-[#C9A962] focus:outline-none transition-colors rounded-none"
            >
              <option value="">Select Piece</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-gray-500">Size Label</label>
              <input
                type="text"
                required
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                className="w-full h-12 border-b border-gray-200 bg-transparent px-0 py-2 text-base font-medium placeholder:text-gray-300 focus:border-[#C9A962] focus:outline-none transition-colors rounded-none"
                placeholder="e.g. L, XL, 32"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-gray-500">Colorway</label>
              <input
                type="text"
                required
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full h-12 border-b border-gray-200 bg-transparent px-0 py-2 text-base font-medium placeholder:text-gray-300 focus:border-[#C9A962] focus:outline-none transition-colors rounded-none"
                placeholder="e.g. Midnight Black"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-gray-500">Initial Inventory</label>
            <div className="grid grid-cols-2 gap-8">
              <input
                type="number"
                required
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full h-12 border-b border-gray-200 bg-transparent px-0 py-2 text-base font-medium placeholder:text-gray-300 focus:border-[#C9A962] focus:outline-none transition-colors rounded-none"
                placeholder="0"
              />
              {!editingVariant && (
                <select
                  required={parseInt(formData.stock) > 0}
                  value={formData.warehouseId}
                  onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })}
                  className="w-full h-12 border-b border-gray-200 bg-transparent px-0 py-2 text-[10px] font-bold uppercase tracking-widest focus:border-[#C9A962] focus:outline-none transition-colors rounded-none cursor-pointer"
                >
                  <option value="">Target Warehouse</option>
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>{w.name} ({w.location})</option>
                  ))}
                </select>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-[#0F0F0F] px-4 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-3 bg-[#0F0F0F] text-white px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#C9A962] transition-colors disabled:opacity-50"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {editingVariant ? 'Update Variant' : 'Create Variant'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
