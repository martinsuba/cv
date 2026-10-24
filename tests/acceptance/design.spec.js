// REQ-011 (screen criteria) and the screen part of REQ-012: "Technical ledger" layout. Computed styles and boxes only.
import { test, expect } from '@playwright/test';
import { cv, readPdf, norm } from '../helpers.js';

async function load(page) {
	await page.goto('/cv/', { waitUntil: 'networkidle' });
	await page.evaluate(() => document.fonts.ready);
}

/** Computed `prop` of EVERY element matching `sel`, as [{ text, value }]; fails if nothing matches. */
async function styles(page, sel, prop) {
	const all = await page.locator(sel).evaluateAll(
		(els, p) =>
			els.map((el) => ({
				text: el.textContent.trim().slice(0, 40),
				value: getComputedStyle(el)[p],
			})),
		prop,
	);
	expect(all.length, `elements match ${sel}`).toBeGreaterThan(0);
	return all;
}

async function expectAll(page, sel, prop, matcher) {
	for (const { text, value } of await styles(page, sel, prop)) {
		expect(value, `${sel} ${prop} of "${text}"`).toMatch(matcher);
	}
}

const MONO = /^"?JetBrains Mono\b/;

const box = async (locator) => {
	const b = await locator.boundingBox();
	expect(b, 'element has a box').toBeTruthy();
	return b;
};

