import React, { useState } from 'react';
import { Plus, Edit2, Trash2, RefreshCw, DollarSign, Settings, AlertCircle } from 'lucide-react';
import { useCurrencies } from '../features/currencies/useCurrencies';
import { Currency, ExchangeRate } from '../features/currencies/schema';
import { Modal } from '../components/admin/Modal';

interface CurrencyData {
  id?: string;
  code: string;
  name: string;
  symbol: string;
  isBase?: boolean;
  isActive?: boolean;
  decimalPlaces?: number;
  position?: string;
}

export const CurrencyPage: React.FC = () => {
  const {
    currencies,
    exchangeRates,
    loading,
    addCurrency,
    editCurrency,
    removeCurrency,
    setBaseCurrency,
    addExchangeRate,
    updateExchangeRate,
    removeExchangeRate,
    refreshRates,
    clearError,
  } = useCurrencies();

  const STALE_MS = 24 * 60 * 60 * 1000;

  const isRateStale = (lastFetchedAt?: string | null) => {
    if (!lastFetchedAt) return true;
    return Date.now() - new Date(lastFetchedAt).getTime() > STALE_MS;
  };

  const getErrorMessage = (err: unknown): string => {
    if (err && typeof err === 'object' && 'message' in err) {
      const msg = (err as { message: unknown }).message;
      if (typeof msg === 'string') return msg;
      if (Array.isArray(msg)) return msg.join(', ');
    }
    if (err instanceof Error) return err.message;
    return 'Failed to save. Please try again.';
  };

  const currencyList = (currencies as CurrencyData[]);
  const ratesList = (exchangeRates as ExchangeRate[]);

  const [currencyModalOpen, setCurrencyModalOpen] = useState(false);
  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<any>(null);
  const [editingRate, setEditingRate] = useState<{ id: string; rate: number } | null>(null);
  
  const [currencyForm, setCurrencyForm] = useState({
    code: '',
    name: '',
    symbol: '',
    isBase: false,
    isActive: true,
    decimalPlaces: 2,
    position: 'prefix' as 'prefix' | 'suffix',
  });

  const [rateForm, setRateForm] = useState({
    fromCurrencyId: '',
    toCurrencyId: '',
    rate: '',
    effectiveDate: new Date().toISOString().split('T')[0],
  });

  const [currencyModalError, setCurrencyModalError] = useState<string | null>(null);
  const [rateModalError, setRateModalError] = useState<string | null>(null);

  const handleSaveCurrency = async () => {
    setCurrencyModalError(null);
    clearError?.();
    try {
      if (editingCurrency?.id) {
        await editCurrency(editingCurrency.id, currencyForm);
      } else {
        await addCurrency(currencyForm);
      }
      setCurrencyModalOpen(false);
      resetCurrencyForm();
    } catch (err) {
      setCurrencyModalError(getErrorMessage(err));
    }
  };

  const handleSaveRate = async () => {
    setRateModalError(null);
    clearError?.();
    try {
      if (editingRate) {
        await updateExchangeRate(editingRate.id, parseFloat(rateForm.rate));
      } else {
        await addExchangeRate({
          fromCurrencyId: rateForm.fromCurrencyId,
          toCurrencyId: rateForm.toCurrencyId,
          rate: parseFloat(rateForm.rate),
          effectiveDate: rateForm.effectiveDate,
        });
      }
      setRateModalOpen(false);
      resetRateForm();
    } catch (err) {
      setRateModalError(getErrorMessage(err));
    }
  };

  const resetCurrencyForm = () => {
    setEditingCurrency(null);
    setCurrencyForm({
      code: '',
      name: '',
      symbol: '',
      isBase: false,
      isActive: true,
      decimalPlaces: 2,
      position: 'prefix',
    });
  };

  const resetRateForm = () => {
    setEditingRate(null);
    setRateForm({
      fromCurrencyId: '',
      toCurrencyId: '',
      rate: '',
      effectiveDate: new Date().toISOString().split('T')[0],
    });
  };

  const openEditCurrency = (currency: any) => {
    setCurrencyModalError(null);
    setEditingCurrency(currency);
    setCurrencyForm({
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol,
      isBase: currency.isBase || false,
      isActive: currency.isActive || true,
      decimalPlaces: currency.decimalPlaces || 2,
      position: currency.position || 'prefix',
    });
    setCurrencyModalOpen(true);
  };

  const openEditRate = (rate: { id: string; rate: number }) => {
    setRateModalError(null);
    setEditingRate(rate);
    setRateForm({ ...rateForm, rate: rate.rate.toString() });
    setRateModalOpen(true);
  };

  if (loading) {
    return (
      <div className="py-40 flex flex-col items-center justify-center gap-4">
        <RefreshCw className="animate-spin text-primary" size={40} />
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Loading Currencies...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-end justify-between">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase leading-none">System Configuration</span>
          <h2 className="text-4xl font-serif text-foreground tracking-tight">Currency Management</h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => refreshRates?.()}
            className="flex items-center gap-2 px-4 py-3 border border-border text-xs font-bold uppercase tracking-[0.2em] hover:border-primary transition-all"
            title="Fetch latest USD/MMK from exchangerate.host"
          >
            <RefreshCw size={14} /> Refresh rates
          </button>
          <button
            onClick={() => {
              resetRateForm();
              setRateModalError(null);
              setRateModalOpen(true);
            }}
            className="flex items-center gap-3 px-6 py-3 border border-border text-xs font-bold uppercase tracking-[0.2em] hover:border-primary transition-all duration-300"
          >
            <RefreshCw size={18} /> Add Exchange Rate
          </button>
          <button
            onClick={() => {
              resetCurrencyForm();
              setCurrencyModalError(null);
              setCurrencyModalOpen(true);
            }}
            className="flex items-center gap-3 bg-foreground text-primary-foreground px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all duration-300 shadow-xl shadow-black/5"
          >
            <Plus size={18} /> Add Currency
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-card border border-border">
          <div className="p-6 border-b border-border flex items-center gap-3">
            <DollarSign size={18} className="text-primary" />
            <h3 className="text-lg font-serif text-foreground">Currencies</h3>
          </div>
          <div className="p-6 space-y-4">
            {currencyList.length === 0 ? (
              <p className="text-sm text-muted-foreground/50 italic text-center py-8">No currencies configured</p>
            ) : (
              currencyList.map((currency) => (
                <div key={currency.id} className="flex items-center justify-between p-4 bg-secondary/50 border border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center text-xl font-bold">
                      {currency.symbol}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">{currency.name}</span>
                        {currency.isBase && (
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[9px] font-bold uppercase">BASE</span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">{currency.code}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!currency.isBase && (
                      <button
                        onClick={() => currency.id && setBaseCurrency(currency.id)}
                        className="p-2 text-muted-foreground hover:text-primary transition-colors"
                        title="Set as Base"
                      >
                        <Settings size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => openEditCurrency(currency)}
                      className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => currency.id && removeCurrency(currency.id)}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-card border border-border">
          <div className="p-6 border-b border-border flex items-center gap-3">
            <RefreshCw size={18} className="text-primary" />
            <h3 className="text-lg font-serif text-foreground">Exchange Rates</h3>
          </div>
          <div className="p-6 space-y-4">
            {ratesList.length === 0 ? (
              <p className="text-sm text-muted-foreground/50 italic text-center py-8">No exchange rates configured</p>
            ) : (
              ratesList.map((rate) => {
                const fromCurr = currencyList.find(c => c.id === rate.fromCurrencyId);
                const toCurr = currencyList.find(c => c.id === rate.toCurrencyId);
                const stale = isRateStale(rate.lastFetchedAt);
                return (
                  <div key={rate.id} className="flex items-center justify-between p-4 bg-secondary/50 border border-border">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-sm font-bold text-foreground">{fromCurr?.code || 'N/A'}</span>
                        <span className="text-muted-foreground">→</span>
                        <span className="text-sm font-bold text-foreground">{toCurr?.code || 'N/A'}</span>
                        <span className="text-primary font-mono">= {Number(rate.rate).toFixed(4)}</span>
                        {rate.isManualOverride && (
                          <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 text-[9px] font-bold uppercase">Manual</span>
                        )}
                        {stale && (
                          <span className="px-2 py-0.5 bg-destructive/10 text-destructive text-[9px] font-bold uppercase">Stale</span>
                        )}
                      </div>
                      {rate.lastFetchedAt && (
                        <span className="text-[9px] text-muted-foreground">
                          Last fetched {new Date(rate.lastFetchedAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => rate.id && openEditRate({ id: rate.id, rate: Number(rate.rate) })}
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => rate.id && removeExchangeRate(rate.id)}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={currencyModalOpen} onClose={() => setCurrencyModalOpen(false)} title={editingCurrency ? 'Edit Currency' : 'Add Currency'} size="md">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Currency Code</label>
              <input
                type="text"
                value={currencyForm.code}
                onChange={(e) => setCurrencyForm({ ...currencyForm, code: e.target.value.toUpperCase() })}
                placeholder="USD"
                className="w-full h-10 border-b border-input bg-transparent px-0 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Symbol</label>
              <input
                type="text"
                value={currencyForm.symbol}
                onChange={(e) => setCurrencyForm({ ...currencyForm, symbol: e.target.value })}
                placeholder="$"
                className="w-full h-10 border-b border-input bg-transparent px-0 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Currency Name</label>
            <input
              type="text"
              value={currencyForm.name}
              onChange={(e) => setCurrencyForm({ ...currencyForm, name: e.target.value })}
              placeholder="US Dollar"
              className="w-full h-10 border-b border-input bg-transparent px-0 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Decimal Places</label>
              <input
                type="number"
                min="0"
                max="4"
                value={currencyForm.decimalPlaces}
                onChange={(e) => setCurrencyForm({ ...currencyForm, decimalPlaces: parseInt(e.target.value) })}
                className="w-full h-10 border-b border-input bg-transparent px-0 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Position</label>
              <select
                value={currencyForm.position}
                onChange={(e) => setCurrencyForm({ ...currencyForm, position: e.target.value as 'prefix' | 'suffix' })}
                className="w-full h-10 border-b border-input bg-transparent px-0 text-sm focus:border-primary focus:outline-none"
              >
                <option value="prefix">Prefix ($100)</option>
                <option value="suffix">Suffix (100$)</option>
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={currencyForm.isBase}
              onChange={(e) => setCurrencyForm({ ...currencyForm, isBase: e.target.checked })}
              className="w-4 h-4 accent-primary"
            />
            <span className="text-sm font-bold text-foreground">Set as Base Currency</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={currencyForm.isActive}
              onChange={(e) => setCurrencyForm({ ...currencyForm, isActive: e.target.checked })}
              className="w-4 h-4 accent-primary"
            />
            <span className="text-sm font-bold text-foreground">Active</span>
          </label>
          {currencyModalError && (
            <div className="flex items-start gap-2 p-3 border border-destructive/30 bg-destructive/5 text-destructive text-xs">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{currencyModalError}</span>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => {
                setCurrencyModalError(null);
                setCurrencyModalOpen(false);
              }}
              className="px-6 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground border border-border hover:border-foreground transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveCurrency}
              disabled={!currencyForm.code || !currencyForm.name || !currencyForm.symbol}
              className="px-6 py-2.5 text-xs font-bold uppercase tracking-[0.2em] bg-foreground text-primary-foreground hover:bg-primary transition-all disabled:opacity-50"
            >
              {editingCurrency ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={rateModalOpen} onClose={() => setRateModalOpen(false)} title={editingRate ? 'Edit Exchange Rate' : 'Add Exchange Rate'} size="md">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">From Currency</label>
              <select
                value={rateForm.fromCurrencyId}
                onChange={(e) => setRateForm({ ...rateForm, fromCurrencyId: e.target.value })}
                className="w-full h-10 border-b border-input bg-transparent px-0 text-sm focus:border-primary focus:outline-none"
              >
                <option value="">Select Currency</option>
                {currencyList.map((c) => (
                  <option key={c.id || c.code} value={c.id || ''}>{c.code} - {c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">To Currency</label>
              <select
                value={rateForm.toCurrencyId}
                onChange={(e) => setRateForm({ ...rateForm, toCurrencyId: e.target.value })}
                className="w-full h-10 border-b border-input bg-transparent px-0 text-sm focus:border-primary focus:outline-none"
              >
                <option value="">Select Currency</option>
                {currencyList.filter(c => c.id !== rateForm.fromCurrencyId).map((c) => (
                  <option key={c.id || c.code} value={c.id || ''}>{c.code} - {c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Exchange Rate</label>
            <input
              type="number"
              step="0.0001"
              value={rateForm.rate}
              onChange={(e) => setRateForm({ ...rateForm, rate: e.target.value })}
              placeholder="1.0000"
              className="w-full h-10 border-b border-input bg-transparent px-0 text-sm font-mono focus:border-primary focus:outline-none"
            />
            <p className="text-[10px] text-muted-foreground">How many units of To Currency equal 1 unit of From Currency</p>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Effective Date</label>
            <input
              type="date"
              value={rateForm.effectiveDate}
              onChange={(e) => setRateForm({ ...rateForm, effectiveDate: e.target.value })}
              className="w-full h-10 border-b border-input bg-transparent px-0 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          {rateModalError && (
            <div className="flex items-start gap-2 p-3 border border-destructive/30 bg-destructive/5 text-destructive text-xs">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{rateModalError}</span>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => {
                setRateModalError(null);
                setRateModalOpen(false);
              }}
              className="px-6 py-2.5 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground border border-border hover:border-foreground transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveRate}
              disabled={!rateForm.fromCurrencyId || !rateForm.toCurrencyId || !rateForm.rate}
              className="px-6 py-2.5 text-xs font-bold uppercase tracking-[0.2em] bg-foreground text-primary-foreground hover:bg-primary transition-all disabled:opacity-50"
            >
              {editingRate ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};