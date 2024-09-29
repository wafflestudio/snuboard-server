import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import typescriptEslintEslintPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import globals from 'globals';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

export default [
    {
        ignores: ['**/.eslintrc.js', '**/jest.config.js'],
    },
    ...compat.extends('@apify', 'plugin:@typescript-eslint/recommended', 'prettier', 'plugin:prettier/recommended'),
    {
        plugins: {
            '@typescript-eslint': typescriptEslintEslintPlugin,
        },

        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.jest,
            },

            parser: tsParser,
            ecmaVersion: 5,
            sourceType: 'module',

            parserOptions: {
                project: 'tsconfig.json',
            },
        },

        rules: {
            'import/extensions': ['off'],
        },
    },
];
