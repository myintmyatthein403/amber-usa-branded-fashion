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
      const result = await apiService(endpoint);
      setData(result);
    } catch (err: any) {
      setError(err.message);
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

  const deleteItem = async (id: number | string) => {
    setDeleting(true);
    try {
      await apiService(`${endpointBase}/${id}`, { method: 'DELETE' });
      return true;
    } catch (err: any) {
      console.error('Delete error:', err);
      alert('Failed to delete: ' + err.message);
      return false;
    } finally {
      setDeleting(false);
    }
  };

  return { deleteItem, deleting };
}
