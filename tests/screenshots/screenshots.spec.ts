// Screens from docs/PLAN.md "Screens": the CV page on desktop and mobile in light and dark, plus print media. Data comes from the public data/cv.json.
import { test } from '@playwright/test';

const viewports = {
	mobile: { width: 390, height: 844 },
	desktop: { width: 1280, height: 800 },
};

for (const [vpName, viewport] of Object.entries(viewports)) {
	for (const scheme of ['light', 'dark'] as const) {
		test(`cv-${vpName}-${scheme}`, async ({ browser }) => {
			const context = await browser.newContext({ viewport, colorScheme: scheme });
			const page = await context.newPage();
			await page.goto('/cv/', { waitUntil: 'networkidle' });
			await page.screenshot({ path: `screenshots/cv-${vpName}-${scheme}.png`, fullPage: true });
			await context.close();
		});
	}
}

test('cv-print-a4-light', async ({ browser }) => {
	const context = await browser.newContext({
		viewport: { width: 794, height: 1123 },
		colorScheme: 'light',
	});
	const page = await context.newPage();
	await page.goto('/cv/', { waitUntil: 'networkidle' });
	await page.emulateMedia({ media: 'print' });
	await page.screenshot({ path: 'screenshots/cv-print-a4-light.png', fullPage: true });
	await context.close();
});
