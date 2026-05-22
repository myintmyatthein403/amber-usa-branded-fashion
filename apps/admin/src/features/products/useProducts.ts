import { useState, useEffect, useMemo, useCallback } from 'react';
import { useFetch, useDelete } from '../../hooks/useCrud';
import { API_ROUTES } from '../../config/constants';
import { apiService } from '../../services/api.service';
import { toast } from '../../store/useToastStore';
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

  // Apply brand filter when navigating from Brands page
  useEffect(() => {
    try {
      const raw = localStorage.getItem('admin-product-filters');
      if (!raw) return;
      const parsed = JSON.parse(raw) as { brandId?: string };
      localStorage.removeItem('admin-product-filters');
      if (parsed.brandId) {
        setFilters((prev) => ({ ...prev, brandId: parsed.brandId! }));
      }
    } catch {
      localStorage.removeItem('admin-product-filters');
    }
  }, []);

  const { data: categories } = useFetch<Category>(`${API_ROUTES.CATEGORIES.BASE}?limit=100`);
  const { data: brands } = useFetch<Brand>(`${API_ROUTES.BRANDS.BASE}?limit=100`);
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
  const [mediaTarget, setMediaTarget] = useState<'product' | 'variant'>('product');
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
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
    currencyCode: 'USD' as 'USD' | 'MMK' | 'THB',
    isUsdPrice: true,
    nameMy: '',
    descriptionMy: '',
    publishAt: '',
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
  const emptyNewVariant = () => ({
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
    buyPrice: '',
    currencyCode: 'USD' as 'USD' | 'MMK' | 'THB',
    warehouseAllocations: [] as { warehouseId: string; quantity: number }[],
    isPreOrder: false,
    attributeSelections: {} as Record<string, string>,
  });

  const [newVariant, setNewVariant] = useState(emptyNewVariant());

  const warehouseList = useMemo(() => warehouses || [], [warehouses]);

  const addVariant = (overrides?: Partial<typeof newVariant>) => {
    const source = { ...newVariant, ...overrides };
    const allocations =
      source.warehouseAllocations && source.warehouseAllocations.length > 0
        ? source.warehouseAllocations
        : source.warehouseId
          ? [{ warehouseId: source.warehouseId, quantity: Number(source.stock) || 0 }]
          : undefined;

    const variantData: Variant & {
      warehouseId?: string;
      warehouseAllocations?: { warehouseId: string; quantity: number }[];
      buyPrice?: number;
      currencyCode?: string;
    } = {
      sku: source.sku,
      barcode: source.barcode,
      size: source.size,
      color: source.color,
      stock: Number(source.stock),
      lowStockThreshold: Number(source.lowStockThreshold),
      price: source.price ? Number(source.price) : undefined,
      compareAtPrice: source.compareAtPrice ? Number(source.compareAtPrice) : undefined,
      weight: source.weight ? Number(source.weight) : undefined,
      images: source.images,
      isPreOrder: source.isPreOrder,
      warehouseId: allocations?.length === 1 ? allocations[0].warehouseId : source.warehouseId || undefined,
      warehouseAllocations: allocations,
      buyPrice: source.buyPrice ? Number(source.buyPrice) : undefined,
      currencyCode: source.currencyCode || productForm.currencyCode || productForm.currency,
      attributeSelections:
        Object.keys(source.attributeSelections || {}).length > 0
          ? source.attributeSelections
          : undefined,
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
    setNewVariant(emptyNewVariant());
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
      warehouseId: (v as any).warehouseId,
      attributeSelections: v.attributeSelections,
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
      warehouseId: (variant as { warehouseId?: string }).warehouseId || '',
      buyPrice: (variant as { buyPrice?: number }).buyPrice?.toString() || '',
      currencyCode: ((variant as { currencyCode?: string }).currencyCode || productForm.currencyCode || 'USD') as 'USD' | 'MMK' | 'THB',
      warehouseAllocations: (variant as { warehouseAllocations?: { warehouseId: string; quantity: number }[] }).warehouseAllocations || [],
      isPreOrder: variant.isPreOrder || false,
      attributeSelections: (variant.attributeSelections as Record<string, string>) || {},
    });
  };

  const handleDeleteVariant = (id: string) => {
    setCurrentVariants(prev => prev.filter(v => v.id !== id));
  };

  const buildProductPayload = useCallback(() => {
    const currencyCode = (productForm.currencyCode || productForm.currency || 'USD') as 'USD' | 'MMK' | 'THB';
    return {
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
      currencyCode,
      isUsdPrice: currencyCode === 'USD',
      nameMy: productForm.nameMy || undefined,
      descriptionMy: productForm.descriptionMy || undefined,
      publishAt: productForm.publishAt || undefined,
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
      variants: currentVariants.map((v) => {
        const variant = v as Variant & {
          warehouseId?: string;
          warehouseAllocations?: { warehouseId: string; quantity: number }[];
          buyPrice?: number;
          currencyCode?: string;
        };
        return {
          ...(variant.id &&
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(variant.id)
            ? { id: variant.id }
            : {}),
          sku: variant.sku,
          barcode: variant.barcode || undefined,
          size: variant.size,
          color: variant.color,
          stock: Number(variant.stock),
          lowStockThreshold: Number(variant.lowStockThreshold || 5),
          price: variant.price ? Number(variant.price) : undefined,
          compareAtPrice: variant.compareAtPrice ? Number(variant.compareAtPrice) : undefined,
          weight: variant.weight ? Number(variant.weight) : undefined,
          images: variant.images || [],
          isPreOrder: variant.isPreOrder ?? false,
          preOrderShippingDate: variant.preOrderShippingDate || undefined,
          warehouseId: variant.warehouseId || undefined,
          warehouseAllocations: variant.warehouseAllocations?.length
            ? variant.warehouseAllocations
            : undefined,
          buyPrice: variant.buyPrice != null ? Number(variant.buyPrice) : undefined,
          currencyCode: variant.currencyCode || currencyCode,
          attributeSelections:
            variant.attributeSelections && Object.keys(variant.attributeSelections).length > 0
              ? variant.attributeSelections
              : undefined,
        };
      }),
    };
  }, [productForm, currentVariants]);

  // Auto-generate slug
  useEffect(() => {
    if (!editingProduct && productForm.name) {
      const slug = productForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setProductForm(prev => ({ ...prev, slug }));
    }
  }, [productForm.name, editingProduct]);

  // Debounced draft autosave when editing
  useEffect(() => {
    if (!editingProduct?.id || !modalOpen) return;

    const productId = editingProduct.id;
    const timer = setTimeout(async () => {
      try {
        await apiService(`${API_ROUTES.PRODUCTS.BY_ID(productId)}?draft=true`, {
          method: 'PATCH',
          body: buildProductPayload(),
        });
      } catch (error) {
        console.error('Draft autosave failed:', error);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [productForm, currentVariants, editingProduct?.id, modalOpen, buildProductPayload]);

  const openProductMedia = () => {
    setMediaTarget('product');
    setMediaSelectorOpen(true);
  };

  const openVariantMedia = () => {
    setMediaTarget('variant');
    setMediaSelectorOpen(true);
  };

  const handleMediaSelect = (url: string) => {
    if (mediaTarget === 'variant') {
      setNewVariant((prev) => ({ ...prev, images: [...prev.images, url] }));
    } else {
      setProductForm((prev) => ({ ...prev, images: [...prev.images, url] }));
    }
    setMediaSelectorOpen(false);
  };

  const handleProductSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const endpoint = editingProduct?.id 
        ? API_ROUTES.PRODUCTS.BY_ID(editingProduct.id) 
        : API_ROUTES.PRODUCTS.BASE;
      
      const method = editingProduct ? 'PATCH' : 'POST';
      const payload = buildProductPayload();

      await apiService(endpoint, {
        method,
        body: payload
      });

      setModalOpen(false);
      fetchProducts();
      resetForm();
      toast.success(editingProduct ? 'Product specifications refined' : 'Product successfully archived');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to save product';
      console.error('Failed to save product:', error);
      setSubmitError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setProductForm(initialProductForm);
    setCurrentVariants([]);
    setEditingProduct(null);
    setEditingVariant(null);
    setNewVariant(emptyNewVariant());
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
      currency: (((product as { currencyCode?: string }).currencyCode || 'USD') as 'USD' | 'MMK' | 'THB'),
      currencyCode: (((product as { currencyCode?: string }).currencyCode || 'USD') as 'USD' | 'MMK' | 'THB'),
      isUsdPrice: (product as { currencyCode?: string }).currencyCode
        ? (product as { currencyCode?: string }).currencyCode === 'USD'
        : product.isUsdPrice,
      nameMy: (product as { nameMy?: string }).nameMy || '',
      descriptionMy: (product as { descriptionMy?: string }).descriptionMy || '',
      publishAt: (product as { publishAt?: string }).publishAt
        ? new Date((product as { publishAt?: string }).publishAt!).toISOString().slice(0, 16)
        : '',
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
    if (success) {
      fetchProducts();
      toast.success('Product permanently removed');
    }
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
    mediaTarget,
    openProductMedia,
    openVariantMedia,
    handleMediaSelect,
    step,
    setStep,
    submitting,
    submitError,
    setSubmitError,
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
