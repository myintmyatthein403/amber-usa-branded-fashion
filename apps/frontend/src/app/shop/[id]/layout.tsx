import type { Metadata } from "next";
import { getApiUrl } from "@/lib/api";
import { getSiteUrl } from "@/lib/seo";
import { productApiPath, isProductPurchasable } from "@/lib/product";
import ProductJsonLd from "@/components/ProductJsonLd";

type Props = {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
};

async function fetchProduct(ref: string) {
  try {
    const res = await fetch(`${getApiUrl()}${productApiPath(ref)}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const result = await res.json();
    return result?.data ?? result;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await fetchProduct(id);
  if (!product) {
    return { title: "Product | Amber Brand Fashion" };
  }
  const canonicalUrl = `${getSiteUrl()}/shop/${product.slug || product.id}`;
  return {
    title: product.metaTitle || `${product.name} | Amber Brand Fashion`,
    description:
      product.metaDescription ||
      product.shortDescription ||
      `Shop ${product.name} at Amber Brand Fashion`,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: "website",
      title: product.metaTitle || product.name,
      description: product.metaDescription || product.shortDescription || undefined,
      url: canonicalUrl,
      images: product.images?.[0] ? [{ url: product.images[0] }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: product.metaTitle || product.name,
      description: product.metaDescription || product.shortDescription || undefined,
      images: product.images?.[0] ? [product.images[0]] : undefined,
    },
  };
}

export default async function ProductLayout({ params, children }: Props) {
  const { id } = await params;
  const product = await fetchProduct(id);
  const siteUrl = getSiteUrl();

  return (
    <>
      {product && (
        <ProductJsonLd
          name={product.name}
          description={product.metaDescription || product.shortDescription}
          image={product.images?.[0]}
          price={product.price}
          currency={product.currencyCode || "USD"}
          sku={product.variants?.[0]?.sku}
          brand={product.brand?.name}
          inStock={isProductPurchasable(product)}
          url={`${siteUrl}/shop/${product.slug || product.id}`}
          avgRating={product.avgRating}
          reviewCount={product.reviewCount}
          breadcrumbs={[
            { name: "Home", url: `${siteUrl}/` },
            { name: "Shop", url: `${siteUrl}/shop` },
            ...(product.category?.name
              ? [{ name: product.category.name, url: `${siteUrl}/shop?category=${product.category.id}` }]
              : []),
            { name: product.name, url: `${siteUrl}/shop/${product.slug || product.id}` },
          ]}
        />
      )}
      {children}
    </>
  );
}
