// REQ-010: responsive and accessible.
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { cv } from '../helpers.js';

test.describe('REQ-010 responsive and accessible', () => {
	test('REQ-010: no horizontal scrolling at 375px width', async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 800 });
		await page.goto('/cv/', { waitUntil: 'networkidle' });
		const { scrollWidth, clientWidth } = await page.evaluate(() => ({
			scrollWidth: document.documentElement.scrollWidth,
			clientWidth: document.documentElement.clientWidth,
		}));
		expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
	});

	// T-003 (photo alt, link targets) and T-006 (contrast etc.): current page has serious violations.
	test.fixme('REQ-010: axe-core finds no serious or critical violations', async ({ page }) => {
		await page.goto('/cv/', { waitUntil: 'networkidle' });
		const { violations } = await new AxeBuilder({ page }).analyze();
		const bad = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
		expect(bad.map((v) => `${v.id} (${v.impact})`)).toEqual([]);
	});

	// T-003: links get rel="noopener noreferrer", photo gets alt text.
	test.fixme('REQ-010: links opening a new tab have rel="noopener"', async ({ page }) => {
		await page.goto('/cv/');
		const links = page.locator('a[target="_blank"]');
		expect(await links.count()).toBeGreaterThan(0);
		for (const rel of await links.evaluateAll((els) =>
			els.map((e) => e.getAttribute('rel') || ''),
		)) {
			expect(rel.split(/\s+/)).toContain('noopener');
		}
	});

	test.fixme('REQ-010: the photo has alt text equal to the name', async ({ page }) => {
		await page.goto('/cv/');
		await expect(page.locator('img').first()).toHaveAttribute('alt', cv.name);
	});
});
