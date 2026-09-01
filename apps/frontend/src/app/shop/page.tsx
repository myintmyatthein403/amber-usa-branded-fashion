import type { Metadata } from "next";
import { getApiUrl } from "@/lib/api";
import ShopClient from "./ShopClient";

type Props = {
  searchParams: Promise<{ category?: string; search?: string; brand?: string }>;
};

interface CategoryMeta {
  id: string;
  name: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  description?: string | null;
}

async function fetchCategory(categoryId: string): Promise<CategoryMeta | null> {
  try {
    const res = await fetch(`${getApiUrl()}/categories`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const result = await res.json();
    const categories: CategoryMeta[] = result?.data ?? result ?? [];
    return categories.find((c) => c.id === categoryId) ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { category, search } = await searchParams;

  if (search) {
    return {
      title: `Search: ${search} | Amber Brand Fashion`,
      description: `Search results for "${search}" at Amber Brand Fashion.`,
    };
  }

  if (category) {
    const cat = await fetchCategory(category);
    if (cat) {
      const title = cat.metaTitle || `${cat.name} | Amber Brand Fashion`;
      const description =
        cat.metaDescription || cat.description || `Shop ${cat.name} at Amber Brand Fashion.`;
      return {
        title,
        description,
        openGraph: { title, description },
      };
    }
  }

  return {
    title: "Shop | Amber Brand Fashion",
    description: "Browse authentic USA brand fashion at Amber Brand Fashion.",
  };
}

export default function ShopPage() {
  return <ShopClient />;
}
