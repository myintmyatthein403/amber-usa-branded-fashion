import React from 'react';
import { Plus } from 'lucide-react';
import { Modal } from '../components/admin/Modal';
import { useGiftCards } from '../features/gift-cards/useGiftCards';
import { GiftCardTable } from '../features/gift-cards/GiftCardTable';
import { GiftCardForm } from '../features/gift-cards/GiftCardForm';

export const GiftCardsPage: React.FC = () => {
  const {
    giftCards,
    loading,
    modalOpen,
    setModalOpen,
    submitting,
    editingGiftCard,
    formData,
    setFormData,
    generateCode,
    handleSubmit,
    handleDelete,
    openAddModal,
    openEditModal
  } = useGiftCards();

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-end justify-between">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase leading-none">Stored Value</span>
          <h2 className="text-4xl font-serif text-foreground tracking-tight">Gift Certificates</h2>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-3 bg-foreground text-primary-foreground px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all duration-300 shadow-xl shadow-black/5"
        >
          <Plus size={18} /> New Gift Card
        </button>
      </div>

      <GiftCardTable 
        giftCards={giftCards}
        loading={loading}
        onEdit={openEditModal}
        onDelete={handleDelete}
      />

      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editingGiftCard ? 'Modify Gift Certificate' : 'Issue New Gift Certificate'}
      >
        <GiftCardForm 
          formData={formData}
          setFormData={setFormData}
          onGenerateCode={generateCode}
          onSubmit={handleSubmit}
          submitting={submitting}
          editingGiftCard={editingGiftCard}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
};
