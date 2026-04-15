import React from 'react';
import { Tag, Edit2, Trash2 } from 'lucide-react';
import { Category } from '../schema';

interface CategoryTableProps {
  categories: Category[] | null;
  loading: boolean;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

export const CategoryTable: React.FC<CategoryTableProps> = ({ categories, loading, onEdit, onDelete }) => {
  return (
    <div className="border border-border bg-card shadow-sm overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">System UUID</th>
            <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">Label</th>
            <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase text-right">Options</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {loading ? (
            <tr><td colSpan={3} className="px-10 py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic animate-pulse">Syncing Collections...</td></tr>
          ) : !categories || categories.length === 0 ? (
            <tr><td colSpan={3} className="px-10 py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic">No categories defined.</td></tr>
          ) : (
            categories.map((category) => (
              <tr key={category.id} className="group hover:bg-muted/50 transition-colors duration-300">
                <td className="px-10 py-6 text-[10px] font-mono text-muted-foreground/40 uppercase">
                  {category.id}
                </td>
                <td className="px-10 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-secondary border border-border flex items-center justify-center">
                      <Tag size={16} className="text-primary" />
                    </div>
                    <span className="text-lg font-serif text-foreground tracking-wide">{category.name}</span>
                  </div>
                </td>
                <td className="px-10 py-6 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button 
                      onClick={() => onEdit(category)}
                      className="p-2.5 text-muted-foreground hover:text-foreground transition-colors duration-300"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => onDelete(category.id)}
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
