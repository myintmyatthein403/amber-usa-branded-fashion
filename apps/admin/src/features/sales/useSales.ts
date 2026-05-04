import { useState, useMemo } from 'react';
import { useFetch, useDelete } from '../../hooks/useCrud';
import { API_ROUTES } from '../../config/constants';
import { apiService } from '../../services/api.service';
import { Sale, SaleProduct } from './schema';

export const useSales = () => {
  const { data: sales, loading, refresh } = useFetch<Sale>(API_ROUTES.SALES.BASE);
  const { data: allProducts } = useFetch<SaleProduct>(API_ROUTES.PRODUCTS.BASE);
  const { deleteItem } = useDelete(API_ROUTES.SALES.BASE);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [productSearch, setProductSearch] = useState('');

  const initialFormData = { 
    name: '', 
    slug: '',
    description: '', 
    discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED_AMOUNT', 
    discountValue: 0,
    startDate: '',
    endDate: '',
    isActive: true,
    productIds: [] as string[]
  };
  
  const [formData, setFormData] = useState(initialFormData);

  const filteredProducts = useMemo(() => {
    if (!allProducts) return [];
    return allProducts.filter(p => 
      p.name.toLowerCase().includes(productSearch.toLowerCase())
    );
  }, [allProducts, productSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const endpoint = editingSale 
        ? API_ROUTES.SALES.BY_ID(editingSale.id)
        : API_ROUTES.SALES.BASE;
      
      const method = editingSale ? 'PATCH' : 'POST';

      const cleanedData = {
        ...formData,
        discountValue: formData.discountValue ? Number(formData.discountValue) : null,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
      };

      await apiService(endpoint, {
        method,
        body: cleanedData,
      });

      setModalOpen(false);
      setEditingSale(null);
      refresh();
      resetForm();
    } catch (error) {
      console.error('Failed to save sale:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingSale(null);
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this sale event?');
    if (!confirmed) return;
    const success = await deleteItem(id);
    if (success) refresh();
  };

  const openAddModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (sale: Sale) => {
    setEditingSale(sale);
    setFormData({ 
      name: sale.name, 
      slug: sale.slug,
      description: sale.description || '',
      discountType: sale.discountType,
      discountValue: sale.discountValue || 0,
      startDate: sale.startDate ? new Date(sale.startDate).toISOString().split('T')[0] : '',
      endDate: sale.endDate ? new Date(sale.endDate).toISOString().split('T')[0] : '',
      isActive: sale.isActive,
      productIds: sale.products?.map(p => p.id) || []
    });
    setModalOpen(true);
  };

  const toggleProductSelection = (productId: string) => {
    setFormData(prev => ({
      ...prev,
      productIds: prev.productIds.includes(productId)
        ? prev.productIds.filter(id => id !== productId)
        : [...prev.productIds, productId]
    }));
  };

  return {
    sales,
    allProducts,
    loading,
    modalOpen,
    setModalOpen,
    submitting,
    editingSale,
    formData,
    setFormData,
    productSearch,
    setProductSearch,
    filteredProducts,
    handleSubmit,
    handleDelete,
    openAddModal,
    openEditModal,
    toggleProductSelection,
    refresh
  };
};
