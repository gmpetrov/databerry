/** @type {import('next').NextConfig} */
const baseConfig = require('./next.config.base');

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...baseConfig,
  output: 'standalone',
};

module.exports = nextConfig;
