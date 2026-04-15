import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Modal } from '../components/admin/Modal';
import { useRoles } from '../features/roles/hooks/useRoles';
import { RoleHeader } from '../features/roles/components/RoleHeader';
import { RoleList } from '../features/roles/components/RoleList';
import { RoleForm } from '../features/roles/components/RoleForm';

export const RolesPage: React.FC = () => {
  const {
    roles,
    loading,
    refresh,
    modalOpen,
    setModalOpen,
    submitting,
    editingRole,
    formData,
    setFormData,
    handleSubmit,
    openEditModal,
    openCreateModal,
    togglePermission,
    handleDelete,
  } = useRoles();

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <RoleHeader onAdd={openCreateModal} />

      <RoleList 
        roles={roles}
        loading={loading}
        onEdit={openEditModal}
        onDelete={handleDelete}
      />

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
        <RoleForm 
          formData={formData}
          setFormData={setFormData}
          submitting={submitting}
          editingRole={editingRole}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
          onTogglePermission={togglePermission}
        />
      </Modal>
    </div>
  );
};
