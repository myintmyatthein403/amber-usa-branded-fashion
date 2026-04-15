import React from 'react';
import { CreditCard, Edit2, Trash2, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { GiftCard } from '../schema';

interface GiftCardTableProps {
  giftCards: GiftCard[] | null;
  loading: boolean;
  onEdit: (card: GiftCard) => void;
  onDelete: (id: string) => void;
}

export const GiftCardTable: React.FC<GiftCardTableProps> = ({ 
  giftCards, 
  loading, 
  onEdit, 
  onDelete 
}) => {
  return (
    <div className="border border-border bg-card shadow-sm overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">Card Identity</th>
            <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">Balance Status</th>
            <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">Validity</th>
            <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase text-center">Status</th>
            <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase text-right">Options</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {loading ? (
            <tr><td colSpan={5} className="px-10 py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic animate-pulse">Querying Gift Card Repository...</td></tr>
          ) : !giftCards || giftCards.length === 0 ? (
            <tr><td colSpan={5} className="px-10 py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic">No gift cards found.</td></tr>
          ) : (
            giftCards.map((card) => (
              <tr key={card.id} className="group hover:bg-muted/50 transition-colors duration-300">
                <td className="px-10 py-6">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-secondary border border-border flex items-center justify-center">
                      <CreditCard size={18} className="text-primary/40" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-lg font-serif text-foreground tracking-wide uppercase font-mono">{card.code}</div>
                      <div className="text-[9px] font-mono text-muted-foreground/40 uppercase tracking-widest max-w-[200px] truncate">
                        {card.note || "NO INTERNAL NOTES"}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-10 py-6">
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-foreground">
                      ${card.currentBalance.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      Original: ${card.initialBalance.toFixed(2)}
                    </div>
                  </div>
                </td>
                <td className="px-10 py-6">
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-wider">
                    <Calendar size={10} /> {card.expiryDate ? new Date(card.expiryDate).toLocaleDateString() : 'NO EXPIRY'}
                  </div>
                </td>
                <td className="px-10 py-6 text-center">
                  <div className="flex justify-center">
                    {card.isActive ? (
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
                      onClick={() => onEdit(card)}
                      className="p-2.5 text-muted-foreground hover:text-foreground transition-colors duration-300"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => onDelete(card.id)}
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
