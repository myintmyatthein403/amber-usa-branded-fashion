import React from 'react';
import { Edit, Trash2, Truck, Clock, DollarSign, Globe } from 'lucide-react';
import { DeliveryMethod } from './schema';

interface DeliveryMethodCardProps {
  methods: DeliveryMethod[] | null;
  onEdit: (method: DeliveryMethod) => void;
  onDelete: (id: string) => void;
}

export const DeliveryMethodGrid: React.FC<DeliveryMethodCardProps> = ({ methods, onEdit, onDelete }) => {
  if (!methods || methods.length === 0) {
    return (
      <div className="col-span-full py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic">
        No delivery methods configured.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {methods.map((method) => (
        <div 
          key={method.id} 
          className="group bg-card border border-border p-6 shadow-sm hover:border-primary/30 transition-all duration-500 relative overflow-hidden"
        >
          <div className={`absolute top-0 left-0 w-1 h-full ${method.isActive ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
          
          <div className="relative z-10 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary flex items-center justify-center">
                  {method.logoUrl ? (
                    <img src={method.logoUrl} className="w-full h-full object-contain p-1" />
                  ) : (
                    <Truck size={20} className="text-muted-foreground" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-serif text-foreground group-hover:text-primary transition-colors">{method.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    {method.isDigital && (
                      <span className="text-[8px] font-bold uppercase tracking-widest bg-blue-500/10 text-blue-500 px-2 py-0.5">Digital</span>
                    )}
                    <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 ${method.isActive ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'}`}>
                      {method.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => onEdit(method)} className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-300 rounded">
                  <Edit size={14} />
                </button>
                <button onClick={() => onDelete(method.id)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-300 rounded">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {method.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">{method.description}</p>
            )}

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-[9px] text-muted-foreground uppercase tracking-widest">
                  <DollarSign size={10} /> Base Price
                </div>
                <div className="text-sm font-mono font-bold text-foreground">
                  {method.isUsdPrice ? '$' : 'Ks '}{method.price.toLocaleString()}
                </div>
              </div>
              {method.estimatedDays && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-[9px] text-muted-foreground uppercase tracking-widest">
                    <Clock size={10} /> Est. Delivery
                  </div>
                  <div className="text-sm font-mono font-bold text-foreground">{method.estimatedDays}</div>
                </div>
              )}
            </div>

            {method.locationPrices && Object.keys(method.locationPrices).length > 0 && (
              <div className="pt-3 border-t border-border">
                <div className="text-[9px] text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1">
                  <Globe size={10} /> Location Pricing
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(method.locationPrices).map(([loc, price]) => (
                    <span key={loc} className="text-[9px] font-mono bg-secondary px-2 py-1 border border-border">
                      {loc}: {method.isUsdPrice ? '$' : 'Ks '}{price.toLocaleString()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {method.freeOverAmount && (
              <div className="text-[9px] text-muted-foreground bg-muted/50 px-3 py-2 rounded">
                Free shipping over {method.isUsdPrice ? '$' : 'Ks '}{method.freeOverAmount.toLocaleString()}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};