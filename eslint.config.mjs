import js from '@eslint/js';
import parser from '@typescript-eslint/parser';
import ts from '@typescript-eslint/eslint-plugin';
import hooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

export default [
  { ignores: ['dist/**', 'node_modules/**', '.analytics-data/**', 'secrets/**', '.figma/**', '.vercel/**'] },
  { ...js.configs.recommended, languageOptions: { globals: { ...globals.browser, ...globals.node }, ecmaVersion: 'latest', sourceType: 'module' } },
  { files: ['**/*.{ts,tsx,mts}'], languageOptions: { parser }, plugins: { '@typescript-eslint': ts },
    rules: { 'no-undef': 'off', 'no-unused-vars': 'off', '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }], 'no-empty': ['error', { allowEmptyCatch: true }] } },
  { files: ['src/**/*.{ts,tsx}'], plugins: { 'react-hooks': hooks }, rules: { 'react-hooks/rules-of-hooks': 'error' } },
];
