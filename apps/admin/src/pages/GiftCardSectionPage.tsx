import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Loader2, Gift, Check, Power } from 'lucide-react';
import { Modal } from '../components/admin/Modal';
import { useFetch, useDelete } from '../hooks/useCrud';
import { apiService } from '../services/api.service';
import { API_ROUTES } from '../config/constants';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface GiftCardSection {
  id: string;
  badge?: string;
  title: string;
  titleSecondary?: string;
  description: string;
  ctaText?: string;
  ctaLink?: string;
  cardTitle: string;
  cardAmount: string;
  cardType: string;
  amounts: string[];
  isActive: boolean;
}

export const GiftCardSectionPage: React.FC = () => {
  const { data: sections, loading, refresh } = useFetch<GiftCardSection>(API_ROUTES.GIFT_CARD_SECTION.BASE);
  const { deleteItem } = useDelete(API_ROUTES.GIFT_CARD_SECTION.BASE);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingSection, setEditingSection] = useState<GiftCardSection | null>(null);
  
  const [formData, setFormData] = useState({
    badge: 'The Ultimate Gift',
    title: 'Share the Luxury',
    titleSecondary: 'of Authentic Fashion',
    description: 'Not sure what to pick? Our digital gift cards are the perfect way to give them exactly what they want.',
    ctaText: 'Purchase a Gift Card',
    ctaLink: '/gift-cards',
    cardTitle: 'Amber',
    cardAmount: '100,000 MMK',
    cardType: 'Gift Card',
    amounts: ['50,000 MMK', '100,000 MMK', '200,000 MMK', '500,000 MMK'],
    isActive: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const endpoint = editingSection 
        ? API_ROUTES.GIFT_CARD_SECTION.BY_ID(editingSection.id)
        : API_ROUTES.GIFT_CARD_SECTION.BASE;
      
      const method = editingSection ? 'PATCH' : 'POST';

      await apiService(endpoint, {
        method,
        body: formData,
      });

      setModalOpen(false);
      refresh();
    } catch (error) {
      console.error('Failed to save section:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (section: GiftCardSection) => {
    try {
      await apiService(API_ROUTES.GIFT_CARD_SECTION.BY_ID(section.id), {
        method: 'PATCH',
        body: { isActive: !section.isActive },
      });
      refresh();
    } catch (error) {
      console.error('Failed to toggle active status:', error);
    }
  };

  const openAddModal = () => {
    setEditingSection(null);
    setFormData({
      badge: 'The Ultimate Gift',
      title: 'Share the Luxury',
      titleSecondary: 'of Authentic Fashion',
      description: 'Not sure what to pick? Our digital gift cards are the perfect way to give them exactly what they want.',
      ctaText: 'Purchase a Gift Card',
      ctaLink: '/gift-cards',
      cardTitle: 'Amber',
      cardAmount: '100,000 MMK',
      cardType: 'Gift Card',
      amounts: ['50,000 MMK', '100,000 MMK', '200,000 MMK', '500,000 MMK'],
      isActive: false
    });
    setModalOpen(true);
  };

  const openEditModal = (section: GiftCardSection) => {
    setEditingSection(section);
    setFormData({ 
      badge: section.badge || '',
      title: section.title,
      titleSecondary: section.titleSecondary || '',
      description: section.description,
      ctaText: section.ctaText || '',
      ctaLink: section.ctaLink || '',
      cardTitle: section.cardTitle,
      cardAmount: section.cardAmount,
      cardType: section.cardType,
      amounts: section.amounts || ['50,000 MMK', '100,000 MMK', '200,000 MMK', '500,000 MMK'],
      isActive: section.isActive
    });
    setModalOpen(true);
  };

  const handleAmountChange = (index: number, value: string) => {
    const newAmounts = [...formData.amounts];
    newAmounts[index] = value;
    setFormData({ ...formData, amounts: newAmounts });
  };

  const addAmountField = () => {
    setFormData({ ...formData, amounts: [...formData.amounts, ''] });
  };

  const removeAmountField = (index: number) => {
    const newAmounts = formData.amounts.filter((_, i) => i !== index);
    setFormData({ ...formData, amounts: newAmounts });
  };

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
            <div key={section.id} className={cn(
              "group relative bg-card border transition-all duration-500 overflow-hidden",
              section.isActive ? "border-primary shadow-lg shadow-primary/5" : "border-border hover:border-primary/50"
            )}>
              <div className="aspect-[16/9] bg-[#1A1A1A] relative overflow-hidden flex items-center justify-center p-6">
                 {/* Mini Preview of the card */}
                 <div className="w-full h-full bg-gradient-to-br from-[#D4AF37] to-[#F5F0E1] rounded-lg p-4 flex flex-col justify-between shadow-xl">
                    <div className="flex justify-between items-start">
                      <span className="font-serif text-[10px] tracking-tighter uppercase text-[#1A1A1A]">{section.cardTitle}</span>
                      <Gift className="w-4 h-4 text-[#1A1A1A]/20" />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[6px] uppercase tracking-widest font-bold opacity-40 text-[#1A1A1A]">{section.cardType}</span>
                      <p className="text-lg font-serif text-[#1A1A1A]">{section.cardAmount}</p>
                    </div>
                 </div>

                {section.isActive && (
                  <div className="absolute top-4 right-4 bg-primary text-white p-2 rounded-full shadow-lg">
                    <Check size={16} />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                   <button onClick={() => openEditModal(section)} className="p-3 bg-white text-black hover:bg-primary hover:text-white transition-colors"><Edit2 size={18}/></button>
                   <button onClick={() => deleteItem(section.id).then(refresh)} className="p-3 bg-white text-destructive hover:bg-destructive hover:text-white transition-colors"><Trash2 size={18}/></button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-primary">{section.badge}</div>
                  <h3 className="text-xl font-serif text-foreground truncate">{section.title}</h3>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                   <button 
                    onClick={() => handleToggleActive(section)}
                    className={cn(
                      "flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors",
                      section.isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
                    )}
                   >
                     <Power size={14} />
                     {section.isActive ? 'Active' : 'Set Active'}
                   </button>
                   <span className="text-[9px] font-mono text-muted-foreground/40">{section.id.split('-')[0]}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editingSection ? 'Refine Gift Card Design' : 'Initialize Gift Card Section'}
      >
        <form onSubmit={handleSubmit} className="space-y-8 py-4 max-h-[70vh] overflow-y-auto px-1 custom-scrollbar">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Badge Label</label>
                <input
                  type="text"
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  className="w-full h-10 border-b border-input bg-transparent text-sm focus:border-primary focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Title Main</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full h-12 border-b border-input bg-transparent text-2xl font-serif focus:border-primary focus:outline-none transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Title Secondary</label>
                <input
                  type="text"
                  value={formData.titleSecondary}
                  onChange={(e) => setFormData({ ...formData, titleSecondary: e.target.value })}
                  className="w-full h-12 border-b border-input bg-transparent text-2xl font-serif focus:border-primary focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">Narrative Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full h-24 border border-input bg-transparent p-4 text-sm focus:border-primary focus:outline-none transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="space-y-2">
                 <label className="text-[10px] font-bold uppercase text-muted-foreground">CTA Text</label>
                 <input type="text" value={formData.ctaText} onChange={(e) => setFormData({...formData, ctaText: e.target.value})} className="w-full border-b border-border bg-transparent p-1 text-xs focus:border-primary outline-none" />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-bold uppercase text-muted-foreground">CTA Link</label>
                 <input type="text" value={formData.ctaLink} onChange={(e) => setFormData({...formData, ctaLink: e.target.value})} className="w-full border-b border-border bg-transparent p-1 text-xs font-mono focus:border-primary outline-none" />
               </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-border">
               <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary">Visual Card Configuration</h4>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="space-y-2">
                   <label className="text-[10px] uppercase font-bold text-muted-foreground">Card Title</label>
                   <input type="text" value={formData.cardTitle} onChange={(e) => setFormData({...formData, cardTitle: e.target.value})} className="w-full border-b border-border bg-transparent text-sm focus:border-primary outline-none" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] uppercase font-bold text-muted-foreground">Card Amount</label>
                   <input type="text" value={formData.cardAmount} onChange={(e) => setFormData({...formData, cardAmount: e.target.value})} className="w-full border-b border-border bg-transparent text-sm focus:border-primary outline-none" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] uppercase font-bold text-muted-foreground">Card Type Label</label>
                   <input type="text" value={formData.cardType} onChange={(e) => setFormData({...formData, cardType: e.target.value})} className="w-full border-b border-border bg-transparent text-sm focus:border-primary outline-none" />
                 </div>
               </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-border">
               <div className="flex justify-between items-center">
                 <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary">Selectable Purchase Amounts</h4>
                 <button type="button" onClick={addAmountField} className="text-[10px] font-bold uppercase text-primary hover:underline">+ Add Amount</button>
               </div>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {formData.amounts.map((amount, index) => (
                   <div key={index} className="relative group">
                     <input
                       type="text"
                       value={amount}
                       onChange={(e) => handleAmountChange(index, e.target.value)}
                       placeholder="e.g. 50,000 MMK"
                       className="w-full h-10 border border-input bg-transparent px-3 text-xs focus:border-primary focus:outline-none transition-colors"
                     />
                     {formData.amounts.length > 1 && (
                       <button
                         type="button"
                         onClick={() => removeAmountField(index)}
                         className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                       >
                         <Trash2 size={10} />
                       </button>
                     )}
                   </div>
                 ))}
               </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-border">
            <button type="button" onClick={() => setModalOpen(false)} className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground">Cancel</button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-foreground text-primary-foreground px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all disabled:opacity-50"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : editingSection ? 'Commit Changes' : 'Initialize Design'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
