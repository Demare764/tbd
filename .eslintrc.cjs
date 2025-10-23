/* Root ESLint config for the monorepo */
module.exports = {
  root: true,
  env: { node: true, es2022: true, browser: false },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'unused-imports'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  ignorePatterns: ['**/dist/**', '**/.next/**'],
  rules: {
    'unused-imports/no-unused-imports': 'warn',
    '@typescript-eslint/consistent-type-imports': 'warn'
  },
  overrides: [
    {
      files: ['apps/web/**/*.{ts,tsx}'],
      env: { browser: true, es2022: true },
    }
  ]
}
