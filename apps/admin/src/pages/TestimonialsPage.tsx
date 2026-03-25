import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Loader2, Star, Check, Power, User } from 'lucide-react';
import { Modal } from '../components/admin/Modal';
import { useFetch, useDelete } from '../hooks/useCrud';
import { apiService } from '../services/api.service';
import { API_ROUTES } from '../config/constants';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Testimonial {
  id: string;
  text: string;
  author: string;
  location?: string;
  role?: string;
  rating: number;
  isActive: boolean;
}

export const TestimonialsPage: React.FC = () => {
  const { data: testimonials, loading, refresh } = useFetch<Testimonial>(API_ROUTES.TESTIMONIALS.BASE);
  const { deleteItem } = useDelete(API_ROUTES.TESTIMONIALS.BASE);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  
  const [formData, setFormData] = useState({
    text: '',
    author: '',
    location: '',
    role: '',
    rating: 5,
    isActive: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const endpoint = editingTestimonial 
        ? API_ROUTES.TESTIMONIALS.BY_ID(editingTestimonial.id)
        : API_ROUTES.TESTIMONIALS.BASE;
      
      const method = editingTestimonial ? 'PATCH' : 'POST';

      await apiService(endpoint, {
        method,
        body: formData,
      });

      setModalOpen(false);
      refresh();
    } catch (error) {
      console.error('Failed to save testimonial:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (testimonial: Testimonial) => {
    try {
      await apiService(API_ROUTES.TESTIMONIALS.BY_ID(testimonial.id), {
        method: 'PATCH',
        body: { isActive: !testimonial.isActive },
      });
      refresh();
    } catch (error) {
      console.error('Failed to toggle active status:', error);
    }
  };

  const openAddModal = () => {
    setEditingTestimonial(null);
    setFormData({
      text: '',
      author: '',
      location: '',
      role: '',
      rating: 5,
      isActive: true
    });
    setModalOpen(true);
  };

  const openEditModal = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({ 
      text: testimonial.text,
      author: testimonial.author,
      location: testimonial.location || '',
      role: testimonial.role || '',
      rating: testimonial.rating,
      isActive: testimonial.isActive
    });
    setModalOpen(true);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-end justify-between">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase leading-none">Social Proof</span>
          <h2 className="text-4xl font-serif text-foreground tracking-tight">Customer Voices</h2>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-3 bg-foreground text-primary-foreground px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all duration-300 shadow-xl shadow-black/5"
        >
          <Plus size={18} /> New Voice
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic animate-pulse">Gathering voices...</div>
        ) : !testimonials || testimonials.length === 0 ? (
          <div className="col-span-full py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic">No voices found.</div>
        ) : (
          testimonials.map((testimonial) => (
            <div key={testimonial.id} className={cn(
              "group relative bg-card border transition-all duration-500 overflow-hidden flex flex-col",
              testimonial.isActive ? "border-primary shadow-lg shadow-primary/5" : "border-border hover:border-primary/50"
            )}>
              <div className="p-6 flex-1 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="flex space-x-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} className={i < testimonial.rating ? "text-primary fill-primary" : "text-muted-foreground/20"} />
                    ))}
                  </div>
                  {testimonial.isActive && (
                    <div className="bg-primary/10 text-primary p-1.5 rounded-full">
                      <Check size={12} />
                    </div>
                  )}
                </div>
                
                <p className="text-sm text-foreground leading-relaxed italic line-clamp-4">
                  "{testimonial.text}"
                </p>

                <div className="flex items-center gap-3 pt-4 border-t border-border">
                   <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                      <User size={16} />
                   </div>
                   <div className="flex-1 min-w-0">
                      <h4 className="text-[11px] font-bold uppercase tracking-widest truncate">{testimonial.author}</h4>
                      <p className="text-[9px] text-muted-foreground uppercase tracking-tighter truncate">
                        {testimonial.location} • {testimonial.role}
                      </p>
                   </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-muted/30 border-t border-border flex items-center justify-between">
                 <button 
                  onClick={() => handleToggleActive(testimonial)}
                  className={cn(
                    "flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors",
                    testimonial.isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
                  )}
                 >
                   <Power size={14} />
                   {testimonial.isActive ? 'Active' : 'Set Active'}
                 </button>
                 <div className="flex gap-2">
                    <button onClick={() => openEditModal(testimonial)} className="p-2 hover:text-primary transition-colors"><Edit2 size={14}/></button>
                    <button onClick={() => deleteItem(testimonial.id).then(refresh)} className="p-2 hover:text-destructive transition-colors"><Trash2 size={14}/></button>
                 </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editingTestimonial ? 'Refine Voice' : 'Add Customer Voice'}
      >
        <form onSubmit={handleSubmit} className="space-y-8 py-4 max-h-[70vh] overflow-y-auto px-1 custom-scrollbar">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Author Name</label>
              <input
                type="text"
                required
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full h-10 border-b border-input bg-transparent text-sm focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full h-10 border-b border-input bg-transparent text-sm focus:border-primary focus:outline-none transition-colors"
                  placeholder="e.g. Yangon"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Role / Label</label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full h-10 border-b border-input bg-transparent text-sm focus:border-primary focus:outline-none transition-colors"
                  placeholder="e.g. Verified Buyer"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Rating</label>
              <div className="flex gap-2 pt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({...formData, rating: star})}
                    className="transition-transform hover:scale-110 active:scale-95"
                  >
                    <Star size={24} className={star <= formData.rating ? "text-primary fill-primary" : "text-muted-foreground/20"} />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Testimonial Text</label>
              <textarea
                required
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                className="w-full h-32 border border-input bg-transparent p-4 text-sm focus:border-primary focus:outline-none transition-colors resize-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-4">
               <input 
                type="checkbox" 
                id="isActive"
                checked={formData.isActive} 
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="accent-primary h-4 w-4"
               />
               <label htmlFor="isActive" className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground cursor-pointer">Visible on Website</label>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-border">
            <button type="button" onClick={() => setModalOpen(false)} className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground">Cancel</button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-foreground text-primary-foreground px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all disabled:opacity-50"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : editingTestimonial ? 'Commit Changes' : 'Publish Voice'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
