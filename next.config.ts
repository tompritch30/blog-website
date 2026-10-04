import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // AVIF first, WebP as the fallback, for the photo and the paper plot.
  images: { formats: ["image/avif", "image/webp"] },
  // Posts moved from /blog to /writing in site v2; old links keep working (308, permanent).
  async redirects() {
    return [
      { source: "/blog", destination: "/writing", permanent: true },
      { source: "/blog/:slug", destination: "/writing/:slug", permanent: true },
      // The web CV was dropped on 4 Oct 2026; its address leads home.
      { source: "/cv", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
