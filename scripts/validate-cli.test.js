// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { main } from './validate.js';

const real = () => JSON.parse(readFileSync('data/cv.json', 'utf8'));
const tmp = (text) => {
	const f = join(mkdtempSync(join(tmpdir(), 'cv-cli-')), 'cv.json');
	writeFileSync(f, text);
	return f;
};

describe('main (CLI body)', () => {
	const run = (env) => {
		const out = [];
		const err = [];
		const code = main(
			env,
			(m) => out.push(m),
			(m) => err.push(m),
		);
		return { code, out, err };
	};

	it('returns 0 and says the file is valid for valid data', () => {
		const f = tmp(JSON.stringify(real()));
		const { code, out, err } = run({ CV_JSON: f });
		expect(code).toBe(0);
		expect(out).toEqual([`${f} is valid`]);
		expect(err).toEqual([]);
	});

	it('returns 1 with a header and one line per error for invalid data', () => {
		const d = real();
		delete d.about;
		d.name = 5;
		const f = tmp(JSON.stringify(d));
		const { code, out, err } = run({ CV_JSON: f });
		expect(code).toBe(1);
		expect(out).toEqual([]);
		expect(err[0]).toBe(`Validation failed for ${f}:`);
		expect(err).toHaveLength(3);
		expect(err.slice(1).every((l) => l.startsWith('  - '))).toBe(true);
		expect(err.join('\n')).toMatch(/\/name: .*string/);
		expect(err.join('\n')).toMatch(/about/);
	});

	it('returns 1 for malformed JSON and for a missing file', () => {
		expect(run({ CV_JSON: tmp('{ nope') }).code).toBe(1);
		const missing = run({ CV_JSON: '/nonexistent/cv.json' });
		expect(missing.code).toBe(1);
		expect(missing.err.join('\n')).toMatch(/cannot read/);
	});

	it('defaults to data/cv.json when CV_JSON is unset or empty', () => {
		for (const env of [{}, { CV_JSON: '' }]) {
			const { code, out } = run(env);
			expect(code).toBe(0);
			expect(out[0]).toMatch(/data[\\/]cv\.json is valid$/);
		}
	});
});

describe('CLI process', () => {
	const cli = (file) =>
		spawnSync(process.execPath, ['scripts/validate.js'], {
			env: { ...process.env, CV_JSON: file },
			encoding: 'utf8',
		});

	it('exits 1 and lists errors on stderr for invalid data', () => {
		const d = real();
		delete d.experience[0].title;
		const r = cli(tmp(JSON.stringify(d)));
		expect(r.status).toBe(1);
		expect(r.stderr).toMatch(/Validation failed for/);
		expect(r.stderr).toMatch(/\/experience\/0.*required property 'title'/);
	});

	it('exits 0 for valid data', () => {
		const r = cli(tmp(JSON.stringify(real())));
		expect(r.status).toBe(0);
		expect(r.stdout).toMatch(/is valid/);
	});
});
