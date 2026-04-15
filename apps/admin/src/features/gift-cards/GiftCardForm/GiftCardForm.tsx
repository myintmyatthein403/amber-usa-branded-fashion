import React from 'react';
import { RefreshCw, DollarSign, Calendar, FileText, Loader2 } from 'lucide-react';

interface GiftCardFormProps {
  formData: any;
  setFormData: (data: any) => void;
  onGenerateCode: () => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  editingGiftCard: any;
  onCancel: () => void;
}

export const GiftCardForm: React.FC<GiftCardFormProps> = ({
  formData,
  setFormData,
  onGenerateCode,
  onSubmit,
  submitting,
  editingGiftCard,
  onCancel
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-8 py-4">
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground flex justify-between">
            <span>Unique Access Code</span>
            {!editingGiftCard && (
              <button 
                type="button" 
                onClick={onGenerateCode}
                className="flex items-center gap-1 text-primary hover:text-primary/70 transition-colors"
              >
                <RefreshCw size={10} /> Auto-Generate
              </button>
            )}
          </label>
          <input
            type="text"
            required
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-2xl font-mono placeholder:text-muted-foreground/20 focus:border-primary focus:outline-none transition-colors duration-300 rounded-none uppercase tracking-widest"
            placeholder="XXXX-XXXX-XXXX-XXXX"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground flex items-center gap-2">
              <DollarSign size={12}/> Initial Balance
            </label>
            <input
              type="number"
              required
              value={formData.initialBalance}
              onChange={(e) => {
                const val = Number(e.target.value);
                setFormData({ ...formData, initialBalance: val, currentBalance: editingGiftCard ? formData.currentBalance : val });
              }}
              className="w-full h-10 border border-border bg-transparent px-4 text-sm focus:border-primary focus:outline-none transition-colors"
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground flex items-center gap-2">
              <DollarSign size={12}/> Current Balance
            </label>
            <input
              type="number"
              required
              value={formData.currentBalance}
              onChange={(e) => setFormData({ ...formData, currentBalance: Number(e.target.value) })}
              className="w-full h-10 border border-border bg-transparent px-4 text-sm focus:border-primary focus:outline-none transition-colors"
              placeholder="0.00"
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
          <div className="flex items-end pb-2">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <label htmlFor="isActive" className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground cursor-pointer">
                Card Valid & Active
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground flex items-center gap-2">
            <FileText size={14}/> Internal Note
          </label>
          <textarea
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            className="w-full h-24 border border-input bg-transparent p-4 text-sm focus:border-primary focus:outline-none transition-colors duration-300 rounded-none resize-none"
            placeholder="Purchaser details, gifting event, or special conditions..."
          />
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
          {editingGiftCard ? 'Save Changes' : 'Issue Gift Card'}
        </button>
      </div>
    </form>
  );
};
