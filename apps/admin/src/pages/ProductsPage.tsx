import React from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { Modal } from '../components/admin/Modal';
import { MediaSelector } from '../components/admin/MediaSelector';
import { useProducts } from '../features/products/useProducts';
import { ProductTable } from '../features/products/components/ProductTable';
import { ProductForm } from '../features/products/components/ProductForm';
import { VariantManager } from '../features/products/components/VariantManager';

export const ProductsPage: React.FC = () => {
  const {
    products,
    loading,
    categories,
    brands,
    warehouses,
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

  const [mediaTarget, setMediaTarget] = React.useState<'product' | 'variant'>('product');
  const [replacingImageIndex, setReplacingImageIndex] = React.useState<number | null>(null);

  const handleMediaSelect = (url: string) => {
    if (mediaTarget === 'product') {
      setProductForm((prev: any) => {
        const newImages = [...prev.images];
        if (replacingImageIndex !== null) {
          newImages[replacingImageIndex] = url;
        } else {
          newImages.push(url);
        }
        return { ...prev, images: newImages };
      });
    } else {
      setNewVariant((prev: any) => ({
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

      {loading ? (
        <div className="py-40 flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-primary" size={40} />
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Accessing Inventory...</p>
        </div>
      ) : (
        <ProductTable 
          products={products} 
          onEdit={openEditModal} 
          onDelete={handleDelete} 
        />
      )}

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
            productForm={productForm}
            setProductForm={setProductForm}
            categories={categories}
            brands={brands}
            sales={sales}
            onSubmit={(e) => {
              e.preventDefault();
              handleProductSubmit();
            }}
            submitting={submitting}
            editingProduct={editingProduct}
            onOpenMedia={openProductMedia}
          />
        ) : (
          <VariantManager 
            newVariant={newVariant}
            setNewVariant={setNewVariant}
            editingVariant={editingVariant}
            setEditingVariant={setEditingVariant}
            addVariant={addVariant}
            currentVariants={currentVariants}
            handleEditVariant={handleEditVariant}
            handleDeleteVariant={handleDeleteVariant}
            warehouses={warehouses}
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
