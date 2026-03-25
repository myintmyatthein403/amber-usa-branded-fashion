import React, { useState } from 'react';
import { Megaphone, Plus, Trash2, Edit2, Loader2, Save, X, Eye, Calendar, Layout, Link as LinkIcon, ArrowUpRight } from 'lucide-react';
import { Modal } from '../components/admin/Modal';
import { useFetch, useDelete } from '../hooks/useCrud';
import { apiService } from '../services/api.service';
import { API_ROUTES } from '../config/constants';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

enum AdPlacement {
  TOP_BAR = 'TOP_BAR',
  HOME_HERO = 'HOME_HERO',
  HOME_BANNER = 'HOME_BANNER',
  PRODUCT_PAGE = 'PRODUCT_PAGE',
  POPUP = 'POPUP'
}

enum AdStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED'
}

interface Ad {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  placement: AdPlacement;
  status: AdStatus;
  startDate?: string;
  endDate?: string;
  priority: number;
  createdAt: string;
}

export const AdsPage: React.FC = () => {
  const { data: ads, loading, refresh } = useFetch<Ad>(API_ROUTES.ADS.BASE);
  const { deleteItem } = useDelete(API_ROUTES.ADS.BASE);

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    imageUrl: '',
    linkUrl: '',
    placement: AdPlacement.HOME_HERO,
    status: AdStatus.DRAFT,
    startDate: '',
    endDate: '',
    priority: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const endpoint = editingAd 
        ? API_ROUTES.ADS.BY_ID(editingAd.id) 
        : API_ROUTES.ADS.BASE;
      
      const method = editingAd ? 'PATCH' : 'POST';

      await apiService(endpoint, {
        method,
        body: {
          ...form,
          priority: parseInt(form.priority.toString()),
          startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
          endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
        },
      });

      setModalOpen(false);
      refresh();
    } catch (error) {
      console.error('Failed to save ad:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const openAddModal = () => {
    setEditingAd(null);
    setForm({ 
      title: '', description: '', imageUrl: '', 
      linkUrl: '', placement: AdPlacement.HOME_HERO, 
      status: AdStatus.DRAFT, startDate: '', 
      endDate: '', priority: 0 
    });
    setModalOpen(true);
  };

  const openEditModal = (ad: Ad) => {
    setEditingAd(ad);
    setForm({ 
      title: ad.title, 
      description: ad.description || '', 
      imageUrl: ad.imageUrl,
      linkUrl: ad.linkUrl || '',
      placement: ad.placement,
      status: ad.status,
      startDate: ad.startDate ? new Date(ad.startDate).toISOString().split('T')[0] : '',
      endDate: ad.endDate ? new Date(ad.endDate).toISOString().split('T')[0] : '',
      priority: ad.priority
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const success = await deleteItem(id, 'Are you sure you want to delete this advertisement?');
    if (success) refresh();
  };

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
            <div key={ad.id} className="group bg-card border border-border overflow-hidden flex flex-col transition-all duration-500 hover:shadow-2xl hover:shadow-black/5">
              <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                <img 
                  src={ad.imageUrl} 
                  alt={ad.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                   <div className="flex gap-2">
                      <button onClick={() => openEditModal(ad)} className="w-10 h-10 bg-white text-black flex items-center justify-center rounded-full hover:bg-primary hover:text-white transition-all">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(ad.id)} className="w-10 h-10 bg-white text-black flex items-center justify-center rounded-full hover:bg-destructive hover:text-white transition-all">
                        <Trash2 size={16} />
                      </button>
                   </div>
                </div>
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className={cn(
                    "text-[8px] font-bold uppercase tracking-widest px-2 py-1 border backdrop-blur-md",
                    ad.status === AdStatus.ACTIVE ? "border-emerald-500/20 text-emerald-400 bg-emerald-500/10" : 
                    ad.status === AdStatus.DRAFT ? "border-amber-500/20 text-amber-400 bg-amber-500/10" :
                    "border-zinc-500/20 text-zinc-400 bg-zinc-500/10"
                  )}>
                    {ad.status}
                  </span>
                  <span className="text-[8px] font-bold uppercase tracking-widest px-2 py-1 border backdrop-blur-md border-white/20 text-white bg-black/20">
                    {ad.placement.replace('_', ' ')}
                  </span>
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-serif text-foreground tracking-tight group-hover:text-primary transition-colors">{ad.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{ad.description || 'No description provided.'}</p>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between mt-auto">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Priority</span>
                    <span className="text-sm font-mono font-bold text-foreground">LVL {ad.priority}</span>
                  </div>
                  {ad.linkUrl && (
                    <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                      <ArrowUpRight size={18} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editingAd ? `Edit Campaign: ${editingAd.title}` : 'Initialize New Campaign'}
      >
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Campaign Title</label>
              <input 
                type="text" 
                required 
                value={form.title} 
                onChange={(e) => setForm({ ...form, title: e.target.value })} 
                className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-lg font-serif placeholder:text-muted-foreground/20 focus:border-primary focus:outline-none transition-colors duration-300 rounded-none" 
                placeholder="e.g. Summer Collection 2026" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Placement Zone</label>
              <select 
                value={form.placement} 
                onChange={(e) => setForm({ ...form, placement: e.target.value as AdPlacement })}
                className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-sm font-bold uppercase tracking-widest focus:border-primary focus:outline-none transition-colors duration-300 rounded-none"
              >
                {Object.values(AdPlacement).map(p => (
                  <option key={p} value={p}>{p.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Creative Image URL</label>
            <div className="relative">
              <input 
                type="text" 
                required 
                value={form.imageUrl} 
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} 
                className="w-full h-12 border-b border-input bg-transparent pl-0 pr-10 py-2 text-sm focus:border-primary focus:outline-none transition-colors duration-300 rounded-none" 
                placeholder="https://images.unsplash.com/..." 
              />
              <Layout className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={18} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Target Destination (Link)</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={form.linkUrl} 
                  onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} 
                  className="w-full h-12 border-b border-input bg-transparent pl-0 pr-10 py-2 text-sm focus:border-primary focus:outline-none transition-colors duration-300 rounded-none" 
                  placeholder="/collections/summer" 
                />
                <LinkIcon className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={18} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Priority Level (Highest First)</label>
              <input 
                type="number" 
                value={form.priority} 
                onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 0 })} 
                className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-lg font-mono focus:border-primary focus:outline-none transition-colors duration-300 rounded-none" 
                placeholder="0" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Start Date</label>
              <input 
                type="date" 
                value={form.startDate} 
                onChange={(e) => setForm({ ...form, startDate: e.target.value })} 
                className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-sm focus:border-primary focus:outline-none transition-colors duration-300 rounded-none uppercase tracking-widest" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">End Date</label>
              <input 
                type="date" 
                value={form.endDate} 
                onChange={(e) => setForm({ ...form, endDate: e.target.value })} 
                className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-sm focus:border-primary focus:outline-none transition-colors duration-300 rounded-none uppercase tracking-widest" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Current Lifecycle Status</label>
            <div className="flex gap-4 pt-2">
              {Object.values(AdStatus).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm({ ...form, status: s })}
                  className={cn(
                    "flex-1 py-3 text-[10px] font-bold uppercase tracking-widest border transition-all duration-300",
                    form.status === s ? "bg-foreground text-background border-foreground" : "bg-transparent text-muted-foreground border-border hover:border-muted-foreground"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-10 border-t border-border">
            <button 
              type="submit" 
              disabled={submitting} 
              className="flex items-center gap-3 bg-foreground text-primary-foreground px-10 py-4 text-xs font-bold uppercase tracking-[0.3em] hover:bg-primary transition-colors duration-500 disabled:opacity-50"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {editingAd ? 'Update Campaign' : 'Launch Campaign'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
