import React, { useState } from 'react';
import { Trash2, Edit2, Check, Power, Timer, AlertTriangle, Grid, List, Search, X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Modal } from '../../../components/admin/Modal';
import { SaleSectionWithUrl } from '../schema';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SaleSectionGridProps {
  sections: SaleSectionWithUrl[] | null;
  loading: boolean;
  onEdit: (section: SaleSectionWithUrl) => void;
  onDelete: (id: string) => void;
  onToggleActive: (section: SaleSectionWithUrl) => void;
  search: string;
  handleSearch: (value: string) => void;
  page: number;
  totalPages: number;
  total: number;
  handlePageChange: (newPage: number) => void;
  deleteModalOpen: boolean;
  setDeleteModalOpen: (open: boolean) => void;
  deletingId: string | null;
  confirmDelete: () => void;
  cancelDelete: () => void;
}

export const SaleSectionGrid: React.FC<SaleSectionGridProps> = ({
  sections,
  loading,
  onEdit,
  onDelete,
  onToggleActive,
  search,
  handleSearch,
  page,
  totalPages,
  total,
  handlePageChange,
  deleteModalOpen,
  setDeleteModalOpen,
  deletingId,
  confirmDelete,
  cancelDelete
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  if (loading) {
    return (
      <div className="py-40 flex flex-col items-center justify-center gap-4">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Synchronizing Assets...</p>
      </div>
    );
  }

  if (!sections || sections.length === 0) {
    return (
      <div className="py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic">No promotional sections discovered.</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and View Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            type="text"
            placeholder="Search sections..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          {search && (
            <button
              onClick={() => handleSearch('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={16} />
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              "p-2 rounded-lg border transition-colors",
              viewMode === 'grid' ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:bg-muted"
            )}
          >
            <Grid size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              "p-2 rounded-lg border transition-colors",
              viewMode === 'list' ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:bg-muted"
            )}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section) => (
            <div key={section.id} className={cn(
              "group relative bg-card border transition-all duration-700 overflow-hidden flex flex-col",
              section.isActive ? "border-primary shadow-2xl shadow-primary/5" : "border-border grayscale opacity-60 hover:grayscale-0 hover:opacity-100"
            )}>
              <div className="aspect-[21/9] overflow-hidden bg-muted relative">
                <img src={section.imageMain || section.imageUrl || ''} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <span className="text-[9px] font-bold text-primary uppercase tracking-[0.3em] mb-2 block">{section.badge}</span>
                  <h3 className="text-xl font-serif text-white">{section.title} <span className="italic opacity-80">{section.titleItalic}</span></h3>
                </div>

                <div className="absolute top-4 right-4 flex gap-2">
                  <button onClick={() => onEdit(section)} className="p-2 bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white hover:text-black transition-all duration-300">
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={() => onDelete(section.id)}
                    className="p-2 backdrop-blur-md border border-white/20 text-white hover:bg-destructive hover:border-destructive transition-all duration-300"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 italic">"{section.description}"</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary text-primary">
                      <Timer size={14} />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground block">Event Horizon</span>
                      <span className="text-[10px] font-mono font-bold text-foreground">
                        {new Date(section.endDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={() => onToggleActive(section)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 text-[9px] font-bold uppercase tracking-widest border transition-all duration-500",
                      section.isActive ? "bg-primary text-primary-foreground border-primary" : "bg-transparent text-muted-foreground border-border hover:border-primary hover:text-primary"
                    )}
                  >
                    <Power size={10} />
                    {section.isActive ? 'Section Live' : 'Go Live'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-card border rounded-lg overflow-hidden">
          {sections.map((section) => (
            <div key={section.id} className={cn(
              "p-6 border-b border-border last:border-b-0",
              section.isActive ? "bg-primary/5" : ""
            )}>
              <div className="flex items-center gap-6">
                <div className="w-32 h-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                  <img src={section.imageMain || section.imageUrl || ''} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-bold text-primary uppercase tracking-[0.3em]">{section.badge}</span>
                    <h3 className="text-lg font-serif text-foreground">{section.title} <span className="italic opacity-80">{section.titleItalic}</span></h3>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">"{section.description}"</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Ends: {new Date(section.endDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => onToggleActive(section)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 text-[9px] font-bold uppercase tracking-widest border transition-all duration-500",
                      section.isActive ? "bg-primary text-primary-foreground border-primary" : "bg-transparent text-muted-foreground border-border hover:border-primary hover:text-primary"
                    )}
                  >
                    <Power size={10} />
                    {section.isActive ? 'Live' : 'Go Live'}
                  </button>
                  <button 
                    onClick={() => onEdit(section)}
                    className="p-2 bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={() => onDelete(section.id)}
                    className="p-2 bg-muted hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, total)} of {total} sections
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="px-3 py-1 border border-border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={cn(
                      "px-3 py-1 border rounded text-sm",
                      page === pageNum 
                        ? "bg-primary text-primary-foreground border-primary" 
                        : "border-border hover:bg-muted"
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-1 border border-border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={deleteModalOpen} 
        onClose={cancelDelete} 
        title="Delete Section"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-destructive/10 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <div>
              <p className="font-medium text-sm">Delete this promotional section?</p>
              <p className="text-xs text-muted-foreground">This action cannot be undone.</p>
            </div>
          </div>
          
          <div className="flex gap-3 justify-end">
            <button
              onClick={cancelDelete}
              className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium hover:bg-destructive/90 transition-colors"
            >
              Delete Section
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};