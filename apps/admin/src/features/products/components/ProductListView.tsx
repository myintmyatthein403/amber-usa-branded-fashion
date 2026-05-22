import React from 'react';
import { Trash2, Edit2, Layers, Tag, Power } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ProductWithRelations } from '../schema';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ProductListViewProps {
  products: ProductWithRelations[];
  onEdit: (product: ProductWithRelations) => void;
  onDelete: (id: string) => void;
}

export const ProductListView: React.FC<ProductListViewProps> = ({ products, onEdit, onDelete }) => {
  return (
    <div className="w-full overflow-hidden border border-border bg-background shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground w-24 text-center">Reference</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Product Portfolio</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Taxonomy</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground text-right">Price Point</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Lifecycle</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground text-center">Depth</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((product) => (
              <tr key={product.id} data-tour="product-row" className="group hover:bg-muted/30 transition-all duration-300">
                <td className="px-6 py-4">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-16 bg-secondary overflow-hidden border border-border group-hover:border-primary transition-colors duration-500">
                      {product.images?.[0] ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 grayscale group-hover:grayscale-0" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[8px] text-muted-foreground/40 italic text-center leading-tight">No Visuals</div>
                      )}
                    </div>
                    <span className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest">#{product.id?.split('-')[0].toUpperCase() || 'N/A'}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold uppercase tracking-tight text-foreground">{product.name}</span>
                    <span className="text-[10px] text-primary font-bold uppercase tracking-[0.1em]">{product.brand?.name || 'Amber Core'}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex px-2.5 py-1 text-[9px] font-bold text-muted-foreground uppercase tracking-widest bg-secondary border border-border">
                    {product.category?.name || 'Uncategorized'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="text-sm font-mono font-bold text-foreground">
                      {product.isUsdPrice ? '$' : 'Ks'}{Number(product.price).toLocaleString()}
                    </span>
                    {product.compareAtPrice && Number(product.compareAtPrice) > 0 && (
                      <span className="text-[9px] font-mono text-muted-foreground line-through opacity-50">
                        {product.isUsdPrice ? '$' : 'Ks'}{Number(product.compareAtPrice).toLocaleString()}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className={cn(
                    "inline-flex px-3 py-1 text-[9px] font-bold uppercase tracking-widest border",
                    product.status === 'PUBLISHED' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : 
                    product.status === 'DRAFT' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                    "bg-slate-500/10 text-slate-500 border-slate-500/20"
                  )}>
                    {product.status}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-foreground">
                      <Layers size={14} className="text-primary/60" />
                      {product.variants?.length || 0}
                    </div>
                    <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Variants</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button 
                      onClick={() => onEdit(product)}
                      className="p-2.5 text-muted-foreground hover:text-foreground transition-colors duration-300"
                      title="Refine Product"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => product.id && onDelete(product.id)}
                      className="p-2.5 text-muted-foreground hover:text-destructive transition-colors duration-300"
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
