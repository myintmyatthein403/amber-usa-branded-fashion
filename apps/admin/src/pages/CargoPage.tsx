import React from 'react';
import { Plus } from 'lucide-react';
import { Modal } from '../components/admin/Modal';
import { useCargo } from '../features/cargo/useCargo';
import { CargoTable } from '../features/cargo/CargoTable';
import { CargoManifestForm } from '../features/cargo/CargoManifestForm';
import { CargoDetailsModal } from '../features/cargo/CargoDetailsModal';

export const CargoPage: React.FC = () => {
  const {
    shipments,
    loading,
    warehouses,
    variants,
    modalOpen,
    setModalOpen,
    detailsModalOpen,
    setDetailsModalOpen,
    selectedShipment,
    updating,
    submitting,
    formData,
    setFormData,
    selectedVariantId,
    setSelectedVariantId,
    selectedQuantity,
    setSelectedQuantity,
    addItem,
    removeItem,
    handleCreateShipment,
    openDetails,
    handleUpdateStatus
  } = useCargo();

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-end justify-between">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase leading-none">Global Supply Chain</span>
          <h2 className="text-4xl font-serif text-foreground tracking-tight">Cargo Shipments</h2>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-3 bg-primary text-primary-foreground px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-primary/90 transition-all duration-300 shadow-xl"
        >
          <Plus size={14} /> Initialize Manifest
        </button>
      </div>

      <CargoTable 
        shipments={shipments}
        loading={loading}
        onOpenDetails={openDetails}
      />

      {/* Initialize Manifest Modal */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title="Initialize Global Manifest"
        size="lg"
      >
        <CargoManifestForm 
          warehouses={warehouses}
          variants={variants}
          formData={formData as any}
          setFormData={setFormData as any}
          selectedVariantId={selectedVariantId}
          setSelectedVariantId={setSelectedVariantId}
          selectedQuantity={selectedQuantity}
          setSelectedQuantity={setSelectedQuantity}
          onAddItem={addItem}
          onRemoveItem={removeItem}
          onSubmit={handleCreateShipment}
          onCancel={() => setModalOpen(false)}
          submitting={submitting}
        />
      </Modal>

      {/* Details Modal */}
      <Modal 
        isOpen={detailsModalOpen} 
        onClose={() => setDetailsModalOpen(false)} 
        title={`Cargo Manifest: ${selectedShipment?.shipmentNumber}`}
        size="lg"
      >
        <CargoDetailsModal 
          selectedShipment={selectedShipment}
          updating={updating}
          onUpdateStatus={handleUpdateStatus}
        />
      </Modal>
    </div>
  );
};
