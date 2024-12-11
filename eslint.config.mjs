import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import jest from 'eslint-plugin-jest'
import github from 'eslint-plugin-github'

export default tseslint.config(
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
            "jest.config.js",
            "eslint.config.mjs",
        ],
    },
    {
        rules: {
            "i18n-text/no-en": "off", // I log only english messages and this is a library/user-facing.
            "importPlugin/no-unresolved": "off" // This seems to work in typescript only with additional configuration.
        }
    },
    {
        // Jest
        files: ['**/*.test.ts'],
        ...jest.configs['flat/recommended'],
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