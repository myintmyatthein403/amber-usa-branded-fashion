import { useState } from 'react';
import { useFetch } from '../../hooks/useCrud';
import { API_ROUTES } from '../../config/constants';
import { apiService } from '../../services/api.service';
import { Warehouse } from './schema';

export const useWarehouses = () => {
  const { data: warehouses, loading, refresh } = useFetch<Warehouse>(API_ROUTES.LOGISTICS.WAREHOUSES);
  const [modalOpen, setModalOpen] = useState(false);
  const [inventoryModalOpen, setInventoryModalOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [warehouseInventory, setWarehouseInventory] = useState<any[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [inventorySearch, setInventorySearch] = useState('');
  
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

  const openInventory = async (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setInventoryModalOpen(true);
    setLoadingInventory(true);
    try {
      const data = await apiService(API_ROUTES.LOGISTICS.INVENTORY_BY_WAREHOUSE(warehouse.id));
      setWarehouseInventory(data);
    } catch (error) {
      console.error('Failed to fetch warehouse inventory:', error);
    } finally {
      setLoadingInventory(false);
    }
  };

  const filteredInventory = warehouseInventory.filter(item => 
    item.variant.product.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
    item.variant.sku.toLowerCase().includes(inventorySearch.toLowerCase())
  );

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
    setInventorySearch,
    filteredInventory,
    submitting,
    formData,
    setFormData,
    handleCreate,
    openInventory,
    refresh
  };
};
