import React from 'react';
import { Plus, HelpCircle } from 'lucide-react';

interface ProductPageHeaderProps {
  onCreateProduct: () => void;
  onOpenTour: () => void;
}

export const ProductPageHeader: React.FC<ProductPageHeaderProps> = ({
  onCreateProduct,
  onOpenTour,
}) => {
  return (
    <div className="flex items-end justify-between">
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase leading-none">Catalog Management</span>
        <h2 className="text-4xl font-serif text-foreground tracking-tight">Product Archive</h2>
      </div>
      <div className="flex items-center gap-3">
        <button 
          onClick={onCreateProduct}
          className="flex items-center gap-3 bg-foreground text-primary-foreground px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all duration-300 shadow-xl shadow-black/5"
          data-tour="init-button"
        >
          <Plus size={18} /> Initialize Product
        </button>
        <button
          onClick={onOpenTour}
          className="p-3 border border-border hover:border-primary text-muted-foreground hover:text-primary transition-all duration-300"
          title="Product Tour"
        >
          <HelpCircle size={20} />
        </button>
      </div>
    </div>
  );
};