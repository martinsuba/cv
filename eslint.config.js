import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-config-prettier';

export default [
	{
		ignores: [
			'dist/',
			'node_modules/',
			'playwright-report/',
			'test-results/',
			'reports/',
			'screenshots/',
		],
	},
	js.configs.recommended,
	{
		files: ['**/*.{js,jsx}'],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: { ...globals.browser, ...globals.node },
			parserOptions: { ecmaFeatures: { jsx: true } },
		},
		rules: {
			// JSX components are used as <Component /> and look unused to core no-unused-vars
			'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z]|^h$' }],
		},
	},
	{
		files: ['generate-pdf.cjs'],
		languageOptions: { sourceType: 'commonjs', globals: { ...globals.node } },
	},
	prettier,
];
