import * as esbuild from 'esbuild';

const isProd = process.env.NODE_ENV === 'production';

let ctx = await esbuild.context({
  entryPoints: [
    'widgets/chatbox/index.ts',
    'widgets/chatbox/styles.ts',
    'widgets/form/index.ts',
  ],
  bundle: true,
  outdir: 'tests/embeds/dist',
  external: ['fs', 'stream', 'zlib', 'process'],
  allowOverwrite: true,
  format: 'esm',
  jsx: 'automatic',
  define: {
    'process.env': '{}',
    'process.env.NEXT_PUBLIC_ASSETS_BASE_URL': '"/dist"',
    'process.env.NEXT_PUBLIC_DASHBOARD_URL': '"http://localhost:3000"',

    ...(isProd
      ? {
          'process.env.NODE_ENV': '"production"',
          'process.env.NEXT_PUBLIC_ASSETS_BASE_URL':
            '"https://cdn.jsdelivr.net/npm/@databerry/chat-bubble@latest"',
          'process.env.NEXT_PUBLIC_DASHBOARD_URL': '"https://app.chaindesk.ai"',
        }
      : {}),
  },
  metafile: true,
  sourcemap: true,
  ...(isProd
    ? {
        minify: true,
        sourcemap: false,
      }
    : {}),
});

if (isProd) {
  const b = await ctx.rebuild();

  console.log(
    await esbuild.analyzeMetafile(b.metafile, {
      verbose: true,
    })
  );

  await ctx.dispose();
  console.log('✅ Build complete!');
} else {
  let { host, port } = await ctx.serve({
    servedir: 'tests/embeds',
  });
  console.log(
    `🚀 Server running at http://${
      host === '0.0.0.0' ? 'localhost' : host
    }:${port}/`
  );
}
