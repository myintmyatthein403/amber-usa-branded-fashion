import React from 'react';
import { Percent, Banknote, Calendar, Hash, FileText, Loader2 } from 'lucide-react';
import type { CouponFormData } from '@amber/shared';
import { useFetch } from '../../../hooks/useCrud';
import { API_ROUTES } from '../../../config/constants';

interface CouponFormProps {
  formData: CouponFormData;
  setFormData: (data: CouponFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  editingCoupon: any;
  onCancel: () => void;
}

export const CouponForm: React.FC<CouponFormProps> = ({
  formData,
  setFormData,
  onSubmit,
  submitting,
  editingCoupon,
  onCancel
}) => {
  const { data: products } = useFetch<{ id: string; name: string }>(API_ROUTES.PRODUCTS.BASE);
  const { data: categories } = useFetch<{ id: string; name: string }>(API_ROUTES.CATEGORIES.BASE);

  return (
    <form onSubmit={onSubmit} className="space-y-8 py-4">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Coupon Code</label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-xl font-serif placeholder:text-muted-foreground/20 focus:border-primary focus:outline-none transition-colors duration-300 rounded-none uppercase"
              placeholder="e.g. SUMMER25"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Discount Type</label>
            <select
              value={formData.discountType}
              onChange={(e) => setFormData({ ...formData, discountType: e.target.value as CouponFormData['discountType'] })}
              className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-sm font-bold uppercase tracking-widest focus:border-primary focus:outline-none transition-colors duration-300 rounded-none cursor-pointer"
            >
              <option value="PERCENTAGE">Percentage (%)</option>
              <option value="FIXED_AMOUNT">Fixed Amount ($)</option>
              <option value="BUY_X_GET_Y">Buy X Get Y</option>
              <option value="FREE_SHIPPING">Free Shipping</option>
            </select>
          </div>
        </div>

        {formData.discountType === 'BUY_X_GET_Y' && (
          <div className="grid grid-cols-2 gap-6 p-4 border border-dashed border-primary/20 bg-secondary/30">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Buy Quantity</label>
              <input
                type="number"
                min={1}
                value={formData.buyQuantity ?? ''}
                onChange={(e) => setFormData({ ...formData, buyQuantity: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full h-10 border border-border bg-transparent px-4 text-sm focus:border-primary focus:outline-none transition-colors"
                placeholder="e.g. 2"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Get Quantity (at Value% off)</label>
              <input
                type="number"
                min={1}
                value={formData.getQuantity ?? ''}
                onChange={(e) => setFormData({ ...formData, getQuantity: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full h-10 border border-border bg-transparent px-4 text-sm focus:border-primary focus:outline-none transition-colors"
                placeholder="e.g. 1"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Applies To</label>
            <select
              value={formData.scopeType}
              onChange={(e) => setFormData({ ...formData, scopeType: e.target.value as CouponFormData['scopeType'], scopeProductId: undefined, scopeCategoryId: undefined })}
              className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-sm font-bold uppercase tracking-widest focus:border-primary focus:outline-none transition-colors duration-300 rounded-none cursor-pointer"
            >
              <option value="ORDER">Whole Order</option>
              <option value="PRODUCT">Specific Product</option>
              <option value="CATEGORY">Specific Category</option>
            </select>
          </div>
          {formData.scopeType === 'PRODUCT' && (
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Product</label>
              <select
                required
                value={formData.scopeProductId ?? ''}
                onChange={(e) => setFormData({ ...formData, scopeProductId: e.target.value })}
                className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-sm focus:border-primary focus:outline-none transition-colors duration-300 rounded-none cursor-pointer"
              >
                <option value="">Select a product</option>
                {(products || []).map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}
          {formData.scopeType === 'CATEGORY' && (
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Category</label>
              <select
                required
                value={formData.scopeCategoryId ?? ''}
                onChange={(e) => setFormData({ ...formData, scopeCategoryId: e.target.value })}
                className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-sm focus:border-primary focus:outline-none transition-colors duration-300 rounded-none cursor-pointer"
              >
                <option value="">Select a category</option>
                {(categories || []).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground flex items-center gap-2">
              {formData.discountType === 'PERCENTAGE' ? <Percent size={12}/> : <Banknote size={12}/>} Value
            </label>
            <input
              type="number"
              required
              value={formData.discountValue}
              onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
              className="w-full h-10 border border-border bg-transparent px-4 text-sm focus:border-primary focus:outline-none transition-colors"
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Min Order ($)</label>
            <input
              type="number"
              value={formData.minOrderAmount || ''}
              onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full h-10 border border-border bg-transparent px-4 text-sm focus:border-primary focus:outline-none transition-colors"
              placeholder="Optional"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Max Discount ($)</label>
            <input
              type="number"
              disabled={formData.discountType === 'FIXED_AMOUNT'}
              value={formData.maxDiscount || ''}
              onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full h-10 border border-border bg-transparent px-4 text-sm focus:border-primary focus:outline-none transition-colors disabled:opacity-30"
              placeholder="Optional"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground flex items-center gap-2">
              <Calendar size={14}/> Expiry Date
            </label>
            <input
              type="date"
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              className="w-full h-10 border border-border bg-transparent px-4 text-sm focus:border-primary focus:outline-none transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground flex items-center gap-2">
              <Hash size={14}/> Usage Limit
            </label>
            <input
              type="number"
              value={formData.usageLimit || ''}
              onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full h-10 border border-border bg-transparent px-4 text-sm focus:border-primary focus:outline-none transition-colors"
              placeholder="Leave empty for unlimited"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground flex items-center gap-2">
            <FileText size={14}/> Internal Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full h-20 border border-input bg-transparent p-4 text-sm focus:border-primary focus:outline-none transition-colors duration-300 rounded-none resize-none"
            placeholder="Marketing campaign details, target audience..."
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
          />
          <label htmlFor="isActive" className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground cursor-pointer">
            Campaign Active
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t border-border">
        <button
          type="button"
          onClick={onCancel}
          className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground px-4 transition-colors duration-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-3 bg-foreground text-primary-foreground px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-colors duration-300 disabled:opacity-50"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {editingCoupon ? 'Update Campaign' : 'Launch Promotion'}
        </button>
      </div>
    </form>
  );
};
