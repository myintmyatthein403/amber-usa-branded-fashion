import React from 'react';
import { useProducts } from '../features/products/useProducts';
import {
  ProductPageHeader,
  ProductSearchBar,
  ProductFilters,
  ProductViews,
  DeleteConfirmModal,
  ProductModal,
  ProductTour,
} from '../features/products/components';
import { MediaSelector } from '../components/admin/MediaSelector';

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
    warehouseList,
    sales,
    modalOpen,
    setModalOpen,
    mediaSelectorOpen,
    setMediaSelectorOpen,
    step,
    setStep,
    submitting,
    editingProduct,
    productForm,
    setProductForm,
    currentVariants,
    editingVariant,
    setEditingVariant,
    newVariant,
    setNewVariant,
    addVariant,
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
  } = useProducts();

  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('list');
  const [tourOpen, setTourOpen] = React.useState(false);

  const handleMediaSelect = (url: string) => {
    if (mediaSelectorOpen) {
      setProductForm((prev) => ({ ...prev, images: [...prev.images, url] }));
    }
    setMediaSelectorOpen(false);
  };

  const openProductMedia = () => setMediaSelectorOpen(true);
  const openVariantMedia = () => setMediaSelectorOpen(true);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <ProductPageHeader
        onCreateProduct={() => {
          resetForm();
          setModalOpen(true);
        }}
        onOpenTour={() => setTourOpen(true)}
      />

      <ProductSearchBar
        search={search}
        onSearchChange={setSearch}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
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
        viewMode={viewMode}
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
        onClose={() => setModalOpen(false)}
        step={step}
        onStepChange={setStep}
        isEditing={!!editingProduct}
        productForm={productForm}
        setProductForm={setProductForm}
        categories={categories}
        brands={brands}
        sales={sales}
        onNext={() => setStep(2)}
        submitting={submitting}
        onOpenMedia={openProductMedia}
        newVariant={newVariant}
        setNewVariant={setNewVariant}
        editingVariant={editingVariant}
        setEditingVariant={setEditingVariant}
        addVariant={addVariant}
        currentVariants={currentVariants}
        handleEditVariant={handleEditVariant}
        handleDeleteVariant={handleDeleteVariant}
        warehouses={warehouseList}
        onSave={handleProductSubmit}
      />

      <MediaSelector 
        isOpen={mediaSelectorOpen} 
        onClose={() => setMediaSelectorOpen(false)} 
        onSelect={handleMediaSelect}
        selectedUrls={[]}
      />

      <ProductTour isOpen={tourOpen} onClose={() => setTourOpen(false)} />
    </div>
  );
};