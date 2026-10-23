// REQ-006: print layout (T-005).
import { test, expect } from '@playwright/test';
import { cv, readPdf, norm } from '../helpers.js';

test.describe('REQ-006 print layout', () => {
	// T-005 (needs dist/cv.pdf from T-004): title and the end of the description must be on the same page.
	test.fixme('REQ-006: no experience entry is split across two PDF pages', async () => {
		const { pages } = await readPdf();
		const texts = pages.map((p) => norm(p.text));
		const pageOf = (s) => texts.findIndex((t) => t.includes(norm(s)));
		for (const e of cv.experience) {
			const tail = norm(e.description).split(' ').slice(-6).join(' ');
			const titlePage =
				pageOf(`${e.title} ${e.company.name}`) >= 0
					? pageOf(`${e.title} ${e.company.name}`)
					: pageOf(e.title);
			const endPage = pageOf(tail);
			expect(titlePage, `title of "${e.title}" found`).toBeGreaterThanOrEqual(0);
			expect(endPage, `end of description of "${e.title}" found`).toBe(titlePage);
		}
	});

	// T-005: "Download PDF" link does not exist yet.
	test.fixme('REQ-006: the PDF download link is hidden in print media', async ({ page }) => {
		await page.goto('/cv/');
		const link = page.getByRole('link', { name: /download pdf/i });
		await expect(link).toBeVisible();
		await page.emulateMedia({ media: 'print' });
		await expect(link).toBeHidden();
	});
});
