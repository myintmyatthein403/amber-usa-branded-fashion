import { useState, useMemo } from 'react';
import { useFetch, useDelete } from '../../hooks/useCrud';
import { API_ROUTES } from '../../config/constants';
import { apiService } from '../../services/api.service';
import { Review, ReviewProduct } from './schema';

export const useReviews = () => {
  const { data: reviews, loading, refresh } = useFetch<Review>(API_ROUTES.REVIEWS.BASE);
  const { data: products } = useFetch<ReviewProduct>(API_ROUTES.PRODUCTS.BASE);
  const { deleteItem } = useDelete(API_ROUTES.REVIEWS.BASE);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlatform, setFilterPlatform] = useState<string>('ALL');

  const initialFormData = {
    userName: '',
    userProfileUrl: '',
    rating: 5,
    comment: '',
    platform: 'WEBSITE' as Review['platform'],
    productId: '',
    isApproved: true
  };

  const [formData, setFormData] = useState(initialFormData);

  const filteredReviews = useMemo(() => {
    if (!reviews) return [];
    return reviews.filter(review => {
      const matchesSearch = 
        review.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (review.comment?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
      
      const matchesPlatform = filterPlatform === 'ALL' || review.platform === filterPlatform;
      
      return matchesSearch && matchesPlatform;
    });
  }, [reviews, searchTerm, filterPlatform]);

  const handleToggleApproval = async (id: string) => {
    try {
      await apiService(API_ROUTES.REVIEWS.TOGGLE_APPROVAL(id), { method: 'PATCH' });
      refresh();
    } catch (error) {
      console.error('Failed to toggle approval:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiService(API_ROUTES.REVIEWS.BASE, {
        method: 'POST',
        body: {
          ...formData,
          rating: Number(formData.rating),
        },
      });
      setModalOpen(false);
      resetForm();
      refresh();
    } catch (error) {
      console.error('Failed to create review:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
  };

  const handleDelete = async (id: string) => {
    const success = await deleteItem(id, 'Delete this review permanently?');
    if (success) refresh();
  };

  return {
    reviews,
    products,
    loading,
    modalOpen,
    setModalOpen,
    submitting,
    searchTerm,
    setSearchTerm,
    filterPlatform,
    setFilterPlatform,
    formData,
    setFormData,
    filteredReviews,
    handleToggleApproval,
    handleSubmit,
    handleDelete,
    resetForm,
    refresh
  };
};
