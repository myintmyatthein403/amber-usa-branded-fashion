import React from 'react';
import { Trash2, Check } from 'lucide-react';
import { MediaItem } from '../schema';
import { cn } from '../../../lib/utils';

interface MediaItemCardProps {
  item: MediaItem;
  selectionMode: boolean;
  isSelected: boolean;
  onSelect?: (url: string) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

export const MediaItemCard: React.FC<MediaItemCardProps> = ({
  item,
  selectionMode,
  isSelected,
  onSelect,
  onDelete
}) => {
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div 
      onClick={() => selectionMode && onSelect && onSelect(item.url)}
      className={cn(
        "group relative aspect-square border overflow-hidden cursor-pointer transition-all duration-300",
        isSelected ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/50"
      )}
    >
      <img 
        src={item.url} 
        alt={item.fileName} 
        className={cn(
          "w-full h-full object-cover transition-transform duration-500",
          !isSelected && "group-hover:scale-110"
        )} 
      />
      
      {/* Overlay */}
      <div className={cn(
        "absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity p-2 text-center",
        isSelected && "opacity-100"
      )}>
        {isSelected ? (
          <div className="bg-primary text-white p-2 rounded-full mb-2">
            <Check size={20} />
          </div>
        ) : (
          <>
            <p className="text-white text-[10px] font-bold uppercase tracking-widest truncate w-full px-2 mb-1">
              {item.fileName}
            </p>
            <p className="text-white/60 text-[8px] uppercase tracking-widest">
              {item.format} • {formatSize(item.size)}
            </p>
            <button 
              onClick={(e) => onDelete(item.id, e)}
              className="mt-4 p-2 bg-destructive/80 text-white hover:bg-destructive transition-colors rounded-full"
            >
              <Trash2 size={14} />
            </button>
          </>
        )}
      </div>

      {/* Badges */}
      {!isSelected && (
        <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/50 text-white text-[8px] font-bold uppercase tracking-widest backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
          {item.format}
        </div>
      )}
    </div>
  );
};
