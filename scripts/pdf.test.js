// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createStaticServer, resolveRequest, mimeType } from './pdf.js';

describe('mimeType', () => {
	it.each([
		['a.html', 'text/html'],
		['a.js', 'text/javascript'],
		['a.css', 'text/css'],
		['a.jpg', 'image/jpeg'],
		['a.png', 'image/png'],
		['a.svg', 'image/svg+xml'],
		['a.woff2', 'font/woff2'],
		['a.pdf', 'application/pdf'],
		['a.json', 'application/json'],
	])('%s', (file, type) => {
		expect(mimeType(file)).toContain(type);
	});
	it('falls back to octet-stream', () => {
		expect(mimeType('a.xyz')).toBe('application/octet-stream');
	});
});

describe('resolveRequest', () => {
	const root = '/srv/dist';
	it('maps /cv/ and /cv to index.html', () => {
		expect(resolveRequest(root, '/cv/')).toBe('/srv/dist/index.html');
		expect(resolveRequest(root, '/cv')).toBe('/srv/dist/index.html');
	});
	it('maps assets under /cv/', () => {
		expect(resolveRequest(root, '/cv/assets/a.js?x=1')).toBe('/srv/dist/assets/a.js');
	});
	it('rejects paths outside the base', () => {
		expect(resolveRequest(root, '/')).toBeNull();
		expect(resolveRequest(root, '/other/index.html')).toBeNull();
	});
	it('rejects traversal, also encoded', () => {
		expect(resolveRequest(root, '/cv/../secret')).toBeNull();
		expect(resolveRequest(root, '/cv/%2e%2e/secret')).toBeNull();
		expect(resolveRequest(root, '/cv/..%2f..%2fetc/passwd')).toBeNull();
		expect(resolveRequest(root, '/cv/%00')).toBeNull();
	});
});

describe('createStaticServer', () => {
	let dir, server, base;
	beforeAll(async () => {
		dir = mkdtempSync(join(tmpdir(), 'cvpdf-'));
		const dist = join(dir, 'dist');
		mkdirSync(dist);
		writeFileSync(join(dist, 'index.html'), '<h1>hi</h1>');
		writeFileSync(join(dist, 'cv.pdf'), 'x');
		writeFileSync(join(dir, 'secret.txt'), 'secret');
		server = createStaticServer(dist);
		await new Promise((r) => server.listen(0, '127.0.0.1', r));
		base = `http://127.0.0.1:${server.address().port}`;
	});
	afterAll(async () => {
		await new Promise((r) => server.close(r));
		rmSync(dir, { recursive: true, force: true });
	});

	it('serves index.html at /cv/ with content type', async () => {
		const res = await fetch(`${base}/cv/`);
		expect(res.status).toBe(200);
		expect(res.headers.get('content-type')).toContain('text/html');
		expect(await res.text()).toBe('<h1>hi</h1>');
	});
	it('serves pdf with its type', async () => {
		const res = await fetch(`${base}/cv/cv.pdf`);
		expect(res.headers.get('content-type')).toBe('application/pdf');
	});
	it('404s for missing files, a directory, and outside the base', async () => {
		expect((await fetch(`${base}/cv/nope.js`)).status).toBe(404);
		expect((await fetch(`${base}/`)).status).toBe(404);
	});
	it('does not serve files outside dist', async () => {
		const res = await fetch(`${base}/cv/%2e%2e/secret.txt`);
		expect(res.status).toBe(404);
	});
});
