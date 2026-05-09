import React from 'react';
import { Plus } from 'lucide-react';
import { Modal } from '../components/admin/Modal';
import { MediaSelector } from '../components/admin/MediaSelector';
import { useBrands } from '../features/brands/useBrands';
import { BrandTable } from '../features/brands/BrandTable';
import { BrandForm } from '../features/brands/BrandForm';

export const BrandsPage: React.FC = () => {
  const {
    brands,
    loading,
    modalOpen,
    setModalOpen,
    mediaSelectorOpen,
    setMediaSelectorOpen,
    submitting,
    editingBrand,
    formData,
    setFormData,
    handleMediaSelect,
    handleSubmit,
    handleDelete,
    openAddModal,
    openEditModal
  } = useBrands();

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-end justify-between">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase leading-none">House of Brands</span>
          <h2 className="text-4xl font-serif text-foreground tracking-tight">Brand Directory</h2>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-3 bg-foreground text-primary-foreground px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all duration-300 shadow-xl shadow-black/5"
        >
          <Plus size={18} /> New Brand
        </button>
      </div>

      <BrandTable 
        brands={brands}
        loading={loading}
        onEdit={openEditModal}
        onDelete={handleDelete}
      />

      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editingBrand ? 'Modify Brand Identity' : 'Initialize Brand Profile'}
      >
        <BrandForm 
          formData={formData as any}
          setFormData={setFormData as any}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
          submitting={submitting}
          editingBrand={editingBrand as any}
          onMediaSelectorOpen={() => setMediaSelectorOpen(true)}
        />
      </Modal>

      <MediaSelector 
        isOpen={mediaSelectorOpen} 
        onClose={() => setMediaSelectorOpen(false)} 
        onSelect={handleMediaSelect}
        selectedUrls={formData.logo ? [formData.logo] : []}
      />
    </div>
  );
};
