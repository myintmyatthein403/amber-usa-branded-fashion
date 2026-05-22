import { useState, useEffect } from 'react';
import { useFetch, useDelete } from '../../hooks/useCrud';
import { API_ROUTES } from '../../config/constants';
import { apiService } from '../../services/api.service';
import { SaleSection, SaleSectionWithUrl } from './schema';

export const useSaleSection = () => {
  const [sections, setSections] = useState<SaleSectionWithUrl[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  
  const { deleteItem } = useDelete(API_ROUTES.SALE_SECTION.BASE);

  const fetchSections = async (currentPage = page, currentSearch = search, currentLimit = limit) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: currentLimit.toString(),
      });
      
      if (currentSearch) {
        params.append('search', currentSearch);
      }
      
      const response = await apiService<unknown, { data: SaleSectionWithUrl[]; meta?: any; pagination?: any }>(`${API_ROUTES.SALE_SECTION.BASE}?${params.toString()}`);
      
      // Handle array in response.data
      const items = Array.isArray(response.data) ? response.data : [];
      const meta = response.meta || response.pagination;

      setSections(items);
      setTotal(meta?.total || items.length);
      setTotalPages(meta?.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch sections:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const refresh = () => {
    fetchSections(page, search, limit);
  };
  
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingSection, setEditingSection] = useState<SaleSectionWithUrl | null>(null);
  
  const initialFormData = {
    badge: '',
    title: '',
    titleItalic: '',
    description: '',
    endDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    ctaText: '',
    ctaLink: '',
    imageMain: '',
    imageUrl: '',
    isActive: false
  };

  const [formData, setFormData] = useState(initialFormData);

  const uploadFile = async (file: File): Promise<string | null> => {
    const data = new FormData();
    data.append('file', file);
    setUploading(true);
    try {
      const response = await apiService<FormData, { url: string }>(API_ROUTES.UPLOAD, {
        method: 'POST',
        body: data,
        isMultipart: true
      });
      if (!response?.url) return null;
      return `${import.meta.env.VITE_API_URL}${response.url}`;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = await uploadFile(e.target.files[0]);
      if (url) {
        setFormData(prev => ({ ...prev, imageMain: url }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const endpoint = editingSection 
        ? API_ROUTES.SALE_SECTION.BY_ID(editingSection.id)
        : API_ROUTES.SALE_SECTION.BASE;
      
      const method = editingSection ? 'PATCH' : 'POST';

      const payload = {
        ...formData,
        endDate: new Date(formData.endDate).toISOString()
      };

      await apiService(endpoint, {
        method,
        body: payload,
      });

      setModalOpen(false);
      refresh();
      resetForm();
    } catch (error) {
      console.error('Failed to save section:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (section: SaleSectionWithUrl) => {
    try {
      await apiService(API_ROUTES.SALE_SECTION.BY_ID(section.id), {
        method: 'PATCH',
        body: { isActive: !section.isActive },
      });
      refresh();
    } catch (error) {
      console.error('Failed to toggle active status:', error);
    }
  };

  const resetForm = () => {
    setEditingSection(null);
    setFormData(initialFormData);
  };

  const openAddModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (section: SaleSectionWithUrl) => {
    setEditingSection(section);
    setFormData({ 
      badge: section.badge || '',
      title: section.title,
      titleItalic: section.titleItalic || '',
      description: section.description,
      endDate: new Date(section.endDate).toISOString().split('T')[0],
      ctaText: section.ctaText || '',
      ctaLink: section.ctaLink || '',
      imageMain: section.imageMain || '',
      imageUrl: section.imageUrl || '',
      isActive: section.isActive
    });
    setModalOpen(true);
  };

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
    fetchSections(1, value, limit);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchSections(newPage, search, limit);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
    fetchSections(1, search, newLimit);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    const success = await deleteItem(deletingId);
    if (success) refresh();
    setDeleteModalOpen(false);
    setDeletingId(null);
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setDeletingId(null);
  };

  return {
    sections,
    loading,
    modalOpen,
    setModalOpen,
    submitting,
    uploading,
    editingSection,
    formData,
    setFormData,
    handleFileChange,
    handleSubmit,
    handleToggleActive,
    handleDelete,
    openAddModal,
    openEditModal,
    refresh,
    // Pagination and search
    page,
    totalPages,
    total,
    limit,
    search,
    handleSearch,
    handlePageChange,
    handleLimitChange,
    // Delete modal
    deleteModalOpen,
    setDeleteModalOpen,
    deletingId,
    confirmDelete,
    cancelDelete
  };
};
