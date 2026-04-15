import React from 'react';
import { Loader2, Image as ImageIcon } from 'lucide-react';
import { MissionSection, CreateMissionInput } from '../schema';

interface MissionFormProps {
  formData: CreateMissionInput;
  setFormData: React.Dispatch<React.SetStateAction<CreateMissionInput>>;
  submitting: boolean;
  uploading: boolean;
  editingMission: MissionSection | null;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>, field: 'imageMain' | 'imageSecondary') => void;
}

export const MissionForm: React.FC<MissionFormProps> = ({
  formData,
  setFormData,
  submitting,
  uploading,
  editingMission,
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
              placeholder="e.g. Our Mission"
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
            <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Title Italicized</label>
            <input
              type="text"
              value={formData.titleItalic}
              onChange={(e) => setFormData({ ...formData, titleItalic: e.target.value })}
              className="w-full h-12 border-b border-input bg-transparent text-2xl font-serif italic text-primary focus:border-primary focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Main Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full h-24 border border-input bg-transparent p-4 text-sm focus:border-primary focus:outline-none transition-colors resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Secondary Description</label>
          <textarea
            value={formData.descriptionSecondary}
            onChange={(e) => setFormData({ ...formData, descriptionSecondary: e.target.value })}
            className="w-full h-24 border border-input bg-transparent p-4 text-sm focus:border-primary focus:outline-none transition-colors resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="space-y-4 p-4 border border-border bg-muted/30">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary">Feature One</label>
              <div className="space-y-2">
                <label className="text-[9px] uppercase font-bold text-muted-foreground">Title</label>
                <input type="text" value={formData.featureOneTitle} onChange={(e) => setFormData({...formData, featureOneTitle: e.target.value})} className="w-full border-b border-border bg-transparent text-sm focus:border-primary outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] uppercase font-bold text-muted-foreground">Description</label>
                <input type="text" value={formData.featureOneDescription} onChange={(e) => setFormData({...formData, featureOneDescription: e.target.value})} className="w-full border-b border-border bg-transparent text-xs focus:border-primary outline-none" />
              </div>
           </div>
           <div className="space-y-4 p-4 border border-border bg-muted/30">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary">Feature Two</label>
              <div className="space-y-2">
                <label className="text-[9px] uppercase font-bold text-muted-foreground">Title</label>
                <input type="text" value={formData.featureTwoTitle} onChange={(e) => setFormData({...formData, featureTwoTitle: e.target.value})} className="w-full border-b border-border bg-transparent text-sm focus:border-primary outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] uppercase font-bold text-muted-foreground">Description</label>
                <input type="text" value={formData.featureTwoDescription} onChange={(e) => setFormData({...formData, featureTwoDescription: e.target.value})} className="w-full border-b border-border bg-transparent text-xs focus:border-primary outline-none" />
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <div className="space-y-2 md:col-span-2">
             <label className="text-[10px] font-bold uppercase text-muted-foreground">Trust Badge Text</label>
             <input type="text" value={formData.trustBadgeText} onChange={(e) => setFormData({...formData, trustBadgeText: e.target.value})} className="w-full border-b border-border bg-transparent p-1 text-xs focus:border-primary outline-none" />
           </div>
           <div className="space-y-2">
             <label className="text-[10px] font-bold uppercase text-muted-foreground">CTA Text</label>
             <input type="text" value={formData.ctaText} onChange={(e) => setFormData({...formData, ctaText: e.target.value})} className="w-full border-b border-border bg-transparent p-1 text-xs focus:border-primary outline-none" />
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-4">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Primary Image</label>
              <div className="aspect-[4/5] bg-muted relative overflow-hidden border border-border">
                {formData.imageMain ? <img src={formData.imageMain} className="w-full h-full object-cover" /> : <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20"><ImageIcon size={48}/></div>}
                <input type="file" onChange={(e) => onFileChange(e, 'imageMain')} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
              </div>
              <input type="text" value={formData.imageMain} onChange={(e) => setFormData({...formData, imageMain: e.target.value})} placeholder="Or paste image URL..." className="w-full border-b border-border bg-transparent text-[10px] font-mono p-1 focus:border-primary outline-none" />
           </div>
           <div className="space-y-4">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Secondary Image</label>
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
          {submitting || uploading ? <Loader2 size={16} className="animate-spin" /> : editingMission ? 'Commit Changes' : 'Initialize Design'}
        </button>
      </div>
    </form>
  );
};
