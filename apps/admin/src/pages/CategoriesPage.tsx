import React from 'react';
import { AlertTriangle, Layers } from 'lucide-react';
import { Modal } from '../components/admin/Modal';
import { PageHeader } from '../components/admin/PageHeader';
import { useCategories } from '../features/categories/useCategories';
import { CategoryTree } from '../features/categories/CategoryTree';
import { CategoryForm } from '../features/categories/CategoryForm';

export const CategoriesPage: React.FC = () => {
  const {
    categories,
    loading,
    modalOpen,
    setModalOpen,
    submitting,
    editingCategory,
    formData,
    setFormData,
    handleSubmit,
    handleDelete,
    openAddModal,
    openEditModal,
    deleteConfirmOpen,
    confirmDelete,
    cancelDelete,
    availableCategories,
    reorderCategories,
    toggleCategoryActive,
  } = useCategories();

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <PageHeader
        title="Categories"
        badge="Taxonomy"
        description="Organize your product catalog into a logical, hierarchical structure for effortless navigation."
        icon={Layers}
        primaryAction={{
          label: "New Category",
          onClick: openAddModal
        }}
      />

      <CategoryTree
        categories={categories}
        loading={loading}
        onEdit={openEditModal}
        onDelete={handleDelete}
        onToggleActive={toggleCategoryActive}
        onReorder={reorderCategories}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? 'Modify Category' : 'New Category Definition'}
      >
        <CategoryForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
          submitting={submitting}
          editingCategory={editingCategory}
          availableCategories={availableCategories}
        />
      </Modal>

      <Modal
        isOpen={deleteConfirmOpen}
        onClose={cancelDelete}
        title="Confirm Deletion"
        size="sm"
      >
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-serif text-foreground">Delete this category?</p>
              <p className="text-sm text-muted-foreground">
                This action cannot be undone. Products associated with this category may be
                affected.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              onClick={cancelDelete}
              className="px-6 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground border border-border hover:border-foreground transition-all duration-300"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-6 py-2.5 text-xs font-bold uppercase tracking-[0.2em] bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all duration-300"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
