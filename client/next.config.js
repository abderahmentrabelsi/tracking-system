const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB limit
});

/** @type {import('next').NextConfig} */
const nextConfig = withPWA({
  basePath: process.env.BASEPATH,
  reactStrictMode: false,
});

module.exports = nextConfig;
