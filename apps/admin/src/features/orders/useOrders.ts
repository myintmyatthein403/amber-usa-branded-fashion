import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../services/api.service';
import { API_ROUTES } from '../../config/constants';
import { useDelete } from '../../hooks/useCrud';
import { Order, OrderStatus, PaymentStatus, Meta } from './schema';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<PaymentStatus | ''>('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingTracking, setUpdatingTracking] = useState(false);

  const { deleteItem } = useDelete(API_ROUTES.ORDERS.BASE);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
      });
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (paymentStatusFilter) params.append('paymentStatus', paymentStatusFilter);

      const response = await apiService<unknown, { data: Order[]; meta: Meta }>(`${API_ROUTES.ORDERS.BASE}?${params.toString()}`);
      setOrders(response.data || []);
      setMeta(response.meta || null);
      setSelectedIds([]);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusFilter, paymentStatusFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleUpdateStatus = async (id: string, newStatus: OrderStatus) => {
    setUpdatingStatus(true);
    try {
      await apiService(API_ROUTES.ORDERS.UPDATE_STATUS(id), {
        method: 'PATCH',
        body: { status: newStatus },
      });
      fetchOrders();
      if (selectedOrder?.id === id) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleUpdateTracking = async (id: string, trackingData: { carrier: string; trackingNumber: string }) => {
    setUpdatingTracking(true);
    try {
      await apiService(API_ROUTES.ORDERS.BY_ID(id) + '/tracking', {
        method: 'PATCH',
        body: trackingData,
      });
      fetchOrders();
      if (selectedOrder?.id === id) {
        setSelectedOrder({ ...selectedOrder, ...trackingData });
      }
    } catch (error) {
      console.error('Failed to update tracking information:', error);
    } finally {
      setUpdatingTracking(false);
    }
  };

  const handleConfirmManualPayment = async (id: string) => {
    try {
      await apiService(API_ROUTES.ORDERS.CONFIRM_MANUAL_PAYMENT(id), { method: 'POST' });
      await fetchOrders();
      if (selectedOrder?.id === id) {
        const updated = await apiService<unknown, Order>(API_ROUTES.ORDERS.BY_ID(id));
        setSelectedOrder((updated as { data?: Order })?.data ?? updated);
      }
    } catch (error) {
      console.error('Failed to confirm payment:', error);
      alert('Failed to confirm payment. Ensure proof is uploaded.');
    }
  };

  const handleRejectManualPayment = async (id: string, reason: string) => {
    try {
      await apiService(API_ROUTES.ORDERS.REJECT_MANUAL_PAYMENT(id), {
        method: 'POST',
        body: { reason },
      });
      await fetchOrders();
      if (selectedOrder?.id === id) {
        const updated = await apiService<unknown, Order>(API_ROUTES.ORDERS.BY_ID(id));
        setSelectedOrder((updated as { data?: Order })?.data ?? updated);
      }
    } catch (error) {
      console.error('Failed to reject payment:', error);
      alert('Failed to reject payment.');
    }
  };

  const handleRefund = async (id: string, amount?: number) => {
    try {
      await apiService(`${API_ROUTES.ORDERS.BASE}/${id}/refund`, {
        method: 'POST',
        body: { amount },
      });
      fetchOrders();
      if (selectedOrder?.id === id) {
        setSelectedOrder({ ...selectedOrder, paymentStatus: 'REFUNDED', status: 'REFUNDED' });
      }
    } catch (error) {
      console.error('Failed to process refund:', error);
      alert('Refund failed. Please check Stripe logs.');
    }
  };

  const handleBulkUpdate = async (newStatus: OrderStatus) => {
    if (selectedIds.length === 0) return;
    setBulkUpdating(true);
    try {
      await apiService(`${API_ROUTES.ORDERS.BASE}/bulk-status`, {
        method: 'PATCH',
        body: { ids: selectedIds, status: newStatus },
      });
      fetchOrders();
      setSelectedIds([]);
    } catch (error) {
      console.error('Failed to bulk update status:', error);
    } finally {
      setBulkUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this order? This action cannot be undone.');
    if (!confirmed) return;
    const success = await deleteItem(id);
    if (success) fetchOrders();
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === orders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(orders.map(o => o.id!).filter((id): id is string => !!id));
    }
  };

  return {
    orders,
    meta,
    loading,
    page,
    setPage,
    limit,
    setLimit,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    paymentStatusFilter,
    setPaymentStatusFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    selectedIds,
    toggleSelection,
    toggleSelectAll,
    bulkUpdating,
    handleBulkUpdate,
    selectedOrder,
    setSelectedOrder,
    modalOpen,
    setModalOpen,
    updatingStatus,
    updatingTracking,
    handleUpdateStatus,
    handleUpdateTracking,
    handleRefund,
    handleConfirmManualPayment,
    handleRejectManualPayment,
    handleDelete,
    refresh: fetchOrders
  };
};
