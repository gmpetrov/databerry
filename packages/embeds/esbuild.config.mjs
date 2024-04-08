import autoprefixer from 'autoprefixer';
import * as esbuild from 'esbuild';
import postCssPlugin from 'esbuild-style-plugin';
import tailwindcss from 'tailwindcss';

const isProd = process.env.NODE_ENV === 'production';
const outDir = isProd ? './dist' : './tests/dist';

let ctx = await esbuild.context({
  entryPoints: [
    'js/chatbox/index.ts',
    'js/chatbox/legacy.js',
    'js/form/index.ts',
  ],
  bundle: true,
  outdir: outDir,
  external: ['fs', 'stream', 'zlib', 'process'],
  allowOverwrite: true,
  format: 'esm',
  jsx: 'automatic',
  define: {
    'process.env': '{}',
    'process.env.NEXT_PUBLIC_ASSETS_BASE_URL': '"http://localhost:8000"',
    'process.env.NEXT_PUBLIC_DASHBOARD_URL': '"http://localhost:3000"',

    ...(isProd
      ? {
          'process.env.NODE_ENV': '"production"',
          'process.env.NEXT_PUBLIC_ASSETS_BASE_URL':
            '"https://cdn.jsdelivr.net/npm/@chaindesk/embeds@latest"',
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

  plugins: [
    postCssPlugin({
      postcss: {
        plugins: [tailwindcss, autoprefixer],
      },
    }),
  ],
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
    servedir: 'tests/',
  });
  console.log(
    `🚀 Server running at http://${
      host === '0.0.0.0' ? 'localhost' : host
    }:${port}/`
  );
}
