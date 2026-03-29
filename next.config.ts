import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true, // Native equivalent of WP Rocket Enable Compression (GZIP/Brotli)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.lotterypost.com',
        pathname: '/images/logo/**',
      },
    ],
  },
  async headers() {
    return [
      {
        // Native equivalent of WP Rocket Browser Caching for static assets
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/(.*).svg',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
