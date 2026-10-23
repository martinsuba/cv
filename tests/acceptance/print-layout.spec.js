// REQ-013: polished print layout. Reads dist/ (build first) and dist/cv.pdf (`npm run pdf`).
import { test, expect } from '@playwright/test';
import { readPdfTextBoxes, dominantFontSize, contactLinks } from '../helpers.js';

const MM_15_PT = 42.5; // 15 mm in points

test.describe('REQ-013 print layout', () => {
	test('REQ-013: in dist/cv.pdf all contact links sit in the page-1 header, above the first section, on one line or right-aligned in one column', async () => {
		const { pages } = await readPdfTextBoxes();
		const boxes = contactLinks().map(([key, value]) => {
			const text = key === 'email' ? value : value.replace(/^\w+:\/\//, '');
			const item = pages[0].items.find((it) => it.str.includes(text));
			expect(item, `contact "${text}" found on page 1`).toBeTruthy();
			return item;
		});
		// The first section label starts with the text box "01"; contacts must be above it (PDF y grows upwards).
		const label = pages[0].items.find((it) => it.str.trim() === '01');
		expect(label, 'first section label on page 1').toBeTruthy();
		for (const b of boxes) {
			expect(b.y, `"${b.str}" above the first section label`).toBeGreaterThan(label.y + label.size);
		}
		const baselines = new Set(boxes.map((b) => Math.round(b.y * 10) / 10));
		const rights = boxes.map((b) => b.x + b.width);
		const rightAligned = Math.max(...rights) - Math.min(...rights) <= 2;
		expect(
			baselines.size === 1 || rightAligned,
			`one baseline (${[...baselines]}) or right edges within 2 pt (${rights.map((r) => r.toFixed(1))})`,
		).toBe(true);
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
		// Chromium silently shrinks overflowing pages (10 pt body becomes 9.4 pt): the size must be the CSS size.
		expect(size, 'no page shrink-to-fit').toBeGreaterThan(9.9);
		expect(size, 'no page shrink-to-fit').toBeLessThan(10.1);
	});
});
