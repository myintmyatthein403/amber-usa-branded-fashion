import React, { useEffect, useState, useMemo } from 'react';
import { ShoppingBag, Plus, Trash2, Edit2, Loader2, Tag, ChevronRight, ChevronLeft, Layers, Package, Save, Globe, Info, BarChart3, AlertCircle, Bookmark, Search, Scale, Image as ImageIcon, X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Modal } from '../components/admin/Modal';
import { MediaSelector } from '../components/admin/MediaSelector';
import { useFetch, useDelete } from '../hooks/useCrud';
import { apiService } from '../services/api.service';
import { API_ROUTES } from '../config/constants';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Real-world interfaces (Retail Grade)
interface Variant { 
  id?: string; 
  sku: string;
  barcode?: string;
  size: string; 
  color: string; 
  stock: number; 
  lowStockThreshold: number;
  price?: number;
  compareAtPrice?: number;
  weight?: number;
  images?: string[];
  isPreOrder?: boolean;
  preOrderShippingDate?: string | null;
}

interface Category { id: string; name: string; }
interface Brand { id: string; name: string; logo?: string; }
interface Sale { id: string; name: string; }

interface Product {
  id: string;
  name: string;
  slug: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  brandId?: string;
  brand?: Brand;
  shortDescription?: string;
  description?: string;
  note?: string;
  tags: string[];
  metaTitle?: string;
  metaDescription?: string;
  price: string;
  compareAtPrice?: string;
  isUsdPrice: boolean;
  isFeatured: boolean;
  onSale: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isPreOrder: boolean;
  preOrderShippingDate?: string | null;
  preOrderNote?: string;
  images: string[];
  categoryId?: string;
  category?: Category;
  variants?: Variant[];
  saleId?: string;
  sale?: Sale;
}

