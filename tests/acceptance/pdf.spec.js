// REQ-005: PDF generation. Contract: `npm run build` then `npm run pdf` writes dist/cv.pdf (T-004 generation, A4,
// content; T-005 page count and last page). The PDF tests read dist/cv.pdf, so in CI `pdf` must run before acceptance.
import { test, expect } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import { existsSync, statSync, unlinkSync } from 'node:fs';
import { cv, PDF_PATH, readPdf, norm, ROOT } from '../helpers.js';

const A4 = { width: 595.28, height: 841.89 };

test.describe('REQ-005 PDF', () => {
	// T-004: scripts/pdf.js does not exist yet (npm run pdf still points at the old generate-pdf.cjs).
	test.fixme('REQ-005: npm run pdf with no server running writes dist/cv.pdf by itself', () => {
		if (existsSync(PDF_PATH)) unlinkSync(PDF_PATH);
		const r = spawnSync('npm', ['run', '--silent', 'pdf'], {
			cwd: ROOT,
			env: { ...process.env, NODE_OPTIONS: '' },
			encoding: 'utf8',
			timeout: 90_000,
		});
		expect(r.status, `${r.stdout}\n${r.stderr}`).toBe(0);
		expect(existsSync(PDF_PATH)).toBe(true);
		expect(statSync(PDF_PATH).size).toBeGreaterThan(10_000);
	});

	test.fixme('REQ-005: dist/cv.pdf is A4', async () => {
		const { pages } = await readPdf();
		for (const p of pages) {
			expect(p.width).toBeCloseTo(A4.width, -1);
			expect(p.height).toBeCloseTo(A4.height, -1);
		}
	});

	// T-005: print layout tuned to fit.
	test.fixme('REQ-005: dist/cv.pdf has at most 3 pages', async () => {
		const { numPages } = await readPdf();
		expect(numPages).toBeGreaterThanOrEqual(1);
		expect(numPages).toBeLessThanOrEqual(3);
	});

	test.fixme('REQ-005: the last page holds at least 25% as much text as the average of the other pages', async () => {
		const { pages } = await readPdf();
		expect(pages.length).toBeGreaterThan(1);
		const lengths = pages.map((p) => p.text.length);
		const last = lengths.at(-1);
		const others = lengths.slice(0, -1);
		const avg = others.reduce((a, b) => a + b, 0) / others.length;
		expect(last).toBeGreaterThanOrEqual(0.25 * avg);
	});

	// T-004
	test.fixme('REQ-005: PDF text contains the name, every experience title and every education entry', async () => {
		const { pages } = await readPdf();
		const text = norm(pages.map((p) => p.text).join(' '));
		expect(text).toContain(norm(cv.name));
		for (const e of cv.experience) expect(text, e.title).toContain(norm(e.title));
		for (const e of cv.education) {
			expect(text, e.institution).toContain(norm(e.institution));
			expect(text, e.field).toContain(norm(e.field));
			expect(text, e.degree).toContain(norm(e.degree));
		}
	});
});
