import { useState } from 'react';
import { useFetch, useDelete } from '../../hooks/useCrud';
import { apiService } from '../../services/api.service';
import { API_ROUTES } from '../../config/constants';
import { DeliveryMethod } from './schema';

export const useDelivery = () => {
  const { data: methods, loading, refresh } = useFetch<DeliveryMethod>(API_ROUTES.DELIVERY_METHODS.BASE);
  const { deleteItem } = useDelete(API_ROUTES.DELIVERY_METHODS.BASE);

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingMethod, setEditingMethod] = useState<DeliveryMethod | null>(null);

  const initialFormState = {
    name: '',
    description: '',
    price: '',
    isUsdPrice: false,
    isDigital: false,
    estimatedDays: '',
    isActive: true,
    freeOverAmount: ''
  };

  const [form, setForm] = useState(initialFormState);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const endpoint = editingMethod 
        ? API_ROUTES.DELIVERY_METHODS.BY_ID(editingMethod.id) 
        : API_ROUTES.DELIVERY_METHODS.BASE;
      
      const method = editingMethod ? 'PATCH' : 'POST';

      await apiService(endpoint, {
        method,
        body: {
          ...form,
          price: parseFloat(form.price),
          freeOverAmount: form.freeOverAmount ? parseFloat(form.freeOverAmount) : null
        },
      });

      setModalOpen(false);
      refresh();
    } catch (error) {
      console.error('Failed to save delivery method:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const openAddModal = () => {
    setEditingMethod(null);
    setForm(initialFormState);
    setModalOpen(true);
  };

  const openEditModal = (method: DeliveryMethod) => {
    setEditingMethod(method);
    setForm({ 
      name: method.name, 
      description: method.description || '', 
      price: method.price.toString(),
      isUsdPrice: method.isUsdPrice,
      isDigital: method.isDigital || false,
      estimatedDays: method.estimatedDays || '',
      isActive: method.isActive,
      freeOverAmount: method.freeOverAmount?.toString() || ''
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this delivery method?');
    if (!confirmed) return;
    const success = await deleteItem(id);
    if (success) refresh();
  };

  return {
    methods,
    loading,
    refresh,
    modalOpen,
    setModalOpen,
    submitting,
    editingMethod,
    form,
    setForm,
    handleSubmit,
    openAddModal,
    openEditModal,
    handleDelete
  };
};