export const ProductsPage: React.FC = () => {
  const { data: products, loading, refresh } = useFetch<Product>(API_ROUTES.PRODUCTS.BASE);
  const { data: categories } = useFetch<Category>(API_ROUTES.CATEGORIES.BASE);
  const { data: brands } = useFetch<Brand>(API_ROUTES.BRANDS.BASE);
  const { data: rawWarehouses } = useFetch<any>(API_ROUTES.LOGISTICS.WAREHOUSES);
  const { data: sales } = useFetch<Sale>(API_ROUTES.SALES.BASE);
  const { deleteItem } = useDelete(API_ROUTES.PRODUCTS.BASE);

  const [modalOpen, setModalOpen] = useState(false);
  const [mediaSelectorOpen, setMediaSelectorOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
  const [urlInput, setUrlInput] = useState('');
  
  const [productForm, setProductForm] = useState({
    name: '',
    slug: '',
    status: 'DRAFT' as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
    brandId: '',
    shortDescription: '',
    description: '',
    note: '',
    tags: [] as string[],
    metaTitle: '',
    metaDescription: '',
    price: '',
    compareAtPrice: '',
    isUsdPrice: true,
    isFeatured: false,
    onSale: false,
    isNewArrival: false,
    isBestSeller: false,
    isPreOrder: false,
    preOrderShippingDate: '',
    preOrderNote: '',
    images: [] as string[],
    categoryId: '',
    saleId: ''
  });

  const [currentVariants, setCurrentVariants] = useState<Variant[]>([]);
  const [newVariant, setNewVariant] = useState({ 
    sku: '', 
    barcode: '',
    size: '', 
    color: '', 
    stock: '0', 
    lowStockThreshold: '5',
    price: '', 
    compareAtPrice: '',
    weight: '0',
    images: [] as string[],
    warehouseId: ''
  });

  const warehouses = useMemo(() => rawWarehouses || [], [rawWarehouses]);

  // Auto-generate slug from name
  useEffect(() => {
    if (!editingProduct && productForm.name) {
      const slug = productForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setProductForm(prev => ({ ...prev, slug }));
    }
  }, [productForm.name, editingProduct]);

  const handleMediaSelect = (url: string) => {
    setProductForm(prev => ({
      ...prev,
      images: [...prev.images, url]
    }));
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const endpoint = editingProduct 
        ? API_ROUTES.PRODUCTS.BY_ID(editingProduct.id) 
        : API_ROUTES.PRODUCTS.BASE;
      
      const method = editingProduct ? 'PATCH' : 'POST';

      const savedProduct = await apiService(endpoint, {
        method,
        body: {
          ...productForm,
          price: parseFloat(productForm.price),
          compareAtPrice: productForm.compareAtPrice ? parseFloat(productForm.compareAtPrice) : null,
          categoryId: productForm.categoryId || null,
          brandId: productForm.brandId || null,
          saleId: productForm.saleId || null,
          note: productForm.note || null
        },
      });

      setEditingProduct(savedProduct);
      setStep(2);
      refresh();
    } catch (error) {
      console.error('Failed to save product:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const addVariant = async () => {
    if (!editingProduct) return;
    if (!newVariant.size || !newVariant.color || !newVariant.sku) return;

    try {
      if (editingVariant) {
        // Update existing variant
        const updatedVariant = await apiService(API_ROUTES.VARIANTS.BY_ID(editingVariant.id!), {
          method: 'PATCH',
          body: {
            ...newVariant,
            stock: parseInt(newVariant.stock),
            lowStockThreshold: parseInt(newVariant.lowStockThreshold),
            price: newVariant.price ? parseFloat(newVariant.price) : undefined,
            compareAtPrice: newVariant.compareAtPrice ? parseFloat(newVariant.compareAtPrice) : undefined,
            weight: parseFloat(newVariant.weight)
          },
        });
        setCurrentVariants(currentVariants.map(v => v.id === updatedVariant.id ? updatedVariant : v));
        setEditingVariant(null);
      } else {
        // Create new variant
        const savedVariant = await apiService(API_ROUTES.VARIANTS.BASE, {
          method: 'POST',
          body: {
            ...newVariant,
            productId: editingProduct.id,
            stock: parseInt(newVariant.stock),
            lowStockThreshold: parseInt(newVariant.lowStockThreshold),
            price: newVariant.price ? parseFloat(newVariant.price) : undefined,
            compareAtPrice: newVariant.compareAtPrice ? parseFloat(newVariant.compareAtPrice) : undefined,
            weight: parseFloat(newVariant.weight)
          },
        });
        setCurrentVariants([...currentVariants, savedVariant]);
      }
      
      setNewVariant({ sku: '', barcode: '', size: '', color: '', stock: '0', lowStockThreshold: '5', price: '', compareAtPrice: '', weight: '0', images: [], warehouseId: '' });
      refresh();
    } catch (error) {
      console.error('Failed to save variant:', error);
    }
  };

  const handleEditVariant = (variant: Variant) => {
    setEditingVariant(variant);
    setNewVariant({
      sku: variant.sku,
      barcode: variant.barcode || '',
      size: variant.size,
      color: variant.color,
      stock: variant.stock.toString(),
      lowStockThreshold: variant.lowStockThreshold.toString(),
      price: variant.price?.toString() || '',
      compareAtPrice: variant.compareAtPrice?.toString() || '',
      weight: variant.weight?.toString() || '0',
      images: variant.images || [],
      warehouseId: '' // Warehouse selection only for new stock creation
    });
  };

  const handleDeleteVariant = async (id: string) => {
    if (!confirm('Delete this variant?')) return;
    try {
      await apiService(API_ROUTES.VARIANTS.BY_ID(id), { method: 'DELETE' });
      setCurrentVariants(currentVariants.filter(v => v.id !== id));
      refresh();
    } catch (error) {
      console.error('Failed to delete variant:', error);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    const success = await deleteItem(id, 'Are you sure? This will delete the product and all its variants.');
    if (success) refresh();
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setEditingVariant(null);
    setProductForm({ 
      name: '', slug: '', status: 'DRAFT', brandId: '', 
      shortDescription: '', description: '', note: '', tags: [], 
      metaTitle: '', metaDescription: '', price: '', 
      compareAtPrice: '', isUsdPrice: true, isFeatured: false, onSale: false,
      isNewArrival: false, isBestSeller: false,
      isPreOrder: false, preOrderShippingDate: '', preOrderNote: '',
      images: [], categoryId: '', saleId: '' 
    });
    setCurrentVariants([]);
    setStep(1);
    setModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setEditingVariant(null);
    setProductForm({ 
      name: product.name, 
      slug: product.slug,
      status: product.status,
      brandId: product.brandId || '',
      shortDescription: product.shortDescription || '',
      description: product.description || '', 
      note: product.note || '',
      tags: product.tags || [],
      metaTitle: product.metaTitle || '',
      metaDescription: product.metaDescription || '',
      price: product.price.toString(),
      compareAtPrice: product.compareAtPrice?.toString() || '',
      isUsdPrice: product.isUsdPrice,
      isFeatured: product.isFeatured,
      onSale: product.onSale,
      isNewArrival: product.isNewArrival,
      isBestSeller: product.isBestSeller,
      isPreOrder: product.isPreOrder || false,
      preOrderShippingDate: product.preOrderShippingDate ? new Date(product.preOrderShippingDate).toISOString().split('T')[0] : '',
      preOrderNote: product.preOrderNote || '',
      images: product.images || [],
      categoryId: product.categoryId || '',
      saleId: product.saleId || ''
    });
    setCurrentVariants(product.variants || []);
    setStep(1);
    setModalOpen(true);
  };
  
  const quillModules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link', 'clean']
    ],
  }), []);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-end justify-between">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase leading-none">Catalog Management</span>
          <h2 className="text-4xl font-serif text-foreground tracking-tight">Master Catalog</h2>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-3 bg-foreground text-primary-foreground px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all duration-300 shadow-xl shadow-black/5"
        >
          <Plus size={18} /> New Product
        </button>
      </div>

      <div className="border border-border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">Product & Brand</th>
              <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase">Classification</th>
              <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase text-center">Status</th>
              <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase text-center">Price</th>
              <th className="px-10 py-5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase text-right">Options</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={5} className="px-10 py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic animate-pulse">Accessing Data Cluster...</td></tr>
            ) : !products || products.length === 0 ? (
              <tr><td colSpan={5} className="px-10 py-20 text-center text-xs font-medium text-muted-foreground uppercase tracking-widest italic">No data found in current cluster.</td></tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="group hover:bg-muted/30 transition-colors duration-300">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-secondary flex items-center justify-center relative border border-border">
                        {product.images && product.images[0] ? (
                          <img src={product.images[0]} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                        ) : (
                          <ShoppingBag size={20} className="text-muted-foreground/30" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="text-lg font-serif text-foreground tracking-wide">{product.name}</div>
                        <div className="flex items-center gap-2">
                           {product.brand && (
                             <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 font-bold uppercase tracking-widest">{product.brand.name}</span>
                           )}
                           <span className="w-1 h-1 rounded-full bg-muted-foreground/30"></span>
                           <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[100px]">{product.id}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    {product.category ? (
                      <span className="inline-flex items-center py-1.5 px-3 border border-primary/10 text-primary text-[9px] font-bold uppercase tracking-[0.2em] bg-secondary">
                        {product.category.name}
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground/30 font-bold uppercase tracking-widest">General</span>
                    )}
                  </td>
                  <td className="px-10 py-6 text-center">
                    <span className={cn(
                      "text-[9px] font-bold uppercase tracking-widest px-2 py-1 border",
                      product.status === 'PUBLISHED' ? "border-emerald-500/20 text-emerald-500 bg-emerald-50/10" : "border-amber-500/20 text-amber-500 bg-amber-50/10"
                    )}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-sm font-bold text-foreground tracking-tight">
                        ${parseFloat(product.price).toLocaleString()}
                      </span>
                      {product.onSale && product.compareAtPrice && parseFloat(product.compareAtPrice) > 0 && (
                        <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 font-bold">
                          -{Math.round((1 - parseFloat(product.price) / parseFloat(product.compareAtPrice)) * 100)}%
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button onClick={() => openEditModal(product)} className="p-2.5 text-muted-foreground hover:text-foreground transition-colors duration-300">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDeleteProduct(product.id)} className="p-2.5 text-muted-foreground hover:text-destructive transition-colors duration-300">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={editingProduct ? `Edit SKU: ${editingProduct.name}` : 'New Product Definition'}
      >
        {/* Stepper */}
        <div className="mb-10 flex border-b border-border overflow-x-auto">
          <button onClick={() => setStep(1)} className={cn("pb-4 px-6 text-[11px] font-bold tracking-[0.2em] uppercase transition-all duration-300 relative whitespace-nowrap", step === 1 ? "text-foreground" : "text-muted-foreground hover:text-foreground")}>
            01. Product Content
            {step === 1 && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary" />}
          </button>
          <button onClick={() => setStep(2)} className={cn("pb-4 px-6 text-[11px] font-bold tracking-[0.2em] uppercase transition-all duration-300 relative whitespace-nowrap", step === 2 ? "text-foreground" : "text-muted-foreground hover:text-foreground")}>
            02. Logistics & Inventory
            {step === 2 && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary" />}
          </button>
        </div>

        {step === 1 ? (
          <form onSubmit={handleProductSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Internal Name</label>
                <input type="text" required value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-lg font-serif placeholder:text-muted-foreground/20 focus:border-primary focus:outline-none transition-colors duration-300 rounded-none" placeholder="e.g. Signature Silk Kimono" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">SEO URL Slug</label>
                <input type="text" required value={productForm.slug} onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })} className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-sm font-mono text-primary focus:border-primary focus:outline-none transition-colors duration-300 rounded-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Current Price ({productForm.isUsdPrice ? 'USD' : 'MMK'})</label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" checked={productForm.isUsdPrice} onChange={(e) => setProductForm({...productForm, isUsdPrice: e.target.checked})} className="w-4 h-4 accent-primary" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">Base in USD</span>
                  </label>
                </div>
                <input type="text" required value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-lg font-mono focus:border-primary focus:outline-none transition-colors duration-300 rounded-none" placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Compare at Price ({productForm.isUsdPrice ? 'USD' : 'MMK'})</label>
                  {productForm.price && productForm.compareAtPrice && parseFloat(productForm.compareAtPrice) > 0 && (
                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">
                      {Math.round((1 - parseFloat(productForm.price) / parseFloat(productForm.compareAtPrice)) * 100)}% Discount
                    </span>
                  )}
                </div>
                <input type="text" value={productForm.compareAtPrice} onChange={(e) => setProductForm({ ...productForm, compareAtPrice: e.target.value })} className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-lg font-mono focus:border-primary focus:outline-none transition-colors duration-300 rounded-none text-muted-foreground" placeholder="0.00" />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-12 gap-y-4 py-4">
               <label className="flex items-center gap-3 cursor-pointer group">
                 <input type="checkbox" checked={productForm.onSale} onChange={(e) => setProductForm({...productForm, onSale: e.target.checked})} className="w-5 h-5 accent-primary" />
                 <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">Apply Sale Status</span>
               </label>
               <label className="flex items-center gap-3 cursor-pointer group">
                 <input type="checkbox" checked={productForm.isFeatured} onChange={(e) => setProductForm({...productForm, isFeatured: e.target.checked})} className="w-5 h-5 accent-primary" />
                 <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">Feature on Homepage</span>
               </label>
               <label className="flex items-center gap-3 cursor-pointer group">
                 <input type="checkbox" checked={productForm.isNewArrival} onChange={(e) => setProductForm({...productForm, isNewArrival: e.target.checked})} className="w-5 h-5 accent-primary" />
                 <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">New Arrival</span>
               </label>
               <label className="flex items-center gap-3 cursor-pointer group">
                 <input type="checkbox" checked={productForm.isBestSeller} onChange={(e) => setProductForm({...productForm, isBestSeller: e.target.checked})} className="w-5 h-5 accent-primary" />
                 <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">Best Seller</span>
               </label>
            </div>

            {/* Pre-Order Section */}
            <div className="bg-muted/5 p-6 border border-border space-y-6">
               <div className="flex justify-between items-center">
                 <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] flex items-center gap-2"><Package size={14}/> Pre-Order Configuration</h4>
                 <label className="flex items-center gap-3 cursor-pointer group">
                   <input type="checkbox" checked={productForm.isPreOrder} onChange={(e) => setProductForm({...productForm, isPreOrder: e.target.checked})} className="w-5 h-5 accent-primary" />
                   <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">Enable Pre-Order</span>
                 </label>
               </div>
               
               {productForm.isPreOrder && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Expected Shipping Date</label>
                      <input 
                        type="date" 
                        value={productForm.preOrderShippingDate} 
                        onChange={(e) => setProductForm({ ...productForm, preOrderShippingDate: e.target.value })} 
                        className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-sm font-mono text-primary focus:border-primary focus:outline-none transition-colors duration-300 rounded-none" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Pre-Order Note (Customer Facing)</label>
                      <input 
                        type="text" 
                        value={productForm.preOrderNote} 
                        onChange={(e) => setProductForm({ ...productForm, preOrderNote: e.target.value })} 
                        className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-sm focus:border-primary focus:outline-none transition-colors duration-300 rounded-none" 
                        placeholder="e.g. Ships in late October"
                      />
                    </div>
                 </div>
               )}
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
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Active Sale</label>
                <select value={productForm.saleId} onChange={(e) => setProductForm({ ...productForm, saleId: e.target.value })} className="w-full h-12 border-b border-input bg-transparent px-0 py-2 text-sm font-bold uppercase tracking-widest focus:border-primary focus:outline-none transition-colors duration-300 rounded-none">
                  <option value="">No Active Sale</option>
                  {sales?.map((sale) => <option key={sale.id} value={sale.id}>{sale.name}</option>)}
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

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Editorial Storytelling</label>
              <div className="border border-input bg-card focus-within:border-primary transition-colors duration-300">
                <ReactQuill theme="snow" value={productForm.description} onChange={(val) => setProductForm({ ...productForm, description: val })} modules={quillModules} className="[&_.ql-editor]:min-h-[150px]" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground flex items-center gap-2"><Info size={14}/> Operational Notes</label>
              <textarea
                value={productForm.note}
                onChange={(e) => setProductForm({ ...productForm, note: e.target.value })}
                className="w-full h-24 border border-input bg-transparent p-4 text-sm focus:border-primary focus:outline-none transition-colors duration-300 rounded-none resize-none"
                placeholder="Internal notes, supplier info, or production status..."
              />
            </div>

            <div className="space-y-6">
              <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground flex items-center gap-2">
                <ImageIcon size={14}/> Product Gallery
              </label>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {productForm.images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square border border-border bg-secondary group overflow-hidden">
                    <img src={img} className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => setProductForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))}
                      className="absolute top-1 right-1 p-1 bg-destructive text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <div className="aspect-square border border-dashed border-border flex flex-col items-center justify-center gap-2 hover:bg-muted/50 transition-colors relative cursor-pointer" onClick={() => setMediaSelectorOpen(true)}>
                   <Plus size={20} className="text-muted-foreground/30" />
                   <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Select Media</span>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Paste external image URL here..."
                  className="flex-1 h-10 border-b border-input bg-transparent px-0 text-sm focus:border-primary focus:outline-none transition-colors"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (urlInput) {
                        setProductForm(prev => ({ ...prev, images: [...prev.images, urlInput] }));
                        setUrlInput('');
                      }
                    }
                  }}
                />
                <button 
                  type="button"
                  onClick={() => {
                    if (urlInput) {
                      setProductForm(prev => ({ ...prev, images: [...prev.images, urlInput] }));
                      setUrlInput('');
                    }
                  }}
                  className="px-4 bg-secondary text-[10px] font-bold uppercase tracking-widest border border-border hover:bg-muted transition-colors"
                >
                  Add URL
                </button>
              </div>
            </div>

            <div className="bg-muted/5 p-6 border border-border space-y-6">
               <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] flex items-center gap-2"><Globe size={14}/> Search Engine Optimization</h4>
               <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground">Meta Title</label>
                    <input type="text" value={productForm.metaTitle} onChange={(e) => setProductForm({ ...productForm, metaTitle: e.target.value })} className="w-full h-10 border-b border-border bg-transparent px-0 text-sm focus:border-primary focus:outline-none transition-colors duration-300" placeholder="Product Name | Store Name" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground">Meta Description</label>
                    <textarea value={productForm.metaDescription} onChange={(e) => setProductForm({ ...productForm, metaDescription: e.target.value })} className="w-full h-20 border border-border bg-transparent p-3 text-sm focus:border-primary focus:outline-none transition-colors duration-300 rounded-none resize-none" placeholder="Brief summary for Google search results..." />
                  </div>
               </div>
            </div>

            <div className="flex justify-end pt-10 border-t border-border">
              <button type="submit" disabled={submitting} className="flex items-center gap-3 bg-foreground text-primary-foreground px-10 py-4 text-xs font-bold uppercase tracking-[0.3em] hover:bg-primary transition-colors duration-500 disabled:opacity-50">
                {submitting ? <Loader2 size={16} className="animate-spin" /> : editingProduct ? 'Commit Changes' : 'Initialize SKU'}
                <ChevronRight size={16} />
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            {!editingProduct ? (
              <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 bg-muted/5 border border-dashed border-border">
                <div className="p-4 bg-primary/10 text-primary rounded-full"><AlertCircle size={32} /></div>
                <p className="text-sm text-muted-foreground max-w-xs">Initialize the product definition to enable variant management.</p>
                <button onClick={() => setStep(1)} className="text-xs font-bold uppercase tracking-widest text-primary hover:underline">Return to Step 01</button>
              </div>
            ) : (
              <>
                <div className="bg-secondary p-8 border border-primary/10">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-primary/10 text-primary">{editingVariant ? <Edit2 size={18} /> : <Plus size={18} />}</div>
                    <h4 className="text-[11px] font-bold uppercase tracking-[0.3em] text-foreground">{editingVariant ? 'Edit SKU Variant' : 'Add SKU Variant'}</h4>
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
                            <div className="w-12 h-12 bg-muted flex items-center justify-center font-bold text-[10px] text-muted-foreground border border-border">{v.size}</div>
                            <div>
                              <div className="text-sm font-bold text-foreground flex items-center gap-3">{v.color} <span className="w-1.5 h-1.5 rounded-full bg-primary"></span> <span className="font-mono text-[10px] text-muted-foreground">{v.sku}</span></div>
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
              </>
            )}
            <div className="flex justify-between items-center pt-10 border-t border-border">
              <button onClick={() => setStep(1)} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors duration-300"><ChevronLeft size={14} /> Core Definition</button>
              <button onClick={() => setModalOpen(false)} className="bg-primary text-primary-foreground px-10 py-4 text-xs font-bold uppercase tracking-[0.3em] hover:opacity-90 transition-all duration-300 shadow-xl shadow-primary/20"><Save size={16} /> Sync to Catalog</button>
            </div>
          </div>
        )}
      </Modal>

      <MediaSelector 
        isOpen={mediaSelectorOpen} 
        onClose={() => setMediaSelectorOpen(false)} 
        onSelect={handleMediaSelect}
        selectedUrls={productForm.images}
      />
    </div>
  );
};
