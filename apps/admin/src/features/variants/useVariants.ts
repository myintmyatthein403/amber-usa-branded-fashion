import { useState, useEffect } from 'react';
import { apiService } from '../../services/api.service';
import { API_ROUTES } from '../../config/constants';
import { Variant, VariantProduct } from './schema';

export const useVariants = () => {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [products, setProducts] = useState<VariantProduct[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
  
  const initialFormData = {
    productId: '',
    size: '',
    color: '',
    stock: '0',
    warehouseId: ''
  };

  const [formData, setFormData] = useState(initialFormData);

  const fetchVariants = async () => {
    try {
      const data = await apiService(API_ROUTES.VARIANTS.BASE);
      setVariants(data);
    } catch (error) {
      console.error('Failed to fetch variants:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await apiService(API_ROUTES.PRODUCTS.BASE);
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const data = await apiService(API_ROUTES.LOGISTICS.WAREHOUSES);
      setWarehouses(data);
    } catch (error) {
      console.error('Failed to fetch warehouses:', error);
    }
  };

  useEffect(() => {
    fetchVariants();
    fetchProducts();
    fetchWarehouses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editingVariant 
        ? API_ROUTES.VARIANTS.BY_ID(editingVariant.id)
        : API_ROUTES.VARIANTS.BASE;

      const method = editingVariant ? 'PATCH' : 'POST';

      await apiService(url, {
        method,
        body: {
          ...formData,
          stock: parseInt(formData.stock)
        },
      });

      setModalOpen(false);
      setEditingVariant(null);
      resetForm();
      fetchVariants();
    } catch (error) {
      console.error('Failed to save variant:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingVariant(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this variant?')) return;
    try {
      await apiService(API_ROUTES.VARIANTS.BY_ID(id), { 
        method: 'DELETE'
      });
      fetchVariants();
    } catch (error) {
      console.error('Failed to delete variant:', error);
    }
  };

  const openAddModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (variant: Variant) => {
    setEditingVariant(variant);
    setFormData({ 
      productId: variant.productId.toString(),
      size: variant.size,
      color: variant.color,
      stock: variant.stock.toString(),
      warehouseId: ''
    });
    setModalOpen(true);
  };

  return {
    variants,
    products,
    warehouses,
    loading,
    modalOpen,
    setModalOpen,
    submitting,
    editingVariant,
    formData,
    setFormData,
    handleSubmit,
    handleDelete,
    openAddModal,
    openEditModal,
    refresh: fetchVariants
  };
};
