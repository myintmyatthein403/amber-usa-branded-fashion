import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Category, Brand, Product } from "@amber/shared";
import { EditorialImagery } from './form/EditorialImagery';
import { ProductIdentification } from './form/ProductIdentification';
import { ProductStorytelling } from './form/ProductStorytelling';
import { PricingSection } from './form/PricingSection';
import { ClassificationSection } from './form/ClassificationSection';

interface ProductFormProps {
  productForm: Partial<Product>;
  setProductForm: (form: Partial<Product>) => void;
  categories: Category[] | null;
  brands: Brand[] | null;
  collections: any[] | null;
  sales: any[] | null;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  editingProduct: Product | null;
  onOpenMedia: (index?: number) => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  productForm,
  setProductForm,
  categories,
  brands,
  collections,
  onSubmit,
  submitting,
  editingProduct,
  onOpenMedia
}) => {
  const handleFieldChange = (field: string, value: unknown) => {
    setProductForm({ ...productForm, [field]: value });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-12 py-10 animate-in fade-in slide-in-from-left-4 duration-500">
      <EditorialImagery 
        images={productForm.images || []} 
        onChange={(images) => handleFieldChange('images', images)} 
        onOpenMedia={onOpenMedia} 
      />

      <ProductIdentification 
        name={productForm.name || ""} 
        slug={productForm.slug || ""} 
        onChange={handleFieldChange} 
      />

      <ProductStorytelling 
        description={productForm.description || ""} 
        onChange={(val) => handleFieldChange('description', val)} 
      />

      <PricingSection 
        price={productForm.price?.toString() || ""} 
        compareAtPrice={productForm.compareAtPrice?.toString() || ""} 
        isUsdPrice={productForm.isUsdPrice ?? true} 
        onChange={handleFieldChange} 
      />

<ClassificationSection 
        brandId={productForm.brandId || undefined} 
        categoryId={productForm.categoryId || undefined} 
        collectionIds={productForm.collectionIds || []}
        status={productForm.status} 
        brands={brands || []} 
        categories={categories || []}
        collections={collections || []}
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
