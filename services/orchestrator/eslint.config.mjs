import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

const globals = {
  afterEach: 'readonly',
  beforeEach: 'readonly',
  console: 'readonly',
  describe: 'readonly',
  expect: 'readonly',
  it: 'readonly',
  jest: 'readonly',
  process: 'readonly'
};

export default [
  {
    ignores: ['dist/**', 'coverage/**']
  },
  js.configs.recommended,
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module'
      },
      globals
    },
    plugins: {
      '@typescript-eslint': tsPlugin
    },
    rules: tsPlugin.configs.recommended.rules
  }
];
