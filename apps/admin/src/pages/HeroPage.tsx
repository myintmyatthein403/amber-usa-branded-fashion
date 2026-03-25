import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Loader2, Image as ImageIcon, Globe, Check, Power } from 'lucide-react';
import { Modal } from '../components/admin/Modal';
import { useFetch, useDelete } from '../hooks/useCrud';
import { apiService } from '../services/api.service';
import { API_ROUTES } from '../config/constants';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface HeroSection {
  id: string;
  badge?: string;
  titlePartOne: string;
  titlePartTwo?: string;
  titleItalic: boolean;
  description: string;
  ctaPrimaryText: string;
  ctaPrimaryLink: string;
  ctaSecondaryText: string;
  ctaSecondaryLink: string;
  imageMain: string;
  imageSecondary?: string;
  isActive: boolean;
}

export const HeroPage: React.FC = () => {
  const { data: heroes, loading, refresh } = useFetch<HeroSection>(API_ROUTES.HERO.BASE);
  const { deleteItem } = useDelete(API_ROUTES.HERO.BASE);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingHero, setEditingHero] = useState<HeroSection | null>(null);
  
  const [formData, setFormData] = useState({
    badge: 'Authentic USA Brands • Myanmar',
    titlePartOne: 'Global',
    titlePartTwo: 'Authenticity',
    titleItalic: true,
    description: 'Bringing your favorite premium USA brands directly to Myanmar.',
    ctaPrimaryText: 'Shop Brands',
    ctaPrimaryLink: '/shop',
    ctaSecondaryText: 'Check Legitimacy',
    ctaSecondaryLink: '/track',
    imageMain: '',
    imageSecondary: '',
    isActive: false
  });

  const uploadFile = async (file: File): Promise<string | null> => {
    const data = new FormData();
    data.append('file', file);
    setUploading(true);
    try {
      const response = await apiService(API_ROUTES.UPLOAD, {
        method: 'POST',
        body: data,
        isMultipart: true
      });
      return `${import.meta.env.VITE_API_URL}${response.url}`;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: 'imageMain' | 'imageSecondary') => {
    if (e.target.files && e.target.files[0]) {
      const url = await uploadFile(e.target.files[0]);
      if (url) {
        setFormData({ ...formData, [field]: url });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const endpoint = editingHero 
        ? API_ROUTES.HERO.BY_ID(editingHero.id)
        : API_ROUTES.HERO.BASE;
      
      const method = editingHero ? 'PATCH' : 'POST';

      await apiService(endpoint, {
        method,
        body: formData,
      });

      setModalOpen(false);
      refresh();
    } catch (error) {
      console.error('Failed to save hero:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (hero: HeroSection) => {
    try {
      await apiService(API_ROUTES.HERO.BY_ID(hero.id), {
        method: 'PATCH',
        body: { isActive: !hero.isActive },
      });
      refresh();
    } catch (error) {
      console.error('Failed to toggle active status:', error);
    }
  };

  const openAddModal = () => {
    setEditingHero(null);
    setFormData({
      badge: 'Authentic USA Brands • Myanmar',
      titlePartOne: 'Global',
      titlePartTwo: 'Authenticity',
      titleItalic: true,
      description: 'Bringing your favorite premium USA brands directly to Myanmar.',
      ctaPrimaryText: 'Shop Brands',
      ctaPrimaryLink: '/shop',
      ctaSecondaryText: 'Check Legitimacy',
      ctaSecondaryLink: '/track',
      imageMain: '',
      imageSecondary: '',
      isActive: false
    });
    setModalOpen(true);
  };

  const openEditModal = (hero: HeroSection) => {
    setEditingHero(hero);
    setFormData({ 
      badge: hero.badge || '',
      titlePartOne: hero.titlePartOne,
      titlePartTwo: hero.titlePartTwo || '',
      titleItalic: hero.titleItalic,
      description: hero.description,
      ctaPrimaryText: hero.ctaPrimaryText,
      ctaPrimaryLink: hero.ctaPrimaryLink,
      ctaSecondaryText: hero.ctaSecondaryText,
      ctaSecondaryLink: hero.ctaSecondaryLink,
      imageMain: hero.imageMain,
      imageSecondary: hero.imageSecondary || '',
      isActive: hero.isActive
    });
    setModalOpen(true);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-end justify-between">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase leading-none">Website Experience</span>
          <h2 className="text-4xl font-serif text-foreground tracking-tight">Hero Sections</h2>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-3 bg-foreground text-primary-foreground px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all duration-300 shadow-xl shadow-black/5"
        >
          <Plus size={18} /> New Design
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic animate-pulse">Querying Experience Vault...</div>
        ) : !heroes || heroes.length === 0 ? (
          <div className="col-span-full py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic">No hero designs found.</div>
        ) : (
          heroes.map((hero) => (
            <div key={hero.id} className={cn(
              "group relative bg-card border transition-all duration-500 overflow-hidden",
              hero.isActive ? "border-primary shadow-lg shadow-primary/5" : "border-border hover:border-primary/50"
            )}>
              <div className="aspect-[16/9] bg-muted relative overflow-hidden">
                <img src={hero.imageMain} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                {hero.isActive && (
                  <div className="absolute top-4 right-4 bg-primary text-white p-2 rounded-full shadow-lg">
                    <Check size={16} />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                   <button onClick={() => openEditModal(hero)} className="p-3 bg-white text-black hover:bg-primary hover:text-white transition-colors"><Edit2 size={18}/></button>
                   <button onClick={() => deleteItem(hero.id).then(refresh)} className="p-3 bg-white text-destructive hover:bg-destructive hover:text-white transition-colors"><Trash2 size={18}/></button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-primary">{hero.badge}</div>
                  <h3 className="text-xl font-serif text-foreground truncate">{hero.titlePartOne} {hero.titlePartTwo}</h3>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                   <button 
                    onClick={() => handleToggleActive(hero)}
                    className={cn(
                      "flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors",
                      hero.isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
                    )}
                   >
                     <Power size={14} />
                     {hero.isActive ? 'Active' : 'Set Active'}
                   </button>
                   <span className="text-[9px] font-mono text-muted-foreground/40">{hero.id.split('-')[0]}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editingHero ? 'Refine Experience Design' : 'Initialize Hero Section'}
      >
        <form onSubmit={handleSubmit} className="space-y-8 py-4 max-h-[70vh] overflow-y-auto px-1 custom-scrollbar">
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
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Title Part Two</label>
                <input
                  type="text"
                  value={formData.titlePartTwo}
                  onChange={(e) => setFormData({ ...formData, titlePartTwo: e.target.value })}
                  className="w-full h-12 border-b border-input bg-transparent text-2xl font-serif focus:border-primary focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Narrative Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full h-24 border border-input bg-transparent p-4 text-sm focus:border-primary focus:outline-none transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <div className="space-y-2">
                 <label className="text-[10px] font-bold uppercase text-muted-foreground">Primary CTA</label>
                 <input type="text" value={formData.ctaPrimaryText} onChange={(e) => setFormData({...formData, ctaPrimaryText: e.target.value})} className="w-full border-b border-border bg-transparent p-1 text-xs focus:border-primary outline-none" />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-bold uppercase text-muted-foreground">Primary Link</label>
                 <input type="text" value={formData.ctaPrimaryLink} onChange={(e) => setFormData({...formData, ctaPrimaryLink: e.target.value})} className="w-full border-b border-border bg-transparent p-1 text-xs font-mono focus:border-primary outline-none" />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-bold uppercase text-muted-foreground">Secondary CTA</label>
                 <input type="text" value={formData.ctaSecondaryText} onChange={(e) => setFormData({...formData, ctaSecondaryText: e.target.value})} className="w-full border-b border-border bg-transparent p-1 text-xs focus:border-primary outline-none" />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-bold uppercase text-muted-foreground">Secondary Link</label>
                 <input type="text" value={formData.ctaSecondaryLink} onChange={(e) => setFormData({...formData, ctaSecondaryLink: e.target.value})} className="w-full border-b border-border bg-transparent p-1 text-xs font-mono focus:border-primary outline-none" />
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Primary Composition</label>
                  <div className="aspect-[4/5] bg-muted relative overflow-hidden border border-border">
                    {formData.imageMain ? <img src={formData.imageMain} className="w-full h-full object-cover" /> : <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20"><ImageIcon size={48}/></div>}
                    <input type="file" onChange={(e) => handleFileChange(e, 'imageMain')} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  </div>
                  <input type="text" value={formData.imageMain} onChange={(e) => setFormData({...formData, imageMain: e.target.value})} placeholder="Or paste image URL..." className="w-full border-b border-border bg-transparent text-[10px] font-mono p-1 focus:border-primary outline-none" />
               </div>
               <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Secondary Composition</label>
                  <div className="aspect-[4/5] bg-muted relative overflow-hidden border border-border">
                    {formData.imageSecondary ? <img src={formData.imageSecondary} className="w-full h-full object-cover" /> : <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20"><ImageIcon size={48}/></div>}
                    <input type="file" onChange={(e) => handleFileChange(e, 'imageSecondary')} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  </div>
                  <input type="text" value={formData.imageSecondary} onChange={(e) => setFormData({...formData, imageSecondary: e.target.value})} placeholder="Or paste image URL..." className="w-full border-b border-border bg-transparent text-[10px] font-mono p-1 focus:border-primary outline-none" />
               </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-border">
            <button type="button" onClick={() => setModalOpen(false)} className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground">Cancel</button>
            <button
              type="submit"
              disabled={submitting || uploading}
              className="bg-foreground text-primary-foreground px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all disabled:opacity-50"
            >
              {submitting || uploading ? <Loader2 size={16} className="animate-spin" /> : editingHero ? 'Commit Changes' : 'Initialize Design'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
