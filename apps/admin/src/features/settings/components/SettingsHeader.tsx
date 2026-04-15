import React from 'react';
import { Save, Loader2 } from 'lucide-react';

interface SettingsHeaderProps {
  onSave: () => void;
  submitting: boolean;
  success: boolean;
}

export const SettingsHeader: React.FC<SettingsHeaderProps> = ({
  onSave,
  submitting,
  success,
}) => {
  return (
    <div className="flex items-end justify-between">
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase leading-none">Global Configuration</span>
        <h2 className="text-4xl font-serif text-foreground tracking-tight">Store Settings & Policies</h2>
      </div>
      <button 
        onClick={onSave}
        disabled={submitting}
        className="flex items-center gap-3 bg-foreground text-primary-foreground px-10 py-3.5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all duration-300 shadow-xl shadow-black/5 disabled:opacity-50"
      >
        {submitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
        {success ? 'Configuration Synced' : 'Sync Changes'}
      </button>
    </div>
  );
};
