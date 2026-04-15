import React from 'react';
import { Image as ImageIcon, Plus, Loader2, FileText } from 'lucide-react';

interface CollectionFormProps {
  formData: any;
  setFormData: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  submitting: boolean;
  uploading: boolean;
  editingCollection: any;
  onNameChange: (name: string) => void;
  onCancel: () => void;
}

export const CollectionForm: React.FC<CollectionFormProps> = ({
  formData,
  setFormData,
  onSubmit,
  onFileChange,
  submitting,
  uploading,
  editingCollection,
  onNameChange,
  onCancel
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-8 py-4">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Collection Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => onNameChange(e.target.value)}
              className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-xl font-serif placeholder:text-muted-foreground/20 focus:border-primary focus:outline-none transition-colors duration-300 rounded-none"
              placeholder="e.g. Summer Heritage"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Slug (URL)</label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-lg font-mono placeholder:text-muted-foreground/20 focus:border-primary focus:outline-none transition-colors duration-300 rounded-none"
              placeholder="summer-heritage"
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground flex items-center gap-2">
            <ImageIcon size={14}/> Cover Image
          </label>
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 border border-border bg-secondary flex items-center justify-center overflow-hidden">
              {formData.image ? (
                <img src={formData.image} className="w-full h-full object-cover" />
              ) : (
                <ImageIcon size={24} className="text-muted-foreground/20" />
              )}
            </div>
            <div className="flex-1 space-y-3">
               <div className="flex gap-2">
                 <div className="relative h-10 flex-1">
                   <input 
                     type="file" 
                     onChange={onFileChange}
                     className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                     accept="image/*"
                   />
                   <div className="absolute inset-0 border border-border flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:bg-muted/50 transition-colors">
                      {uploading ? <Loader2 size={14} className="animate-spin mr-2" /> : <Plus size={14} className="mr-2" />}
                      Upload Image
                   </div>
                 </div>
                 <div className="flex-[2]">
                   <input
                     type="text"
                     value={formData.image}
                     onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                     className="w-full h-10 border border-border bg-transparent px-4 text-[10px] font-mono focus:border-primary focus:outline-none transition-colors"
                     placeholder="Or paste image URL here..."
                   />
                 </div>
               </div>
               <p className="text-[9px] text-muted-foreground uppercase tracking-widest leading-relaxed">High-resolution lifestyle images recommended for collection covers.</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground flex items-center gap-2">
            <FileText size={14}/> Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full h-24 border border-input bg-transparent p-4 text-sm focus:border-primary focus:outline-none transition-colors duration-300 rounded-none resize-none"
            placeholder="Describe the aesthetic and purpose of this collection..."
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
          />
          <label htmlFor="isActive" className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground cursor-pointer">
            Publicly Visible (Active)
          </label>
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
          disabled={submitting || uploading}
          className="flex items-center gap-3 bg-foreground text-primary-foreground px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-colors duration-300 disabled:opacity-50"
        >
          {(submitting || uploading) && <Loader2 size={16} className="animate-spin" />}
          {editingCollection ? 'Save Changes' : 'Create Collection'}
        </button>
      </div>
    </form>
  );
};
