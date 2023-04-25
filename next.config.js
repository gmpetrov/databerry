const baseConfig = require('./next.config.base');
const { i18n } = require('./next-i18next.config')

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...baseConfig,
  i18n
};

module.exports = nextConfig;
