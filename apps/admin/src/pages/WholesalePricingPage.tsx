import React, { useState } from 'react';
import { Layers, Plus, Trash2 } from 'lucide-react';
import { useFetch } from '../hooks/useCrud';
import { apiService, formatApiErrorMessage } from '../services/api.service';
import { API_ROUTES } from '../config/constants';

interface ProductOption {
  id: string;
  name: string;
}

interface PriceTierRow {
  id: string;
  minQuantity: number;
  price: string | number;
  currencyCode: string;
}

export const WholesalePricingPage: React.FC = () => {
  const { data: products } = useFetch<ProductOption>(API_ROUTES.PRODUCTS.BASE);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [tiers, setTiers] = useState<PriceTierRow[]>([]);
  const [loadingTiers, setLoadingTiers] = useState(false);
  const [minQuantity, setMinQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadTiers = async (productId: string) => {
    if (!productId) {
      setTiers([]);
      return;
    }
    setLoadingTiers(true);
    try {
      const res = await apiService<null, { data: PriceTierRow[] } | PriceTierRow[]>(
        `${API_ROUTES.PRICE_TIERS.BASE}?productId=${productId}`,
      );
      setTiers(Array.isArray(res) ? res : res.data);
    } catch {
      setTiers([]);
    } finally {
      setLoadingTiers(false);
    }
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProductId(productId);
    loadTiers(productId);
  };

  const handleAddTier = async () => {
    if (!selectedProductId || !minQuantity || !price) return;
    setSubmitting(true);
    try {
      await apiService(API_ROUTES.PRICE_TIERS.BASE, {
        method: 'POST',
        body: {
          productId: selectedProductId,
          minQuantity: Number(minQuantity),
          price: Number(price),
          currencyCode: 'USD',
        },
      });
      setMinQuantity('');
      setPrice('');
      loadTiers(selectedProductId);
    } catch (error) {
      alert(formatApiErrorMessage(error, 'Failed to add price tier'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTier = async (id: string) => {
    if (!window.confirm('Remove this price tier?')) return;
    try {
      await apiService(API_ROUTES.PRICE_TIERS.BY_ID(id), { method: 'DELETE' });
      loadTiers(selectedProductId);
    } catch (error) {
      alert(formatApiErrorMessage(error, 'Failed to remove price tier'));
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 text-primary">
          <Layers size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-serif font-bold tracking-tight">Wholesale Pricing</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">
            Quantity-break pricing applied automatically at checkout
          </p>
        </div>
      </div>

      <div className="max-w-md space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Product</label>
        <select
          value={selectedProductId}
          onChange={(e) => handleSelectProduct(e.target.value)}
          className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-sm focus:border-primary focus:outline-none cursor-pointer"
        >
          <option value="">Select a product</option>
          {(products || []).map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {selectedProductId && (
        <div className="space-y-6 max-w-2xl">
          {loadingTiers ? (
            <p className="text-xs text-muted-foreground uppercase tracking-widest">Loading tiers...</p>
          ) : (
            <div className="border border-border divide-y divide-border">
              {tiers.length === 0 ? (
                <p className="p-6 text-xs text-muted-foreground italic">No price tiers yet — this product uses its base price at any quantity.</p>
              ) : (
                tiers.map((t) => (
                  <div key={t.id} className="flex items-center justify-between px-6 py-4">
                    <span className="text-sm">
                      Buy <strong>{t.minQuantity}+</strong> units for <strong>${Number(t.price).toFixed(2)}</strong> each
                    </span>
                    <button onClick={() => handleDeleteTier(t.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          <div className="flex items-end gap-4 p-6 border border-dashed border-primary/20 bg-secondary/30">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Min Quantity</label>
              <input
                type="number"
                min={1}
                value={minQuantity}
                onChange={(e) => setMinQuantity(e.target.value)}
                className="w-32 h-10 border border-border bg-transparent px-3 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Price per Unit (USD)</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-32 h-10 border border-border bg-transparent px-3 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <button
              onClick={handleAddTier}
              disabled={submitting || !minQuantity || !price}
              className="flex items-center gap-2 bg-foreground text-primary-foreground px-6 h-10 text-[10px] font-bold uppercase tracking-widest hover:bg-primary transition-colors disabled:opacity-50"
            >
              <Plus size={14} />
              Add Tier
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
