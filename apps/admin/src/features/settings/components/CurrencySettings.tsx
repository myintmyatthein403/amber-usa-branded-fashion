import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';

interface CurrencySettingsProps {
  usdToMmkRate: string;
  onUpdate: (value: string) => void;
}

export const CurrencySettings: React.FC<CurrencySettingsProps> = ({
  usdToMmkRate,
  onUpdate,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <div className="p-2 bg-primary/10 text-primary">
          <SettingsIcon size={20} />
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground">Currency & Exchange Rate</h3>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Manage store currency conversion for Myanmar Market.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-card border border-border p-8">
        <div className="space-y-4">
           <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground block">USD to MMK Exchange Rate</label>
           <div className="flex items-center gap-4">
              <div className="text-2xl font-serif text-muted-foreground">1 USD =</div>
              <input 
                type="number" 
                value={usdToMmkRate} 
                onChange={(e) => onUpdate(e.target.value)}
                className="flex-1 h-12 border-b border-input bg-transparent px-0 py-2 text-2xl font-mono focus:border-primary focus:outline-none transition-colors duration-300 rounded-none" 
                placeholder="3500"
              />
              <div className="text-2xl font-serif">MMK</div>
           </div>
           <p className="text-[9px] text-muted-foreground italic mt-2">* This rate will be used to automatically convert product prices for Myanmar customers.</p>
        </div>
      </div>
    </div>
  );
};
