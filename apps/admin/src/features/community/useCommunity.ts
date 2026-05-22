import { useState, useEffect } from 'react';
import { apiService } from '../../services/api.service';
import { API_ROUTES } from '../../config/constants';
import { CommunityPost } from './schema';
import { toast } from '../../store/useToastStore';
import { useDelete } from '../../hooks/useCrud';

export const useCommunity = () => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  const { deleteItem } = useDelete(API_ROUTES.COMMUNITY_POSTS.BASE);

  const fetchPosts = async (currentPage = page, currentSearch = search, currentLimit = limit) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: currentLimit.toString(),
      });
      
      if (currentSearch) {
        params.append('search', currentSearch);
      }
      
      const response = await apiService<unknown, { data: CommunityPost[]; meta?: any; pagination?: any }>(`${API_ROUTES.COMMUNITY_POSTS.BASE}?${params.toString()}`);
      
      // Based on user provided format, response.data is the array
      const items = Array.isArray(response.data) ? response.data : [];
      const meta = response.meta || response.pagination;

      setPosts(items);
      setTotal(meta?.total || items.length);
      setTotalPages(meta?.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch community posts:', error);
      toast.error('Failed to load community posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const refresh = () => {
    fetchPosts(page, search, limit);
  };
  
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
      const response = await apiService<FormData, { url: string }>(API_ROUTES.UPLOAD, {
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
      resetForm();
      toast.success(editingPost ? 'Post updated' : 'Post created');
    } catch (error) {
      console.error('Failed to save post:', error);
      toast.error('Failed to save post');
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
      toast.success(`Post ${!post.isActive ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('Failed to toggle active status:', error);
      toast.error('Failed to update status');
    }
  };

  const resetForm = () => {
    setEditingPost(null);
    setFormData(initialFormData);
  };

  const openAddModal = () => {
    resetForm();
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
    if (!window.confirm('Delete this post permanently?')) return;
    try {
      const success = await deleteItem(id);
      if (success) {
        refresh();
        toast.success('Post deleted');
      }
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
    fetchPosts(1, value, limit);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchPosts(newPage, search, limit);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
    fetchPosts(1, search, newLimit);
  };

  return {
    posts,
    loading,
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
    handleDelete,
    openAddModal,
    openEditModal,
    refresh,
    viewMode,
    setViewMode,
    page,
    totalPages,
    total,
    limit,
    search,
    handleSearch,
    handlePageChange,
    handleLimitChange
  };
};
