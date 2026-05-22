import React from 'react';
import { Search, Grid, List } from 'lucide-react';

interface TestimonialSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
}

export const TestimonialSearchBar: React.FC<TestimonialSearchBarProps> = ({
  value,
  onChange,
  viewMode,
  onViewModeChange,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8">
      <div className="relative flex-1 group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search by author, content, or location..."
          className="w-full h-12 pl-12 pr-4 bg-background border border-border focus:border-primary focus:outline-none transition-all font-medium text-sm"
        />
      </div>
      
      <div className="flex bg-muted p-1 border border-border">
        <button
          onClick={() => onViewModeChange('table')}
          className={`
            flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all
            ${viewMode === 'table' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}
          `}
        >
          <List size={14} />
          Table
        </button>
        <button
          onClick={() => onViewModeChange('grid')}
          className={`
            flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all
            ${viewMode === 'grid' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}
          `}
        >
          <Grid size={14} />
          Grid
        </button>
      </div>
    </div>
  );
};
