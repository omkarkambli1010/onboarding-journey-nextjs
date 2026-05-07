import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
  sassOptions: {
    includePaths: ['./src'],
  },
  // Equivalent to Angular's base-href for deployment sub-paths
  // basePath: '/open-demat-account',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'diy.sbisecurities.in' },
      { protocol: 'https', hostname: 'udn.sbisecurities.in' },
      { protocol: 'https', hostname: 'www.figma.com' },
    ],
  },
  // PWA-style output
  output: 'standalone',
  // Webpack customization for crypto-js and node modules
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

export default nextConfig;
