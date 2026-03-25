import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Loader2, Image as ImageIcon, Check, Power } from 'lucide-react';
import { Modal } from '../components/admin/Modal';
import { useFetch, useDelete } from '../hooks/useCrud';
import { apiService } from '../services/api.service';
import { API_ROUTES } from '../config/constants';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MissionSection {
  id: string;
  badge?: string;
  title: string;
  titleItalic?: string;
  description: string;
  descriptionSecondary?: string;
  featureOneTitle?: string;
  featureOneDescription?: string;
  featureTwoTitle?: string;
  featureTwoDescription?: string;
  trustBadgeText?: string;
  imageMain: string;
  imageSecondary?: string;
  ctaText?: string;
  ctaLink?: string;
  isActive: boolean;
}

export const MissionPage: React.FC = () => {
  const { data: missions, loading, refresh } = useFetch<MissionSection>(API_ROUTES.MISSION.BASE);
  const { deleteItem } = useDelete(API_ROUTES.MISSION.BASE);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingMission, setEditingMission] = useState<MissionSection | null>(null);
  
  const [formData, setFormData] = useState({
    badge: 'Our Mission',
    title: 'Real Brands.',
    titleItalic: 'Fair Price.',
    description: 'Amber Premium was born from a simple need: access to genuine international brands in Myanmar without the sky-high markups.',
    descriptionSecondary: 'We bridge the gap between global fashion and our local community. Every item in our shop is sourced directly from brand outlets and authorized retailers in the USA, ensuring you get exactly what you pay for.',
    featureOneTitle: 'Direct Import',
    featureOneDescription: 'Sourced directly from USA Brand Outlets.',
    featureTwoTitle: 'Fair Pricing',
    featureTwoDescription: 'Transparent costs with no hidden fees.',
    trustBadgeText: 'Directly Imported from Official USA Stores. 100% Legit.',
    imageMain: '',
    imageSecondary: '',
    ctaText: 'Shop All Authentic Brands',
    ctaLink: '/shop',
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
      const endpoint = editingMission 
        ? API_ROUTES.MISSION.BY_ID(editingMission.id)
        : API_ROUTES.MISSION.BASE;
      
      const method = editingMission ? 'PATCH' : 'POST';

      await apiService(endpoint, {
        method,
        body: formData,
      });

      setModalOpen(false);
      refresh();
    } catch (error) {
      console.error('Failed to save mission:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (mission: MissionSection) => {
    try {
      await apiService(API_ROUTES.MISSION.BY_ID(mission.id), {
        method: 'PATCH',
        body: { isActive: !mission.isActive },
      });
      refresh();
    } catch (error) {
      console.error('Failed to toggle active status:', error);
    }
  };

  const openAddModal = () => {
    setEditingMission(null);
    setFormData({
      badge: 'Our Mission',
      title: 'Real Brands.',
      titleItalic: 'Fair Price.',
      description: 'Amber Premium was born from a simple need: access to genuine international brands in Myanmar without the sky-high markups.',
      descriptionSecondary: 'We bridge the gap between global fashion and our local community. Every item in our shop is sourced directly from brand outlets and authorized retailers in the USA, ensuring you get exactly what you pay for.',
      featureOneTitle: 'Direct Import',
      featureOneDescription: 'Sourced directly from USA Brand Outlets.',
      featureTwoTitle: 'Fair Pricing',
      featureTwoDescription: 'Transparent costs with no hidden fees.',
      trustBadgeText: 'Directly Imported from Official USA Stores. 100% Legit.',
      imageMain: '',
      imageSecondary: '',
      ctaText: 'Shop All Authentic Brands',
      ctaLink: '/shop',
      isActive: false
    });
    setModalOpen(true);
  };

  const openEditModal = (mission: MissionSection) => {
    setEditingMission(mission);
    setFormData({ 
      badge: mission.badge || '',
      title: mission.title,
      titleItalic: mission.titleItalic || '',
      description: mission.description,
      descriptionSecondary: mission.descriptionSecondary || '',
      featureOneTitle: mission.featureOneTitle || '',
      featureOneDescription: mission.featureOneDescription || '',
      featureTwoTitle: mission.featureTwoTitle || '',
      featureTwoDescription: mission.featureTwoDescription || '',
      trustBadgeText: mission.trustBadgeText || '',
      imageMain: mission.imageMain,
      imageSecondary: mission.imageSecondary || '',
      ctaText: mission.ctaText || '',
      ctaLink: mission.ctaLink || '',
      isActive: mission.isActive
    });
    setModalOpen(true);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-end justify-between">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase leading-none">Website Experience</span>
          <h2 className="text-4xl font-serif text-foreground tracking-tight">Mission Sections</h2>
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
        ) : !missions || missions.length === 0 ? (
          <div className="col-span-full py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic">No mission designs found.</div>
        ) : (
          missions.map((mission) => (
            <div key={mission.id} className={cn(
              "group relative bg-card border transition-all duration-500 overflow-hidden",
              mission.isActive ? "border-primary shadow-lg shadow-primary/5" : "border-border hover:border-primary/50"
            )}>
              <div className="aspect-[16/9] bg-muted relative overflow-hidden">
                <img src={mission.imageMain} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                {mission.isActive && (
                  <div className="absolute top-4 right-4 bg-primary text-white p-2 rounded-full shadow-lg">
                    <Check size={16} />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                   <button onClick={() => openEditModal(mission)} className="p-3 bg-white text-black hover:bg-primary hover:text-white transition-colors"><Edit2 size={18}/></button>
                   <button onClick={() => deleteItem(mission.id).then(refresh)} className="p-3 bg-white text-destructive hover:bg-destructive hover:text-white transition-colors"><Trash2 size={18}/></button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-primary">{mission.badge}</div>
                  <h3 className="text-xl font-serif text-foreground truncate">{mission.title} {mission.titleItalic}</h3>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                   <button 
                    onClick={() => handleToggleActive(mission)}
                    className={cn(
                      "flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors",
                      mission.isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
                    )}
                   >
                     <Power size={14} />
                     {mission.isActive ? 'Active' : 'Set Active'}
                   </button>
                   <span className="text-[9px] font-mono text-muted-foreground/40">{mission.id.split('-')[0]}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editingMission ? 'Refine Mission Design' : 'Initialize Mission Section'}
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
                    <input type="file" onChange={(e) => handleFileChange(e, 'imageMain')} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  </div>
                  <input type="text" value={formData.imageMain} onChange={(e) => setFormData({...formData, imageMain: e.target.value})} placeholder="Or paste image URL..." className="w-full border-b border-border bg-transparent text-[10px] font-mono p-1 focus:border-primary outline-none" />
               </div>
               <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Secondary Image</label>
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
              {submitting || uploading ? <Loader2 size={16} className="animate-spin" /> : editingMission ? 'Commit Changes' : 'Initialize Design'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
