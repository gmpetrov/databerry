module.exports = {
  '*.{ts,tsx}': () => ['tsc-files --noEmit', 'next lint --fix'],
  '*.{js,jsx}': () => 'next lint --fix',
};
