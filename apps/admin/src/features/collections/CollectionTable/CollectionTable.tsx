import React from 'react';
import { Layers, Globe, CheckCircle2, XCircle, Edit2, Trash2 } from 'lucide-react';
import { Collection } from '../schema';

interface CollectionTableProps {
  collections: Collection[] | null;
  loading: boolean;
  onEdit: (collection: Collection) => void;
  onDelete: (id: string) => void;
}

export const CollectionTable: React.FC<CollectionTableProps> = ({ 
  collections, 
  loading, 
  onEdit, 
  onDelete 
}) => {
  return (
    <div className="border border-border bg-card shadow-sm overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">Identity</th>
            <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">Description</th>
            <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase text-center">Status</th>
            <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase text-right">Options</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {loading ? (
            <tr><td colSpan={4} className="px-10 py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic animate-pulse">Querying Collection Repository...</td></tr>
          ) : !collections || collections.length === 0 ? (
            <tr><td colSpan={4} className="px-10 py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic">No collections found.</td></tr>
          ) : (
            collections.map((collection) => (
              <tr key={collection.id} className="group hover:bg-muted/50 transition-colors duration-300">
                <td className="px-10 py-6">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-secondary border border-border flex items-center justify-center overflow-hidden">
                      {collection.image ? (
                        <img src={collection.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                      ) : (
                        <Layers size={16} className="text-primary/30" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="text-lg font-serif text-foreground tracking-wide">{collection.name}</div>
                      <div className="text-[9px] font-mono text-muted-foreground/40 uppercase tracking-widest flex items-center gap-2">
                        <Globe size={8} /> {collection.slug}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-10 py-6">
                  <p className="text-xs text-muted-foreground max-w-md line-clamp-2 italic">
                    {collection.description || "No description recorded."}
                  </p>
                </td>
                <td className="px-10 py-6 text-center">
                  <div className="flex justify-center">
                    {collection.isActive ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wider">
                        <CheckCircle2 size={12} /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                        <XCircle size={12} /> Inactive
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-10 py-6 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button 
                      onClick={() => onEdit(collection)}
                      className="p-2.5 text-muted-foreground hover:text-foreground transition-colors duration-300"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => onDelete(collection.id)}
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
