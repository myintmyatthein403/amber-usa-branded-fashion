import React from 'react';
import { Loader2, Image as ImageIcon } from 'lucide-react';
import { HeroSection, CreateHeroInput } from '../schema';

interface HeroFormProps {
  formData: CreateHeroInput;
  setFormData: React.Dispatch<React.SetStateAction<CreateHeroInput>>;
  submitting: boolean;
  uploading: boolean;
  editingHero: HeroSection | null;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>, field: 'imageMain' | 'imageSecondary') => void;
}

export const HeroForm: React.FC<HeroFormProps> = ({
  formData,
  setFormData,
  submitting,
  uploading,
  editingHero,
  onSubmit,
  onCancel,
  onFileChange
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
              placeholder="e.g. Authentic USA Brands"
            />
          </div>
          <div className="flex items-end gap-4">
             <label className="flex items-center gap-2 cursor-pointer mb-2">
               <input 
                type="checkbox" 
                checked={formData.titleItalic} 
                onChange={(e) => setFormData({...formData, titleItalic: e.target.checked})}
                className="accent-primary"
               />
               <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground italic">Italicize Part Two</span>
             </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Title Part One</label>
            <input
              type="text"
              required
              value={formData.titlePartOne}
              onChange={(e) => setFormData({ ...formData, titlePartOne: e.target.value })}
              className="w-full h-12 border-b border-input bg-transparent text-2xl font-serif focus:border-primary focus:outline-none transition-colors"
              placeholder="e.g. Global"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Title Part Two</label>
            <input
              type="text"
              value={formData.titlePartTwo}
              onChange={(e) => setFormData({ ...formData, titlePartTwo: e.target.value })}
              className="w-full h-12 border-b border-input bg-transparent text-2xl font-serif focus:border-primary focus:outline-none transition-colors"
              placeholder="e.g. Authenticity"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Narrative Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full h-24 border border-input bg-transparent p-4 text-sm focus:border-primary focus:outline-none transition-colors resize-none"
            placeholder="Describe the hero section narrative..."
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <div className="space-y-2">
             <label className="text-[10px] font-bold uppercase text-muted-foreground">Primary CTA</label>
             <input type="text" value={formData.ctaPrimaryText} onChange={(e) => setFormData({...formData, ctaPrimaryText: e.target.value})} className="w-full border-b border-border bg-transparent p-1 text-xs focus:border-primary outline-none" placeholder="e.g. Shop Brands" />
           </div>
           <div className="space-y-2">
             <label className="text-[10px] font-bold uppercase text-muted-foreground">Primary Link</label>
             <input type="text" value={formData.ctaPrimaryLink} onChange={(e) => setFormData({...formData, ctaPrimaryLink: e.target.value})} className="w-full border-b border-border bg-transparent p-1 text-xs font-mono focus:border-primary outline-none" placeholder="/shop" />
           </div>
           <div className="space-y-2">
             <label className="text-[10px] font-bold uppercase text-muted-foreground">Secondary CTA</label>
             <input type="text" value={formData.ctaSecondaryText} onChange={(e) => setFormData({...formData, ctaSecondaryText: e.target.value})} className="w-full border-b border-border bg-transparent p-1 text-xs focus:border-primary outline-none" placeholder="e.g. Check Legitimacy" />
           </div>
           <div className="space-y-2">
             <label className="text-[10px] font-bold uppercase text-muted-foreground">Secondary Link</label>
             <input type="text" value={formData.ctaSecondaryLink} onChange={(e) => setFormData({...formData, ctaSecondaryLink: e.target.value})} className="w-full border-b border-border bg-transparent p-1 text-xs font-mono focus:border-primary outline-none" placeholder="/track" />
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-4">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Primary Composition</label>
              <div className="aspect-[4/5] bg-muted relative overflow-hidden border border-border">
                {formData.imageMain ? <img src={formData.imageMain} className="w-full h-full object-cover" /> : <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20"><ImageIcon size={48}/></div>}
                <input type="file" onChange={(e) => onFileChange(e, 'imageMain')} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
              </div>
              <input type="text" value={formData.imageMain} onChange={(e) => setFormData({...formData, imageMain: e.target.value})} placeholder="Or paste image URL..." className="w-full border-b border-border bg-transparent text-[10px] font-mono p-1 focus:border-primary outline-none" />
           </div>
           <div className="space-y-4">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Secondary Composition</label>
              <div className="aspect-[4/5] bg-muted relative overflow-hidden border border-border">
                {formData.imageSecondary ? <img src={formData.imageSecondary} className="w-full h-full object-cover" /> : <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20"><ImageIcon size={48}/></div>}
                <input type="file" onChange={(e) => onFileChange(e, 'imageSecondary')} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
              </div>
              <input type="text" value={formData.imageSecondary} onChange={(e) => setFormData({...formData, imageSecondary: e.target.value})} placeholder="Or paste image URL..." className="w-full border-b border-border bg-transparent text-[10px] font-mono p-1 focus:border-primary outline-none" />
           </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t border-border">
        <button type="button" onClick={onCancel} className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground">Cancel</button>
        <button
          type="submit"
          disabled={submitting || uploading}
          className="bg-foreground text-primary-foreground px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all disabled:opacity-50"
        >
          {submitting || uploading ? <Loader2 size={16} className="animate-spin" /> : editingHero ? 'Commit Changes' : 'Initialize Design'}
        </button>
      </div>
    </form>
  );
};
