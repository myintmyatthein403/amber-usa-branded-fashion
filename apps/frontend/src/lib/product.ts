const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isProductUuid(ref: string): boolean {
  return UUID_RE.test(ref);
}

export function productApiPath(ref: string): string {
  return isProductUuid(ref) ? `/products/${ref}` : `/products/slug/${ref}`;
}
