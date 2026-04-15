import React from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { Modal } from '../components/admin/Modal';
import { useSaleSection } from '../features/sale-section/useSaleSection';
import { SaleSectionTable } from '../features/sale-section/components/SaleSectionTable';
import { SaleSectionForm } from '../features/sale-section/components/SaleSectionForm';

export const SaleSectionPage: React.FC = () => {
  const {
    sections,
    loading,
    modalOpen,
    setModalOpen,
    submitting,
    uploading,
    editingSection,
    formData,
    setFormData,
    handleFileChange,
    handleSubmit,
    handleToggleActive,
    handleDelete,
    openAddModal,
    openEditModal
  } = useSaleSection();

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-end justify-between">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase leading-none">Banner Management</span>
          <h2 className="text-4xl font-serif text-foreground tracking-tight">Promotional Sections</h2>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-3 bg-foreground text-primary-foreground px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all duration-300 shadow-xl shadow-black/5"
        >
          <Plus size={18} /> Initialize Section
        </button>
      </div>

      {loading ? (
        <div className="py-40 flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-primary" size={40} />
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Synchronizing Assets...</p>
        </div>
      ) : (
        <SaleSectionTable 
          sections={sections}
          onEdit={openEditModal}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
        />
      )}

      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editingSection ? "Refine Section Parameters" : "Initialize Promotion Section"}
        size="lg"
      >
        <SaleSectionForm 
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onFileChange={handleFileChange}
          submitting={submitting}
          uploading={uploading}
          editingSection={editingSection}
        />
      </Modal>
    </div>
  );
};
