// REQ-002 (and REQ-017 for the entry without description/highlights): data validation. Contract for T-001: `npm run validate` validates data/cv.json, or the file named in the
// CV_JSON environment variable if set; it prints field-level errors and exits non-zero on invalid data.
// `npm run build` runs validate first, so a broken CV_JSON fails the build too.
import { test, expect } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { ROOT } from '../helpers.js';

const fixture = (name) => resolve(ROOT, 'tests/fixtures', name);

function npm(args, env = {}) {
	const r = spawnSync('npm', args, {
		cwd: ROOT,
		env: { ...process.env, NODE_OPTIONS: '', ...env },
		encoding: 'utf8',
	});
	return { code: r.status, out: `${r.stdout}\n${r.stderr}` };
}

test.describe('REQ-002 validate', () => {
	test('REQ-002: valid data/cv.json exits 0', () => {
		const r = npm(['run', '--silent', 'validate']);
		expect(r.code, r.out).toBe(0);
	});

	test('REQ-002: experience entry without title exits non-zero and names the field', () => {
		const r = npm(['run', '--silent', 'validate'], {
			CV_JSON: fixture('invalid-missing-title.json'),
		});
		expect(r.code, r.out).not.toBe(0);
		expect(r.out).toMatch(/title/);
	});

	test('REQ-017: experience entry with neither description nor highlights exits non-zero and names the entry', () => {
		const r = npm(['run', '--silent', 'validate'], {
			CV_JSON: fixture('invalid-no-description-or-highlights.json'),
		});
		expect(r.code, r.out).not.toBe(0);
		expect(r.out).toMatch(/experience\/0/);
	});

	test('REQ-002: wrong type (education.from is a number) exits non-zero and names the field', () => {
		const r = npm(['run', '--silent', 'validate'], { CV_JSON: fixture('invalid-wrong-type.json') });
		expect(r.code, r.out).not.toBe(0);
		expect(r.out).toMatch(/from/);
	});

	test('REQ-002: malformed JSON exits non-zero', () => {
		const r = npm(['run', '--silent', 'validate'], {
			CV_JSON: fixture('invalid-json-syntax.json'),
		});
		expect(r.code, r.out).not.toBe(0);
		expect(r.out).toMatch(/JSON|syntax|parse/i);
	});

	test('REQ-002: npm run build fails on a broken cv.json (validation runs first)', () => {
		const outDir = mkdtempSync(join(tmpdir(), 'cv-build-'));
		try {
			const r = npm(['run', '--silent', 'build', '--', '--outDir', outDir], {
				CV_JSON: fixture('invalid-missing-title.json'),
			});
			expect(r.code, r.out).not.toBe(0);
			expect(r.out).toMatch(/title/);
		} finally {
			rmSync(outDir, { recursive: true, force: true });
		}
	});
});
