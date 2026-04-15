import React from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { Modal } from '../components/admin/Modal';
import { useSales } from '../features/sales/useSales';
import { SaleTable } from '../features/sales/components/SaleTable';
import { SaleForm } from '../features/sales/components/SaleForm';

export const SalesPage: React.FC = () => {
  const {
    sales,
    loading,
    modalOpen,
    setModalOpen,
    submitting,
    editingSale,
    formData,
    setFormData,
    productSearch,
    setProductSearch,
    filteredProducts,
    handleSubmit,
    handleDelete,
    openAddModal,
    openEditModal,
    toggleProductSelection
  } = useSales();

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-end justify-between">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase leading-none">Promotional Events</span>
          <h2 className="text-4xl font-serif text-foreground tracking-tight">Sales Campaigns</h2>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-3 bg-foreground text-primary-foreground px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all duration-300 shadow-xl shadow-black/5"
        >
          <Plus size={18} /> Initialize Campaign
        </button>
      </div>

      {loading ? (
        <div className="py-40 flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-primary" size={40} />
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Syncing Promotions...</p>
        </div>
      ) : (
        <SaleTable 
          sales={sales} 
          onEdit={openEditModal} 
          onDelete={handleDelete} 
        />
      )}

      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editingSale ? "Refine Campaign Parameters" : "Initialize Promotion Event"}
        size="lg"
      >
        <SaleForm 
          formData={formData}
          setFormData={setFormData}
          productSearch={productSearch}
          setProductSearch={setProductSearch}
          filteredProducts={filteredProducts}
          toggleProductSelection={toggleProductSelection}
          onSubmit={handleSubmit}
          submitting={submitting}
          editingSale={editingSale}
        />
      </Modal>
    </div>
  );
};
