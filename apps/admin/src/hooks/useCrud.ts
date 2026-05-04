import { useState, useCallback, useEffect } from 'react';
import { apiService } from '../services/api.service';

export function useFetch<T>(endpoint: string, options: { immediate?: boolean } = { immediate: true }) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiService(endpoint) as T[];
      setData(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    if (options.immediate) {
      fetchData();
    }
  }, [fetchData, options.immediate]);

  return { data, setData, loading, error, refresh: fetchData };
}

export function useDelete(endpointBase: string) {
  const [deleting, setDeleting] = useState(false);

  const deleteItem = async (id: number | string, message?: string) => {
    if (message && !window.confirm(message)) return false;
    setDeleting(true);
    try {
      await apiService(`${endpointBase}/${id}`, { method: 'DELETE' });
      return true;
    } catch (err) {
      console.error('Delete error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      alert('Failed to delete: ' + errorMessage);
      return false;
    } finally {
      setDeleting(false);
    }
  };

  return { deleteItem, deleting };
}