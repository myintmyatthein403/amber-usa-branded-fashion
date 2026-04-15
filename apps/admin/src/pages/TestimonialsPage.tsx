import React from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { Modal } from '../components/admin/Modal';
import { useTestimonials } from '../features/testimonials/useTestimonials';
import { TestimonialTable } from '../features/testimonials/components/TestimonialTable';
import { TestimonialForm } from '../features/testimonials/components/TestimonialForm';

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
    openEditModal
  } = useTestimonials();

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-end justify-between">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase leading-none">Social Proof</span>
          <h2 className="text-4xl font-serif text-foreground tracking-tight">Customer Voices</h2>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-3 bg-foreground text-primary-foreground px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all duration-300 shadow-xl shadow-black/5"
        >
          <Plus size={18} /> New Voice
        </button>
      </div>

      {loading ? (
        <div className="py-40 flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-primary" size={40} />
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Gathering Voices...</p>
        </div>
      ) : (
        <TestimonialTable 
          testimonials={testimonials}
          onEdit={openEditModal}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
        />
      )}

      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editingTestimonial ? "Refine Voice Parameters" : "Archive New Voice"}
        size="lg"
      >
        <TestimonialForm 
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          submitting={submitting}
          editingTestimonial={editingTestimonial}
        />
      </Modal>
    </div>
  );
};
