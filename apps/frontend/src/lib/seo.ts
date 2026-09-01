// Absolute site origin used for sitemap/robots/canonical URLs and JSON-LD.
// Set NEXT_PUBLIC_SITE_URL in production; falls back to localhost for dev,
// mirroring how NEXT_PUBLIC_API_URL is handled in lib/api.ts.
export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}
