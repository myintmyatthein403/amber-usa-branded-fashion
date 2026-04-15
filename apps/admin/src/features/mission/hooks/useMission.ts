import { useState } from 'react';
import { useFetch, useDelete } from '../../../hooks/useCrud';
import { apiService } from '../../../services/api.service';
import { API_ROUTES } from '../../../config/constants';
import { MissionSection, CreateMissionInput } from '../schema';

export const useMission = () => {
  const { data: missions, loading, refresh } = useFetch<MissionSection>(API_ROUTES.MISSION.BASE);
  const { deleteItem } = useDelete(API_ROUTES.MISSION.BASE);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingMission, setEditingMission] = useState<MissionSection | null>(null);
  
  const initialFormData: CreateMissionInput = {
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
  };

  const [formData, setFormData] = useState<CreateMissionInput>(initialFormData);

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
    setFormData(initialFormData);
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

  return {
    missions,
    loading,
    refresh,
    deleteMission: deleteItem,
    modalOpen,
    setModalOpen,
    submitting,
    uploading,
    editingMission,
    formData,
    setFormData,
    handleFileChange,
    handleSubmit,
    handleToggleActive,
    openAddModal,
    openEditModal
  };
};
