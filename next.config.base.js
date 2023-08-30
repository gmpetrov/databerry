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
    return [
      {
        source: '/',
        destination: '/chat',
        permanent: true,
        has: [
          {
            type: 'host',
            value: 'app.chaindesk.ai',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/sitemap.xml',
          destination: '/api/sitemap',
        },
        {
          source: '/blog',
          destination: 'https://chaindesk-blog.vercel.app/blog',
        },
        {
          source: '/blog/:path*',
          destination: 'https://chaindesk-blog.vercel.app/blog/:path*',
        },
        {
          source: '/@:path',
          destination: '/agents/@:path/page',
        },
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
        // {
        //   source: '/datastores/:id/:path*',
        //   destination: '/api/datastores/:id/:path*',
        // },
        {
          source: '/datastores/:path*',
          destination: '/api/datastores/:path*',
          has: [
            {
              type: 'host',
              value: 'api.chaindesk.ai',
            },
          ],
        },
        {
          source: '/datasources/:path*',
          destination: '/api/datasources/:path*',
          has: [
            {
              type: 'host',
              value: 'api.chaindesk.ai',
            },
          ],
        },
        {
          source: '/agents/query/:id',
          destination: '/api/agents/:id/query',
        },
        {
          source: '/agents/:path*',
          destination: '/api/agents/:path*',
          has: [
            {
              type: 'host',
              value: 'api.chaindesk.ai',
            },
          ],
        },
        {
          source: '/datastores/query/:id',
          destination: '/api/datastores/:id/query',
        },
        {
          source: '/api/datastores/query/:id',
          destination: '/api/datastores/:id/query',
        },
        {
          source: '/datastores/update/:path*',
          destination: '/api/external/datastores/update/:path*',
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
          //TODO: REMOVE AFTER API REFACTOR
          source: '/api/external/agents/:path*',
          destination: '/api/agents/:path*',
        },

        {
          source: '/api/external/datastores',
          destination: '/api/datastores',
        },
        {
          source: '/api/external/me',
          destination: '/api/me',
        },
        // END REMOVE AFTER API REFACTOR
      ],
    };
  },
  outputFileTracingIgnores: ['canvas'],
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
