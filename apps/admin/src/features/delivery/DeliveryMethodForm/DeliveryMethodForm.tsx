import React from 'react';
import { Save, Loader2, Image, Link as LinkIcon, Plus, Trash2 } from 'lucide-react';
import type { DeliveryMethodFormData } from '@amber/shared';

interface DeliveryMethodFormProps {
  form: DeliveryMethodFormData & { locationPrices?: Record<string, string>; logoUrl?: string; logoLink?: string };
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
  const handleLocationPriceChange = (location: string, value: string) => {
    setForm({
      ...form,
      locationPrices: {
        ...form.locationPrices,
        [location]: value
      }
    });
  };

  const addLocationPrice = () => {
    setForm({
      ...form,
      locationPrices: {
        ...form.locationPrices,
        '': ''
      }
    });
  };

  const removeLocationPrice = (location: string) => {
    const newPrices = { ...form.locationPrices };
    delete newPrices[location];
    setForm({ ...form, locationPrices: newPrices });
  };

  const locations = Object.keys(form.locationPrices || {});

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
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Logo Image URL</label>
          <div className="flex gap-3">
            <input 
              type="text" 
              value={form.logoUrl || ''} 
              onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} 
              className="flex-1 h-10 border border-input bg-transparent px-3 text-sm focus:border-primary focus:outline-none transition-colors duration-300" 
              placeholder="https://..."
            />
            {form.logoUrl && (
              <div className="w-10 h-10 border border-border overflow-hidden flex-shrink-0">
                <img src={form.logoUrl} className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              </div>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Logo Link URL</label>
          <div className="flex gap-3">
            <LinkIcon size={16} className="text-muted-foreground mt-2.5" />
            <input 
              type="text" 
              value={form.logoLink || ''} 
              onChange={(e) => setForm({ ...form, logoLink: e.target.value })} 
              className="flex-1 h-10 border border-input bg-transparent px-0 py-2 text-sm focus:border-primary focus:outline-none transition-colors duration-300 rounded-none" 
              placeholder="https://tracking.example.com/..."
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Base Delivery Fee</label>
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
            value={form.estimatedDays || ''} 
            onChange={(e) => setForm({ ...form, estimatedDays: e.target.value })} 
            className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-sm font-bold uppercase tracking-widest focus:border-primary focus:outline-none transition-colors duration-300 rounded-none" 
            placeholder="e.g. 24-48 HOURS" 
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Location-Based Pricing</label>
          <button 
            type="button" 
            onClick={addLocationPrice}
            className="text-[9px] font-bold uppercase tracking-widest text-primary hover:text-primary/80 flex items-center gap-1"
          >
            <Plus size={12} /> Add Location
          </button>
        </div>
        <div className="space-y-3">
          {locations.map((loc, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <select
                value={loc}
                onChange={(e) => {
                  const newPrices = { ...form.locationPrices };
                  const val = newPrices[loc];
                  delete newPrices[loc];
                  if (e.target.value) newPrices[e.target.value] = val;
                  setForm({ ...form, locationPrices: newPrices });
                }}
                className="w-32 h-10 border border-input bg-transparent px-2 text-xs uppercase tracking-widest focus:border-primary focus:outline-none"
              >
                <option value="">Select</option>
                <option value="USA">USA</option>
                <option value="MYANMAR">MYANMAR</option>
              </select>
              <span className="text-muted-foreground">:</span>
              <input 
                type="number" 
                value={(form.locationPrices || {})[loc] || ''}
                onChange={(e) => handleLocationPriceChange(loc, e.target.value)}
                className="flex-1 h-10 border border-input bg-transparent px-3 text-sm font-mono focus:border-primary focus:outline-none"
                placeholder="Fee amount"
              />
              <button 
                type="button"
                onClick={() => removeLocationPrice(loc)}
                className="p-2 text-muted-foreground hover:text-destructive"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        <p className="text-[9px] text-muted-foreground/60 italic uppercase tracking-widest">Set custom prices per location. If empty, base price applies.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Free Shipping Threshold</label>
           <input 
             type="number" 
             value={form.freeOverAmount || ''} 
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