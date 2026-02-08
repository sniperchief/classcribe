/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  // Optimize production builds
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Enable gzip compression
  compress: true,
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // Reduce bundle size by only including needed modules
  modularizeImports: {
    '@anthropic-ai/sdk': {
      transform: '@anthropic-ai/sdk/{{member}}',
    },
  },
};

module.exports = nextConfig;
