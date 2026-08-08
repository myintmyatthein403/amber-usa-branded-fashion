import { useState, useMemo, useCallback } from 'react';
import { useFetch } from '../../hooks/useCrud';
import { apiService } from '../../services/api.service';
import { API_ROUTES } from '../../config/constants';
import { GroupedInventory, Warehouse, formatInventoryRowLabel } from './schema';

export const useInventory = () => {
  const { data: rawInventory, loading, refresh } = useFetch<any>(API_ROUTES.LOGISTICS.INVENTORY);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [filterLocation, setFilterLocation] = useState<string>('ALL');

  // Adjustment Modal State
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GroupedInventory | null>(null);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  const [adjustmentQty, setAdjustmentQty] = useState(0);

  // Bulk Transfer State
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferSubmitting, setTransferSubmitting] = useState(false);

  const groupedInventory = useMemo(() => {
    if (!rawInventory) return [];

    const groups: Record<string, GroupedInventory> = {};

     rawInventory.forEach((item: any) => {
       const key = item.variantId ?? item.productId;
       const label = formatInventoryRowLabel(item);
       if (!groups[key]) {
         groups[key] = {
           kind: label.kind,
           id: key,
           displayName: label.name,
           images: label.images,
           sku: label.sku,
           size: label.size,
           color: label.color,
           product: label.kind === 'variant' ? (item.variant?.product || { id: '', name: '', images: [] }) : (item.product || { id: '', name: '', images: [] }),
           stocks: {},
           totalStock: 0
         };
       }
       groups[key].stocks[item.warehouse.id] = item.quantity;
       groups[key].totalStock += item.quantity;
     });

    return Object.values(groups).filter(group => {
      const matchesSearch = group.displayName.toLowerCase().includes(search.toLowerCase()) ||
                           (group.sku?.toLowerCase().includes(search.toLowerCase()) ?? false);

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
    setSelectedItem(group);
    setSelectedWarehouseId(warehouseId || '');
    const currentQty = warehouseId ? (group.stocks[warehouseId] || 0) : 0;
    setAdjustmentQty(currentQty);
    setAdjustModalOpen(true);
  }, []);

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !selectedWarehouseId) return;

    setSubmitting(true);
    try {
      await apiService(API_ROUTES.LOGISTICS.UPDATE_STOCK, {
        method: 'PATCH',
        body: {
          variantId: selectedItem.kind === 'variant' ? selectedItem.id : undefined,
          productId: selectedItem.kind === 'product' ? selectedItem.id : undefined,
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

  const handleBulkTransfer = async (data: any) => {
    setTransferSubmitting(true);
    try {
      await apiService(API_ROUTES.LOGISTICS.BULK_TRANSFER, {
        method: 'POST',
        body: data
      });
      setTransferModalOpen(false);
      refresh();
    } catch (error) {
      console.error('Failed to execute bulk transfer:', error);
    } finally {
      setTransferSubmitting(false);
    }
  };

  const updateAdjustmentQtyByWarehouse = useCallback((warehouseId: string) => {
    setSelectedWarehouseId(warehouseId);
    const group = groupedInventory.find(g => g.id === selectedItem?.id && g.kind === selectedItem?.kind);
    if (group) setAdjustmentQty(group.stocks[warehouseId] || 0);
  }, [groupedInventory, selectedItem]);

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
    selectedItem,
    selectedWarehouseId,
    adjustmentQty,
    setAdjustmentQty,
    groupedInventory,
    warehouses,
    openAdjustModal,
    handleAdjustStock,
    handleBulkTransfer,
    updateAdjustmentQtyByWarehouse,
    transferModalOpen,
    setTransferModalOpen,
    transferSubmitting
  };
};
