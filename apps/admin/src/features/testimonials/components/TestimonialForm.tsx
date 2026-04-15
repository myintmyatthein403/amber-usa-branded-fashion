import React from 'react';
import { Star, User, MapPin, Briefcase, MessageSquare, Loader2, Save } from 'lucide-react';

interface TestimonialFormProps {
  formData: any;
  setFormData: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  editingTestimonial: any;
}

export const TestimonialForm: React.FC<TestimonialFormProps> = ({
  formData,
  setFormData,
  onSubmit,
  submitting,
  editingTestimonial
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-10 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground flex items-center gap-2"><User size={12}/> Author Name</label>
          <input type="text" required value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-xl font-serif focus:border-primary focus:outline-none transition-colors duration-300 rounded-none" placeholder="e.g. Julianne Moore" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground flex items-center gap-2"><MapPin size={12}/> Location (Optional)</label>
          <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-sm focus:border-primary focus:outline-none transition-colors duration-300 rounded-none uppercase tracking-widest" placeholder="e.g. NEW YORK, NY" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground flex items-center gap-2"><Briefcase size={12}/> Role/Position (Optional)</label>
          <input type="text" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-sm focus:border-primary focus:outline-none transition-colors duration-300 rounded-none uppercase tracking-widest" placeholder="e.g. CREATIVE DIRECTOR" />
        </div>
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
      </div>

      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground flex items-center gap-2"><MessageSquare size={12}/> Testimonial Narrative</label>
        <textarea required value={formData.text} onChange={(e) => setFormData({ ...formData, text: e.target.value })} className="w-full h-32 border border-input bg-transparent p-4 text-sm focus:border-primary focus:outline-none transition-colors duration-300 rounded-none resize-none" placeholder="Capture the customer's emotional response here..." />
      </div>

      <div className="flex items-center gap-3 py-2">
         <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} className="w-5 h-5 accent-primary" id="isActive" />
         <label htmlFor="isActive" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground cursor-pointer select-none">Mark as Active (Visible on site)</label>
      </div>

      <div className="flex justify-end pt-10 border-t border-border">
        <button type="submit" disabled={submitting} className="flex items-center gap-3 bg-foreground text-primary-foreground px-10 py-4 text-xs font-bold uppercase tracking-[0.3em] hover:bg-primary transition-all duration-300 disabled:opacity-50">
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {editingTestimonial ? 'Synchronize Voice' : 'Archive Voice'}
        </button>
      </div>
    </form>
  );
};
