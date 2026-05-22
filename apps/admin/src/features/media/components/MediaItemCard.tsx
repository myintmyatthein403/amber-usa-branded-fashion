import React, { useState } from 'react';
import { Trash2, Check, AlertTriangle } from 'lucide-react';
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
  const [showConfirm, setShowConfirm] = useState(false);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (showConfirm) {
      onDelete(item.id, e);
      setShowConfirm(false);
    } else {
      setShowConfirm(true);
    }
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
        ) : showConfirm ? (
          <div className="flex flex-col items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-destructive" />
            <p className="text-white text-[9px] font-bold">Delete?</p>
            <div className="flex gap-2">
              <button 
                onClick={handleDelete}
                className="px-3 py-1.5 bg-destructive text-white text-[9px] font-bold uppercase tracking-wider hover:bg-destructive/80 transition-colors"
              >
                Confirm
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setShowConfirm(false); }}
                className="px-3 py-1.5 bg-white text-black text-[9px] font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
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
              onClick={handleDelete}
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