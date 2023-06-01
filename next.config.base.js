const path = require('path');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  eslint: {
    dirs: ['pages', 'utils', 'components', 'hooks', 'types', 'widgets'],
  },

  reactStrictMode: true,
  async redirects() {
    return [];
  },
  async rewrites() {
    return [
      {
        source: '/privacy',
        destination: '/privacy.pdf',
      },
      {
        source: '/terms',
        destination: '/terms.pdf',
      },
      {
        source: '/.well-known/ai-plugin.json',
        destination: '/api/openai/plugin/ai-plugin-json',
      },
      {
        source: '/.well-known/openapi.yaml',
        destination: '/api/openai/plugin/openapi-yaml',
      },
      {
        source: '/chat/:path*',
        destination: '/api/chat/:path*',
      },
      {
        source: '/query/:path*',
        destination: '/api/external/datastores/query/:path*',
      },
      {
        source: '/datastores/query/:path*',
        destination: '/api/external/datastores/query/:path*',
      },
      {
        source: '/update/:path*',
        destination: '/api/external/datastores/update/:path*',
      },
      {
        source: '/datastores/update/:path*',
        destination: '/api/external/datastores/update/:path*',
      },
      {
        source: '/upsert/:path*',
        destination: '/api/external/datastores/upsert/:path*',
      },
      {
        source: '/datastores/upsert/:path*',
        destination: '/api/external/datastores/upsert/:path*',
      },
      {
        source: '/datastores/file-upload/:path*',
        destination: '/api/external/datastores/file-upload/:path*',
      },
      {
        source: '/agents/query/:id',
        destination: '/api/external/agents/:id/query',
      },
      // TODO remove routes below after migration
      {
        source: '/crisp/:path*',
        destination: '/integrations/crisp/:path*',
      },
      {
        source: '/api/crisp/:path*',
        destination: '/api/integrations/crisp/:path*',
      },
      {
        source: '/api/slack/:path*',
        destination: '/api/integrations/slack/:path*',
      },
    ];
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.externals.push({
      playwright: true,
      'pdf-parse/lib/pdf.js/v1.10.100/build/pdf.js': true,
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

module.exports = withBundleAnalyzer(nextConfig);
