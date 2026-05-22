import React from 'react';
import { Loader2, Globe, MapPin, Save } from 'lucide-react';
import type { WarehouseFormData } from '@amber/shared';

interface WarehouseFormProps {
  formData: WarehouseFormData;
  setFormData: (data: WarehouseFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  editing?: boolean;
}

export const WarehouseForm: React.FC<WarehouseFormProps> = ({
  formData,
  setFormData,
  onSubmit,
  submitting,
  editing = false
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-8 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Node Identification</label>
        <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-xl font-serif focus:border-primary focus:outline-none transition-colors duration-300 rounded-none" placeholder="e.g. Yangon Central Hub" />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground flex items-center gap-2"><Globe size={12}/> Geographic Jurisdiction</label>
        <div className="flex gap-4">
           {['USA', 'MYANMAR'].map((loc) => (
             <button
               key={loc}
               type="button"
               onClick={() => setFormData({ ...formData, location: loc as 'USA' | 'MYANMAR' })}
               className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest border transition-all duration-300 ${formData.location === loc ? 'bg-foreground text-primary-foreground border-foreground' : 'bg-transparent text-muted-foreground border-border hover:border-primary'}`}
             >
               {loc}
             </button>
           ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground flex items-center gap-2"><MapPin size={12}/> Physical Infrastructure Address</label>
        <textarea required value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full h-24 border border-input bg-transparent p-4 text-sm focus:border-primary focus:outline-none transition-colors duration-300 rounded-none resize-none" placeholder="Full operational address..." />
      </div>

      <div className="flex justify-end pt-10 border-t border-border">
        <button type="submit" disabled={submitting} className="flex items-center gap-3 bg-foreground text-primary-foreground px-10 py-4 text-xs font-bold uppercase tracking-[0.3em] hover:bg-primary transition-all duration-300 disabled:opacity-50">
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {editing ? 'Update Changes' : 'Establish Node'}
        </button>
      </div>
    </form>
  );
};