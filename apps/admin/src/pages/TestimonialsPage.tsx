import React from 'react';
import { Plus, MessageSquare, Loader2 } from 'lucide-react';
import { useTestimonials } from '../features/testimonials/useTestimonials';
import { TestimonialTable } from '../features/testimonials/components/TestimonialTable';
import { TestimonialGrid } from '../features/testimonials/components/TestimonialGrid';
import { TestimonialForm } from '../features/testimonials/components/TestimonialForm';
import { TestimonialSearchBar } from '../features/testimonials/components/TestimonialSearchBar';
import { Modal } from '../components/admin/Modal';
import { Pagination } from '../components/admin/Pagination';

export const TestimonialsPage: React.FC = () => {
  const {
    testimonials,
    loading,
    modalOpen,
    setModalOpen,
    submitting,
    editingTestimonial,
    formData,
    setFormData,
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
  } = useTestimonials();

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-primary">
            <MessageSquare size={20} />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Social Proof</span>
          </div>
          <h1 className="text-4xl font-serif text-foreground tracking-tight">Customer Voices</h1>
          <p className="text-sm text-muted-foreground italic max-w-lg">Manage and curate testimonials from our community to build trust and showcase authenticity.</p>
        </div>
        
        <button
          onClick={openAddModal}
          className="flex items-center gap-3 bg-foreground text-primary-foreground px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all duration-300 shadow-xl shadow-black/5"
        >
          <Plus size={16} />
          New Voice
        </button>
      </div>

      <TestimonialSearchBar
        value={search}
        onChange={handleSearch}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <div className="min-h-[400px]">
        {loading ? (
          <div className="py-40 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-primary" size={40} />
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Gathering Voices...</p>
          </div>
        ) : (
          <>
            {viewMode === 'table' ? (
              <TestimonialTable
                testimonials={testimonials}
                onEdit={openEditModal}
                onDelete={handleDelete}
                onToggleActive={handleToggleActive}
              />
            ) : (
              <TestimonialGrid
                testimonials={testimonials}
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
        title={editingTestimonial ? "Refine Voice Parameters" : "Archive New Voice"}
        size="lg"
      >
        <TestimonialForm
          formData={formData as any}
          setFormData={setFormData as any}
          submitting={submitting}
          editingTestimonial={editingTestimonial}
          onSubmit={handleSubmit}
        />
      </Modal>
    </div>
  );
};
