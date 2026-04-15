import React from 'react';
import { Image as ImageIcon, Loader2, Save } from 'lucide-react';

interface SaleSectionFormProps {
  formData: any;
  setFormData: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  submitting: boolean;
  uploading: boolean;
  editingSection: any;
}

export const SaleSectionForm: React.FC<SaleSectionFormProps> = ({
  formData,
  setFormData,
  onSubmit,
  onFileChange,
  submitting,
  uploading,
  editingSection
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-10 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Banner Badge</label>
          <input type="text" required value={formData.badge} onChange={(e) => setFormData({ ...formData, badge: e.target.value })} className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-sm font-bold uppercase tracking-widest focus:border-primary focus:outline-none transition-colors duration-300 rounded-none text-primary" placeholder="e.g. LIMITED TIME EVENT" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">End Date</label>
          <input type="date" required value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-sm font-mono focus:border-primary focus:outline-none transition-colors duration-300 rounded-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Primary Title</label>
          <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-2xl font-serif focus:border-primary focus:outline-none transition-colors duration-300 rounded-none" placeholder="e.g. Thingyan" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Secondary Title (Italic)</label>
          <input type="text" value={formData.titleItalic} onChange={(e) => setFormData({ ...formData, titleItalic: e.target.value })} className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-2xl font-serif italic focus:border-primary focus:outline-none transition-colors duration-300 rounded-none" placeholder="e.g. Mega Sale" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Section Description</label>
        <textarea required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full h-24 border border-input bg-transparent p-4 text-sm focus:border-primary focus:outline-none transition-colors duration-300 rounded-none resize-none" placeholder="Marketing narrative for this promotional event..." />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Button Text</label>
          <input type="text" value={formData.ctaText} onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })} className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-xs font-bold uppercase tracking-[0.2em] focus:border-primary focus:outline-none transition-colors duration-300 rounded-none" placeholder="SHOP THE SALE" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Destination Link</label>
          <input type="text" value={formData.ctaLink} onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })} className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-xs font-mono focus:border-primary focus:outline-none transition-colors duration-300 rounded-none" placeholder="/shop" />
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground flex items-center gap-2"><ImageIcon size={12}/> Hero Visual Assets</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
           <div className="aspect-[21/9] bg-secondary border border-border overflow-hidden relative group">
              {formData.imageMain ? (
                <img src={formData.imageMain} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/30">
                   <ImageIcon size={40} />
                   <span className="text-[8px] font-bold uppercase tracking-widest mt-2">No Visual Linked</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <label className="cursor-pointer bg-white text-black px-6 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-colors">
                    {uploading ? <Loader2 size={14} className="animate-spin" /> : 'Replace Image'}
                    <input type="file" className="hidden" accept="image/*" onChange={onFileChange} disabled={uploading} />
                 </label>
              </div>
           </div>
           <div className="space-y-4">
              <p className="text-[10px] text-muted-foreground leading-relaxed italic">Upload high-resolution landscape imagery (21:9 ratio recommended). This asset will serve as the primary emotional trigger for the promotional event.</p>
              {!formData.imageMain && (
                <label className="inline-flex items-center gap-3 bg-secondary text-foreground px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] cursor-pointer hover:bg-muted transition-colors border border-border">
                   {uploading ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={14} />}
                   {uploading ? 'Processing Architecture...' : 'Select Asset'}
                   <input type="file" className="hidden" accept="image/*" onChange={onFileChange} disabled={uploading} />
                </label>
              )}
           </div>
        </div>
      </div>

      <div className="flex justify-end pt-10 border-t border-border">
        <button type="submit" disabled={submitting || uploading} className="flex items-center gap-3 bg-foreground text-primary-foreground px-10 py-4 text-xs font-bold uppercase tracking-[0.3em] hover:bg-primary transition-all duration-300 disabled:opacity-50">
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {editingSection ? 'Synchronize Section' : 'Initialize Section'}
        </button>
      </div>
    </form>
  );
};
