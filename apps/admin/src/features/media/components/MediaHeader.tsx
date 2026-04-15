import React from 'react';
import { Search, Loader2, Upload } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface MediaHeaderProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  uploading: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  loading: boolean;
  onRefresh: () => void;
}

export const MediaHeader: React.FC<MediaHeaderProps> = ({
  searchTerm,
  setSearchTerm,
  uploading,
  onUpload,
  loading,
  onRefresh
}) => {
  return (
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
          <input type="file" onChange={onUpload} className="hidden" accept="image/*" disabled={uploading} />
        </label>
        <button 
          onClick={onRefresh}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Loader2 className={cn("w-5 h-5", loading && "animate-spin")} />
        </button>
      </div>
    </div>
  );
};
