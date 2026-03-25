import React, { useState } from 'react';
import { User, Shield, Edit2, Trash2, Loader2, Star, Plus, Mail, Lock } from 'lucide-react';
import { Modal } from '../components/admin/Modal';
import { useFetch, useDelete } from '../hooks/useCrud';
import { apiService } from '../services/api.service';
import { API_ROUTES } from '../config/constants';
import { useAdminUIStore } from '../store/useAdminUIStore';

interface UserData {
  id: string;
  email: string;
  username: string | null;
  name: string | null;
  role: string;
  phone: string | null;
  points: number;
  memberLevel: string;
  status: string;
}

interface RoleData {
  id: string;
  name: string;
}

interface UsersPageProps {
  mode: 'customers' | 'staff';
}

export const UsersPage: React.FC<UsersPageProps> = ({ mode }) => {
  const { data: users, loading, refresh } = useFetch<UserData>(API_ROUTES.USERS.BASE);
  const { data: roles } = useFetch<RoleData>(API_ROUTES.ROLES.BASE);
  const { deleteItem } = useDelete(API_ROUTES.USERS.BASE);
  const { user: currentUser } = useAdminUIStore();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    roleName: 'USER',
    points: 0,
    memberLevel: 'Silver',
    status: 'ACTIVE',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingUser) {
        // Remove password from payload if not changing it
        const payload = { ...formData };
        if (!payload.password) delete (payload as any).password;
        
        await apiService(API_ROUTES.USERS.BY_ID(editingUser.id), {
          method: 'PATCH',
          body: payload,
        });
      } else {
        await apiService(API_ROUTES.USERS.BASE, {
          method: 'POST',
          body: formData,
        });
      }

      setModalOpen(false);
      setEditingUser(null);
      refresh();
    } catch (error) {
      console.error('Failed to save user:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteItem(id, `Are you sure you want to delete this ${mode === 'customers' ? 'customer' : 'staff member'}? This action cannot be undone.`);
    if (success) refresh();
  };

  const openEditModal = (user: UserData) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email,
      username: user.username || '',
      password: '',
      roleName: user.role,
      points: user.points,
      memberLevel: user.memberLevel,
      status: user.status,
    });
    setModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      username: '',
      password: '',
      roleName: mode === 'staff' ? 'ADMIN' : 'USER',
      points: 0,
      memberLevel: 'Silver',
      status: 'ACTIVE',
    });
    setModalOpen(true);
  };

  const filteredUsers = (users || []).filter(user => {
    if (mode === 'customers') return user.role === 'USER';
    if (mode === 'staff') return user.role === 'ADMIN' || user.role === 'SUPERADMIN';
    return true;
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-end justify-between">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase leading-none">
            {mode === 'customers' ? 'Relationship Management' : 'System Administration'}
          </span>
          <h2 className="text-4xl font-serif text-foreground tracking-tight">
            {mode === 'customers' ? 'Customers & Members' : 'Staff Directory'}
          </h2>
        </div>
        <button 
          onClick={openCreateModal}
          className="flex items-center gap-3 bg-foreground text-primary-foreground px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-colors duration-300"
        >
          <Plus size={16} />
          {mode === 'customers' ? 'Add New Customer' : 'Add Staff Member'}
        </button>
      </div>

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
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan={4} className="px-10 py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic">No {mode} found.</td></tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="group hover:bg-muted/50 transition-colors duration-300">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-secondary border border-border flex items-center justify-center rounded-full overflow-hidden">
                        <User size={18} className="text-primary" />
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
                      <Shield size={12} className={user.role !== 'USER' ? 'text-primary' : 'text-muted-foreground/30'} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{user.role}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    {mode === 'customers' ? (
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <Star size={10} className="text-primary fill-primary" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">{user.memberLevel}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">{user.points} Points</span>
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
                        onClick={() => openEditModal(user)}
                        className="p-2.5 text-muted-foreground hover:text-foreground transition-colors duration-300"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
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

      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editingUser ? (mode === 'customers' ? "Modify Customer Profile" : "Modify Staff Permissions") : (mode === 'customers' ? "Onboard New Customer" : "Register Staff Member")}
      >
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full h-10 border-b border-input bg-transparent px-0 py-2 text-sm font-medium focus:border-primary focus:outline-none transition-colors duration-300 rounded-none"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full h-10 border-b border-input bg-transparent px-0 py-2 text-sm font-medium focus:border-primary focus:outline-none transition-colors duration-300 rounded-none"
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
              onClick={() => setModalOpen(false)}
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
      </Modal>
    </div>
  );
};
