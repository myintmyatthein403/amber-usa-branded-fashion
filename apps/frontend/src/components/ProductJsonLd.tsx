interface ProductJsonLdProps {
  name: string;
  description?: string | null;
  image?: string;
  price: number | string;
  currency?: string;
  sku?: string;
  brand?: string;
  inStock?: boolean;
  url?: string;
}

export default function ProductJsonLd({
  name,
  description,
  image,
  price,
  currency = "USD",
  sku,
  brand,
  inStock = true,
  url,
}: ProductJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: description || name,
    image: image ? [image] : undefined,
    sku,
    brand: brand ? { "@type": "Brand", name: brand } : undefined,
    offers: {
      "@type": "Offer",
      price: String(price),
      priceCurrency: currency,
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
