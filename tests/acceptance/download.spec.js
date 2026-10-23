// REQ-007: PDF download link (the served file is dist/cv.pdf from `npm run pdf`).
import { test, expect } from '@playwright/test';

test.describe('REQ-007 PDF download link', () => {
	test('REQ-007: a visible "Download PDF" link points to cv.pdf relative to the page and the file is served', async ({
		page,
		request,
	}) => {
		await page.goto('/cv/');
		const link = page.getByRole('link', { name: /download pdf/i });
		await expect(link).toBeVisible();
		const href = await link.getAttribute('href');
		expect(href).toMatch(/^(\.\/)?cv\.pdf$/);
		const url = new URL(href, page.url());
		expect(url.pathname).toBe('/cv/cv.pdf');
		const res = await request.get(url.href);
		expect(res.status()).toBe(200);
		expect(res.headers()['content-type']).toContain('application/pdf');
	});
});
