import React from 'react';
import { Trash2, Edit2, Layers, Tag, Eye } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Product } from '../schema';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ProductListViewProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export const ProductListView: React.FC<ProductListViewProps> = ({ products, onEdit, onDelete }) => {
  return (
    <div className="bg-card border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/5">
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground w-20">Preview</th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Product Details</th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Category</th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Price</th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Variants</th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((product) => (
              <tr key={product.id} className="group hover:bg-muted/5 transition-colors duration-300">
                <td className="p-4">
                  <div className="w-12 h-16 bg-secondary overflow-hidden border border-border">
                    {product.images?.[0] ? (
                      <img 
                        src={product.images[0]} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[8px] text-muted-foreground/40 italic text-center leading-tight">No Visuals</div>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-foreground line-clamp-1">{product.name}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">#{product.id.split('-')[0].toUpperCase()}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{product.category?.name || 'Uncategorized'}</span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-mono font-bold text-foreground">
                      {product.isUsdPrice ? '$' : 'Ks'}{parseFloat(product.price).toLocaleString()}
                    </span>
                    {product.compareAtPrice && parseFloat(product.compareAtPrice) > 0 && (
                      <span className="text-[10px] font-mono text-muted-foreground line-through opacity-50">
                        {product.isUsdPrice ? '$' : 'Ks'}{parseFloat(product.compareAtPrice).toLocaleString()}
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <div className={cn(
                    "inline-flex px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest border",
                    product.status === 'PUBLISHED' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : 
                    product.status === 'DRAFT' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                    "bg-slate-500/10 text-slate-500 border-slate-500/20"
                  )}>
                    {product.status}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    <Layers size={12} className="text-primary/60" />
                    {product.variants?.length || 0}
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button 
                      onClick={() => onEdit(product)}
                      className="p-2 text-muted-foreground hover:text-primary transition-colors duration-300"
                      title="Refine Product"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => onDelete(product.id)}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors duration-300"
                      title="Delete Product"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
