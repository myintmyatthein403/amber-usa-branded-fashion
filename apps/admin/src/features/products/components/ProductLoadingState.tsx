import React from 'react';
import { Loader2 } from 'lucide-react';

export const ProductLoadingState: React.FC = () => {
  return (
    <div className="py-40 flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-primary" size={40} />
      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Accessing Inventory...</p>
    </div>
  );
};