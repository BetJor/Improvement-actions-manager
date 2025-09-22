
import type { NextConfig } from 'next';
 
const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        port: '',
        pathname: '/**',
      }
    ],
  },
  experimental: {
    // This is required for Genkit flows to work.
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};
 
export default nextConfig;
