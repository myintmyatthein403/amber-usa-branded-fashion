import React from 'react';
import { 
  Plus, 
  Loader2, 
  LayoutGrid, 
  List, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  AlertTriangle 
} from 'lucide-react';
import { Modal } from '../components/admin/Modal';
import { MediaSelector } from '../components/admin/MediaSelector';
import { useProducts } from '../features/products/useProducts';
import { ProductTable as ProductGridView } from '../features/products/components/ProductTable';
import { ProductListView } from '../features/products/components/ProductListView';
import { ProductForm } from '../features/products/components/ProductForm';
import { VariantManager } from '../features/products/components/VariantManager';

export const ProductsPage: React.FC = () => {
  const {
    products,
    meta,
    loading,
    page,
    setPage,
    search,
    setSearch,
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
    resetForm
  } = useProducts();

  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [mediaTarget, setMediaTarget] = React.useState<'product' | 'variant'>('product');
  const [replacingImageIndex, setReplacingImageIndex] = React.useState<number | null>(null);
  
  // Custom delete confirmation state
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const handleMediaSelect = (url: string) => {
    if (mediaTarget === 'product') {
      setProductForm((prev) => {
        const newImages = [...prev.images];
        if (replacingImageIndex !== null) {
          newImages[replacingImageIndex] = url;
        } else {
          newImages.push(url);
        }
        return { ...prev, images: newImages };
      });
    } else {
      setNewVariant((prev) => ({
        ...prev,
        images: [...(prev.images || []), url]
      }));
    }
    setReplacingImageIndex(null);
  };

  const openProductMedia = (index?: number) => {
    setMediaTarget('product');
    setReplacingImageIndex(index !== undefined ? index : null);
    setMediaSelectorOpen(true);
  };

  const openVariantMedia = () => {
    setMediaTarget('variant');
    setMediaSelectorOpen(true);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      await handleDelete(deleteId); // Use the handle function from hook
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-end justify-between">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase leading-none">Catalog Management</span>
          <h2 className="text-4xl font-serif text-foreground tracking-tight">Product Archive</h2>
        </div>
        <button 
          onClick={() => {
            resetForm();
            setModalOpen(true);
          }}
          className="flex items-center gap-3 bg-foreground text-primary-foreground px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all duration-300 shadow-xl shadow-black/5"
        >
          <Plus size={18} /> Initialize Product
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-card border border-border p-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text"
            placeholder="Search catalog by name, slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-secondary/50 border border-border pl-12 pr-4 py-3 text-xs font-medium focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 border border-border p-1 bg-secondary/30">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2 transition-all duration-300 ${viewMode === 'grid' ? 'bg-foreground text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            title="Grid View"
          >
            <LayoutGrid size={18} />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-2 transition-all duration-300 ${viewMode === 'list' ? 'bg-foreground text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            title="List View"
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-40 flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-primary" size={40} />
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Accessing Inventory...</p>
        </div>
      ) : (
        <div className="space-y-10">
          {viewMode === 'grid' ? (
            <ProductGridView 
              products={products} 
              onEdit={openEditModal} 
              onDelete={(id) => setDeleteId(id)} 
            />
          ) : (
            <ProductListView 
              products={products} 
              onEdit={openEditModal} 
              onDelete={(id) => setDeleteId(id)} 
            />
          )}

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between pt-10 border-t border-border">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Showing {products.length} of {meta.total} Products
              </span>
              <div className="flex items-center gap-4">
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="p-2 border border-border hover:border-primary disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-xs font-mono font-bold">{page} / {meta.totalPages}</span>
                <button 
                  disabled={page === meta.totalPages}
                  onClick={() => setPage(page + 1)}
                  className="p-2 border border-border hover:border-primary disabled:opacity-30 transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Product" size="sm">
        <div className="space-y-6">
          <div className="flex items-center gap-4 text-destructive">
             <AlertTriangle size={32} />
             <h4 className="text-sm font-bold uppercase tracking-widest">Confirm Permanent Removal</h4>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">Are you absolutely sure you want to delete this product? This action cannot be undone, and all associated inventory variants will be wiped.</p>
          <div className="flex gap-4 pt-4">
            <button onClick={() => setDeleteId(null)} className="flex-1 py-3 text-[10px] font-bold uppercase tracking-widest border border-border hover:border-primary transition-colors">Cancel</button>
            <button onClick={confirmDelete} className="flex-1 py-3 text-[10px] font-bold uppercase tracking-widest bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors">Permanent Delete</button>
          </div>
        </div>
      </Modal>

      {/* Product Modal */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editingProduct ? "Refine Product SKUs" : "Initialize New Product"}
        size="xl"
      >
        <div className="flex gap-10 mb-10 border-b border-border">
          <button 
            onClick={() => setStep(1)}
            className={`pb-4 text-[10px] font-bold uppercase tracking-[0.3em] transition-all duration-300 border-b-2 ${step === 1 ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'}`}
          >
            01. Core Definition
          </button>
          <button 
            disabled={!editingProduct && step === 1}
            onClick={() => setStep(2)}
            className={`pb-4 text-[10px] font-bold uppercase tracking-[0.3em] transition-all duration-300 border-b-2 ${step === 2 ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'} disabled:opacity-20`}
          >
            02. Variant Architecture
          </button>
        </div>

        {step === 1 ? (
          <ProductForm 
            productForm={productForm as any}
            setProductForm={setProductForm as any}
            categories={categories as any}
            brands={brands as any}
            sales={sales as any}
            onSubmit={(e) => {
              e.preventDefault();
              handleProductSubmit();
            }}
            submitting={submitting}
            editingProduct={editingProduct as any}
            onOpenMedia={openProductMedia}
            collections={null}
          />
        ) : (
          <VariantManager 
            newVariant={newVariant as any}
            setNewVariant={setNewVariant as any}
            editingVariant={editingVariant as any}
            setEditingVariant={setEditingVariant as any}
            addVariant={addVariant}
            currentVariants={currentVariants as any}
            handleEditVariant={handleEditVariant}
            handleDeleteVariant={handleDeleteVariant}
            warehouses={warehouseList as any}
            setStep={setStep}
            onSave={handleProductSubmit}
            submitting={submitting}
            onOpenMedia={openVariantMedia}
          />
        )}
      </Modal>

      <MediaSelector 
        isOpen={mediaSelectorOpen} 
        onClose={() => setMediaSelectorOpen(false)} 
        onSelect={handleMediaSelect}
        selectedUrls={mediaTarget === 'product' ? productForm.images : newVariant.images}
      />
    </div>
  );
};
