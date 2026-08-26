import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: ['**/dist/**', '**/coverage/**', '**/node_modules/**', 'design/**', '.changeset/**'],
  },

  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
    rules: {
      // The kit is a library: an exported thing without a type is a bug in the
      // contract, not a style preference.
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/no-unnecessary-condition': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      // The kit builds CSS strings out of measurements; numbers belong in them.
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],

      // Nothing in the kit is allowed to be null. Absence is `undefined`.
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSNullKeyword',
          message: 'Use undefined, not null: absence has one spelling here.',
        },
        {
          selector: 'Literal[raw="null"]',
          message: 'Use undefined, not null: absence has one spelling here.',
        },
      ],

      eqeqeq: ['error', 'always'],
      'no-console': 'error',
      'prefer-const': 'error',
      'no-param-reassign': 'error',
      complexity: ['error', 14],
    },
  },

  {
    files: ['**/*.tsx'],
    ...react.configs.flat.recommended,
    settings: { react: { version: 'detect' } },
    plugins: { react, 'react-hooks': reactHooks },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
  },

  {
    files: ['packages/react/src/**/*.ts'],
    plugins: { 'react-hooks': reactHooks },
    rules: reactHooks.configs.recommended.rules,
  },

  {
    // Tests may reach for the sharp tools.
    files: ['packages/*/test/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      'no-restricted-syntax': 'off',
    },
  },

  {
    // Config and scripts are plain JavaScript outside the TypeScript program,
    // so type-aware rules have nothing to work from.
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
    ...tseslint.configs.disableTypeChecked,
  },

  {
    files: ['**/*.config.{ts,js}', 'scripts/**/*.{ts,js,mjs}', 'vitest.setup.ts'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },

  prettier,
);
