import React from 'react';
import { Modal } from '../components/admin/Modal';
import { useInventory } from '../features/inventory/useInventory';
import { InventoryTable } from '../features/inventory/InventoryTable';
import { InventoryGrid } from '../features/inventory/InventoryGrid';
import { InventoryFilters } from '../features/inventory/InventoryFilters';
import { InventoryAdjustmentForm } from '../features/inventory/InventoryAdjustmentForm';

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
    updateAdjustmentQtyByWarehouse
  } = useInventory();

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
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
    </div>
  );
};
