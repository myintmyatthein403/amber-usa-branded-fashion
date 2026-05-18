import React from 'react';
import { Edit2, Trash2, ImageIcon } from 'lucide-react';
import { Brand } from '../schema';

interface BrandCardProps {
  brand: Brand;
  onEdit: (brand: Brand) => void;
  onDelete: (id: string) => void;
}

export const BrandCard: React.FC<BrandCardProps> = ({ brand, onEdit, onDelete }) => {
  return (
    <div className="group relative bg-card border border-border hover:border-primary/30 transition-all duration-300">
      <div className="aspect-square flex flex-col items-center justify-center p-6">
        {brand.logo ? (
          <img 
            src={brand.logo} 
            alt={brand.name}
            className="w-20 h-20 object-contain mb-4"
          />
        ) : (
          <div className="w-20 h-20 bg-secondary border border-border flex items-center justify-center mb-4">
            <ImageIcon size={32} className="text-primary" />
          </div>
        )}
        <span className="text-lg font-serif text-foreground tracking-wide text-center">
          {brand.name}
        </span>
        <span className="text-[10px] font-mono text-muted-foreground/40 uppercase mt-2">
          {brand.id.slice(0, 8)}...
        </span>
      </div>
      
      <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button
          onClick={() => onEdit(brand)}
          className="p-2 bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary transition-all duration-300"
        >
          <Edit2 size={16} />
        </button>
        <button
          onClick={() => onDelete(brand.id)}
          className="p-2 bg-card border border-border text-muted-foreground hover:text-destructive hover:border-destructive transition-all duration-300"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};