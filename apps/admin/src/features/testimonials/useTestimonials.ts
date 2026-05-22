import { useState, useEffect } from 'react';
import { apiService } from '../../services/api.service';
import { API_ROUTES } from '../../config/constants';
import { Testimonial } from './schema';
import { toast } from '../../store/useToastStore';
import { useDelete } from '../../hooks/useCrud';

export const useTestimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  
  const { deleteItem } = useDelete(API_ROUTES.TESTIMONIALS.BASE);

  const fetchTestimonials = async (currentPage = page, currentSearch = search, currentLimit = limit) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: currentLimit.toString(),
      });
      
      if (currentSearch) {
        params.append('search', currentSearch);
      }
      
      const response = await apiService<unknown, { data: Testimonial[]; meta?: any; pagination?: any }>(`${API_ROUTES.TESTIMONIALS.BASE}?${params.toString()}`);
      
      // Based on user provided format, response.data is the array
      const items = Array.isArray(response.data) ? response.data : [];
      const meta = response.meta || response.pagination;
      
      setTestimonials(items);
      setTotal(meta?.total || items.length);
      setTotalPages(meta?.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch testimonials:', error);
      toast.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const refresh = () => {
    fetchTestimonials(page, search, limit);
  };
  
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  
  const initialFormData = {
    text: '',
    author: '',
    location: '',
    role: '',
    rating: 5,
    isActive: true
  };

  const [formData, setFormData] = useState(initialFormData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const endpoint = editingTestimonial 
        ? API_ROUTES.TESTIMONIALS.BY_ID(editingTestimonial.id)
        : API_ROUTES.TESTIMONIALS.BASE;
      
      const method = editingTestimonial ? 'PATCH' : 'POST';

      await apiService(endpoint, {
        method,
        body: formData,
      });

      setModalOpen(false);
      refresh();
      resetForm();
      toast.success(editingTestimonial ? 'Testimonial updated' : 'Testimonial created');
    } catch (error) {
      console.error('Failed to save testimonial:', error);
      toast.error('Failed to save testimonial');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (testimonial: Testimonial) => {
    try {
      await apiService(API_ROUTES.TESTIMONIALS.BY_ID(testimonial.id), {
        method: 'PATCH',
        body: { isActive: !testimonial.isActive },
      });
      refresh();
      toast.success(`Testimonial ${!testimonial.isActive ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('Failed to toggle active status:', error);
      toast.error('Failed to update status');
    }
  };

  const resetForm = () => {
    setEditingTestimonial(null);
    setFormData(initialFormData);
  };

  const openAddModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({ 
      text: testimonial.text,
      author: testimonial.author,
      location: testimonial.location || '',
      role: testimonial.role || '',
      rating: testimonial.rating,
      isActive: testimonial.isActive
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this testimonial permanently?')) return;
    try {
      const success = await deleteItem(id);
      if (success) {
        refresh();
        toast.success('Testimonial deleted');
      }
    } catch (error) {
      toast.error('Failed to delete testimonial');
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
    fetchTestimonials(1, value, limit);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchTestimonials(newPage, search, limit);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
    fetchTestimonials(1, search, newLimit);
  };

  return {
    testimonials,
    loading,
    modalOpen,
    setModalOpen,
    submitting,
    editingTestimonial,
    formData,
    setFormData,
    handleSubmit,
    handleToggleActive,
    handleDelete,
    openAddModal,
    openEditModal,
    refresh,
    viewMode,
    setViewMode,
    page,
    totalPages,
    total,
    limit,
    search,
    handleSearch,
    handlePageChange,
    handleLimitChange
  };
};
