import React, { useState } from 'react';
import { Tag, Plus, Trash2, Edit2, Loader2, Image as ImageIcon, FileText, Globe } from 'lucide-react';
import { Modal } from '../components/admin/Modal';
import { MediaSelector } from '../components/admin/MediaSelector';
import { useFetch, useDelete } from '../hooks/useCrud';
import { apiService } from '../services/api.service';
import { API_ROUTES } from '../config/constants';

interface Brand {
  id: string;
  name: string;
  logo?: string;
  note?: string;
}

export const BrandsPage: React.FC = () => {
  const { data: brands, loading, refresh } = useFetch<Brand>(API_ROUTES.BRANDS.BASE);
  const { deleteItem } = useDelete(API_ROUTES.BRANDS.BASE);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [mediaSelectorOpen, setMediaSelectorOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [formData, setFormData] = useState({ name: '', logo: '', note: '' });

  const handleMediaSelect = (url: string) => {
    setFormData(prev => ({ ...prev, logo: url }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const endpoint = editingBrand 
        ? API_ROUTES.BRANDS.BY_ID(editingBrand.id)
        : API_ROUTES.BRANDS.BASE;
      
      const method = editingBrand ? 'PATCH' : 'POST';

      await apiService(endpoint, {
        method,
        body: formData,
      });

      setModalOpen(false);
      setEditingBrand(null);
      setFormData({ name: '', logo: '', note: '' });
      refresh();
    } catch (error) {
      console.error('Failed to save brand:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteItem(id, 'Are you sure? This will affect all products associated with this brand.');
    if (success) refresh();
  };

  const openAddModal = () => {
    setEditingBrand(null);
    setFormData({ name: '', logo: '', note: '' });
    setModalOpen(true);
  };

  const openEditModal = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({ 
      name: brand.name, 
      logo: brand.logo || '', 
      note: brand.note || '' 
    });
    setModalOpen(true);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-end justify-between">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase leading-none">House of Brands</span>
          <h2 className="text-4xl font-serif text-foreground tracking-tight">Brand Directory</h2>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-3 bg-foreground text-primary-foreground px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all duration-300 shadow-xl shadow-black/5"
        >
          <Plus size={18} /> New Brand
        </button>
      </div>

      <div className="border border-border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">Identity</th>
              <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">Internal Notes</th>
              <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase text-right">Options</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={3} className="px-10 py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic animate-pulse">Querying Brand Repository...</td></tr>
            ) : !brands || brands.length === 0 ? (
              <tr><td colSpan={3} className="px-10 py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic">No brands found.</td></tr>
            ) : (
              brands.map((brand) => (
                <tr key={brand.id} className="group hover:bg-muted/50 transition-colors duration-300">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-secondary border border-border flex items-center justify-center overflow-hidden">
                        {brand.logo ? (
                          <img src={brand.logo} className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500" />
                        ) : (
                          <Tag size={16} className="text-primary/30" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="text-lg font-serif text-foreground tracking-wide">{brand.name}</div>
                        <div className="text-[9px] font-mono text-muted-foreground/40 uppercase tracking-widest">{brand.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <p className="text-xs text-muted-foreground max-w-md line-clamp-2 italic">
                      {brand.note || "No internal notes recorded."}
                    </p>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button 
                        onClick={() => openEditModal(brand)}
                        className="p-2.5 text-muted-foreground hover:text-foreground transition-colors duration-300"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(brand.id)}
                        className="p-2.5 text-muted-foreground hover:text-destructive transition-colors duration-300"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editingBrand ? 'Modify Brand Identity' : 'Initialize Brand Profile'}
      >
        <form onSubmit={handleSubmit} className="space-y-8 py-4">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Brand Nomenclature</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-xl font-serif placeholder:text-muted-foreground/20 focus:border-primary focus:outline-none transition-colors duration-300 rounded-none"
                placeholder="e.g. Amber Myanmar"
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground flex items-center gap-2">
                <ImageIcon size={14}/> Brand Insignia (Logo)
              </label>
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 border border-border bg-secondary flex items-center justify-center overflow-hidden">
                  {formData.logo ? (
                    <img src={formData.logo} className="w-full h-full object-contain" />
                  ) : (
                    <ImageIcon size={24} className="text-muted-foreground/20" />
                  )}
                </div>
                <div className="flex-1 space-y-3">
                   <div className="flex gap-2">
                     <button 
                       type="button"
                       onClick={() => setMediaSelectorOpen(true)}
                       className="h-10 flex-1 border border-border flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:bg-muted/50 transition-colors"
                     >
                        <Plus size={14} className="mr-2" />
                        Select Media
                     </button>
                     <div className="flex-[2]">
                       <input
                         type="text"
                         value={formData.logo}
                         onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                         className="w-full h-10 border border-border bg-transparent px-4 text-[10px] font-mono focus:border-primary focus:outline-none transition-colors"
                         placeholder="Or paste image URL here..."
                       />
                     </div>
                   </div>
                   <p className="text-[9px] text-muted-foreground uppercase tracking-widest leading-relaxed">Recommended: SVGs or Transparent PNGs with high contrast for dark/light themes.</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground flex items-center gap-2">
                <FileText size={14}/> Operational Notes
              </label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                className="w-full h-32 border border-input bg-transparent p-4 text-sm focus:border-primary focus:outline-none transition-colors duration-300 rounded-none resize-none"
                placeholder="Strategic notes, brand guidelines summary, or vendor contact info..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-border">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground px-4 transition-colors duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-3 bg-foreground text-primary-foreground px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-colors duration-300 disabled:opacity-50"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {editingBrand ? 'Commit Identity' : 'Initialize Brand'}
            </button>
          </div>
        </form>
      </Modal>

      <MediaSelector 
        isOpen={mediaSelectorOpen} 
        onClose={() => setMediaSelectorOpen(false)} 
        onSelect={handleMediaSelect}
        selectedUrls={formData.logo ? [formData.logo] : []}
      />
    </div>
  );
};
