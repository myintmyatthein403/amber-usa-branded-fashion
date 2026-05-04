import { useState } from 'react';
import { useFetch, useDelete } from '../../hooks/useCrud';
import { apiService } from '../../services/api.service';
import { API_ROUTES } from '../../config/constants';
import { Ad, AdFormData, AdPlacement, AdStatus } from './schema';

export const useAds = () => {
  const { data: ads, loading, refresh } = useFetch<Ad>(API_ROUTES.ADS.BASE);
  const { deleteItem } = useDelete(API_ROUTES.ADS.BASE);

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);

  const [form, setForm] = useState<AdFormData>({
    title: '',
    description: '',
    imageUrl: '',
    linkUrl: '',
    placement: AdPlacement.HOME_HERO,
    status: AdStatus.DRAFT,
    startDate: '',
    endDate: '',
    priority: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const endpoint = editingAd 
        ? API_ROUTES.ADS.BY_ID(editingAd.id) 
        : API_ROUTES.ADS.BASE;
      
      const method = editingAd ? 'PATCH' : 'POST';

      await apiService(endpoint, {
        method,
        body: {
          ...form,
          priority: parseInt(form.priority.toString()),
          startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
          endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
        },
      });

      setModalOpen(false);
      refresh();
    } catch (error) {
      console.error('Failed to save ad:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const openAddModal = () => {
    setEditingAd(null);
    setForm({ 
      title: '', description: '', imageUrl: '', 
      linkUrl: '', placement: AdPlacement.HOME_HERO, 
      status: AdStatus.DRAFT, startDate: '', 
      endDate: '', priority: 0 
    });
    setModalOpen(true);
  };

  const openEditModal = (ad: Ad) => {
    setEditingAd(ad);
    setForm({ 
      title: ad.title, 
      description: ad.description || '', 
      imageUrl: ad.imageUrl,
      linkUrl: ad.linkUrl || '',
      placement: ad.placement,
      status: ad.status,
      startDate: ad.startDate ? new Date(ad.startDate).toISOString().split('T')[0] : '',
      endDate: ad.endDate ? new Date(ad.endDate).toISOString().split('T')[0] : '',
      priority: ad.priority
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this advertisement?');
    if (!confirmed) return;
    const success = await deleteItem(id);
    if (success) refresh();
  };

  return {
    ads,
    loading,
    modalOpen,
    setModalOpen,
    submitting,
    editingAd,
    form,
    setForm,
    handleSubmit,
    openAddModal,
    openEditModal,
    handleDelete
  };
};
