
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
 
const withNextIntl = createNextIntlPlugin('./src/i18n.ts');
 
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
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'handlebars': 'handlebars/dist/handlebars.js',
    };
    return config
  },
  experimental: {
    // This is required for Genkit flows to work.
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // This is required to allow cross-origin requests in the dev environment.
    allowedDevOrigins: ["https://6000-firebase-studio-1753878008610.cluster-cbeiita7rbe7iuwhvjs5zww2i4.cloudworkstations.dev"]
  },
};
 
export default withNextIntl(nextConfig);
