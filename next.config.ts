import type { NextConfig } from 'next';

// Production builds for measuring/recording use NEXT_DIST=.next-prod so they never overwrite the dev server's .next folder.
const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST || '.next',
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [480, 768, 1080, 1440, 1920, 2400],
    qualities: [70, 78, 85],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  poweredByHeader: false,
};

export default nextConfig;
