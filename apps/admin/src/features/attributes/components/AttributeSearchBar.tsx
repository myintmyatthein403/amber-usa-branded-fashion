import React from 'react';
import { Search } from 'lucide-react';

interface AttributeSearchBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  typeFilter: '' | 'text' | 'color' | 'image';
  onTypeFilterChange: (value: '' | 'text' | 'color' | 'image') => void;
  filterableFilter: '' | 'true' | 'false';
  onFilterableFilterChange: (value: '' | 'true' | 'false') => void;
}

export const AttributeSearchBar: React.FC<AttributeSearchBarProps> = ({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  filterableFilter,
  onFilterableFilterChange,
}) => {
  return (
    <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between bg-card border border-border p-6">
      <div className="relative flex-1 max-w-md">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
          size={18}
        />
        <input
          type="text"
          placeholder="Search by name, slug, or value…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-secondary/50 border border-border pl-12 pr-4 py-3 text-xs font-medium focus:outline-none focus:border-primary transition-colors"
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <select
          value={typeFilter}
          onChange={(e) =>
            onTypeFilterChange(e.target.value as '' | 'text' | 'color' | 'image')
          }
          className="bg-secondary/50 border border-border px-3 py-2 text-xs font-medium focus:outline-none focus:border-primary"
        >
          <option value="">All types</option>
          <option value="text">Text</option>
          <option value="color">Color</option>
          <option value="image">Image</option>
        </select>
        <select
          value={filterableFilter}
          onChange={(e) =>
            onFilterableFilterChange(e.target.value as '' | 'true' | 'false')
          }
          className="bg-secondary/50 border border-border px-3 py-2 text-xs font-medium focus:outline-none focus:border-primary"
        >
          <option value="">All attributes</option>
          <option value="true">Filterable only</option>
          <option value="false">Not filterable</option>
        </select>
      </div>
    </div>
  );
};
