import React, { useState } from 'react';
import { CreditCard, Plus, Trash2, Edit2, Loader2, FileText, Calendar, RefreshCw, CheckCircle2, XCircle, DollarSign } from 'lucide-react';
import { Modal } from '../components/admin/Modal';
import { useFetch, useDelete } from '../hooks/useCrud';
import { apiService } from '../services/api.service';
import { API_ROUTES } from '../config/constants';

interface GiftCard {
  id: string;
  code: string;
  initialBalance: number;
  currentBalance: number;
  expiryDate?: string;
  isActive: boolean;
  note?: string;
}

export const GiftCardsPage: React.FC = () => {
  const { data: giftCards, loading, refresh } = useFetch<GiftCard>(API_ROUTES.GIFT_CARDS.BASE);
  const { deleteItem } = useDelete(API_ROUTES.GIFT_CARDS.BASE);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingGiftCard, setEditingGiftCard] = useState<GiftCard | null>(null);
  const [formData, setFormData] = useState({ 
    code: '', 
    initialBalance: 0,
    currentBalance: 0,
    expiryDate: '',
    isActive: true,
    note: ''
  });

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      if (i < 3) code += '-';
    }
    setFormData({ ...formData, code });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const endpoint = editingGiftCard 
        ? API_ROUTES.GIFT_CARDS.BY_ID(editingGiftCard.id)
        : API_ROUTES.GIFT_CARDS.BASE;
      
      const method = editingGiftCard ? 'PATCH' : 'POST';

      const cleanedData = {
        ...formData,
        initialBalance: Number(formData.initialBalance),
        currentBalance: Number(formData.currentBalance),
        expiryDate: formData.expiryDate || null,
        note: formData.note || null
      };

      await apiService(endpoint, {
        method,
        body: cleanedData,
      });

      setModalOpen(false);
      setEditingGiftCard(null);
      setFormData({ 
        code: '', 
        initialBalance: 0,
        currentBalance: 0,
        expiryDate: '',
        isActive: true,
        note: ''
      });
      refresh();
    } catch (error) {
      console.error('Failed to save gift card:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteItem(id, 'Are you sure? This will permanently invalidate the gift card.');
    if (success) refresh();
  };

  const openAddModal = () => {
    setEditingGiftCard(null);
    setFormData({ 
      code: '', 
      initialBalance: 0,
      currentBalance: 0,
      expiryDate: '',
      isActive: true,
      note: ''
    });
    setModalOpen(true);
  };

  const openEditModal = (giftCard: GiftCard) => {
    setEditingGiftCard(giftCard);
    setFormData({ 
      code: giftCard.code, 
      initialBalance: giftCard.initialBalance,
      currentBalance: giftCard.currentBalance,
      expiryDate: giftCard.expiryDate ? new Date(giftCard.expiryDate).toISOString().split('T')[0] : '',
      isActive: giftCard.isActive,
      note: giftCard.note || ''
    });
    setModalOpen(true);
  };

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

      <div className="border border-border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">Card Identity</th>
              <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">Balance Status</th>
              <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">Validity</th>
              <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase text-center">Status</th>
              <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase text-right">Options</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={5} className="px-10 py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic animate-pulse">Querying Gift Card Repository...</td></tr>
            ) : !giftCards || giftCards.length === 0 ? (
              <tr><td colSpan={5} className="px-10 py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic">No gift cards found.</td></tr>
            ) : (
              giftCards.map((card) => (
                <tr key={card.id} className="group hover:bg-muted/50 transition-colors duration-300">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-secondary border border-border flex items-center justify-center">
                        <CreditCard size={18} className="text-primary/40" />
                      </div>
                      <div className="space-y-1">
                        <div className="text-lg font-serif text-foreground tracking-wide uppercase font-mono">{card.code}</div>
                        <div className="text-[9px] font-mono text-muted-foreground/40 uppercase tracking-widest max-w-[200px] truncate">
                          {card.note || "NO INTERNAL NOTES"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-foreground">
                        ${card.currentBalance.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Original: ${card.initialBalance.toFixed(2)}
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-wider">
                      <Calendar size={10} /> {card.expiryDate ? new Date(card.expiryDate).toLocaleDateString() : 'NO EXPIRY'}
                    </div>
                  </td>
                  <td className="px-10 py-6 text-center">
                    <div className="flex justify-center">
                      {card.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wider">
                          <CheckCircle2 size={12} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                          <XCircle size={12} /> Inactive
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button 
                        onClick={() => openEditModal(card)}
                        className="p-2.5 text-muted-foreground hover:text-foreground transition-colors duration-300"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(card.id)}
                        className="p-2.5 text-muted-foreground hover:text-destructive transition-colors duration-300"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
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
        title={editingGiftCard ? 'Modify Gift Certificate' : 'Issue New Gift Certificate'}
      >
        <form onSubmit={handleSubmit} className="space-y-8 py-4">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground flex justify-between">
                <span>Unique Access Code</span>
                {!editingGiftCard && (
                  <button 
                    type="button" 
                    onClick={generateCode}
                    className="flex items-center gap-1 text-primary hover:text-primary/70 transition-colors"
                  >
                    <RefreshCw size={10} /> Auto-Generate
                  </button>
                )}
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-2xl font-mono placeholder:text-muted-foreground/20 focus:border-primary focus:outline-none transition-colors duration-300 rounded-none uppercase tracking-widest"
                placeholder="XXXX-XXXX-XXXX-XXXX"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground flex items-center gap-2">
                  <DollarSign size={12}/> Initial Balance
                </label>
                <input
                  type="number"
                  required
                  value={formData.initialBalance}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setFormData({ ...formData, initialBalance: val, currentBalance: editingGiftCard ? formData.currentBalance : val });
                  }}
                  className="w-full h-10 border border-border bg-transparent px-4 text-sm focus:border-primary focus:outline-none transition-colors"
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground flex items-center gap-2">
                  <DollarSign size={12}/> Current Balance
                </label>
                <input
                  type="number"
                  required
                  value={formData.currentBalance}
                  onChange={(e) => setFormData({ ...formData, currentBalance: Number(e.target.value) })}
                  className="w-full h-10 border border-border bg-transparent px-4 text-sm focus:border-primary focus:outline-none transition-colors"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground flex items-center gap-2">
                  <Calendar size={14}/> Expiry Date
                </label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full h-10 border border-border bg-transparent px-4 text-sm focus:border-primary focus:outline-none transition-colors"
                />
              </div>
              <div className="flex items-end pb-2">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <label htmlFor="isActive" className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground cursor-pointer">
                    Card Valid & Active
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground flex items-center gap-2">
                <FileText size={14}/> Internal Note
              </label>
              <textarea
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                className="w-full h-24 border border-input bg-transparent p-4 text-sm focus:border-primary focus:outline-none transition-colors duration-300 rounded-none resize-none"
                placeholder="Purchaser details, gifting event, or special conditions..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-border">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground px-4 transition-colors duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-3 bg-foreground text-primary-foreground px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-colors duration-300 disabled:opacity-50"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {editingGiftCard ? 'Save Changes' : 'Issue Gift Card'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
