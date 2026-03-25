import React, { useState } from 'react';
import { Tag, Plus, Trash2, Edit2, Loader2 } from 'lucide-react';
import { Modal } from '../components/admin/Modal';
import { useFetch, useDelete } from '../hooks/useCrud';
import { apiService } from '../services/api.service';
import { API_ROUTES } from '../config/constants';

interface Category {
  id: string;
  name: string;
}

export const CategoriesPage: React.FC = () => {
  const { data: categories, loading, refresh } = useFetch<Category>(API_ROUTES.CATEGORIES.BASE);
  const { deleteItem } = useDelete(API_ROUTES.CATEGORIES.BASE);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const endpoint = editingCategory 
        ? API_ROUTES.CATEGORIES.BY_ID(editingCategory.id)
        : API_ROUTES.CATEGORIES.BASE;
      
      const method = editingCategory ? 'PATCH' : 'POST';

      await apiService(endpoint, {
        method,
        body: formData,
      });

      setModalOpen(false);
      setEditingCategory(null);
      setFormData({ name: '' });
      refresh();
    } catch (error) {
      console.error('Failed to save category:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteItem(id, 'Are you sure? This may affect products in this category.');
    if (success) refresh();
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({ name: '' });
    setModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name });
    setModalOpen(true);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-end justify-between">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase leading-none">Taxonomy</span>
          <h2 className="text-4xl font-serif text-foreground tracking-tight">Categories</h2>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-3 bg-foreground text-primary-foreground px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all duration-300 shadow-xl shadow-black/5"
        >
          <Plus size={18} /> New Category
        </button>
      </div>

      <div className="border border-border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">System UUID</th>
              <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">Label</th>
              <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase text-right">Options</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={3} className="px-10 py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic animate-pulse">Syncing Collections...</td></tr>
            ) : !categories || categories.length === 0 ? (
              <tr><td colSpan={3} className="px-10 py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic">No categories defined.</td></tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id} className="group hover:bg-muted/50 transition-colors duration-300">
                  <td className="px-10 py-6 text-[10px] font-mono text-muted-foreground/40 uppercase">
                    {category.id}
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-secondary border border-border flex items-center justify-center">
                        <Tag size={16} className="text-primary" />
                      </div>
                      <span className="text-lg font-serif text-foreground tracking-wide">{category.name}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button 
                        onClick={() => openEditModal(category)}
                        className="p-2.5 text-muted-foreground hover:text-foreground transition-colors duration-300"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(category.id)}
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
        title={editingCategory ? 'Modify Category' : 'New Category Definition'}
      >
        <form onSubmit={handleSubmit} className="space-y-8 py-4">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Category Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-base font-medium placeholder:text-muted-foreground/20 focus:border-primary focus:outline-none transition-colors duration-300 rounded-none"
              placeholder="e.g. Traditional Wear"
            />
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
              {editingCategory ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
