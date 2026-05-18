import React from 'react';
import { BrandCard } from '../BrandCard';
import { Brand } from '../schema';

interface BrandGridProps {
  brands: Brand[] | null;
  loading: boolean;
  onEdit: (brand: Brand) => void;
  onDelete: (id: string) => void;
}

export const BrandGrid: React.FC<BrandGridProps> = ({
  brands,
  loading,
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-10">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square bg-muted animate-pulse border border-border"
          />
        ))}
      </div>
    );
  }

  if (!brands || brands.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-20 h-20 bg-secondary border border-border flex items-center justify-center mb-4">
          <div className="w-10 h-10 bg-muted" />
        </div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest italic">
          No brands defined.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-10">
      {brands.map((brand) => (
        <BrandCard
          key={brand.id}
          brand={brand}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};