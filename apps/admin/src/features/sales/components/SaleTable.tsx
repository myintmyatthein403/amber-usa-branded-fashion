import React from 'react';
import { Tag, Trash2, Edit2, Calendar, Percent, Banknote, CheckCircle2, XCircle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Sale } from '../schema';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SaleTableProps {
  sales: Sale[] | null;
  onEdit: (sale: Sale) => void;
  onDelete: (id: string) => void;
}

export const SaleTable: React.FC<SaleTableProps> = ({ sales, onEdit, onDelete }) => {
  if (!sales || sales.length === 0) {
    return (
      <div className="py-24 text-center border border-dashed border-border bg-card/50">
        <div className="inline-flex p-4 rounded-full bg-secondary mb-4">
          <Tag className="w-8 h-8 text-muted-foreground/40" />
        </div>
        <p className="text-sm text-muted-foreground font-serif italic">No sales campaigns registered.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {sales.map((sale) => (
        <div key={sale.id} className="group relative bg-card border border-border p-8 transition-all duration-500 hover:shadow-2xl hover:shadow-black/5 hover:border-primary/20">
          <div className="flex justify-between items-start mb-6">
            <div className={cn(
              "p-3 rounded-none border",
              sale.isActive ? "bg-primary/10 border-primary/20 text-primary" : "bg-muted border-border text-muted-foreground"
            )}>
              {sale.discountType === 'PERCENTAGE' ? <Percent size={20} /> : <Banknote size={20} />}
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => onEdit(sale)} className="p-2 text-muted-foreground hover:text-foreground transition-colors"><Edit2 size={16} /></button>
              <button onClick={() => onDelete(sale.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={16} /></button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-serif text-foreground line-clamp-1">{sale.name}</h3>
              <p className="text-[10px] font-mono text-muted-foreground mt-1 uppercase tracking-widest">{sale.slug}</p>
            </div>
            
            <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px]">
              {sale.description || 'No description provided for this campaign.'}
            </p>

            <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-border">
              <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Discount</span>
                <div className="text-sm font-bold text-foreground">
                  {sale.discountType === 'PERCENTAGE' ? `${sale.discountValue}% Off` : `$${sale.discountValue} Off`}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Status</span>
                <div className="flex items-center gap-1.5">
                  {sale.isActive ? (
                    <><CheckCircle2 size={12} className="text-emerald-500" /><span className="text-[9px] font-bold uppercase tracking-widest text-emerald-500">Live</span></>
                  ) : (
                    <><XCircle size={12} className="text-rose-500" /><span className="text-[9px] font-bold uppercase tracking-widest text-rose-500">Inactive</span></>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <Calendar size={14} className="text-primary/40" />
                {sale.startDate ? new Date(sale.startDate).toLocaleDateString() : 'No Start'} 
                <span className="opacity-30 mx-1">—</span> 
                {sale.endDate ? new Date(sale.endDate).toLocaleDateString() : 'No End'}
              </div>
              <div className="text-[10px] font-bold text-primary uppercase tracking-widest">
                {sale.products?.length || 0} items
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
