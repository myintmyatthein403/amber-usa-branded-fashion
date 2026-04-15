import React from 'react';
import { Percent, Banknote, Calendar, Hash, FileText, Loader2 } from 'lucide-react';

interface CouponFormProps {
  formData: any;
  setFormData: (data: any) => void;
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
              onChange={(e) => setFormData({ ...formData, discountType: e.target.value as 'PERCENTAGE' | 'FIXED_AMOUNT' })}
              className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-sm font-bold uppercase tracking-widest focus:border-primary focus:outline-none transition-colors duration-300 rounded-none cursor-pointer"
            >
              <option value="PERCENTAGE">Percentage (%)</option>
              <option value="FIXED_AMOUNT">Fixed Amount ($)</option>
            </select>
          </div>
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
