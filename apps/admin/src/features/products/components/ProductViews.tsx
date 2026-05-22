import React from 'react';
import { ProductTable } from './ProductTable';
import { ProductListView } from './ProductListView';
import { ProductPagination } from './ProductPagination';
import { ProductLoadingState } from './ProductLoadingState';

interface ProductViewsProps {
  products: any[];
  meta: { total: number; page: number; limit: number; totalPages: number } | null;
  loading: boolean;
  viewMode: 'grid' | 'list';
  onEdit: (product: any) => void;
  onDelete: (id: string) => void;
  page: number;
  onPageChange: (page: number) => void;
}

export const ProductViews: React.FC<ProductViewsProps> = ({
  products,
  meta,
  loading,
  viewMode,
  onEdit,
  onDelete,
  page,
  onPageChange,
}) => {
  if (loading) {
    return <ProductLoadingState />;
  }

  return (
    <div className="space-y-10">
      {viewMode === 'grid' ? (
        <ProductTable 
          products={products} 
          onEdit={onEdit} 
          onDelete={onDelete} 
        />
      ) : (
        <ProductListView 
          products={products} 
          onEdit={onEdit} 
          onDelete={onDelete} 
        />
      )}

      {meta && (
        <ProductPagination
          currentPage={page}
          totalPages={meta.totalPages}
          totalItems={meta.total}
          itemsOnPage={products.length}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};