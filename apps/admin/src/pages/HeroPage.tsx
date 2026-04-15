import React from 'react';
import { Modal } from '../components/admin/Modal';
import { useHero } from '../features/hero/hooks/useHero';
import { HeroHeader } from '../features/hero/components/HeroHeader';
import { HeroList } from '../features/hero/components/HeroList';
import { HeroForm } from '../features/hero/components/HeroForm';

export const HeroPage: React.FC = () => {
  const {
    heroes,
    loading,
    refresh,
    deleteHero,
    modalOpen,
    setModalOpen,
    submitting,
    uploading,
    editingHero,
    formData,
    setFormData,
    handleFileChange,
    handleSubmit,
    handleToggleActive,
    openAddModal,
    openEditModal
  } = useHero();

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <HeroHeader onAdd={openAddModal} />

      <HeroList 
        heroes={heroes}
        loading={loading}
        onEdit={openEditModal}
        onDelete={(id) => deleteHero(id).then(refresh)}
        onToggleActive={handleToggleActive}
      />

      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editingHero ? 'Refine Experience Design' : 'Initialize Hero Section'}
      >
        <HeroForm 
          formData={formData}
          setFormData={setFormData}
          submitting={submitting}
          uploading={uploading}
          editingHero={editingHero}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
          onFileChange={handleFileChange}
        />
      </Modal>
    </div>
  );
};
