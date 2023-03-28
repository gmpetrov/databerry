/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [];
  },
  async rewrites() {
    return [
      {
        source: '/.well-known/ai-plugin.json',
        destination: '/api/openai/plugin/ai-plugin-json',
      },
      {
        source: '/.well-known/openapi.yaml',
        destination: '/api/openai/plugin/openapi-yaml',
      },
      {
        source: '/query',
        destination: '/api/query',
      },
    ];
  },
};

module.exports = nextConfig;
