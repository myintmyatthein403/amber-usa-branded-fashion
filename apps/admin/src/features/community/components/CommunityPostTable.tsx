import React from 'react';
import { Edit2, Trash2, Heart, Star, Power } from 'lucide-react';
import { CommunityPost } from '../schema';

interface CommunityPostTableProps {
  posts: CommunityPost[];
  onEdit: (post: CommunityPost) => void;
  onDelete: (id: string) => void;
  onToggleActive: (post: CommunityPost) => void;
}

export const CommunityPostTable: React.FC<CommunityPostTableProps> = ({
  posts,
  onEdit,
  onDelete,
  onToggleActive
}) => {
  if (!posts || posts.length === 0) {
    return (
      <div className="py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic border border-border bg-background">
        No community posts found.
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden border border-border bg-background">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">User</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Comment</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground text-center">Stats</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Status</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {posts.map((post) => (
            <tr key={post.id} className="group hover:bg-muted/30 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 border border-border overflow-hidden">
                    <img src={post.image} alt="" className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-widest">{post.user}</span>
                    <span className="text-[10px] text-primary uppercase font-medium">{post.handle}</span>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <p className="text-xs text-muted-foreground line-clamp-1 italic max-w-md">"{post.comment}"</p>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col items-center gap-1">
                   <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                      <Heart size={10} className="fill-muted-foreground/20" />
                      {post.likes}
                   </div>
                   <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={8} className={i < post.stars ? "fill-primary text-primary" : "text-muted"} />
                    ))}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest border ${post.isActive ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-muted text-muted-foreground border-border'}`}>
                  {post.isActive ? 'Active' : 'Hidden'}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onToggleActive(post)}
                    className={`p-2 transition-colors ${post.isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    title={post.isActive ? 'Hide' : 'Show'}
                  >
                    <Power size={14} />
                  </button>
                  <button
                    onClick={() => onEdit(post)}
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => onDelete(post.id)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
