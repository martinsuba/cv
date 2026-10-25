import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/preact';
import NoBreak, { splitHyphenated } from './no-break.jsx';

describe('splitHyphenated', () => {
	it('returns one plain token for text without a hyphen', () => {
		expect(splitHyphenated('plain text')).toEqual([{ text: 'plain text', nobr: false }]);
	});
	it('returns no tokens for an empty string', () => {
		expect(splitHyphenated('')).toEqual([]);
	});
	it('marks a single hyphenated word', () => {
		expect(splitHyphenated('at F-Secure now')).toEqual([
			{ text: 'at ', nobr: false },
			{ text: 'F-Secure', nobr: true },
			{ text: ' now', nobr: false },
		]);
	});
	it('marks several hyphenated words, including ones with more than one hyphen', () => {
		expect(splitHyphenated('AI-orchestrated, user-facing and state-of-the-art')).toEqual([
			{ text: 'AI-orchestrated', nobr: true },
			{ text: ', ', nobr: false },
			{ text: 'user-facing', nobr: true },
			{ text: ' and ', nobr: false },
			{ text: 'state-of-the-art', nobr: true },
		]);
	});
	it('handles words that start with a Unicode letter or digit', () => {
		expect(splitHyphenated('VÚB-banka Šuba-2')).toEqual([
			{ text: 'VÚB-banka', nobr: true },
			{ text: ' ', nobr: false },
			{ text: 'Šuba-2', nobr: true },
		]);
	});
	it('does not mark standalone dashes, leading or trailing hyphens or arrows', () => {
		for (const s of ['a - b', 'a – b', '-lead', 'trail-', 'a -> b', 'a → b', 'a- b', 'a -b'])
			expect(splitHyphenated(s), s).toEqual([{ text: s, nobr: false }]);
	});
	it('keeps the joined text identical to the input', () => {
		const s = 'x - F-Secure → AI-orchestrated (e-mail)-';
		expect(
			splitHyphenated(s)
				.map((t) => t.text)
				.join(''),
		).toBe(s);
	});
});

describe('NoBreak', () => {
	it('wraps hyphenated words in span.nobr and leaves the text content unchanged', () => {
		const { container } = render(
			<p>
				<NoBreak text="at F-Secure and AI-orchestrated tools" />
			</p>,
		);
		const spans = [...container.querySelectorAll('span.nobr')];
		expect(spans.map((s) => s.textContent)).toEqual(['F-Secure', 'AI-orchestrated']);
		expect(container.textContent).toBe('at F-Secure and AI-orchestrated tools');
	});
	it('renders no span for text without hyphenated words', () => {
		const { container } = render(
			<p>
				<NoBreak text="nothing here" />
			</p>,
		);
		expect(container.querySelector('span')).toBeNull();
		expect(container.textContent).toBe('nothing here');
	});
});
