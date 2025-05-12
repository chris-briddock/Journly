import type { NextConfig } from 'next/types';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow images from any HTTPS source
      },
      {
        protocol: 'http',
        hostname: '**', // Allow images from any HTTP source
      },
    ],
  },
  // Disable static generation for routes that use dynamic data
  staticPageGenerationTimeout: 120,
};

export default nextConfig;