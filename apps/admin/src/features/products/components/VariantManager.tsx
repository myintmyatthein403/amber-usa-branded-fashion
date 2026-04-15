import React from 'react';
import { Plus, Edit2, Trash2, BarChart3, Search, AlertCircle, ChevronLeft, Save, Image as ImageIcon, X, Link as LinkIcon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Variant } from '../schema';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface VariantManagerProps {
  newVariant: any;
  setNewVariant: (variant: any) => void;
  editingVariant: Variant | null;
  setEditingVariant: (variant: Variant | null) => void;
  addVariant: () => void;
  currentVariants: Variant[];
  handleEditVariant: (variant: Variant) => void;
  handleDeleteVariant: (id: string) => void;
  warehouses: any[];
  setStep: (step: number) => void;
  setModalOpen: (open: boolean) => void;
  onOpenMedia: () => void;
}

export const VariantManager: React.FC<VariantManagerProps> = ({
  newVariant,
  setNewVariant,
  editingVariant,
  setEditingVariant,
  addVariant,
  currentVariants,
  handleEditVariant,
  handleDeleteVariant,
  warehouses,
  setStep,
  setModalOpen,
  onOpenMedia
}) => {
  const [urlInput, setUrlInput] = React.useState('');

  const removeImage = (index: number) => {
    setNewVariant({
      ...newVariant,
      images: newVariant.images.filter((_: any, i: number) => i !== index)
    });
  };

  const addImageUrl = () => {
    if (urlInput.trim()) {
      setNewVariant({
        ...newVariant,
        images: [...(newVariant.images || []), urlInput.trim()]
      });
      setUrlInput('');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="bg-secondary p-8 border border-primary/10">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-primary/10 text-primary">{editingVariant ? <Edit2 size={18} /> : <Plus size={18} />}</div>
          <h4 className="text-[11px] font-bold uppercase tracking-[0.3em] text-foreground">{editingVariant ? 'Edit SKU Variant' : 'Add SKU Variant'}</h4>
        </div>

        <div className="space-y-6 mb-8">
          <div className="flex items-center justify-between">
            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground flex items-center gap-2">
              <ImageIcon size={14} /> Variant Imagery
            </label>
            <div className="flex items-center gap-2">
              <div className="relative">
                <LinkIcon size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Paste Image URL..." 
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImageUrl())}
                  className="h-8 pl-8 pr-3 bg-background border border-border text-[10px] w-48 focus:border-primary focus:outline-none transition-all"
                />
              </div>
              <button 
                type="button"
                onClick={addImageUrl}
                className="h-8 px-3 bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:bg-primary transition-colors"
              >
                Link
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {(newVariant.images || []).map((url: string, index: number) => (
              <div key={index} className="group relative aspect-square bg-background border border-border overflow-hidden rounded-sm">
                <img src={url} alt={`Variant ${index}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <button 
                  type="button" 
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 p-1 bg-background/80 text-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground rounded-full"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
            <button 
              type="button"
              onClick={onOpenMedia}
              className="aspect-square border border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:border-primary hover:text-primary transition-all duration-300 group rounded-sm"
            >
              <Plus size={16} className="group-hover:scale-110 transition-transform" />
              <span className="text-[8px] font-bold uppercase tracking-widest">Add SKU Image</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="space-y-2">
             <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Unique SKU</label>
             <input type="text" placeholder="AMB-SKU-001" value={newVariant.sku} onChange={(e) => setNewVariant({...newVariant, sku: e.target.value})} className="w-full h-10 border-b border-input bg-transparent px-0 text-sm font-mono focus:border-primary focus:outline-none transition-colors duration-300" />
          </div>
          <div className="space-y-2">
             <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Barcode (UPC/EAN)</label>
             <input type="text" placeholder="88012345..." value={newVariant.barcode} onChange={(e) => setNewVariant({...newVariant, barcode: e.target.value})} className="w-full h-10 border-b border-input bg-transparent px-0 text-sm font-mono focus:border-primary focus:outline-none transition-colors duration-300" />
          </div>
          <div className="space-y-2">
             <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Size</label>
             <input type="text" placeholder="e.g. XL" value={newVariant.size} onChange={(e) => setNewVariant({...newVariant, size: e.target.value})} className="w-full h-10 border-b border-input bg-transparent px-0 text-sm focus:border-primary focus:outline-none transition-colors duration-300" />
          </div>
          <div className="space-y-2">
             <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Color</label>
             <input type="text" placeholder="e.g. Ivory" value={newVariant.color} onChange={(e) => setNewVariant({...newVariant, color: e.target.value})} className="w-full h-10 border-b border-input bg-transparent px-0 text-sm focus:border-primary focus:outline-none transition-colors duration-300" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="space-y-2">
             <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Stock Level</label>
             <input type="number" value={newVariant.stock} onChange={(e) => setNewVariant({...newVariant, stock: e.target.value})} className="w-full h-10 border-b border-input bg-transparent px-0 text-sm focus:border-primary focus:outline-none transition-colors duration-300" />
          </div>
          {!editingVariant && (
            <div className="space-y-2">
               <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Warehouse Target</label>
               <select 
                 value={newVariant.warehouseId} 
                 onChange={(e) => setNewVariant({...newVariant, warehouseId: e.target.value})}
                 className="w-full h-10 border-b border-input bg-transparent px-0 text-[10px] font-bold uppercase tracking-widest focus:border-primary focus:outline-none transition-colors duration-300 rounded-none cursor-pointer"
               >
                  <option value="">Select Warehouse</option>
                  {warehouses.map((w: any) => (
                    <option key={w.id} value={w.id}>{w.name} ({w.location})</option>
                  ))}
               </select>
            </div>
          )}
          <div className="space-y-2">
             <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Low Stock Alert</label>
             <input type="number" value={newVariant.lowStockThreshold} onChange={(e) => setNewVariant({...newVariant, lowStockThreshold: e.target.value})} className="w-full h-10 border-b border-input bg-transparent px-0 text-sm focus:border-primary focus:outline-none transition-colors duration-300" />
          </div>
          <div className="space-y-2">
             <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Weight (kg)</label>
             <input type="number" step="0.01" value={newVariant.weight} onChange={(e) => setNewVariant({...newVariant, weight: e.target.value})} className="w-full h-10 border-b border-input bg-transparent px-0 text-sm focus:border-primary focus:outline-none transition-colors duration-300" />
          </div>
        </div>
        <div className="flex justify-end gap-4">
          {editingVariant && (
            <button type="button" onClick={() => {
              setEditingVariant(null);
              setNewVariant({ sku: '', barcode: '', size: '', color: '', stock: '0', lowStockThreshold: '5', price: '', compareAtPrice: '', weight: '0', images: [], warehouseId: '' });
            }} className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground px-4">Cancel Edit</button>
          )}
          <button type="button" onClick={addVariant} disabled={!newVariant.sku || !newVariant.size || (!editingVariant && parseInt(newVariant.stock) > 0 && !newVariant.warehouseId)} className="bg-foreground text-primary-foreground px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all duration-300 shadow-lg shadow-black/5">
            {editingVariant ? 'Update Variant' : 'Confirm SKU Variant'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground border-b border-border pb-4 flex items-center gap-2"><BarChart3 size={14} /> ACTIVE INVENTORY STATUS</h4>
        <div className="space-y-0 divide-y divide-border">
          {currentVariants.length === 0 ? (
            <div className="text-center py-16 text-xs text-muted-foreground/40 font-medium italic">No active variants detected.</div>
          ) : (
            currentVariants.map((v) => (
              <div key={v.id} className="group flex items-center justify-between py-5 px-2 hover:bg-muted/10 transition-colors duration-300">
                <div className="flex items-center gap-8">
                  <div className="w-12 h-12 bg-muted flex items-center justify-center font-bold text-[10px] text-muted-foreground border border-border overflow-hidden">
                    {v.images && v.images.length > 0 ? (
                      <img src={v.images[0]} alt={v.sku} className="w-full h-full object-cover" />
                    ) : (
                      v.size
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground flex items-center gap-3">{v.color} {v.images && v.images.length > 0 && <span className="text-[10px] font-normal text-muted-foreground">({v.size})</span>} <span className="w-1.5 h-1.5 rounded-full bg-primary"></span> <span className="font-mono text-[10px] text-muted-foreground">{v.sku}</span></div>
                    <div className="flex items-center gap-4 mt-1">
                       <div className={cn("text-[10px] font-bold uppercase tracking-widest", v.stock <= v.lowStockThreshold ? "text-destructive" : "text-primary")}>{v.stock} UNITS IN CLUSTER</div>
                       {v.barcode && <div className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono"><Search size={10}/> {v.barcode}</div>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button type="button" onClick={() => handleEditVariant(v)} className="p-2.5 text-muted-foreground hover:text-foreground transition-colors duration-300"><Edit2 size={16} /></button>
                  <button type="button" onClick={() => v.id && handleDeleteVariant(v.id)} className="p-2.5 text-muted-foreground hover:text-destructive transition-colors duration-300"><Trash2 size={16} /></button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="flex justify-between items-center pt-10 border-t border-border">
        <button onClick={() => setStep(1)} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors duration-300"><ChevronLeft size={14} /> Core Definition</button>
        <button onClick={() => setModalOpen(false)} className="bg-primary text-primary-foreground px-10 py-4 text-xs font-bold uppercase tracking-[0.3em] hover:opacity-90 transition-all duration-300 shadow-xl shadow-primary/20"><Save size={16} /> Sync to Catalog</button>
      </div>
    </div>
  );
};
