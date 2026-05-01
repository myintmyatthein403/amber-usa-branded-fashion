import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Category, Brand, Sale } from '../schema';
import { EditorialImagery } from './form/EditorialImagery';
import { ProductIdentification } from './form/ProductIdentification';
import { ProductStorytelling } from './form/ProductStorytelling';
import { PricingSection } from './form/PricingSection';
import { ClassificationSection } from './form/ClassificationSection';

interface ProductFormProps {
  productForm: any;
  setProductForm: (form: any) => void;
  categories: Category[] | null;
  brands: Brand[] | null;
  sales: Sale[] | null;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  editingProduct: any;
  onOpenMedia: (index?: number) => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  productForm,
  setProductForm,
  categories,
  brands,
  onSubmit,
  submitting,
  editingProduct,
  onOpenMedia
}) => {
  const handleFieldChange = (field: string, value: any) => {
    setProductForm({ ...productForm, [field]: value });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-12 py-10 animate-in fade-in slide-in-from-left-4 duration-500">
      <EditorialImagery 
        images={productForm.images} 
        onChange={(images) => handleFieldChange('images', images)} 
        onOpenMedia={onOpenMedia} 
      />

      <ProductIdentification 
        name={productForm.name} 
        slug={productForm.slug} 
        onChange={handleFieldChange} 
      />

      <ProductStorytelling 
        description={productForm.description} 
        onChange={(val) => handleFieldChange('description', val)} 
      />

      <PricingSection 
        price={productForm.price} 
        compareAtPrice={productForm.compareAtPrice} 
        isUsdPrice={productForm.isUsdPrice} 
        onChange={handleFieldChange} 
      />

      <ClassificationSection 
        brandId={productForm.brandId} 
        categoryId={productForm.categoryId} 
        status={productForm.status} 
        brands={brands} 
        categories={categories} 
        onChange={handleFieldChange} 
      />

      <div className="flex justify-end pt-10 border-t border-border">
        <button type="submit" disabled={submitting} className="flex items-center gap-3 bg-foreground text-primary-foreground px-10 py-4 text-xs font-bold uppercase tracking-[0.3em] hover:bg-primary transition-colors duration-500 disabled:opacity-50">
          {submitting ? 'Processing...' : editingProduct ? 'Commit Changes' : 'Initialize SKU'}
          <ChevronRight size={16} />
        </button>
      </div>
    </form>
  );
};
