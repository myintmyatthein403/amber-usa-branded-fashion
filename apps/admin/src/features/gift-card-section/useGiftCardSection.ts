import { useState, useCallback } from 'react';
import { useFetch, useDelete } from '../../hooks/useCrud';
import { apiService } from '../../services/api.service';
import { API_ROUTES } from '../../config/constants';
import { GiftCardSection } from './schema';

export const useGiftCardSection = () => {
  const { data: sections, loading, refresh } = useFetch<GiftCardSection>(API_ROUTES.GIFT_CARD_SECTION.BASE);
  const { deleteItem } = useDelete(API_ROUTES.GIFT_CARD_SECTION.BASE);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingSection, setEditingSection] = useState<GiftCardSection | null>(null);
  
  const initialFormData = {
    badge: 'The Ultimate Gift',
    title: 'Share the Luxury',
    titleSecondary: 'of Authentic Fashion',
    description: 'Not sure what to pick? Our digital gift cards are the perfect way to give them exactly what they want.',
    ctaText: 'Purchase a Gift Card',
    ctaLink: '/gift-cards',
    cardTitle: 'Amber',
    cardAmount: '100,000 MMK',
    cardType: 'Gift Card',
    amounts: ['50,000 MMK', '100,000 MMK', '200,000 MMK', '500,000 MMK'],
    isActive: false
  };

  const [formData, setFormData] = useState(initialFormData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const endpoint = editingSection 
        ? API_ROUTES.GIFT_CARD_SECTION.BY_ID(editingSection.id)
        : API_ROUTES.GIFT_CARD_SECTION.BASE;
      
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

  const handleToggleActive = async (section: GiftCardSection) => {
    try {
      await apiService(API_ROUTES.GIFT_CARD_SECTION.BY_ID(section.id), {
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

  const openEditModal = (section: GiftCardSection) => {
    setEditingSection(section);
    setFormData({ 
      badge: section.badge || '',
      title: section.title,
      titleSecondary: section.titleSecondary || '',
      description: section.description,
      ctaText: section.ctaText || '',
      ctaLink: section.ctaLink || '',
      cardTitle: section.cardTitle,
      cardAmount: section.cardAmount,
      cardType: section.cardType,
      amounts: section.amounts || initialFormData.amounts,
      isActive: section.isActive
    });
    setModalOpen(true);
  };

  const handleAmountChange = useCallback((index: number, value: string) => {
    setFormData(prev => {
      const newAmounts = [...prev.amounts];
      newAmounts[index] = value;
      return { ...prev, amounts: newAmounts };
    });
  }, []);

  const addAmountField = useCallback(() => {
    setFormData(prev => ({ ...prev, amounts: [...prev.amounts, ''] }));
  }, []);

  const removeAmountField = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      amounts: prev.amounts.filter((_, i) => i !== index)
    }));
  }, []);

  const handleDelete = async (id: string) => {
    const success = await deleteItem(id);
    if (success) refresh();
  };

  return {
    sections,
    loading,
    refresh,
    modalOpen,
    setModalOpen,
    submitting,
    editingSection,
    formData,
    setFormData,
    handleSubmit,
    handleToggleActive,
    openAddModal,
    openEditModal,
    handleAmountChange,
    addAmountField,
    removeAmountField,
    handleDelete
  };
};
