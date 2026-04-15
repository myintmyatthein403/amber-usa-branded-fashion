import React from 'react';
import { Image as ImageIcon, Plus, FileText, Loader2 } from 'lucide-react';

interface BrandFormProps {
  formData: { name: string; logo: string; note: string };
  setFormData: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  submitting: boolean;
  editingBrand: any;
  onMediaSelectorOpen: () => void;
}

export const BrandForm: React.FC<BrandFormProps> = ({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  submitting,
  editingBrand,
  onMediaSelectorOpen
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-8 py-4">
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Brand Nomenclature</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-xl font-serif placeholder:text-muted-foreground/20 focus:border-primary focus:outline-none transition-colors duration-300 rounded-none"
            placeholder="e.g. Amber Myanmar"
          />
        </div>

        <div className="space-y-4">
          <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground flex items-center gap-2">
            <ImageIcon size={14}/> Brand Insignia (Logo)
          </label>
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 border border-border bg-secondary flex items-center justify-center overflow-hidden">
              {formData.logo ? (
                <img src={formData.logo} className="w-full h-full object-contain" />
              ) : (
                <ImageIcon size={24} className="text-muted-foreground/20" />
              )}
            </div>
            <div className="flex-1 space-y-3">
               <div className="flex gap-2">
                 <button 
                   type="button"
                   onClick={onMediaSelectorOpen}
                   className="h-10 flex-1 border border-border flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:bg-muted/50 transition-colors"
                 >
                    <Plus size={14} className="mr-2" />
                    Select Media
                 </button>
                 <div className="flex-[2]">
                   <input
                     type="text"
                     value={formData.logo}
                     onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                     className="w-full h-10 border border-border bg-transparent px-4 text-[10px] font-mono focus:border-primary focus:outline-none transition-colors"
                     placeholder="Or paste image URL here..."
                   />
                 </div>
               </div>
               <p className="text-[9px] text-muted-foreground uppercase tracking-widest leading-relaxed">Recommended: SVGs or Transparent PNGs with high contrast for dark/light themes.</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground flex items-center gap-2">
            <FileText size={14}/> Operational Notes
          </label>
          <textarea
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            className="w-full h-32 border border-input bg-transparent p-4 text-sm focus:border-primary focus:outline-none transition-colors duration-300 rounded-none resize-none"
            placeholder="Strategic notes, brand guidelines summary, or vendor contact info..."
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
          {editingBrand ? 'Commit Identity' : 'Initialize Brand'}
        </button>
      </div>
    </form>
  );
};
