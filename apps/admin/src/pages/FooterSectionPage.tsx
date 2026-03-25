import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Loader2, Check, Power, Mail, MapPin, Phone, Instagram, Facebook } from 'lucide-react';
import { Modal } from '../components/admin/Modal';
import { useFetch, useDelete } from '../hooks/useCrud';
import { apiService } from '../services/api.service';
import { API_ROUTES } from '../config/constants';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface FooterSection {
  id: string;
  companyName: string;
  companySubtitle: string;
  companyDescription: string;
  instagramUrl?: string;
  facebookUrl?: string;
  contactAddress?: string;
  contactPhone?: string;
  contactEmail?: string;
  copyrightText?: string;
  isActive: boolean;
}

export const FooterSectionPage: React.FC = () => {
  const { data: sections, loading, refresh } = useFetch<FooterSection>(API_ROUTES.FOOTER_SECTION.BASE);
  const { deleteItem } = useDelete(API_ROUTES.FOOTER_SECTION.BASE);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingSection, setEditingSection] = useState<FooterSection | null>(null);
  
  const [formData, setFormData] = useState({
    companyName: 'Amber',
    companySubtitle: 'Premium USA Brands',
    companyDescription: 'Amber Premium is Myanmar\'s trusted destination for authentic USA branded fashion.',
    instagramUrl: '',
    facebookUrl: '',
    contactAddress: '',
    contactPhone: '',
    contactEmail: '',
    copyrightText: '© 2026 Amber Premium. Authentic USA Brands.',
    isActive: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const endpoint = editingSection 
        ? API_ROUTES.FOOTER_SECTION.BY_ID(editingSection.id)
        : API_ROUTES.FOOTER_SECTION.BASE;
      
      const method = editingSection ? 'PATCH' : 'POST';

      await apiService(endpoint, {
        method,
        body: formData,
      });

      setModalOpen(false);
      refresh();
    } catch (error) {
      console.error('Failed to save section:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (section: FooterSection) => {
    try {
      await apiService(API_ROUTES.FOOTER_SECTION.BY_ID(section.id), {
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
      companyName: 'Amber',
      companySubtitle: 'Premium USA Brands',
      companyDescription: 'Amber Premium is Myanmar\'s trusted destination for authentic USA branded fashion.',
      instagramUrl: '',
      facebookUrl: '',
      contactAddress: '',
      contactPhone: '',
      contactEmail: '',
      copyrightText: '© 2026 Amber Premium. Authentic USA Brands.',
      isActive: false
    });
    setModalOpen(true);
  };

  const openEditModal = (section: FooterSection) => {
    setEditingSection(section);
    setFormData({ 
      companyName: section.companyName,
      companySubtitle: section.companySubtitle,
      companyDescription: section.companyDescription,
      instagramUrl: section.instagramUrl || '',
      facebookUrl: section.facebookUrl || '',
      contactAddress: section.contactAddress || '',
      contactPhone: section.contactPhone || '',
      contactEmail: section.contactEmail || '',
      copyrightText: section.copyrightText || '',
      isActive: section.isActive
    });
    setModalOpen(true);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-end justify-between">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase leading-none">Website Experience</span>
          <h2 className="text-4xl font-serif text-foreground tracking-tight">Footer Settings</h2>
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
          <div className="col-span-full py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic">No footer designs found.</div>
        ) : (
          sections.map((section) => (
            <div key={section.id} className={cn(
              "group relative bg-card border transition-all duration-500 overflow-hidden",
              section.isActive ? "border-primary shadow-lg shadow-primary/5" : "border-border hover:border-primary/50"
            )}>
              <div className="p-6 space-y-6">
                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-primary">{section.companySubtitle}</div>
                  <h3 className="text-xl font-serif text-foreground truncate">{section.companyName}</h3>
                </div>
                
                <p className="text-xs text-muted-foreground line-clamp-2 italic">
                  "{section.companyDescription}"
                </p>

                <div className="space-y-2 pt-4 border-t border-border">
                   <div className="flex items-center gap-3 text-muted-foreground">
                      <Mail size={12} />
                      <span className="text-[10px]">{section.contactEmail}</span>
                   </div>
                   <div className="flex items-center gap-3 text-muted-foreground">
                      <Phone size={12} />
                      <span className="text-[10px]">{section.contactPhone}</span>
                   </div>
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
                   <div className="flex gap-2">
                      <button onClick={() => openEditModal(section)} className="p-2 bg-muted text-foreground hover:bg-primary hover:text-white transition-colors"><Edit2 size={14}/></button>
                      <button onClick={() => deleteItem(section.id).then(refresh)} className="p-2 bg-muted text-destructive hover:bg-destructive hover:text-white transition-colors"><Trash2 size={14}/></button>
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
        title={editingSection ? 'Refine Footer Composition' : 'Initialize Footer Section'}
      >
        <form onSubmit={handleSubmit} className="space-y-8 py-4 max-h-[70vh] overflow-y-auto px-1 custom-scrollbar">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Company Name</label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full h-10 border-b border-input bg-transparent text-sm focus:border-primary focus:outline-none transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Company Subtitle</label>
                <input
                  type="text"
                  value={formData.companySubtitle}
                  onChange={(e) => setFormData({ ...formData, companySubtitle: e.target.value })}
                  className="w-full h-10 border-b border-input bg-transparent text-sm focus:border-primary focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Narrative Description</label>
              <textarea
                value={formData.companyDescription}
                onChange={(e) => setFormData({ ...formData, companyDescription: e.target.value })}
                className="w-full h-24 border border-input bg-transparent p-4 text-sm focus:border-primary focus:outline-none transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border">
               <div className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary">Social Links</h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Instagram size={16} className="text-muted-foreground" />
                      <input type="text" placeholder="Instagram URL" value={formData.instagramUrl} onChange={(e) => setFormData({...formData, instagramUrl: e.target.value})} className="flex-1 border-b border-border bg-transparent p-1 text-xs outline-none focus:border-primary" />
                    </div>
                    <div className="flex items-center gap-3">
                      <Facebook size={16} className="text-muted-foreground" />
                      <input type="text" placeholder="Facebook URL" value={formData.facebookUrl} onChange={(e) => setFormData({...formData, facebookUrl: e.target.value})} className="flex-1 border-b border-border bg-transparent p-1 text-xs outline-none focus:border-primary" />
                    </div>
                  </div>
               </div>
               <div className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary">Contact Details</h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <MapPin size={16} className="text-muted-foreground" />
                      <input type="text" placeholder="Physical Address" value={formData.contactAddress} onChange={(e) => setFormData({...formData, contactAddress: e.target.value})} className="flex-1 border-b border-border bg-transparent p-1 text-xs outline-none focus:border-primary" />
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone size={16} className="text-muted-foreground" />
                      <input type="text" placeholder="Phone Number" value={formData.contactPhone} onChange={(e) => setFormData({...formData, contactPhone: e.target.value})} className="flex-1 border-b border-border bg-transparent p-1 text-xs outline-none focus:border-primary" />
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail size={16} className="text-muted-foreground" />
                      <input type="email" placeholder="Email Address" value={formData.contactEmail} onChange={(e) => setFormData({...formData, contactEmail: e.target.value})} className="flex-1 border-b border-border bg-transparent p-1 text-xs outline-none focus:border-primary" />
                    </div>
                  </div>
               </div>
            </div>

            <div className="space-y-2 pt-6 border-t border-border">
              <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Copyright Notice</label>
              <input
                type="text"
                value={formData.copyrightText}
                onChange={(e) => setFormData({ ...formData, copyrightText: e.target.value })}
                className="w-full h-10 border-b border-input bg-transparent text-sm focus:border-primary focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-border">
            <button type="button" onClick={() => setModalOpen(false)} className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground">Cancel</button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-foreground text-primary-foreground px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all disabled:opacity-50"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : editingSection ? 'Commit Changes' : 'Initialize Design'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
