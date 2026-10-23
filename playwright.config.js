import { defineConfig, devices } from '@playwright/test';

// Acceptance tests run against the production build (dist/) served under /cv/ by `vite preview`.
// Build first (`npm run build`); CI does the same. Screenshots live in tests/screenshots.
export default defineConfig({
	testDir: './tests',
	testMatch: '**/*.spec.{js,ts}',
	outputDir: 'test-results',
	// Tests within a file run in order. pdf.spec.js generates into a temp file (`--out`), so dist/cv.pdf is only written by `npm run pdf`.
	fullyParallel: false,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	workers: process.env.CI ? 2 : 1,
	reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : [['list']],
	globalSetup: './tests/global-setup.js',
	use: {
		baseURL: 'http://localhost:4173',
		trace: 'retain-on-failure',
	},
	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
	webServer: {
		command: 'npm run preview',
		url: 'http://localhost:4173/cv/',
		reuseExistingServer: !process.env.CI,
		timeout: 30_000,
	},
});
