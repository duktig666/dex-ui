import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'based.one',
        pathname: '/**',
      },
    ],
    // Allow local images
    unoptimized: false,
  },
};

export default nextConfig;
