// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import cvMeta, { buildMeta, injectMeta } from './vite-plugin-cv-meta.js';

const cv = { name: 'Jane "J" <Ex> & Co', title: 'Engineer', about: `It's "great" <b>&</b>` };

describe('injectMeta', () => {
	it('fills the tags from cv.json and keeps the surrounding markup', () => {
		const plain = { name: 'Ann', title: 'Dev', about: 'Hello' };
		const out = injectMeta(
			'<html><head>\n\t\t<meta charset="utf-8" />\n\t\t<title>x</title>\n\t</head><body></body></html>',
			plain,
		);
		expect(out).toContain('<title>Ann – Dev</title>');
		expect(out).toContain('<meta name="description" content="Hello" />');
		expect(out).toBe(
			`<html><head>\n\t\t<meta charset="utf-8" />\n\t\t${buildMeta(plain)}\n\t\t</head><body></body></html>`,
		);
	});

	it('escapes cv.json values so they cannot break out of attributes', () => {
		const out = injectMeta('<head></head>', cv);
		expect(out).toContain('content="It&#39;s &quot;great&quot; &lt;b&gt;&amp;&lt;/b&gt;"');
		expect(out).not.toContain('<b>');
	});

	it('adds exactly one title when the document has none', () => {
		expect(injectMeta('<head></head>', cv).match(/<title>/g)).toHaveLength(1);
	});

	it('matches </head> case-insensitively', () => {
		expect(injectMeta('<HEAD><TITLE>a</TITLE></HEAD>', cv)).toContain('og:title');
	});

	it('throws a build error, not a silent no-op, when </head> is missing', () => {
		expect(() => injectMeta('<html><body></body></html>', cv)).toThrow(/<\/head>/);
	});
});

describe('cvMeta plugin', () => {
	const setup = () => {
		const root = mkdtempSync(join(tmpdir(), 'cv-meta-'));
		mkdirSync(join(root, 'data'));
		writeFileSync(
			join(root, 'data/cv.json'),
			JSON.stringify({ name: 'Zed', title: 'Q', about: 'A' }),
		);
		writeFileSync(join(root, 'data/photo.jpg'), 'JPEG');
		return cvMeta({ root });
	};

	it('runs before other html transforms and reads cv.json from root', () => {
		const plugin = setup();
		expect(plugin.name).toBe('cv-meta');
		expect(plugin.transformIndexHtml.order).toBe('pre');
		expect(plugin.transformIndexHtml.handler('<head></head>')).toContain('<title>Zed – Q</title>');
	});

	it('emits the photo as unhashed og-image.jpg', () => {
		const plugin = setup();
		const emitted = [];
		plugin.generateBundle.call({ emitFile: (f) => emitted.push(f) });
		expect(emitted).toHaveLength(1);
		expect(emitted[0]).toMatchObject({ type: 'asset', fileName: 'og-image.jpg' });
		expect(String(emitted[0].source)).toBe('JPEG');
	});
});
