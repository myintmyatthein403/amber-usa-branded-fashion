import React from 'react';
import { Plus } from 'lucide-react';

interface RoleHeaderProps {
  onAdd: () => void;
}

export const RoleHeader: React.FC<RoleHeaderProps> = ({ onAdd }) => {
  return (
    <div className="flex items-end justify-between">
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase leading-none">Security</span>
        <h2 className="text-4xl font-serif text-foreground tracking-tight">Roles & Permissions</h2>
      </div>
      <button 
        onClick={onAdd}
        className="flex items-center gap-3 bg-foreground text-primary-foreground px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-colors duration-300"
      >
        <Plus size={16} />
        Define New Role
      </button>
    </div>
  );
};
