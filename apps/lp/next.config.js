const path = require('path');
const os = require('os');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const pkg = require('../../package.json');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  publicRuntimeConfig: {
    version: pkg.version,
  },
  transpilePackages: [
    '@chaindesk/lib',
    // '@chaindesk/emails',
    '@chaindesk/ui',
    // '@chaindesk/integrations',
  ],
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../../'),
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },

  async redirects() {
    return [
      {
        source: '/signin',
        destination: '/auth/signin',
        permanent: true,
      },
      {
        source: '/',
        destination: '/agents',
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
          source: '/',
          destination: '/use-cases/customer-support',
          has: [
            {
              type: 'host',
              value: 'www.resolveai.io',
            },
          ],
        },
        {
          source: '/pricing',
          destination: '/use-cases/customer-support/pricing',
          has: [
            {
              type: 'host',
              value: 'www.resolveai.io',
            },
          ],
        },
        {
          source: '/sitemap.xml',
          destination: '/api/sitemaps/chaindesk',
          has: [
            {
              type: 'host',
              value: 'www.chaindesk.ai',
            },
          ],
        },
        {
          source: '/sitemap.xml',
          destination: '/api/sitemaps/chatbotgpt',
          has: [
            {
              type: 'host',
              value: 'www.chatbotgpt.ai',
            },
          ],
        },
        {
          source: '/sitemap.xml',
          destination: '/api/sitemaps/resolveai',
          has: [
            {
              type: 'host',
              value: 'www.resolveai.io',
            },
          ],
        },
        {
          source: '/api/tools/youtube-summary/sitemap.xml',
          destination: '/api/tools/youtube-summary/sitemap',
        },
        {
          source: '/api/tools/youtube-summary/sitemap/:index(\\d+).xml',
          destination: '/api/tools/youtube-summary/sitemap/:index',
        },
        {
          source: '/api/tools/youtube-summary/sitemap/:slug(.*).xml',
          destination: '/api/tools/youtube-summary/sitemap/:slug',
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
          destination: `${process.env.NEXT_PUBLIC_DASHBOARD_URL}/agents/@:path/standalone`,
        },
        {
          source: '/privacy',
          destination: '/privacy.pdf',
        },
        {
          source: '/terms',
          destination: '/terms.pdf',
        },
        // {
        //   source: '/.well-known/ai-plugin.json',
        //   destination: '/api/openai/plugin/ai-plugin-json',
        // },
        // {
        //   source: '/.well-known/openapi.yaml',
        //   destination: '/api/openai/plugin/openapi-yaml',
        // },
      ],
    };
  },

  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.plugins.push(
      new CopyWebpackPlugin({
        patterns: [
          {
            from: '../../packages/ui/src/**/static/**',
            globOptions: {
              ignore: ['**/ui/node_modules'],
            },
            to({ context, absoluteFilename }) {
              // Adds compatibility for windows path
              if (os.platform() === 'win32') {
                const absoluteFilenameWin = absoluteFilename.replaceAll(
                  '\\',
                  '/'
                );
                const contextWin = context.replaceAll('\\', '/');
                const appName = /ui\/src\/static\/(.*)\//.exec(
                  absoluteFilenameWin
                );
                return Promise.resolve(
                  `${contextWin}/public/static/${appName[1]}/[name][ext]`
                );
              }
              const appName = /ui\/src\/static\/(.*)\//.exec(absoluteFilename);

              return Promise.resolve(
                `${context}/public/shared/${appName[1]}/[name][ext]`
              );
            },
          },
        ],
      })
    );

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
