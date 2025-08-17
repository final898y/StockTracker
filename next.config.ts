import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['lightweight-charts'],
  },
  images: {
    domains: ['assets.coingecko.com'], // For crypto logos
  },
  // Enable static optimization
  output: 'standalone',
};

export default nextConfig;
