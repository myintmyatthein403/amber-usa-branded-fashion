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
  avgRating?: number | string | null;
  reviewCount?: number;
  breadcrumbs?: { name: string; url: string }[];
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
  avgRating,
  reviewCount,
  breadcrumbs,
}: ProductJsonLdProps) {
  const ratingValue = avgRating != null ? Number(avgRating) : 0;
  const hasReviews = (reviewCount ?? 0) > 0 && ratingValue > 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: description || name,
    image: image ? [image] : undefined,
    sku,
    brand: brand ? { "@type": "Brand", name: brand } : undefined,
    aggregateRating: hasReviews
      ? {
          "@type": "AggregateRating",
          ratingValue: ratingValue.toFixed(1),
          reviewCount,
        }
      : undefined,
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

  const breadcrumbJsonLd = breadcrumbs?.length
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs.map((crumb, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: crumb.name,
          item: crumb.url,
        })),
      }
    : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {breadcrumbJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      )}
    </>
  );
}
