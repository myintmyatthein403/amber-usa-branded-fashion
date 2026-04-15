import React from 'react';
import { Modal } from '../components/admin/Modal';
import { useUsers } from '../features/users/hooks/useUsers';
import { UserHeader } from '../features/users/components/UserHeader';
import { UserTable } from '../features/users/components/UserTable';
import { UserForm } from '../features/users/components/UserForm';

interface UsersPageProps {
  mode: 'customers' | 'staff';
}

export const UsersPage: React.FC<UsersPageProps> = ({ mode }) => {
  const {
    users,
    roles,
    loading,
    modalOpen,
    setModalOpen,
    submitting,
    editingUser,
    formData,
    setFormData,
    handleSubmit,
    handleDelete,
    openEditModal,
    openCreateModal,
  } = useUsers(mode);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <UserHeader mode={mode} onAdd={openCreateModal} />

      <UserTable 
        mode={mode}
        users={users}
        loading={loading}
        onEdit={openEditModal}
        onDelete={handleDelete}
      />

      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editingUser ? (mode === 'customers' ? "Modify Customer Profile" : "Modify Staff Permissions") : (mode === 'customers' ? "Onboard New Customer" : "Register Staff Member")}
      >
        <UserForm 
          mode={mode}
          formData={formData}
          setFormData={setFormData}
          submitting={submitting}
          editingUser={editingUser}
          roles={roles}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
};
