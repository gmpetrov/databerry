module.exports = {
  '*.{ts,tsx}': (files) => [
    'tsc-files --noEmit',
    `prettier --write ${files.join(' ')}`,
    'pnpm lint',
  ],
  '*.{js,jsx}': (files) => [`prettier --write ${files.join(' ')}`, 'pnpm lint'],
};
