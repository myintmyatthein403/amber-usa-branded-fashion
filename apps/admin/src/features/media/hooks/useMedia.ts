import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../../services/api.service';
import { API_ROUTES } from '../../../config/constants';
import { MediaItem } from '../schema';

export interface UseMediaProps {
  onSelect?: (url: string) => void;
  selectionMode?: boolean;
}

export const useMedia = ({ onSelect, selectionMode }: UseMediaProps = {}) => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiService<unknown, { data: MediaItem[] }>(API_ROUTES.MEDIA.BASE);
      setMedia(response.data);
    } catch (error) {
      console.error('Failed to fetch media:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('file', e.target.files[0]);

    try {
      const response = await apiService<FormData, { data: MediaItem }>(API_ROUTES.MEDIA.UPLOAD, {
        method: 'POST',
        body: formData,
        isMultipart: true
      });
      const newItem = response.data;
      setMedia(prev => [newItem, ...prev]);
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
    try {
      await apiService(API_ROUTES.MEDIA.BY_ID(id), { method: 'DELETE' });
      setMedia(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const filteredMedia = media.filter(item => 
    item.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    media,
    filteredMedia,
    loading,
    uploading,
    searchTerm,
    setSearchTerm,
    fetchMedia,
    handleUpload,
    handleDelete
  };
};
