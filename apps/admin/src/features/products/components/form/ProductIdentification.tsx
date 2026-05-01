import React from 'react';

interface ProductIdentificationProps {
  name: string;
  slug: string;
  onChange: (field: string, value: string) => void;
}

export const ProductIdentification: React.FC<ProductIdentificationProps> = ({
  name,
  slug,
  onChange
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Product Title</label>
        <input 
          type="text" 
          required 
          value={name} 
          onChange={(e) => onChange('name', e.target.value)} 
          className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-2xl font-serif focus:border-primary focus:outline-none transition-colors duration-300 rounded-none" 
          placeholder="Enter Product Name..." 
        />
      </div>
      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Unique Slug</label>
        <input 
          type="text" 
          required 
          value={slug} 
          onChange={(e) => onChange('slug', e.target.value)} 
          className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-sm font-mono focus:border-primary focus:outline-none transition-colors duration-300 rounded-none" 
          placeholder="product-url-slug" 
        />
      </div>
    </div>
  );
};
