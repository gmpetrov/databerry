import * as esbuild from 'esbuild';

let ctx = await esbuild.context({
  entryPoints: ['widgets/chatbox/index.ts', 'widgets/chatbox/styles.ts'],
  bundle: true,
  outdir: 'tests/chatbox/dist',
  external: ['fs', 'stream', 'zlib', 'process'],
  // minify: true,
  allowOverwrite: true,
  format: 'esm',
  jsx: 'automatic',
  define: {
    'process.env': '{}',
    'process.env.NEXT_PUBLIC_ASSETS_BASE_URL': '"/dist"',
    'process.env.NEXT_PUBLIC_DASHBOARD_URL': '"http://localhost:3000"',
    // 'process.env.NEXT_PUBLIC_ASSETS_BASE_URL': '"https://cdn.jsdelivr.net/npm/@databerry/chat-bubble@latest NEXT_PUBLIC_DASHBOARD_URL=https://app.chaindesk.ai"',
  },
});

await ctx.watch();
console.log('watching...');
