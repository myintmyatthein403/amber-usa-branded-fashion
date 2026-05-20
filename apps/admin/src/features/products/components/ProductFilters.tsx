import React from 'react';
import { X, Filter } from 'lucide-react';
import { Category, Brand } from '../schema';

export type FilterState = {
  status: '' | 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  categoryId: string;
  brandId: string;
  onSale: boolean | null;
  isFeatured: boolean | null;
  isNewArrival: boolean | null;
  isBestSeller: boolean | null;
};

interface ProductFiltersProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  clearFilters: () => void;
  categories: Category[] | null;
  brands: Brand[] | null;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  setFilters,
  clearFilters,
  categories,
  brands,
}) => {
  const hasActiveFilters = 
    filters.status || 
    filters.categoryId || 
    filters.brandId || 
    filters.onSale !== null || 
    filters.isFeatured !== null ||
    filters.isNewArrival !== null ||
    filters.isBestSeller !== null;

  const updateFilter = (key: keyof FilterState, value: string | boolean | null) => {
    setFilters((prev: FilterState) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-card border border-border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          <Filter size={14} />
          Filters
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-[10px] font-bold uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <select
          value={filters.status}
          onChange={(e) => updateFilter('status', e.target.value)}
          className="bg-secondary/50 border border-border px-3 py-2 text-xs font-medium focus:outline-none focus:border-primary transition-colors"
        >
          <option value="">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </select>

        <select
          value={filters.categoryId}
          onChange={(e) => updateFilter('categoryId', e.target.value)}
          className="bg-secondary/50 border border-border px-3 py-2 text-xs font-medium focus:outline-none focus:border-primary transition-colors"
        >
          <option value="">All Categories</option>
          {categories?.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        <select
          value={filters.brandId}
          onChange={(e) => updateFilter('brandId', e.target.value)}
          className="bg-secondary/50 border border-border px-3 py-2 text-xs font-medium focus:outline-none focus:border-primary transition-colors"
        >
          <option value="">All Brands</option>
          {brands?.map(brand => (
            <option key={brand.id} value={brand.id}>{brand.name}</option>
          ))}
        </select>

        <button
          onClick={() => updateFilter('onSale', filters.onSale === true ? null : true)}
          className={`px-3 py-2 text-xs font-medium border transition-colors ${
            filters.onSale === true 
              ? 'bg-primary text-primary-foreground border-primary' 
              : 'bg-secondary/50 border-border text-muted-foreground hover:border-primary'
          }`}
        >
          On Sale
        </button>

        <button
          onClick={() => updateFilter('isFeatured', filters.isFeatured === true ? null : true)}
          className={`px-3 py-2 text-xs font-medium border transition-colors ${
            filters.isFeatured === true 
              ? 'bg-primary text-primary-foreground border-primary' 
              : 'bg-secondary/50 border-border text-muted-foreground hover:border-primary'
          }`}
        >
          Featured
        </button>

        <button
          onClick={() => updateFilter('isNewArrival', filters.isNewArrival === true ? null : true)}
          className={`px-3 py-2 text-xs font-medium border transition-colors ${
            filters.isNewArrival === true 
              ? 'bg-primary text-primary-foreground border-primary' 
              : 'bg-secondary/50 border-border text-muted-foreground hover:border-primary'
          }`}
        >
          New Arrival
        </button>

        <button
          onClick={() => updateFilter('isBestSeller', filters.isBestSeller === true ? null : true)}
          className={`px-3 py-2 text-xs font-medium border transition-colors ${
            filters.isBestSeller === true 
              ? 'bg-primary text-primary-foreground border-primary' 
              : 'bg-secondary/50 border-border text-muted-foreground hover:border-primary'
          }`}
        >
          Best Seller
        </button>
      </div>
    </div>
  );
};