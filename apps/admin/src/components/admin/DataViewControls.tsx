import React from 'react';
import { Search, Grid, List, X } from 'lucide-react';

interface DataViewControlsProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  viewMode?: 'grid' | 'table';
  onViewModeChange?: (mode: 'grid' | 'table') => void;
  extraFilters?: React.ReactNode;
}

export const DataViewControls: React.FC<DataViewControlsProps> = ({
  search,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  viewMode,
  onViewModeChange,
  extraFilters,
}) => {
  return (
    <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between mb-8">
      <div className="relative flex-1 group max-w-2xl">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
          size={18}
        />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full h-12 pl-12 pr-12 bg-background border border-border focus:border-primary focus:outline-none transition-all font-medium text-sm"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {extraFilters && (
          <div className="flex items-center gap-3 border-r border-border pr-3 mr-3 h-12">
            {extraFilters}
          </div>
        )}

        {viewMode && onViewModeChange && (
          <div className="flex bg-muted p-1 border border-border h-12">
            <button
              onClick={() => onViewModeChange('table')}
              className={`
                flex items-center gap-2 px-4 h-full text-[10px] font-bold uppercase tracking-widest transition-all
                ${viewMode === 'table' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}
              `}
            >
              <List size={14} />
              Table
            </button>
            <button
              onClick={() => onViewModeChange('grid')}
              className={`
                flex items-center gap-2 px-4 h-full text-[10px] font-bold uppercase tracking-widest transition-all
                ${viewMode === 'grid' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}
              `}
            >
              <Grid size={14} />
              Grid
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
