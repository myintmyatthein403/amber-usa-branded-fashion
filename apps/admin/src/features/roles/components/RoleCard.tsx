import React from 'react';
import { Shield, Lock, Users, CheckCircle2, Edit2, Trash2 } from 'lucide-react';
import { Role, AVAILABLE_PERMISSIONS } from '../schema';

interface RoleCardProps {
  role: Role;
  onEdit: (role: Role) => void;
  onDelete: (id: string) => void;
}

export const RoleCard: React.FC<RoleCardProps> = ({ 
  role, 
  onEdit, 
  onDelete 
}) => {
  const getPermissionLabel = (id: string) => {
    for (const cat of AVAILABLE_PERMISSIONS) {
      const item = cat.items.find(i => i.id === id);
      if (item) return item.label;
    }
    return id;
  };

  return (
    <div className="border border-border bg-card shadow-sm flex flex-col group relative">
      <div className="p-8 border-b border-border space-y-4">
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-2 ${role.color}`}>
            <Shield size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">{role.name}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-secondary rounded-full border border-border">
            <Users size={10} className="text-muted-foreground" />
            <span className="text-[10px] font-bold text-foreground">
              {role._count?.users || 0}
            </span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed italic">
          "{role.description || 'No description provided'}"
        </p>
      </div>
      
      <div className="p-8 flex-1 space-y-6">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Capabilities</span>
        <ul className="space-y-4">
          {role.permissions?.map((permission, i) => (
            <li key={i} className="flex items-start gap-3">
              <CheckCircle2 size={14} className="text-primary mt-0.5" />
              <span className="text-xs font-medium text-foreground/80 leading-tight">
                {getPermissionLabel(permission)}
              </span>
            </li>
          ))}
          {(!role.permissions || role.permissions.length === 0) && (
            <li className="text-xs text-muted-foreground italic">No specific permissions defined</li>
          )}
        </ul>
      </div>

      <div className="p-8 bg-muted/30 border-t border-border mt-auto flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {role.isImmutable ? <Lock size={10} /> : <Shield size={10} />}
          <span>{role.isImmutable ? 'System Immutable Role' : 'Custom Defined Role'}</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onEdit(role)}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Edit2 size={14} />
          </button>
          {!role.isImmutable && (
            <button 
              onClick={() => onDelete(role.id)}
              className="p-2 text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
