import React from 'react';
import { MediaLibrary } from '../components/admin/MediaLibrary';

export const MediaPage: React.FC = () => {
  return (
    <div className="space-y-10 animate-in fade-in duration-700 h-full flex flex-col">
      <div className="flex items-end justify-between shrink-0">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase leading-none">Digital Assets</span>
          <h2 className="text-4xl font-serif text-foreground tracking-tight">Media Repository</h2>
        </div>
      </div>

      <div className="flex-1 min-h-0 border border-border bg-card shadow-sm overflow-hidden">
        <MediaLibrary />
      </div>
    </div>
  );
};
