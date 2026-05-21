import React from 'react';
import { Plus, AlertTriangle } from 'lucide-react';
import { Modal } from '../components/admin/Modal';
import { Pagination } from '../components/admin/Pagination';
import { MediaSelector } from '../components/admin/MediaSelector';
import { useBrands } from '../features/brands/useBrands';
import { BrandSearchBar } from '../features/brands/components/BrandSearchBar';
import { BrandTable } from '../features/brands/BrandTable';
import { BrandGrid } from '../features/brands/BrandGrid';
import { BrandForm } from '../features/brands/BrandForm';
import { getBrandProductCount } from '../features/brands/schema';

export const BrandsPage: React.FC = () => {
  const {
    brands,
    loading,
    pagination,
    search,
    setSearch,
    hasActiveSearch,
    modalOpen,
    setModalOpen,
    mediaSelectorOpen,
    setMediaSelectorOpen,
    submitting,
    submitError,
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
    deletingBrand,
    deleteError,
    viewBrandProducts,
    viewMode,
    setViewMode,
    handlePageChange,
    handleLimitChange,
  } = useBrands();

  const emptyMessage = hasActiveSearch
    ? 'No brands match your search.'
    : 'No brands defined.';

  const deletingProductCount = deletingBrand
    ? getBrandProductCount(deletingBrand)
    : 0;
  const canDelete = deletingProductCount === 0;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-end justify-between">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase leading-none">
            House of Brands
          </span>
          <h2 className="text-4xl font-serif text-foreground tracking-tight">
            Brand Directory
          </h2>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-3 bg-foreground text-primary-foreground px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all duration-300 shadow-xl shadow-black/5"
        >
          <Plus size={18} /> New Brand
        </button>
      </div>

      <BrandSearchBar
        search={search}
        onSearchChange={setSearch}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {viewMode === 'grid' ? (
        <BrandGrid
          brands={brands}
          loading={loading}
          emptyMessage={emptyMessage}
          onEdit={openEditModal}
          onDelete={handleDelete}
          onViewProducts={viewBrandProducts}
        />
      ) : (
        <BrandTable
          brands={brands}
          loading={loading}
          emptyMessage={emptyMessage}
          onEdit={openEditModal}
          onDelete={handleDelete}
          onViewProducts={viewBrandProducts}
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
        title={
          editingBrand ? 'Modify Brand Identity' : 'Initialize Brand Profile'
        }
      >
        {submitError && (
          <p className="mb-4 text-sm text-destructive">{submitError}</p>
        )}
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
              <p className="text-lg font-serif text-foreground">
                Delete {deletingBrand?.name ?? 'this brand'}?
              </p>
              {deletingProductCount > 0 ? (
                <p className="text-sm text-destructive">
                  This brand has {deletingProductCount}{' '}
                  {deletingProductCount === 1 ? 'product' : 'products'} assigned.
                  Reassign or remove those products before deleting this brand.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  This action cannot be undone. No products are linked to this
                  brand.
                </p>
              )}
              {deleteError && (
                <p className="text-sm text-destructive">{deleteError}</p>
              )}
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
              disabled={!canDelete}
              className="px-6 py-2.5 text-xs font-bold uppercase tracking-[0.2em] bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
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
