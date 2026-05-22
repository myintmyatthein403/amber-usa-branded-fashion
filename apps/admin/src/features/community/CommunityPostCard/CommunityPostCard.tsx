import React, { useState } from 'react';
import { Heart, Check, Edit2, Trash2, Power, Star, AlertTriangle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CommunityPost } from '../schema';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CommunityPostCardProps {
  post: CommunityPost;
  onEdit: (post: CommunityPost) => void;
  onDelete: (id: string) => void;
  onToggleActive: (post: CommunityPost) => void;
}

export const CommunityPostCard: React.FC<CommunityPostCardProps> = ({
  post,
  onEdit,
  onDelete,
  onToggleActive
}) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = () => {
    if (showConfirm) {
      onDelete(post.id);
      setShowConfirm(false);
    } else {
      setShowConfirm(true);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  return (
    <div className={cn(
      "group relative bg-card border transition-all duration-500 overflow-hidden",
      post.isActive ? "border-primary shadow-lg shadow-primary/5" : "border-border hover:border-primary/50"
    )}>
      <div className="aspect-square bg-muted relative overflow-hidden">
        <img src={post.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
        <div className="absolute top-4 right-4 flex gap-2">
           {post.isActive && (
            <div className="bg-primary text-white p-1.5 rounded-full shadow-lg">
              <Check size={12} />
            </div>
           )}
        </div>

        {/* Confirmation Overlay */}
        {showConfirm && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-4 z-20">
            <AlertTriangle className="w-8 h-8 text-destructive" />
            <p className="text-white text-xs font-bold text-center px-4">Delete this community post?</p>
            <div className="flex gap-3">
              <button 
                onClick={handleDelete}
                className="px-4 py-2 bg-destructive text-white text-[10px] font-bold uppercase tracking-wider hover:bg-destructive/80 transition-colors"
              >
                Confirm
              </button>
              <button 
                onClick={handleCancel}
                className="px-4 py-2 bg-white text-black text-[10px] font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
           <button onClick={() => onEdit(post)} className="p-3 bg-white text-black hover:bg-primary hover:text-white transition-colors"><Edit2 size={18}/></button>
           <button onClick={handleDelete} className={cn("p-3 transition-colors", showConfirm ? "bg-destructive text-white" : "bg-white text-destructive hover:bg-destructive hover:text-white")}><Trash2 size={18}/></button>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div className="min-w-0">
            <h4 className="text-[11px] font-bold uppercase tracking-widest truncate text-primary">{post.handle}</h4>
            <p className="text-[10px] text-muted-foreground font-medium truncate">{post.user}</p>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
            <Heart size={10} className="fill-muted-foreground/20" />
            {post.likes}
          </div>
        </div>
        <p className="text-[11px] text-foreground leading-relaxed line-clamp-2 italic">
          "{post.comment}"
        </p>
        <div className="flex items-center justify-between pt-3 border-t border-border">
           <button 
            onClick={() => onToggleActive(post)}
            className={cn(
              "flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest transition-colors",
              post.isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
            )}
           >
             <Power size={12} />
             {post.isActive ? 'Active' : 'Hidden'}
           </button>
           <div className="flex space-x-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={8} className={i < post.stars ? "text-primary fill-primary" : "text-muted-foreground/20"} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};