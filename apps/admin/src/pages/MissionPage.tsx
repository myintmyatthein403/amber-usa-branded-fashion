import React from 'react';
import { Modal } from '../components/admin/Modal';
import { useMission } from '../features/mission/hooks/useMission';
import { MissionHeader } from '../features/mission/components/MissionHeader';
import { MissionList } from '../features/mission/components/MissionList';
import { MissionForm } from '../features/mission/components/MissionForm';

export const MissionPage: React.FC = () => {
  const {
    missions,
    loading,
    refresh,
    deleteMission,
    modalOpen,
    setModalOpen,
    submitting,
    uploading,
    editingMission,
    formData,
    setFormData,
    handleFileChange,
    handleSubmit,
    handleToggleActive,
    openAddModal,
    openEditModal
  } = useMission();

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <MissionHeader onAdd={openAddModal} />

      <MissionList 
        missions={missions}
        loading={loading}
        onEdit={openEditModal}
        onDelete={(id) => deleteMission(id).then(refresh)}
        onToggleActive={handleToggleActive}
      />

      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editingMission ? 'Refine Mission Design' : 'Initialize Mission Section'}
      >
        <MissionForm 
          formData={formData as any}
          setFormData={setFormData as any}
          submitting={submitting}
          uploading={uploading}
          editingMission={editingMission}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
          onFileChange={handleFileChange}
        />
      </Modal>
    </div>
  );
};
