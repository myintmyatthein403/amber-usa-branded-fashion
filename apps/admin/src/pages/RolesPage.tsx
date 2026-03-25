import React, { useState } from 'react';
import { Shield, Lock, Users, CheckCircle2, AlertCircle, Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import { Modal } from '../components/admin/Modal';
import { useFetch, useDelete } from '../hooks/useCrud';
import { apiService } from '../services/api.service';
import { API_ROUTES } from '../config/constants';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface RoleData {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  color: string;
  isImmutable: boolean;
  _count?: {
    users: number;
  };
}

const AVAILABLE_PERMISSIONS = [
  {
    category: 'Catalog Management',
    items: [
      { id: 'products:read', label: 'View Products' },
      { id: 'products:write', label: 'Manage Products & Variants' },
      { id: 'categories:manage', label: 'Manage Categories' },
      { id: 'brands:manage', label: 'Manage Brands' },
    ]
  },
  {
    category: 'Sales & Marketing',
    items: [
      { id: 'orders:manage', label: 'Manage Orders & Fulfillment' },
      { id: 'marketing:manage', label: 'Manage Campaigns & Coupons' },
      { id: 'giftcards:manage', label: 'Manage Gift Cards' },
      { id: 'ads:manage', label: 'Ads & Promotions' },
    ]
  },
  {
    category: 'Website Content',
    items: [
      { id: 'content:manage', label: 'Update Sections (Hero, Mission)' },
      { id: 'reviews:manage', label: 'Review & Approve Feedback' },
      { id: 'community:manage', label: 'Community Posts Moderation' },
    ]
  },
  {
    category: 'System & Security',
    items: [
      { id: 'staff:manage', label: 'Manage Staff Directory' },
      { id: 'roles:manage', label: 'Manage Roles & RBAC' },
      { id: 'settings:manage', label: 'Global System Settings' },
    ]
  }
];

export const RolesPage: React.FC = () => {
  const { data: roles, loading, refresh } = useFetch<RoleData>(API_ROUTES.ROLES.BASE);
  const { deleteItem } = useDelete(API_ROUTES.ROLES.BASE);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleData | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
    color: 'text-primary',
    isImmutable: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingRole) {
        await apiService(API_ROUTES.ROLES.BY_ID(editingRole.id), {
          method: 'PATCH',
          body: formData,
        });
      } else {
        await apiService(API_ROUTES.ROLES.BASE, {
          method: 'POST',
          body: formData,
        });
      }

      setModalOpen(false);
      setEditingRole(null);
      refresh();
    } catch (error) {
      console.error('Failed to save role:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (role: RoleData) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || '',
      permissions: role.permissions || [],
      color: role.color || 'text-primary',
      isImmutable: role.isImmutable,
    });
    setModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingRole(null);
    setFormData({
      name: '',
      description: '',
      permissions: [],
      color: 'text-primary',
      isImmutable: false,
    });
    setModalOpen(true);
  };

  const togglePermission = (permId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter(p => p !== permId)
        : [...prev.permissions, permId]
    }));
  };

  const handleDelete = async (id: string) => {
    const success = await deleteItem(id, "Are you sure you want to delete this role? This will fail if users are still assigned to it.");
    if (success) refresh();
  };

  const getPermissionLabel = (id: string) => {
    for (const cat of AVAILABLE_PERMISSIONS) {
      const item = cat.items.find(i => i.id === id);
      if (item) return item.label;
    }
    return id;
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-end justify-between">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase leading-none">Security</span>
          <h2 className="text-4xl font-serif text-foreground tracking-tight">Roles & Permissions</h2>
        </div>
        <button 
          onClick={openCreateModal}
          className="flex items-center gap-3 bg-foreground text-primary-foreground px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-colors duration-300"
        >
          <Plus size={16} />
          Define New Role
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-3 py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic animate-pulse">
            Syncing RBAC Policy...
          </div>
        ) : roles?.map((role) => (
          <div key={role.id} className="border border-border bg-card shadow-sm flex flex-col group relative">
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
                  onClick={() => openEditModal(role)}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Edit2 size={14} />
                </button>
                {!role.isImmutable && (
                  <button 
                    onClick={() => handleDelete(role.id)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-10 border border-dashed border-border rounded-xl bg-muted/10 flex flex-col items-center text-center space-y-4">
        <AlertCircle className="text-muted-foreground" size={32} />
        <div className="space-y-1">
          <h3 className="text-lg font-serif italic text-foreground">Advanced Policy Editor</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
            The Amber RBAC system allows for granular control over operational roles. Dynamic role creation enables flexible team scaling and tailored access management.
          </p>
        </div>
      </div>

      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editingRole ? "Modify Role Configuration" : "Define New System Role"}
      >
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
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
                          onClick={() => togglePermission(item.id)}
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
              {editingRole ? 'Update Role' : 'Create Role'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
