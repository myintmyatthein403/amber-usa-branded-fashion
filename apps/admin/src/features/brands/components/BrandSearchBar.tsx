import React from 'react';
import { Search, LayoutGrid, List } from 'lucide-react';

type ViewMode = 'grid' | 'list';

interface BrandSearchBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export const BrandSearchBar: React.FC<BrandSearchBarProps> = ({
  search,
  onSearchChange,
  viewMode,
  onViewModeChange,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-card border border-border p-6">
      <div className="relative w-full md:w-96">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
          size={18}
        />
        <input
          type="text"
          placeholder="Search by name or notes…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-secondary/50 border border-border pl-12 pr-4 py-3 text-xs font-medium focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      <div className="flex items-center gap-2 border border-border p-1 bg-secondary/30">
        <button
          onClick={() => onViewModeChange('grid')}
          className={`p-2 transition-all duration-300 ${
            viewMode === 'grid'
              ? 'bg-foreground text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          title="Grid View"
        >
          <LayoutGrid size={18} />
        </button>
        <button
          onClick={() => onViewModeChange('list')}
          className={`p-2 transition-all duration-300 ${
            viewMode === 'list'
              ? 'bg-foreground text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          title="List View"
        >
          <List size={18} />
        </button>
      </div>
    </div>
  );
};
