import { useState } from 'react';
import { useFetch, useDelete } from '../../hooks/useCrud';
import { apiService } from '../../services/api.service';
import { API_ROUTES } from '../../config/constants';
import { Brand } from './schema';

export const useBrands = () => {
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

  return {
    brands,
    loading,
    modalOpen,
    setModalOpen,
    mediaSelectorOpen,
    setMediaSelectorOpen,
    submitting,
    editingBrand,
    formData,
    setFormData,
    handleMediaSelect,
    handleSubmit,
    handleDelete,
    openAddModal,
    openEditModal
  };
};
