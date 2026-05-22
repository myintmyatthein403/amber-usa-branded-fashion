import React from 'react';
import { Role } from '../schema';
import { RoleCard } from './RoleCard';

interface RoleListProps {
  roles: Role[] | null;
  loading: boolean;
  onEdit: (role: Role) => void;
  onDelete: (id: string) => void;
}

export const RoleList: React.FC<RoleListProps> = ({
  roles,
  loading,
  onEdit,
  onDelete
}) => {
  if (loading) {
    return (
      <div className="col-span-3 py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic animate-pulse">
        Syncing RBAC Policy...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {(roles || []).map((role) => (
        <RoleCard
          key={role.id}
          role={role}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
