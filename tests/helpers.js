import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect } from '@playwright/test';

export const ROOT = resolve(import.meta.dirname, '..');
export const cv = JSON.parse(readFileSync(resolve(ROOT, 'data/cv.json'), 'utf8'));
export const PDF_PATH = resolve(ROOT, 'dist/cv.pdf');

/** Contact entries as [key, value, expectedHref]. */
export function contactLinks() {
	return Object.entries(cv.contact).map(([key, value]) => [
		key,
		value,
		key === 'email' ? `mailto:${value}` : value,
	]);
}

/** Expect `text` (whitespace-normalised, case-insensitive substring) to be visible somewhere on the page. */
export async function expectTextVisible(page, text) {
	await expect(page.getByText(text).first(), `"${text.slice(0, 60)}" visible`).toBeVisible();
}

/** Text of every page of dist/cv.pdf plus page sizes (points). Throws if the PDF does not exist. */
export async function readPdf(path = PDF_PATH) {
	if (!existsSync(path)) throw new Error(`${path} not found: run \`npm run build && npm run pdf\``);
	const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
	const data = new Uint8Array(readFileSync(path));
	const doc = await getDocument({ data, useSystemFonts: true }).promise;
	const pages = [];
	for (let i = 1; i <= doc.numPages; i++) {
		const page = await doc.getPage(i);
		const [x0, y0, x1, y1] = page.view;
		const content = await page.getTextContent();
		const text = content.items
			.map((it) => it.str)
			.join(' ')
			.replace(/\s+/g, ' ')
			.trim();
		pages.push({ text, width: x1 - x0, height: y1 - y0 });
	}
	return { numPages: doc.numPages, pages };
}

export const norm = (s) => s.replace(/\s+/g, ' ').trim();
