/**
 * ESLint Configuration - Enterprise Grade (ESLint v9 Flat Config)
 *
 * Strict rules for production-quality code.
 * All warnings are errors in CI (--max-warnings 0).
 */
import js from '@eslint/js';
import globals from 'globals';

export default [
  // Base recommended config
  js.configs.recommended,

  // Global ignores
  {
    ignores: ['node_modules/**', 'dist/**', 'coverage/**', '*.min.js', 'codebase_audit/**'],
  },

  // Main configuration for all JS files
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
        // Libraries loaded via window.xxx pattern in script.js
        mermaid: 'readonly',
        Prism: 'readonly',
        html2pdf: 'readonly',
        katex: 'readonly',
        marked: 'readonly',
      },
    },
    rules: {
      // ==================== ERRORS (Must Fix) ====================

      // Variables
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-undef': 'error',
      'no-use-before-define': ['error', { functions: false, classes: true }],
      'no-shadow': 'error',
      'no-redeclare': 'error',

      // Best Practices
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-extend-native': 'error',
      'no-extra-bind': 'error',
      'no-implicit-coercion': 'error',
      'no-lone-blocks': 'error',
      'no-multi-spaces': 'error',
      'no-new': 'error',
      'no-new-func': 'error',
      'no-new-wrappers': 'error',
      'no-return-assign': 'error',
      'no-self-compare': 'error',
      'no-sequences': 'error',
      'no-throw-literal': 'error',
      'no-useless-call': 'error',
      'no-useless-concat': 'error',
      'no-useless-return': 'error',
      'prefer-promise-reject-errors': 'error',
      radix: 'error',

      // ES6+
      'prefer-const': 'error',
      'no-var': 'error',
      'prefer-template': 'error',
      'prefer-spread': 'error',
      'prefer-rest-params': 'error',
      'no-duplicate-imports': 'error',
      'no-useless-constructor': 'error',
      'no-useless-rename': 'error',
      'object-shorthand': ['error', 'always'],
      'prefer-arrow-callback': 'error',
      'arrow-body-style': ['error', 'as-needed'],

      // ==================== WARNINGS (Fix Before PR) ====================

      // Console logging (allowed: warn, error, log for debugging)
      'no-console': ['warn', { allow: ['warn', 'error', 'log'] }],

      // Complexity
      complexity: ['warn', { max: 15 }],
      'max-depth': ['warn', { max: 4 }],
      'max-lines-per-function': ['warn', { max: 100, skipBlankLines: true, skipComments: true }],
      'max-params': ['warn', { max: 5 }],
      'max-nested-callbacks': ['warn', { max: 4 }],

      // Style (enforced by Prettier, but ESLint catches some)
      'no-trailing-spaces': 'error',
      'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }],
      'eol-last': ['error', 'always'],
      'comma-dangle': ['error', 'always-multiline'],
      semi: ['error', 'always'],
      quotes: ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
    },
  },

  // Test files - relaxed rules
  {
    files: ['**/*.test.js', '**/*.spec.js', 'tests/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.jest,
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        vi: 'readonly',
      },
    },
    rules: {
      'max-lines-per-function': 'off',
      'no-console': 'off',
    },
  },

  // Config files - relaxed rules
  {
    files: ['*.config.js', 'eslint.config.js', 'vite.config.js', 'vitest.config.js'],
    rules: {
      'no-console': 'off',
    },
  },
];
