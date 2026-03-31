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
  async redirects() {
    return [
      {
        source: '/advanced-lottery-number-generator-board-lucky-number(/?)',
        destination: '/lucky-number-generator',
        permanent: true, // 301 redirect for SEO
      },
      {
        source: '/custom-lottery-luck-number-generator-create-own-lottery(/?)',
        destination: '/lucky-number-generator',
        permanent: true,
      },
      // You can add limitless regex patterns here to catch old WordPress paths!
      // Example: migrating /florida/fantasy-5/ to /results/fl/fantasy-5
      // {
      //   source: '/:state/:game', // WP Structure
      //   destination: '/results/:state/:game', // Next.js Structure
      //   permanent: true,
      // }
    ];
  },
};

export default nextConfig;
