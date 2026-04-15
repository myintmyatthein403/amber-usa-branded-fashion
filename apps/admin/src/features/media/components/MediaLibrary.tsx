import React from 'react';
import { useMedia, UseMediaProps } from '../hooks/useMedia';
import { MediaHeader } from './MediaHeader';
import { MediaGrid } from './MediaGrid';

interface MediaLibraryProps extends UseMediaProps {
  selectedUrls?: string[];
}

export const MediaLibrary: React.FC<MediaLibraryProps> = ({ 
  onSelect, 
  selectionMode = false,
  selectedUrls = []
}) => {
  const {
    media,
    filteredMedia,
    loading,
    uploading,
    searchTerm,
    setSearchTerm,
    fetchMedia,
    handleUpload,
    handleDelete
  } = useMedia({ onSelect, selectionMode });

  return (
    <div className="flex flex-col h-full bg-card border border-border">
      <MediaHeader 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        uploading={uploading}
        onUpload={handleUpload}
        loading={loading}
        onRefresh={fetchMedia}
      />

      <div className="flex-1 overflow-y-auto p-4">
        <MediaGrid 
          loading={loading}
          media={media}
          filteredMedia={filteredMedia}
          selectionMode={selectionMode}
          selectedUrls={selectedUrls}
          onSelect={onSelect}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};
