import { useState, useEffect, useCallback } from 'react';
import { useFetch } from '../../hooks/useCrud';
import { API_ROUTES } from '../../config/constants';
import { apiService } from '../../services/api.service';
import { Currency, ExchangeRate } from './schema';

function extractErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    const msg = (error as { message: unknown }).message;
    if (typeof msg === 'string') return msg;
    if (Array.isArray(msg)) return msg.join(', ');
  }
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred';
}

export const useCurrencies = () => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data: fetchedCurrencies, loading: currenciesLoading } = useFetch<Currency>(API_ROUTES.CURRENCIES.BASE);
  const { data: fetchedRates, loading: ratesLoading } = useFetch<ExchangeRate>(API_ROUTES.EXCHANGE_RATES.BASE);

  useEffect(() => {
    if (fetchedCurrencies) {
      setCurrencies(fetchedCurrencies);
    }
    if (fetchedRates) {
      setExchangeRates(fetchedRates);
    }
    setLoading(currenciesLoading || ratesLoading);
  }, [fetchedCurrencies, fetchedRates, currenciesLoading, ratesLoading]);

  const clearError = useCallback(() => setError(null), []);

  const addCurrency = useCallback(async (data: Omit<Currency, 'id'>) => {
    try {
      setError(null);
      const result = await apiService(API_ROUTES.CURRENCIES.BASE, {
        method: 'POST',
        body: data
      });
      const newCurrency = (result as { data?: Currency })?.data;
      if (newCurrency) {
        setCurrencies(prev => [...prev, newCurrency]);
      }
      return newCurrency;
    } catch (err) {
      const message = extractErrorMessage(err);
      setError(message);
      throw err;
    }
  }, []);

  const editCurrency = useCallback(async (id: string, data: Partial<Currency>) => {
    try {
      setError(null);
      const result = await apiService(API_ROUTES.CURRENCIES.BY_ID(id), {
        method: 'PATCH',
        body: data
      });
      const updated = (result as { data?: Currency })?.data;
      if (updated) {
        setCurrencies(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c));
      }
      return updated;
    } catch (err) {
      const message = extractErrorMessage(err);
      setError(message);
      throw err;
    }
  }, []);

  const removeCurrency = useCallback(async (id: string) => {
    try {
      setError(null);
      await apiService(API_ROUTES.CURRENCIES.BY_ID(id), { method: 'DELETE' });
      setCurrencies(prev => prev.filter(c => c.id !== id));
      return true;
    } catch (err) {
      const message = extractErrorMessage(err);
      setError(message);
      return false;
    }
  }, []);

  const setBaseCurrency = useCallback(async (id: string) => {
    try {
      setError(null);
      const response = await apiService(API_ROUTES.CURRENCIES.SET_BASE, {
        method: 'POST',
        body: { currencyId: id }
      });
      setCurrencies(prev => prev.map(c => ({
        ...c,
        isBase: c.id === id
      })));
      return response;
    } catch (err) {
      const message = extractErrorMessage(err);
      setError(message);
      throw err;
    }
  }, []);

  const addExchangeRate = useCallback(async (data: Omit<ExchangeRate, 'id'>) => {
    try {
      setError(null);
      const result = await apiService(API_ROUTES.EXCHANGE_RATES.BASE, {
        method: 'POST',
        body: data
      });
      const newRate = (result as { data?: ExchangeRate })?.data;
      if (newRate) {
        setExchangeRates(prev => [...prev, newRate]);
      }
      return newRate;
    } catch (err) {
      const message = extractErrorMessage(err);
      setError(message);
      throw err;
    }
  }, []);

  const updateExchangeRate = useCallback(async (id: string, rate: number) => {
    try {
      setError(null);
      const result = await apiService(API_ROUTES.EXCHANGE_RATES.BY_ID(id), {
        method: 'PATCH',
        body: { rate }
      });
      const updated = (result as { data?: ExchangeRate })?.data;
      if (updated) {
        setExchangeRates(prev => prev.map(r => r.id === id ? { ...r, ...updated } : r));
      }
      return updated;
    } catch (err) {
      const message = extractErrorMessage(err);
      setError(message);
      throw err;
    }
  }, []);

  const removeExchangeRate = useCallback(async (id: string) => {
    try {
      setError(null);
      await apiService(API_ROUTES.EXCHANGE_RATES.BY_ID(id), { method: 'DELETE' });
      setExchangeRates(prev => prev.filter(r => r.id !== id));
      return true;
    } catch (err) {
      const message = extractErrorMessage(err);
      setError(message);
      return false;
    }
  }, []);

  const getExchangeRate = useCallback((fromId: string, toId: string): number | null => {
    const direct = exchangeRates.find(r => 
      r.fromCurrencyId === fromId && r.toCurrencyId === toId
    );
    if (direct) return direct.rate;
    
    const inverse = exchangeRates.find(r => 
      r.fromCurrencyId === toId && r.toCurrencyId === fromId
    );
    if (inverse && inverse.rate !== 0) return 1 / inverse.rate;
    
    const baseCurrency = currencies.find(c => c.isBase);
    if (!baseCurrency) return null;

    if (fromId === baseCurrency.id) {
      const toRate = exchangeRates.find(r => 
        r.fromCurrencyId === baseCurrency.id && r.toCurrencyId === toId
      );
      return toRate?.rate || null;
    }
    
    if (toId === baseCurrency.id) {
      const fromRate = exchangeRates.find(r => 
        r.fromCurrencyId === baseCurrency.id && r.toCurrencyId === fromId
      );
      return fromRate ? 1 / fromRate.rate : null;
    }

    return null;
  }, [exchangeRates, currencies]);

  const convertAmount = useCallback((amount: number, fromCurrencyId: string, toCurrencyId: string): number | null => {
    if (fromCurrencyId === toCurrencyId) return amount;
    const rate = getExchangeRate(fromCurrencyId, toCurrencyId);
    return rate !== null ? amount * rate : null;
  }, [getExchangeRate]);

  const refreshRates = useCallback(async () => {
    setError(null);
    const result = await apiService(`${API_ROUTES.EXCHANGE_RATES.BASE}/refresh`, {
      method: 'POST',
    });
    const ratesResponse = await apiService<unknown, ExchangeRate[] | { data?: ExchangeRate[] }>(
      API_ROUTES.EXCHANGE_RATES.BASE,
    );
    const rates = Array.isArray(ratesResponse)
      ? ratesResponse
      : (ratesResponse as { data?: ExchangeRate[] })?.data;
    if (Array.isArray(rates)) setExchangeRates(rates);
    return (result as { data?: { rate: number; source: string } })?.data ?? result;
  }, []);

  return {
    currencies,
    exchangeRates,
    loading,
    error,
    setError,
    clearError,
    addCurrency,
    editCurrency,
    removeCurrency,
    setBaseCurrency,
    addExchangeRate,
    updateExchangeRate,
    removeExchangeRate,
    getExchangeRate,
    convertAmount,
    refreshRates,
  };
};
