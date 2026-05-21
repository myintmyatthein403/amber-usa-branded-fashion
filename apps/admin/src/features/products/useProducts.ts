import { useState, useEffect, useMemo, useCallback } from 'react';
import { useFetch, useDelete } from '../../hooks/useCrud';
import { API_ROUTES } from '../../config/constants';
import { apiService } from '../../services/api.service';
import type { Category } from '@amber/shared';
import { Product, Variant, Brand, Sale, Meta, Collection, Warehouse, ProductWithRelations } from './schema';

export const useProducts = () => {
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState({
    status: '' as '' | 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
    categoryId: '',
    brandId: '',
    onSale: null as boolean | null,
    isFeatured: null as boolean | null,
    isNewArrival: null as boolean | null,
    isBestSeller: null as boolean | null,
  });

  // Debounce search effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to first page on search
    }, 500);

    return () => clearTimeout(handler);
  }, [search]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [filters]);

  const { data: categories } = useFetch<Category>(`${API_ROUTES.CATEGORIES.BASE}?limit=100`);
  const { data: brands } = useFetch<Brand>(API_ROUTES.BRANDS.BASE);
  const { data: collections } = useFetch<Collection>(API_ROUTES.COLLECTIONS.BASE);
  const { data: warehouses } = useFetch<Warehouse>(API_ROUTES.LOGISTICS.WAREHOUSES);
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
      if (filters.status) params.append('status', filters.status);
      if (filters.categoryId) params.append('categoryId', filters.categoryId);
      if (filters.brandId) params.append('brandId', filters.brandId);
      if (filters.onSale !== null) params.append('onSale', filters.onSale.toString());
      if (filters.isFeatured !== null) params.append('isFeatured', filters.isFeatured.toString());
      if (filters.isNewArrival !== null) params.append('isNewArrival', filters.isNewArrival.toString());
      if (filters.isBestSeller !== null) params.append('isBestSeller', filters.isBestSeller.toString());

      const response = await apiService<unknown, { data: ProductWithRelations[]; meta: Meta }>(`${API_ROUTES.PRODUCTS.BASE}?${params.toString()}`);
      setProducts(response.data || []);
      setMeta(response.meta || null);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const [modalOpen, setModalOpen] = useState(false);
  const [mediaSelectorOpen, setMediaSelectorOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
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
    currency: 'USD' as 'USD' | 'MMK' | 'THB',
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
    saleId: '',
    collectionIds: [] as string[]
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

  const warehouseList = useMemo(() => warehouses || [], [warehouses]);

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

  const addBulkVariants = (variants: Partial<Variant>[]) => {
    const variantsToAdd: Variant[] = variants.map(v => ({
      id: v.id || Math.random().toString(36).substr(2, 9),
      sku: v.sku || '',
      barcode: v.barcode,
      size: v.size || '',
      color: v.color || '',
      stock: v.stock || 0,
      lowStockThreshold: v.lowStockThreshold || 5,
      price: v.price,
      compareAtPrice: v.compareAtPrice,
      weight: v.weight || 0,
      images: v.images || [],
      isPreOrder: v.isPreOrder || false,
      warehouseId: (v as any).warehouseId
    }));
    setCurrentVariants(prev => [...prev, ...variantsToAdd]);
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
      const endpoint = editingProduct?.id 
        ? API_ROUTES.PRODUCTS.BY_ID(editingProduct.id) 
        : API_ROUTES.PRODUCTS.BASE;
      
      const method = editingProduct ? 'PATCH' : 'POST';
      
      // Explicitly pick only fields allowed by the schema to prevent 400 Bad Request
      const payload = {
        name: productForm.name,
        slug: productForm.slug,
        status: productForm.status || 'DRAFT',
        brandId: productForm.brandId || undefined,
        shortDescription: productForm.shortDescription || undefined,
        description: productForm.description || undefined,
        note: productForm.note || undefined,
        tags: productForm.tags || [],
        metaTitle: productForm.metaTitle || undefined,
        metaDescription: productForm.metaDescription || undefined,
        price: productForm.price?.toString(),
        compareAtPrice: productForm.compareAtPrice?.toString() || undefined,
        isUsdPrice: productForm.isUsdPrice ?? true,
        isFeatured: productForm.isFeatured ?? false,
        onSale: productForm.onSale ?? false,
        isNewArrival: productForm.isNewArrival ?? false,
        isBestSeller: productForm.isBestSeller ?? false,
        isPreOrder: productForm.isPreOrder ?? false,
        preOrderShippingDate: productForm.preOrderShippingDate || undefined,
        preOrderNote: productForm.preOrderNote || undefined,
        images: productForm.images || [],
        categoryId: productForm.categoryId || undefined,
        saleId: productForm.saleId || undefined,
        collectionIds: productForm.collectionIds || [],
        variants: currentVariants.map(v => ({
          sku: v.sku,
          barcode: v.barcode || undefined,
          size: v.size,
          color: v.color,
          stock: Number(v.stock),
          lowStockThreshold: Number(v.lowStockThreshold || 5),
          price: v.price ? Number(v.price) : undefined,
          compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : undefined,
          weight: v.weight ? Number(v.weight) : undefined,
          images: v.images || [],
          isPreOrder: v.isPreOrder ?? false,
          preOrderShippingDate: v.preOrderShippingDate || undefined
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
      price: String(product.price),
      compareAtPrice: String(product.compareAtPrice || ''),
      currency: (product as any).currency || 'USD',
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
      saleId: product.saleId || '',
      collectionIds: (product as any).collectionIds || []
    });
    setCurrentVariants(product.variants || []);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    const success = await deleteItem(deletingId);
    setDeleteConfirmOpen(false);
    setDeletingId(null);
    if (success) fetchProducts();
  };

  const cancelDelete = () => {
    setDeleteConfirmOpen(false);
    setDeletingId(null);
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      categoryId: '',
      brandId: '',
      onSale: null,
      isFeatured: null,
      isNewArrival: null,
      isBestSeller: null,
    });
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
    filters,
    setFilters,
    clearFilters,
    categories,
    brands,
    collections,
    warehouseList,
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
    addBulkVariants,
    handleEditVariant,
    handleDeleteVariant,
    handleProductSubmit,
    handleDelete,
    openEditModal,
    resetForm,
    refresh: fetchProducts,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    confirmDelete,
    cancelDelete,
    deletingId
  };
};
