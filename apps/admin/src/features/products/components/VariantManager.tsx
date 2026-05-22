import React from 'react';
import { Plus, Edit2, Trash2, BarChart3, Search, AlertCircle, ChevronLeft, Save, Image as ImageIcon, X, Link as LinkIcon, Grid3X3, Layers } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';
import type { LogisticVariant as Variant, Warehouse } from '@amber/shared';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MultiWarehouseStock {
  warehouseId: string;
  quantity: number;
}

interface AttributeOption {
  id: string;
  name: string;
  slug: string;
  type: string;
  values?: { id: string; name: string; value: string; }[];
}

interface VariantManagerProps {
  newVariant: Partial<Variant>;
  setNewVariant: (variant: Partial<Variant>) => void;
  editingVariant: Variant | null;
  setEditingVariant: (variant: Variant | null) => void;
  addVariant: (overrides?: Record<string, unknown>) => void;
  addBulkVariants?: (variants: Partial<Variant>[]) => void;
  currentVariants: Variant[];
  handleEditVariant: (variant: Variant) => void;
  handleDeleteVariant: (id: string) => void;
  warehouses: any;
  setStep: (step: number) => void;
  onSave: () => void;
  submitting?: boolean;
  onOpenMedia: () => void;
  productSlug?: string;
  attributes?: AttributeOption[];
  submitError?: string | null;
}

const sizeAttributePattern = /^size$/i;
const colorAttributePattern = /^colou?r$/i;

function deriveSizeColorFromSelections(
  selections: Record<string, string> | undefined,
  attributes: AttributeOption[],
): { size: string; color: string } {
  if (!selections || attributes.length === 0) {
    return { size: '', color: '' };
  }
  const sizeAttr = attributes.find((a) => sizeAttributePattern.test(a.name));
  const colorAttr = attributes.find((a) => colorAttributePattern.test(a.name));

  const sizeStr =
    sizeAttr?.values?.find((v) => v.id === selections[sizeAttr.id])?.value || '';
  const colorStr =
    colorAttr?.values?.find((v) => v.id === selections[colorAttr.id])?.value ||
    '';

  if (sizeStr && colorStr) return { size: sizeStr, color: colorStr };

  const otherValues = attributes
    .filter((a) => a.id !== sizeAttr?.id && a.id !== colorAttr?.id)
    .map((a) => a.values?.find((v) => v.id === selections[a.id])?.value)
    .filter(Boolean) as string[];

  return {
    size: sizeStr || otherValues[0] || 'Standard',
    color: colorStr || otherValues[1] || otherValues[0] || 'Standard',
  };
}

