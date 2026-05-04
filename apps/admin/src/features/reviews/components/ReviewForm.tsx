import React from 'react';
import { Star, User, Globe, MessageSquare, Loader2, ArrowRight } from 'lucide-react';
import { ReviewProduct } from '../schema';
import type { ReviewFormData } from '@amber/shared';

interface ReviewFormProps {
  formData: ReviewFormData;
  setFormData: (data: ReviewFormData) => void;
  products: ReviewProduct[] | null;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  formData,
  setFormData,
  products,
  onSubmit,
  submitting
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-10 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground flex items-center gap-2"><User size={12}/> Reviewer Name</label>
          <input type="text" required value={formData.userName} onChange={(e) => setFormData({ ...formData, userName: e.target.value })} className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-xl font-serif focus:border-primary focus:outline-none transition-colors duration-300 rounded-none" placeholder="e.g. Eleanor Rigby" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground flex items-center gap-2"><Globe size={12}/> Profile URL (Optional)</label>
          <input type="url" value={formData.userProfileUrl} onChange={(e) => setFormData({ ...formData, userProfileUrl: e.target.value })} className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-sm font-mono focus:border-primary focus:outline-none transition-colors duration-300 rounded-none" placeholder="https://instagram.com/user" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Rating</label>
          <div className="flex items-center gap-4 h-12">
            {[1, 2, 3, 4, 5].map((star) => (
              <button 
                key={star}
                type="button"
                onClick={() => setFormData({ ...formData, rating: star })}
                className="group transition-transform hover:scale-125"
              >
                <Star 
                  size={24} 
                  className={star <= formData.rating ? "fill-primary text-primary" : "text-muted-foreground/20"} 
                />
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Source Platform</label>
          <select value={formData.platform} onChange={(e) => setFormData({ ...formData, platform: e.target.value as any })} className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-[10px] font-bold uppercase tracking-widest focus:border-primary focus:outline-none transition-colors duration-300 rounded-none">
            <option value="WEBSITE">INTERNAL WEBSITE</option>
            <option value="FACEBOOK">FACEBOOK DIRECT</option>
            <option value="INSTAGRAM">INSTAGRAM REEL</option>
            <option value="TIKTOK">TIKTOK FEED</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Target Product</label>
          <select required value={formData.productId} onChange={(e) => setFormData({ ...formData, productId: e.target.value })} className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-[10px] font-bold uppercase tracking-widest focus:border-primary focus:outline-none transition-colors duration-300 rounded-none">
            <option value="">Select Catalog Item</option>
            {products?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground flex items-center gap-2"><MessageSquare size={12}/> Review Content</label>
        <textarea required value={formData.comment} onChange={(e) => setFormData({ ...formData, comment: e.target.value })} className="w-full h-32 border border-input bg-transparent p-4 text-sm focus:border-primary focus:outline-none transition-colors duration-300 rounded-none resize-none" placeholder="Capture the customer's sentiment here..." />
      </div>

      <div className="flex justify-end pt-10 border-t border-border">
        <button type="submit" disabled={submitting} className="flex items-center gap-3 bg-foreground text-primary-foreground px-10 py-4 text-xs font-bold uppercase tracking-[0.3em] hover:bg-primary transition-all duration-300 disabled:opacity-50">
          {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Register Feedback'}
          <ArrowRight size={16} />
        </button>
      </div>
    </form>
  );
};
