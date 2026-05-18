import React from 'react';
import { Plus, Loader2, Search, List, Grid, Trash2 } from 'lucide-react';
import { Modal } from '../components/admin/Modal';
import { useSales } from '../features/sales/useSales';
import { SaleTable } from '../features/sales/components/SaleTable';
import { SalesGrid } from '../features/sales/components/SalesGrid';
import { SaleForm } from '../features/sales/components/SaleForm';
import { Pagination } from '../components/admin/Pagination';

export const SalesPage: React.FC = () => {
  const {
    sales,
    loading,
    pagination,
    search,
    setSearch,
    viewMode,
    setViewMode,
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
    toggleProductSelection,
    deleteConfirmOpen,
    confirmDelete,
    cancelDelete,
    handlePageChange
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

      <div className="flex items-center justify-between gap-4">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
          <input 
            type="text"
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-secondary border border-border pl-10 pr-4 py-2.5 text-[10px] uppercase tracking-widest focus:border-primary focus:outline-none transition-colors"
          />
        </div>
        <div className="flex items-center border border-border">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-foreground text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <List size={16} />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-foreground text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Grid size={16} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-40 flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-primary" size={40} />
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Syncing Promotions...</p>
        </div>
      ) : viewMode === 'grid' ? (
        <>
          <SalesGrid 
            sales={sales} 
            onEdit={openEditModal} 
            onDelete={handleDelete} 
          />
          {pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limit={pagination.limit}
              onPageChange={handlePageChange}
              onLimitChange={() => {}}
            />
          )}
        </>
      ) : (
        <>
          <SaleTable 
            sales={sales} 
            onEdit={openEditModal} 
            onDelete={handleDelete} 
          />
          {pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limit={pagination.limit}
              onPageChange={handlePageChange}
              onLimitChange={() => {}}
            />
          )}
        </>
      )}

      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editingSale ? "Refine Campaign Parameters" : "Initialize Promotion Event"}
        size="lg"
      >
        <SaleForm 
          formData={formData as any}
          setFormData={setFormData as any}
          productSearch={productSearch}
          setProductSearch={setProductSearch}
          filteredProducts={filteredProducts}
          toggleProductSelection={toggleProductSelection}
          onSubmit={handleSubmit}
          submitting={submitting}
          editingSale={editingSale}
        />
      </Modal>

      <Modal isOpen={deleteConfirmOpen} onClose={cancelDelete} title="Delete Sales Campaign" size="sm">
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
              <Trash2 className="w-6 h-6 text-destructive" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-serif text-foreground">Delete this sales campaign?</p>
              <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
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