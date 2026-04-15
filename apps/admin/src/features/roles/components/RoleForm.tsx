import React from 'react';
import { Loader2 } from 'lucide-react';
import { CreateRoleInput, AVAILABLE_PERMISSIONS, Role } from '../schema';
import { cn } from '../../../lib/utils';

interface RoleFormProps {
  formData: CreateRoleInput;
  setFormData: React.Dispatch<React.SetStateAction<CreateRoleInput>>;
  submitting: boolean;
  editingRole: Role | null;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  onTogglePermission: (permId: string) => void;
}

export const RoleForm: React.FC<RoleFormProps> = ({
  formData,
  setFormData,
  submitting,
  editingRole,
  onSubmit,
  onCancel,
  onTogglePermission
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6 py-4">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Role Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
            disabled={formData.isImmutable}
            className="w-full h-10 border-b border-input bg-transparent px-0 py-2 text-sm font-medium focus:border-primary focus:outline-none transition-colors duration-300 rounded-none disabled:opacity-50"
            placeholder="e.g. EDITOR"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Visual Tag Color</label>
          <select
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            className="w-full h-10 border-b border-input bg-transparent px-0 py-2 text-sm font-medium focus:border-primary focus:outline-none transition-colors duration-300 rounded-none"
          >
            <option value="text-primary">Amber Gold</option>
            <option value="text-emerald-500">Emerald Green</option>
            <option value="text-blue-500">Royal Blue</option>
            <option value="text-purple-500">Mystic Purple</option>
            <option value="text-rose-500">Rose Red</option>
            <option value="text-muted-foreground">Slate Gray</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full border-b border-input bg-transparent px-0 py-2 text-sm font-medium focus:border-primary focus:outline-none transition-colors duration-300 rounded-none min-h-[80px]"
          placeholder="Describe the operational scope of this role..."
        />
      </div>

      <div className="space-y-6">
        <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Capabilities / Permissions</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
          {AVAILABLE_PERMISSIONS.map((group) => (
            <div key={group.category} className="space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary border-b border-border pb-2">
                {group.category}
              </h4>
              <div className="space-y-3">
                {group.items.map((item) => {
                  const isActive = formData.permissions.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onTogglePermission(item.id)}
                      className="w-full flex items-center justify-between group/perm"
                    >
                      <span className={cn(
                        "text-xs transition-colors",
                        isActive ? "font-bold text-foreground" : "text-muted-foreground group-hover/perm:text-foreground"
                      )}>
                        {item.label}
                      </span>
                      <div className={cn(
                        "w-8 h-4 rounded-full relative transition-colors duration-300",
                        isActive ? "bg-primary" : "bg-muted-foreground/20"
                      )}>
                        <div className={cn(
                          "absolute top-0.5 w-3 h-3 bg-white shadow-sm rounded-full transition-all duration-300 ease-in-out",
                          isActive ? "translate-x-4" : "translate-x-0.5"
                        )} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t border-border">
        <button
          type="button"
          onClick={onCancel}
          className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground px-4 transition-colors duration-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-3 bg-foreground text-primary-foreground px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-colors duration-300 disabled:opacity-50"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {editingRole ? 'Update Role' : 'Create Role'}
        </button>
      </div>
    </form>
  );
};
