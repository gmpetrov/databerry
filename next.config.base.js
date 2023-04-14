const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
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
        source: '/upsert',
        destination: '/api/upsert',
      },
      {
        source: '/update',
        destination: '/api/update',
      },
      {
        source: '/query/:path*',
        destination: '/api/query/:path*',
      },
      {
        source: '/queries',
        destination: '/api/query/many',
      },
    ];
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.externals.push({
      '@huggingface/inference': 'commonjs @huggingface/inference',
      replicate: 'commonjs replicate',
      'cohere-ai': 'commonjs cohere-ai',
      typeorm: 'commonjs typeorm',
      'd3-dsv': 'commonjs d3-dsv',
      'srt-parser-2': 'commonjs srt-parser-2',
      puppeteer: 'commonjs puppeteer',
      'html-to-text': 'commonjs html-to-text',
      epub2: 'commonjs epub2',
    });

    if (isServer && config.name === 'server') {
      const oldEntry = config.entry;

      return {
        ...config,
        async entry(...args) {
          const entries = await oldEntry(...args);
          return {
            ...entries,
            'datasource-loader': path.resolve(
              process.cwd(),
              'workers/datasource-loader.ts'
            ),
          };
        },
      };
    }

    return config;
  },
};

module.exports = nextConfig;
