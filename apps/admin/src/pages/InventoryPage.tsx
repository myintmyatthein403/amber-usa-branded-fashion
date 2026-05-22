import React from 'react';
import { Modal } from '../components/admin/Modal';
import { useInventory } from '../features/inventory/useInventory';
import { InventoryTable } from '../features/inventory/InventoryTable';
import { InventoryGrid } from '../features/inventory/InventoryGrid';
import { InventoryFilters } from '../features/inventory/InventoryFilters';
import { InventoryAdjustmentForm } from '../features/inventory/InventoryAdjustmentForm';
import { BulkTransferForm } from '../features/inventory/BulkTransferForm';
import { PackageSearch, ArrowRightLeft } from 'lucide-react';

export const InventoryPage: React.FC = () => {
  const {
    loading,
    refresh,
    search,
    setSearch,
    viewMode,
    setViewMode,
    filterLocation,
    setFilterLocation,
    adjustModalOpen,
    setAdjustModalOpen,
    submitting,
    selectedVariant,
    selectedWarehouseId,
    adjustmentQty,
    setAdjustmentQty,
    groupedInventory,
    warehouses,
    openAdjustModal,
    handleAdjustStock,
    handleBulkTransfer,
    updateAdjustmentQtyByWarehouse,
    transferModalOpen,
    setTransferModalOpen,
    transferSubmitting
  } = useInventory();

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 text-primary">
            <PackageSearch size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold tracking-tight">Global Inventory</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">Node-based Stock Control & Logistics</p>
          </div>
        </div>

        <button 
          onClick={() => setTransferModalOpen(true)}
          className="flex items-center gap-3 bg-foreground text-primary-foreground px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all duration-300"
        >
          <ArrowRightLeft size={16} />
          Bulk Stock Transfer
        </button>
      </div>

      <InventoryFilters 
        search={search}
        onSearchChange={setSearch}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        filterLocation={filterLocation}
        onFilterLocationChange={setFilterLocation}
        onRefresh={refresh}
      />

      {loading ? (
        <div className="py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic animate-pulse">Synchronizing Global Stock Levels...</div>
      ) : groupedInventory.length === 0 ? (
        <div className="py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic border border-dashed border-border">No inventory items found matching your criteria.</div>
      ) : viewMode === 'table' ? (
        <InventoryTable 
          groupedInventory={groupedInventory}
          warehouses={warehouses}
          onAdjust={openAdjustModal}
        />
      ) : (
        <InventoryGrid 
          groupedInventory={groupedInventory}
          warehouses={warehouses}
        />
      )}

      {/* Adjust Stock Modal */}
      <Modal 
        isOpen={adjustModalOpen} 
        onClose={() => setAdjustModalOpen(false)} 
        title="Physical Inventory Adjustment"
        size="md"
      >
        <InventoryAdjustmentForm 
          selectedVariant={selectedVariant}
          selectedWarehouseId={selectedWarehouseId}
          adjustmentQty={adjustmentQty}
          warehouses={warehouses}
          submitting={submitting}
          onWarehouseChange={updateAdjustmentQtyByWarehouse}
          onQtyChange={setAdjustmentQty}
          onSubmit={handleAdjustStock}
          onCancel={() => setAdjustModalOpen(false)}
        />
      </Modal>

      {/* Bulk Transfer Modal */}
      <Modal 
        isOpen={transferModalOpen} 
        onClose={() => setTransferModalOpen(false)} 
        title="Consolidated Cargo & Stock Transfer"
        size="xl"
      >
        <BulkTransferForm 
          groupedInventory={groupedInventory}
          warehouses={warehouses}
          submitting={transferSubmitting}
          onClose={() => setTransferModalOpen(false)}
          onSubmit={handleBulkTransfer}
        />
      </Modal>
    </div>
  );
};
