import React from 'react';
import { Plus, AlertTriangle, LayoutGrid, List } from 'lucide-react';
import { Modal } from '../components/admin/Modal';
import { Pagination } from '../components/admin/Pagination';
import { MediaSelector } from '../components/admin/MediaSelector';
import { useBrands } from '../features/brands/useBrands';
import { BrandTable } from '../features/brands/BrandTable';
import { BrandGrid } from '../features/brands/BrandGrid';
import { BrandForm } from '../features/brands/BrandForm';

export const BrandsPage: React.FC = () => {
  const {
    brands,
    loading,
    pagination,
    modalOpen,
    setModalOpen,
    mediaSelectorOpen,
    setMediaSelectorOpen,
    submitting,
    editingBrand,
    formData,
    setFormData,
    handleMediaSelect,
    handleSubmit,
    handleDelete,
    openAddModal,
    openEditModal,
    deleteConfirmOpen,
    confirmDelete,
    cancelDelete,
    viewMode,
    setViewMode,
    handlePageChange,
    handleLimitChange,
  } = useBrands();

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-end justify-between">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase leading-none">House of Brands</span>
          <h2 className="text-4xl font-serif text-foreground tracking-tight">Brand Directory</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center border border-border">
            <button
              onClick={() => setViewMode('list')}
              className={`p-3 transition-colors duration-300 ${
                viewMode === 'list'
                  ? 'bg-foreground text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-3 transition-colors duration-300 ${
                viewMode === 'grid'
                  ? 'bg-foreground text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutGrid size={18} />
            </button>
          </div>
          <button 
            onClick={openAddModal}
            className="flex items-center gap-3 bg-foreground text-primary-foreground px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all duration-300 shadow-xl shadow-black/5"
          >
            <Plus size={18} /> New Brand
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <BrandGrid
          brands={brands}
          loading={loading}
          onEdit={openEditModal}
          onDelete={handleDelete}
        />
      ) : (
        <BrandTable 
          brands={brands}
          loading={loading}
          onEdit={openEditModal}
          onDelete={handleDelete}
        />
      )}

      {pagination.total > 0 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={pagination.limit}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
        />
      )}

      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editingBrand ? 'Modify Brand Identity' : 'Initialize Brand Profile'}
      >
        <BrandForm 
          formData={formData as any}
          setFormData={setFormData as any}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
          submitting={submitting}
          editingBrand={editingBrand as any}
          onMediaSelectorOpen={() => setMediaSelectorOpen(true)}
        />
      </Modal>

      <Modal
        isOpen={deleteConfirmOpen}
        onClose={cancelDelete}
        title="Confirm Deletion"
        size="sm"
      >
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-serif text-foreground">Delete this brand?</p>
              <p className="text-sm text-muted-foreground">This action cannot be undone. Products associated with this brand may be affected.</p>
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

      <MediaSelector 
        isOpen={mediaSelectorOpen} 
        onClose={() => setMediaSelectorOpen(false)} 
        onSelect={handleMediaSelect}
        selectedUrls={formData.logo ? [formData.logo] : []}
      />
    </div>
  );
};