import React from 'react';
import { Save, Loader2 } from 'lucide-react';

interface DeliveryMethodFormProps {
  form: any;
  setForm: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  editingMethod: any;
  onCancel: () => void;
}

export const DeliveryMethodForm: React.FC<DeliveryMethodFormProps> = ({
  form,
  setForm,
  onSubmit,
  submitting,
  editingMethod,
  onCancel
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
        <div className="flex flex-col gap-4 pt-4">
           <label className="flex items-center gap-3 cursor-pointer group">
             <input type="checkbox" checked={form.isDigital} onChange={(e) => setForm({...form, isDigital: e.target.checked})} className="w-5 h-5 accent-primary" />
             <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">Digital / Email Only</span>
           </label>
           <label className="flex items-center gap-3 cursor-pointer group">
             <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({...form, isActive: e.target.checked})} className="w-5 h-5 accent-primary" />
             <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">Activate Method</span>
           </label>
        </div>
      </div>

      <div className="flex justify-end pt-10 border-t border-border gap-4">
        <button type="button" onClick={onCancel} className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground">Cancel</button>
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
  );
};
