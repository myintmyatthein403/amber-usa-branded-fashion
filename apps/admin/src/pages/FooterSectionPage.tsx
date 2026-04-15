import React from 'react';
import { Modal } from '../components/admin/Modal';
import { useFooter } from '../features/footer/hooks/useFooter';
import { FooterHeader } from '../features/footer/components/FooterHeader';
import { FooterList } from '../features/footer/components/FooterList';
import { FooterForm } from '../features/footer/components/FooterForm';

export const FooterSectionPage: React.FC = () => {
  const {
    sections,
    loading,
    refresh,
    deleteSection,
    modalOpen,
    setModalOpen,
    submitting,
    editingSection,
    formData,
    setFormData,
    handleSubmit,
    handleToggleActive,
    openAddModal,
    openEditModal
  } = useFooter();

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <FooterHeader onAdd={openAddModal} />

      <FooterList 
        sections={sections}
        loading={loading}
        onEdit={openEditModal}
        onDelete={(id) => deleteSection(id).then(refresh)}
        onToggleActive={handleToggleActive}
      />

      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editingSection ? 'Refine Footer Composition' : 'Initialize Footer Section'}
      >
        <FooterForm 
          formData={formData}
          setFormData={setFormData}
          submitting={submitting}
          editingSection={editingSection}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
};
