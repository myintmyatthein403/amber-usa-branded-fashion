import { useState } from 'react';
import { useFetch, useDelete } from '../../hooks/useCrud';
import { apiService } from '../../services/api.service';
import { API_ROUTES } from '../../config/constants';
import { Category } from './schema';

export const useCategories = () => {
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
        ? API_ROUTES.CATEGORIES.BY_ID(editingCategory.id!)
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
    const confirmed = window.confirm('Are you sure? This may affect products in this category.');
    if (!confirmed) return;
    const success = await deleteItem(id);
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

  return {
    categories,
    loading,
    modalOpen,
    setModalOpen,
    submitting,
    editingCategory,
    formData,
    setFormData,
    handleSubmit,
    handleDelete,
    openAddModal,
    openEditModal
  };
};
