import { useState, useCallback } from 'react';
import { useFetch, useDelete } from '../../hooks/useCrud';
import { apiService } from '../../services/api.service';
import { API_ROUTES } from '../../config/constants';
import { GiftCard } from './schema';

export const useGiftCards = () => {
  const { data: giftCards, loading, refresh } = useFetch<GiftCard>(API_ROUTES.GIFT_CARDS.BASE);
  const { deleteItem } = useDelete(API_ROUTES.GIFT_CARDS.BASE);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingGiftCard, setEditingGiftCard] = useState<GiftCard | null>(null);
  
  const initialFormData = { 
    code: '', 
    initialBalance: 0,
    currentBalance: 0,
    expiryDate: '',
    isActive: true,
    note: ''
  };
  
  const [formData, setFormData] = useState(initialFormData);

  const generateCode = useCallback(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      if (i < 3) code += '-';
    }
    setFormData(prev => ({ ...prev, code }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const endpoint = editingGiftCard 
        ? API_ROUTES.GIFT_CARDS.BY_ID(editingGiftCard.id)
        : API_ROUTES.GIFT_CARDS.BASE;
      
      const method = editingGiftCard ? 'PATCH' : 'POST';

      const cleanedData = {
        ...formData,
        initialBalance: Number(formData.initialBalance),
        currentBalance: Number(formData.currentBalance),
        expiryDate: formData.expiryDate || null,
        note: formData.note || null
      };

      await apiService(endpoint, {
        method,
        body: cleanedData,
      });

      setModalOpen(false);
      setEditingGiftCard(null);
      setFormData(initialFormData);
      refresh();
    } catch (error) {
      console.error('Failed to save gift card:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteItem(id, 'Are you sure? This will permanently invalidate the gift card.');
    if (success) refresh();
  };

  const openAddModal = () => {
    setEditingGiftCard(null);
    setFormData(initialFormData);
    setModalOpen(true);
  };

  const openEditModal = (giftCard: GiftCard) => {
    setEditingGiftCard(giftCard);
    setFormData({ 
      code: giftCard.code, 
      initialBalance: giftCard.initialBalance,
      currentBalance: giftCard.currentBalance,
      expiryDate: giftCard.expiryDate ? new Date(giftCard.expiryDate).toISOString().split('T')[0] : '',
      isActive: giftCard.isActive,
      note: giftCard.note || ''
    });
    setModalOpen(true);
  };

  return {
    giftCards,
    loading,
    refresh,
    modalOpen,
    setModalOpen,
    submitting,
    editingGiftCard,
    formData,
    setFormData,
    generateCode,
    handleSubmit,
    handleDelete,
    openAddModal,
    openEditModal
  };
};
