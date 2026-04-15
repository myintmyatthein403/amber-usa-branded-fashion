import { useState } from 'react';
import { useFetch, useDelete } from '../../hooks/useCrud';
import { apiService } from '../../services/api.service';
import { API_ROUTES } from '../../config/constants';
import { CommunityPost } from './schema';

export const useCommunity = () => {
  const { data: posts, loading, refresh } = useFetch<CommunityPost>(API_ROUTES.COMMUNITY_POSTS.BASE);
  const { deleteItem } = useDelete(API_ROUTES.COMMUNITY_POSTS.BASE);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingPost, setEditingPost] = useState<CommunityPost | null>(null);
  
  const initialFormData = {
    user: '',
    handle: '',
    comment: '',
    image: '',
    stars: 5,
    likes: 0,
    isActive: true
  };

  const [formData, setFormData] = useState(initialFormData);

  const uploadFile = async (file: File): Promise<string | null> => {
    const data = new FormData();
    data.append('file', file);
    setUploading(true);
    try {
      const response = await apiService(API_ROUTES.UPLOAD, {
        method: 'POST',
        body: data,
        isMultipart: true
      });
      return `${import.meta.env.VITE_API_URL}${response.url}`;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = await uploadFile(e.target.files[0]);
      if (url) {
        setFormData(prev => ({ ...prev, image: url }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const endpoint = editingPost 
        ? API_ROUTES.COMMUNITY_POSTS.BY_ID(editingPost.id)
        : API_ROUTES.COMMUNITY_POSTS.BASE;
      
      const method = editingPost ? 'PATCH' : 'POST';

      await apiService(endpoint, {
        method,
        body: formData,
      });

      setModalOpen(false);
      refresh();
    } catch (error) {
      console.error('Failed to save post:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (post: CommunityPost) => {
    try {
      await apiService(API_ROUTES.COMMUNITY_POSTS.BY_ID(post.id), {
        method: 'PATCH',
        body: { isActive: !post.isActive },
      });
      refresh();
    } catch (error) {
      console.error('Failed to toggle active status:', error);
    }
  };

  const openAddModal = () => {
    setEditingPost(null);
    setFormData(initialFormData);
    setModalOpen(true);
  };

  const openEditModal = (post: CommunityPost) => {
    setEditingPost(post);
    setFormData({ 
      user: post.user,
      handle: post.handle,
      comment: post.comment,
      image: post.image,
      stars: post.stars,
      likes: post.likes,
      isActive: post.isActive
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const success = await deleteItem(id);
    if (success) refresh();
  };

  return {
    posts,
    loading,
    refresh,
    modalOpen,
    setModalOpen,
    submitting,
    uploading,
    editingPost,
    formData,
    setFormData,
    handleFileChange,
    handleSubmit,
    handleToggleActive,
    openAddModal,
    openEditModal,
    handleDelete
  };
};
