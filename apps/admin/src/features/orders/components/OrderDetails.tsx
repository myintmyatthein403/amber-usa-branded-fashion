import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Truck, 
  Package, 
  MapPin, 
  User, 
  Phone, 
  Mail,
  ArrowRight,
  CreditCard,
  Loader2
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';
import { Order, OrderStatus } from '../schema';
import { STATUS_CONFIG, PAYMENT_STATUS_CONFIG } from '../constants';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface OrderDetailsProps {
  order: Order;
  onUpdateStatus: (id: string, status: OrderStatus) => void;
  updatingStatus: boolean;
}

export const OrderDetails: React.FC<OrderDetailsProps> = ({
  order,
  onUpdateStatus,
  updatingStatus
}) => {
  const status = STATUS_CONFIG[order.status];
  const payment = PAYMENT_STATUS_CONFIG[order.paymentStatus];

  return (
    <div className="space-y-8 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between gap-6 pb-8 border-b border-border">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h3 className="text-2xl font-serif text-foreground">Order #{order.orderNumber}</h3>
            <div className={cn("px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest border", status.bg, status.color, status.border)}>
              {status.label}
            </div>
          </div>
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <Clock size={12} /> Placed on {format(new Date(order.createdAt), 'MMMM dd, yyyy at HH:mm')}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mr-2">Update Status:</span>
          <div className="flex flex-wrap gap-2">
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <button
                key={key}
                disabled={updatingStatus || order.status === key}
                onClick={() => onUpdateStatus(order.id, key as OrderStatus)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-[9px] font-bold uppercase tracking-widest border transition-all duration-300",
                  order.status === key 
                    ? "bg-foreground text-primary-foreground border-foreground opacity-100" 
                    : "bg-transparent text-muted-foreground border-border hover:border-primary hover:text-primary"
                )}
              >
                {updatingStatus && order.status !== key ? <Loader2 size={10} className="animate-spin" /> : <config.icon size={10} />}
                {config.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Customer & Shipping */}
        <div className="lg:col-span-2 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground border-b border-border pb-3 flex items-center gap-2">
                <User size={14} /> Customer Information
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary">
                    <User size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">{order.user?.name || 'Guest Customer'}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">{order.userId ? `ID: ${order.userId}` : 'Unregistered User'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground py-1">
                  <Mail size={14} /> {order.user?.email || 'No email provided'}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground py-1">
                  <Phone size={14} /> No phone provided
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground border-b border-border pb-3 flex items-center gap-2">
                <MapPin size={14} /> Logistics & Delivery
              </h4>
              <div className="space-y-3">
                <div className="text-xs text-foreground leading-relaxed font-medium bg-muted/20 p-4 border border-border italic">
                  {order.shippingAddress}
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary pt-2">
                  <Truck size={14} /> Standard Shipping Method
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground border-b border-border pb-3 flex items-center gap-2">
              <Package size={14} /> Manifest ({order.items.length} Items)
            </h4>
            <div className="border border-border overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/10 border-b border-border">
                    <th className="p-4 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Product</th>
                    <th className="p-4 text-[9px] font-bold uppercase tracking-widest text-muted-foreground text-center">Qty</th>
                    <th className="p-4 text-[9px] font-bold uppercase tracking-widest text-muted-foreground text-right">Price</th>
                    <th className="p-4 text-[9px] font-bold uppercase tracking-widest text-muted-foreground text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {order.items.map((item) => (
                    <tr key={item.id} className="group hover:bg-muted/5 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-16 bg-secondary overflow-hidden border border-border">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-foreground">{item.name}</div>
                            {item.size && <div className="text-[9px] font-bold text-primary uppercase tracking-widest mt-1">Size: {item.size}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-xs font-mono font-bold">x{item.quantity}</span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="text-xs font-mono">{item.isUsd ? '$' : 'Ks'}{item.price.toLocaleString()}</span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="text-xs font-mono font-bold">{item.isUsd ? '$' : 'Ks'}{(item.price * item.quantity).toLocaleString()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="space-y-6">
          <div className="bg-card border border-border p-6 space-y-6 shadow-sm">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground border-b border-border pb-4 flex items-center gap-2">
              <CreditCard size={14} /> Settlement Summary
            </h4>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-medium">Subtotal</span>
                <span className="font-mono">{order.currency} {order.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-medium">Shipping</span>
                <span className="font-mono text-emerald-600">FREE</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-medium">Tax</span>
                <span className="font-mono">{order.currency} 0</span>
              </div>
              <div className="pt-4 border-t border-border flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">Final Total</span>
                <span className="text-lg font-mono font-bold text-primary">{order.currency} {order.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-6 border-t border-border space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Payment Method:</span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-foreground">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Settlement:</span>
                <div className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest border", payment.bg, payment.color, payment.border)}>
                  <payment.icon size={8} />
                  {payment.label}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-muted/10 border border-border p-6 space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
              <ArrowRight size={14} /> Internal Logistics
            </h4>
            <p className="text-[10px] text-muted-foreground leading-relaxed italic">
              Order fulfillment state is synchronized with central inventory clusters. Any modification to status triggers automated customer notifications.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
