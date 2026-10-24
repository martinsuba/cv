// REQ-001 (single data source), REQ-017 (highlights, location, languages) and REQ-018 (content v2).
import { test, expect } from '@playwright/test';
import { cv, contactLinks, expectTextVisible } from '../helpers.js';
import {
	ABOUT,
	LOCATION,
	EM_HIGHLIGHTS,
	OTHER_HIGHLIGHTS,
	DESCRIPTIONS,
	LANGUAGES,
	SKILL_GROUPS_IN_ORDER,
	REMOVED_SKILLS,
} from './expected-content.js';

test.describe('REQ-001 single data source', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/cv/');
	});

	test('REQ-001: name, title and about text from cv.json are visible', async ({ page }) => {
		await expect(page.getByRole('heading', { level: 1, name: cv.name })).toBeVisible();
		await expectTextVisible(page, cv.title);
		await expectTextVisible(page, cv.about);
	});

	test('REQ-001: every contact is a link; email is mailto:, others use their URL', async ({
		page,
	}) => {
		for (const [key, value, href] of contactLinks()) {
			const link = page.locator(`a[href="${href}"]`).first();
			await expect(link, `contact ${key}`).toBeVisible();
			if (key === 'email') await expect(link).toContainText(value);
		}
	});

	test('REQ-001: every experience entry (title, company, dates, location, description if any) is visible', async ({
		page,
	}) => {
		for (const e of cv.experience) {
			await expectTextVisible(page, e.title);
			await expectTextVisible(page, e.company.name);
			await expectTextVisible(page, `${e.from} - ${e.to}`);
			await expectTextVisible(page, e.location);
			if (e.description != null) await expectTextVisible(page, e.description);
		}
	});

	test('REQ-017: every highlight is its own li in the entry, after the description; no empty description p', async ({
		page,
	}) => {
		const entries = page.locator('article.entry', { has: page.locator('h3') });
		for (const e of cv.experience) {
			const entry = entries.filter({ hasText: e.company.name }).filter({ hasText: e.title });
			await expect(entry.first(), e.title).toBeVisible();
			const list = entry.first().locator('ul.highlights');
			if (e.highlights?.length) {
				await expect(list.locator(':scope > li'), e.title).toHaveText(e.highlights);
			} else {
				await expect(list, e.title).toHaveCount(0);
			}
			const description = entry.first().locator('p.description');
			await expect(description, e.title).toHaveCount(e.description != null ? 1 : 0);
		}
	});

	test('REQ-017: location is shown under the job title in the header', async ({ page }) => {
		await expect(page.locator('header .job + .location')).toHaveText(cv.location);
	});

	test('REQ-017: Languages section after Education lists "<language> (<level>)"', async ({
		page,
	}) => {
		const section = page.locator('section.languages');
		await expect(section.getByRole('heading', { level: 2 })).toHaveText(/^\d\d \/ Languages$/i);
		await expect(section.locator('ul > li')).toHaveText(
			cv.languages.map((l) => `${l.language} (${l.level})`),
		);
		const labels = await page.locator('h2.section-label').allTextContents();
		expect(labels.at(-1)).toMatch(/Languages$/i);
		expect(labels.at(-2)).toMatch(/Education$/i);
	});

	test('REQ-001: every education entry is visible', async ({ page }) => {
		for (const e of cv.education) {
			await expectTextVisible(page, e.institution);
			await expectTextVisible(page, e.field);
			await expectTextVisible(page, `${e.from} - ${e.to}`);
			await expectTextVisible(page, e.degree);
		}
	});

	test('REQ-001: every skill group and all its items are visible', async ({ page }) => {
		for (const [group, items] of Object.entries(cv.skills)) {
			await expect(page.getByText(group).first(), `group ${group}`).toBeVisible();
			for (const item of items) await expectTextVisible(page, item);
		}
	});
});

test.describe('REQ-018 content v2', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/cv/');
	});

	test('REQ-018: About text is shown', async ({ page }) => {
		await expectTextVisible(page, ABOUT);
	});

	test('REQ-018: location is shown in the header', async ({ page }) => {
		await expect(page.locator('header .location')).toHaveText(LOCATION);
	});

	test('REQ-018: the five Engineering Manager highlights are shown in order', async ({ page }) => {
		const entry = page.locator('article.entry', { has: page.locator('h3') }).first();
		await expect(entry.locator('ul.highlights > li')).toHaveText(EM_HIGHLIGHTS);
	});

	test('REQ-018: highlights of the other recent roles are shown', async ({ page }) => {
		for (const [name, items] of Object.entries(OTHER_HIGHLIGHTS)) {
			for (const text of items) await expect(page.getByText(text).first(), name).toBeVisible();
		}
	});

	test('REQ-018: descriptions are shown', async ({ page }) => {
		for (const [name, text] of Object.entries(DESCRIPTIONS)) {
			await expect(page.getByText(text).first(), name).toBeVisible();
		}
	});

	test('REQ-018: languages are listed', async ({ page }) => {
		await expect(page.locator('section.languages ul > li')).toHaveText(LANGUAGES);
	});

	test('REQ-018: skill groups appear in order Leadership, Delivery, AI, Engineering', async ({
		page,
	}) => {
		const headings = await page.locator('.skills h3').allTextContents();
		expect(headings.map((h) => h.replace(/:$/, '').trim())).toEqual(SKILL_GROUPS_IN_ORDER);
	});

	test('REQ-018: Git, Webpack and npm skills, the npm contact and "open to" are absent', async ({
		page,
	}) => {
		const body = await page.locator('body').innerText();
		for (const skill of REMOVED_SKILLS) {
			expect(body, skill).not.toMatch(new RegExp(`\\b${skill}\\b`, 'i'));
		}
		expect(body).not.toMatch(/open to/i);
		await expect(page.locator('a[href*="npmjs"]')).toHaveCount(0);
		await expect(page.getByRole('heading', { name: /^language:?$/i })).toHaveCount(0);
	});
});
