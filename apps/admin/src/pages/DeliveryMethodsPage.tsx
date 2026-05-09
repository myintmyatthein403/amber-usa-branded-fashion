import React from 'react';
import { Plus } from 'lucide-react';
import { Modal } from '../components/admin/Modal';
import { useDelivery } from '../features/delivery/useDelivery';
import { DeliveryMethodTable } from '../features/delivery/DeliveryMethodTable';
import { DeliveryMethodForm } from '../features/delivery/DeliveryMethodForm';

export const DeliveryMethodsPage: React.FC = () => {
  const {
    methods,
    loading,
    refresh,
    modalOpen,
    setModalOpen,
    submitting,
    editingMethod,
    form,
    setForm,
    handleSubmit,
    openAddModal,
    openEditModal,
    handleDelete
  } = useDelivery();

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-end justify-between">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase leading-none">Logistics Configuration</span>
          <h2 className="text-4xl font-serif text-foreground tracking-tight">Delivery Methods</h2>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-3 bg-foreground text-primary-foreground px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all duration-300 shadow-xl shadow-black/5"
        >
          <Plus size={18} /> New Method
        </button>
      </div>

      <DeliveryMethodTable 
        methods={methods}
        loading={loading}
        onEdit={openEditModal}
        onDelete={handleDelete}
      />

      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editingMethod ? `Edit Method: ${editingMethod.name}` : 'New Delivery Protocol'}
      >
        <DeliveryMethodForm 
          form={form as any}
          setForm={setForm as any}
          onSubmit={handleSubmit}
          submitting={submitting}
          editingMethod={editingMethod as any}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
};
