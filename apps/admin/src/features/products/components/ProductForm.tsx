import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Category, Brand } from "@amber/shared";
import type { Product } from "@amber/shared";
import { EditorialImagery } from './form/EditorialImagery';
import { ProductIdentification } from './form/ProductIdentification';
import { ProductStorytelling } from './form/ProductStorytelling';
import { PricingSection } from './form/PricingSection';
import { ClassificationSection } from './form/ClassificationSection';
import type { Sale } from '../schema';
import type { Collection } from '@amber/shared';

interface ProductFormProps {
  productForm: Partial<Product> & {
    currency?: string;
    currencyCode?: string;
    nameMy?: string;
    descriptionMy?: string;
    publishAt?: string;
    tags?: string[];
  };
  setProductForm: (form: ProductFormProps['productForm']) => void;
  categories: Category[] | null;
  brands: Brand[] | null;
  collections: Collection[] | null;
  sales: Sale[] | null;
  onNext?: () => void;
  submitting: boolean;
  editingProduct: { id?: string } | null;
  onOpenMedia: (index?: number) => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  productForm,
  setProductForm,
  categories,
  brands,
  collections,
  sales,
  onNext,
  submitting,
  editingProduct,
  onOpenMedia
}) => {
  const handleFieldChange = (field: string, value: unknown) => {
    setProductForm({ ...productForm, [field]: value });
  };

  const handleCurrencyChange = (code: string) => {
    setProductForm({
      ...productForm,
      currency: code as 'USD' | 'MMK' | 'THB',
      currencyCode: code as 'USD' | 'MMK' | 'THB',
      isUsdPrice: code === 'USD',
    });
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (onNext) onNext();
  };

  const tagsInput = (productForm.tags || []).join(', ');

  return (
    <form onSubmit={handleNext} className="space-y-12 py-10 animate-in fade-in slide-in-from-left-4 duration-500">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Name (Burmese)</label>
          <input
            type="text"
            value={productForm.nameMy || ''}
            onChange={(e) => handleFieldChange('nameMy', e.target.value)}
            className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-lg font-serif focus:border-primary focus:outline-none transition-colors duration-300 rounded-none"
            placeholder="မြန်မာအမည်..."
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Market Visibility</label>
          <select
            value={productForm.visibility || 'BOTH'}
            onChange={(e) => handleFieldChange('visibility', e.target.value)}
            className="w-full h-12 border-b border-input bg-background px-2 text-sm focus:border-primary focus:outline-none rounded-sm cursor-pointer"
          >
            <option value="BOTH">Show in Both Markets</option>
            <option value="USA">USA Market Only</option>
            <option value="MYANMAR">Myanmar Market Only</option>
            <option value="PRE_ORDER_ONLY">Pre-order Only</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Scheduled Publish</label>
          <input
            type="datetime-local"
            value={productForm.publishAt || ''}
            onChange={(e) => handleFieldChange('publishAt', e.target.value)}
            className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-sm font-mono focus:border-primary focus:outline-none transition-colors duration-300 rounded-none"
          />
        </div>
      </div>

      <ProductStorytelling 
        description={productForm.description || ""} 
        onChange={(val) => handleFieldChange('description', val)} 
      />

      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Description (Burmese)</label>
        <textarea
          value={productForm.descriptionMy || ''}
          onChange={(e) => handleFieldChange('descriptionMy', e.target.value)}
          rows={3}
          className="w-full border border-input bg-card px-4 py-3 text-sm focus:border-primary focus:outline-none transition-colors duration-300"
          placeholder="မြန်မာဖော်ပြချက်..."
        />
      </div>

      <PricingSection 
        price={productForm.price?.toString() || ""} 
        compareAtPrice={productForm.compareAtPrice?.toString() || ""} 
        currency={productForm.currency || productForm.currencyCode || 'USD'} 
        onChange={handleFieldChange}
        onCurrencyChange={handleCurrencyChange}
      />

      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Sale / Promotion</label>
        <select
          value={productForm.saleId || ''}
          onChange={(e) => handleFieldChange('saleId', e.target.value)}
          className="w-full h-12 border-b border-input bg-background px-2 text-sm focus:border-primary focus:outline-none rounded-sm cursor-pointer"
        >
          <option value="">No sale</option>
          {(sales || []).map((sale) => (
            <option key={sale.id} value={sale.id}>{sale.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Tags (comma-separated)</label>
        <input
          type="text"
          value={tagsInput}
          onChange={(e) =>
            handleFieldChange(
              'tags',
              e.target.value.split(',').map((t) => t.trim()).filter(Boolean)
            )
          }
          className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-sm focus:border-primary focus:outline-none transition-colors duration-300 rounded-none"
          placeholder="summer, silk, new"
        />
      </div>

      <div className="space-y-6">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground border-b border-border pb-4">SEO</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Meta Title</label>
            <input
              type="text"
              value={productForm.metaTitle || ''}
              onChange={(e) => handleFieldChange('metaTitle', e.target.value)}
              className="w-full h-10 border-b border-input bg-transparent px-0 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Meta Description</label>
            <input
              type="text"
              value={productForm.metaDescription || ''}
              onChange={(e) => handleFieldChange('metaDescription', e.target.value)}
              className="w-full h-10 border-b border-input bg-transparent px-0 text-sm focus:border-primary focus:outline-none"
            />
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground/60 font-mono">
          Preview URL: /shop/{productForm.slug || 'product-slug'}
        </p>
      </div>

      <div className="flex flex-wrap gap-6">
        {[
          { key: 'isFeatured', label: 'Featured' },
          { key: 'isNewArrival', label: 'New Arrival' },
          { key: 'isBestSeller', label: 'Best Seller' },
        ].map(({ key, label }) => (
          <label key={key} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean((productForm as Record<string, unknown>)[key])}
              onChange={(e) => handleFieldChange(key, e.target.checked)}
              className="accent-primary"
            />
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
          </label>
        ))}
      </div>

      <div className="space-y-6 p-6 border border-dashed border-primary/20 bg-secondary/30">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Preorder</h4>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={productForm.isPreOrder ?? false}
            onChange={(e) => handleFieldChange('isPreOrder', e.target.checked)}
            className="accent-primary"
          />
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Enable Preorder</span>
        </label>
        {productForm.isPreOrder && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Shipping Date</label>
              <input
                type="date"
                value={productForm.preOrderShippingDate || ''}
                onChange={(e) => handleFieldChange('preOrderShippingDate', e.target.value)}
                className="w-full h-10 border-b border-input bg-transparent px-0 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Preorder Note</label>
              <input
                type="text"
                value={productForm.preOrderNote || ''}
                onChange={(e) => handleFieldChange('preOrderNote', e.target.value)}
                className="w-full h-10 border-b border-input bg-transparent px-0 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

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
          {submitting ? 'Processing...' : editingProduct ? 'Proceed to Variants' : 'Proceed to Variants'}
          <ChevronRight size={16} />
        </button>
      </div>
    </form>
  );
};
