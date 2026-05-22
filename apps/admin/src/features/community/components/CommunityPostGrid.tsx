import React from 'react';
import { CommunityPost } from '../schema';
import { CommunityPostCard } from '../CommunityPostCard/CommunityPostCard';

interface CommunityPostGridProps {
  posts: CommunityPost[];
  onEdit: (post: CommunityPost) => void;
  onDelete: (id: string) => void;
  onToggleActive: (post: CommunityPost) => void;
}

export const CommunityPostGrid: React.FC<CommunityPostGridProps> = ({
  posts,
  onEdit,
  onDelete,
  onToggleActive,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {posts.map((post) => (
        <CommunityPostCard
          key={post.id}
          post={post}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleActive={onToggleActive}
        />
      ))}
    </div>
  );
};
