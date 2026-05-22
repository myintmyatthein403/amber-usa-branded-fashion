import React from 'react';
import { Plus, Users, Loader2 } from 'lucide-react';
import { Modal } from '../components/admin/Modal';
import { useCommunity } from '../features/community/useCommunity';
import { CommunityPostGrid } from '../features/community/components/CommunityPostGrid';
import { CommunityPostTable } from '../features/community/components/CommunityPostTable';
import { CommunityPostSearchBar } from '../features/community/components/CommunityPostSearchBar';
import { CommunityPostForm } from '../features/community/CommunityPostForm';
import { Pagination } from '../components/admin/Pagination';

export const CommunityPostsPage: React.FC = () => {
  const {
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
  } = useCommunity();

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-primary">
            <Users size={20} />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Social Influence</span>
          </div>
          <h1 className="text-4xl font-serif text-foreground tracking-tight">Community Posts</h1>
          <p className="text-sm text-muted-foreground italic max-w-lg">Curate and manage user-generated content and brand influence posts from our global community.</p>
        </div>
        
        <button
          onClick={openAddModal}
          className="flex items-center gap-3 bg-foreground text-primary-foreground px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all duration-300 shadow-xl shadow-black/5"
        >
          <Plus size={16} />
          New Post
        </button>
      </div>

      <CommunityPostSearchBar
        value={search}
        onChange={handleSearch}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <div className="min-h-[400px]">
        {loading ? (
          <div className="py-40 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-primary" size={40} />
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Syncing with community...</p>
          </div>
        ) : (
          <>
            {viewMode === 'table' ? (
              <CommunityPostTable
                posts={posts}
                onEdit={openEditModal}
                onDelete={handleDelete}
                onToggleActive={handleToggleActive}
              />
            ) : (
              <CommunityPostGrid
                posts={posts}
                onEdit={openEditModal}
                onDelete={handleDelete}
                onToggleActive={handleToggleActive}
              />
            )}

            <div className="mt-10 border-t border-border pt-8">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                total={total}
                limit={limit}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
              />
            </div>
          </>
        )}
      </div>

      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editingPost ? 'Refine Post' : 'Initialize Community Post'}
        size="lg"
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
