import { useState, useEffect } from 'react';
import { useFetch } from '../../hooks/useCrud';
import { apiService } from '../../services/api.service';
import { API_ROUTES } from '../../config/constants';
import { DeliveryMethod } from './schema';

type ViewMode = 'grid' | 'list';

export const useDelivery = () => {
  const [search, setSearch] = useState('');
  const [filteredMethods, setFilteredMethods] = useState<DeliveryMethod[] | null>(null);
  const { data: methods, loading, refresh } = useFetch<DeliveryMethod>(API_ROUTES.DELIVERY_METHODS.BASE);

  useEffect(() => {
    if (!methods) {
      setFilteredMethods(null);
      return;
    }
    if (!search) {
      setFilteredMethods(methods);
      return;
    }
    const q = search.toLowerCase();
    setFilteredMethods(methods.filter(m => 
      m.name.toLowerCase().includes(q) || 
      m.description?.toLowerCase().includes(q)
    ));
  }, [methods, search]);

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingMethod, setEditingMethod] = useState<DeliveryMethod | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('deliveryViewMode');
    return (saved as ViewMode) || 'list';
  });

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    isUsdPrice: false,
    isDigital: false,
    estimatedDays: '',
    isActive: true,
    freeOverAmount: '',
    logoUrl: '',
    logoLink: '',
    locationPrices: {} as Record<string, string>
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const endpoint = editingMethod 
        ? API_ROUTES.DELIVERY_METHODS.BY_ID(editingMethod.id) 
        : API_ROUTES.DELIVERY_METHODS.BASE;
      
      const method = editingMethod ? 'PATCH' : 'POST';

      const locationPrices: Record<string, number> = {};
      Object.entries(form.locationPrices).forEach(([k, v]) => {
        if (v) locationPrices[k] = parseFloat(v);
      });

      await apiService(endpoint, {
        method,
        body: {
          ...form,
          price: parseFloat(form.price),
          freeOverAmount: form.freeOverAmount ? parseFloat(form.freeOverAmount) : null,
          logoUrl: form.logoUrl || null,
          logoLink: form.logoLink || null,
          locationPrices: Object.keys(locationPrices).length > 0 ? locationPrices : null
        },
      });

      setModalOpen(false);
      refresh();
    } catch (error) {
      console.error('Failed to save delivery method:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const openAddModal = () => {
    setEditingMethod(null);
    setForm({
      name: '',
      description: '',
      price: '',
      isUsdPrice: false,
      isDigital: false,
      estimatedDays: '',
      isActive: true,
      freeOverAmount: '',
      logoUrl: '',
      logoLink: '',
      locationPrices: {}
    });
    setModalOpen(true);
  };

  const openEditModal = (method: DeliveryMethod) => {
    setEditingMethod(method);
    const locPrices: Record<string, string> = {};
    if (method.locationPrices) {
      Object.entries(method.locationPrices).forEach(([k, v]) => {
        locPrices[k] = v.toString();
      });
    }
    setForm({ 
      name: method.name, 
      description: method.description || '', 
      price: method.price.toString(),
      isUsdPrice: method.isUsdPrice,
      isDigital: method.isDigital || false,
      estimatedDays: method.estimatedDays || '',
      isActive: method.isActive,
      freeOverAmount: method.freeOverAmount?.toString() || '',
      logoUrl: method.logoUrl || '',
      logoLink: method.logoLink || '',
      locationPrices: locPrices
    });
    setModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      await apiService(API_ROUTES.DELIVERY_METHODS.BY_ID(deletingId), { method: 'DELETE' });
      refresh();
    } catch (error) {
      console.error('Failed to delete delivery method:', error);
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

  const toggleViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('deliveryViewMode', mode);
  };

  return {
    methods: filteredMethods,
    loading,
    refresh,
    search,
    setSearch,
    modalOpen,
    setModalOpen,
    submitting,
    editingMethod,
    form,
    setForm,
    handleSubmit,
    openAddModal,
    openEditModal,
    handleDelete,
    deleteConfirmOpen,
    confirmDelete,
    cancelDelete,
    viewMode,
    setViewMode: toggleViewMode
  };
};