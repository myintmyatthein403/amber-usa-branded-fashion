import React from 'react';
import { Plus } from 'lucide-react';
import { Modal } from '../components/admin/Modal';
import { useCategories } from '../features/categories/useCategories';
import { CategoryTable } from '../features/categories/CategoryTable';
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
    openEditModal
  } = useCategories();

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-end justify-between">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase leading-none">Taxonomy</span>
          <h2 className="text-4xl font-serif text-foreground tracking-tight">Categories</h2>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-3 bg-foreground text-primary-foreground px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all duration-300 shadow-xl shadow-black/5"
        >
          <Plus size={18} /> New Category
        </button>
      </div>

      <CategoryTable 
        categories={categories}
        loading={loading}
        onEdit={openEditModal}
        onDelete={handleDelete}
      />

      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editingCategory ? 'Modify Category' : 'New Category Definition'}
      >
        <CategoryForm 
          formData={formData as any}
          setFormData={setFormData as any}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
          submitting={submitting}
          editingCategory={editingCategory}
        />
      </Modal>
    </div>
  );
};
