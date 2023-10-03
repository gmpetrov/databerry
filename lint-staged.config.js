module.exports = {
  '*.{ts,tsx}': () => ['tsc-files --noEmit', 'pnpm lint'],
  '*.{js,jsx}': () => 'pnpm lint',
};
