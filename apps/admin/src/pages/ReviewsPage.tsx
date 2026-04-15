import React from 'react';
import { 
  Plus,
  Loader2,
  Search,
  Filter
} from 'lucide-react';
import { Modal } from '../components/admin/Modal';
import { useReviews } from '../features/reviews/useReviews';
import { ReviewTable } from '../features/reviews/components/ReviewTable';
import { ReviewForm } from '../features/reviews/components/ReviewForm';

export const ReviewsPage: React.FC = () => {
  const {
    products,
    loading,
    modalOpen,
    setModalOpen,
    submitting,
    searchTerm,
    setSearchTerm,
    filterPlatform,
    setFilterPlatform,
    formData,
    setFormData,
    filteredReviews,
    handleToggleApproval,
    handleSubmit,
    handleDelete,
    resetForm
  } = useReviews();

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-end justify-between">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase leading-none">Social Proof</span>
          <h2 className="text-4xl font-serif text-foreground tracking-tight">Customer Reviews</h2>
        </div>
        <button 
          onClick={() => {
            resetForm();
            setModalOpen(true);
          }}
          className="flex items-center gap-3 bg-foreground text-primary-foreground px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all duration-300 shadow-xl shadow-black/5"
        >
          <Plus size={18} /> Add Manual Review
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 border border-border">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input 
            type="text" 
            placeholder="Search by name, product or content..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-muted/30 border border-border pl-10 pr-4 py-2 text-xs focus:border-primary focus:outline-none transition-colors duration-300" 
          />
        </div>
        
        <div className="flex items-center gap-3">
          <Filter size={14} className="text-muted-foreground" />
          <select 
            value={filterPlatform} 
            onChange={(e) => setFilterPlatform(e.target.value)}
            className="bg-transparent text-[10px] font-bold uppercase tracking-widest focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Platforms</option>
            <option value="WEBSITE">Website</option>
            <option value="FACEBOOK">Facebook</option>
            <option value="INSTAGRAM">Instagram</option>
            <option value="TIKTOK">TikTok</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-40 flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-primary" size={40} />
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Gathering Feedback...</p>
        </div>
      ) : (
        <ReviewTable 
          reviews={filteredReviews}
          onToggleApproval={handleToggleApproval}
          onDelete={handleDelete}
        />
      )}

      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title="Register Manual Review Entry"
        size="lg"
      >
        <ReviewForm 
          formData={formData}
          setFormData={setFormData}
          products={products}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      </Modal>
    </div>
  );
};
