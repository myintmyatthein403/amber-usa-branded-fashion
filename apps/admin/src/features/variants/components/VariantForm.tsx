import React from 'react';
import { Package, Loader2, Save } from 'lucide-react';
import { VariantProduct } from '../schema';
import type { VariantFormData, Warehouse } from '@amber/shared';

interface VariantFormProps {
  formData: VariantFormData;
  setFormData: (data: VariantFormData) => void;
  products: VariantProduct[];
  warehouses: Warehouse[];
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  editingVariant: any;
}

export const VariantForm: React.FC<VariantFormProps> = ({
  formData,
  setFormData,
  products,
  warehouses,
  onSubmit,
  submitting,
  editingVariant
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-8 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#666]">Target Catalog Item</label>
        <select required value={formData.productId} onChange={(e) => setFormData({ ...formData, productId: e.target.value })} className="w-full h-12 border-b border-[#E5E5E5] bg-transparent px-0 py-2 text-sm font-bold uppercase tracking-widest focus:border-[#C9A962] focus:outline-none transition-colors duration-300 rounded-none">
          <option value="">Select Product</option>
          {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#666]">Dimension/Size</label>
          <input type="text" required value={formData.size} onChange={(e) => setFormData({ ...formData, size: e.target.value })} className="w-full h-12 border-b border-[#E5E5E5] bg-transparent px-0 py-2 text-sm font-bold uppercase tracking-widest focus:border-[#C9A962] focus:outline-none transition-colors duration-300 rounded-none" placeholder="e.g. XL" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#666]">Chromatic Spectrum/Color</label>
          <input type="text" required value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} className="w-full h-12 border-b border-[#E5E5E5] bg-transparent px-0 py-2 text-sm font-bold uppercase tracking-widest focus:border-[#C9A962] focus:outline-none transition-colors duration-300 rounded-none" placeholder="e.g. Ivory" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#666]">Current Stock Count</label>
          <input type="number" required value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })} className="w-full h-12 border-b border-[#E5E5E5] bg-transparent px-0 py-2 text-lg font-mono font-bold focus:border-[#C9A962] focus:outline-none transition-colors duration-300 rounded-none" />
        </div>
        {!editingVariant && (
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#666]">Initial Fulfillment Center</label>
            <select value={formData.warehouseId} onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })} className="w-full h-12 border-b border-[#E5E5E5] bg-transparent px-0 py-2 text-[10px] font-bold uppercase tracking-widest focus:border-[#C9A962] focus:outline-none transition-colors duration-300 rounded-none cursor-pointer">
              <option value="">Select Warehouse</option>
              {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name} ({w.location})</option>)}
            </select>
          </div>
        )}
      </div>

      <div className="flex justify-end pt-10 border-t border-[#E5E5E5]">
        <button type="submit" disabled={submitting} className="flex items-center gap-3 bg-[#0F0F0F] text-white px-10 py-4 text-xs font-bold uppercase tracking-[0.3em] hover:bg-[#C9A962] transition-all duration-300 disabled:opacity-50">
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {editingVariant ? 'Synchronize Variant' : 'Initialize Variant'}
        </button>
      </div>
    </form>
  );
};
