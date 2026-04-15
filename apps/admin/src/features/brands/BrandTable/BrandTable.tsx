import React from 'react';
import { Tag, Edit2, Trash2 } from 'lucide-react';
import { Brand } from '../schema';

interface BrandTableProps {
  brands: Brand[] | null;
  loading: boolean;
  onEdit: (brand: Brand) => void;
  onDelete: (id: string) => void;
}

export const BrandTable: React.FC<BrandTableProps> = ({ brands, loading, onEdit, onDelete }) => {
  return (
    <div className="border border-border bg-card shadow-sm overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">Identity</th>
            <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">Internal Notes</th>
            <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase text-right">Options</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {loading ? (
            <tr><td colSpan={3} className="px-10 py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic animate-pulse">Querying Brand Repository...</td></tr>
          ) : !brands || brands.length === 0 ? (
            <tr><td colSpan={3} className="px-10 py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic">No brands found.</td></tr>
          ) : (
            brands.map((brand) => (
              <tr key={brand.id} className="group hover:bg-muted/50 transition-colors duration-300">
                <td className="px-10 py-6">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-secondary border border-border flex items-center justify-center overflow-hidden">
                      {brand.logo ? (
                        <img src={brand.logo} className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500" />
                      ) : (
                        <Tag size={16} className="text-primary/30" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="text-lg font-serif text-foreground tracking-wide">{brand.name}</div>
                      <div className="text-[9px] font-mono text-muted-foreground/40 uppercase tracking-widest">{brand.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-10 py-6">
                  <p className="text-xs text-muted-foreground max-w-md line-clamp-2 italic">
                    {brand.note || "No internal notes recorded."}
                  </p>
                </td>
                <td className="px-10 py-6 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button 
                      onClick={() => onEdit(brand)}
                      className="p-2.5 text-muted-foreground hover:text-foreground transition-colors duration-300"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => onDelete(brand.id)}
                      className="p-2.5 text-muted-foreground hover:text-destructive transition-colors duration-300"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
