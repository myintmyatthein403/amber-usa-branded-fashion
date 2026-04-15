import React from 'react';
import { Edit2, Trash2, ArrowUpRight } from 'lucide-react';
import { Ad, AdStatus } from '../schema';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AdCardProps {
  ad: Ad;
  onEdit: (ad: Ad) => void;
  onDelete: (id: string) => void;
}

export const AdCard: React.FC<AdCardProps> = ({ ad, onEdit, onDelete }) => {
  return (
    <div className="group bg-card border border-border overflow-hidden flex flex-col transition-all duration-500 hover:shadow-2xl hover:shadow-black/5">
      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
        <img 
          src={ad.imageUrl} 
          alt={ad.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
           <div className="flex gap-2">
              <button onClick={() => onEdit(ad)} className="w-10 h-10 bg-white text-black flex items-center justify-center rounded-full hover:bg-primary hover:text-white transition-all">
                <Edit2 size={16} />
              </button>
              <button onClick={() => onDelete(ad.id)} className="w-10 h-10 bg-white text-black flex items-center justify-center rounded-full hover:bg-destructive hover:text-white transition-all">
                <Trash2 size={16} />
              </button>
           </div>
        </div>
        <div className="absolute top-4 left-4 flex gap-2">
          <span className={cn(
            "text-[8px] font-bold uppercase tracking-widest px-2 py-1 border backdrop-blur-md",
            ad.status === AdStatus.ACTIVE ? "border-emerald-500/20 text-emerald-400 bg-emerald-500/10" : 
            ad.status === AdStatus.DRAFT ? "border-amber-500/20 text-amber-400 bg-amber-500/10" :
            "border-zinc-500/20 text-zinc-400 bg-zinc-500/10"
          )}>
            {ad.status}
          </span>
          <span className="text-[8px] font-bold uppercase tracking-widest px-2 py-1 border backdrop-blur-md border-white/20 text-white bg-black/20">
            {ad.placement.replace('_', ' ')}
          </span>
        </div>
      </div>
      
      <div className="p-6 flex-1 flex flex-col space-y-4">
        <div className="space-y-1">
          <h3 className="text-xl font-serif text-foreground tracking-tight group-hover:text-primary transition-colors">{ad.title}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{ad.description || 'No description provided.'}</p>
        </div>

        <div className="pt-4 border-t border-border flex items-center justify-between mt-auto">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Priority</span>
            <span className="text-sm font-mono font-bold text-foreground">LVL {ad.priority}</span>
          </div>
          {ad.linkUrl && (
            <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <ArrowUpRight size={18} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
