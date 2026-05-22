import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../services/api.service';
import { API_ROUTES } from '../../config/constants';
import { toast } from '../../store/useToastStore';
import type {
  AttributeWithValues,
  AttributeFormData,
  AttributeValueFormData,
  AttributeReorderPayload,
  AttributeValueReorderPayload,
} from '@amber/shared';

type AttributeTypeFilter = '' | 'text' | 'color' | 'image';
type FilterableFilter = '' | 'true' | 'false';

export const useAttributes = () => {
  const [attributes, setAttributes] = useState<AttributeWithValues[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<AttributeTypeFilter>('');
  const [filterableFilter, setFilterableFilter] = useState<FilterableFilter>('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingTarget, setDeletingTarget] = useState<
    | { kind: 'attribute'; attribute: AttributeWithValues }
    | { kind: 'value'; attributeId: string; valueId: string; label: string; usageCount?: number }
    | null
  >(null);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchAttributes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (typeFilter) params.append('type', typeFilter);
      if (filterableFilter) params.append('isFilterable', filterableFilter);
      const qs = params.toString();
      const response = (await apiService(
        `${API_ROUTES.ATTRIBUTES.BASE}${qs ? `?${qs}` : ''}`,
        { method: 'GET' },
      )) as AttributeWithValues[] | { data: AttributeWithValues[] };
      const list = Array.isArray(response) ? response : response.data ?? [];
      setAttributes(list);
    } catch (error) {
      console.error('Failed to fetch attributes:', error);
      setAttributes([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, typeFilter, filterableFilter]);

  useEffect(() => {
    fetchAttributes();
  }, [fetchAttributes]);

  const addAttribute = useCallback(
    async (data: AttributeFormData) => {
      setSubmitting(true);
      setSubmitError(null);
      try {
        const result = await apiService(API_ROUTES.ATTRIBUTES.BASE, {
          method: 'POST',
          body: data,
        });
        await fetchAttributes();
        toast.success('Attribute initialized');
        return result as AttributeWithValues;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to create attribute';
        setSubmitError(message);
        toast.error(message);
        throw error;
      } finally {
        setSubmitting(false);
      }
    },
    [fetchAttributes],
  );

  const editAttribute = useCallback(
    async (id: string, data: Partial<AttributeFormData>) => {
      setSubmitting(true);
      setSubmitError(null);
      try {
        const result = await apiService(API_ROUTES.ATTRIBUTES.BY_ID(id), {
          method: 'PATCH',
          body: data,
        });
        await fetchAttributes();
        toast.success('Attribute parameters refined');
        return result as AttributeWithValues;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to update attribute';
        setSubmitError(message);
        toast.error(message);
        throw error;
      } finally {
        setSubmitting(false);
      }
    },
    [fetchAttributes],
  );

  const removeAttribute = useCallback((attribute: AttributeWithValues) => {
    setDeletingTarget({ kind: 'attribute', attribute });
    setDeleteError(null);
    setDeleteConfirmOpen(true);
  }, []);

  const addAttributeValue = useCallback(
    async (attributeId: string, data: AttributeValueFormData) => {
      setSubmitError(null);
      try {
        await apiService(API_ROUTES.ATTRIBUTES.VALUES(attributeId), {
          method: 'POST',
          body: data,
        });
        await fetchAttributes();
        toast.success('Value added to palette');
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to add value';
        setSubmitError(message);
        toast.error(message);
        throw error;
      }
    },
    [fetchAttributes],
  );

  const editAttributeValue = useCallback(
    async (valueId: string, data: Partial<AttributeValueFormData>) => {
      setSubmitError(null);
      try {
        await apiService(API_ROUTES.ATTRIBUTES.VALUE_BY_ID(valueId), {
          method: 'PATCH',
          body: data,
        });
        await fetchAttributes();
        toast.success('Value refined');
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to update value';
        setSubmitError(message);
        toast.error(message);
        throw error;
      }
    },
    [fetchAttributes],
  );

  const removeAttributeValue = useCallback(
    (attributeId: string, valueId: string, label: string) => {
      setDeletingTarget({
        kind: 'value',
        attributeId,
        valueId,
        label,
      });
      setDeleteError(null);
      setDeleteConfirmOpen(true);
    },
    [],
  );

  const reorderAttributes = useCallback(
    async (items: AttributeReorderPayload) => {
      try {
        await apiService(API_ROUTES.ATTRIBUTES.REORDER, {
          method: 'PATCH',
          body: items,
        });
        await fetchAttributes();
        toast.success('Attribute priorities synchronized');
      } catch (error) {
        toast.error('Failed to update priorities');
      }
    },
    [fetchAttributes],
  );

  const reorderValues = useCallback(
    async (attributeId: string, items: AttributeValueReorderPayload) => {
      try {
        await apiService(API_ROUTES.ATTRIBUTES.VALUES_REORDER(attributeId), {
          method: 'PATCH',
          body: items,
        });
        await fetchAttributes();
        toast.success('Value sequence updated');
      } catch (error) {
        toast.error('Failed to update sequence');
      }
    },
    [fetchAttributes],
  );

  const confirmDelete = useCallback(async () => {
    if (!deletingTarget) return;
    setDeleteError(null);
    try {
      if (deletingTarget.kind === 'attribute') {
        await apiService(API_ROUTES.ATTRIBUTES.BY_ID(deletingTarget.attribute.id), {
          method: 'DELETE',
        });
      } else {
        await apiService(
          API_ROUTES.ATTRIBUTES.VALUE_BY_ID(deletingTarget.valueId),
          { method: 'DELETE' },
        );
      }
      setDeleteConfirmOpen(false);
      setDeletingTarget(null);
      await fetchAttributes();
      toast.success(deletingTarget.kind === 'attribute' ? 'Attribute permanently removed' : 'Value removed from palette');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete';
      setDeleteError(message);
      toast.error(message);
    }
  }, [deletingTarget, fetchAttributes]);

  const cancelDelete = useCallback(() => {
    setDeleteConfirmOpen(false);
    setDeletingTarget(null);
    setDeleteError(null);
  }, []);

  const hasActiveSearch =
    debouncedSearch.length > 0 || typeFilter !== '' || filterableFilter !== '';

  return {
    attributes,
    loading,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    filterableFilter,
    setFilterableFilter,
    hasActiveSearch,
    submitting,
    submitError,
    setSubmitError,
    deleteConfirmOpen,
    deletingTarget,
    deleteError,
    addAttribute,
    editAttribute,
    removeAttribute,
    addAttributeValue,
    editAttributeValue,
    removeAttributeValue,
    reorderAttributes,
    reorderValues,
    confirmDelete,
    cancelDelete,
    refresh: fetchAttributes,
  };
};
