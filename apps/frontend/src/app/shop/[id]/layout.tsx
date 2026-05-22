import type { Metadata } from "next";
import { getApiUrl } from "@/lib/api";
import { productApiPath } from "@/lib/product";
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
  return {
    title: product.metaTitle || `${product.name} | Amber Brand Fashion`,
    description:
      product.metaDescription ||
      product.shortDescription ||
      `Shop ${product.name} at Amber Brand Fashion`,
    openGraph: {
      title: product.metaTitle || product.name,
      description: product.metaDescription || product.shortDescription || undefined,
      images: product.images?.[0] ? [{ url: product.images[0] }] : undefined,
    },
  };
}

export default async function ProductLayout({ params, children }: Props) {
  const { id } = await params;
  const product = await fetchProduct(id);

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
          inStock={product.variants?.some((v: { stock: number }) => v.stock > 0)}
        />
      )}
      {children}
    </>
  );
}
