import React from 'react';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { User, RoleData } from '../schema';
import { useAdminUIStore } from '../../../store/useAdminUIStore';

interface UserFormProps {
  mode: 'customers' | 'staff';
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  submitting: boolean;
  editingUser: User | null;
  roles: RoleData[] | null;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const UserForm: React.FC<UserFormProps> = ({
  mode,
  formData,
  setFormData,
  submitting,
  editingUser,
  roles,
  onSubmit,
  onCancel,
}) => {
  const { user: currentUser } = useAdminUIStore();

  return (
    <form onSubmit={onSubmit} className="space-y-6 py-4" autoComplete="off">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Full Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full h-10 border-b border-input bg-transparent px-0 py-2 text-sm font-medium focus:border-primary focus:outline-none transition-colors duration-300 rounded-none"
            required
            autoComplete="off"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Username</label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="w-full h-10 border-b border-input bg-transparent px-0 py-2 text-sm font-medium focus:border-primary focus:outline-none transition-colors duration-300 rounded-none"
            autoComplete="off"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Email Address</label>
          <div className="flex items-center gap-3 border-b border-input focus-within:border-primary transition-colors duration-300">
            <Mail size={14} className="text-muted-foreground" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={!!editingUser}
              className="w-full h-10 bg-transparent px-0 py-2 text-sm font-medium focus:outline-none rounded-none disabled:opacity-50"
              required
              autoComplete="off"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">
            {editingUser ? 'New Password (Optional)' : 'Initial Password'}
          </label>
          <div className="flex items-center gap-3 border-b border-input focus-within:border-primary transition-colors duration-300">
            <Lock size={14} className="text-muted-foreground" />
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full h-10 bg-transparent px-0 py-2 text-sm font-medium focus:outline-none rounded-none"
              required={!editingUser}
              minLength={8}
              autoComplete="new-password"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Role</label>
          <select
            value={formData.roleName}
            onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
            disabled={currentUser?.role !== 'SUPERADMIN' && mode === 'staff'}
            className="w-full h-10 border-b border-input bg-transparent px-0 py-2 text-sm font-medium focus:border-primary focus:outline-none transition-colors duration-300 rounded-none disabled:opacity-50"
          >
            {roles?.map(role => (
               <option key={role.id} value={role.name}>{role.name}</option>
            ))}
          </select>
        </div>
        {mode === 'customers' ? (
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Member Level</label>
            <select
              value={formData.memberLevel}
              onChange={(e) => setFormData({ ...formData, memberLevel: e.target.value })}
              className="w-full h-10 border-b border-input bg-transparent px-0 py-2 text-sm font-medium focus:border-primary focus:outline-none transition-colors duration-300 rounded-none"
            >
              <option value="Silver">Silver</option>
              <option value="Gold Elite">Gold Elite</option>
              <option value="Platinum Elite">Platinum Elite</option>
            </select>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Account Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full h-10 border-b border-input bg-transparent px-0 py-2 text-sm font-medium focus:border-primary focus:outline-none transition-colors duration-300 rounded-none"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
            </select>
          </div>
        )}
      </div>

      {mode === 'customers' && (
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Points</label>
          <input
            type="number"
            value={formData.points}
            onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
            className="w-full h-10 border-b border-input bg-transparent px-0 py-2 text-sm font-medium focus:border-primary focus:outline-none transition-colors duration-300 rounded-none"
          />
        </div>
      )}

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
          {editingUser ? 'Update User' : 'Register User'}
        </button>
      </div>
    </form>
  );
};
