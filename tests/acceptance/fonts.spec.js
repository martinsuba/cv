// REQ-012: one self-hosted web font (Inter) for screen and PDF. Reads dist/ (build first) and dist/cv.pdf (`npm run pdf`).
import { test, expect } from '@playwright/test';
import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
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

	test('REQ-012: the Type3 check works: it flags a PDF printed with a variable font', async ({
		page,
	}) => {
		// Chromium embeds variable fonts as Type3, so a synthetic PDF generated here is a known Type3 sample.
		const font = readFileSync(
			join(ROOT, 'node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2'),
		).toString('base64');
		await page.setContent(
			`<style>@font-face{font-family:V;font-weight:100 900;src:url(data:font/woff2;base64,${font}) format('woff2')}
			body{font:700 24px V}</style><p>Variable font sample</p>`,
		);
		await page.evaluate(() => document.fonts.ready);
		const dir = mkdtempSync(join(tmpdir(), 'type3-'));
		try {
			const sample = join(dir, 'sample.pdf');
			await page.pdf({ path: sample });
			expect(pdfFontSubtypes(sample)).toContain('Type3');
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
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
			return {
				// check() is true for unknown fonts too, so it cannot fail on its own.
				check: document.fonts.check('16px "Inter"'),
				// Fails if the @font-face is missing or the file did not load.
				faceLoaded: [...document.fonts].some(
					(f) => /^"?Inter"?$/.test(f.family) && f.status === 'loaded',
				),
			};
		});
		expect(loaded.check).toBe(true);
		expect(loaded.faceLoaded, 'an Inter @font-face has status "loaded"').toBe(true);
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

	test('REQ-012: woff2 files in dist/assets total at most 200 KB (200,000 B)', () => {
		const dir = join(ROOT, 'dist/assets');
		const files = readdirSync(dir).filter((f) => f.endsWith('.woff2'));
		expect(files.length, 'woff2 files bundled').toBeGreaterThan(0);
		const total = files.reduce((sum, f) => sum + statSync(join(dir, f)).size, 0);
		expect(total, `woff2 total ${total} bytes`).toBeLessThanOrEqual(200_000);
	});
});
