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

/**
 * Joins pdf.js text items with a space, except where an item starts right where the previous one ended on the same
 * line: a glyph from another font file (e.g. Š from the Latin Extended subset) is its own item but not a word break.
 */
export function joinTextItems(items) {
	let out = '';
	let prev;
	for (const it of items) {
		if (prev && it.str) {
			const size = it.transform[0];
			const [x, y] = [it.transform[4], it.transform[5]];
			const sameLine = Math.abs(y - prev.transform[5]) < 1;
			const gap = x - (prev.transform[4] + prev.width);
			const glued = sameLine && !prev.hasEOL && Math.abs(gap) < 0.1 * Math.abs(size);
			out += glued ? '' : ' ';
		}
		out += it.str;
		if (it.str) prev = it;
	}
	return out.replace(/\s+/g, ' ').trim();
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
		const text = joinTextItems(content.items);
		pages.push({ text, width: x1 - x0, height: y1 - y0 });
	}
	return { numPages: doc.numPages, pages };
}

export const norm = (s) => s.replace(/\s+/g, ' ').trim();

/**
 * Names (subset prefix stripped, de-duplicated) of every font embedded in a PDF: /BaseFont of normal fonts and
 * /FontName of font descriptors (Chromium embeds variable fonts as Type3 fonts that have no /BaseFont).
 * Throws if the PDF does not exist. Scans the raw PDF text, so it assumes no compressed object streams (true for
 * Chromium output today).
 */
export function pdfFontNames(path = PDF_PATH) {
	if (!existsSync(path)) throw new Error(`${path} not found: run \`npm run build && npm run pdf\``);
	const raw = readFileSync(path).toString('latin1');
	const names = [...raw.matchAll(/\/(?:BaseFont|FontName)\s*\/([^\s/<>[\]()]+)/g)].map((m) =>
		m[1].replace(/^[A-Z]{6}\+/, ''),
	);
	return [...new Set(names)].sort();
}

/**
 * Font /Subtype values found in a PDF (Type0, TrueType, Type3, CIDFontType2, ...). Scans the raw PDF text, so it assumes
 * no compressed object streams (true for Chromium output today). It does not parse dictionaries: nested dicts of Type3
 * fonts (/Encoding, /CharProcs) would defeat a dictionary regex, so it matches the font subtype names anywhere.
 */
export function pdfFontSubtypes(path = PDF_PATH) {
	if (!existsSync(path)) throw new Error(`${path} not found: run \`npm run build && npm run pdf\``);
	const raw = readFileSync(path).toString('latin1');
	const found = raw.matchAll(
		/\/Subtype\s*\/(Type0|Type1|MMType1|TrueType|Type3|CIDFontType0|CIDFontType2)\b/g,
	);
	return [...new Set([...found].map((m) => m[1]))].sort();
}

/**
 * Non-empty text items of every PDF page with geometry in points, origin at the page's bottom-left:
 * `{ str, x, y, width, height, size }` where `size` is the font size taken from the item transform.
 * Returns `{ pages: [{ width, height, items }] }`. Throws if the PDF does not exist.
 */
export async function readPdfTextBoxes(path = PDF_PATH) {
	if (!existsSync(path)) throw new Error(`${path} not found: run \`npm run build && npm run pdf\``);
	const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
	const data = new Uint8Array(readFileSync(path));
	const doc = await getDocument({ data, useSystemFonts: true }).promise;
	const pages = [];
	for (let i = 1; i <= doc.numPages; i++) {
		const page = await doc.getPage(i);
		const [x0, y0, x1, y1] = page.view;
		const content = await page.getTextContent();
		const items = content.items
			.filter((it) => it.str.trim() !== '')
			.map((it) => ({
				str: it.str,
				x: it.transform[4] - x0,
				y: it.transform[5] - y0,
				width: it.width,
				height: it.height,
				size: Math.hypot(it.transform[0], it.transform[1]),
			}));
		pages.push({ width: x1 - x0, height: y1 - y0, items });
	}
	return { pages };
}

/** Most common font size (rounded to 0.1 pt) weighted by characters, i.e. the body text size. */
export function dominantFontSize(items) {
	const chars = new Map();
	for (const it of items) {
		const key = Math.round(it.size * 10) / 10;
		chars.set(key, (chars.get(key) ?? 0) + it.str.length);
	}
	return [...chars.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
}
