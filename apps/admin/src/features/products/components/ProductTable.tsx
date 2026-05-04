import React from 'react';
import { ShoppingBag, Trash2, Edit2, Tag, Layers } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Product } from '@amber/shared';
import { motion, AnimatePresence } from 'framer-motion';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ProductTableProps {
  products: Product[] | null;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({ products, onEdit, onDelete }) => {
  if (!products || products.length === 0) {
    return (
      <div className="py-24 text-center border border-dashed border-border bg-card/50">
        <div className="inline-flex p-4 rounded-full bg-secondary mb-4">
          <ShoppingBag className="w-8 h-8 text-muted-foreground/40" />
        </div>
        <p className="text-sm text-muted-foreground font-serif italic">Your collection is currently empty.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
      <AnimatePresence>
        {products.map((product) => (
          <motion.div 
            key={product.id}
            initial={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.3 } }}
            className="group relative bg-card border border-border overflow-hidden transition-all duration-700 hover:shadow-2xl hover:shadow-black/5 hover:-translate-y-1"
          >
            <div className="aspect-[4/5] bg-secondary relative overflow-hidden">
              {product.images?.[0] ? (
                <img 
                  src={product.images[0]} 
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground/20 italic font-serif">No Visuals</div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center gap-4">
                <button 
                  onClick={() => onEdit(product)}
                  className="w-12 h-12 bg-white text-black flex items-center justify-center hover:bg-primary hover:text-white transition-colors duration-300 translate-y-4 group-hover:translate-y-0 transition-transform delay-75"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => product.id && onDelete(product.id)}
                  className="w-12 h-12 bg-white text-black flex items-center justify-center hover:bg-destructive hover:text-white transition-colors duration-300 translate-y-4 group-hover:translate-y-0 transition-transform delay-150"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              {product.onSale && (
                <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 text-[10px] font-bold uppercase tracking-widest">Sale</div>
              )}
              <div className={cn(
                "absolute top-4 right-4 px-3 py-1 text-[10px] font-bold uppercase tracking-widest border shadow-sm",
                product.status === 'PUBLISHED' ? "bg-emerald-500 text-white border-emerald-600" : "bg-amber-500 text-white border-amber-600"
              )}>
                {product.status}
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">{product.category?.name || 'Uncategorized'}</span>
                  <h3 className="text-xl font-serif text-foreground mt-1 line-clamp-1">{product.name}</h3>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono font-bold">{product.isUsdPrice ? '$' : 'Ks'}{Number(product.price).toLocaleString()}</div>
                  {product.compareAtPrice && Number(product.compareAtPrice) > 0 && (
                    <div className="text-[10px] font-mono text-muted-foreground line-through opacity-50">
                      {product.isUsdPrice ? '$' : 'Ks'}{Number(product.compareAtPrice).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  <Layers size={14} className="text-primary" />
                  {product.variants?.length || 0} Dimensions
                </div>
                <div className="flex items-center gap-2">
                  <Tag size={12} className="text-primary/40" />
                  <span className="text-[10px] text-muted-foreground truncate max-w-[100px]">{product.tags?.slice(0, 2).join(', ')}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
