// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { summarize, toMarkdown, survivorList, run } from './mutation-summary.js';

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

describe('survivorList', () => {
	it('is empty without survivors and lists file:line and mutator', () => {
		expect(survivorList([])).toBe('');
		const out = survivorList(summarize(report).survivors);
		expect(out).toContain('`a.js:7` X (Survived)');
		expect(out).toContain('`b.js:3` X (NoCoverage)');
	});
	it('caps the list at 30', () => {
		const many = Array.from({ length: 40 }, (_, i) => ({
			file: 'f.js',
			line: i + 1,
			mutator: 'M',
			status: 'Survived',
		}));
		const out = survivorList(many);
		expect(out).toContain('(30 of 40)');
		expect(out).toContain('f.js:30');
		expect(out).not.toContain('f.js:31');
	});
});

describe('run', () => {
	const reader = (r) => () => JSON.stringify(r);
	it('fails with a clear message when the report is missing', () => {
		const res = run('nope.json', () => {
			throw new Error('ENOENT');
		});
		expect(res.exitCode).toBe(1);
		expect(res.error).toContain('nope.json');
		expect(res.error).toContain('ENOENT');
	});
	it('fails but still renders the table when timeouts exceed 10 %', () => {
		const res = run('r.json', reader(report)); // 20 % timeouts
		expect(res.exitCode).toBe(1);
		expect(res.markdown).toContain('| 2 | 1 | 1 | 1 | 60.00 % |');
		expect(res.markdown).toContain('FAILED');
	});
	it('passes with 10 % timeouts or fewer and lists survivors', () => {
		const ok = {
			files: {
				'a.js': { mutants: [...Array(9).fill(m('Killed')), m('Timeout'), m('Survived', 4)] },
			},
		};
		const res = run('r.json', reader(ok));
		expect(res.exitCode).toBe(0);
		expect(res.markdown).toContain('`a.js:4` X (Survived)');
	});
});
