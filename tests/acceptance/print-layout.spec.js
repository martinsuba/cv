// REQ-013: polished print layout. Reads dist/ (build first) and dist/cv.pdf (`npm run pdf`).
import { test, expect } from '@playwright/test';
import { readPdfTextBoxes, dominantFontSize, contactLinks } from '../helpers.js';

const MM_15_PT = 42.5; // 15 mm in points

test.describe('REQ-013 print layout', () => {
	test('REQ-013: in print media all contact links sit on one line', async ({ page }) => {
		await page.goto('/cv/', { waitUntil: 'networkidle' });
		await page.emulateMedia({ media: 'print' });
		const links = page.locator('.contact a');
		await expect(links).toHaveCount(contactLinks().length);
		const tops = await links.evaluateAll((els) =>
			els.map((el) => Math.round(el.getBoundingClientRect().top)),
		);
		expect(new Set(tops).size, `contact link tops: ${tops}`).toBe(1);
	});

	test('REQ-013: text in dist/cv.pdf keeps at least 15 mm from every page edge', async () => {
		const { pages } = await readPdfTextBoxes();
		pages.forEach((p, i) => {
			for (const it of p.items) {
				const where = `page ${i + 1} "${it.str.slice(0, 30)}"`;
				expect(it.x, `${where} left`).toBeGreaterThanOrEqual(MM_15_PT);
				expect(p.width - (it.x + it.width), `${where} right`).toBeGreaterThanOrEqual(MM_15_PT);
				expect(it.y, `${where} bottom`).toBeGreaterThanOrEqual(MM_15_PT);
				expect(p.height - (it.y + it.size), `${where} top`).toBeGreaterThanOrEqual(MM_15_PT);
			}
		});
	});

	test('REQ-013: body text in dist/cv.pdf is at least 9.5 pt', async () => {
		const { pages } = await readPdfTextBoxes();
		const size = dominantFontSize(pages.flatMap((p) => p.items));
		expect(size, 'most common font size').toBeGreaterThanOrEqual(9.5);
	});
});
