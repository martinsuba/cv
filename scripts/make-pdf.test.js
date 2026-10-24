// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import net from 'node:net';
import { makePdf } from './pdf.js';

const makeDist = () => {
	const root = mkdtempSync(join(tmpdir(), 'cvpdf-fake-'));
	mkdirSync(join(root, 'dist'));
	writeFileSync(join(root, 'dist', 'index.html'), '<h1>hi</h1>');
	return root;
};

const portOpen = (port) =>
	new Promise((ok) => {
		const s = net.connect(port, '127.0.0.1');
		s.once('connect', () => (s.destroy(), ok(true)));
		s.once('error', () => ok(false));
	});

/**
 * Fake chromium. Records call order in `calls`, goto URL(s), pdf args and the evaluate function.
 * `onGoto(url)` runs while the server should be up. Options make pdf / close / launch fail.
 */
const fake = ({ pdfError, closeError, launchError, onGoto } = {}) => {
	const calls = [];
	const state = { urls: [], pdfArgs: null, evaluateFn: null, port: null };
	const page = {
		goto: async (url, o) => {
			calls.push('goto');
			state.urls.push([url, o]);
			state.port = Number(new URL(url).port);
			await onGoto?.(url);
		},
		evaluate: async (fn) => {
			calls.push('evaluate');
			state.evaluateFn = fn;
		},
		pdf: async (a) => {
			calls.push('pdf');
			state.pdfArgs = a;
			if (pdfError) throw pdfError;
		},
	};
	const browser = {
		newPage: async () => page,
		close: async () => {
			calls.push('close');
			if (closeError) throw closeError;
		},
	};
	const chromium = {
		launch: async () => {
			calls.push('launch');
			if (launchError) throw launchError;
			return browser;
		},
	};
	return { chromium, state, calls };
};

const withDist = async (fn) => {
	const root = makeDist();
	try {
		await fn(root);
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
};

describe('makePdf with a fake browser', () => {
	it('prints A4 with 16 mm margins and backgrounds to the target, after waiting', () =>
		withDist(async (root) => {
			const { chromium, state, calls } = fake();
			const out = join(root, 'x.pdf');
			expect(await makePdf({ root, out, chromium })).toBe(out);
			expect(state.pdfArgs).toEqual({
				path: out,
				format: 'A4',
				margin: { top: '16mm', right: '16mm', bottom: '16mm', left: '16mm' },
				printBackground: true,
			});
			expect(calls).toEqual(['launch', 'goto', 'evaluate', 'pdf', 'close']);
			const [[url, opts]] = state.urls;
			expect(url).toMatch(/^http:\/\/127\.0\.0\.1:\d+\/cv\/$/);
			expect(opts).toEqual({ waitUntil: 'networkidle' });
		}));

	it('defaults the target to dist/cv.pdf under root', () =>
		withDist(async (root) => {
			const { chromium, state } = fake();
			expect(await makePdf({ root, chromium })).toBe(join(root, 'dist', 'cv.pdf'));
			expect(state.pdfArgs.path).toBe(join(root, 'dist', 'cv.pdf'));
		}));

	it('serves the built page while printing and stops the server afterwards', () =>
		withDist(async (root) => {
			let body;
			const { chromium, state } = fake({
				onGoto: async (url) => {
					body = await (await fetch(url)).text();
				},
			});
			await makePdf({ root, chromium });
			expect(body).toBe('<h1>hi</h1>');
			expect(await portOpen(state.port)).toBe(false);
		}));

	it('waits for fonts and for images that have not loaded yet', () =>
		withDist(async (root) => {
			const { chromium, state } = fake();
			await makePdf({ root, chromium });
			let fontsResolved = false;
			const pending = { complete: false };
			vi.stubGlobal('document', {
				fonts: { ready: new Promise((r) => setTimeout(() => ((fontsResolved = true), r()), 10)) },
				images: [{ complete: true }, pending],
			});
			try {
				let done = false;
				const p = state.evaluateFn().then(() => (done = true));
				await new Promise((r) => setTimeout(r, 40));
				expect(fontsResolved).toBe(true);
				expect(done).toBe(false); // still waiting for the pending image
				pending.onload();
				await p;
				expect(done).toBe(true);
				// a broken image must not hang the print either
				const broken = { complete: false };
				globalThis.document.images = [broken];
				const q = state.evaluateFn();
				await new Promise((r) => setTimeout(r, 10));
				broken.onerror();
				await q;
			} finally {
				vi.unstubAllGlobals();
			}
		}));

	it('stops the server and closes the browser when page.pdf throws, and rethrows', () =>
		withDist(async (root) => {
			const { chromium, state, calls } = fake({ pdfError: new Error('boom') });
			await expect(makePdf({ root, chromium })).rejects.toThrow('boom');
			expect(calls).toEqual(['launch', 'goto', 'evaluate', 'pdf', 'close']);
			expect(await portOpen(state.port)).toBe(false);
		}));

	it('stops the server when the browser fails to launch', () =>
		withDist(async (root) => {
			let port;
			const real = net.Server.prototype.listen;
			const spy = vi.spyOn(net.Server.prototype, 'listen').mockImplementation(function (...a) {
				this.once('listening', () => (port = this.address().port));
				return real.apply(this, a);
			});
			const { chromium } = fake({ launchError: new Error('no chrome') });
			try {
				await expect(makePdf({ root, chromium })).rejects.toThrow('no chrome');
			} finally {
				spy.mockRestore();
			}
			expect(typeof port).toBe('number');
			expect(await portOpen(port)).toBe(false);
		}));

	it('a failing browser.close does not mask success or the original error', () =>
		withDist(async (root) => {
			const ok = fake({ closeError: new Error('close failed') });
			await expect(makePdf({ root, chromium: ok.chromium })).resolves.toBeTruthy();
			const bad = fake({ closeError: new Error('close failed'), pdfError: new Error('boom') });
			await expect(makePdf({ root, chromium: bad.chromium })).rejects.toThrow('boom');
		}));
});
