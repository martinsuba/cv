import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import cvMeta from './scripts/vite-plugin-cv-meta.js';

export default defineConfig({
	base: '/cv/',
	plugins: [preact(), cvMeta()],
	preview: { port: 4173, strictPort: true },
	test: {
		environment: 'jsdom',
		include: ['src/**/*.test.{js,jsx}', 'scripts/**/*.test.js'],
		setupFiles: ['./vitest.setup.js'],
		// Under Stryker (one Vitest run per mutant) an explicit reporter list keeps Vitest from adding its
		// GitHub job-summary reporter, which would write one "Vitest Test Report" box per mutant run.
		...(process.env.STRYKER_MUTATOR_WORKER === undefined ? {} : { reporters: ['dot'] }),
	},
});
