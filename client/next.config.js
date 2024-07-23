const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB limit
});

const nextConfig = withPWA({
  basePath: process.env.BASEPATH,
  reactStrictMode: false,
  experimental: {
    turboMode: false,
    reactServerComponents: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
});

module.exports = nextConfig;
