import React from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { Modal } from '../components/admin/Modal';
import { useGiftCardSection } from '../features/gift-card-section/useGiftCardSection';
import { GiftCardSectionCard } from '../features/gift-card-section/GiftCardSectionCard';
import { GiftCardSectionForm } from '../features/gift-card-section/GiftCardSectionForm';

export const GiftCardSectionPage: React.FC = () => {
  const {
    sections,
    loading,
    modalOpen,
    setModalOpen,
    submitting,
    editingSection,
    formData,
    setFormData,
    handleSubmit,
    handleToggleActive,
    openAddModal,
    openEditModal,
    handleAmountChange,
    addAmountField,
    removeAmountField,
    handleDelete
  } = useGiftCardSection();

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-end justify-between">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase leading-none">Website Experience</span>
          <h2 className="text-4xl font-serif text-foreground tracking-tight">Gift Card Banner</h2>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-3 bg-foreground text-primary-foreground px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all duration-300 shadow-xl shadow-black/5"
        >
          <Plus size={18} /> New Design
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic animate-pulse">Querying Experience Vault...</div>
        ) : !sections || sections.length === 0 ? (
          <div className="col-span-full py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic">No gift card designs found.</div>
        ) : (
          sections.map((section) => (
            <GiftCardSectionCard 
              key={section.id}
              section={section}
              onEdit={openEditModal}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
            />
          ))
        )}
      </div>

      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editingSection ? 'Refine Gift Card Design' : 'Initialize Gift Card Section'}
      >
        <GiftCardSectionForm 
          formData={formData as any}
          setFormData={setFormData as any}
          onSubmit={handleSubmit}
          submitting={submitting}
          editingSection={editingSection}
          onAmountChange={handleAmountChange}
          onAddAmount={addAmountField}
          onRemoveAmount={removeAmountField}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
};
