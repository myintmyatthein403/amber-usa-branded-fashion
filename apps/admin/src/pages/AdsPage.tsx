import React from 'react';
import { Plus } from 'lucide-react';
import { Modal } from '../components/admin/Modal';
import { useAds } from '../features/ads/useAds';
import { AdCard } from '../features/ads/AdCard';
import { AdForm } from '../features/ads/AdForm';

export const AdsPage: React.FC = () => {
  const {
    ads,
    loading,
    modalOpen,
    setModalOpen,
    submitting,
    editingAd,
    form,
    setForm,
    handleSubmit,
    openAddModal,
    openEditModal,
    handleDelete
  } = useAds();

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-end justify-between">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase leading-none">Marketing & Promotions</span>
          <h2 className="text-4xl font-serif text-foreground tracking-tight">Advertisement Management</h2>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-3 bg-foreground text-primary-foreground px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all duration-300 shadow-xl shadow-black/5"
        >
          <Plus size={18} /> New Campaign
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic animate-pulse">Syncing Campaign Data...</div>
        ) : !ads || ads.length === 0 ? (
          <div className="col-span-full py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic">No advertisements defined.</div>
        ) : (
          ads.map((ad) => (
            <AdCard 
              key={ad.id} 
              ad={ad} 
              onEdit={openEditModal} 
              onDelete={handleDelete} 
            />
          ))
        )}
      </div>

      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editingAd ? `Edit Campaign: ${editingAd.title}` : 'Initialize New Campaign'}
      >
        <AdForm 
          form={form}
          setForm={setForm}
          onSubmit={handleSubmit}
          submitting={submitting}
          editingAd={editingAd}
        />
      </Modal>
    </div>
  );
};
