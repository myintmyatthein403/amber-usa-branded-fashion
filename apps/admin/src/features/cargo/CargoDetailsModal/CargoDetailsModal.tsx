import React from 'react';
import { Truck, MapPin, Package, AlertTriangle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { CargoShipment, STATUS_CONFIG } from '../schema';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CargoDetailsModalProps {
  selectedShipment: CargoShipment | null;
  updating: boolean;
  onUpdateStatus: (id: string, status: string) => void;
}

export const CargoDetailsModal: React.FC<CargoDetailsModalProps> = ({
  selectedShipment,
  updating,
  onUpdateStatus
}) => {
  if (!selectedShipment) return null;

  return (
    <div className="space-y-10 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className={cn(
         "p-8 border flex items-center justify-between",
         STATUS_CONFIG[selectedShipment.status].bg,
         STATUS_CONFIG[selectedShipment.status].border
       )}>
          <div className="flex items-center gap-6">
             <div className="p-4 bg-white/50 backdrop-blur-sm border border-inherit">
                {React.createElement(STATUS_CONFIG[selectedShipment.status].icon, { size: 24, className: STATUS_CONFIG[selectedShipment.status].color })}
             </div>
             <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground mb-1">Logistics Lifecycle State</div>
                <div className={cn("text-2xl font-serif", STATUS_CONFIG[selectedShipment.status].color)}>
                  {STATUS_CONFIG[selectedShipment.status].label}
                </div>
             </div>
          </div>

          <div className="flex items-center gap-4">
             {selectedShipment.status !== 'COMPLETED' && (
               <select 
                 value={selectedShipment.status}
                 onChange={(e) => onUpdateStatus(selectedShipment.id, e.target.value)}
                 disabled={updating}
                 className="h-12 bg-white border border-border px-4 text-[10px] font-bold uppercase tracking-widest focus:border-primary focus:outline-none cursor-pointer disabled:opacity-50"
               >
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
               </select>
             )}
             {updating && <Loader2 size={16} className="animate-spin text-primary" />}
          </div>
       </div>

       {selectedShipment.status === 'READY_FOR_DISTRIBUTION' && (
         <div className="p-6 bg-amber-50 border border-amber-200 flex items-start gap-4">
            <AlertTriangle className="text-amber-500 shrink-0" size={20} />
            <div className="space-y-1">
               <p className="text-sm font-bold text-amber-900 uppercase tracking-tight">Final Sync Required</p>
               <p className="text-xs text-amber-700 leading-relaxed">
                  Changing status to <strong>"Inventory Synced"</strong> will automatically inject all manifest items into the <strong>{selectedShipment.destination.name}</strong> stock ledger. This action is irreversible.
               </p>
            </div>
         </div>
       )}

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-8">
             <div className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary flex items-center gap-2">
                  <MapPin size={14} /> Logistics Routing
                </h4>
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-muted/30 p-5 border border-border">
                      <div className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Origin (Source)</div>
                      <div className="text-sm font-bold">{selectedShipment.origin.name}</div>
                      <div className="text-[10px] font-medium text-muted-foreground uppercase">{selectedShipment.origin.location}</div>
                   </div>
                   <div className="bg-muted/30 p-5 border border-border">
                      <div className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Destination (Sink)</div>
                      <div className="text-sm font-bold">{selectedShipment.destination.name}</div>
                      <div className="text-[10px] font-medium text-muted-foreground uppercase">{selectedShipment.destination.location}</div>
                   </div>
                </div>
             </div>

             <div className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary flex items-center gap-2">
                  <Truck size={14} /> Carrier Protocol
                </h4>
                <div className="bg-muted/30 p-5 border border-border space-y-4">
                   <div className="flex justify-between items-end border-b border-border pb-4">
                      <div>
                         <div className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Lead Carrier</div>
                         <div className="text-sm font-bold">{selectedShipment.carrier || 'PENDING'}</div>
                      </div>
                      <div className="text-right">
                         <div className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Tracking ID</div>
                         <div className="text-sm font-mono font-bold text-primary">{selectedShipment.trackingNumber || 'UNASSIGNED'}</div>
                      </div>
                   </div>
                   <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest leading-relaxed">
                      Log: {format(new Date(selectedShipment.createdAt), 'EEEE, MMMM dd, yyyy @ HH:mm')}
                   </div>
                </div>
             </div>
          </div>

          <div className="space-y-4">
             <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary flex items-center gap-2">
               <Package size={14} /> Manifest Items ({selectedShipment.items?.length || 0})
             </h4>
             <div className="border border-border max-h-[400px] overflow-y-auto">
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="bg-muted/50 border-b border-border sticky top-0 z-10">
                         <th className="px-4 py-3 text-[9px] font-bold uppercase text-muted-foreground">Product Detail</th>
                         <th className="px-4 py-3 text-[9px] font-bold uppercase text-muted-foreground text-center">QTY</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-border">
                      {selectedShipment.items?.map((item: any) => (
                        <tr key={item.id} className="bg-card">
                           <td className="px-4 py-3">
                              <div className="text-xs font-bold">{item.variant.product.name}</div>
                              <div className="text-[9px] font-mono text-muted-foreground uppercase">{item.variant.sku} / {item.variant.size} - {item.variant.color}</div>
                           </td>
                           <td className="px-4 py-3 text-center">
                              <span className="text-xs font-mono font-bold px-2 py-1 bg-secondary border border-border">
                                 {item.quantity}
                              </span>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
       </div>
    </div>
  );
};
