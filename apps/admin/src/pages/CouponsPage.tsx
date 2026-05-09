import React from 'react';
import { Plus } from 'lucide-react';
import { Modal } from '../components/admin/Modal';
import { useCoupons } from '../features/coupons/useCoupons';
import { CouponTable } from '../features/coupons/CouponTable';
import { CouponForm } from '../features/coupons/CouponForm';

export const CouponsPage: React.FC = () => {
  const {
    coupons,
    loading,
    modalOpen,
    setModalOpen,
    submitting,
    editingCoupon,
    formData,
    setFormData,
    handleSubmit,
    handleDelete,
    openAddModal,
    openEditModal
  } = useCoupons();

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-end justify-between">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase leading-none">Promotions</span>
          <h2 className="text-4xl font-serif text-foreground tracking-tight">Voucher Management</h2>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-3 bg-foreground text-primary-foreground px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all duration-300 shadow-xl shadow-black/5"
        >
          <Plus size={18} /> New Coupon
        </button>
      </div>

      <CouponTable 
        coupons={coupons}
        loading={loading}
        onEdit={openEditModal}
        onDelete={handleDelete}
      />

      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editingCoupon ? 'Modify Promotion Parameters' : 'Initialize New Promotion'}
      >
        <CouponForm 
          formData={formData as any}
          setFormData={setFormData as any}
          onSubmit={handleSubmit}
          submitting={submitting}
          editingCoupon={editingCoupon}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
};
