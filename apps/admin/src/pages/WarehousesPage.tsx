import React from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { Modal } from '../components/admin/Modal';
import { useWarehouses } from '../features/warehouses/useWarehouses';
import { WarehouseList } from '../features/warehouses/components/WarehouseList';
import { WarehouseForm } from '../features/warehouses/components/WarehouseForm';
import { WarehouseInventory } from '../features/warehouses/components/WarehouseInventory';

export const WarehousesPage: React.FC = () => {
  const {
    warehouses,
    loading,
    modalOpen,
    setModalOpen,
    inventoryModalOpen,
    setInventoryModalOpen,
    selectedWarehouse,
    loadingInventory,
    inventorySearch,
    setInventorySearch,
    filteredInventory,
    submitting,
    formData,
    setFormData,
    handleCreate,
    openInventory
  } = useWarehouses();

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-end justify-between">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase leading-none">Logistics Hub</span>
          <h2 className="text-4xl font-serif text-foreground tracking-tight">Warehouses</h2>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-3 bg-primary text-primary-foreground px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-primary/90 transition-all duration-300 shadow-xl"
        >
          <Plus size={14} /> Establish New Node
        </button>
      </div>

      {loading ? (
        <div className="py-40 flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-primary" size={40} />
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Scanning Infrastructure...</p>
        </div>
      ) : (
        <WarehouseList 
          warehouses={warehouses}
          onOpenInventory={openInventory}
        />
      )}

      {/* Create Warehouse Modal */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title="Establish New Warehouse Node"
        size="md"
      >
        <WarehouseForm 
          formData={formData as any}
          setFormData={setFormData as any}
          onSubmit={handleCreate}
          submitting={submitting}
        />
      </Modal>

      {/* Inventory View Modal */}
      <Modal 
        isOpen={inventoryModalOpen} 
        onClose={() => setInventoryModalOpen(false)} 
        title="Node Inventory Audit"
        size="xl"
      >
        <WarehouseInventory 
          warehouse={selectedWarehouse}
          inventorySearch={inventorySearch}
          setInventorySearch={setInventorySearch}
          filteredInventory={filteredInventory}
          loadingInventory={loadingInventory}
        />
      </Modal>
    </div>
  );
};
