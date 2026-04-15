import { useState } from 'react';
import { useFetch, useDelete } from '../../../hooks/useCrud';
import { apiService } from '../../../services/api.service';
import { API_ROUTES } from '../../../config/constants';
import { FooterSection, CreateFooterInput } from '../schema';

export const useFooter = () => {
  const { data: sections, loading, refresh } = useFetch<FooterSection>(API_ROUTES.FOOTER_SECTION.BASE);
  const { deleteItem } = useDelete(API_ROUTES.FOOTER_SECTION.BASE);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingSection, setEditingSection] = useState<FooterSection | null>(null);
  
  const initialFormData: CreateFooterInput = {
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
  };

  const [formData, setFormData] = useState<CreateFooterInput>(initialFormData);

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
    setFormData(initialFormData);
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

  return {
    sections,
    loading,
    refresh,
    deleteSection: deleteItem,
    modalOpen,
    setModalOpen,
    submitting,
    editingSection,
    formData,
    setFormData,
    handleSubmit,
    handleToggleActive,
    openAddModal,
    openEditModal
  };
};
