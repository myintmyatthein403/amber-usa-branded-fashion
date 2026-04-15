import { useState } from 'react';
import { useFetch, useDelete } from '../../../hooks/useCrud';
import { apiService } from '../../../services/api.service';
import { API_ROUTES } from '../../../config/constants';
import { HeroSection, CreateHeroInput } from '../schema';

export const useHero = () => {
  const { data: heroes, loading, refresh } = useFetch<HeroSection>(API_ROUTES.HERO.BASE);
  const { deleteItem } = useDelete(API_ROUTES.HERO.BASE);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingHero, setEditingHero] = useState<HeroSection | null>(null);
  
  const initialFormData: CreateHeroInput = {
    badge: 'Authentic USA Brands • Myanmar',
    titlePartOne: 'Global',
    titlePartTwo: 'Authenticity',
    titleItalic: true,
    description: 'Bringing your favorite premium USA brands directly to Myanmar.',
    ctaPrimaryText: 'Shop Brands',
    ctaPrimaryLink: '/shop',
    ctaSecondaryText: 'Check Legitimacy',
    ctaSecondaryLink: '/track',
    imageMain: '',
    imageSecondary: '',
    isActive: false
  };

  const [formData, setFormData] = useState<CreateHeroInput>(initialFormData);

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
      // Cloudinary returns absolute URL, so check before prepending
      return response.url.startsWith('http') ? response.url : `${import.meta.env.VITE_API_URL}${response.url}`;
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
        setFormData(prev => ({ ...prev, [field]: url }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const endpoint = editingHero 
        ? API_ROUTES.HERO.BY_ID(editingHero.id)
        : API_ROUTES.HERO.BASE;
      
      const method = editingHero ? 'PATCH' : 'POST';

      await apiService(endpoint, {
        method,
        body: formData,
      });

      setModalOpen(false);
      refresh();
    } catch (error) {
      console.error('Failed to save hero:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (hero: HeroSection) => {
    try {
      await apiService(API_ROUTES.HERO.BY_ID(hero.id), {
        method: 'PATCH',
        body: { isActive: !hero.isActive },
      });
      refresh();
    } catch (error) {
      console.error('Failed to toggle active status:', error);
    }
  };

  const openAddModal = () => {
    setEditingHero(null);
    setFormData(initialFormData);
    setModalOpen(true);
  };

  const openEditModal = (hero: HeroSection) => {
    setEditingHero(hero);
    setFormData({ 
      badge: hero.badge || '',
      titlePartOne: hero.titlePartOne,
      titlePartTwo: hero.titlePartTwo || '',
      titleItalic: hero.titleItalic,
      description: hero.description,
      ctaPrimaryText: hero.ctaPrimaryText,
      ctaPrimaryLink: hero.ctaPrimaryLink,
      ctaSecondaryText: hero.ctaSecondaryText,
      ctaSecondaryLink: hero.ctaSecondaryLink,
      imageMain: hero.imageMain,
      imageSecondary: hero.imageSecondary || '',
      isActive: hero.isActive
    });
    setModalOpen(true);
  };

  return {
    heroes,
    loading,
    refresh,
    deleteHero: deleteItem,
    modalOpen,
    setModalOpen,
    submitting,
    uploading,
    editingHero,
    formData,
    setFormData,
    handleFileChange,
    handleSubmit,
    handleToggleActive,
    openAddModal,
    openEditModal
  };
};
