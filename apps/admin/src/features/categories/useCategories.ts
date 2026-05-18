import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../services/api.service';
import { API_ROUTES } from '../../config/constants';
import { Category } from './schema';

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

type ViewMode = 'grid' | 'list';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '' });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('categoryViewMode');
    return (saved as ViewMode) || 'list';
  });

  const fetchCategories = useCallback(async (page: number = 1, limit: number = 10) => {
    setLoading(true);
    try {
      const response = await apiService(
        `${API_ROUTES.CATEGORIES.BASE}?page=${page}&limit=${limit}`,
        { method: 'GET' }
      ) as { data: Category[]; meta: PaginationMeta };
      
      setCategories(response.data);
      setPagination(response.meta);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories(pagination.page, pagination.limit);
  }, [fetchCategories, pagination.page, pagination.limit]);

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleLimitChange = (limit: number) => {
    setPagination(prev => ({ ...prev, page: 1, limit }));
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('categoryViewMode', mode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const endpoint = editingCategory 
        ? API_ROUTES.CATEGORIES.BY_ID(editingCategory.id!)
        : API_ROUTES.CATEGORIES.BASE;
      
      const method = editingCategory ? 'PATCH' : 'POST';

      await apiService(endpoint, {
        method,
        body: formData,
      });

      setModalOpen(false);
      setEditingCategory(null);
      setFormData({ name: '' });
      fetchCategories(pagination.page, pagination.limit);
    } catch (error) {
      console.error('Failed to save category:', error);
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
      await apiService(API_ROUTES.CATEGORIES.BY_ID(deletingId), { method: 'DELETE' });
      setDeleteConfirmOpen(false);
      setDeletingId(null);
      fetchCategories(pagination.page, pagination.limit);
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setDeletingId(null);
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({ name: '' });
    setModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name });
    setModalOpen(true);
  };

  return {
    categories,
    loading,
    pagination,
    modalOpen,
    setModalOpen,
    submitting,
    editingCategory,
    formData,
    setFormData,
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
    refresh: () => fetchCategories(pagination.page, pagination.limit),
  };
};