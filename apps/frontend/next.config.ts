import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Admins can paste an arbitrary external image URL for a product
    // (see EditorialImagery.tsx's free-text URL input) — not just Cloudinary
    // uploads. That makes the set of hostnames unbounded, so a remotePatterns
    // allowlist breaks on every new host (confirmed in production: Nike's
    // CDN, Pexels, etc. alongside Cloudinary). unoptimized:true is the
    // correct setting for this data model, not an oversight.
    unoptimized: true,
  },
};

export default nextConfig;
