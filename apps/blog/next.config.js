const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  staticPageGenerationTimeout: 300,
  basePath: '/blog',
  assetPrefix:
    process.env.NODE_ENV === 'production'
      ? 'https://chaindesk-blog.vercel.app/blog'
      : undefined,
  transpilePackages: ['@chaindesk/lib', '@chaindesk/ui'],
  images: {
    domains: [
      'localhost',
      'www.notion.so',
      'notion.so',
      'images.unsplash.com',
      'pbs.twimg.com',
      'abs.twimg.com',
      's3.us-west-2.amazonaws.com',
      'transitivebullsh.it',
      'chaindesk.ai',
      'www.chaindesk.ai',
      'chaindesk-blog.vercel.app',
    ],
    formats: ['image/avif', 'image/webp'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.externals.push({
      canvas: 'commonjs canvas',
    });

    return config;
  },
});
