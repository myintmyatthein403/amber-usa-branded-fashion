import React from 'react';
import { Tag, Edit2, Trash2 } from 'lucide-react';
import { buildCategoryPath } from '@amber/shared';
import { Category } from '../schema';

interface CategoryTableProps {
  categories: Category[] | null;
  allCategories?: Category[];
  loading: boolean;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

export const CategoryTable: React.FC<CategoryTableProps> = ({
  categories,
  allCategories = [],
  loading,
  onEdit,
  onDelete,
}) => {
  const lookup = allCategories.length > 0 ? allCategories : categories ?? [];

  return (
    <div className="border border-border bg-card shadow-sm overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
              Category
            </th>
            <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
              Slug
            </th>
            <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
              Parent
            </th>
            <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
              Order
            </th>
            <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
              Status
            </th>
            <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase text-right">
              Options
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {loading ? (
            <tr>
              <td colSpan={6} className="px-10 py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic animate-pulse">
                Syncing Collections...
              </td>
            </tr>
          ) : !categories || categories.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-10 py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic">
                No categories defined.
              </td>
            </tr>
          ) : (
            categories.map((category) => {
              const parentLabel = category.parentId
                ? buildCategoryPath(lookup, category.parentId)
                : '—';

              return (
                <tr key={category.id} className="group hover:bg-muted/50 transition-colors duration-300">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-secondary border border-border flex items-center justify-center shrink-0">
                        <Tag size={16} className="text-primary" />
                      </div>
                      <div>
                        <span className="text-lg font-serif text-foreground tracking-wide block">
                          {category.name}
                        </span>
                        {category.parentId && (
                          <span className="text-[10px] text-muted-foreground/60 uppercase tracking-widest">
                            {buildCategoryPath(lookup, category.id)}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-sm font-mono text-muted-foreground">{category.slug}</td>
                  <td className="px-10 py-6 text-sm text-muted-foreground">{parentLabel}</td>
                  <td className="px-10 py-6 text-sm font-mono text-muted-foreground">{category.displayOrder ?? 0}</td>
                  <td className="px-10 py-6">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest ${
                        category.isActive !== false ? 'text-green-600' : 'text-muted-foreground'
                      }`}
                    >
                      {category.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
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
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
