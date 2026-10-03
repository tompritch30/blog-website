import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Posts moved from /blog to /writing in site v2; old links keep working (308, permanent).
  async redirects() {
    return [
      { source: "/blog", destination: "/writing", permanent: true },
      { source: "/blog/:slug", destination: "/writing/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
