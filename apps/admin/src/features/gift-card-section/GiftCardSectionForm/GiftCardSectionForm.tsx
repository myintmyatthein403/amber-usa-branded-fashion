import React from 'react';
import { Trash2, Loader2 } from 'lucide-react';

interface GiftCardSectionFormProps {
  formData: any;
  setFormData: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  editingSection: any;
  onAmountChange: (index: number, value: string) => void;
  onAddAmount: () => void;
  onRemoveAmount: (index: number) => void;
  onCancel: () => void;
}

export const GiftCardSectionForm: React.FC<GiftCardSectionFormProps> = ({
  formData,
  setFormData,
  onSubmit,
  submitting,
  editingSection,
  onAmountChange,
  onAddAmount,
  onRemoveAmount,
  onCancel
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-8 py-4 max-h-[70vh] overflow-y-auto px-1 custom-scrollbar">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Badge Label</label>
            <input
              type="text"
              value={formData.badge}
              onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
              className="w-full h-10 border-b border-input bg-transparent text-sm focus:border-primary focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Title Main</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full h-12 border-b border-input bg-transparent text-2xl font-serif focus:border-primary focus:outline-none transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Title Secondary</label>
            <input
              type="text"
              value={formData.titleSecondary}
              onChange={(e) => setFormData({ ...formData, titleSecondary: e.target.value })}
              className="w-full h-12 border-b border-input bg-transparent text-2xl font-serif focus:border-primary focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Narrative Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full h-24 border border-input bg-transparent p-4 text-sm focus:border-primary focus:outline-none transition-colors resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="space-y-2">
             <label className="text-[10px] font-bold uppercase text-muted-foreground">CTA Text</label>
             <input type="text" value={formData.ctaText} onChange={(e) => setFormData({...formData, ctaText: e.target.value})} className="w-full border-b border-border bg-transparent p-1 text-xs focus:border-primary outline-none" />
           </div>
           <div className="space-y-2">
             <label className="text-[10px] font-bold uppercase text-muted-foreground">CTA Link</label>
             <input type="text" value={formData.ctaLink} onChange={(e) => setFormData({...formData, ctaLink: e.target.value})} className="w-full border-b border-border bg-transparent p-1 text-xs font-mono focus:border-primary outline-none" />
           </div>
        </div>

        <div className="space-y-6 pt-6 border-t border-border">
           <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary">Visual Card Configuration</h4>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="space-y-2">
               <label className="text-[10px] uppercase font-bold text-muted-foreground">Card Title</label>
               <input type="text" value={formData.cardTitle} onChange={(e) => setFormData({...formData, cardTitle: e.target.value})} className="w-full border-b border-border bg-transparent text-sm focus:border-primary outline-none" />
             </div>
             <div className="space-y-2">
               <label className="text-[10px] uppercase font-bold text-muted-foreground">Card Amount</label>
               <input type="text" value={formData.cardAmount} onChange={(e) => setFormData({...formData, cardAmount: e.target.value})} className="w-full border-b border-border bg-transparent text-sm focus:border-primary outline-none" />
             </div>
             <div className="space-y-2">
               <label className="text-[10px] uppercase font-bold text-muted-foreground">Card Type Label</label>
               <input type="text" value={formData.cardType} onChange={(e) => setFormData({...formData, cardType: e.target.value})} className="w-full border-b border-border bg-transparent text-sm focus:border-primary outline-none" />
             </div>
           </div>
        </div>

        <div className="space-y-6 pt-6 border-t border-border">
           <div className="flex justify-between items-center">
             <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary">Selectable Purchase Amounts</h4>
             <button type="button" onClick={onAddAmount} className="text-[10px] font-bold uppercase text-primary hover:underline">+ Add Amount</button>
           </div>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {formData.amounts.map((amount: string, index: number) => (
               <div key={index} className="relative group">
                 <input
                   type="text"
                   value={amount}
                   onChange={(e) => onAmountChange(index, e.target.value)}
                   placeholder="e.g. 50,000 MMK"
                   className="w-full h-10 border border-input bg-transparent px-3 text-xs focus:border-primary focus:outline-none transition-colors"
                 />
                 {formData.amounts.length > 1 && (
                   <button
                     type="button"
                     onClick={() => onRemoveAmount(index)}
                     className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                   >
                     <Trash2 size={10} />
                   </button>
                 )}
               </div>
             ))}
           </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t border-border">
        <button type="button" onClick={onCancel} className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground">Cancel</button>
        <button
          type="submit"
          disabled={submitting}
          className="bg-foreground text-primary-foreground px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all disabled:opacity-50"
        >
          {submitting ? <Loader2 size={16} className="animate-spin" /> : editingSection ? 'Commit Changes' : 'Initialize Design'}
        </button>
      </div>
    </form>
  );
};
