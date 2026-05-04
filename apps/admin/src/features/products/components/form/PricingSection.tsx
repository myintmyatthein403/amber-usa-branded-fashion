import React from 'react';

interface PricingSectionProps {
  price: string | number;
  compareAtPrice: string | number | null;
  isUsdPrice: boolean;
  onChange: (field: string, value: unknown) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  price,
  compareAtPrice,
  isUsdPrice,
  onChange
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Retail Price ({isUsdPrice ? 'USD' : 'MMK'})</label>
          <label className="flex items-center gap-2 cursor-pointer mb-1 group">
            <input 
              type="checkbox" 
              checked={isUsdPrice} 
              onChange={(e) => onChange('isUsdPrice', e.target.checked)} 
              className="w-3.5 h-3.5 accent-primary" 
            />
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">USD Currency</span>
          </label>
        </div>
        <input 
          type="text" 
          required 
          value={price} 
          onChange={(e) => onChange('price', e.target.value)} 
          className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-lg font-mono focus:border-primary focus:outline-none transition-colors duration-300 rounded-none" 
          placeholder="0.00" 
        />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Compare at Price ({isUsdPrice ? 'USD' : 'MMK'})</label>
        </div>
        <input 
          type="text" 
          value={compareAtPrice || ''} 
          onChange={(e) => onChange('compareAtPrice', e.target.value)} 
          className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-lg font-mono focus:border-primary focus:outline-none transition-colors duration-300 rounded-none text-muted-foreground" 
          placeholder="0.00" 
        />
      </div>
    </div>
  );
};
