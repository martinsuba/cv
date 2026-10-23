import { existsSync } from 'node:fs';

export default function globalSetup() {
	if (!existsSync('dist/index.html')) {
		throw new Error('dist/ not found: run `npm run build` before the Playwright tests.');
	}
}