test.describe('REQ-011 ledger layout at 1280px', () => {
	test.use({ viewport: { width: 1280, height: 900 } });

	test('REQ-011: section labels read "nn / Name", numbered 01, 02, ... in DOM order', async ({
		page,
	}) => {
		await load(page);
		const labels = await page.locator('section > h2').allTextContents();
		expect(labels.length, 'one label per section').toBeGreaterThanOrEqual(4);
		labels.forEach((text, i) => {
			expect(text).toMatch(/^\d{2} \/ \S/);
			expect(text.slice(0, 2)).toBe(String(i + 1).padStart(2, '0'));
		});
	});

	test('REQ-011/012: labels, dates and contacts compute to JetBrains Mono, text to Inter', async ({
		page,
	}) => {
		await load(page);
		await expectAll(page, 'section > h2', 'fontFamily', MONO);
		await expectAll(page, 'article > .dates', 'fontFamily', MONO);
		await expectAll(page, 'header nav a', 'fontFamily', MONO);
		await expectAll(page, '.skills li', 'fontFamily', MONO);
		await expectAll(page, 'article h3', 'fontFamily', /^"?Inter\b/);
	});

	test('REQ-011: every section label sits left of its content (box ends before content starts)', async ({
		page,
	}) => {
		await load(page);
		const sections = page.locator('section');
		const n = await sections.count();
		expect(n).toBeGreaterThanOrEqual(4);
		for (let i = 0; i < n; i++) {
			const label = await box(sections.nth(i).locator('> h2'));
			const content = await box(sections.nth(i).locator('> :not(h2)').first());
			expect(label.x + label.width, `section ${i + 1}`).toBeLessThan(content.x);
			expect(Math.abs(label.y - content.y), `section ${i + 1} top-aligned`).toBeLessThan(12);
		}
	});

	test('REQ-011: every experience and education date sits left of its title, in mono', async ({
		page,
	}) => {
		await load(page);
		const entries = page.locator('article');
		const n = await entries.count();
		expect(n).toBe(cv.experience.length + cv.education.length);
		for (let i = 0; i < n; i++) {
			const date = await box(entries.nth(i).locator('> div').first());
			const title = await box(entries.nth(i).locator('h3'));
			expect(date.x + date.width, `entry ${i}`).toBeLessThan(title.x);
			const font = await entries
				.nth(i)
				.locator('> div')
				.first()
				.evaluate((el) => getComputedStyle(el).fontFamily);
			expect(font, `entry ${i} date font`).toMatch(MONO);
			const titleFont = await entries
				.nth(i)
				.locator('h3')
				.evaluate((el) => getComputedStyle(el).fontFamily);
			expect(titleFont, `entry ${i} title font`).toMatch(/^"?Inter\b/);
		}
	});

	test('REQ-011: every date range stays on one line', async ({ page }) => {
		await load(page);
		// The box is stretched to the row height, so count the line boxes of the text itself.
		const lines = await page.locator('article > .dates').evaluateAll((els) =>
			els.map((el) => {
				const range = document.createRange();
				range.selectNodeContents(el);
				const tops = new Set([...range.getClientRects()].map((r) => Math.round(r.top)));
				return [el.textContent, tops.size];
			}),
		);
		expect(lines.length).toBeGreaterThan(0);
		for (const [text, count] of lines) expect(count, `"${text}" is one line`).toBe(1);
	});

	test('REQ-011: job title and links use the accent colour', async ({ page }) => {
		await load(page);
		await expectAll(page, 'header h1 + *', 'color', /^rgb\(29, 78, 216\)$/);
		await expectAll(page, 'header nav a', 'color', /^rgb\(29, 78, 216\)$/);
		await expectAll(page, 'a[download]', 'color', /^rgb\(29, 78, 216\)$/);
	});

	test('REQ-011: header has a 104px round photo, name 44px, content max width 1040px', async ({
		page,
	}) => {
		await load(page);
		const photo = await box(page.locator('header img'));
		expect(photo.width).toBe(104);
		expect(photo.height).toBe(104);
		expect(
			await page.locator('header img').evaluate((el) => getComputedStyle(el).borderRadius),
		).toBe('50%');
		expect(await page.locator('header h1').evaluate((el) => getComputedStyle(el).fontSize)).toBe(
			'44px',
		);
		const header = await box(page.locator('header'));
		expect(header.width).toBeLessThanOrEqual(1040);
	});

	test('REQ-011: skills are li items in a list, one li per skill, tagged with a border', async ({
		page,
	}) => {
		await load(page);
		for (const [group, items] of Object.entries(cv.skills)) {
			const heading = page.getByRole('heading', { name: group, exact: true });
			await expect(heading).toBeVisible();
			const lis = heading.locator('xpath=following-sibling::ul[1]/li');
			await expect(lis).toHaveText(items);
		}
		await expectAll(page, '.skills li', 'borderTopWidth', /^1px$/);
		await expectAll(page, '.skills li', 'borderTopLeftRadius', /^4px$/);
		await expectAll(page, '.skills li', 'fontSize', /^12px$/);
	});
});

test.describe('REQ-011 ledger layout at 375px', () => {
	test.use({ viewport: { width: 375, height: 800 } });

	test('REQ-011: one column, labels and dates above content, no horizontal scroll', async ({
		page,
	}) => {
		await load(page);
		expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
			375,
		);
		const sections = page.locator('section');
		for (let i = 0; i < (await sections.count()); i++) {
			const label = await box(sections.nth(i).locator('> h2'));
			const content = await box(sections.nth(i).locator('> :not(h2)').first());
			expect(label.y + label.height, `section ${i + 1}`).toBeLessThanOrEqual(content.y);
		}
		const entries = page.locator('article');
		for (let i = 0; i < (await entries.count()); i++) {
			const date = await box(entries.nth(i).locator('> div').first());
			const title = await box(entries.nth(i).locator('h3'));
			expect(date.y + date.height, `entry ${i}`).toBeLessThanOrEqual(title.y);
		}
	});

	test('REQ-011: the photo is 80px', async ({ page }) => {
		await load(page);
		const photo = await box(page.locator('header img'));
		expect(photo.width).toBe(80);
		expect(photo.height).toBe(80);
	});
});

test.describe('REQ-011 ledger layout in dist/cv.pdf', () => {
	test('REQ-011: every skill group is printed as comma-separated text, in order', async () => {
		const { pages } = await readPdf();
		const text = norm(pages.map((p) => p.text).join(' '));
		for (const [group, items] of Object.entries(cv.skills)) {
			const joined = items.join(', ');
			const at = text.indexOf(joined);
			expect(at, `"${group}" items joined by ", " in PDF text`).toBeGreaterThanOrEqual(0);
			const before = text.slice(0, at).replace(/\s*:?\s*$/, '');
			expect(before.endsWith(group), `group name "${group}" right before its items`).toBe(true);
		}
	});

	test('REQ-011: the PDF has at most 2 pages', async () => {
		const { numPages } = await readPdf();
		expect(numPages).toBeLessThanOrEqual(2);
	});
});
