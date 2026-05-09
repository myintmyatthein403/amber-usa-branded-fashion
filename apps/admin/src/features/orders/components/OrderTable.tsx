import React from 'react';
import { 
  Eye, 
  Trash2, 
  ArrowUpDown,
  MoreHorizontal
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';
import { Order } from '../schema';
import { STATUS_CONFIG, PAYMENT_STATUS_CONFIG } from '../constants';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface OrderTableProps {
  orders: Order[];
  selectedIds: string[];
  onSelect: (id: string) => void;
  onSelectAll: () => void;
  onViewDetails: (order: Order) => void;
  onDelete: (id: string) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
}

export const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  selectedIds,
  onSelect,
  onSelectAll,
  onViewDetails,
  onDelete,
  sortBy,
  sortOrder,
  onSort
}) => {
  return (
    <div className="bg-card border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/5">
              <th className="p-4 w-10">
                <input 
                  type="checkbox" 
                  checked={orders.length > 0 && selectedIds.length === orders.length}
                  onChange={onSelectAll}
                  className="w-4 h-4 accent-primary cursor-pointer"
                />
              </th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground cursor-pointer group" onClick={() => onSort('orderNumber')}>
                <div className="flex items-center gap-2">
                  Reference {sortBy === 'orderNumber' && <ArrowUpDown size={12} className="text-primary" />}
                </div>
              </th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground cursor-pointer" onClick={() => onSort('createdAt')}>
                <div className="flex items-center gap-2">
                  Date {sortBy === 'createdAt' && <ArrowUpDown size={12} className="text-primary" />}
                </div>
              </th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Customer</th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground cursor-pointer text-right" onClick={() => onSort('totalAmount')}>
                <div className="flex items-center justify-end gap-2">
                  Total {sortBy === 'totalAmount' && <ArrowUpDown size={12} className="text-primary" />}
                </div>
              </th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Payment</th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((order) => {
              const status = STATUS_CONFIG[order.status];
              const payment = PAYMENT_STATUS_CONFIG[order.paymentStatus];
              
              return (
                <tr key={order.id} className="group hover:bg-muted/5 transition-colors duration-300">
                  <td className="p-4">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(order.id!)}
                      onChange={() => onSelect(order.id!)}
                      className="w-4 h-4 accent-primary cursor-pointer"
                    />
                  </td>
                  <td className="p-4">
                    <span className="text-xs font-mono font-bold text-foreground">#{order.orderNumber}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-[10px] font-medium text-muted-foreground">{order.createdAt ? format(new Date(order.createdAt), 'MMM dd, yyyy HH:mm') : 'N/A'}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-foreground">{order.user?.name || 'Guest'}</span>
                      <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">{order.user?.email || 'No email provided'}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <span className="text-xs font-mono font-bold text-foreground">{order.currency} {order.totalAmount.toLocaleString()}</span>
                  </td>
                  <td className="p-4">
                    <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest border", status.bg, status.color, status.border)}>
                      <status.icon size={10} />
                      {status.label}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest border", payment.bg, payment.color, payment.border)}>
                      <payment.icon size={10} />
                      {payment.label}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => onViewDetails(order)}
                        className="p-2 text-muted-foreground hover:text-primary transition-colors duration-300"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => order.id && onDelete(order.id)}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors duration-300"
                        title="Delete Order"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
