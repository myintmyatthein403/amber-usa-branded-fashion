import type { Product } from "@amber/shared";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isProductUuid(ref: string): boolean {
  return UUID_RE.test(ref);
}

export function productApiPath(ref: string): string {
  return isProductUuid(ref) ? `/products/${ref}` : `/products/slug/${ref}`;
}

type StockAwareVariant = { stock?: number };
type StockAwareProduct = {
  stock?: Product["stock"];
  isPreOrder?: Product["isPreOrder"];
  visibility?: string;
  variants?: StockAwareVariant[] | null;
};

export function getProductStock(
  product: StockAwareProduct,
  selectedVariant?: StockAwareVariant | null,
): number {
  if (selectedVariant) return selectedVariant.stock ?? 0;
  if (product.variants && product.variants.length > 0) {
    return product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
  }
  return product.stock ?? 0;
}

export function isProductPurchasable(
  product: StockAwareProduct,
  selectedVariant?: StockAwareVariant | null,
): boolean {
  if (product.isPreOrder || product.visibility === "PRE_ORDER_ONLY") return true;
  return getProductStock(product, selectedVariant) > 0;
}

export function resolveAttributeValues(
  productAttributes: Array<{ id: string; values: Array<{ id: string; value: string }> }>,
  selections?: Record<string, string> | null,
): string[] {
  if (!selections) return [];
  return productAttributes
    .map((attr) => attr.values.find((v) => v.id === selections[attr.id])?.value)
    .filter((v): v is string => Boolean(v));
}
