"use client";

import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBag,
  Heart,
  Star,
  ShieldCheck,
  Truck,
  ArrowLeft,
  Share2,
  Scale,
  Ruler,
  Check,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useMemo, useEffect } from "react";
import SizeGuideModal from "@/components/modals/SizeGuideModal";
import ProductReviews from "@/components/ProductReviews";
import { useStore } from "@/store/useStore";
import DOMPurify from "dompurify";
import Price from "@/components/Price";
import { getApiUrl } from "@/lib/api";
import { productApiPath } from "@/lib/product";
import { useTranslations } from "@/i18n/useTranslations";
import type { ApiProduct, ApiReview, Product } from "@amber/shared";

interface FilterableAttribute {
  id: string;
  name: string;
  slug: string;
  type: string;
  values: Array<{
    id: string;
    value: string;
    slug: string;
    hexColor?: string | null;
  }>;
}

interface VariantInventory {
  quantity: number;
  warehouse?: { location?: string; name?: string };
}

interface DetailVariant {
  id: string;
  sku?: string;
  size?: string;
  color?: string;
  stock: number;
  price?: number | string | null;
  images?: string[];
  attributeSelections?: Record<string, string> | null;
  inventory?: VariantInventory[];
}

interface RelatedProduct {
  id: string;
  name: string;
  price: number;
  isUsdPrice: boolean;
  images: string[];
  onSale?: boolean;
}

