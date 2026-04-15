import React from 'react';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { CargoShipment, STATUS_CONFIG } from '../schema';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CargoTableProps {
  shipments: CargoShipment[] | null;
  loading: boolean;
  onOpenDetails: (id: string) => void;
}

export const CargoTable: React.FC<CargoTableProps> = ({ shipments, loading, onOpenDetails }) => {
  return (
    <div className="border border-border bg-card shadow-sm overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">Manifest ID</th>
            <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">Route</th>
            <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase text-center">Status</th>
            <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">Logistics Provider</th>
            <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase text-right">Options</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {loading ? (
            <tr><td colSpan={5} className="px-10 py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic animate-pulse">Synchronizing Supply Chain Data...</td></tr>
          ) : shipments?.length === 0 ? (
            <tr><td colSpan={5} className="px-10 py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic">No shipments in transit.</td></tr>
          ) : shipments?.map((s) => {
            const status = STATUS_CONFIG[s.status];
            return (
              <tr key={s.id} className="group hover:bg-muted/50 transition-colors duration-300">
                <td className="px-10 py-6">
                  <div className="space-y-1">
                    <div className="text-sm font-bold font-mono text-foreground tracking-tight">{s.shipmentNumber}</div>
                    <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                      Initiated {format(new Date(s.createdAt), 'MMM dd, yyyy')}
                    </div>
                  </div>
                </td>
                <td className="px-10 py-6">
                  <div className="flex items-center gap-3">
                     <div className="text-center">
                        <div className="text-[10px] font-bold text-blue-500 uppercase">{s.origin.location}</div>
                        <div className="text-xs font-medium">{s.origin.name.split(' ')[0]}</div>
                     </div>
                     <ArrowRight size={12} className="text-muted-foreground/30" />
                     <div className="text-center">
                        <div className="text-[10px] font-bold text-emerald-500 uppercase">{s.destination.location}</div>
                        <div className="text-xs font-medium">{s.destination.name.split(' ')[0]}</div>
                     </div>
                  </div>
                </td>
                <td className="px-10 py-6">
                  <div className="flex justify-center">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border",
                      status.color, status.bg, status.border
                    )}>
                      {React.createElement(status.icon, { size: 10 })}
                      {status.label}
                    </span>
                  </div>
                </td>
                <td className="px-10 py-6">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-foreground">{s.carrier || 'TBD'}</div>
                    <div className="text-[10px] font-mono text-muted-foreground/60">{s.trackingNumber || 'Pending Assignment'}</div>
                  </div>
                </td>
                <td className="px-10 py-6 text-right">
                  <button 
                    onClick={() => onOpenDetails(s.id)}
                    className="p-3 bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300 rounded-none border border-border group-hover:border-primary/30"
                  >
                    <ChevronRight size={16} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
