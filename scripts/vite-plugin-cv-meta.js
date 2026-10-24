// Vite plugin: fills <title>, description, Open Graph and Twitter tags in the static index.html
// from data/cv.json at build time, and emits the photo as an unhashed dist/og-image.jpg.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Public site URL (GitHub Pages). Single source for og:url and the absolute og:image URL.
export const SITE_URL = 'https://martinsuba.github.io/cv/';
export const OG_IMAGE_FILE = 'og-image.jpg';

export function escapeAttr(value) {
	return String(value)
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

export function buildMeta(cv) {
	const title = escapeAttr(`${cv.name} – ${cv.title}`);
	const about = escapeAttr(cv.about);
	const prop = (p, c) => `<meta property="${p}" content="${c}" />`;
	return [
		`<title>${title}</title>`,
		`<meta name="description" content="${about}" />`,
		prop('og:title', title),
		prop('og:description', about),
		prop('og:type', 'profile'),
		prop('og:url', escapeAttr(SITE_URL)),
		prop('og:image', escapeAttr(SITE_URL + OG_IMAGE_FILE)),
		'<meta name="twitter:card" content="summary" />',
	].join('\n\t\t');
}

export function injectMeta(html, cv) {
	if (!/<\/head>/i.test(html)) {
		throw new Error('cv-meta: index.html has no </head>, cannot inject meta tags');
	}
	const stripped = html.replace(/<title>[\s\S]*?<\/title>\s*/i, '');
	return stripped.replace(/(\s*)<\/head>/i, (_, ws) => `\n\t\t${buildMeta(cv)}${ws}</head>`);
}

export default function cvMeta({ root = process.cwd() } = {}) {
	const cvPath = resolve(root, 'data/cv.json');
	return {
		name: 'cv-meta',
		transformIndexHtml: {
			order: 'pre',
			handler: (html) => injectMeta(html, JSON.parse(readFileSync(cvPath, 'utf8'))),
		},
		generateBundle() {
			this.emitFile({
				type: 'asset',
				fileName: OG_IMAGE_FILE,
				source: readFileSync(resolve(root, 'data/photo.jpg')),
			});
		},
	};
}
