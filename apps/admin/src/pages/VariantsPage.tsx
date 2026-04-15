import React from 'react';
import { Loader2, Plus } from 'lucide-react';
import { Modal } from '../components/admin/Modal';
import { useVariants } from '../features/variants/useVariants';
import { VariantTable } from '../features/variants/components/VariantTable';
import { VariantForm } from '../features/variants/components/VariantForm';

export const VariantsPage: React.FC = () => {
  const {
    variants,
    products,
    warehouses,
    loading,
    modalOpen,
    setModalOpen,
    submitting,
    editingVariant,
    formData,
    setFormData,
    handleSubmit,
    handleDelete,
    openAddModal,
    openEditModal
  } = useVariants();

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-end justify-between">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold tracking-[0.3em] text-[#C9A962] uppercase leading-none">Inventory Control</span>
          <h2 className="text-4xl font-serif text-[#0F0F0F] tracking-tight">Stock Variants</h2>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-3 bg-[#0F0F0F] text-white px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-[#C9A962] transition-all duration-300 shadow-xl shadow-black/5"
        >
          <Plus size={18} /> Initialize Variant
        </button>
      </div>

      {loading ? (
        <div className="py-40 flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-[#C9A962]" size={40} />
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#666]">Accessing Inventory Clusters...</p>
        </div>
      ) : (
        <VariantTable 
          variants={variants}
          onEdit={openEditModal}
          onDelete={handleDelete}
        />
      )}

      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editingVariant ? "Refine Variant Parameters" : "Initialize New Variant"}
        size="lg"
      >
        <VariantForm 
          formData={formData}
          setFormData={setFormData}
          products={products}
          warehouses={warehouses}
          onSubmit={handleSubmit}
          submitting={submitting}
          editingVariant={editingVariant}
        />
      </Modal>
    </div>
  );
};
