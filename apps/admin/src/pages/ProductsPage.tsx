import React from 'react';
import { ShoppingBag, HelpCircle } from 'lucide-react';
import { useProducts } from '../features/products/useProducts';
import {
  ProductFilters,
  ProductViews,
  DeleteConfirmModal,
  ProductModal,
  ProductTour,
} from '../features/products/components';
import { MediaSelector } from '../components/admin/MediaSelector';
import { PageHeader } from '../components/admin/PageHeader';
import { DataViewControls } from '../components/admin/DataViewControls';

export const ProductsPage: React.FC = () => {
  const {
    products,
    meta,
    loading,
    page,
    setPage,
    search,
    setSearch,
    filters,
    setFilters,
    clearFilters,
    categories,
    brands,
    collections,
    warehouseList,
    sales,
    modalOpen,
    setModalOpen,
    mediaSelectorOpen,
    setMediaSelectorOpen,
    step,
    setStep,
    submitting,
    submitError,
    setSubmitError,
    editingProduct,
    productForm,
    setProductForm,
    currentVariants,
    editingVariant,
    setEditingVariant,
    newVariant,
    setNewVariant,
    addVariant,
    addBulkVariants,
    handleEditVariant,
    handleDeleteVariant,
    handleProductSubmit,
    handleDelete,
    openEditModal,
    resetForm,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    confirmDelete,
    cancelDelete,
    openProductMedia,
    openVariantMedia,
    handleMediaSelect,
  } = useProducts();

  const [viewMode, setViewMode] = React.useState<'grid' | 'table'>('table');
  const [tourOpen, setTourOpen] = React.useState(false);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <PageHeader
        title="Product Archive"
        badge="Catalog Management"
        description="Master repository of all items. Manage inventory, pricing, and editorial content for our USA premium brands."
        icon={ShoppingBag}
        primaryAction={{
          label: "Initialize Product",
          onClick: () => {
            resetForm();
            setModalOpen(true);
          },
          dataTour: "init-button"
        }}
        secondaryAction={{
          icon: HelpCircle,
          onClick: () => setTourOpen(true),
          title: "Product Tour"
        }}
      />

      <DataViewControls
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, SKU, or brand…"
        viewMode={viewMode}
        onViewModeChange={(mode) => setViewMode(mode)}
      />

      <div data-tour="filters">
        <ProductFilters 
          filters={filters}
          setFilters={setFilters}
          clearFilters={clearFilters}
          categories={categories}
          brands={brands}
        />
      </div>

      <ProductViews
        products={products}
        meta={meta}
        loading={loading}
        viewMode={viewMode === 'table' ? 'list' : 'grid'}
        onEdit={openEditModal}
        onDelete={handleDelete}
        page={page}
        onPageChange={setPage}
      />

      <DeleteConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
      />

      <ProductModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSubmitError(null);
        }}
        step={step}
        onStepChange={setStep}
        isEditing={!!editingProduct}
        productForm={productForm}
        setProductForm={setProductForm}
        categories={categories}
        brands={brands}
        collections={collections}
        sales={sales}
        editingProduct={editingProduct}
        onNext={() => setStep(2)}
        submitting={submitting}
        onOpenMedia={openProductMedia}
        onOpenVariantMedia={openVariantMedia}
        newVariant={newVariant}
        setNewVariant={setNewVariant}
        editingVariant={editingVariant}
        setEditingVariant={setEditingVariant}
        addVariant={addVariant}
        addBulkVariants={addBulkVariants}
        currentVariants={currentVariants}
        handleEditVariant={handleEditVariant}
        handleDeleteVariant={handleDeleteVariant}
        warehouses={warehouseList}
        onSave={handleProductSubmit}
        productSlug={productForm.slug}
        submitError={submitError}
      />

      <MediaSelector 
        isOpen={mediaSelectorOpen} 
        onClose={() => setMediaSelectorOpen(false)} 
        onSelect={handleMediaSelect}
        selectedUrls={
          step === 2
            ? newVariant.images || []
            : productForm.images || []
        }
      />

      <ProductTour isOpen={tourOpen} onClose={() => setTourOpen(false)} />
    </div>
  );
};
