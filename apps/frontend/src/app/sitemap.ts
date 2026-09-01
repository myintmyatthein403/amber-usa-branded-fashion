import type { MetadataRoute } from "next";
import { getApiUrl } from "@/lib/api";
import { getSiteUrl } from "@/lib/seo";

interface SitemapProduct {
  id: string;
  slug?: string;
  updatedAt?: string;
}

interface SitemapCategory {
  id: string;
  slug: string;
  updatedAt?: string;
}

async function fetchProducts(): Promise<SitemapProduct[]> {
  try {
    // Single-page fetch sized for the current catalog; if the catalog grows
    // well beyond this, switch to looping over `page` until an empty page
    // is returned.
    const res = await fetch(`${getApiUrl()}/products?limit=1000`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const result = await res.json();
    return result?.data ?? result ?? [];
  } catch {
    return [];
  }
}

async function fetchCategories(): Promise<SitemapCategory[]> {
  try {
    const res = await fetch(`${getApiUrl()}/categories`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const result = await res.json();
    return result?.data ?? result ?? [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const [products, categories] = await Promise.all([fetchProducts(), fetchCategories()]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/shop`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/gift-cards`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${siteUrl}/track`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${siteUrl}/privacy-policy`, changeFrequency: "yearly", priority: 0.1 },
    { url: `${siteUrl}/terms-and-conditions`, changeFrequency: "yearly", priority: 0.1 },
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${siteUrl}/shop/${p.slug || p.id}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : undefined,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${siteUrl}/shop?category=${c.id}`,
    lastModified: c.updatedAt ? new Date(c.updatedAt) : undefined,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes, ...categoryRoutes];
}
