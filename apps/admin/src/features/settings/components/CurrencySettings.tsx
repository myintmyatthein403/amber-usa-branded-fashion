import React from 'react';
import { Settings as SettingsIcon, ExternalLink } from 'lucide-react';

interface CurrencySettingsProps {
  usdToMmkRate: string;
  rateUpdatedAt?: string | null;
  isManualOverride?: boolean;
}

export const CurrencySettings: React.FC<CurrencySettingsProps> = ({
  usdToMmkRate,
  rateUpdatedAt,
  isManualOverride,
}) => {
  const formattedRate = Number(usdToMmkRate || 0).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <div className="p-2 bg-primary/10 text-primary">
          <SettingsIcon size={20} />
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-foreground">Currency & Exchange Rate</h3>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Live USD→MMK rate from Currency Management (read-only here).</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-card border border-border p-8">
        <div className="space-y-4">
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground block">USD to MMK Exchange Rate</label>
          <div className="flex items-center gap-4">
            <div className="text-2xl font-serif text-muted-foreground">1 USD =</div>
            <input
              type="text"
              value={formattedRate}
              disabled
              readOnly
              className="flex-1 h-12 border-b border-input bg-muted/30 px-2 py-2 text-2xl font-mono text-foreground cursor-not-allowed rounded-none opacity-90"
            />
            <div className="text-2xl font-serif">MMK</div>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {isManualOverride && (
              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 text-[9px] font-bold uppercase tracking-wider">Manual</span>
            )}
            {rateUpdatedAt && (
              <span className="text-[9px] text-muted-foreground">
                Rate updated {new Date(rateUpdatedAt).toLocaleString()}
              </span>
            )}
          </div>
          <a
            href="/currencies"
            className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-primary hover:underline mt-2"
          >
            Manage in Currency Management
            <ExternalLink size={12} />
          </a>
          <p className="text-[9px] text-muted-foreground italic mt-2">* This rate is used to convert product prices for Myanmar customers. Edit the USD→MMK pair under Currency Management.</p>
        </div>
      </div>
    </div>
  );
};
