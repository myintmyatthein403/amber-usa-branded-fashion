import React from 'react';
import { Ticket, Hash, Calendar, CheckCircle2, XCircle, Edit2, Trash2 } from 'lucide-react';
import { Coupon } from '../schema';

interface CouponTableProps {
  coupons: Coupon[] | null;
  loading: boolean;
  onEdit: (coupon: Coupon) => void;
  onDelete: (id: string) => void;
}

export const CouponTable: React.FC<CouponTableProps> = ({ 
  coupons, 
  loading, 
  onEdit, 
  onDelete 
}) => {
  return (
    <div className="border border-border bg-card shadow-sm overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">Coupon Code</th>
            <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">Benefit</th>
            <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">Usage / Expiry</th>
            <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase text-center">Status</th>
            <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase text-right">Options</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {loading ? (
            <tr><td colSpan={5} className="px-10 py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic animate-pulse">Querying Coupon Repository...</td></tr>
          ) : !coupons || coupons.length === 0 ? (
            <tr><td colSpan={5} className="px-10 py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic">No coupons found.</td></tr>
          ) : (
            coupons.map((coupon) => (
              <tr key={coupon.id} className="group hover:bg-muted/50 transition-colors duration-300">
                <td className="px-10 py-6">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-secondary border border-border flex items-center justify-center">
                      <Ticket size={18} className="text-primary/40" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-lg font-serif text-foreground tracking-wide uppercase">{coupon.code}</div>
                      <div className="text-[9px] font-mono text-muted-foreground/40 uppercase tracking-widest max-w-[200px] truncate">
                        {coupon.description || "NO DESCRIPTION"}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-10 py-6">
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-foreground">
                      {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}% OFF` : `$${coupon.discountValue} OFF`}
                    </div>
                    {coupon.minOrderAmount && (
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Min order: ${coupon.minOrderAmount}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-10 py-6">
                  <div className="space-y-1 text-[10px] uppercase tracking-wider">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Hash size={10} /> {coupon.usedCount} / {coupon.usageLimit || '∞'} USED
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar size={10} /> {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString() : 'NO EXPIRY'}
                    </div>
                  </div>
                </td>
                <td className="px-10 py-6 text-center">
                  <div className="flex justify-center">
                    {coupon.isActive ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wider">
                        <CheckCircle2 size={12} /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                        <XCircle size={12} /> Inactive
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-10 py-6 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button 
                      onClick={() => onEdit(coupon)}
                      className="p-2.5 text-muted-foreground hover:text-foreground transition-colors duration-300"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => onDelete(coupon.id)}
                      className="p-2.5 text-muted-foreground hover:text-destructive transition-colors duration-300"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
