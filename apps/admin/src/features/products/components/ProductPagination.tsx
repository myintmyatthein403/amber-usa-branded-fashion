import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsOnPage: number;
  onPageChange: (page: number) => void;
}

export const ProductPagination: React.FC<ProductPaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsOnPage,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between pt-10 border-t border-border">
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        Showing {itemsOnPage} of {totalItems} Products
      </span>
      <div className="flex items-center gap-4">
        <button 
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="p-2 border border-border hover:border-primary disabled:opacity-30 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="text-xs font-mono font-bold">{currentPage} / {totalPages}</span>
        <button 
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="p-2 border border-border hover:border-primary disabled:opacity-30 transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};