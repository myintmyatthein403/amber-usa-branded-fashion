import React from 'react';
import { Modal } from '../../../components/admin/Modal';
import { ProductForm } from './ProductForm';
import { VariantManager } from './VariantManager';
import { useAttributes } from '../../attributes/useAttributes';
import { Variant, Brand, Sale, Warehouse } from '../schema';
import type { Category } from '@amber/shared';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  step: number;
  onStepChange: (step: number) => void;
  isEditing: boolean;
  productForm: any;
  setProductForm: any;
  categories: Category[] | null;
  brands: Brand[] | null;
  sales: Sale[] | null;
  onNext: () => void;
  submitting: boolean;
  onOpenMedia: any;
  newVariant: any;
  setNewVariant: any;
  editingVariant: any;
  setEditingVariant: any;
  addVariant: () => void;
  addBulkVariants?: (variants: any[]) => void;
  currentVariants: any;
  handleEditVariant: any;
  handleDeleteVariant: any;
  warehouses: any;
  attributes?: any[];
  onSave: () => void;
  productSlug?: string;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  step,
  onStepChange,
  isEditing,
  productForm,
  setProductForm,
  categories,
  brands,
  sales,
  onNext,
  submitting,
  onOpenMedia,
  newVariant,
  setNewVariant,
  editingVariant,
  setEditingVariant,
addVariant,
    addBulkVariants,
    currentVariants,
    handleEditVariant,
    handleDeleteVariant,
    warehouses,
    attributes: propAttributes,
    onSave,
    productSlug,
  }) => {
  const { attributes: fetchedAttributes } = useAttributes();
  const attributes = propAttributes || fetchedAttributes;
  
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isEditing ? "Refine Product SKUs" : "Initialize New Product"}
      size="xl"
    >
      <div className="flex gap-10 mb-10 border-b border-border">
        <button 
          onClick={() => onStepChange(1)}
          className={`pb-4 text-[10px] font-bold uppercase tracking-[0.3em] transition-all duration-300 border-b-2 ${step === 1 ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'}`}
        >
          01. Core Definition
        </button>
        <button 
          disabled={!isEditing && step === 1}
          onClick={() => onStepChange(2)}
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
          onNext={onNext}
          submitting={submitting}
          editingProduct={null}
          onOpenMedia={onOpenMedia}
          collections={null}
        />
      ) : (
        <VariantManager 
          newVariant={newVariant}
          setNewVariant={setNewVariant}
          editingVariant={editingVariant}
          setEditingVariant={setEditingVariant}
          addVariant={addVariant}
          addBulkVariants={addBulkVariants}
          currentVariants={currentVariants as any}
          handleEditVariant={handleEditVariant as any}
          handleDeleteVariant={handleDeleteVariant as any}
          warehouses={warehouses as any}
          setStep={onStepChange as any}
          onSave={onSave}
          submitting={submitting}
          onOpenMedia={onOpenMedia as any}
          productSlug={productSlug}
          attributes={attributes}
        />
      )}
    </Modal>
  );
};