import React from 'react';
import { Layers, Trash2, Edit2, Package } from 'lucide-react';
import { Variant } from '../schema';

interface VariantTableProps {
  variants: Variant[];
  onEdit: (variant: Variant) => void;
  onDelete: (id: string) => void;
}

export const VariantTable: React.FC<VariantTableProps> = ({ variants, onEdit, onDelete }) => {
  if (variants.length === 0) {
    return (
      <div className="py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic">No stock variants detected.</div>
    );
  }

  return (
    <div className="bg-white border border-[#E5E5E5] overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[#E5E5E5] bg-[#F9F9F9]">
            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-[#666]">Product</th>
            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-[#666]">Configuration</th>
            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-[#666]">Stock Level</th>
            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-[#666] text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E5E5E5]">
          {variants.map((variant) => (
            <tr key={variant.id} className="group hover:bg-[#F9F9F9] transition-colors duration-300">
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#F0F0F0] text-[#0F0F0F] group-hover:bg-[#C9A962] group-hover:text-white transition-colors">
                    <Package size={16} />
                  </div>
                  <span className="text-sm font-bold text-[#0F0F0F]">{variant.product?.name || 'Unlinked Product'}</span>
                </div>
              </td>
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-[#F0F0F0] text-[10px] font-bold uppercase tracking-widest">{variant.size}</span>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: variant.color.toLowerCase() }}></span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#666]">{variant.color}</span>
                </div>
              </td>
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${variant.stock > 10 ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                  <span className="text-sm font-mono font-bold text-[#0F0F0F]">{variant.stock} <span className="text-[10px] text-[#666] font-sans uppercase tracking-widest ml-1">Units</span></span>
                </div>
              </td>
              <td className="p-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => onEdit(variant)} className="p-2 text-[#666] hover:text-[#0F0F0F] transition-colors"><Edit2 size={16} /></button>
                  <button onClick={() => onDelete(variant.id)} className="p-2 text-[#666] hover:text-rose-600 transition-colors"><Trash2 size={16} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
