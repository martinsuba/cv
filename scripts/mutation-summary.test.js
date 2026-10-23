// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { summarize, toMarkdown } from './mutation-summary.js';

const m = (status, line = 1) => ({ status, mutatorName: 'X', location: { start: { line } } });
const report = {
	files: {
		'a.js': { mutants: [m('Killed'), m('Timeout'), m('Survived', 7), m('CompileError')] },
		'b.js': { mutants: [m('Killed'), m('NoCoverage', 3)] },
	},
};

describe('summarize', () => {
	it('counts statuses, ignores errors and scores killed + timeout over valid mutants', () => {
		const s = summarize(report);
		expect(s.counts).toEqual({ Killed: 2, Survived: 1, Timeout: 1, NoCoverage: 1 });
		expect(s.total).toBe(5);
		expect(s.score).toBe(60);
		expect(s.survivors).toEqual([
			{ file: 'a.js', line: 7, mutator: 'X', status: 'Survived' },
			{ file: 'b.js', line: 3, mutator: 'X', status: 'NoCoverage' },
		]);
	});
	it('scores an empty report as 100', () => {
		expect(summarize({ files: {} }).score).toBe(100);
	});
});

describe('toMarkdown', () => {
	it('renders the score row, the timeout share and a per-file survivor table', () => {
		const md = toMarkdown(summarize(report));
		expect(md).toContain('| 2 | 1 | 1 | 1 | 60.00 % |');
		expect(md).toContain('Timeouts: 20.0 %');
		expect(md).toContain('| a.js | 1 |');
	});
});
