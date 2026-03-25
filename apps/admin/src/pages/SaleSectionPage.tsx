import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Loader2, Image as ImageIcon, Check, Power, Timer } from 'lucide-react';
import { Modal } from '../components/admin/Modal';
import { useFetch, useDelete } from '../hooks/useCrud';
import { apiService } from '../services/api.service';
import { API_ROUTES } from '../config/constants';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SaleSection {
  id: string;
  badge?: string;
  title: string;
  titleItalic?: string;
  description: string;
  endDate: string;
  ctaText?: string;
  ctaLink?: string;
  imageMain: string;
  isActive: boolean;
}

export const SaleSectionPage: React.FC = () => {
  const { data: sections, loading, refresh } = useFetch<SaleSection>(API_ROUTES.SALE_SECTION.BASE);
  const { deleteItem } = useDelete(API_ROUTES.SALE_SECTION.BASE);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingSection, setEditingSection] = useState<SaleSection | null>(null);
  
  const [formData, setFormData] = useState({
    badge: 'Limited Time Event',
    title: 'Thingyan',
    titleItalic: 'Mega Sale',
    description: 'Celebrate the Myanmar New Year with authentic USA brands at unprecedented prices.',
    endDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    ctaText: 'Shop the Sale',
    ctaLink: '/shop',
    imageMain: '',
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = await uploadFile(e.target.files[0]);
      if (url) {
        setFormData({ ...formData, imageMain: url });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const endpoint = editingSection 
        ? API_ROUTES.SALE_SECTION.BY_ID(editingSection.id)
        : API_ROUTES.SALE_SECTION.BASE;
      
      const method = editingSection ? 'PATCH' : 'POST';

      // Ensure endDate is sent as a full ISO string
      const payload = {
        ...formData,
        endDate: new Date(formData.endDate).toISOString()
      };

      await apiService(endpoint, {
        method,
        body: payload,
      });

      setModalOpen(false);
      refresh();
    } catch (error) {
      console.error('Failed to save section:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (section: SaleSection) => {
    try {
      await apiService(API_ROUTES.SALE_SECTION.BY_ID(section.id), {
        method: 'PATCH',
        body: { isActive: !section.isActive },
      });
      refresh();
    } catch (error) {
      console.error('Failed to toggle active status:', error);
    }
  };

  const openAddModal = () => {
    setEditingSection(null);
    setFormData({
      badge: 'Limited Time Event',
      title: 'Thingyan',
      titleItalic: 'Mega Sale',
      description: 'Celebrate the Myanmar New Year with authentic USA brands at unprecedented prices.',
      endDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      ctaText: 'Shop the Sale',
      ctaLink: '/shop',
      imageMain: '',
      isActive: false
    });
    setModalOpen(true);
  };

  const openEditModal = (section: SaleSection) => {
    setEditingSection(section);
    setFormData({ 
      badge: section.badge || '',
      title: section.title,
      titleItalic: section.titleItalic || '',
      description: section.description,
      endDate: new Date(section.endDate).toISOString().split('T')[0],
      ctaText: section.ctaText || '',
      ctaLink: section.ctaLink || '',
      imageMain: section.imageMain,
      isActive: section.isActive
    });
    setModalOpen(true);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-end justify-between">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase leading-none">Website Experience</span>
          <h2 className="text-4xl font-serif text-foreground tracking-tight">Sale Event Section</h2>
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
        ) : !sections || sections.length === 0 ? (
          <div className="col-span-full py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic">No sale event designs found.</div>
        ) : (
          sections.map((section) => (
            <div key={section.id} className={cn(
              "group relative bg-card border transition-all duration-500 overflow-hidden",
              section.isActive ? "border-primary shadow-lg shadow-primary/5" : "border-border hover:border-primary/50"
            )}>
              <div className="aspect-[16/9] bg-muted relative overflow-hidden">
                <img src={section.imageMain} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                {section.isActive && (
                  <div className="absolute top-4 right-4 bg-primary text-white p-2 rounded-full shadow-lg">
                    <Check size={16} />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                   <button onClick={() => openEditModal(section)} className="p-3 bg-white text-black hover:bg-primary hover:text-white transition-colors"><Edit2 size={18}/></button>
                   <button onClick={() => deleteItem(section.id).then(refresh)} className="p-3 bg-white text-destructive hover:bg-destructive hover:text-white transition-colors"><Trash2 size={18}/></button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-primary">{section.badge}</div>
                  <h3 className="text-xl font-serif text-foreground truncate">{section.title} {section.titleItalic}</h3>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                   <button 
                    onClick={() => handleToggleActive(section)}
                    className={cn(
                      "flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors",
                      section.isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
                    )}
                   >
                     <Power size={14} />
                     {section.isActive ? 'Active' : 'Set Active'}
                   </button>
                   <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Timer size={12} />
                      <span className="text-[9px] font-mono">{new Date(section.endDate).toLocaleDateString()}</span>
                   </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editingSection ? 'Refine Sale Event' : 'Initialize Sale Event'}
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
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Event End Date</label>
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full h-10 border-b border-input bg-transparent text-sm focus:border-primary focus:outline-none transition-colors"
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
              <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Narrative Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full h-24 border border-input bg-transparent p-4 text-sm focus:border-primary focus:outline-none transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                 <label className="text-[10px] font-bold uppercase text-muted-foreground">CTA Text</label>
                 <input type="text" value={formData.ctaText} onChange={(e) => setFormData({...formData, ctaText: e.target.value})} className="w-full border-b border-border bg-transparent p-1 text-xs focus:border-primary outline-none" />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-bold uppercase text-muted-foreground">CTA Link</label>
                 <input type="text" value={formData.ctaLink} onChange={(e) => setFormData({...formData, ctaLink: e.target.value})} className="w-full border-b border-border bg-transparent p-1 text-xs font-mono focus:border-primary outline-none" />
               </div>
            </div>

            <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Featured Image</label>
                <div className="aspect-[16/9] bg-muted relative overflow-hidden border border-border">
                  {formData.imageMain ? <img src={formData.imageMain} className="w-full h-full object-cover" /> : <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20"><ImageIcon size={48}/></div>}
                  <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                </div>
                <input type="text" value={formData.imageMain} onChange={(e) => setFormData({...formData, imageMain: e.target.value})} placeholder="Or paste image URL..." className="w-full border-b border-border bg-transparent text-[10px] font-mono p-1 focus:border-primary outline-none" />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-border">
            <button type="button" onClick={() => setModalOpen(false)} className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground">Cancel</button>
            <button
              type="submit"
              disabled={submitting || uploading}
              className="bg-foreground text-primary-foreground px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all disabled:opacity-50"
            >
              {submitting || uploading ? <Loader2 size={16} className="animate-spin" /> : editingSection ? 'Commit Changes' : 'Initialize Design'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
