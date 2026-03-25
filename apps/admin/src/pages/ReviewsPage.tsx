import React, { useState, useMemo } from 'react';
import { 
  Star, 
  Trash2, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  MessageSquare, 
  ExternalLink, 
  Globe, 
  Facebook, 
  Instagram, 
  Plus,
  Search,
  Filter,
  User,
  ShoppingBag
} from 'lucide-react';
import { Modal } from '../components/admin/Modal';
import { useFetch, useDelete } from '../hooks/useCrud';
import { apiService } from '../services/api.service';
import { API_ROUTES } from '../config/constants';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Product {
  id: string;
  name: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  userName: string;
  userProfileUrl: string | null;
  platform: 'WEBSITE' | 'FACEBOOK' | 'INSTAGRAM' | 'TIKTOK';
  isApproved: boolean;
  productId: string;
  product: Product;
  createdAt: string;
}

export const ReviewsPage: React.FC = () => {
  const { data: reviews, loading, refresh } = useFetch<Review>(API_ROUTES.REVIEWS.BASE);
  const { data: products } = useFetch<Product>(API_ROUTES.PRODUCTS.BASE);
  const { deleteItem } = useDelete(API_ROUTES.REVIEWS.BASE);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlatform, setFilterPlatform] = useState<string>('ALL');

  const [formData, setFormData] = useState({
    userName: '',
    userProfileUrl: '',
    rating: 5,
    comment: '',
    platform: 'WEBSITE' as Review['platform'],
    productId: '',
    isApproved: true
  });

  const filteredReviews = useMemo(() => {
    if (!reviews) return [];
    return reviews.filter(review => {
      const matchesSearch = 
        review.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (review.comment?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
      
      const matchesPlatform = filterPlatform === 'ALL' || review.platform === filterPlatform;
      
      return matchesSearch && matchesPlatform;
    });
  }, [reviews, searchTerm, filterPlatform]);

  const handleToggleApproval = async (id: string) => {
    try {
      await apiService(API_ROUTES.REVIEWS.TOGGLE_APPROVAL(id), { method: 'PATCH' });
      refresh();
    } catch (error) {
      console.error('Failed to toggle approval:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiService(API_ROUTES.REVIEWS.BASE, {
        method: 'POST',
        body: {
          ...formData,
          rating: Number(formData.rating),
        },
      });
      setModalOpen(false);
      setFormData({
        userName: '',
        userProfileUrl: '',
        rating: 5,
        comment: '',
        platform: 'WEBSITE',
        productId: '',
        isApproved: true
      });
      refresh();
    } catch (error) {
      console.error('Failed to create review:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteItem(id, 'Delete this review permanently?');
    if (success) refresh();
  };

  const getPlatformIcon = (platform: Review['platform']) => {
    switch (platform) {
      case 'FACEBOOK': return <Facebook size={14} className="text-blue-600" />;
      case 'INSTAGRAM': return <Instagram size={14} className="text-pink-600" />;
      case 'TIKTOK': return <span className="text-[10px] font-bold">TT</span>;
      default: return <Globe size={14} className="text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-end justify-between">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase leading-none">Social Proof</span>
          <h2 className="text-4xl font-serif text-foreground tracking-tight">Customer Reviews</h2>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-3 bg-foreground text-primary-foreground px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all duration-300 shadow-xl shadow-black/5"
        >
          <Plus size={18} /> Add Manual Review
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 border border-border">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={16} />
          <input 
            type="text" 
            placeholder="Search reviews, users, or products..." 
            className="w-full pl-10 pr-4 py-2 bg-muted/20 border border-border text-xs focus:outline-none focus:border-primary transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
            <Filter size={14} /> Filter Platform:
          </div>
          <select 
            className="bg-transparent border-b border-border text-[10px] font-bold uppercase tracking-widest py-1 focus:outline-none focus:border-primary"
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value)}
          >
            <option value="ALL">ALL PLATFORMS</option>
            <option value="WEBSITE">WEBSITE</option>
            <option value="FACEBOOK">FACEBOOK</option>
            <option value="INSTAGRAM">INSTAGRAM</option>
            <option value="TIKTOK">TIKTOK</option>
          </select>
        </div>
      </div>

      <div className="border border-border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">Customer</th>
              <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">Review Content</th>
              <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">Rating</th>
              <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase text-center">Status</th>
              <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase text-right">Options</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={5} className="px-10 py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic animate-pulse">Scanning Social Data...</td></tr>
            ) : filteredReviews.length === 0 ? (
              <tr><td colSpan={5} className="px-10 py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic">No reviews match your criteria.</td></tr>
            ) : (
              filteredReviews.map((review) => (
                <tr key={review.id} className="group hover:bg-muted/30 transition-colors duration-300">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-secondary border border-border flex items-center justify-center rounded-full overflow-hidden">
                        <User size={18} className="text-muted-foreground/40" />
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm font-bold text-foreground flex items-center gap-2">
                          {review.userName}
                          {review.userProfileUrl && (
                            <a href={review.userProfileUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:scale-110 transition-transform">
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="p-1 bg-muted rounded-sm">{getPlatformIcon(review.platform)}</span>
                          <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{review.platform}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="space-y-2 max-w-md">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-widest">
                        <ShoppingBag size={10} /> {review.product.name}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 italic">"{review.comment || 'No comment provided.'}"</p>
                      <div className="text-[9px] text-muted-foreground/40 uppercase tracking-widest">{new Date(review.createdAt).toLocaleDateString()}</div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={12} 
                          className={cn(i < review.rating ? "text-amber-400 fill-amber-400" : "text-muted border-muted")} 
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-10 py-6 text-center">
                    <button 
                      onClick={() => handleToggleApproval(review.id)}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all duration-300",
                        review.isApproved 
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                          : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      )}
                    >
                      {review.isApproved ? <><CheckCircle2 size={12} /> Approved</> : <><XCircle size={12} /> Pending</>}
                    </button>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <button 
                      onClick={() => handleDelete(review.id)}
                      className="p-2.5 text-muted-foreground hover:text-destructive transition-colors duration-300 opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title="Add Manual Customer Review"
      >
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Customer Name</label>
              <input
                type="text"
                required
                className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-lg font-serif focus:border-primary focus:outline-none transition-colors rounded-none"
                placeholder="e.g. Daw Khin Kyi"
                value={formData.userName}
                onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Profile Link (Optional)</label>
              <input
                type="url"
                className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-sm font-mono focus:border-primary focus:outline-none transition-colors rounded-none"
                placeholder="https://facebook.com/user..."
                value={formData.userProfileUrl}
                onChange={(e) => setFormData({ ...formData, userProfileUrl: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Platform Source</label>
              <select
                className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-sm font-bold uppercase tracking-widest focus:border-primary focus:outline-none transition-colors rounded-none"
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value as any })}
              >
                <option value="WEBSITE">WEBSITE</option>
                <option value="FACEBOOK">FACEBOOK</option>
                <option value="INSTAGRAM">INSTAGRAM</option>
                <option value="TIKTOK">TIKTOK</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Target Product</label>
              <select
                required
                className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-sm font-bold uppercase tracking-widest focus:border-primary focus:outline-none transition-colors rounded-none"
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              >
                <option value="">Select Product</option>
                {products?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Star Rating</label>
              <div className="flex items-center h-12 gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className={cn(
                      "transition-all transform hover:scale-110",
                      star <= formData.rating ? "text-amber-400" : "text-muted-foreground/20"
                    )}
                  >
                    <Star size={20} fill={star <= formData.rating ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Review Comment</label>
            <textarea
              className="w-full h-32 border border-input bg-transparent p-4 text-sm focus:border-primary focus:outline-none transition-colors rounded-none resize-none"
              placeholder="What did the customer say about this product?"
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isApproved"
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              checked={formData.isApproved}
              onChange={(e) => setFormData({ ...formData, isApproved: e.target.checked })}
            />
            <label htmlFor="isApproved" className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground cursor-pointer">
              Approve for Public Display Immediately
            </label>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-border">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground px-4 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-3 bg-foreground text-primary-foreground px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-colors disabled:opacity-50"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              Publish Review
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
