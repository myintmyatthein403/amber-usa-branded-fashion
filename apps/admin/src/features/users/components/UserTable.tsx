import React from 'react';
import { User as UserIcon, Shield, Star, Edit2, Trash2 } from 'lucide-react';
import { User } from '../schema';

interface UserTableProps {
  mode: 'customers' | 'staff';
  users: User[];
  loading: boolean;
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  mode,
  users,
  loading,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="border border-border bg-card shadow-sm overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
              {mode === 'customers' ? 'Member' : 'Staff Member'}
            </th>
            <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">Role</th>
            <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
              {mode === 'customers' ? 'Level' : 'Status'}
            </th>
            <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase text-right">Options</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {loading ? (
            <tr><td colSpan={4} className="px-10 py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic animate-pulse">Syncing Directory...</td></tr>
          ) : users.length === 0 ? (
            <tr><td colSpan={4} className="px-10 py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic">No {mode} found.</td></tr>
          ) : (
            users.map((user) => (
              <tr key={user.id} className="group hover:bg-muted/50 transition-colors duration-300">
                <td className="px-10 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-secondary border border-border flex items-center justify-center rounded-full overflow-hidden">
                      <UserIcon size={18} className="text-primary" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-lg font-serif text-foreground tracking-wide leading-tight">{user.name || 'Anonymous'}</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{user.email}</span>
                      {user.username && <span className="text-[10px] text-primary font-bold">@{user.username}</span>}
                    </div>
                  </div>
                </td>
                <td className="px-10 py-6">
                  <div className="flex items-center gap-2">
                    <Shield size={12} className={user.role && user.role !== 'USER' ? 'text-primary' : 'text-muted-foreground/30'} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{user.role || user.roleName || 'USER'}</span>
                  </div>
                </td>
                <td className="px-10 py-6">
                  {mode === 'customers' ? (
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <Star size={10} className="text-primary fill-primary" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{user.memberLevel}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{(user as any).points || 0} Points</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-destructive'}`} />
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${user.status === 'ACTIVE' ? 'text-emerald-500' : 'text-destructive'}`}>
                        {user.status}
                      </span>
                    </div>
                  )}
                </td>
                <td className="px-10 py-6 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button 
                      onClick={() => onEdit(user)}
                      className="p-2.5 text-muted-foreground hover:text-foreground transition-colors duration-300"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => user.id && onDelete(user.id)}
                      className="p-2.5 text-muted-foreground hover:text-destructive transition-colors duration-300"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
