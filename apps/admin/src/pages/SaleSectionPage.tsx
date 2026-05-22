import React from 'react';
import { Plus } from 'lucide-react';
import { Modal } from '../components/admin/Modal';
import { useSaleSection } from '../features/sale-section/useSaleSection';
import { SaleSectionGrid } from '../features/sale-section/components/SaleSectionGrid';
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
    openEditModal,
    // Pagination and search
    page,
    totalPages,
    total,
    search,
    handleSearch,
    handlePageChange,
    // Delete modal
    deleteModalOpen,
    setDeleteModalOpen,
    deletingId,
    confirmDelete,
    cancelDelete
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

      <SaleSectionGrid 
        sections={sections}
        loading={loading}
        onEdit={openEditModal}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
        search={search}
        handleSearch={handleSearch}
        page={page}
        totalPages={totalPages}
        total={total}
        handlePageChange={handlePageChange}
        deleteModalOpen={deleteModalOpen}
        setDeleteModalOpen={setDeleteModalOpen}
        deletingId={deletingId}
        confirmDelete={confirmDelete}
        cancelDelete={cancelDelete}
      />

      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editingSection ? "Refine Section Parameters" : "Initialize Promotion Section"}
        size="lg"
      >
        <SaleSectionForm 
          formData={formData as any}
          setFormData={setFormData as any}
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
