// REQ-001 (single data source) and REQ-003 (current content).
import { test, expect } from '@playwright/test';
import { cv, contactLinks, expectTextVisible } from '../helpers.js';
import {
	ABOUT,
	EM_80_SENTENCE,
	DESCRIPTIONS,
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

	test('REQ-001: every experience entry (title, company, dates, location, description) is visible', async ({
		page,
	}) => {
		for (const e of cv.experience) {
			await expectTextVisible(page, e.title);
			await expectTextVisible(page, e.company.name);
			await expectTextVisible(page, `${e.from} - ${e.to}`);
			await expectTextVisible(page, e.location);
			await expectTextVisible(page, e.description);
		}
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

test.describe('REQ-003 current content', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/cv/');
	});

	test('REQ-003: About text from the PDF is shown', async ({ page }) => {
		await expectTextVisible(page, ABOUT);
	});

	test('REQ-003: the "up to 80%" sentence is in the Engineering Manager entry', async ({
		page,
	}) => {
		await expectTextVisible(page, EM_80_SENTENCE);
	});

	test('REQ-003: full Engineering Manager / TPL / Lead Frontend / Lookout descriptions are shown', async ({
		page,
	}) => {
		for (const [name, text] of Object.entries(DESCRIPTIONS)) {
			await expect(page.getByText(text).first(), name).toBeVisible();
		}
	});

	test('REQ-003: skill groups "Leadership & Delivery", "Engineering", "AI" appear in that order', async ({
		page,
	}) => {
		const re = /^(Leadership & Delivery|Engineering|AI):?$/;
		const headings = await page.getByRole('heading', { name: re }).allTextContents();
		expect(headings.map((h) => h.replace(/:$/, '').trim())).toEqual(SKILL_GROUPS_IN_ORDER);
	});

	test('REQ-003: old skills and the "language" group no longer appear', async ({ page }) => {
		const body = await page.locator('body').innerText();
		for (const skill of REMOVED_SKILLS) {
			expect(body, skill).not.toMatch(new RegExp(`\\b${skill}\\b`, 'i'));
		}
		await expect(page.getByRole('heading', { name: /^language:?$/i })).toHaveCount(0);
	});
});
