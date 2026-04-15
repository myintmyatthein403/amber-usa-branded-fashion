import React from 'react';
import { Loader2, Save, Layout, Link as LinkIcon } from 'lucide-react';
import { Ad, AdFormData, AdPlacement, AdStatus } from '../schema';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AdFormProps {
  form: AdFormData;
  setForm: (form: AdFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  editingAd: Ad | null;
}

export const AdForm: React.FC<AdFormProps> = ({ form, setForm, onSubmit, submitting, editingAd }) => {
  return (
    <form onSubmit={onSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Campaign Title</label>
          <input 
            type="text" 
            required 
            value={form.title} 
            onChange={(e) => setForm({ ...form, title: e.target.value })} 
            className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-lg font-serif placeholder:text-muted-foreground/20 focus:border-primary focus:outline-none transition-colors duration-300 rounded-none" 
            placeholder="e.g. Summer Collection 2026" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Placement Zone</label>
          <select 
            value={form.placement} 
            onChange={(e) => setForm({ ...form, placement: e.target.value as AdPlacement })}
            className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-sm font-bold uppercase tracking-widest focus:border-primary focus:outline-none transition-colors duration-300 rounded-none"
          >
            {Object.values(AdPlacement).map(p => (
              <option key={p} value={p}>{p.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Creative Image URL</label>
        <div className="relative">
          <input 
            type="text" 
            required 
            value={form.imageUrl} 
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} 
            className="w-full h-12 border-b border-input bg-transparent pl-0 pr-10 py-2 text-sm focus:border-primary focus:outline-none transition-colors duration-300 rounded-none" 
            placeholder="https://images.unsplash.com/..." 
          />
          <Layout className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={18} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Target Destination (Link)</label>
          <div className="relative">
            <input 
              type="text" 
              value={form.linkUrl} 
              onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} 
              className="w-full h-12 border-b border-input bg-transparent pl-0 pr-10 py-2 text-sm focus:border-primary focus:outline-none transition-colors duration-300 rounded-none" 
              placeholder="/collections/summer" 
            />
            <LinkIcon className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={18} />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Priority Level (Highest First)</label>
          <input 
            type="number" 
            value={form.priority} 
            onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 0 })} 
            className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-lg font-mono focus:border-primary focus:outline-none transition-colors duration-300 rounded-none" 
            placeholder="0" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Start Date</label>
          <input 
            type="date" 
            value={form.startDate || ''} 
            onChange={(e) => setForm({ ...form, startDate: e.target.value })} 
            className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-sm focus:border-primary focus:outline-none transition-colors duration-300 rounded-none uppercase tracking-widest" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">End Date</label>
          <input 
            type="date" 
            value={form.endDate || ''} 
            onChange={(e) => setForm({ ...form, endDate: e.target.value })} 
            className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-sm focus:border-primary focus:outline-none transition-colors duration-300 rounded-none uppercase tracking-widest" 
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Current Lifecycle Status</label>
        <div className="flex gap-4 pt-2">
          {Object.values(AdStatus).map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setForm({ ...form, status: s })}
              className={cn(
                "flex-1 py-3 text-[10px] font-bold uppercase tracking-widest border transition-all duration-300",
                form.status === s ? "bg-foreground text-background border-foreground" : "bg-transparent text-muted-foreground border-border hover:border-muted-foreground"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-10 border-t border-border">
        <button 
          type="submit" 
          disabled={submitting} 
          className="flex items-center gap-3 bg-foreground text-primary-foreground px-10 py-4 text-xs font-bold uppercase tracking-[0.3em] hover:bg-primary transition-colors duration-500 disabled:opacity-50"
        >
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {editingAd ? 'Update Campaign' : 'Launch Campaign'}
        </button>
      </div>
    </form>
  );
};
