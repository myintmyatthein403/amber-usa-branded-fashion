import { useState, useEffect, useMemo, useCallback } from 'react';
import { useFetch } from '../../hooks/useCrud';
import { API_ROUTES } from '../../config/constants';
import { apiService } from '../../services/api.service';
import { Sale, SaleProduct } from './schema';

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

type ViewMode = 'grid' | 'list';

export const useSales = () => {
  const [salesData, setSalesData] = useState<{ data: Sale[]; meta: PaginationMeta } | null>(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('salesViewMode');
    return (saved as ViewMode) || 'list';
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [productSearch, setProductSearch] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: allProducts } = useFetch<SaleProduct>(API_ROUTES.PRODUCTS.BASE);

  const fetchSales = useCallback(async (page: number = 1, searchQuery: string = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      });
      if (searchQuery) params.append('search', searchQuery);

      const response = await apiService<unknown, { data: Sale[]; meta: PaginationMeta }>(
        `${API_ROUTES.SALES.BASE}?${params}`
      );
      setSalesData(response);
      setPagination(prev => ({ ...prev, ...response.meta, page }));
    } catch (error) {
      console.error('Failed to fetch sales:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);

  useEffect(() => {
    fetchSales(pagination.page, search);
  }, [pagination.page]);

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleSearch = (searchQuery: string) => {
    setSearch(searchQuery);
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchSales(1, searchQuery);
  };

  const toggleViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('salesViewMode', mode);
  };

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
      fetchSales(pagination.page, search);
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

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      await apiService(API_ROUTES.SALES.BY_ID(deletingId), { method: 'DELETE' });
      fetchSales(pagination.page, search);
    } catch (error) {
      console.error('Failed to delete sale:', error);
    } finally {
      setDeleteConfirmOpen(false);
      setDeletingId(null);
    }
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setDeleteConfirmOpen(true);
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setDeletingId(null);
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
    sales: salesData?.data || null,
    loading,
    pagination,
    search,
    setSearch: handleSearch,
    viewMode,
    setViewMode: toggleViewMode,
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
    deleteConfirmOpen,
    confirmDelete,
    cancelDelete,
    handlePageChange,
    refresh: () => fetchSales(pagination.page, search)
  };
};