import React from 'react';
import { Loader2, Box } from 'lucide-react';
import { Modal } from '../components/admin/Modal';
import { PageHeader } from '../components/admin/PageHeader';
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
      <PageHeader
        title="Stock Variants"
        badge="Inventory Control"
        description="Monitor and manage the specific SKU variations, tracking stock levels across global warehouses and Myanmar distribution centers."
        icon={Box}
        primaryAction={{
          label: "Initialize Variant",
          onClick: openAddModal
        }}
      />

      {loading ? (
        <div className="py-40 flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-primary" size={40} />
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Accessing Inventory Clusters...</p>
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
          formData={formData as any}
          setFormData={setFormData as any}
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
