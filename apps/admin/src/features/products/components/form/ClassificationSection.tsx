import React from 'react';
import type { Category, Brand, Collection } from '@amber/shared';
import { formatCategoryOptionLabel, sortCategoriesHierarchically } from '@amber/shared';
import { Check } from 'lucide-react';
import { cn } from '../../../../lib/utils';

interface ClassificationSectionProps {
  brandId?: string;
  categoryId?: string;
  collectionIds: string[];
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  brands: Brand[];
  categories: Category[];
  collections: Collection[];
  onChange: (field: string, value: unknown) => void;
}

export const ClassificationSection: React.FC<ClassificationSectionProps> = ({
  brandId,
  categoryId,
  collectionIds,
  status,
  brands,
  categories,
  collections,
  onChange,
}) => {
  const toggleCollection = (id: string) => {
    const newIds = (collectionIds || []).includes(id)
      ? (collectionIds || []).filter((item) => item !== id)
      : [...(collectionIds || []), id];
    onChange('collectionIds', newIds);
  };

  const brandList = brands || [];
  const collectionList = collections || [];
  const categoryList = (categories || []).filter(
    (c): c is Category & { id: string } => typeof c.id === 'string',
  );
  const sortedCategories = sortCategoriesHierarchically(categoryList);

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">
            Brand/Vendor
          </label>
          <select
            value={brandId || ''}
            onChange={(e) => onChange('brandId', e.target.value)}
            className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-sm font-bold uppercase tracking-widest focus:border-primary focus:outline-none transition-colors duration-300 rounded-none"
          >
            <option value="">Select Brand</option>
            {brandList.map((brand: Brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">
            Classification
          </label>
          <select
            value={categoryId || ''}
            onChange={(e) => onChange('categoryId', e.target.value)}
            className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-sm font-bold uppercase tracking-widest focus:border-primary focus:outline-none transition-colors duration-300 rounded-none"
          >
            <option value="">Select Category</option>
            {sortedCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {formatCategoryOptionLabel(categoryList, cat)}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">
            Status
          </label>
          <select
            value={status || 'DRAFT'}
            onChange={(e) => onChange('status', e.target.value)}
            className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-sm font-bold uppercase tracking-widest focus:border-primary focus:outline-none transition-colors duration-300 rounded-none"
          >
            <option value="DRAFT">DRAFT</option>
            <option value="PUBLISHED">PUBLISHED</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground block">
          Thematic Collections
        </label>
        <div className="flex flex-wrap gap-4">
          {collectionList.map((coll: Collection) => (
            <button
              key={coll.id}
              type="button"
              onClick={() => toggleCollection(coll.id)}
              className={cn(
                'flex items-center gap-3 px-6 py-3 border transition-all duration-300',
                (collectionIds || []).includes(coll.id)
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border hover:border-primary/50 text-muted-foreground',
              )}
            >
              <div
                className={cn(
                  'w-4 h-4 border flex items-center justify-center transition-all',
                  (collectionIds || []).includes(coll.id)
                    ? 'bg-primary border-primary'
                    : 'border-muted-foreground/30',
                )}
              >
                {(collectionIds || []).includes(coll.id) && (
                  <Check size={10} className="text-white" />
                )}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest">{coll.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
