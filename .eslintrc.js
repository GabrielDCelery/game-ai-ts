module.exports = {
  parser: '@typescript-eslint/parser',
  env: {
    node: true,
    es6: true,
  },
  extends: [
    'plugin:@typescript-eslint/recommended',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended',
    'plugin:unicorn/recommended',
    'plugin:promise/recommended',
    'prettier',
  ],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'prettier', 'unicorn', 'promise', 'import'],
  rules: {
    '@typescript-eslint/explicit-member-accessibility': [2, { accessibility: 'no-public' }],
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/explicit-function-return-type': [2, { allowExpressions: true }],
    'unicorn/prevent-abbreviations': [0],
    '@typescript-eslint/interface-name-prefix': [0],
    '@typescript-eslint/camelcase': ['error', { allow: ['icon_emoji'] }],
    '@typescript-eslint/no-parameter-properties': [0],
    '@typescript-eslint/no-object-literal-type-assertion': [0],
  },
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {},
    },
  },
};
