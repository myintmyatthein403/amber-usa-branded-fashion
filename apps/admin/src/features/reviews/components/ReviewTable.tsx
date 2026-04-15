import React from 'react';
import { 
  Star, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Globe, 
  Facebook, 
  Instagram, 
  User,
  ShoppingBag
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';
import { Review } from '../schema';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ReviewTableProps {
  reviews: Review[];
  onToggleApproval: (id: string) => void;
  onDelete: (id: string) => void;
}

export const ReviewTable: React.FC<ReviewTableProps> = ({ 
  reviews, 
  onToggleApproval, 
  onDelete 
}) => {
  const getPlatformIcon = (platform: Review['platform']) => {
    switch (platform) {
      case 'FACEBOOK': return <Facebook size={14} className="text-blue-600" />;
      case 'INSTAGRAM': return <Instagram size={14} className="text-pink-600" />;
      case 'TIKTOK': return <span className="text-[10px] font-bold">TT</span>;
      default: return <Globe size={14} className="text-muted-foreground" />;
    }
  };

  if (reviews.length === 0) {
    return (
      <div className="py-24 text-center border border-dashed border-border bg-card/50">
        <div className="inline-flex p-4 rounded-full bg-secondary mb-4">
          <Star className="w-8 h-8 text-muted-foreground/40" />
        </div>
        <p className="text-sm text-muted-foreground font-serif italic">No customer feedback detected.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {reviews.map((review) => (
        <div key={review.id} className="group relative bg-card border border-border p-8 transition-all duration-500 hover:shadow-2xl hover:shadow-black/5 hover:border-primary/20">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={12} 
                  className={i < review.rating ? "fill-primary text-primary" : "text-muted-foreground/20"} 
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-secondary border border-border">
                {getPlatformIcon(review.platform)}
              </div>
              <button 
                onClick={() => onDelete(review.id)}
                className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-foreground font-medium leading-relaxed italic line-clamp-3">
              "{review.comment || 'No written feedback.'}"
            </p>

            <div className="pt-6 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-primary border border-border">
                  <User size={14} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
                    {review.userName}
                    {review.userProfileUrl && (
                      <a href={review.userProfileUrl} target="_blank" rel="noreferrer" className="text-primary hover:opacity-70">
                        <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                  <div className="text-[9px] text-muted-foreground font-mono mt-0.5">
                    {format(new Date(review.createdAt), 'MMM dd, yyyy')}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <ShoppingBag size={12} className="text-primary/40" />
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest truncate max-w-[120px]">
                  {review.product.name}
                </span>
              </div>
              <button 
                onClick={() => onToggleApproval(review.id)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest border transition-all duration-300",
                  review.isApproved 
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                    : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                )}
              >
                {review.isApproved ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                {review.isApproved ? 'Approved' : 'Pending'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
