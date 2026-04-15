import React from 'react';
import { Plus } from 'lucide-react';

interface FooterHeaderProps {
  onAdd: () => void;
}

export const FooterHeader: React.FC<FooterHeaderProps> = ({ onAdd }) => {
  return (
    <div className="flex items-end justify-between">
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase leading-none">Website Experience</span>
        <h2 className="text-4xl font-serif text-foreground tracking-tight">Footer Settings</h2>
      </div>
      <button 
        onClick={onAdd}
        className="flex items-center gap-3 bg-foreground text-primary-foreground px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all duration-300 shadow-xl shadow-black/5"
      >
        <Plus size={18} /> New Design
      </button>
    </div>
  );
};
