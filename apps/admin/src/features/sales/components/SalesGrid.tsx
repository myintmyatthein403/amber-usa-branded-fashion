import React from 'react';
import { Edit, Trash2, Tag, Calendar, DollarSign, Package, Percent } from 'lucide-react';
import { Sale } from '../schema';

interface SalesGridProps {
  sales: Sale[] | null;
  onEdit: (sale: Sale) => void;
  onDelete: (id: string) => void;
}

export const SalesGrid: React.FC<SalesGridProps> = ({ sales, onEdit, onDelete }) => {
  if (!sales || sales.length === 0) {
    return (
      <div className="col-span-full py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic">
        No sales campaigns found.
      </div>
    );
  }

  const isActive = (sale: Sale) => {
    if (!sale.isActive) return false;
    const now = new Date();
    if (sale.startDate && new Date(sale.startDate) > now) return false;
    if (sale.endDate && new Date(sale.endDate) < now) return false;
    return true;
  };

  const getStatus = (sale: Sale) => {
    if (!sale.isActive) return { label: 'Inactive', class: 'bg-muted text-muted-foreground' };
    const now = new Date();
    if (sale.startDate && new Date(sale.startDate) > now) return { label: 'Scheduled', class: 'bg-blue-500/10 text-blue-500' };
    if (sale.endDate && new Date(sale.endDate) < now) return { label: 'Expired', class: 'bg-muted text-muted-foreground' };
    return { label: 'Active', class: 'bg-green-500/10 text-green-500' };
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sales.map((sale) => {
        const status = getStatus(sale);
        return (
          <div 
            key={sale.id} 
            className="group bg-card border border-border p-6 shadow-sm hover:border-primary/30 transition-all duration-500 relative overflow-hidden"
          >
            <div className={`absolute top-0 left-0 w-1 h-full ${sale.isActive ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
            
            <div className="relative z-10 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary flex items-center justify-center">
                    <Tag size={20} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif text-foreground group-hover:text-primary transition-colors">{sale.name}</h3>
                    <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 ${status.class}`}>
                      {status.label}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => onEdit(sale)} className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-300 rounded">
                    <Edit size={14} />
                  </button>
                  <button onClick={() => onDelete(sale.id)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-300 rounded">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {sale.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">{sale.description}</p>
              )}

              <div className="flex items-center gap-4 pt-3 border-t border-border">
                <div className="flex items-center gap-2">
                  {sale.discountType === 'PERCENTAGE' ? <Percent size={14} className="text-primary" /> : <DollarSign size={14} className="text-primary" />}
                  <span className="text-lg font-mono font-bold text-foreground">
                    {sale.discountType === 'PERCENTAGE' ? `${sale.discountValue}%` : `$${sale.discountValue}`}
                  </span>
                </div>
                {sale.products && sale.products.length > 0 && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Package size={12} />
                    <span className="text-xs">{sale.products.length} products</span>
                  </div>
                )}
              </div>

              {(sale.startDate || sale.endDate) && (
                <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
                  <Calendar size={10} />
                  {sale.startDate && <span>{new Date(sale.startDate).toLocaleDateString()}</span>}
                  {sale.startDate && sale.endDate && <span>-</span>}
                  {sale.endDate && <span>{new Date(sale.endDate).toLocaleDateString()}</span>}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};