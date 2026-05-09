import React from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { Modal } from '../components/admin/Modal';
import { useCommunity } from '../features/community/useCommunity';
import { CommunityPostCard } from '../features/community/CommunityPostCard';
import { CommunityPostForm } from '../features/community/CommunityPostForm';

export const CommunityPostsPage: React.FC = () => {
  const {
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
  } = useCommunity();

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
            <CommunityPostCard 
              key={post.id}
              post={post}
              onEdit={openEditModal}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
            />
          ))
        )}
      </div>

      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editingPost ? 'Refine Post' : 'Initialize Community Post'}
      >
        <CommunityPostForm 
          formData={formData as any}
          setFormData={setFormData as any}
          onSubmit={handleSubmit}
          onFileChange={handleFileChange}
          submitting={submitting}
          uploading={uploading}
          editingPost={editingPost}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
};
