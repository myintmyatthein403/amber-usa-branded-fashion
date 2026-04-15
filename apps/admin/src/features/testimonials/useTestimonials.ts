import { useState } from 'react';
import { useFetch, useDelete } from '../../hooks/useCrud';
import { API_ROUTES } from '../../config/constants';
import { apiService } from '../../services/api.service';
import { Testimonial } from './schema';

export const useTestimonials = () => {
  const { data: testimonials, loading, refresh } = useFetch<Testimonial>(API_ROUTES.TESTIMONIALS.BASE);
  const { deleteItem } = useDelete(API_ROUTES.TESTIMONIALS.BASE);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  
  const initialFormData = {
    text: '',
    author: '',
    location: '',
    role: '',
    rating: 5,
    isActive: true
  };

  const [formData, setFormData] = useState(initialFormData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const endpoint = editingTestimonial 
        ? API_ROUTES.TESTIMONIALS.BY_ID(editingTestimonial.id)
        : API_ROUTES.TESTIMONIALS.BASE;
      
      const method = editingTestimonial ? 'PATCH' : 'POST';

      await apiService(endpoint, {
        method,
        body: formData,
      });

      setModalOpen(false);
      refresh();
      resetForm();
    } catch (error) {
      console.error('Failed to save testimonial:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (testimonial: Testimonial) => {
    try {
      await apiService(API_ROUTES.TESTIMONIALS.BY_ID(testimonial.id), {
        method: 'PATCH',
        body: { isActive: !testimonial.isActive },
      });
      refresh();
    } catch (error) {
      console.error('Failed to toggle active status:', error);
    }
  };

  const resetForm = () => {
    setEditingTestimonial(null);
    setFormData(initialFormData);
  };

  const openAddModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({ 
      text: testimonial.text,
      author: testimonial.author,
      location: testimonial.location || '',
      role: testimonial.role || '',
      rating: testimonial.rating,
      isActive: testimonial.isActive
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const success = await deleteItem(id, 'Delete this testimonial permanently?');
    if (success) refresh();
  };

  return {
    testimonials,
    loading,
    modalOpen,
    setModalOpen,
    submitting,
    editingTestimonial,
    formData,
    setFormData,
    handleSubmit,
    handleToggleActive,
    handleDelete,
    openAddModal,
    openEditModal,
    refresh
  };
};
