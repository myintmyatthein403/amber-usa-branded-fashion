import React from 'react';
import { Plus } from 'lucide-react';
import { useAdminUIStore } from '../../../store/useAdminUIStore';

interface UserHeaderProps {
  mode: 'customers' | 'staff';
  onAdd: () => void;
}

export const UserHeader: React.FC<UserHeaderProps> = ({ mode, onAdd }) => {
  const { user } = useAdminUIStore();
  const isSuperAdmin = user?.role === 'SUPERADMIN' || user?.roleName === 'SUPERADMIN';

  return (
    <div className="flex items-end justify-between">
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase leading-none">
          {mode === 'customers' ? 'Relationship Management' : 'System Administration'}
        </span>
        <h2 className="text-4xl font-serif text-foreground tracking-tight">
          {mode === 'customers' ? 'Customers & Members' : 'Staff Directory'}
        </h2>
      </div>
      {/* Hide Add Staff Member for non-superadmins */}
      {(mode === 'customers' || isSuperAdmin) && (
        <button 
          onClick={onAdd}
          className="flex items-center gap-3 bg-foreground text-primary-foreground px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-colors duration-300"
        >
          <Plus size={16} />
          {mode === 'customers' ? 'Add New Customer' : 'Add Staff Member'}
        </button>
      )}
    </div>
  );
};
