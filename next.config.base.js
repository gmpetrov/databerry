const path = require('path');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const pkg = require('./package.json');

/** @type {import('next').NextConfig} */
const nextConfig = {
  publicRuntimeConfig: {
    version: pkg.version,
  },
  experimental: {
    // outputFileTracingIgnores: ['canvas'],
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
      {
        source: '/account',
        destination: '/settings/billing',
        permanent: true,
      },
      {
        source: '/settings',
        destination: '/settings/profile',
        permanent: true,
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
          source: '/help',
          destination: 'https://help-center-wine.vercel.app/help',
        },
        {
          source: '/help/:path*',
          destination: 'https://help-center-wine.vercel.app/help/:path*',
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
  // outputFileTracingIgnores: ['canvas'],
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
            'daily-leads': path.resolve(process.cwd(), 'cron/daily-leads.tsx'),
          };
        },
      };
    }

    return config;
  },
};

module.exports = withBundleAnalyzer(nextConfig);

if (process.env.SENTRY_ORGANIZATION) {
  // Injected content via Sentry wizard below

  const { withSentryConfig } = require('@sentry/nextjs');

  module.exports = withSentryConfig(
    module.exports,
    {
      // For all available options, see:
      // https://github.com/getsentry/sentry-webpack-plugin#options

      // Suppresses source map uploading logs during build
      silent: true,

      org: process.env.SENTRY_ORGANIZATION,
      project: 'javascript-nextjs',
    },
    {
      // For all available options, see:
      // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

      // Upload a larger set of source maps for prettier stack traces (increases build time)
      widenClientFileUpload: true,

      // Transpiles SDK to be compatible with IE11 (increases bundle size)
      transpileClientSDK: true,

      // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
      tunnelRoute: '/monitoring',

      // Hides source maps from generated client bundles
      hideSourceMaps: true,

      // Automatically tree-shake Sentry logger statements to reduce bundle size
      disableLogger: true,
    }
  );
}
