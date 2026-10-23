// Serves dist/ under /cv/ on a free port, prints it with Playwright Chromium to dist/cv.pdf.
// Run `npm run build` first. Exits non-zero with a message on failure.
import { createServer } from 'node:http';
import { existsSync, readFile } from 'node:fs';
import { resolve, sep, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(import.meta.dirname, '..');
const BASE = '/cv';

const TYPES = {
	'.html': 'text/html; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.png': 'image/png',
	'.svg': 'image/svg+xml',
	'.woff2': 'font/woff2',
	'.pdf': 'application/pdf',
	'.json': 'application/json; charset=utf-8',
};

export function mimeType(file) {
	return TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream';
}

/** Maps a request URL to an absolute file inside `root`, or null if outside /cv/ or outside root. */
export function resolveRequest(root, url) {
	let pathname;
	try {
		pathname = decodeURIComponent(new URL(url, 'http://localhost').pathname);
	} catch {
		return null;
	}
	if (pathname.includes('\0')) return null;
	if (pathname !== BASE && !pathname.startsWith(`${BASE}/`)) return null;
	let rel = pathname.slice(BASE.length).replace(/^\/+/, '');
	if (rel === '') rel = 'index.html';
	const rootDir = resolve(root);
	const file = resolve(rootDir, rel);
	if (file !== rootDir && !file.startsWith(rootDir + sep)) return null;
	return file;
}

export function createStaticServer(root) {
	return createServer((req, res) => {
		const file =
			req.method === 'GET' || req.method === 'HEAD' ? resolveRequest(root, req.url) : null;
		if (!file) {
			res.writeHead(404).end('Not found');
			return;
		}
		readFile(file, (err, data) => {
			if (err) {
				res.writeHead(404).end('Not found');
				return;
			}
			res.writeHead(200, { 'Content-Type': mimeType(file), 'Content-Length': data.length });
			res.end(req.method === 'HEAD' ? undefined : data);
		});
	});
}

export async function makePdf({ root = ROOT } = {}) {
	const dist = resolve(root, 'dist');
	if (!existsSync(resolve(dist, 'index.html'))) {
		throw new Error('dist/index.html not found. Run `npm run build` first.');
	}
	const { chromium } = await import('@playwright/test');
	const server = createStaticServer(dist);
	let browser;
	try {
		await new Promise((ok, fail) => {
			server.once('error', fail);
			server.listen(0, '127.0.0.1', ok);
		});
		const url = `http://127.0.0.1:${server.address().port}${BASE}/`;
		browser = await chromium.launch();
		const page = await browser.newPage();
		await page.goto(url, { waitUntil: 'networkidle' });
		await page.evaluate(async () => {
			await document.fonts.ready;
			await Promise.all(
				[...document.images].map((img) =>
					img.complete ? undefined : new Promise((r) => ((img.onload = r), (img.onerror = r))),
				),
			);
		});
		await page.emulateMedia({ media: 'print' });
		const out = resolve(dist, 'cv.pdf');
		await page.pdf({
			path: out,
			format: 'A4',
			margin: { top: '1.5cm', right: '1.5cm', bottom: '1.5cm', left: '1.5cm' },
			printBackground: true,
		});
		return out;
	} finally {
		await browser?.close();
		await new Promise((r) => server.close(r));
	}
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	makePdf().then(
		(out) => console.log(`wrote ${out}`),
		(err) => {
			console.error(`pdf failed: ${err.message}`);
			process.exit(1);
		},
	);
}
