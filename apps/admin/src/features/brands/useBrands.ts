import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../services/api.service';
import { API_ROUTES } from '../../config/constants';
import { useAdminUIStore } from '../../store/useAdminUIStore';
import { Brand } from './schema';

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

type ViewMode = 'grid' | 'list';

const PRODUCT_FILTERS_KEY = 'admin-product-filters';

export const useBrands = () => {
  const [brands, setBrands] = useState<Brand[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [mediaSelectorOpen, setMediaSelectorOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [formData, setFormData] = useState({ name: '', logo: '', note: '' });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingBrand, setDeletingBrand] = useState<Brand | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('brandViewMode');
    return (saved as ViewMode) || 'list';
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      if (debouncedSearch) params.append('search', debouncedSearch);

      const response = (await apiService(
        `${API_ROUTES.BRANDS.BASE}?${params.toString()}`,
        { method: 'GET' },
      )) as { data: Brand[]; meta: PaginationMeta };

      setBrands(response.data);
      setPagination(response.meta);
    } catch (error) {
      console.error('Failed to fetch brands:', error);
      setBrands([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, debouncedSearch]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleLimitChange = (limit: number) => {
    setPagination((prev) => ({ ...prev, page: 1, limit }));
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('brandViewMode', mode);
  };

  const handleMediaSelect = (url: string) => {
    setFormData((prev) => ({ ...prev, logo: url }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      const endpoint = editingBrand
        ? API_ROUTES.BRANDS.BY_ID(editingBrand.id)
        : API_ROUTES.BRANDS.BASE;

      const method = editingBrand ? 'PATCH' : 'POST';

      await apiService(endpoint, {
        method,
        body: formData,
      });

      setModalOpen(false);
      setEditingBrand(null);
      setFormData({ name: '', logo: '', note: '' });
      fetchBrands();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to save brand. The name may already be in use.';
      setSubmitError(message);
      console.error('Failed to save brand:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (brand: Brand) => {
    setDeletingBrand(brand);
    setDeleteError(null);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingBrand) return;
    setDeleteError(null);
    try {
      await apiService(API_ROUTES.BRANDS.BY_ID(deletingBrand.id), {
        method: 'DELETE',
      });
      setDeleteConfirmOpen(false);
      setDeletingBrand(null);
      fetchBrands();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to delete brand.';
      setDeleteError(message);
      console.error('Failed to delete brand:', error);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setDeletingBrand(null);
    setDeleteError(null);
  };

  const openAddModal = () => {
    setEditingBrand(null);
    setFormData({ name: '', logo: '', note: '' });
    setSubmitError(null);
    setModalOpen(true);
  };

  const openEditModal = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      logo: brand.logo || '',
      note: brand.note || '',
    });
    setSubmitError(null);
    setModalOpen(true);
  };

  const viewBrandProducts = (brandId: string) => {
    localStorage.setItem(
      PRODUCT_FILTERS_KEY,
      JSON.stringify({ brandId }),
    );
    useAdminUIStore.getState().setActiveTab('products');
  };

  const hasActiveSearch = debouncedSearch.length > 0;
  const isEmpty = !loading && (!brands || brands.length === 0);

  return {
    brands,
    loading,
    pagination,
    search,
    setSearch,
    hasActiveSearch,
    isEmpty,
    modalOpen,
    setModalOpen,
    mediaSelectorOpen,
    setMediaSelectorOpen,
    submitting,
    submitError,
    editingBrand,
    formData,
    setFormData,
    handleMediaSelect,
    handleSubmit,
    handleDelete,
    openAddModal,
    openEditModal,
    deleteConfirmOpen,
    confirmDelete,
    cancelDelete,
    deletingBrand,
    deleteError,
    viewBrandProducts,
    viewMode,
    setViewMode: handleViewModeChange,
    handlePageChange,
    handleLimitChange,
    refresh: fetchBrands,
  };
};
