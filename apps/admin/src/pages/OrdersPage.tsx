import React from 'react';
import { 
  ShoppingBag, 
  Loader2, 
  ChevronLeft, 
  ChevronRight,
  Download,
} from 'lucide-react';
import { Modal } from '../components/admin/Modal';
import { useOrders } from '../features/orders/useOrders';
import { OrderTable } from '../features/orders/components/OrderTable';
import { OrderFilters } from '../features/orders/components/OrderFilters';
import { OrderDetails } from '../features/orders/components/OrderDetails';

export const OrdersPage: React.FC = () => {
  const {
    orders,
    meta,
    loading,
    page,
    setPage,
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
    handleUpdateStatus,
    handleDelete
  } = useOrders();

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-end justify-between">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase leading-none">Order Management</span>
          <h2 className="text-4xl font-serif text-foreground tracking-tight">Fulfillment Center</h2>
        </div>
        <button 
          className="flex items-center gap-3 bg-secondary text-foreground border border-border px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-muted transition-all duration-300 shadow-xl shadow-black/5"
        >
          <Download size={18} /> Export Manifest
        </button>
      </div>

      <OrderFilters 
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        paymentStatusFilter={paymentStatusFilter}
        onPaymentStatusFilterChange={setPaymentStatusFilter}
        selectedIdsCount={selectedIds.length}
        onBulkUpdate={handleBulkUpdate}
        bulkUpdating={bulkUpdating}
      />

      {loading ? (
        <div className="py-40 flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-primary" size={40} />
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Accessing Records...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <OrderTable 
            orders={orders}
            selectedIds={selectedIds}
            onSelect={toggleSelection}
            onSelectAll={toggleSelectAll}
            onViewDetails={(order) => {
              setSelectedOrder(order);
              setModalOpen(true);
            }}
            onDelete={handleDelete}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
          />

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-border">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Showing {orders.length} of {meta.total} Shipments
              </span>
              <div className="flex items-center gap-4">
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="p-2 border border-border hover:border-primary disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-xs font-mono font-bold">{page} / {meta.totalPages}</span>
                <button 
                  disabled={page === meta.totalPages}
                  onClick={() => setPage(page + 1)}
                  className="p-2 border border-border hover:border-primary disabled:opacity-30 transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title="Inventory Fulfillment Details"
        size="xl"
      >
        {selectedOrder && (
          <OrderDetails
            order={selectedOrder}
            onUpdateStatus={handleUpdateStatus}
            updatingStatus={updatingStatus}
            onUpdateTracking={handleUpdateTracking}
            onRefund={handleRefund}
          />
        )}
      </Modal>
    </div>
  );
};
