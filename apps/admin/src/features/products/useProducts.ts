import { useState, useEffect, useMemo, useCallback } from 'react';
import { useFetch, useDelete } from '../../hooks/useCrud';
import { API_ROUTES } from '../../config/constants';
import { apiService } from '../../services/api.service';
import { Product, Variant, Category, Brand, Sale, Meta } from './schema';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to first page on search
    }, 500);

    return () => clearTimeout(handler);
  }, [search]);

  const { data: categories } = useFetch<Category>(API_ROUTES.CATEGORIES.BASE);
  const { data: brands } = useFetch<Brand>(API_ROUTES.BRANDS.BASE);
  const { data: rawWarehouses } = useFetch<any>(API_ROUTES.LOGISTICS.WAREHOUSES);
  const { data: sales } = useFetch<Sale>(API_ROUTES.SALES.BASE);
  const { deleteItem } = useDelete(API_ROUTES.PRODUCTS.BASE);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (debouncedSearch) params.append('search', debouncedSearch);

      const response = await apiService(`${API_ROUTES.PRODUCTS.BASE}?${params.toString()}`);
      setProducts(response.data);
      setMeta(response.meta);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const [modalOpen, setModalOpen] = useState(false);
  const [mediaSelectorOpen, setMediaSelectorOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
  
  const initialProductForm = {
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
  };

  const [productForm, setProductForm] = useState(initialProductForm);
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
    warehouseId: '',
    isPreOrder: false
  });

  const warehouses = useMemo(() => rawWarehouses || [], [rawWarehouses]);

  const addVariant = () => {
    const variantData: Variant = {
      sku: newVariant.sku,
      barcode: newVariant.barcode,
      size: newVariant.size,
      color: newVariant.color,
      stock: Number(newVariant.stock),
      lowStockThreshold: Number(newVariant.lowStockThreshold),
      price: newVariant.price ? Number(newVariant.price) : undefined,
      compareAtPrice: newVariant.compareAtPrice ? Number(newVariant.compareAtPrice) : undefined,
      weight: newVariant.weight ? Number(newVariant.weight) : undefined,
      images: newVariant.images,
      isPreOrder: newVariant.isPreOrder
    };

    if (editingVariant) {
      setCurrentVariants(prev => prev.map(v => v.id === editingVariant.id ? { ...v, ...variantData } : v));
      setEditingVariant(null);
    } else {
      const variantToAdd: Variant = {
        ...variantData,
        id: Math.random().toString(36).substr(2, 9),
      };
      setCurrentVariants(prev => [...prev, variantToAdd]);
    }
    setNewVariant({ sku: '', barcode: '', size: '', color: '', stock: '0', lowStockThreshold: '5', price: '', compareAtPrice: '', weight: '0', images: [], warehouseId: '', isPreOrder: false });
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
      warehouseId: '',
      isPreOrder: variant.isPreOrder || false
    });
  };

  const handleDeleteVariant = (id: string) => {
    setCurrentVariants(prev => prev.filter(v => v.id !== id));
  };

  // Auto-generate slug
  useEffect(() => {
    if (!editingProduct && productForm.name) {
      const slug = productForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setProductForm(prev => ({ ...prev, slug }));
    }
  }, [productForm.name, editingProduct]);

  const handleProductSubmit = async () => {
    setSubmitting(true);
    try {
      const endpoint = editingProduct 
        ? API_ROUTES.PRODUCTS.BY_ID(editingProduct.id) 
        : API_ROUTES.PRODUCTS.BASE;
      
      const method = editingProduct ? 'PATCH' : 'POST';
      
      const payload = {
        ...productForm,
        variants: currentVariants.map(v => ({
          ...v,
          stock: Number(v.stock),
          lowStockThreshold: Number(v.lowStockThreshold),
          price: v.price ? Number(v.price) : undefined,
          compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : undefined,
          weight: v.weight ? Number(v.weight) : undefined
        }))
      };

      await apiService(endpoint, {
        method,
        body: payload
      });

      setModalOpen(false);
      fetchProducts();
      resetForm();
    } catch (error) {
      console.error('Failed to save product:', error);
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setProductForm(initialProductForm);
    setCurrentVariants([]);
    setEditingProduct(null);
    setEditingVariant(null);
    setNewVariant({ 
      sku: '', 
      barcode: '', 
      size: '', 
      color: '', 
      stock: '0', 
      lowStockThreshold: '5', 
      price: '', 
      compareAtPrice: '', 
      weight: '0', 
      images: [], 
      warehouseId: '', 
      isPreOrder: false 
    });
    setStep(1);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      slug: product.slug,
      status: product.status as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
      brandId: product.brandId || '',
      shortDescription: product.shortDescription || '',
      description: product.description || '',
      note: product.note || '',
      tags: product.tags || [],
      metaTitle: product.metaTitle || '',
      metaDescription: product.metaDescription || '',
      price: product.price,
      compareAtPrice: product.compareAtPrice || '',
      isUsdPrice: product.isUsdPrice,
      isFeatured: product.isFeatured,
      onSale: product.onSale,
      isNewArrival: product.isNewArrival,
      isBestSeller: product.isBestSeller,
      isPreOrder: product.isPreOrder,
      preOrderShippingDate: product.preOrderShippingDate ? new Date(product.preOrderShippingDate).toISOString().split('T')[0] : '',
      preOrderNote: product.preOrderNote || '',
      images: product.images || [],
      categoryId: product.categoryId || '',
      saleId: product.saleId || ''
    });
    setCurrentVariants(product.variants || []);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const success = await deleteItem(id, 'Delete this product and all its variants permanently?');
    if (success) fetchProducts();
  };

  return {
    products,
    meta,
    loading,
    page,
    setPage,
    limit,
    setLimit,
    search,
    setSearch,
    categories,
    brands,
    warehouses,
    sales,
    modalOpen,
    setModalOpen,
    mediaSelectorOpen,
    setMediaSelectorOpen,
    step,
    setStep,
    submitting,
    editingProduct,
    productForm,
    setProductForm,
    currentVariants,
    setCurrentVariants,
    editingVariant,
    setEditingVariant,
    newVariant,
    setNewVariant,
    addVariant,
    handleEditVariant,
    handleDeleteVariant,
    handleProductSubmit,
    handleDelete,
    openEditModal,
    resetForm,
    refresh: fetchProducts
  };
};
