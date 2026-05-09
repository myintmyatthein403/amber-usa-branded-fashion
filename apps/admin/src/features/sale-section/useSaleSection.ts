import { useState } from 'react';
import { useFetch, useDelete } from '../../hooks/useCrud';
import { API_ROUTES } from '../../config/constants';
import { apiService } from '../../services/api.service';
import { SaleSection } from './schema';

export const useSaleSection = () => {
  const { data: sections, loading, refresh } = useFetch<SaleSection>(API_ROUTES.SALE_SECTION.BASE);
  const { deleteItem } = useDelete(API_ROUTES.SALE_SECTION.BASE);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingSection, setEditingSection] = useState<SaleSection | null>(null);
  
  const initialFormData = {
    badge: 'Limited Time Event',
    title: 'Thingyan',
    titleItalic: 'Mega Sale',
    description: 'Celebrate the Myanmar New Year with authentic USA brands at unprecedented prices.',
    endDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    ctaText: 'Shop the Sale',
    ctaLink: '/shop',
    imageMain: '',
    isActive: false
  };

  const [formData, setFormData] = useState(initialFormData);

  const uploadFile = async (file: File): Promise<string | null> => {
    const data = new FormData();
    data.append('file', file);
    setUploading(true);
    try {
      const response = await apiService<FormData, { url: string }>(API_ROUTES.UPLOAD, {
        method: 'POST',
        body: data,
        isMultipart: true
      });
      if (!response?.url) return null;
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
        setFormData(prev => ({ ...prev, imageMain: url }));
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
      resetForm();
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

  const resetForm = () => {
    setEditingSection(null);
    setFormData(initialFormData);
  };

  const openAddModal = () => {
    resetForm();
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

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Remove this promotional section?');
    if (!confirmed) return;
    const success = await deleteItem(id);
    if (success) refresh();
  };

  return {
    sections,
    loading,
    modalOpen,
    setModalOpen,
    submitting,
    uploading,
    editingSection,
    formData,
    setFormData,
    handleFileChange,
    handleSubmit,
    handleToggleActive,
    handleDelete,
    openAddModal,
    openEditModal,
    refresh
  };
};
