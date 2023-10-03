const { resolve } = require('node:path');

const project = resolve(process.cwd(), 'tsconfig.json');
const common = require('./common');

module.exports = {
  extends: ['eslint-config-prettier', 'eslint-config-next'].map(
    require.resolve
  ),
  parser: '@typescript-eslint/parser',
  // parserOptions: {
  //   project,
  // },
  globals: {
    React: true,
    JSX: true,
  },
  settings: {
    'import/resolver': {
      typescript: {
        project,
      },
    },
  },
  ignorePatterns: ['node_modules/', 'dist/'],
  // add rules configurations here
  plugins: ['simple-import-sort'],
  rules: {
    ...common.rules,
  },
};
