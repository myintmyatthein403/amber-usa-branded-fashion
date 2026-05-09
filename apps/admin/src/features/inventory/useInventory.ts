import { useState, useMemo, useCallback } from 'react';
import { useFetch } from '../../hooks/useCrud';
import { apiService } from '../../services/api.service';
import { API_ROUTES } from '../../config/constants';
import { GroupedInventory, Warehouse } from './schema';

export const useInventory = () => {
  const { data: rawInventory, loading, refresh } = useFetch<any>(API_ROUTES.LOGISTICS.INVENTORY);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [filterLocation, setFilterLocation] = useState<string>('ALL');

  // Adjustment Modal State
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  const [adjustmentQty, setAdjustmentQty] = useState(0);

  const groupedInventory = useMemo(() => {
    if (!rawInventory) return [];

    const groups: Record<string, GroupedInventory> = {};

     rawInventory.forEach((item: any) => {
       const product = item.variant?.product;
       if (!groups[item.variantId]) {
         groups[item.variantId] = {
           variant: item.variant,
           product: product || { id: '', name: '', images: [] },
           stocks: {},
           totalStock: 0
         };
       }
       groups[item.variantId].stocks[item.warehouse.id] = item.quantity;
       groups[item.variantId].totalStock += item.quantity;
     });

    return Object.values(groups).filter(group => {
      const prodName = group.product?.name || '';
      const matchesSearch = prodName.toLowerCase().includes(search.toLowerCase()) || 
                           group.variant.sku.toLowerCase().includes(search.toLowerCase());
      
      if (filterLocation === 'ALL') return matchesSearch;
      
      const hasStockInLocation = Object.keys(group.stocks).some(wId => {
        const warehouse = rawInventory.find(inv => inv.warehouse.id === wId)?.warehouse;
        return warehouse?.location === filterLocation;
      });
      
      return matchesSearch && hasStockInLocation;
    });
  }, [rawInventory, search, filterLocation]);

  const warehouses = useMemo(() => {
    if (!rawInventory) return [];
    const unique = new Map<string, Warehouse>();
    rawInventory.forEach(item => {
      unique.set(item.warehouse.id, item.warehouse);
    });
    return Array.from(unique.values());
  }, [rawInventory]);

  const openAdjustModal = useCallback((group: GroupedInventory, warehouseId?: string) => {
    setSelectedVariant(group.variant);
    setSelectedWarehouseId(warehouseId || '');
    const currentQty = warehouseId ? (group.stocks[warehouseId] || 0) : 0;
    setAdjustmentQty(currentQty);
    setAdjustModalOpen(true);
  }, []);

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVariant || !selectedWarehouseId) return;

    setSubmitting(true);
    try {
      await apiService(API_ROUTES.LOGISTICS.UPDATE_STOCK, {
        method: 'PATCH',
        body: {
          variantId: selectedVariant.id,
          warehouseId: selectedWarehouseId,
          quantity: adjustmentQty
        }
      });
      setAdjustModalOpen(false);
      refresh();
    } catch (error) {
      console.error('Failed to adjust stock:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const updateAdjustmentQtyByWarehouse = useCallback((warehouseId: string) => {
    setSelectedWarehouseId(warehouseId);
    const group = groupedInventory.find(g => g.variant.id === selectedVariant?.id);
    if (group) setAdjustmentQty(group.stocks[warehouseId] || 0);
  }, [groupedInventory, selectedVariant]);

  return {
    loading,
    refresh,
    search,
    setSearch,
    viewMode,
    setViewMode,
    filterLocation,
    setFilterLocation,
    adjustModalOpen,
    setAdjustModalOpen,
    submitting,
    selectedVariant,
    selectedWarehouseId,
    adjustmentQty,
    setAdjustmentQty,
    groupedInventory,
    warehouses,
    openAdjustModal,
    handleAdjustStock,
    updateAdjustmentQtyByWarehouse
  };
};
