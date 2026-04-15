import React from 'react';
import { Loader2, Image as ImageIcon } from 'lucide-react';
import { MediaItem } from '../schema';
import { MediaItemCard } from './MediaItemCard';

interface MediaGridProps {
  loading: boolean;
  media: MediaItem[];
  filteredMedia: MediaItem[];
  selectionMode: boolean;
  selectedUrls: string[];
  onSelect?: (url: string) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

export const MediaGrid: React.FC<MediaGridProps> = ({
  loading,
  media,
  filteredMedia,
  selectionMode,
  selectedUrls,
  onSelect,
  onDelete
}) => {
  if (loading && media.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground italic">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p className="text-xs uppercase tracking-widest">Accessing Media Cluster...</p>
      </div>
    );
  }

  if (filteredMedia.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground italic border-2 border-dashed border-border">
        <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
        <p className="text-xs uppercase tracking-widest">No media found in cluster</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {filteredMedia.map((item) => (
        <MediaItemCard
          key={item.id}
          item={item}
          selectionMode={selectionMode}
          isSelected={selectedUrls.includes(item.url)}
          onSelect={onSelect}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
