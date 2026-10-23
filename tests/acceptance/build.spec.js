// REQ-004: modern build (Vite + Preact, static site under /cv/).
import { test, expect } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { ROOT } from '../helpers.js';

function listFiles(dir, prefix = '') {
	return readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
		d.isDirectory() ? listFiles(join(dir, d.name), `${prefix}${d.name}/`) : [`${prefix}${d.name}`],
	);
}

test.describe('REQ-004 modern build', () => {
	test('REQ-004: npm run build succeeds on Node 24 without legacy OpenSSL flags and writes the output dir', () => {
		const outDir = mkdtempSync(join(tmpdir(), 'cv-build-'));
		try {
			expect(Number(process.versions.node.split('.')[0])).toBeGreaterThanOrEqual(24);
			const r = spawnSync('npm', ['run', '--silent', 'build', '--', '--outDir', outDir], {
				cwd: ROOT,
				env: { ...process.env, NODE_OPTIONS: '' },
				encoding: 'utf8',
			});
			expect(r.status, `${r.stdout}\n${r.stderr}`).toBe(0);
			expect(existsSync(join(outDir, 'index.html'))).toBe(true);
		} finally {
			rmSync(outDir, { recursive: true, force: true });
		}
	});

	test('REQ-004: under /cv/ every requested asset returns 200 and the console has no errors', async ({
		page,
	}) => {
		const errors = [];
		const responses = [];
		page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
		page.on('pageerror', (e) => errors.push(String(e)));
		page.on('response', (r) => responses.push({ url: r.url(), status: r.status() }));

		await page.goto('/cv/', { waitUntil: 'networkidle' });

		const bad = responses.filter((r) => r.status !== 200);
		expect(bad, `non-200 responses: ${JSON.stringify(bad)}`).toEqual([]);
		const urls = responses.map((r) => new URL(r.url).pathname);
		expect(
			urls.some((u) => u.startsWith('/cv/') && u.endsWith('.js')),
			'JS under /cv/',
		).toBe(true);
		expect(
			urls.some((u) => u.startsWith('/cv/') && u.endsWith('.css')),
			'CSS under /cv/',
		).toBe(true);
		expect(
			urls.some((u) => u.startsWith('/cv/') && /\.(jpe?g|png|webp)$/.test(u)),
			'image under /cv/',
		).toBe(true);
		const photoOk = await page.evaluate(() => {
			const img = document.querySelector('img');
			return !!img && img.complete && img.naturalWidth > 0;
		});
		expect(photoOk, 'photo decoded').toBe(true);
		expect(errors).toEqual([]);
	});

	test('REQ-004: dist/ contains no service worker and no web app manifest', () => {
		const dist = resolve(ROOT, 'dist');
		const files = listFiles(dist);
		expect(files).toContain('index.html');
		const offenders = files.filter((f) =>
			/(^|\/)(sw|service-worker|workbox[^/]*)\.js$|(^|\/)manifest\.(json|webmanifest)$|\.webmanifest$/i.test(
				f,
			),
		);
		expect(offenders).toEqual([]);
		const html = readFileSync(join(dist, 'index.html'), 'utf8');
		expect(html).not.toMatch(/rel=["']manifest["']/);
		for (const f of files.filter((f) => f.endsWith('.js'))) {
			expect(readFileSync(join(dist, f), 'utf8'), f).not.toMatch(/serviceWorker\.register/);
		}
	});
});
