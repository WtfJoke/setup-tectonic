import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import github from 'eslint-plugin-github'
import { defineConfig } from 'eslint/config';

export default defineConfig(
    eslint.configs.recommended,
    tseslint.configs.strictTypeChecked,
    tseslint.configs.stylisticTypeChecked,
    github.getFlatConfigs().recommended,
    ...github.getFlatConfigs().typescript,
    {
        ignores: [
            "dist/",
            "lib/",
            "node_modules/",
            "vitest.config.ts",
            "eslint.config.mjs",
        ],
    },
    {
        rules: {
            "i18n-text/no-en": "off", // I log only english messages and this is a library/user-facing.
            "import/no-unresolved": "off", // This seems to work in typescript only with additional configuration.
            "import/extensions": "error", // Extensions are needed in esm.
        }
    },
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
);