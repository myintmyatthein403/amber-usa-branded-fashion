import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../services/api.service';
import { API_ROUTES } from '../../config/constants';
import { CategoryFormData, type CategoryReorderFlatItem } from '@amber/shared';
import { Category } from './schema';
import { toast } from '../../store/useToastStore';

export type CategoryFormState = CategoryFormData & { slug?: string };

const DEFAULT_FORM_DATA: CategoryFormState = {
  name: '',
  slug: '',
  description: '',
  image: '',
  isActive: true,
  isFeatured: false,
  displayOrder: 0,
  parentId: undefined,
  metaTitle: '',
  metaDescription: '',
};

function categoryToFormData(category: Category): CategoryFormState {
  return {
    name: category.name,
    slug: category.slug ?? '',
    description: category.description ?? '',
    image: category.image ?? '',
    isActive: category.isActive ?? true,
    isFeatured: category.isFeatured ?? false,
    displayOrder: category.displayOrder ?? 0,
    parentId: category.parentId ?? undefined,
    metaTitle: category.metaTitle ?? '',
    metaDescription: category.metaDescription ?? '',
  };
}

function formDataToPayload(data: CategoryFormState): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    name: data.name,
    isActive: data.isActive,
    isFeatured: data.isFeatured,
    displayOrder: data.displayOrder,
    parentId: data.parentId || null,
  };

  const slug = data.slug?.trim();
  if (slug) payload.slug = slug;

  const description = data.description?.trim();
  if (description) payload.description = description;

  const image = data.image?.trim();
  if (image) payload.image = image;

  const metaTitle = data.metaTitle?.trim();
  if (metaTitle) payload.metaTitle = metaTitle;

  const metaDescription = data.metaDescription?.trim();
  if (metaDescription) payload.metaDescription = metaDescription;

  return payload;
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormState>(DEFAULT_FORM_DATA);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = (await apiService(
        `${API_ROUTES.CATEGORIES.BASE}?page=1&limit=100`,
        { method: 'GET' },
      )) as { data: Category[] };
      setCategories(response.data ?? []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const reorderCategories = useCallback(
    async (payload: CategoryReorderFlatItem[]) => {
      try {
        await apiService(API_ROUTES.CATEGORIES.REORDER, {
          method: 'PATCH',
          body: payload,
        });
        await fetchCategories();
        toast.success('Category hierarchy rebalanced');
      } catch (error) {
        toast.error('Failed to update hierarchy');
      }
    },
    [fetchCategories],
  );

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
        body: formDataToPayload(formData),
      });

      setModalOpen(false);
      setEditingCategory(null);
      setFormData(DEFAULT_FORM_DATA);
      await fetchCategories();
      toast.success(editingCategory ? 'Category definition refined' : 'Category initialized');
    } catch (error) {
      console.error('Failed to save category:', error);
      toast.error('Failed to save category');
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const toggleCategoryActive = async (category: Category) => {
    try {
      const newState = !(category.isActive !== false);
      await apiService(API_ROUTES.CATEGORIES.BY_ID(category.id), {
        method: 'PATCH',
        body: { isActive: newState },
      });
      await fetchCategories();
      toast.success(`Category ${newState ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('Failed to toggle category status:', error);
      toast.error('Failed to update status');
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
      await fetchCategories();
      toast.success('Category permanently removed');
    } catch (error) {
      console.error('Failed to delete category:', error);
      toast.error('Failed to delete category');
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setDeletingId(null);
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData(DEFAULT_FORM_DATA);
    setModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData(categoryToFormData(category));
    setModalOpen(true);
  };

  return {
    categories,
    availableCategories: categories,
    loading,
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
    reorderCategories,
    toggleCategoryActive,
    refresh: fetchCategories,
  };
};
