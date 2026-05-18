import { useState, useCallback } from 'react';
import { useFetch } from '../../hooks/useCrud';
import { API_ROUTES } from '../../config/constants';
import { apiService } from '../../services/api.service';
import { Warehouse } from './schema';

interface InventoryMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

type ViewMode = 'grid' | 'list';

export const useWarehouses = () => {
  const { data: warehouses, loading, refresh } = useFetch<Warehouse>(API_ROUTES.LOGISTICS.WAREHOUSES);
  const [modalOpen, setModalOpen] = useState(false);
  const [inventoryModalOpen, setInventoryModalOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [warehouseInventory, setWarehouseInventory] = useState<any[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryPagination, setInventoryPagination] = useState<InventoryMeta>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('warehouseInventoryViewMode');
    return (saved as ViewMode) || 'list';
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: 'USA' as Warehouse['location'],
    address: ''
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiService(API_ROUTES.LOGISTICS.WAREHOUSES, {
        method: 'POST',
        body: formData
      });
      setModalOpen(false);
      setFormData({ name: '', location: 'USA', address: '' });
      refresh();
    } catch (error) {
      console.error('Failed to create warehouse:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const fetchInventory = useCallback(async (warehouseId: string, page: number = 1, search: string = '') => {
    setLoadingInventory(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: inventoryPagination.limit.toString(),
      });
      if (search) params.append('search', search);

      const response = await apiService<unknown, { data: any[]; meta: InventoryMeta }>(
        `${API_ROUTES.LOGISTICS.INVENTORY_BY_WAREHOUSE(warehouseId)}?${params}`
      );
      setWarehouseInventory(response?.data || []);
      setInventoryPagination(prev => ({
        ...prev,
        ...response?.meta,
        page,
      }));
    } catch (error) {
      console.error('Failed to fetch warehouse inventory:', error);
    } finally {
      setLoadingInventory(false);
    }
  }, [inventoryPagination.limit]);

  const openInventory = async (warehouse: any) => {
    setSelectedWarehouse(warehouse);
    setInventoryModalOpen(true);
    setInventorySearch('');
    setInventoryPagination(prev => ({ ...prev, page: 1 }));
    await fetchInventory(warehouse.id, 1, '');
  };

  const handleInventoryPageChange = (page: number) => {
    if (selectedWarehouse) {
      fetchInventory(selectedWarehouse.id, page, inventorySearch);
    }
  };

  const handleInventorySearch = (search: string) => {
    setInventorySearch(search);
    if (selectedWarehouse) {
      fetchInventory(selectedWarehouse.id, 1, search);
    }
  };

  const toggleViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('warehouseInventoryViewMode', mode);
  };

  return {
    warehouses,
    loading,
    modalOpen,
    setModalOpen,
    inventoryModalOpen,
    setInventoryModalOpen,
    selectedWarehouse,
    warehouseInventory,
    loadingInventory,
    inventorySearch,
    setInventorySearch: handleInventorySearch,
    inventoryPagination,
    viewMode,
    setViewMode: toggleViewMode,
    submitting,
    formData,
    setFormData,
    handleCreate,
    openInventory,
    handleInventoryPageChange,
    refresh
  };
};