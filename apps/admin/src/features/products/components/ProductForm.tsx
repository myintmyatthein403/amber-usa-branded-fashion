import React from 'react';
import { Package, Globe, Info, Image as ImageIcon, Plus, X, ChevronRight, Link as LinkIcon } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Category, Brand, Sale } from '../schema';

interface ProductFormProps {
  productForm: any;
  setProductForm: (form: any) => void;
  categories: Category[] | null;
  brands: Brand[] | null;
  sales: Sale[] | null;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  editingProduct: any;
  onOpenMedia: (index?: number) => void;
}

const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ['link', 'clean']
  ],
};

export const ProductForm: React.FC<ProductFormProps> = ({
  productForm,
  setProductForm,
  categories,
  brands,
  sales,
  onSubmit,
  submitting,
  editingProduct,
  onOpenMedia
}) => {
  const [urlInput, setUrlInput] = React.useState('');

  const removeImage = (index: number) => {
    setProductForm({
      ...productForm,
      images: productForm.images.filter((_: any, i: number) => i !== index)
    });
  };

  const addImageUrl = () => {
    if (urlInput.trim()) {
      setProductForm({
        ...productForm,
        images: [...productForm.images, urlInput.trim()]
      });
      setUrlInput('');
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-12 py-10 animate-in fade-in slide-in-from-left-4 duration-500">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground flex items-center gap-2">
              <ImageIcon size={14} /> Editorial Imagery
            </label>
            <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Click an image to replace, or use the (+) to add more.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <LinkIcon size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Paste Image URL..." 
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImageUrl())}
                className="h-8 pl-8 pr-3 bg-card border border-border text-[10px] w-64 focus:border-primary focus:outline-none transition-all"
              />
            </div>
            <button 
              type="button"
              onClick={addImageUrl}
              className="h-8 px-4 bg-foreground text-background text-[10px] font-bold uppercase tracking-widest hover:bg-primary transition-colors"
            >
              Link
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {productForm.images.map((url: string, index: number) => (
            <div key={index} className="group relative aspect-square bg-secondary border border-border overflow-hidden cursor-pointer">
              <img 
                src={url} 
                alt={`Product ${index}`} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                onClick={() => onOpenMedia(index)}
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <span className="text-[9px] text-white font-bold uppercase tracking-[0.2em]">Change</span>
              </div>
              <button 
                type="button" 
                onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                className="absolute top-2 right-2 p-1.5 bg-background/80 text-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground z-10"
              >
                <X size={12} />
              </button>
              {index === 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-primary/90 text-primary-foreground text-[8px] font-bold uppercase tracking-widest text-center py-1">
                  Primary
                </div>
              )}
            </div>
          ))}
          <button 
            type="button"
            onClick={() => onOpenMedia()}
            className="aspect-square border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-all duration-300 group"
          >
            <Plus size={24} className="group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-bold uppercase tracking-widest">Add Image</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Product Title</label>
          <input type="text" required value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-2xl font-serif focus:border-primary focus:outline-none transition-colors duration-300 rounded-none" placeholder="Enter Product Name..." />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Unique Slug</label>
          <input type="text" required value={productForm.slug} onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })} className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-sm font-mono focus:border-primary focus:outline-none transition-colors duration-300 rounded-none" placeholder="product-url-slug" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Editorial Storytelling</label>
        <div className="border border-input bg-card focus-within:border-primary transition-colors duration-300">
          <ReactQuill theme="snow" value={productForm.description} onChange={(val) => setProductForm({ ...productForm, description: val })} modules={quillModules} className="[&_.ql-editor]:min-h-[150px]" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Retail Price ({productForm.isUsdPrice ? 'USD' : 'MMK'})</label>
            <label className="flex items-center gap-2 cursor-pointer mb-1 group">
              <input type="checkbox" checked={productForm.isUsdPrice} onChange={(e) => setProductForm({...productForm, isUsdPrice: e.target.checked})} className="w-3.5 h-3.5 accent-primary" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">USD Currency</span>
            </label>
          </div>
          <input type="text" required value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-lg font-mono focus:border-primary focus:outline-none transition-colors duration-300 rounded-none" placeholder="0.00" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Compare at Price ({productForm.isUsdPrice ? 'USD' : 'MMK'})</label>
          </div>
          <input type="text" value={productForm.compareAtPrice} onChange={(e) => setProductForm({ ...productForm, compareAtPrice: e.target.value })} className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-lg font-mono focus:border-primary focus:outline-none transition-colors duration-300 rounded-none text-muted-foreground" placeholder="0.00" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Brand/Vendor</label>
          <select value={productForm.brandId} onChange={(e) => setProductForm({ ...productForm, brandId: e.target.value })} className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-sm font-bold uppercase tracking-widest focus:border-primary focus:outline-none transition-colors duration-300 rounded-none">
            <option value="">Select Brand</option>
            {brands?.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Classification</label>
          <select value={productForm.categoryId} onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })} className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-sm font-bold uppercase tracking-widest focus:border-primary focus:outline-none transition-colors duration-300 rounded-none">
            <option value="">Select Category</option>
            {categories?.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Status</label>
          <select value={productForm.status} onChange={(e) => setProductForm({ ...productForm, status: e.target.value as any })} className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-sm font-bold uppercase tracking-widest focus:border-primary focus:outline-none transition-colors duration-300 rounded-none">
            <option value="DRAFT">DRAFT</option>
            <option value="PUBLISHED">PUBLISHED</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end pt-10 border-t border-border">
        <button type="submit" disabled={submitting} className="flex items-center gap-3 bg-foreground text-primary-foreground px-10 py-4 text-xs font-bold uppercase tracking-[0.3em] hover:bg-primary transition-colors duration-500 disabled:opacity-50">
          {submitting ? 'Processing...' : editingProduct ? 'Commit Changes' : 'Initialize SKU'}
          <ChevronRight size={16} />
        </button>
      </div>
    </form>
  );
};
