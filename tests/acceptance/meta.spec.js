// REQ-008: meta and SEO basics, checked on the static built index.html (JavaScript disabled, so only the HTML counts).
import { test, expect } from '@playwright/test';
import { cv } from '../helpers.js';

test.use({ javaScriptEnabled: false });

const meta = (page, attr, name) => page.locator(`head meta[${attr}="${name}"]`);

test.describe('REQ-008 meta and SEO', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/cv/');
	});

	test('REQ-008: <html lang="en">', async ({ page }) => {
		await expect(page.locator('html')).toHaveAttribute('lang', 'en');
	});

	test('REQ-008: <title> is "<name> – <title>" from cv.json', async ({ page }) => {
		await expect(page).toHaveTitle(`${cv.name} – ${cv.title}`);
	});

	test('REQ-008: meta description is the about text', async ({ page }) => {
		await expect(meta(page, 'name', 'description')).toHaveAttribute('content', cv.about);
	});

	test('REQ-008: og:title, og:description, og:type and og:image (absolute URL) are set', async ({
		page,
	}) => {
		await expect(meta(page, 'property', 'og:title')).toHaveAttribute('content', /\S/);
		await expect(meta(page, 'property', 'og:description')).toHaveAttribute('content', /\S/);
		await expect(meta(page, 'property', 'og:type')).toHaveAttribute('content', /\S/);
		await expect(meta(page, 'property', 'og:image')).toHaveAttribute(
			'content',
			/^https:\/\/martinsuba\.github\.io\/cv\/.+\.(jpe?g|png|webp)$/,
		);
	});
});
