import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../services/api.service';
import { API_ROUTES } from '../../config/constants';
import { Brand } from './schema';

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

type ViewMode = 'grid' | 'list';

export const useBrands = () => {
  const [brands, setBrands] = useState<Brand[] | null>(null);
  const [loading, setLoading] = useState(true);
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
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('brandViewMode');
    return (saved as ViewMode) || 'list';
  });

  const fetchBrands = useCallback(async (page: number = 1, limit: number = 10) => {
    setLoading(true);
    try {
      const response = await apiService(
        `${API_ROUTES.BRANDS.BASE}?page=${page}&limit=${limit}`,
        { method: 'GET' }
      ) as { data: Brand[]; meta: PaginationMeta };
      
      setBrands(response.data);
      setPagination(response.meta);
    } catch (error) {
      console.error('Failed to fetch brands:', error);
      setBrands([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBrands(pagination.page, pagination.limit);
  }, [fetchBrands, pagination.page, pagination.limit]);

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleLimitChange = (limit: number) => {
    setPagination(prev => ({ ...prev, page: 1, limit }));
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('brandViewMode', mode);
  };

  const handleMediaSelect = (url: string) => {
    setFormData(prev => ({ ...prev, logo: url }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const endpoint = editingBrand 
        ? API_ROUTES.BRANDS.BY_ID(editingBrand.id!)
        : API_ROUTES.BRANDS.BASE;
      
      const method = editingBrand ? 'PATCH' : 'POST';

      await apiService(endpoint, {
        method,
        body: formData,
      });

      setModalOpen(false);
      setEditingBrand(null);
      setFormData({ name: '', logo: '', note: '' });
      fetchBrands(pagination.page, pagination.limit);
    } catch (error) {
      console.error('Failed to save brand:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      await apiService(API_ROUTES.BRANDS.BY_ID(deletingId), { method: 'DELETE' });
      setDeleteConfirmOpen(false);
      setDeletingId(null);
      fetchBrands(pagination.page, pagination.limit);
    } catch (error) {
      console.error('Failed to delete brand:', error);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setDeletingId(null);
  };

  const openAddModal = () => {
    setEditingBrand(null);
    setFormData({ name: '', logo: '', note: '' });
    setModalOpen(true);
  };

  const openEditModal = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({ 
      name: brand.name, 
      logo: brand.logo || '', 
      note: brand.note || '' 
    });
    setModalOpen(true);
  };

  return {
    brands,
    loading,
    pagination,
    modalOpen,
    setModalOpen,
    mediaSelectorOpen,
    setMediaSelectorOpen,
    submitting,
    editingBrand,
    formData,
    setFormData,
    handleMediaSelect,
    handleSubmit,
    handleDelete,
    openAddModal,
    openEditModal,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    confirmDelete,
    cancelDelete,
    deletingId,
    viewMode,
    setViewMode: handleViewModeChange,
    handlePageChange,
    handleLimitChange,
    refresh: () => fetchBrands(pagination.page, pagination.limit),
  };
};