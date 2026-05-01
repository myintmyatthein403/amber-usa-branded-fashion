import React from 'react';
import { Category, Brand } from '../../schema';

interface ClassificationSectionProps {
  brandId: string;
  categoryId: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  brands: Brand[] | null;
  categories: Category[] | null;
  onChange: (field: string, value: string) => void;
}

export const ClassificationSection: React.FC<ClassificationSectionProps> = ({
  brandId,
  categoryId,
  status,
  brands,
  categories,
  onChange
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Brand/Vendor</label>
        <select 
          value={brandId} 
          onChange={(e) => onChange('brandId', e.target.value)} 
          className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-sm font-bold uppercase tracking-widest focus:border-primary focus:outline-none transition-colors duration-300 rounded-none"
        >
          <option value="">Select Brand</option>
          {brands?.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
        </select>
      </div>
      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Classification</label>
        <select 
          value={categoryId} 
          onChange={(e) => onChange('categoryId', e.target.value)} 
          className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-sm font-bold uppercase tracking-widest focus:border-primary focus:outline-none transition-colors duration-300 rounded-none"
        >
          <option value="">Select Category</option>
          {categories?.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
        </select>
      </div>
      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Status</label>
        <select 
          value={status} 
          onChange={(e) => onChange('status', e.target.value)} 
          className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-sm font-bold uppercase tracking-widest focus:border-primary focus:outline-none transition-colors duration-300 rounded-none"
        >
          <option value="DRAFT">DRAFT</option>
          <option value="PUBLISHED">PUBLISHED</option>
          <option value="ARCHIVED">ARCHIVED</option>
        </select>
      </div>
    </div>
  );
};
