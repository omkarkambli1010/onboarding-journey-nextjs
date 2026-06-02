import type { NextConfig } from 'next';

// Deployment sub-path (Angular's base-href equivalent) so routes, _next assets
// and next/image are prefixed with it. Set per environment via the env files:
//   UAT  → NEXT_PUBLIC_BASE_PATH=/diynri          (udn.sbisecurities.in/diynri/)
//   PROD → NEXT_PUBLIC_BASE_PATH=/open-nri-account (diy.sbisecurities.in/open-nri-account/)
// Defaults to '' (root) when unset, so local dev runs at http://localhost:<port>/
// without any prefix. The build:uat / build:prod scripts inject the value above.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  // Exposed to the client so raw `/assets/...` URLs can be prefixed where needed.
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
  sassOptions: {
    includePaths: ['./src'],
  },
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
