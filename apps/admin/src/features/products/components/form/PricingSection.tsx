import React from 'react';
import { useCurrencies } from '../../../currencies/useCurrencies';

interface PricingSectionProps {
  price: string | number;
  compareAtPrice: string | number | null;
  currency: string;
  onChange: (field: string, value: unknown) => void;
  onCurrencyChange?: (code: string) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  price,
  compareAtPrice,
  currency,
  onChange,
  onCurrencyChange,
}) => {
  const handleCurrencyChange = (code: string) => {
    if (onCurrencyChange) {
      onCurrencyChange(code);
    } else {
      onChange('currency', code);
      onChange('currencyCode', code);
      onChange('isUsdPrice', code === 'USD');
    }
  };
  const { currencies } = useCurrencies();
  const activeCurrencies = currencies.filter((c: any) => c.isActive !== false);
  
  const getSymbol = (code: string) => {
    const curr = activeCurrencies.find((c: any) => c.code === code);
    return curr?.symbol || '$';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Retail Price</label>
          <select 
            value={currency || 'USD'}
            onChange={(e) => handleCurrencyChange(e.target.value)}
            className="mb-1 h-6 bg-transparent border-b border-muted-foreground/30 text-[10px] font-bold uppercase tracking-widest text-primary focus:border-primary focus:outline-none cursor-pointer"
          >
            {activeCurrencies.length > 0 ? (
              activeCurrencies.map((c: any) => (
                <option key={c.id || c.code} value={c.code}>
                  {c.code} ({c.symbol})
                </option>
              ))
            ) : (
              <>
                <option value="USD">USD ($)</option>
                <option value="MMK">MMK (Ks)</option>
                <option value="THB">THB (฿)</option>
              </>
            )}
          </select>
        </div>
        <input 
          type="text" 
          required 
          value={price} 
          onChange={(e) => onChange('price', e.target.value)} 
          className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-lg font-mono focus:border-primary focus:outline-none transition-colors duration-300 rounded-none" 
          placeholder="0.00" 
        />
        <div className="text-[9px] text-muted-foreground/50">
          Price in {getSymbol(currency || 'USD')}
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Compare at Price</label>
        </div>
        <input 
          type="text" 
          value={compareAtPrice || ''} 
          onChange={(e) => onChange('compareAtPrice', e.target.value)} 
          className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-lg font-mono focus:border-primary focus:outline-none transition-colors duration-300 rounded-none text-muted-foreground" 
          placeholder="0.00" 
        />
        <div className="text-[9px] text-muted-foreground/50">
          Original price for comparison (optional)
        </div>
      </div>
    </div>
  );
};