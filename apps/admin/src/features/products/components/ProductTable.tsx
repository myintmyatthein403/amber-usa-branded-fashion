import React from 'react';
import { ShoppingBag, Trash2, Edit2, Tag, Layers, Power } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ProductWithRelations } from '@amber/shared';
import { motion, AnimatePresence } from 'framer-motion';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ProductTableProps {
  products: ProductWithRelations[] | null;
  onEdit: (product: ProductWithRelations) => void;
  onDelete: (id: string) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({ products, onEdit, onDelete }) => {
  if (!products || products.length === 0) {
    return (
      <div className="py-24 text-center border border-border bg-card/50">
        <div className="inline-flex p-4 rounded-none bg-secondary mb-4 border border-border">
          <ShoppingBag className="w-8 h-8 text-muted-foreground/40" />
        </div>
        <p className="text-sm text-muted-foreground font-serif italic">Your collection is currently empty.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <AnimatePresence>
        {products.map((product, index) => (
          <motion.div 
            key={product.id}
            data-tour="product-row"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: index * 0.05, duration: 0.5 }}
            className="group relative bg-background border border-border overflow-hidden transition-all duration-700 hover:shadow-2xl hover:shadow-black/5"
          >
            <div className="aspect-[3/4] bg-secondary relative overflow-hidden">
              {product.images?.[0] ? (
                <img 
                  src={product.images[0]} 
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 grayscale group-hover:grayscale-0" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground/20 italic font-serif">No Visuals</div>
              )}
              
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center gap-4 backdrop-blur-[2px]">
                <button 
                  onClick={() => onEdit(product)}
                  className="w-12 h-12 bg-white text-black flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 translate-y-4 group-hover:translate-y-0 shadow-xl"
                  title="Refine Specifications"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => product.id && onDelete(product.id)}
                  className="w-12 h-12 bg-white text-black flex items-center justify-center hover:bg-destructive hover:text-white transition-all duration-300 translate-y-4 group-hover:translate-y-0 shadow-xl"
                  title="Remove from Archive"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {product.onSale && (
                <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg">Sale</div>
              )}
              
              <div className={cn(
                "absolute top-4 right-4 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] border shadow-lg backdrop-blur-md",
                product.status === 'PUBLISHED' ? "bg-emerald-500/90 text-white border-emerald-400/50" : "bg-amber-500/90 text-white border-amber-400/50"
              )}>
                {product.status}
              </div>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">
                    {product.brand?.name || 'Amber Core'}
                  </span>
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-foreground">
                      {product.isUsdPrice ? '$' : 'Ks'}{Number(product.price).toLocaleString()}
                    </div>
                  </div>
                </div>
                <h3 className="text-sm font-serif text-foreground line-clamp-1 tracking-tight leading-tight">{product.name}</h3>
              </div>

              <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-secondary border border-border rounded-none">
                    <Layers size={10} className="text-primary/60" />
                    <span className="text-[9px] font-bold text-muted-foreground uppercase">{product.variants?.length || 0}</span>
                  </div>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{product.category?.name || 'Catalog'}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Tag size={10} className="text-primary/40" />
                  <span className="text-[9px] text-muted-foreground truncate max-w-[80px] font-medium italic">
                    {product.tags?.slice(0, 2).join(', ') || 'No tags'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
