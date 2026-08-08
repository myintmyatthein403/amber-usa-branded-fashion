import React from 'react';
import { Banknote } from 'lucide-react';

interface CodSettingsProps {
  formData: any;
  onUpdate: (field: string, value: string) => void;
}

export const CodSettings: React.FC<CodSettingsProps> = ({
  formData,
  onUpdate,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <div className="p-2 bg-primary/10 text-primary">
          <Banknote size={20} />
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground">Cash on Delivery Deposit</h3>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Upfront amount required before dispatching a COD order.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 bg-card border border-border p-8">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground block">COD Deposit Amount (MMK)</label>
          <input
            type="number"
            min={0}
            value={formData.codDepositAmount}
            onChange={(e) => onUpdate('codDepositAmount', e.target.value)}
            className="w-full h-12 border-b border-input bg-transparent px-0 py-2 font-mono text-sm focus:border-primary focus:outline-none transition-colors duration-300 rounded-none"
            placeholder="e.g. 10000"
          />
          <p className="text-[9px] text-muted-foreground/60">
            Leave blank to disable deposits for Cash on Delivery orders — customers will continue to pay nothing upfront.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground block">
            Require Deposit For Customers With Fewer Than ___ Past Orders
          </label>
          <input
            type="number"
            min={0}
            value={formData.codDepositOrderThreshold}
            onChange={(e) => onUpdate('codDepositOrderThreshold', e.target.value)}
            className="w-full h-12 border-b border-input bg-transparent px-0 py-2 font-mono text-sm focus:border-primary focus:outline-none transition-colors duration-300 rounded-none"
            placeholder="e.g. 3"
          />
          <p className="text-[9px] text-muted-foreground/60">
            Only customers with fewer than this many past paid orders (including new customers with none) will be charged the COD deposit above. Repeat customers at or above this count pay nothing upfront. Both fields must be set for the deposit to apply — leave either blank to disable.
          </p>
        </div>
      </div>
    </div>
  );
};
