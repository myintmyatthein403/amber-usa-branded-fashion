import React, { useState } from 'react';
import { Layers, Plus, Trash2, Edit2, Loader2, Image as ImageIcon, FileText, Globe, CheckCircle2, XCircle } from 'lucide-react';
import { Modal } from '../components/admin/Modal';
import { useFetch, useDelete } from '../hooks/useCrud';
import { apiService } from '../services/api.service';
import { API_ROUTES } from '../config/constants';

interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
}

export const CollectionsPage: React.FC = () => {
  const { data: collections, loading, refresh } = useFetch<Collection>(API_ROUTES.COLLECTIONS.BASE);
  const { deleteItem } = useDelete(API_ROUTES.COLLECTIONS.BASE);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    slug: '', 
    description: '', 
    image: '', 
    isActive: true 
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
        setFormData({ ...formData, image: url });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const endpoint = editingCollection 
        ? API_ROUTES.COLLECTIONS.BY_ID(editingCollection.id)
        : API_ROUTES.COLLECTIONS.BASE;
      
      const method = editingCollection ? 'PATCH' : 'POST';

      await apiService(endpoint, {
        method,
        body: formData,
      });

      setModalOpen(false);
      setEditingCollection(null);
      setFormData({ name: '', slug: '', description: '', image: '', isActive: true });
      refresh();
    } catch (error) {
      console.error('Failed to save collection:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteItem(id, 'Are you sure? This will remove the collection but not the products within it.');
    if (success) refresh();
  };

  const openAddModal = () => {
    setEditingCollection(null);
    setFormData({ name: '', slug: '', description: '', image: '', isActive: true });
    setModalOpen(true);
  };

  const openEditModal = (collection: Collection) => {
    setEditingCollection(collection);
    setFormData({ 
      name: collection.name, 
      slug: collection.slug,
      description: collection.description || '',
      image: collection.image || '', 
      isActive: collection.isActive 
    });
    setModalOpen(true);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-end justify-between">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase leading-none">Curation</span>
          <h2 className="text-4xl font-serif text-foreground tracking-tight">Collections</h2>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-3 bg-foreground text-primary-foreground px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all duration-300 shadow-xl shadow-black/5"
        >
          <Plus size={18} /> New Collection
        </button>
      </div>

      <div className="border border-border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">Identity</th>
              <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">Description</th>
              <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase text-center">Status</th>
              <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase text-right">Options</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={4} className="px-10 py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic animate-pulse">Querying Collection Repository...</td></tr>
            ) : !collections || collections.length === 0 ? (
              <tr><td colSpan={4} className="px-10 py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic">No collections found.</td></tr>
            ) : (
              collections.map((collection) => (
                <tr key={collection.id} className="group hover:bg-muted/50 transition-colors duration-300">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-secondary border border-border flex items-center justify-center overflow-hidden">
                        {collection.image ? (
                          <img src={collection.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                        ) : (
                          <Layers size={16} className="text-primary/30" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="text-lg font-serif text-foreground tracking-wide">{collection.name}</div>
                        <div className="text-[9px] font-mono text-muted-foreground/40 uppercase tracking-widest flex items-center gap-2">
                          <Globe size={8} /> {collection.slug}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <p className="text-xs text-muted-foreground max-w-md line-clamp-2 italic">
                      {collection.description || "No description recorded."}
                    </p>
                  </td>
                  <td className="px-10 py-6 text-center">
                    <div className="flex justify-center">
                      {collection.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wider">
                          <CheckCircle2 size={12} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                          <XCircle size={12} /> Inactive
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button 
                        onClick={() => openEditModal(collection)}
                        className="p-2.5 text-muted-foreground hover:text-foreground transition-colors duration-300"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(collection.id)}
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
        title={editingCollection ? 'Modify Collection' : 'Create Collection'}
      >
        <form onSubmit={handleSubmit} className="space-y-8 py-4">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Collection Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                    setFormData({ ...formData, name, slug });
                  }}
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
                         onChange={handleFileChange}
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
              onClick={() => setModalOpen(false)}
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
      </Modal>
    </div>
  );
};
