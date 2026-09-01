import { useState } from 'react';
import { useFetch, useDelete } from '../../hooks/useCrud';
import { apiService } from '../../services/api.service';
import { API_ROUTES } from '../../config/constants';
import { Coupon } from './schema';

export const useCoupons = () => {
  const { data: coupons, loading, refresh } = useFetch<Coupon>(API_ROUTES.COUPONS.BASE);
  const { deleteItem } = useDelete(API_ROUTES.COUPONS.BASE);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  
  const initialFormData = {
    code: '',
    description: '',
    discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED_AMOUNT' | 'BUY_X_GET_Y' | 'FREE_SHIPPING',
    discountValue: 0,
    minOrderAmount: undefined as number | undefined,
    maxDiscount: undefined as number | undefined,
    expiryDate: '',
    usageLimit: undefined as number | undefined,
    isActive: true,
    scopeType: 'ORDER' as 'ORDER' | 'PRODUCT' | 'CATEGORY',
    scopeProductId: undefined as string | undefined,
    scopeCategoryId: undefined as string | undefined,
    buyQuantity: undefined as number | undefined,
    getQuantity: undefined as number | undefined,
  };
  
  const [formData, setFormData] = useState(initialFormData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const endpoint = editingCoupon 
        ? API_ROUTES.COUPONS.BY_ID(editingCoupon.id)
        : API_ROUTES.COUPONS.BASE;
      
      const method = editingCoupon ? 'PATCH' : 'POST';

      const cleanedData = {
        ...formData,
        discountValue: Number(formData.discountValue),
        minOrderAmount: formData.minOrderAmount ? Number(formData.minOrderAmount) : null,
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
        expiryDate: formData.expiryDate || null,
        scopeProductId: formData.scopeType === 'PRODUCT' ? formData.scopeProductId : null,
        scopeCategoryId: formData.scopeType === 'CATEGORY' ? formData.scopeCategoryId : null,
        buyQuantity: formData.discountType === 'BUY_X_GET_Y' && formData.buyQuantity ? Number(formData.buyQuantity) : null,
        getQuantity: formData.discountType === 'BUY_X_GET_Y' && formData.getQuantity ? Number(formData.getQuantity) : null,
      };

      await apiService(endpoint, {
        method,
        body: cleanedData,
      });

      setModalOpen(false);
      setEditingCoupon(null);
      setFormData(initialFormData);
      refresh();
    } catch (error) {
      console.error('Failed to save coupon:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to deactivate or delete this coupon?');
    if (!confirmed) return;
    const success = await deleteItem(id);
    if (success) refresh();
  };

  const openAddModal = () => {
    setEditingCoupon(null);
    setFormData(initialFormData);
    setModalOpen(true);
  };

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({ 
      code: coupon.code, 
      description: coupon.description || '',
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount || undefined,
      maxDiscount: coupon.maxDiscount || undefined,
      expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : '',
      usageLimit: coupon.usageLimit || undefined,
      isActive: coupon.isActive,
      scopeType: coupon.scopeType || 'ORDER',
      scopeProductId: coupon.scopeProductId || undefined,
      scopeCategoryId: coupon.scopeCategoryId || undefined,
      buyQuantity: coupon.buyQuantity || undefined,
      getQuantity: coupon.getQuantity || undefined,
    });
    setModalOpen(true);
  };

  return {
    coupons,
    loading,
    refresh,
    modalOpen,
    setModalOpen,
    submitting,
    editingCoupon,
    formData,
    setFormData,
    handleSubmit,
    handleDelete,
    openAddModal,
    openEditModal
  };
};
