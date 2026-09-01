const CLOUDINARY_HOST = "res.cloudinary.com";

// Next.js's own image optimizer is disabled app-wide (next.config.ts,
// unoptimized: true) because product images can come from arbitrary
// external hosts (admins can paste any URL — see EditorialImagery.tsx), so
// a remotePatterns allowlist isn't viable. This is the complementary fix
// for the majority of images that *are* Cloudinary-hosted: append Cloudinary's
// own delivery-time transforms (auto format/quality + a width cap) instead.
// Any URL not on res.cloudinary.com is returned unchanged.
export function cloudinaryDeliveryUrl(url: string, options: { width?: number } = {}): string {
  if (!url) return url;
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== CLOUDINARY_HOST) return url;

    const marker = "/upload/";
    const idx = url.indexOf(marker);
    if (idx === -1) return url;

    const transforms = ["f_auto", "q_auto"];
    if (options.width) transforms.push(`w_${options.width}`);

    const insertAt = idx + marker.length;
    return `${url.slice(0, insertAt)}${transforms.join(",")}/${url.slice(insertAt)}`;
  } catch {
    return url;
  }
}
