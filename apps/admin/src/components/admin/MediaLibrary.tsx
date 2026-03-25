import React, { useState, useEffect } from 'react';
import { Upload, X, Search, Trash2, Image as ImageIcon, Loader2, Check } from 'lucide-react';
import { apiService } from '../../services/api.service';
import { API_ROUTES } from '../../config/constants';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MediaItem {
  id: string;
  url: string;
  publicId: string;
  fileName: string;
  format: string;
  size: number;
  width?: number;
  height?: number;
  createdAt: string;
}

interface MediaLibraryProps {
  onSelect?: (url: string) => void;
  selectionMode?: boolean;
  selectedUrls?: string[];
}

export const MediaLibrary: React.FC<MediaLibraryProps> = ({ 
  onSelect, 
  selectionMode = false,
  selectedUrls = []
}) => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const data = await apiService(API_ROUTES.MEDIA.BASE);
      setMedia(data);
    } catch (error) {
      console.error('Failed to fetch media:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('file', e.target.files[0]);

    try {
      const newItem = await apiService(API_ROUTES.MEDIA.UPLOAD, {
        method: 'POST',
        body: formData,
        isMultipart: true
      });
      setMedia([newItem, ...media]);
      if (selectionMode && onSelect) {
        onSelect(newItem.url);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this media permanently?')) return;

    try {
      await apiService(API_ROUTES.MEDIA.BY_ID(id), { method: 'DELETE' });
      setMedia(media.filter(item => item.id !== id));
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const filteredMedia = media.filter(item => 
    item.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex flex-col h-full bg-card border border-border">
      {/* Header */}
      <div className="p-4 border-b border-border flex flex-wrap items-center justify-between gap-4 bg-muted/30">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search media..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background border border-border pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 bg-foreground text-primary-foreground px-4 py-2 text-xs font-bold uppercase tracking-widest cursor-pointer hover:bg-primary transition-all">
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            {uploading ? 'Uploading...' : 'Upload New'}
            <input type="file" onChange={handleUpload} className="hidden" accept="image/*" disabled={uploading} />
          </label>
          <button 
            onClick={fetchMedia}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Loader2 className={cn("w-5 h-5", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading && media.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground italic">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="text-xs uppercase tracking-widest">Accessing Media Cluster...</p>
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground italic border-2 border-dashed border-border">
            <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-xs uppercase tracking-widest">No media found in cluster</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredMedia.map((item) => {
              const isSelected = selectedUrls.includes(item.url);
              return (
                <div 
                  key={item.id} 
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
                          onClick={(e) => handleDelete(item.id, e)}
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
            })}
          </div>
        )}
      </div>
    </div>
  );
};
