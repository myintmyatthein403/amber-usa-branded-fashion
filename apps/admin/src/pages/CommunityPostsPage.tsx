import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Loader2, Image as ImageIcon, Star, Heart, Check, Power } from 'lucide-react';
import { Modal } from '../components/admin/Modal';
import { useFetch, useDelete } from '../hooks/useCrud';
import { apiService } from '../services/api.service';
import { API_ROUTES } from '../config/constants';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CommunityPost {
  id: string;
  user: string;
  handle: string;
  comment: string;
  image: string;
  stars: number;
  likes: number;
  isActive: boolean;
}

export const CommunityPostsPage: React.FC = () => {
  const { data: posts, loading, refresh } = useFetch<CommunityPost>(API_ROUTES.COMMUNITY_POSTS.BASE);
  const { deleteItem } = useDelete(API_ROUTES.COMMUNITY_POSTS.BASE);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingPost, setEditingPost] = useState<CommunityPost | null>(null);
  
  const [formData, setFormData] = useState({
    user: '',
    handle: '',
    comment: '',
    image: '',
    stars: 5,
    likes: 0,
    isActive: true
  });

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
        setFormData({ ...formData, image: url });
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
    setFormData({
      user: '',
      handle: '',
      comment: '',
      image: '',
      stars: 5,
      likes: 0,
      isActive: true
    });
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

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-end justify-between">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase leading-none">Social Influence</span>
          <h2 className="text-4xl font-serif text-foreground tracking-tight">Community Posts</h2>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-3 bg-foreground text-primary-foreground px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all duration-300 shadow-xl shadow-black/5"
        >
          <Plus size={18} /> Add Post
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {loading ? (
          <div className="col-span-full py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic animate-pulse">Syncing with community...</div>
        ) : !posts || posts.length === 0 ? (
          <div className="col-span-full py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic">No community posts found.</div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className={cn(
              "group relative bg-card border transition-all duration-500 overflow-hidden",
              post.isActive ? "border-primary shadow-lg shadow-primary/5" : "border-border hover:border-primary/50"
            )}>
              <div className="aspect-square bg-muted relative overflow-hidden">
                <img src={post.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                <div className="absolute top-4 right-4 flex gap-2">
                   {post.isActive && (
                    <div className="bg-primary text-white p-1.5 rounded-full shadow-lg">
                      <Check size={12} />
                    </div>
                   )}
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                   <button onClick={() => openEditModal(post)} className="p-3 bg-white text-black hover:bg-primary hover:text-white transition-colors"><Edit2 size={18}/></button>
                   <button onClick={() => deleteItem(post.id).then(refresh)} className="p-3 bg-white text-destructive hover:bg-destructive hover:text-white transition-colors"><Trash2 size={18}/></button>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="min-w-0">
                    <h4 className="text-[11px] font-bold uppercase tracking-widest truncate text-primary">{post.handle}</h4>
                    <p className="text-[10px] text-muted-foreground font-medium truncate">{post.user}</p>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                    <Heart size={10} className="fill-muted-foreground/20" />
                    {post.likes}
                  </div>
                </div>
                <p className="text-[11px] text-foreground leading-relaxed line-clamp-2 italic">
                  "{post.comment}"
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-border">
                   <button 
                    onClick={() => handleToggleActive(post)}
                    className={cn(
                      "flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest transition-colors",
                      post.isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
                    )}
                   >
                     <Power size={12} />
                     {post.isActive ? 'Active' : 'Hidden'}
                   </button>
                   <div className="flex space-x-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={8} className={i < post.stars ? "text-primary fill-primary" : "text-muted-foreground/20"} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editingPost ? 'Refine Post' : 'Initialize Community Post'}
      >
        <form onSubmit={handleSubmit} className="space-y-8 py-4 max-h-[70vh] overflow-y-auto px-1 custom-scrollbar">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Username</label>
                <input
                  type="text"
                  required
                  value={formData.user}
                  onChange={(e) => setFormData({ ...formData, user: e.target.value })}
                  className="w-full h-10 border-b border-input bg-transparent text-sm focus:border-primary focus:outline-none transition-colors"
                  placeholder="e.g. Su Myat"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Instagram Handle</label>
                <input
                  type="text"
                  required
                  value={formData.handle}
                  onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
                  className="w-full h-10 border-b border-input bg-transparent text-sm focus:border-primary focus:outline-none transition-colors"
                  placeholder="e.g. @sumyat_fashion"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Initial Likes</label>
                <input
                  type="number"
                  value={formData.likes}
                  onChange={(e) => setFormData({ ...formData, likes: parseInt(e.target.value) || 0 })}
                  className="w-full h-10 border-b border-input bg-transparent text-sm focus:border-primary focus:outline-none transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Rating</label>
                <div className="flex gap-2 pt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({...formData, stars: star})}
                      className="transition-transform hover:scale-110 active:scale-95"
                    >
                      <Star size={20} className={star <= formData.stars ? "text-primary fill-primary" : "text-muted-foreground/20"} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Comment</label>
              <textarea
                required
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                className="w-full h-24 border border-input bg-transparent p-4 text-sm focus:border-primary focus:outline-none transition-colors resize-none"
              />
            </div>

            <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Post Image</label>
                <div className="aspect-square bg-muted relative overflow-hidden border border-border max-w-[200px]">
                  {formData.image ? <img src={formData.image} className="w-full h-full object-cover" /> : <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20"><ImageIcon size={32}/></div>}
                  <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                </div>
                <input type="text" value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} placeholder="Or paste image URL..." className="w-full border-b border-border bg-transparent text-[10px] font-mono p-1 focus:border-primary outline-none" />
            </div>

            <div className="flex items-center gap-2 pt-4">
               <input 
                type="checkbox" 
                id="postActive"
                checked={formData.isActive} 
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="accent-primary h-4 w-4"
               />
               <label htmlFor="postActive" className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground cursor-pointer">Visible on Website</label>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-border">
            <button type="button" onClick={() => setModalOpen(false)} className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground">Cancel</button>
            <button
              type="submit"
              disabled={submitting || uploading}
              className="bg-foreground text-primary-foreground px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all disabled:opacity-50"
            >
              {submitting || uploading ? <Loader2 size={16} className="animate-spin" /> : editingPost ? 'Commit Changes' : 'Publish Post'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
