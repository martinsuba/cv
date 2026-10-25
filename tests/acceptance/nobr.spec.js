// REQ-019: hyphenated words stay on one line. Page checks read the built site; the PDF check reads dist/cv.pdf
// (build first, then `npm run pdf`).
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { cv, PDF_PATH } from '../helpers.js';

const WORD = /[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)+/gu;

/** Hyphenated words in the CV text fields rendered in running text (not urls, not contact data). */
function cvWords() {
	const fields = [
		cv.about,
		...cv.experience.flatMap((e) => [e.description, ...(e.highlights ?? [])]),
		...cv.education.flatMap((e) => [e.degree, e.institution, e.field]),
		...Object.values(cv.skills).flat(),
		...(cv.languages ?? []).map((l) => `${l.language} (${l.level})`),
	].filter(Boolean);
	return new Set(fields.flatMap((f) => f.match(WORD) ?? []));
}

test.describe('REQ-019 hyphenated words on one line', () => {
	test('REQ-019: every hyphenated word from cv.json sits in a .nobr element with white-space: nowrap', async ({
		page,
	}) => {
		const words = cvWords();
		expect(words.size, 'hyphenated words in cv.json').toBeGreaterThan(5);
		await page.goto('/cv/');
		const found = await page.evaluate(() =>
			[...document.querySelectorAll('.nobr')].map((el) => ({
				text: el.textContent,
				ws: getComputedStyle(el).whiteSpace,
			})),
		);
		for (const w of words) {
			const hit = found.filter((f) => f.text === w);
			expect(hit.length, `"${w}" is wrapped in .nobr`).toBeGreaterThan(0);
			for (const h of hit) expect(h.ws, `"${w}" white-space`).toBe('nowrap');
		}
	});

	test('REQ-019: wrapping leaves the page text unchanged (ASCII hyphens, no U+2011)', async ({
		page,
	}) => {
		await page.goto('/cv/');
		const text = await page.evaluate(() => document.body.textContent);
		expect(text).not.toContain('‑');
		for (const w of cvWords()) expect(text, w).toContain(w);
	});

	test('REQ-019: in dist/cv.pdf no line ends in "<letter/digit>-" inside a cv.json hyphenated word', async () => {
		const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
		const doc = await getDocument({
			data: new Uint8Array(readFileSync(PDF_PATH)),
			useSystemFonts: true,
		}).promise;
		const lines = [];
		for (let i = 1; i <= doc.numPages; i++) {
			const items = (await (await doc.getPage(i)).getTextContent()).items.filter((it) => it.str);
			const byY = [];
			for (const it of items) {
				const y = it.transform[5];
				let line = byY.find((l) => Math.abs(l.y - y) < 1);
				if (!line) byY.push((line = { y, items: [] }));
				line.items.push(it);
			}
			for (const l of byY) {
				l.items.sort((a, b) => a.transform[4] - b.transform[4]);
				lines.push(
					l.items
						.map((it) => it.str)
						.join('')
						.trimEnd(),
				);
			}
		}
		expect(lines.length).toBeGreaterThan(10);
		const words = [...cvWords()];
		lines.forEach((line, i) => {
			const m = line.match(/([\p{L}\p{N}]+)-$/u);
			if (!m || i + 1 >= lines.length) return;
			const next = lines[i + 1].match(/^([\p{L}\p{N}]+)/u)?.[1];
			if (!next) return;
			const joined = `${m[1]}-${next}`;
			const broken = words.filter((w) => w.includes(joined));
			expect(broken, `line "${line}" breaks "${joined}" before "${lines[i + 1]}"`).toEqual([]);
		});
	});
});
