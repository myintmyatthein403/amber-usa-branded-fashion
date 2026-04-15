import React from 'react';
import { Search, Filter, RefreshCcw, List, LayoutGrid } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface InventoryFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  viewMode: 'table' | 'grid';
  onViewModeChange: (mode: 'table' | 'grid') => void;
  filterLocation: string;
  onFilterLocationChange: (value: string) => void;
  onRefresh: () => void;
}

export const InventoryFilters: React.FC<InventoryFiltersProps> = ({
  search,
  onSearchChange,
  viewMode,
  onViewModeChange,
  filterLocation,
  onFilterLocationChange,
  onRefresh
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase leading-none">Global Stock Ledger</span>
          <h2 className="text-4xl font-serif text-foreground tracking-tight">Inventory Distribution</h2>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="flex items-center bg-muted/50 border border-border p-1">
              <button 
                onClick={() => onViewModeChange('table')}
                className={cn("p-2 transition-colors", viewMode === 'table' ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground")}
              >
                <List size={16} />
              </button>
              <button 
                onClick={() => onViewModeChange('grid')}
                className={cn("p-2 transition-colors", viewMode === 'grid' ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground")}
              >
                <LayoutGrid size={16} />
              </button>
           </div>
           <button 
             onClick={onRefresh}
             className="flex items-center gap-3 bg-secondary text-foreground px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-primary hover:text-primary-foreground transition-all duration-300"
           >
             <RefreshCcw size={14} /> Refresh Data
           </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card border border-border p-6 shadow-sm">
         <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input 
              type="text"
              placeholder="Filter by product name or SKU..."
              className="w-full h-12 bg-muted/30 border border-border pl-12 pr-4 text-sm focus:border-primary focus:outline-none transition-all"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
         </div>

         <div className="flex items-center gap-6 w-full md:w-auto">
            <div className="flex items-center gap-3">
               <Filter size={14} className="text-primary" />
               <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Region:</span>
               <select 
                 className="bg-transparent border-b border-border py-1 text-[10px] font-bold uppercase tracking-widest focus:border-primary focus:outline-none cursor-pointer"
                 value={filterLocation}
                 onChange={(e) => onFilterLocationChange(e.target.value)}
               >
                  <option value="ALL">All Regions</option>
                  <option value="USA">United States</option>
                  <option value="MYANMAR">Myanmar</option>
               </select>
            </div>
         </div>
      </div>
    </div>
  );
};
