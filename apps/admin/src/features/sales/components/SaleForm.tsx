import React from 'react';
import { Search, Percent, Banknote, Calendar, CheckCircle2, X, Loader2, Info, ShoppingBag, ArrowRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { SaleProduct } from '../schema';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SaleFormProps {
  formData: any;
  setFormData: (data: any) => void;
  productSearch: string;
  setProductSearch: (value: string) => void;
  filteredProducts: SaleProduct[];
  toggleProductSelection: (id: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  editingSale: any;
}

export const SaleForm: React.FC<SaleFormProps> = ({
  formData,
  setFormData,
  productSearch,
  setProductSearch,
  filteredProducts,
  toggleProductSelection,
  onSubmit,
  submitting,
  editingSale
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-10 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Campaign Name</label>
          <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-xl font-serif focus:border-primary focus:outline-none transition-colors duration-300 rounded-none" placeholder="e.g. Summer Collection Launch" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Campaign Slug</label>
          <input type="text" required value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-sm font-mono focus:border-primary focus:outline-none transition-colors duration-300 rounded-none" placeholder="summer-2024" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Marketing Narrative</label>
        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full h-24 border border-input bg-transparent p-4 text-sm focus:border-primary focus:outline-none transition-colors duration-300 rounded-none resize-none" placeholder="Explain the campaign theme or special terms..." />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Reward Mechanism</label>
          <select value={formData.discountType} onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })} className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-[10px] font-bold uppercase tracking-widest focus:border-primary focus:outline-none transition-colors duration-300 rounded-none">
            <option value="PERCENTAGE">PERCENTAGE DISCOUNT (%)</option>
            <option value="FIXED_AMOUNT">FIXED AMOUNT ($)</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Reward Value</label>
          <div className="relative">
             <div className="absolute left-0 top-1/2 -translate-y-1/2 text-muted-foreground">
               {formData.discountType === 'PERCENTAGE' ? <Percent size={14}/> : <Banknote size={14}/>}
             </div>
             <input type="number" required value={formData.discountValue} onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })} className="w-full h-12 border-b border-input bg-transparent pl-8 pr-0 py-2 text-lg font-mono focus:border-primary focus:outline-none transition-colors duration-300 rounded-none" />
          </div>
        </div>
        <div className="space-y-2">
           <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Publication Status</label>
           <label className="flex items-center gap-3 cursor-pointer group h-12">
             <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} className="w-5 h-5 accent-primary" />
             <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">Campaign Active</span>
           </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground flex items-center gap-2"><Calendar size={12}/> Effective From</label>
          <input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-xs font-mono focus:border-primary focus:outline-none transition-colors duration-300" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground flex items-center gap-2"><Calendar size={12}/> Effective Until</label>
          <input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-xs font-mono focus:border-primary focus:outline-none transition-colors duration-300" />
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
           <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-foreground flex items-center gap-2"><ShoppingBag size={14}/> Included Collections ({formData.productIds.length})</label>
           <div className="relative w-64">
             <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" size={12} />
             <input type="text" placeholder="Search catalog..." value={productSearch} onChange={(e) => setProductSearch(e.target.value)} className="w-full bg-secondary border border-border pl-8 pr-3 py-1.5 text-[10px] focus:border-primary focus:outline-none transition-colors" />
           </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
          {filteredProducts.map((product) => (
            <div 
              key={product.id} 
              onClick={() => toggleProductSelection(product.id)}
              className={cn(
                "group flex items-center gap-3 p-3 border cursor-pointer transition-all duration-300",
                formData.productIds.includes(product.id) ? "bg-primary/5 border-primary/30" : "bg-card border-border hover:bg-muted/50"
              )}
            >
              <div className="w-8 h-10 bg-secondary flex-shrink-0 border border-border overflow-hidden">
                {product.images?.[0] && <img src={product.images[0]} className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold text-foreground truncate">{product.name}</div>
                <div className="text-[9px] font-mono text-muted-foreground">${product.price.toLocaleString()}</div>
              </div>
              {formData.productIds.includes(product.id) && <CheckCircle2 size={14} className="text-primary" />}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-10 border-t border-border">
        <button type="submit" disabled={submitting} className="flex items-center gap-3 bg-foreground text-primary-foreground px-10 py-4 text-xs font-bold uppercase tracking-[0.3em] hover:bg-primary transition-all duration-300 disabled:opacity-50">
          {submitting ? <Loader2 size={16} className="animate-spin" /> : editingSale ? 'Synchronize Campaign' : 'Initialize Campaign'}
          <ArrowRight size={16} />
        </button>
      </div>
    </form>
  );
};
