import { useState, useEffect } from 'react';
import { apiService } from '../../services/api.service';
import { API_ROUTES } from '../../config/constants';
import { Variant, VariantProduct } from './schema';
import { toast } from '../../store/useToastStore';

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
    sku: '',
    images: [] as string[],
    isPreOrder: false,
    size: '',
    color: '',
    stock: 0,
    lowStockThreshold: 5,
    warehouseId: ''
  };

  const [formData, setFormData] = useState(initialFormData);

  const fetchVariants = async () => {
    try {
      const response = await apiService<unknown, { data: any[] }>(API_ROUTES.VARIANTS.BASE);
      setVariants(response?.data || []);
    } catch (error) {
      console.error('Failed to fetch variants:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await apiService<unknown, { data: any[] }>(API_ROUTES.PRODUCTS.BASE);
      setProducts(response?.data || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const response = await apiService<unknown, { data: any[] }>(API_ROUTES.LOGISTICS.WAREHOUSES);
      setWarehouses(response?.data || []);
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
      const url = editingVariant?.id 
        ? API_ROUTES.VARIANTS.BY_ID(editingVariant.id)
        : API_ROUTES.VARIANTS.BASE;

      const method = editingVariant ? 'PATCH' : 'POST';

      await apiService(url, {
        method,
        body: formData,
      });

      setModalOpen(false);
      setEditingVariant(null);
      resetForm();
      fetchVariants();
      toast.success(editingVariant ? 'Variant parameters refined' : 'Variant initialized in cluster');
    } catch (error) {
      console.error('Failed to save variant:', error);
      toast.error('Failed to save variant');
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
      toast.success('Variant removed from registry');
    } catch (error) {
      console.error('Failed to delete variant:', error);
      toast.error('Failed to delete variant');
    }
  };

  const openAddModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (variant: any) => {
    setEditingVariant(variant);
    setFormData({ 
      productId: String(variant.productId || ''),
      sku: variant.sku || '',
      images: variant.images || [],
      isPreOrder: variant.isPreOrder || false,
      size: variant.size || '',
      color: variant.color || '',
      stock: variant.stock || 0,
      lowStockThreshold: variant.lowStockThreshold || 5,
      warehouseId: variant.warehouseId || ''
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
