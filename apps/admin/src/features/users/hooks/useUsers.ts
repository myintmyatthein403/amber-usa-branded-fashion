import { useState, useCallback, useMemo } from 'react';
import { useFetch, useDelete } from '../../../hooks/useCrud';
import { apiService } from '../../../services/api.service';
import { API_ROUTES } from '../../../config/constants';
import { User, CreateUserInput, RoleData } from '../schema';

export const useUsers = (mode: 'customers' | 'staff') => {
  const { data: users, loading, refresh } = useFetch<User>(API_ROUTES.USERS.BASE);
  const { data: roles } = useFetch<RoleData>(API_ROUTES.ROLES.BASE);
  const { deleteItem } = useDelete(API_ROUTES.USERS.BASE);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const initialFormData: any = {
    name: '',
    email: '',
    username: '',
    password: '',
    roleName: mode === 'staff' ? 'ADMIN' : 'USER',
    points: 0,
    memberLevel: 'Silver',
    status: 'ACTIVE',
  };

  const [formData, setFormData] = useState<any>(initialFormData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingUser) {
        const payload = { ...formData };
        if (!payload.password) delete payload.password;
        
        await apiService(API_ROUTES.USERS.BY_ID(editingUser.id), {
          method: 'PATCH',
          body: payload,
        });
      } else {
        await apiService(API_ROUTES.USERS.BASE, {
          method: 'POST',
          body: formData,
        });
      }

      setModalOpen(false);
      setEditingUser(null);
      refresh();
    } catch (error) {
      console.error('Failed to save user:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete this ${mode === 'customers' ? 'customer' : 'staff member'}? This action cannot be undone.`);
    if (!confirmed) return;
    const success = await deleteItem(id);
    if (success) refresh();
  };

  const openEditModal = useCallback((user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email,
      username: user.username || '',
      password: '',
      roleName: user.role,
      points: user.points,
      memberLevel: user.memberLevel,
      status: user.status,
    });
    setModalOpen(true);
  }, []);

  const openCreateModal = useCallback(() => {
    setEditingUser(null);
    setFormData({
      ...initialFormData,
      roleName: mode === 'staff' ? 'ADMIN' : 'USER',
    });
    setModalOpen(true);
  }, [mode, initialFormData]);

  const filteredUsers = useMemo(() => {
    return (users || []).filter(user => {
      if (mode === 'customers') return user.role === 'USER';
      if (mode === 'staff') return user.role === 'ADMIN' || user.role === 'SUPERADMIN';
      return true;
    });
  }, [users, mode]);

  return {
    users: filteredUsers,
    roles,
    loading,
    refresh,
    modalOpen,
    setModalOpen,
    submitting,
    editingUser,
    formData,
    setFormData,
    handleSubmit,
    handleDelete,
    openEditModal,
    openCreateModal,
  };
};
