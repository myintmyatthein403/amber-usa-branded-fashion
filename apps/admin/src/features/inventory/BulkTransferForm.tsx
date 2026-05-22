import React, { useState } from 'react';
import { Package, ArrowRight, Loader2, Minus, Plus } from 'lucide-react';
import { GroupedInventory, Warehouse } from './schema';

interface BulkTransferFormProps {
  groupedInventory: GroupedInventory[];
  warehouses: Warehouse[];
  submitting: boolean;
  onClose: () => void;
  onSubmit: (data: {
    fromWarehouseId: string;
    toWarehouseId: string;
    items: { variantId: string; quantity: number }[];
    note?: string;
  }) => void;
}

export const BulkTransferForm: React.FC<BulkTransferFormProps> = ({
  groupedInventory,
  warehouses,
  submitting,
  onClose,
  onSubmit
}) => {
  const [fromWhId, setFromWhId] = useState('');
  const [toWhId, setToWhId] = useState('');
  const [note, setNote] = useState('');
  const [search, setSearch] = useState('');
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});

  const availableVariants = groupedInventory.filter(g => {
    const hasStock = fromWhId ? (g.stocks[fromWhId] || 0) > 0 : true;
    const matchesSearch = 
      g.product.name.toLowerCase().includes(search.toLowerCase()) || 
      g.variant.sku.toLowerCase().includes(search.toLowerCase());
    return hasStock && matchesSearch;
  });

  const handleQtyChange = (variantId: string, qty: number, max: number) => {
    const safeQty = Math.max(0, Math.min(qty, max));
    setSelectedItems(prev => ({
      ...prev,
      [variantId]: safeQty
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const items = Object.entries(selectedItems)
      .filter(([_, qty]) => qty > 0)
      .map(([variantId, quantity]) => ({ variantId, quantity }));

    if (items.length === 0) return;

    onSubmit({
      fromWarehouseId: fromWhId,
      toWarehouseId: toWhId,
      items,
      note
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 py-4 animate-in fade-in slide-in-from-bottom-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Origin Node</label>
          <select
            required
            value={fromWhId}
            onChange={(e) => {
              setFromWhId(e.target.value);
              setSelectedItems({});
            }}
            className="w-full h-12 border-b border-border bg-transparent px-0 py-2 text-sm font-bold uppercase tracking-widest focus:border-primary focus:outline-none"
          >
            <option value="">Select Origin</option>
            {warehouses.map(w => (
              <option key={w.id} value={w.id}>{w.name} ({w.location})</option>
            ))}
          </select>
        </div>
        <div className="flex justify-center hidden md:flex pt-6">
          <ArrowRight className="text-muted-foreground/30" size={24} />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Destination Node</label>
          <select
            required
            value={toWhId}
            onChange={(e) => setToWhId(e.target.value)}
            className="w-full h-12 border-b border-border bg-transparent px-0 py-2 text-sm font-bold uppercase tracking-widest focus:border-primary focus:outline-none"
          >
            <option value="">Select Destination</option>
            {warehouses.filter(w => w.id !== fromWhId).map(w => (
              <option key={w.id} value={w.id}>{w.name} ({w.location})</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Manifest (Select Items)</label>
          <div className="relative">
            <input 
              type="text"
              placeholder="Search SKU or Product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 h-9 bg-muted/20 border-b border-border text-[10px] font-bold uppercase tracking-widest px-0 focus:border-primary focus:outline-none transition-colors"
            />
          </div>
        </div>
        <div className="border border-border max-h-[400px] overflow-y-auto divide-y divide-border">
          {availableVariants.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-xs uppercase tracking-widest">
              No stock available in origin warehouse
            </div>
          ) : (
            availableVariants.map(group => {
              const max = group.stocks[fromWhId] || 0;
              const current = selectedItems[group.variant.id] || 0;
              return (
                <div key={group.variant.id} className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors">
                  <div className="w-10 h-10 bg-background border border-border flex items-center justify-center overflow-hidden shrink-0">
                    {group.product.images?.[0] ? (
                      <img src={group.product.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Package size={16} className="text-muted-foreground/30" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-bold truncate">{group.product.name}</div>
                    <div className="text-[8px] font-mono text-muted-foreground uppercase">{group.variant.sku} • {group.variant.size} • {group.variant.color}</div>
                    <div className="text-[8px] font-bold text-primary uppercase mt-1">Available: {max}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      type="button" 
                      onClick={() => handleQtyChange(group.variant.id, current - 1, max)}
                      className="w-8 h-8 bg-secondary flex items-center justify-center hover:bg-destructive hover:text-white transition-all"
                    >
                      <Minus size={12} />
                    </button>
                    <input 
                      type="number"
                      min="0"
                      max={max}
                      value={current}
                      onChange={(e) => handleQtyChange(group.variant.id, parseInt(e.target.value) || 0, max)}
                      className="w-12 h-8 bg-muted/20 border-b border-border text-center text-xs font-bold focus:border-primary focus:outline-none"
                    />
                    <button 
                      type="button" 
                      onClick={() => handleQtyChange(group.variant.id, current + 1, max)}
                      className="w-8 h-8 bg-secondary flex items-center justify-center hover:bg-primary hover:text-white transition-all"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Logistics Note (Optional)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full h-20 border border-border bg-transparent p-3 text-xs focus:border-primary focus:outline-none"
          placeholder="Reason for transfer, flight number, etc."
        />
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t border-border">
        <button
          type="button"
          onClick={onClose}
          className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground px-4 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || !fromWhId || !toWhId || Object.values(selectedItems).every(q => q === 0)}
          className="flex items-center gap-3 bg-foreground text-primary-foreground px-10 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-primary transition-colors disabled:opacity-50"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          Execute Bulk Transfer
        </button>
      </div>
    </form>
  );
};
