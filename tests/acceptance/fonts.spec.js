// REQ-012: one self-hosted web font (Inter) for screen and PDF. Reads dist/ (build first) and dist/cv.pdf (`npm run pdf`).
import { test, expect } from '@playwright/test';
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, cv, norm, pdfFontNames, pdfFontSubtypes, readPdf } from '../helpers.js';

test.describe('REQ-012 web font', () => {
	test('REQ-012: every font embedded in dist/cv.pdf is Inter, none is a system fallback', () => {
		const fonts = pdfFontNames();
		expect(fonts.length, 'PDF embeds at least one font').toBeGreaterThan(0);
		for (const f of fonts) {
			expect(f, `embedded font ${f}`).toMatch(/^Inter/i);
			expect(f).not.toMatch(/Liberation|DejaVu|Arial|Helvetica|Noto/i);
		}
	});

	test('REQ-012: no embedded font is Type3 (text stays extractable)', () => {
		const subtypes = pdfFontSubtypes();
		expect(subtypes.length, 'font dictionaries found').toBeGreaterThan(0);
		expect(subtypes).not.toContain('Type3');
	});

	test('REQ-012: extracted PDF text keeps every hyphenated word from cv.json', async () => {
		const { pages } = await readPdf();
		// A word wrapped at its hyphen reads "user- facing"; that is still intact.
		const text = norm(pages.map((p) => p.text).join(' ')).replace(/(\w-) (?=\w)/g, '$1');
		const words = new Set(
			JSON.stringify(cv)
				.replace(/https?:\/\/[^"\s]+/g, '')
				.match(/[\p{L}\d]+(?:-[\p{L}\d]+)+/gu),
		);
		expect(words.size, 'hyphenated words in cv.json').toBeGreaterThan(5);
		for (const w of words) expect(text, w).toContain(w);
	});

	test('REQ-012: on the built site the web font is loaded and body text computes to it', async ({
		page,
	}) => {
		await page.goto('/cv/', { waitUntil: 'networkidle' });
		const loaded = await page.evaluate(async () => {
			await document.fonts.ready;
			return document.fonts.check('16px "Inter"');
		});
		expect(loaded).toBe(true);
		const family = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
		expect(family).toMatch(/^"?Inter\b/);
	});

	test('REQ-012: no request leaves localhost during page load', async ({ page }) => {
		const external = [];
		page.on('request', (req) => {
			const { protocol, hostname } = new URL(req.url());
			if (/^https?:$/.test(protocol) && !['localhost', '127.0.0.1'].includes(hostname)) {
				external.push(req.url());
			}
		});
		await page.goto('/cv/', { waitUntil: 'networkidle' });
		expect(external).toEqual([]);
	});

	test('REQ-012: woff2 files in dist/assets total at most 200 KB', () => {
		const dir = join(ROOT, 'dist/assets');
		const files = readdirSync(dir).filter((f) => f.endsWith('.woff2'));
		expect(files.length, 'woff2 files bundled').toBeGreaterThan(0);
		const total = files.reduce((sum, f) => sum + statSync(join(dir, f)).size, 0);
		expect(total, `woff2 total ${total} bytes`).toBeLessThanOrEqual(200 * 1024);
	});
});
