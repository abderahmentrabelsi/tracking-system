const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB limit
});

const nextConfig = withPWA({
  basePath: process.env.BASEPATH,
  productionBrowserSourceMaps: false,
  reactStrictMode: false,
  experimental: {
    // turboMode: false,
    // reactServerComponents: false,
  },
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
    };
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://aesmm2ss33.us-east-1.awsapprunner.com/:path*', // Proxy to App Runner
      },
    ];
  },
});

module.exports = nextConfig;
