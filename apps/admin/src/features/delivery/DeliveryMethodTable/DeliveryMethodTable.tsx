import React from 'react';
import { Truck, Edit2, Trash2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { DeliveryMethod } from '../schema';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DeliveryMethodTableProps {
  methods: DeliveryMethod[] | null;
  loading: boolean;
  onEdit: (method: DeliveryMethod) => void;
  onDelete: (id: string) => void;
}

export const DeliveryMethodTable: React.FC<DeliveryMethodTableProps> = ({ 
  methods, 
  loading, 
  onEdit, 
  onDelete 
}) => {
  return (
    <div className="border border-border bg-card shadow-sm overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">Method Name</th>
            <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">Estimated Time</th>
            <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase text-center">Status</th>
            <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase text-center">Price</th>
            <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase text-right">Options</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {loading ? (
            <tr><td colSpan={5} className="px-10 py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic animate-pulse">Syncing Logistics Data...</td></tr>
          ) : !methods || methods.length === 0 ? (
            <tr><td colSpan={5} className="px-10 py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic">No delivery methods defined.</td></tr>
          ) : (
            methods.map((method) => (
              <tr key={method.id} className="group hover:bg-muted/30 transition-colors duration-300">
                <td className="px-10 py-6">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-secondary flex items-center justify-center border border-border">
                      <Truck size={20} className="text-primary" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-lg font-serif text-foreground tracking-wide">{method.name}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-widest line-clamp-1 max-w-[200px]">{method.description || 'No description provided'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-10 py-6">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {method.estimatedDays || 'Not specified'}
                  </span>
                </td>
                <td className="px-10 py-6 text-center">
                  <span className={cn(
                    "text-[9px] font-bold uppercase tracking-widest px-2 py-1 border",
                    method.isActive ? "border-emerald-500/20 text-emerald-500 bg-emerald-50/10" : "border-amber-500/20 text-amber-500 bg-amber-50/10"
                  )}>
                    {method.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-10 py-6 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-sm font-bold text-foreground tracking-tight">
                      {method.price.toLocaleString()} {method.isUsdPrice ? 'USD' : 'MMK'}
                    </span>
                    {method.freeOverAmount && method.freeOverAmount > 0 && (
                      <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-widest">
                        Free over {method.freeOverAmount.toLocaleString()}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-10 py-6 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button onClick={() => onEdit(method)} className="p-2.5 text-muted-foreground hover:text-foreground transition-colors duration-300">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => onDelete(method.id)} className="p-2.5 text-muted-foreground hover:text-destructive transition-colors duration-300">
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
