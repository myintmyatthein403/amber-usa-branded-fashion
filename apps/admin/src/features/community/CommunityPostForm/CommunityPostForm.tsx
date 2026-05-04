import React from 'react';
import { Image as ImageIcon, Star, Loader2 } from 'lucide-react';
import type { CommunityPostFormData } from '@amber/shared';

interface CommunityPostFormProps {
  formData: CommunityPostFormData;
  setFormData: (data: CommunityPostFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  submitting: boolean;
  uploading: boolean;
  editingPost: any;
  onCancel: () => void;
}

export const CommunityPostForm: React.FC<CommunityPostFormProps> = ({
  formData,
  setFormData,
  onSubmit,
  onFileChange,
  submitting,
  uploading,
  editingPost,
  onCancel
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-8 py-4 max-h-[70vh] overflow-y-auto px-1 custom-scrollbar">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Username</label>
            <input
              type="text"
              required
              value={formData.user}
              onChange={(e) => setFormData({ ...formData, user: e.target.value })}
              className="w-full h-10 border-b border-input bg-transparent text-sm focus:border-primary focus:outline-none transition-colors"
              placeholder="e.g. Su Myat"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Instagram Handle</label>
            <input
              type="text"
              required
              value={formData.handle}
              onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
              className="w-full h-10 border-b border-input bg-transparent text-sm focus:border-primary focus:outline-none transition-colors"
              placeholder="e.g. @sumyat_fashion"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Initial Likes</label>
            <input
              type="number"
              value={formData.likes}
              onChange={(e) => setFormData({ ...formData, likes: parseInt(e.target.value) || 0 })}
              className="w-full h-10 border-b border-input bg-transparent text-sm focus:border-primary focus:outline-none transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Rating</label>
            <div className="flex gap-2 pt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({...formData, stars: star})}
                  className="transition-transform hover:scale-110 active:scale-95"
                >
                  <Star size={20} className={star <= formData.stars ? "text-primary fill-primary" : "text-muted-foreground/20"} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Comment</label>
          <textarea
            required
            value={formData.comment}
            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
            className="w-full h-24 border border-input bg-transparent p-4 text-sm focus:border-primary focus:outline-none transition-colors resize-none"
          />
        </div>

        <div className="space-y-4">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Post Image</label>
            <div className="aspect-square bg-muted relative overflow-hidden border border-border max-w-[200px]">
              {formData.image ? <img src={formData.image} className="w-full h-full object-cover" /> : <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20"><ImageIcon size={32}/></div>}
              <input type="file" onChange={onFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
            </div>
            <input type="text" value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} placeholder="Or paste image URL..." className="w-full border-b border-border bg-transparent text-[10px] font-mono p-1 focus:border-primary outline-none" />
        </div>

        <div className="flex items-center gap-2 pt-4">
           <input 
            type="checkbox" 
            id="postActive"
            checked={formData.isActive} 
            onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
            className="accent-primary h-4 w-4"
           />
           <label htmlFor="postActive" className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground cursor-pointer">Visible on Website</label>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t border-border">
        <button type="button" onClick={onCancel} className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground">Cancel</button>
        <button
          type="submit"
          disabled={submitting || uploading}
          className="bg-foreground text-primary-foreground px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all disabled:opacity-50"
        >
          {submitting || uploading ? <Loader2 size={16} className="animate-spin" /> : editingPost ? 'Commit Changes' : 'Publish Post'}
        </button>
      </div>
    </form>
  );
};
