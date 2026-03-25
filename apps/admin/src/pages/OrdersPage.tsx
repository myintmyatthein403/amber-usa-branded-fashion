import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  ShoppingBag, 
  Trash2, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Truck, 
  Package, 
  Eye, 
  MapPin, 
  User, 
  Phone, 
  Mail,
  ArrowRight,
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  X,
  CreditCard,
  AlertCircle,
  MoreHorizontal,
  Check
} from 'lucide-react';
import { Modal } from '../components/admin/Modal';
import { useDelete } from '../hooks/useCrud';
import { apiService } from '../services/api.service';
import { API_ROUTES } from '../config/constants';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type OrderStatus = 'PENDING' | 'PROCESSING' | 'DELIVERING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
  isUsd: boolean;
}

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  currency: string;
  paymentMethod: string;
  shippingAddress: string;
  userId?: string;
  user?: {
    name: string;
    email: string;
  };
  items: OrderItem[];
  createdAt: string;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; icon: any; color: string; bg: string; border: string }> = {
  PENDING: { label: 'Pending', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  PROCESSING: { label: 'Processing', icon: Package, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  DELIVERING: { label: 'Delivering', icon: Truck, color: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
  COMPLETED: { label: 'Completed', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  CANCELLED: { label: 'Cancelled', icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  REFUNDED: { label: 'Refunded', icon: ArrowRight, color: 'text-slate-500', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
};

const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { label: string; icon: any; color: string; bg: string; border: string }> = {
  PENDING: { label: 'Unpaid', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-600/10', border: 'border-amber-600/20' },
  PAID: { label: 'Paid', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-600/10', border: 'border-emerald-600/20' },
  FAILED: { label: 'Failed', icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-600/10', border: 'border-rose-600/20' },
  REFUNDED: { label: 'Refunded', icon: ArrowRight, color: 'text-slate-600', bg: 'bg-slate-600/10', border: 'border-slate-600/20' },
};

export const OrdersPage: React.FC = () => {
  // State for querying
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
  
  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkUpdating, setBulkUpdating] = useState(false);

  // Modal state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

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

      const response = await apiService(`${API_ROUTES.ORDERS.BASE}?${params.toString()}`);
      setOrders(response.data);
      setMeta(response.meta);
      setSelectedIds([]); // Reset selection on fetch
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
      
      if (selectedOrder?.id === id) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }
      
      fetchOrders();
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleUpdatePaymentStatus = async (id: string, newStatus: PaymentStatus) => {
    setUpdatingStatus(true);
    try {
      await apiService(API_ROUTES.ORDERS.UPDATE_PAYMENT_STATUS(id), {
        method: 'PATCH',
        body: { status: newStatus },
      });
      
      if (selectedOrder?.id === id) {
        setSelectedOrder(prev => prev ? { ...prev, paymentStatus: newStatus } : null);
      }
      
      fetchOrders();
    } catch (error) {
      console.error('Failed to update payment status:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleBulkUpdate = async (type: 'FULFILLMENT' | 'PAYMENT', value: string) => {
    if (selectedIds.length === 0) return;
    setBulkUpdating(true);
    try {
      const endpoint = type === 'FULFILLMENT' ? API_ROUTES.ORDERS.BULK_STATUS : API_ROUTES.ORDERS.BULK_PAYMENT_STATUS;
      await apiService(endpoint, {
        method: 'PATCH',
        body: { ids: selectedIds, status: value },
      });
      fetchOrders();
    } catch (error) {
      console.error('Bulk update failed:', error);
    } finally {
      setBulkUpdating(false);
    }
  };

  const openDetailsModal = (order: Order) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const success = await deleteItem(id, 'Are you sure you want to delete this order?');
    if (success) fetchOrders();
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === orders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(orders.map(o => o.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const exportToCSV = () => {
    if (!orders.length) return;

    const headers = ['Order Number', 'Date', 'Customer', 'Email', 'Amount', 'Currency', 'Fulfillment Status', 'Payment Status', 'Payment Method', 'Address'];
    const rows = (selectedIds.length > 0 ? orders.filter(o => selectedIds.includes(o.id)) : orders).map(order => [
      order.orderNumber,
      format(new Date(order.createdAt), 'yyyy-MM-dd HH:mm'),
      order.user?.name || 'Guest',
      order.user?.email || 'N/A',
      order.totalAmount,
      order.currency,
      order.status,
      order.paymentStatus || 'PENDING',
      order.paymentMethod,
      `"${order.shippingAddress.replace(/"/g, '""')}"`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `orders_export_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase leading-none">Order Management</span>
          <h2 className="text-4xl font-serif text-foreground tracking-tight">Customer Orders</h2>
        </div>
        
        <div className="flex items-center gap-3">
           <button 
             onClick={exportToCSV}
             className="flex items-center gap-3 bg-secondary text-foreground px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-muted transition-all duration-300 border border-border"
           >
             <Download size={14} /> {selectedIds.length > 0 ? `Export Selected (${selectedIds.length})` : 'Export CSV'}
           </button>
        </div>
      </div>

      {/* Bulk Actions Floating Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-[#1A1A1A] text-white px-8 py-4 shadow-2xl flex items-center gap-8 animate-in slide-in-from-bottom-10 duration-500">
           <div className="flex items-center gap-3 pr-8 border-r border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">{selectedIds.length} SELECTED</span>
              <button onClick={() => setSelectedIds([])} className="hover:text-[#D4AF37] transition-colors"><X size={14}/></button>
           </div>

           <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                 <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">Fulfillment:</span>
                 <select 
                   onChange={(e) => handleBulkUpdate('FULFILLMENT', e.target.value)}
                   disabled={bulkUpdating}
                   className="bg-transparent border-b border-white/20 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-[#D4AF37] cursor-pointer"
                 >
                    <option value="" disabled selected>Update Status</option>
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                      <option key={key} value={key} className="bg-[#1A1A1A]">{config.label}</option>
                    ))}
                 </select>
              </div>

              <div className="flex items-center gap-3">
                 <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">Payment:</span>
                 <select 
                   onChange={(e) => handleBulkUpdate('PAYMENT', e.target.value)}
                   disabled={bulkUpdating}
                   className="bg-transparent border-b border-white/20 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-[#D4AF37] cursor-pointer"
                 >
                    <option value="" disabled selected>Update Status</option>
                    {Object.entries(PAYMENT_STATUS_CONFIG).map(([key, config]) => (
                      <option key={key} value={key} className="bg-[#1A1A1A]">{config.label}</option>
                    ))}
                 </select>
              </div>

              {bulkUpdating && <Loader2 size={16} className="animate-spin text-[#D4AF37]" />}
           </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-card border border-border p-6 shadow-sm">
         <div className="lg:col-span-4 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={18} />
            <input 
              type="text"
              placeholder="Order #, Customer, Email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full h-12 bg-muted/20 border border-border pl-12 pr-4 text-sm focus:border-primary focus:outline-none transition-all"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={14} />
              </button>
            )}
         </div>

         <div className="lg:col-span-3">
            <div className="relative h-12">
               <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={16} />
               <select
                 value={statusFilter}
                 onChange={(e) => {
                   setStatusFilter(e.target.value as OrderStatus | '');
                   setPage(1);
                 }}
                 className="w-full h-full bg-muted/20 border border-border pl-12 pr-4 text-[10px] font-bold uppercase tracking-widest appearance-none focus:border-primary focus:outline-none transition-all cursor-pointer"
               >
                 <option value="">All Fulfillment</option>
                 {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                   <option key={key} value={key}>{config.label}</option>
                 ))}
               </select>
               <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronDown size={14} className="text-muted-foreground/40" />
               </div>
            </div>
         </div>

         <div className="lg:col-span-3">
            <div className="relative h-12">
               <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={16} />
               <select
                 value={paymentStatusFilter}
                 onChange={(e) => {
                   setPaymentStatusFilter(e.target.value as PaymentStatus | '');
                   setPage(1);
                 }}
                 className="w-full h-full bg-muted/20 border border-border pl-12 pr-4 text-[10px] font-bold uppercase tracking-widest appearance-none focus:border-primary focus:outline-none transition-all cursor-pointer"
               >
                 <option value="">All Payments</option>
                 {Object.entries(PAYMENT_STATUS_CONFIG).map(([key, config]) => (
                   <option key={key} value={key}>{config.label}</option>
                 ))}
               </select>
               <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronDown size={14} className="text-muted-foreground/40" />
               </div>
            </div>
         </div>

         <div className="lg:col-span-2 flex items-center justify-end text-muted-foreground">
            <span className="text-[10px] font-bold uppercase tracking-widest">{orders.length} / {meta?.total || 0}</span>
         </div>
      </div>

      {/* Table */}
      <div className="border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-6 py-5 w-12 text-center">
                   <button 
                     onClick={toggleSelectAll}
                     className={cn(
                       "w-4 h-4 rounded border transition-all flex items-center justify-center m-auto",
                       selectedIds.length === orders.length && orders.length > 0
                         ? "bg-primary border-primary text-primary-foreground" 
                         : "border-muted-foreground/30 hover:border-primary"
                     )}
                   >
                      {selectedIds.length === orders.length && orders.length > 0 && <Check size={10} />}
                   </button>
                </th>
                <th 
                  className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase cursor-pointer hover:text-primary transition-colors"
                  onClick={() => handleSort('orderNumber')}
                >
                  <div className="flex items-center gap-2">
                    Order # <ArrowUpDown size={12} className={sortBy === 'orderNumber' ? 'text-primary' : 'text-muted-foreground/30'} />
                  </div>
                </th>
                <th 
                  className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase cursor-pointer hover:text-primary transition-colors"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center gap-2">
                    Date <ArrowUpDown size={12} className={sortBy === 'createdAt' ? 'text-primary' : 'text-muted-foreground/30'} />
                  </div>
                </th>
                <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">Customer</th>
                <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">Amount</th>
                <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase text-center">Fulfillment</th>
                <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase text-center">Payment</th>
                <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={9} className="px-10 py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic animate-pulse">Syncing with Registry...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={9} className="px-10 py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic">No orders found.</td></tr>
              ) : (
                orders.map((order) => {
                  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
                  const pStatusKey = order.paymentStatus || 'PENDING';
                  const pStatus = PAYMENT_STATUS_CONFIG[pStatusKey] || PAYMENT_STATUS_CONFIG.PENDING;
                  const isNew = order.status === 'PENDING';
                  const isSelected = selectedIds.includes(order.id);
                  
                  return (
                    <tr key={order.id} className={cn(
                      "group hover:bg-muted/50 transition-colors duration-300",
                      isSelected ? "bg-primary/[0.04]" : isNew ? "bg-primary/[0.02]" : ""
                    )}>
                      <td className="px-6 py-6 w-12 text-center">
                         <button 
                           onClick={() => toggleSelect(order.id)}
                           className={cn(
                             "w-4 h-4 rounded border transition-all flex items-center justify-center m-auto",
                             isSelected
                               ? "bg-primary border-primary text-primary-foreground" 
                               : "border-muted-foreground/30 group-hover:border-primary"
                           )}
                         >
                            {isSelected && <Check size={10} />}
                         </button>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-3">
                          {isNew && (
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0" />
                          )}
                          <div className="text-sm font-bold text-foreground tracking-wide font-mono">{order.orderNumber}</div>
                        </div>
                      </td>
                      <td className="px-10 py-6 whitespace-nowrap">
                        <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest leading-relaxed">
                          {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                          <br />
                          {format(new Date(order.createdAt), 'HH:mm')}
                        </div>
                      </td>
                      <td className="px-10 py-6 max-w-[200px]">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 bg-secondary border border-border flex items-center justify-center rounded-full shrink-0">
                             <User size={14} className="text-primary/40" />
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <div className="text-xs font-bold text-foreground truncate">{order.user?.name || 'Guest User'}</div>
                            <div className="text-[10px] text-muted-foreground truncate">{order.user?.email || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6 whitespace-nowrap">
                        <div className="text-sm font-bold text-foreground">
                          {order.currency === 'USD' ? '$' : 'MMK '}{Number(order.totalAmount).toLocaleString()}
                        </div>
                        <div className="text-[9px] font-mono text-muted-foreground/40 uppercase tracking-widest">
                          {order.paymentMethod}
                        </div>
                      </td>
                      <td className="px-10 py-6 text-center">
                        <div className="flex justify-center">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                            status.color, status.bg, status.border
                          )}>
                            <status.icon size={12} /> {status.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-center">
                        <div className="flex justify-center">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                            pStatus.color, pStatus.bg, pStatus.border
                          )}>
                            <pStatus.icon size={12} /> {pStatus.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button 
                            onClick={() => openDetailsModal(order)}
                            className="p-2.5 text-muted-foreground hover:text-foreground transition-colors duration-300"
                          >
                            <Eye size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(order.id)}
                            className="p-2.5 text-muted-foreground hover:text-destructive transition-colors duration-300"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border pt-8">
           <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-[10px] font-bold uppercase tracking-widest">Rows:</span>
              <select 
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-transparent text-[10px] font-bold uppercase tracking-widest border-b border-border focus:outline-none focus:border-primary px-2 py-1"
              >
                 {[10, 25, 50, 100].map(v => (
                   <option key={v} value={v}>{v}</option>
                 ))}
              </select>
           </div>

           <div className="flex items-center gap-6">
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                 {meta.page} / {meta.totalPages}
              </div>
              <div className="flex items-center gap-2">
                 <button 
                   disabled={page <= 1}
                   onClick={() => setPage(p => p - 1)}
                   className="p-2 border border-border text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                 >
                    <ChevronLeft size={16} />
                 </button>
                 <button 
                   disabled={page >= meta.totalPages}
                   onClick={() => setPage(p => p + 1)}
                   className="p-2 border border-border text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                 >
                    <ChevronRight size={16} />
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Modal */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={`Order Specification: ${selectedOrder?.orderNumber}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-10 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Double Banner System */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* Fulfillment Status */}
               {(() => {
                 const status = STATUS_CONFIG[selectedOrder.status] || STATUS_CONFIG.PENDING;
                 return (
                   <div className={cn(
                     "p-6 border flex items-center justify-between",
                     status.bg,
                     status.border
                   )}>
                     <div className="flex items-center gap-4">
                        <div className={cn("p-3 bg-white/50 backdrop-blur-sm border", status.border)}>
                           {React.createElement(status.icon, { size: 20, className: status.color })}
                        </div>
                        <div>
                           <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground mb-0.5">Fulfillment</div>
                           <div className={cn("text-xl font-serif", status.color)}>
                             {status.label}
                           </div>
                        </div>
                     </div>

                     <select 
                       value={selectedOrder.status}
                       onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value as OrderStatus)}
                       disabled={updatingStatus}
                       className="bg-white/80 border border-border px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest focus:border-primary focus:outline-none transition-all cursor-pointer disabled:opacity-50"
                     >
                        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                          <option key={key} value={key}>{config.label}</option>
                        ))}
                     </select>
                   </div>
                 );
               })()}

               {/* Payment Status */}
               {(() => {
                 const pStatusKey = selectedOrder.paymentStatus || 'PENDING';
                 const pStatus = PAYMENT_STATUS_CONFIG[pStatusKey] || PAYMENT_STATUS_CONFIG.PENDING;
                 return (
                   <div className={cn(
                     "p-6 border flex items-center justify-between",
                     pStatus.bg,
                     pStatus.border
                   )}>
                     <div className="flex items-center gap-4">
                        <div className={cn("p-3 bg-white/50 backdrop-blur-sm border", pStatus.border)}>
                           {React.createElement(pStatus.icon, { size: 20, className: pStatus.color })}
                        </div>
                        <div>
                           <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground mb-0.5">Payment</div>
                           <div className={cn("text-xl font-serif", pStatus.color)}>
                             {pStatus.label}
                           </div>
                        </div>
                     </div>

                     <select 
                       value={pStatusKey}
                       onChange={(e) => handleUpdatePaymentStatus(selectedOrder.id, e.target.value as PaymentStatus)}
                       disabled={updatingStatus}
                       className="bg-white/80 border border-border px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest focus:border-primary focus:outline-none transition-all cursor-pointer disabled:opacity-50"
                     >
                        {Object.entries(PAYMENT_STATUS_CONFIG).map(([key, config]) => (
                          <option key={key} value={key}>{config.label}</option>
                        ))}
                     </select>
                   </div>
                 );
               })()}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
               <div className="lg:col-span-1 space-y-8">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary flex items-center gap-2">
                      <User size={14} /> Client Identity
                    </h4>
                    <div className="bg-muted/30 p-5 border border-border space-y-4">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-secondary border border-border flex items-center justify-center rounded-full text-muted-foreground/40 italic text-[10px]">
                            {selectedOrder.user?.name?.[0] || 'G'}
                          </div>
                          <div className="text-sm font-bold text-foreground">{selectedOrder.user?.name || 'Guest User'}</div>
                       </div>
                       <div className="space-y-2 border-t border-border pt-4">
                          <div className="flex items-center gap-3 text-muted-foreground overflow-hidden">
                             <Mail size={12} className="shrink-0" />
                             <span className="text-[10px] font-mono tracking-tight truncate">{selectedOrder.user?.email || 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-3 text-muted-foreground">
                             <Phone size={12} className="shrink-0" />
                             <span className="text-[10px] font-mono tracking-tight">{selectedOrder.shippingAddress.split('Phone: ')[1] || 'N/A'}</span>
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary flex items-center gap-2">
                      <MapPin size={14} /> Shipping Logistics
                    </h4>
                    <div className="bg-muted/30 p-5 border border-border">
                       <p className="text-xs text-foreground leading-relaxed font-medium italic">
                          "{selectedOrder.shippingAddress.split('. Phone:')[0]}"
                       </p>
                    </div>
                  </div>
               </div>

               <div className="lg:col-span-2 space-y-6">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary flex items-center gap-2">
                    <ShoppingBag size={14} /> Manifest of Goods
                  </h4>
                  
                  <div className="border border-border">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border bg-muted/50">
                          <th className="px-6 py-4 text-[9px] font-bold tracking-[0.2em] text-muted-foreground uppercase">Product</th>
                          <th className="px-6 py-4 text-[9px] font-bold tracking-[0.2em] text-muted-foreground uppercase text-center">Unit</th>
                          <th className="px-6 py-4 text-[9px] font-bold tracking-[0.2em] text-muted-foreground uppercase text-center">Qty</th>
                          <th className="px-6 py-4 text-[9px] font-bold tracking-[0.2em] text-muted-foreground uppercase text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {selectedOrder.items.map((item) => (
                          <tr key={item.id} className="group">
                            <td className="px-6 py-4">
                               <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 bg-secondary border border-border overflow-hidden shrink-0">
                                     <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                                  </div>
                                  <div className="min-w-0">
                                     <div className="text-[11px] font-bold text-foreground truncate">{item.name}</div>
                                     {item.size && <div className="text-[9px] font-mono text-muted-foreground/60 uppercase mt-0.5">Size: {item.size}</div>}
                                  </div>
                               </div>
                            </td>
                            <td className="px-6 py-4 text-center text-[10px] font-mono font-bold text-foreground whitespace-nowrap">
                               {item.isUsd ? '$' : 'MMK '}{Number(item.price).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-center text-[10px] font-mono font-bold text-foreground">
                               {item.quantity}
                            </td>
                            <td className="px-6 py-4 text-right text-[10px] font-mono font-bold text-foreground whitespace-nowrap">
                               {item.isUsd ? '$' : 'MMK '}{(Number(item.price) * item.quantity).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-muted/30">
                           <td colSpan={3} className="px-6 py-6 text-right text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Aggregate Total</td>
                           <td className="px-6 py-6 text-right text-lg font-serif text-primary whitespace-nowrap">
                             {selectedOrder.currency === 'USD' ? '$' : 'MMK '}{Number(selectedOrder.totalAmount).toLocaleString()}
                           </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  <div className="bg-secondary/30 p-5 border border-border flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <CreditCard size={16} className="text-primary/40" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Payment Resolution</span>
                     </div>
                     <span className="text-xs font-bold text-foreground uppercase tracking-widest">{selectedOrder.paymentMethod}</span>
                  </div>
               </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

function ChevronDown(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
