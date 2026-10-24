// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { validateFile, validateData } from './validate.js';

const real = () => JSON.parse(readFileSync('data/cv.json', 'utf8'));
const tmp = (text) => {
	const f = join(mkdtempSync(join(tmpdir(), 'cv-val-')), 'cv.json');
	writeFileSync(f, text);
	return f;
};

describe('validateData', () => {
	it('accepts the real data/cv.json', () => {
		expect(validateData(real())).toEqual([]);
	});

	it('accepts an experience entry without company.link and a contact without optional entries', () => {
		const d = real();
		delete d.experience[0].company.link;
		d.contact = {};
		expect(validateData(d)).toEqual([]);
	});

	it('accepts an entry with only highlights, and one with both', () => {
		const d = real();
		d.experience[0].highlights = ['A point.'];
		expect(validateData(d)).toEqual([]);
		delete d.experience[0].description;
		expect(validateData(d)).toEqual([]);
	});

	it('rejects an entry with neither description nor highlights and names the entry', () => {
		const d = real();
		delete d.experience[1].description;
		expect(validateData(d).join('\n')).toMatch(/\/experience\/1: .*anyOf/);
	});

	it('rejects empty or non-string highlights', () => {
		const d = real();
		d.experience[0].highlights = [];
		expect(validateData(d).join('\n')).toMatch(/\/experience\/0\/highlights/);
		d.experience[0].highlights = [''];
		expect(validateData(d).join('\n')).toMatch(/\/experience\/0\/highlights\/0/);
		d.experience[0].highlights = [3];
		expect(validateData(d).join('\n')).toMatch(/\/experience\/0\/highlights\/0/);
	});

	it('accepts location and languages and rejects malformed ones', () => {
		const d = real();
		d.location = 'Example City';
		d.languages = [{ language: 'Examplish', level: 'native' }];
		expect(validateData(d)).toEqual([]);
		d.languages = [{ language: 'Examplish' }];
		expect(validateData(d).join('\n')).toMatch(/\/languages\/0.*level/);
		d.languages = [];
		d.location = '';
		expect(validateData(d).join('\n')).toMatch(/\/location/);
	});

	it('names the path of a missing required field', () => {
		const d = real();
		delete d.experience[0].title;
		const errs = validateData(d);
		expect(errs.join('\n')).toMatch(/\/experience\/0.*required property 'title'/);
	});

	it('names the path of a wrong type', () => {
		const d = real();
		d.education[0].from = 2010;
		expect(validateData(d).join('\n')).toMatch(/\/education\/0\/from.*string/);
	});

	it('rejects unknown top-level properties', () => {
		expect(validateData({ ...real(), extra: 1 }).join('\n')).toMatch(/extra/);
	});

	it('rejects empty skill groups and non-string skills', () => {
		const d = real();
		d.skills = { Empty: [] };
		expect(validateData(d).join('\n')).toMatch(/\/skills\/Empty/);
		d.skills = { Bad: [1] };
		expect(validateData(d).join('\n')).toMatch(/\/skills\/Bad\/0/);
	});

	it('rejects missing top-level fields', () => {
		const d = real();
		delete d.about;
		expect(validateData(d).join('\n')).toMatch(/about/);
	});
});

describe('validateFile', () => {
	it('reports a parse error for malformed JSON', () => {
		const errs = validateFile(tmp('{ "name": '));
		expect(errs.join('\n')).toMatch(/not valid JSON/i);
	});

	it('reports a missing file', () => {
		expect(validateFile('/nonexistent/cv.json').join('\n')).toMatch(/cannot read/i);
	});

	it('returns no errors for valid JSON', () => {
		expect(validateFile(tmp(JSON.stringify(real())))).toEqual([]);
	});
});
