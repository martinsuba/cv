import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({
	base: '/cv/',
	plugins: [preact()],
	preview: { port: 4173, strictPort: true },
	test: {
		environment: 'jsdom',
		include: ['src/**/*.test.{js,jsx}', 'scripts/**/*.test.js'],
		setupFiles: ['./vitest.setup.js'],
	},
});
