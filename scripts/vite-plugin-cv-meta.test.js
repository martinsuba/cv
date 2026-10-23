import { describe, it, expect } from 'vitest';
import {
	escapeAttr,
	buildMeta,
	injectMeta,
	SITE_URL,
	OG_IMAGE_FILE,
} from './vite-plugin-cv-meta.js';

const cv = { name: 'Jane "J" <Ex> & Co', title: 'Engineer', about: `It's "great" <b>&</b>` };

describe('escapeAttr', () => {
	it('escapes & < > and both quote kinds', () => {
		expect(escapeAttr(`a&b<c>d"e'f`)).toBe('a&amp;b&lt;c&gt;d&quot;e&#39;f');
	});
});

describe('buildMeta', () => {
	const html = buildMeta(cv);
	it('builds the title with an en dash and escapes it', () => {
		expect(html).toContain('<title>Jane &quot;J&quot; &lt;Ex&gt; &amp; Co – Engineer</title>');
	});
	it('escapes the description in all attributes', () => {
		const about = 'It&#39;s &quot;great&quot; &lt;b&gt;&amp;&lt;/b&gt;';
		expect(html).toContain(`<meta name="description" content="${about}" />`);
		expect(html).toContain(`<meta property="og:description" content="${about}" />`);
		expect(html).not.toContain('<b>');
	});
	it('sets og and twitter tags with absolute URLs from the site constant', () => {
		expect(SITE_URL).toBe('https://martinsuba.github.io/cv/');
		expect(html).toContain('<meta property="og:type" content="profile" />');
		expect(html).toContain(`<meta property="og:url" content="${SITE_URL}" />`);
		expect(html).toContain(`<meta property="og:image" content="${SITE_URL}${OG_IMAGE_FILE}" />`);
		expect(html).toContain('<meta property="og:title" content="Jane &quot;J&quot;');
		expect(html).toContain('<meta name="twitter:card" content="summary" />');
	});
});

describe('injectMeta', () => {
	it('replaces an existing title and inserts the tags before </head>', () => {
		const out = injectMeta('<head><title>old</title></head>', cv);
		expect(out).not.toContain('old');
		expect(out.match(/<title>/g)).toHaveLength(1);
		expect(out.indexOf('og:title')).toBeLessThan(out.indexOf('</head>'));
	});
});
