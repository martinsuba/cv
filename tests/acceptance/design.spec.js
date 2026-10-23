// REQ-011 (screen criteria) and the screen part of REQ-012: "Technical ledger" layout. Computed styles and boxes only.
import { test, expect } from '@playwright/test';
import { cv } from '../helpers.js';

const ACCENT = 'rgb(29, 78, 216)';

async function load(page) {
	await page.goto('/cv/', { waitUntil: 'networkidle' });
	await page.evaluate(() => document.fonts.ready);
}

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
		const mono = /^"?JetBrains Mono\b/;
		const family = (sel) =>
			page
				.locator(sel)
				.first()
				.evaluate((el) => getComputedStyle(el).fontFamily);
		expect(await family('section > h2')).toMatch(mono);
		expect(await family('section article > div:first-child')).toMatch(mono);
		expect(await family('header nav a')).toMatch(mono);
		expect(await family('section li')).toMatch(mono);
		expect(await family('section article h3')).toMatch(/^"?Inter\b/);
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
		}
	});

	test('REQ-011: job title and links use the accent colour', async ({ page }) => {
		await load(page);
		const color = (sel) =>
			page
				.locator(sel)
				.first()
				.evaluate((el) => getComputedStyle(el).color);
		expect(await color('header h1 + *')).toBe(ACCENT);
		expect(await color('header nav a')).toBe(ACCENT);
		expect(await color('a[download]')).toBe(ACCENT);
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
		const li = page.locator('section li').first();
		const style = await li.evaluate((el) => {
			const s = getComputedStyle(el);
			return { border: s.borderTopWidth, radius: s.borderTopLeftRadius, size: s.fontSize };
		});
		expect(style).toEqual({ border: '1px', radius: '4px', size: '12px' });
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
