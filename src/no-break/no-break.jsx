// REQ-019: Chromium always allows a line break after an ASCII hyphen, and CSS on the running text cannot stop it.
// Wrapping each hyphenated word in span.nobr (white-space: nowrap) keeps it on one line. The DOM text stays identical
// (ASCII "-", no U+2011, no extra spaces), so copy/paste, PDF text extraction and ATS parsing are unaffected.
const HYPHENATED = /[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)+/gu;

/** Splits text into tokens { text, nobr }; nobr is true for words with an inner hyphen. Joined, the tokens equal the input. */
export function splitHyphenated(text) {
	const tokens = [];
	let last = 0;
	for (const m of text.matchAll(HYPHENATED)) {
		if (m.index > last) tokens.push({ text: text.slice(last, m.index), nobr: false });
		tokens.push({ text: m[0], nobr: true });
		last = m.index + m[0].length;
	}
	if (last < text.length) tokens.push({ text: text.slice(last), nobr: false });
	return tokens;
}

export default function NoBreak({ text }) {
	return splitHyphenated(text).map((t) =>
		t.nobr ? <span className="nobr">{t.text}</span> : t.text,
	);
}
