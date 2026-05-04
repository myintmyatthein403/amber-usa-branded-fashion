import { useState, useCallback, useEffect } from 'react';
import { useFetch, useDelete } from '../../../hooks/useCrud';
import { apiService } from '../../../services/api.service';
import { API_ROUTES } from '../../../config/constants';
import { Role, CreateRoleInput } from '../schema';

export const useRoles = () => {
  const { data: rawData, loading, refresh } = useFetch<Role>(API_ROUTES.ROLES.BASE);
  
  // Debug: Inspect what data we're getting
  useEffect(() => {
    console.log("DEBUG: rawData from useFetch<Role>:", rawData);
  }, [rawData]);

  const roles = Array.isArray(rawData) ? rawData : (rawData?.data ? (Array.isArray(rawData.data) ? rawData.data : []) : []);

  const { deleteItem } = useDelete(API_ROUTES.ROLES.BASE);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  
  const initialFormData: CreateRoleInput = {
    name: '',
    description: '',
    permissions: [],
    color: 'text-primary',
    isImmutable: false,
  };

  const [formData, setFormData] = useState<CreateRoleInput>(initialFormData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingRole) {
        await apiService(API_ROUTES.ROLES.BY_ID(editingRole.id), {
          method: 'PATCH',
          body: formData,
        });
      } else {
        await apiService(API_ROUTES.ROLES.BASE, {
          method: 'POST',
          body: formData,
        });
      }

      setModalOpen(false);
      setEditingRole(null);
      refresh();
    } catch (error) {
      console.error('Failed to save role:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = useCallback((role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || '',
      permissions: role.permissions || [],
      color: role.color || 'text-primary',
      isImmutable: role.isImmutable,
    });
    setModalOpen(true);
  }, []);

  const openCreateModal = useCallback(() => {
    setEditingRole(null);
    setFormData(initialFormData);
    setModalOpen(true);
  }, []);

  const togglePermission = useCallback((permId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter(p => p !== permId)
        : [...prev.permissions, permId]
    }));
  }, []);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this role? This will fail if users are still assigned to it.");
    if (!confirmed) return;
    const success = await deleteItem(id);
    if (success) refresh();
  };

  return {
    roles,
    loading,
    refresh,
    modalOpen,
    setModalOpen,
    submitting,
    editingRole,
    formData,
    setFormData,
    handleSubmit,
    openEditModal,
    openCreateModal,
    togglePermission,
    handleDelete,
  };
};
