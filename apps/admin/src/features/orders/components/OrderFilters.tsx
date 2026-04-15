import React from 'react';
import { Search, Filter, Loader2, Check } from 'lucide-react';
import { OrderStatus, PaymentStatus } from '../schema';

interface OrderFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: OrderStatus | '';
  onStatusFilterChange: (value: OrderStatus | '') => void;
  paymentStatusFilter: PaymentStatus | '';
  onPaymentStatusFilterChange: (value: PaymentStatus | '') => void;
  selectedIdsCount: number;
  onBulkUpdate: (status: OrderStatus) => void;
  bulkUpdating: boolean;
}

export const OrderFilters: React.FC<OrderFiltersProps> = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  paymentStatusFilter,
  onPaymentStatusFilterChange,
  selectedIdsCount,
  onBulkUpdate,
  bulkUpdating
}) => {
  return (
    <div className="flex flex-col gap-6 bg-card p-6 border border-border">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input 
            type="text" 
            placeholder="Search by order #, name or email..." 
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-muted/30 border border-border pl-10 pr-4 py-2.5 text-xs focus:border-primary focus:outline-none transition-colors duration-300" 
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-muted/30 border border-border px-3 py-1.5">
            <Filter size={14} className="text-muted-foreground" />
            <select 
              value={statusFilter} 
              onChange={(e) => onStatusFilterChange(e.target.value as any)}
              className="bg-transparent text-[10px] font-bold uppercase tracking-widest focus:outline-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="DELIVERING">Delivering</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-muted/30 border border-border px-3 py-1.5">
            <Filter size={14} className="text-muted-foreground" />
            <select 
              value={paymentStatusFilter} 
              onChange={(e) => onPaymentStatusFilterChange(e.target.value as any)}
              className="bg-transparent text-[10px] font-bold uppercase tracking-widest focus:outline-none cursor-pointer"
            >
              <option value="">All Payments</option>
              <option value="PENDING">Unpaid</option>
              <option value="PAID">Paid</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>
        </div>
      </div>

      {selectedIdsCount > 0 && (
        <div className="flex items-center justify-between py-3 px-4 bg-primary/5 border border-primary/20 animate-in fade-in slide-in-from-top-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
            {selectedIdsCount} Orders Selected
          </span>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Bulk Action:</span>
            <div className="flex items-center gap-2">
              {['PROCESSING', 'DELIVERING', 'COMPLETED'].map((status) => (
                <button 
                  key={status}
                  onClick={() => onBulkUpdate(status as OrderStatus)}
                  disabled={bulkUpdating}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-foreground text-primary-foreground text-[9px] font-bold uppercase tracking-widest hover:bg-primary transition-colors disabled:opacity-50"
                >
                  {bulkUpdating ? <Loader2 size={10} className="animate-spin" /> : <Check size={10} />}
                  Mark {status.toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