export const VariantManager: React.FC<VariantManagerProps> = ({
  newVariant,
  setNewVariant,
  editingVariant,
  setEditingVariant,
  addVariant,
  addBulkVariants,
  currentVariants,
  handleEditVariant,
  handleDeleteVariant,
  warehouses,
  setStep,
  onSave,
  submitting,
  onOpenMedia,
  productSlug,
  attributes = [],
  submitError = null,
}) => {
  const [urlInput, setUrlInput] = React.useState('');
  const [bulkMode, setBulkMode] = React.useState(false);
  const [bulkSizes, setBulkSizes] = React.useState('');
  const [bulkColors, setBulkColors] = React.useState('');
  const [bulkStock, setBulkStock] = React.useState('10');
  const [bulkWarehouseId, setBulkWarehouseId] = React.useState('');
  const [multiWarehouseStock, setMultiWarehouseStock] = React.useState<MultiWarehouseStock[]>([]);
  const [selectedAttributes, setSelectedAttributes] = React.useState<Record<string, string>>({});
  
  const warehouseList = warehouses?.data || warehouses || [];

  const generateBulkVariants = () => {
    if (attributes.length > 0) {
      if (!productSlug) return;
      const attributeOptions = attributes.map(attr => {
        const values = (newVariant as any).attributeSelections?.[attr.id]?.split(',') || [];
        return { attribute: attr, values: values.filter(Boolean) };
      }).filter(a => a.values.length > 0);
      
      if (attributeOptions.length === 0) return;
      
      const generateCombinations = (attrs: typeof attributeOptions): any[] => {
        if (attrs.length === 0) return [{}];
        const [first, ...rest] = attrs;
        const combos = generateCombinations(rest);
        return first.values.flatMap((val: any) => 
          combos.map(combo => ({ ...combo, [first.attribute.name]: val }))
        );
      };
      
      const combinations = generateCombinations(attributeOptions);
      const variants: any[] = combinations.map(combo => {
        const attrParts = Object.entries(combo).map(([, v]) => String(v).toUpperCase()).join('-');
        const attrSelections: Record<string, string> = {};
        Object.entries(combo).forEach(([k, v]) => {
          const attr = attributes.find(a => a.name === k);
          if (attr && attr.values) {
            const val = attr.values.find((va: any) => va.value === v || va.name === v);
            if (val) attrSelections[attr.id] = val.id;
          }
        });
        const sizeKey = Object.keys(combo).find((k) => sizeAttributePattern.test(k));
        const colorKey = Object.keys(combo).find((k) => colorAttributePattern.test(k));
        const sizeVal = sizeKey ? String(combo[sizeKey]) : '';
        const colorVal = colorKey ? String(combo[colorKey]) : '';
        const fallbackValues = Object.entries(combo)
          .filter(([k]) => k !== sizeKey && k !== colorKey)
          .map(([, v]) => String(v));
        return {
          id: Math.random().toString(36).substr(2, 9),
          sku: `${productSlug}-${attrParts}`.replace(/\s+/g, '-'),
          size: sizeVal || fallbackValues[0] || 'Standard',
          color: colorVal || fallbackValues[1] || fallbackValues[0] || 'Standard',
          attributeSelections: attrSelections,
          stock: parseInt(bulkStock) || 0,
          lowStockThreshold: 5,
          weight: 0,
          images: [],
          warehouseId: bulkWarehouseId || undefined,
        };
      });
      
      if (addBulkVariants) {
        addBulkVariants(variants);
      }
      setBulkMode(false);
      return;
    }
    
    if (!bulkSizes.trim() || !bulkColors.trim() || !productSlug) return;
    
    const sizes = bulkSizes.split(',').map(s => s.trim()).filter(Boolean);
    const colors = bulkColors.split(',').map(c => c.trim()).filter(Boolean);
    
    const variants: any[] = [];
    
    for (const size of sizes) {
      for (const color of colors) {
        const variant: any = {
          id: Math.random().toString(36).substr(2, 9),
          sku: `${productSlug}-${size.toUpperCase()}-${color.toUpperCase()}`.replace(/\s+/g, '-'),
          size,
          color,
          stock: parseInt(bulkStock) || 0,
          lowStockThreshold: 5,
          weight: 0,
          images: [],
          warehouseId: bulkWarehouseId || undefined,
        };
        variants.push(variant);
      }
    }
    
    if (addBulkVariants) {
      addBulkVariants(variants);
    } else {
      variants.forEach((v: any) => {
        setNewVariant(v);
        addVariant();
      });
    }
    
    setBulkSizes('');
    setBulkColors('');
    setBulkMode(false);
  };

  const addMultiWarehouseStock = () => {
    if (!bulkWarehouseId) return;
    setMultiWarehouseStock(prev => [
      ...prev,
      { warehouseId: bulkWarehouseId, quantity: parseInt(bulkStock) || 0 }
    ]);
    setBulkWarehouseId('');
  };

  const removeMultiWarehouseStock = (index: number) => {
    setMultiWarehouseStock(prev => prev.filter((_, i) => i !== index));
  };

  const totalStock = multiWarehouseStock.reduce((sum, w) => sum + w.quantity, 0) || newVariant.stock || 0;

  const removeImage = (index: number) => {
    setNewVariant({
      ...newVariant,
      images: (newVariant.images || []).filter((_, i) => i !== index)
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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary">{editingVariant ? <Edit2 size={18} /> : <Plus size={18} />}</div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.3em] text-foreground">{editingVariant ? 'Edit SKU Variant' : 'Add SKU Variant'}</h4>
          </div>
          {!editingVariant && (
            <button
              type="button"
              onClick={() => setBulkMode(!bulkMode)}
              className={`flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${bulkMode ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:border-primary'}`}
            >
              <Grid3X3 size={14} />
              {bulkMode ? 'Exit Bulk Mode' : 'Bulk Generate'}
            </button>
          )}
        </div>

        {bulkMode && (
          <div className="mb-8 p-6 bg-background border border-dashed border-primary/30">
            <div className="flex items-center gap-2 mb-4 text-primary">
              <Layers size={16} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Matrix Generator</span>
            </div>
            {attributes.length > 0 ? (
              <div className={`grid gap-4 mb-4 ${attributes.length <= 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                {attributes.map((attr) => (
                  <div key={attr.id} className="space-y-2">
                    <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">{attr.name} (comma separated)</label>
                    <input 
                      type="text" 
                      placeholder={`e.g. ${attr.values?.map(v => v.value).join(', ')}`}
                      value={(newVariant as any).attributeSelections?.[attr.id] || ''}
                      onChange={(e) => setNewVariant({
                        ...newVariant,
                        attributeSelections: { ...(newVariant as any)?.attributeSelections, [attr.id]: e.target.value }
                      } as any)}
                      className="w-full h-10 border-b border-input bg-transparent px-0 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Sizes (comma separated)</label>
                  <input 
                    type="text" 
                    placeholder="S, M, L, XL" 
                    value={bulkSizes}
                    onChange={(e) => setBulkSizes(e.target.value)}
                    className="w-full h-10 border-b border-input bg-transparent px-0 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Colors (comma separated)</label>
                  <input 
                    type="text" 
                    placeholder="Red, Blue, Ivory" 
                    value={bulkColors}
                    onChange={(e) => setBulkColors(e.target.value)}
                    className="w-full h-10 border-b border-input bg-transparent px-0 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Stock per Variant</label>
                <input 
                  type="number" 
                  value={bulkStock}
                  onChange={(e) => setBulkStock(e.target.value)}
                  className="w-full h-10 border-b border-input bg-transparent px-0 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Warehouse</label>
                <select 
                  value={bulkWarehouseId}
                  onChange={(e) => setBulkWarehouseId(e.target.value)}
                  className="w-full h-10 border-b border-input bg-background px-2 text-[10px] font-bold uppercase tracking-widest text-foreground focus:border-primary rounded-sm cursor-pointer"
                >
                  <option value="">Select Warehouse</option>
                  {warehouseList.map((w: Warehouse) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button 
                  type="button"
                  onClick={generateBulkVariants}
                  disabled={!bulkSizes.trim() || !bulkColors.trim()}
                  className="bg-primary text-primary-foreground px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all"
                >
                  Generate {bulkSizes.trim() && bulkColors.trim() ? `(${bulkSizes.split(',').length * bulkColors.split(',').length} variants)` : ''}
                </button>
              </div>
            </div>
          </div>
        )}

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
            {(newVariant.images || []).map((url, index) => (
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

        {!bulkMode && (
        <>
        <div className={`grid gap-6 mb-6 ${attributes.length > 0 ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
          <div className="space-y-2">
             <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Unique SKU</label>
             <input type="text" placeholder="AMB-SKU-001" value={newVariant.sku || ''} onChange={(e) => setNewVariant({...newVariant, sku: e.target.value})} className="w-full h-10 border-b border-input bg-transparent px-0 text-sm font-mono focus:border-primary focus:outline-none transition-colors duration-300" />
          </div>
          <div className="space-y-2">
             <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Barcode (UPC/EAN)</label>
             <input type="text" placeholder="88012345..." value={newVariant.barcode || ''} onChange={(e) => setNewVariant({...newVariant, barcode: e.target.value})} className="w-full h-10 border-b border-input bg-transparent px-0 text-sm font-mono focus:border-primary focus:outline-none transition-colors duration-300" />
          </div>
          {attributes.length > 0 ? (
            <>
              {attributes.map((attr) => (
                <div key={attr.id} className="space-y-2">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">{attr.name}</label>
                  <select
                    value={(newVariant as any)?.attributeSelections?.[attr.id] || ''}
                    onChange={(e) => setNewVariant({
                      ...newVariant,
                      attributeSelections: { ...(newVariant as any)?.attributeSelections, [attr.id]: e.target.value }
                    } as any)}
className="w-full h-10 border-b border-input bg-background px-2 text-sm text-foreground focus:border-primary focus:outline-none transition-colors duration-300 rounded-sm cursor-pointer"
                  >
                    <option value="">Select {attr.name}</option>
                    {attr.values?.map((val) => (
                      <option key={val.id} value={val.id}>{val.value}</option>
                    ))}
                  </select>
                </div>
              ))}
            </>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Size</label>
                <input type="text" placeholder="e.g. XL" value={newVariant.size || ''} onChange={(e) => setNewVariant({...newVariant, size: e.target.value})} className="w-full h-10 border-b border-input bg-transparent px-0 text-sm focus:border-primary focus:outline-none transition-colors duration-300" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Color</label>
                <input type="text" placeholder="e.g. Ivory" value={newVariant.color || ''} onChange={(e) => setNewVariant({...newVariant, color: e.target.value})} className="w-full h-10 border-b border-input bg-transparent px-0 text-sm focus:border-primary focus:outline-none transition-colors duration-300" />
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground flex items-center gap-2">
              Variant Price <span className="text-[9px] font-normal text-muted-foreground/50">(optional)</span>
            </label>
            <input 
              type="text" 
              placeholder="Inherits base price" 
              value={newVariant.price || ''} 
              onChange={(e) => setNewVariant({...newVariant, price: e.target.value ? parseFloat(e.target.value) : undefined})}
              className="w-full h-10 border-b border-input bg-transparent px-0 text-sm font-mono focus:border-primary focus:outline-none transition-colors duration-300" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground flex items-center gap-2">
              Compare at Price <span className="text-[9px] font-normal text-muted-foreground/50">(optional)</span>
            </label>
            <input 
              type="text" 
              placeholder="Inherits base compare" 
              value={(newVariant as any).compareAtPrice || ''} 
              onChange={(e) => setNewVariant({...newVariant, compareAtPrice: e.target.value ? parseFloat(e.target.value) : undefined} as any)}
              className="w-full h-10 border-b border-input bg-transparent px-0 text-sm font-mono focus:border-primary focus:outline-none transition-colors duration-300" 
            />
          </div>
          <div className="space-y-2">
             <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Weight (kg)</label>
             <input type="number" step="0.01" value={newVariant.weight || 0} onChange={(e) => setNewVariant({...newVariant, weight: parseFloat(e.target.value)})} className="w-full h-10 border-b border-input bg-transparent px-0 text-sm focus:border-primary focus:outline-none transition-colors duration-300" />
          </div>
          <div className="space-y-2">
             <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Low Stock Alert</label>
             <input type="number" value={newVariant.lowStockThreshold || 5} onChange={(e) => setNewVariant({...newVariant, lowStockThreshold: parseInt(e.target.value)})} className="w-full h-10 border-b border-input bg-transparent px-0 text-sm focus:border-primary focus:outline-none transition-colors duration-300" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Primary Warehouse</label>
            <select
              value={(newVariant as { warehouseId?: string }).warehouseId || ''}
              onChange={(e) => setNewVariant({ ...newVariant, warehouseId: e.target.value } as typeof newVariant)}
              className="w-full h-10 border-b border-input bg-background px-2 text-[10px] font-bold uppercase tracking-widest text-foreground focus:border-primary rounded-sm cursor-pointer"
            >
              <option value="">Select Warehouse</option>
              {warehouseList.map((w: Warehouse) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Stock Quantity</label>
            <input
              type="number"
              value={newVariant.stock ?? 0}
              onChange={(e) => setNewVariant({ ...newVariant, stock: parseInt(e.target.value) || 0 })}
              className="w-full h-10 border-b border-input bg-transparent px-0 text-sm focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <label className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Multi-Warehouse Stock (optional)</label>
            <div className="flex items-center gap-2">
              <select 
                value={bulkWarehouseId}
                onChange={(e) => setBulkWarehouseId(e.target.value)}
                className="h-8 border-b border-input bg-background px-2 text-[10px] font-bold uppercase tracking-widest text-foreground focus:border-primary rounded-sm cursor-pointer"
              >
                <option value="">Select Warehouse</option>
                {warehouseList.map((w: Warehouse) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
              <input 
                type="number" 
                placeholder="Qty"
                value={bulkStock}
                onChange={(e) => setBulkStock(e.target.value)}
                className="w-20 h-8 border-b border-input bg-transparent px-0 text-center text-sm focus:border-primary"
              />
              <button 
                type="button"
                onClick={addMultiWarehouseStock}
                disabled={!bulkWarehouseId}
                className="h-8 px-3 bg-foreground text-background text-[10px] font-bold uppercase hover:bg-primary transition-colors disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>
          {multiWarehouseStock.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {multiWarehouseStock.map((stock, idx) => {
                const wh = warehouseList.find((w: Warehouse) => w.id === stock.warehouseId);
                return (
                  <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-background border border-border">
                    <span className="text-[10px] font-bold uppercase">{wh?.name || stock.warehouseId}</span>
                    <span className="text-[10px] text-muted-foreground">-</span>
                    <span className="text-[10px] font-mono">{stock.quantity} units</span>
                    <button type="button" onClick={() => removeMultiWarehouseStock(idx)} className="text-muted-foreground hover:text-destructive">
                      <X size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-[10px] text-muted-foreground/50 italic">
              {newVariant.stock ? `Single warehouse: ${newVariant.stock} units at ${warehouseList.find((w: Warehouse) => w.id === newVariant.warehouseId)?.name || 'N/A'}` : 'Add warehouse stock allocations above'}
            </div>
          )}
        </div>
        </>
        )}
        <div className="flex justify-end gap-4">
          {editingVariant && (
            <button type="button" onClick={() => {
              setEditingVariant(null);
              setNewVariant({ sku: '', size: '', color: '', stock: 0, lowStockThreshold: 5, images: [] });
            }} className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground px-4">Cancel Edit</button>
          )}
          {!bulkMode && (
            <button type="button" onClick={() => {
              const hasMultiStock = multiWarehouseStock.length > 0;
              const warehouseId = (newVariant as { warehouseId?: string }).warehouseId;
              const stockQty = hasMultiStock
                ? totalStock
                : Number(newVariant.stock) || 0;

              const overrides: Record<string, unknown> = { stock: stockQty };
              if (hasMultiStock) {
                overrides.warehouseAllocations = multiWarehouseStock;
                overrides.warehouseId = '';
              } else if (warehouseId) {
                overrides.warehouseId = warehouseId;
                overrides.warehouseAllocations = [{ warehouseId, quantity: stockQty }];
              }
              if (attributes.length > 0) {
                const derived = deriveSizeColorFromSelections(
                  (newVariant as any).attributeSelections,
                  attributes,
                );
                if (!newVariant.size) overrides.size = derived.size;
                if (!newVariant.color) overrides.color = derived.color;
              }
              addVariant(overrides);
              setMultiWarehouseStock([]);
            }} disabled={
              !newVariant.sku ||
              (!attributes.length && !newVariant.size) ||
              (attributes.length > 0 &&
                Object.values(
                  ((newVariant as { attributeSelections?: Record<string, string> }).attributeSelections) || {},
                ).filter(Boolean).length === 0) ||
              (!editingVariant && multiWarehouseStock.length === 0 && !(newVariant as { warehouseId?: string }).warehouseId)
            } className="bg-foreground text-primary-foreground px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all duration-300 shadow-lg shadow-black/5 disabled:opacity-40 disabled:cursor-not-allowed">
              {editingVariant ? 'Update Variant' : 'Confirm SKU Variant'}
            </button>
          )}
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
      
      {submitError && (
        <div className="flex items-start gap-3 p-4 border border-destructive/40 bg-destructive/10 text-destructive">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <p className="text-[11px] leading-relaxed">{submitError}</p>
        </div>
      )}

      <div className="flex justify-between items-center pt-10 border-t border-border">
        <button onClick={() => setStep(1)} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors duration-300"><ChevronLeft size={14} /> Core Definition</button>
        <button 
          onClick={onSave} 
          disabled={submitting || currentVariants.length === 0}
          className="bg-primary text-primary-foreground px-10 py-4 text-xs font-bold uppercase tracking-[0.3em] hover:opacity-90 transition-all duration-300 shadow-xl shadow-primary/20 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Save size={16} className="animate-pulse" />
              <span>Syncing...</span>
            </>
          ) : (
            <>
              <Save size={16} />
              <span>Sync to Catalog</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
