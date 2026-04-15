import { 
  Clock, 
  Package, 
  Truck, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { OrderStatus, PaymentStatus } from './schema';

export const STATUS_CONFIG: Record<OrderStatus, { label: string; icon: any; color: string; bg: string; border: string }> = {
  PENDING: { label: 'Pending', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  PROCESSING: { label: 'Processing', icon: Package, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  DELIVERING: { label: 'Delivering', icon: Truck, color: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
  COMPLETED: { label: 'Completed', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  CANCELLED: { label: 'Cancelled', icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  REFUNDED: { label: 'Refunded', icon: ArrowRight, color: 'text-slate-500', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
};

export const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { label: string; icon: any; color: string; bg: string; border: string }> = {
  PENDING: { label: 'Unpaid', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-600/10', border: 'border-amber-600/20' },
  PAID: { label: 'Paid', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-600/10', border: 'border-emerald-600/20' },
  FAILED: { label: 'Failed', icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-600/10', border: 'border-rose-600/20' },
  REFUNDED: { label: 'Refunded', icon: ArrowRight, color: 'text-slate-600', bg: 'bg-slate-600/10', border: 'border-slate-600/20' },
};