export default function ProductDetailPage() {
  const params = useParams();
  const ref = params.id as string;
  const t = useTranslations();

  const [product, setProduct] = useState<(ApiProduct & { variants?: DetailVariant[] }) | null>(
    null,
  );
  const [filterableAttributes, setFilterableAttributes] = useState<FilterableAttribute[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState("description");
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [sanitizedDescription, setSanitizedDescription] = useState("");
  const [userSelectedImage, setUserSelectedImage] = useState<string | null>(null);

  const addToCart = useStore((state) => state.addToCart);
  const addToCompare = useStore((state) => state.addToCompare);
  const market = useStore((state) => state.market);
  const locale = useStore((state) => state.locale);

  const productAttributes = useMemo(() => {
    if (!product?.variants?.length || !filterableAttributes.length) return [];
    const usedIds = new Set<string>();
    (product.variants as DetailVariant[]).forEach((v) => {
      Object.keys(v.attributeSelections || {}).forEach((k) => usedIds.add(k));
    });
    return filterableAttributes.filter((a) => usedIds.has(a.id));
  }, [product, filterableAttributes]);

  const selectedVariant = useMemo(() => {
    if (!product?.variants?.length) return null;
    const required = productAttributes.map((a) => a.id);
    if (required.some((id) => !selectedAttributes[id])) return null;
    return (
      (product.variants as DetailVariant[]).find((v) =>
        required.every(
          (attrId) => v.attributeSelections?.[attrId] === selectedAttributes[attrId],
        ),
      ) ?? null
    );
  }, [product, productAttributes, selectedAttributes]);

  const variantStock = useMemo(() => {
    if (selectedVariant) return selectedVariant.stock ?? 0;
    if (!product?.variants?.length) return 0;
    return product.variants.reduce((acc, v) => acc + (v.stock || 0), 0);
  }, [selectedVariant, product]);

  const warehouseLocation = market === "US" ? "USA" : "MYANMAR";

  const warehouseStock = useMemo(() => {
    if (!selectedVariant?.inventory?.length) return variantStock;
    const row = selectedVariant.inventory.find(
      (i) => i.warehouse?.location === warehouseLocation,
    );
    return row?.quantity ?? selectedVariant.stock ?? 0;
  }, [selectedVariant, warehouseLocation, variantStock]);

  const canAddToBag =
    product &&
    (product.isPreOrder || warehouseStock > 0) &&
    (productAttributes.length === 0 || Boolean(selectedVariant));

  const activeImage = useMemo(() => {
    if (!product) return "";
    if (userSelectedImage) return userSelectedImage;
    if (selectedVariant?.images?.length) return selectedVariant.images[0];
    if (product.images?.length) return product.images[0];
    return "";
  }, [product, selectedVariant, userSelectedImage]);

  const allImages = useMemo(() => {
    if (!product) return [];
    const images = [...(product.images || [])];
    product.variants?.forEach((v) => {
      v.images?.forEach((img) => {
        if (!images.includes(img)) images.push(img);
      });
    });
    return images;
  }, [product]);

  const dateLocale = locale === "my" ? "my-MM" : "en-US";

  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        const res = await fetch(`${getApiUrl()}/attributes/public`);
        const result = await res.json();
        setFilterableAttributes(
          (Array.isArray(result) ? result : result?.data ?? []) as FilterableAttribute[],
        );
      } catch {
        setFilterableAttributes([]);
      }
    };
    fetchAttributes();
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${getApiUrl()}${productApiPath(ref)}`);
        if (!res.ok) throw new Error("Product not found");
        const result = await res.json();
        const productData = (result.data ?? result) as ApiProduct & {
          variants?: DetailVariant[];
        };
        setProduct(productData);
        if (typeof window !== "undefined") {
          const defaultDesc =
            "Indulge in the elegance of authentic global fashion. Each piece is sourced directly from USA outlets to guarantee quality and authenticity.";
          setSanitizedDescription(
            DOMPurify.sanitize(productData.description || defaultDesc),
          );
        }
        if (productData.brandId) {
          const relatedRes = await fetch(
            `${getApiUrl()}/products?brandId=${productData.brandId}&limit=4`,
          );
          const relatedResult = await relatedRes.json();
          const list = (relatedResult?.data ?? relatedResult ?? []) as RelatedProduct[];
          setRelatedProducts(
            list.filter((p) => p.id !== productData.id).slice(0, 4),
          );
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setLoading(false);
      }
    };
    if (ref) fetchProduct();
  }, [ref]);

  useEffect(() => {
    setUserSelectedImage(null);
  }, [selectedAttributes]);

  const handleAddToCart = () => {
    if (!product) return;
    if (productAttributes.length > 0 && !selectedVariant) {
      alert(t("product.selectOptions"));
      return;
    }
    setAddingId(product.id);
    const added = addToCart(
      product as unknown as Product,
      selectedVariant?.size || undefined,
      selectedVariant?.id,
      product.isPreOrder,
      product.preOrderShippingDate || undefined,
      selectedVariant?.color || undefined,
      selectedVariant?.price ? Number(selectedVariant.price) : undefined,
      selectedVariant?.images?.[0] || undefined,
      (product as { currencyCode?: string }).currencyCode,
    );
    if (added) setTimeout(() => setAddingId(null), 1000);
  };

  if (loading) {
    return (
      <main className="relative min-h-screen bg-[#FDFDFD]">
        <Navbar />
        <div className="pt-48 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-[#D4AF37]" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]/40">
            Fetching Product Details...
          </p>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="relative min-h-screen bg-[#FDFDFD]">
        <Navbar />
        <div className="pt-48 flex flex-col items-center justify-center min-h-[60vh] space-y-6">
          <h1 className="text-4xl font-serif text-[#1A1A1A]">Product Not Found</h1>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-8 py-3 bg-[#1A1A1A] text-white text-[10px] font-bold uppercase tracking-widest"
          >
            Go Back
          </button>
        </div>
      </main>
    );
  }

  const displayPrice = selectedVariant?.price ?? product.price;
  const reviews = product.reviews ?? [];

  return (
    <main className="relative min-h-screen bg-[#FDFDFD]">
      <Navbar />
      <SizeGuideModal isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />

      <section className="pt-48 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="flex items-center space-x-2 text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]/40 hover:text-[#1A1A1A] transition-colors mb-12"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Shop</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          <div className="flex flex-col gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative aspect-[4/5] bg-[#F5F0E1] overflow-hidden rounded-sm w-full"
            >
              {activeImage ? (
                <Image
                  src={activeImage}
                  alt={product.name}
                  fill
                  className="object-cover transition-all duration-700"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <span className="text-sm">No Image</span>
                </div>
              )}
              {product.onSale && (
                <div className="absolute top-8 right-8 bg-red-500 text-white px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] shadow-xl rounded-full">
                  -
                  {Math.round(
                    (1 -
                      Number(product.price) /
                        Number(product.compareAtPrice || product.price)) *
                      100,
                  )}
                  % Off
                </div>
              )}
            </motion.div>

            {allImages.length > 1 && (
              <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setUserSelectedImage(img)}
                    className={cn(
                      "relative aspect-[4/5] w-20 lg:w-28 flex-shrink-0 bg-[#F5F0E1] overflow-hidden rounded-sm border transition-all duration-300",
                      activeImage === img
                        ? "border-[#D4AF37] ring-1 ring-[#D4AF37]"
                        : "border-transparent opacity-60 hover:opacity-100",
                    )}
                  >
                    <Image src={img} alt={`${product.name} ${idx}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[#D4AF37] text-[10px] uppercase font-bold tracking-[0.4em] mb-2 block">
                      {product.category?.name}
                    </span>
                    <h1 className="text-4xl md:text-5xl font-serif text-[#1A1A1A]">
                      {product.name}
                    </h1>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => addToCompare(product as unknown as Product)}
                      className="p-3 border border-[#1A1A1A]/5 rounded-full hover:bg-white hover:shadow-md transition-all text-[#1A1A1A]/40 hover:text-[#D4AF37]"
                    >
                      <Scale className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      className="p-3 border border-[#1A1A1A]/5 rounded-full hover:bg-white hover:shadow-md transition-all text-[#1A1A1A]/40 hover:text-[#D4AF37]"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <Price
                    amount={displayPrice}
                    isUsdPrice={product.isUsdPrice}
                    className="text-3xl text-[#D4AF37] font-bold"
                    showRateHint
                  />
                  {product.onSale && product.compareAtPrice && (
                    <Price
                      amount={product.compareAtPrice}
                      isUsdPrice={product.isUsdPrice}
                      className="text-lg text-[#1A1A1A]/30 font-bold line-through"
                    />
                  )}
                  <div className="w-px h-4 bg-[#1A1A1A]/10" />
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 text-[#D4AF37] fill-[#D4AF37]" />
                      ))}
                    </div>
                    <span className="text-[10px] text-[#1A1A1A]/40 font-bold tracking-widest uppercase">
                      {reviews.length > 0
                        ? `${(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)} (${reviews.length})`
                        : "No reviews yet"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-[#F5F0E1]/40 border border-[#D4AF37]/10 p-4 rounded-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
                  {market === "US" ? t("product.fulfillmentUs") : t("product.fulfillmentMm")}
                </p>
                <p className="text-xs text-[#1A1A1A]/50 mt-1">
                  {warehouseStock > 0
                    ? `${warehouseStock} available from ${warehouseLocation} warehouse`
                    : product.isPreOrder
                      ? "Available for pre-order"
                      : "Currently out of stock at selected warehouse"}
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex border-b border-[#1A1A1A]/5">
                  {["description", "details", "shipping"].map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "pb-4 px-6 text-[10px] font-bold uppercase tracking-widest transition-all relative",
                        activeTab === tab
                          ? "text-[#1A1A1A]"
                          : "text-[#1A1A1A]/30 hover:text-[#1A1A1A]/60",
                      )}
                    >
                      {tab}
                      {activeTab === tab && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4AF37]"
                        />
                      )}
                    </button>
                  ))}
                </div>

                <div className="min-h-[100px] py-4 text-sm text-[#1A1A1A]/60 leading-relaxed font-sans prose">
                  {activeTab === "description" && (
                    <div
                      dangerouslySetInnerHTML={{
                        __html:
                          sanitizedDescription ||
                          "Indulge in the elegance of authentic global fashion.",
                      }}
                    />
                  )}
                  {activeTab === "details" && (
                    <ul className="space-y-2">
                      {(product.detail || "")
                        .split("\n")
                        .filter(Boolean)
                        .map((item, i) => (
                          <li key={i} className="flex items-center space-x-3">
                            <div className="w-1 h-1 bg-[#D4AF37] rounded-full" />
                            <span>{item}</span>
                          </li>
                        ))}
                    </ul>
                  )}
                  {activeTab === "shipping" && (
                    <p>
                      {market === "US"
                        ? "USA warehouse fulfillment. Standard domestic delivery 3–7 business days."
                        : "Myanmar warehouse fulfillment. Yangon 1–2 days; regional 3–5 business days."}
                    </p>
                  )}
                </div>
              </div>

              {productAttributes.length > 0 && (
                <div className="space-y-6">
                  {productAttributes.map((attr) => (
                    <div key={attr.id} className="space-y-3">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]">
                        {attr.name}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {attr.values.map((val) => {
                          const isSelected = selectedAttributes[attr.id] === val.id;
                          const isColor = attr.type === "color";
                          return (
                            <button
                              key={val.id}
                              type="button"
                              onClick={() =>
                                setSelectedAttributes((prev) => ({
                                  ...prev,
                                  [attr.id]: val.id,
                                }))
                              }
                              className={cn(
                                "flex items-center gap-2 border px-3 py-2 rounded-sm bg-white transition-all text-[10px] font-medium uppercase tracking-widest",
                                isSelected
                                  ? "border-[#D4AF37] shadow-sm text-[#1A1A1A]"
                                  : "border-[#1A1A1A]/10 text-[#1A1A1A]/50",
                              )}
                            >
                              {isColor && (
                                <span
                                  className="w-4 h-4 rounded-full border border-[#1A1A1A]/10"
                                  style={{
                                    backgroundColor: val.hexColor || "#D4AF37",
                                  }}
                                />
                              )}
                              {val.value}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  {productAttributes.some((a) => a.slug === "size" || a.name.toLowerCase().includes("size")) && (
                    <button
                      type="button"
                      onClick={() => setIsSizeGuideOpen(true)}
                      className="flex items-center space-x-2 text-[10px] text-[#D4AF37] font-bold uppercase tracking-widest"
                    >
                      <Ruler className="w-3 h-3" />
                      <span>Size Guide</span>
                    </button>
                  )}
                </div>
              )}

              <div className="pt-8 space-y-4">
                {product.isPreOrder && (
                  <div className="bg-[#D4AF37]/10 p-4 border border-[#D4AF37]/20 rounded-sm">
                    <h5 className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4" /> Pre-Order Item
                    </h5>
                    {product.preOrderShippingDate && (
                      <p className="text-xs text-[#1A1A1A]/60 mt-2">
                        Expected Shipping:{" "}
                        <span className="font-bold text-[#1A1A1A]">
                          {new Date(product.preOrderShippingDate).toLocaleDateString(dateLocale, {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </p>
                    )}
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    type="button"
                    disabled={!canAddToBag || addingId === product.id}
                    onClick={handleAddToCart}
                    className={cn(
                      "flex-1 py-5 uppercase tracking-[0.2em] text-xs font-bold transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center space-x-4 shadow-xl disabled:opacity-50",
                      addingId === product.id
                        ? "bg-[#D4AF37] text-white"
                        : "bg-[#1A1A1A] text-white hover:bg-[#D4AF37]",
                    )}
                  >
                    {addingId === product.id ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <ShoppingBag className="w-5 h-5" />
                    )}
                    <span>
                      {addingId === product.id
                        ? t("cart.added")
                        : product.isPreOrder
                          ? t("product.preOrder")
                          : !canAddToBag
                            ? t("product.outOfStock")
                            : t("product.addToBag")}
                    </span>
                  </button>
                  <button
                    type="button"
                    className="w-16 h-16 border border-[#1A1A1A]/10 flex items-center justify-center text-[#1A1A1A]/40 hover:text-red-500 hover:border-red-500 transition-all group"
                  >
                    <Heart className="w-6 h-6 group-hover:fill-red-500" />
                  </button>
                </div>
              </div>

              <div className="pt-12 grid grid-cols-2 gap-8 border-t border-[#1A1A1A]/5">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-[#F5F0E1] flex items-center justify-center rounded-full">
                    <Truck className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]">
                      Fast Delivery
                    </h5>
                    <p className="text-[10px] text-[#1A1A1A]/40">
                      {market === "US" ? "3–7 days (USA)" : "1–2 days Yangon"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-[#F5F0E1] flex items-center justify-center rounded-full">
                    <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]">
                      Legitimacy
                    </h5>
                    <p className="text-[10px] text-[#1A1A1A]/40">100% Authentic Brands</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <ProductReviews reviews={reviews as ApiReview[]} />

      {relatedProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 md:px-12 pb-24">
          <h2 className="text-3xl font-serif text-center mb-12">{t("product.related")}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {relatedProducts.map((rp) => (
              <Link key={rp.id} href={`/shop/${rp.id}`} className="group space-y-4">
                <div className="relative aspect-[3/4] bg-[#F5F0E1] overflow-hidden">
                  <Image
                    src={rp.images?.[0] || "/placeholder.png"}
                    alt={rp.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <h3 className="text-sm font-serif text-center group-hover:text-[#D4AF37] transition-colors">
                  {rp.name}
                </h3>
                <Price
                  amount={rp.price}
                  isUsdPrice={rp.isUsdPrice}
                  className="text-sm text-[#D4AF37] font-bold block text-center"
                />
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
