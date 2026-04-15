import React from 'react';
import { Plus } from 'lucide-react';
import { Modal } from '../components/admin/Modal';
import { useCollections } from '../features/collections/useCollections';
import { CollectionTable } from '../features/collections/CollectionTable';
import { CollectionForm } from '../features/collections/CollectionForm';

export const CollectionsPage: React.FC = () => {
  const {
    collections,
    loading,
    modalOpen,
    setModalOpen,
    submitting,
    uploading,
    editingCollection,
    formData,
    setFormData,
    handleFileChange,
    handleNameChange,
    handleSubmit,
    handleDelete,
    openAddModal,
    openEditModal
  } = useCollections();

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-end justify-between">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase leading-none">Curation</span>
          <h2 className="text-4xl font-serif text-foreground tracking-tight">Collections</h2>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-3 bg-foreground text-primary-foreground px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all duration-300 shadow-xl shadow-black/5"
        >
          <Plus size={18} /> New Collection
        </button>
      </div>

      <CollectionTable 
        collections={collections}
        loading={loading}
        onEdit={openEditModal}
        onDelete={handleDelete}
      />

      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editingCollection ? 'Modify Collection' : 'Create Collection'}
      >
        <CollectionForm 
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onFileChange={handleFileChange}
          submitting={submitting}
          uploading={uploading}
          editingCollection={editingCollection}
          onNameChange={handleNameChange}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
};
