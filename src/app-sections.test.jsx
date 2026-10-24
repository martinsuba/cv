import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/preact';
import App from './app.jsx';

// The mocked module hands out whatever `state.cv` holds at render time.
const state = vi.hoisted(() => ({ cv: null }));
vi.mock('../data/cv.json', () => ({
	get default() {
		return state.cv;
	},
}));

const real = (await vi.importActual('../data/cv.json')).default;

const headings = () => screen.queryAllByRole('heading', { level: 2 }).map((h) => h.textContent);

describe('App sections without content', () => {
	beforeEach(() => {
		state.cv = structuredClone(real);
	});

	it('renders all four sections numbered 01-04 for full content', () => {
		render(<App />);
		expect(headings()).toEqual([
			expect.stringMatching(/^01 \/ About/),
			expect.stringMatching(/^02 \/ Experience/),
			expect.stringMatching(/^03 \/ Skills/),
			expect.stringMatching(/^04 \/ Education/),
		]);
	});

	it('renders no sections when all are empty', () => {
		state.cv = { ...real, about: null, experience: [], skills: {}, education: [] };
		render(<App />);
		expect(headings()).toEqual([]);
	});

	it('renders no About heading when about is missing and keeps numbering consecutive', () => {
		delete state.cv.about;
		render(<App />);
		expect(headings()).toEqual([
			expect.stringMatching(/^01 \/ Experience/),
			expect.stringMatching(/^02 \/ Skills/),
			expect.stringMatching(/^03 \/ Education/),
		]);
	});

	it('skips empty experience and renumbers', () => {
		state.cv.experience = [];
		render(<App />);
		expect(headings()).toEqual([
			expect.stringMatching(/^01 \/ About/),
			expect.stringMatching(/^02 \/ Skills/),
			expect.stringMatching(/^03 \/ Education/),
		]);
	});

	it('skips empty skills and renumbers', () => {
		state.cv.skills = {};
		render(<App />);
		expect(headings()).toEqual([
			expect.stringMatching(/^01 \/ About/),
			expect.stringMatching(/^02 \/ Experience/),
			expect.stringMatching(/^03 \/ Education/),
		]);
	});

	it('skips empty education', () => {
		state.cv.education = [];
		render(<App />);
		expect(headings()).toEqual([
			expect.stringMatching(/^01 \/ About/),
			expect.stringMatching(/^02 \/ Experience/),
			expect.stringMatching(/^03 \/ Skills/),
		]);
	});

	it('renders only the remaining section as 01 when just one has content', () => {
		state.cv = { ...real, about: null, experience: [], skills: {} };
		render(<App />);
		expect(headings()).toEqual([expect.stringMatching(/^01 \/ Education/)]);
	});

	it('renders Languages after Education as the next number when languages are present', () => {
		state.cv.languages = [{ language: 'Examplish', level: 'native' }];
		render(<App />);
		expect(headings()).toEqual([
			expect.stringMatching(/^01 \/ About/),
			expect.stringMatching(/^02 \/ Experience/),
			expect.stringMatching(/^03 \/ Skills/),
			expect.stringMatching(/^04 \/ Education/),
			expect.stringMatching(/^05 \/ Languages/),
		]);
		expect(screen.getByText('Examplish (native)')).toBeInTheDocument();
	});

	it('renders no Languages section for an empty languages array', () => {
		state.cv.languages = [];
		render(<App />);
		expect(headings().some((h) => h.includes('Languages'))).toBe(false);
	});

	it('passes the top-level location to the header', () => {
		state.cv.location = 'Example City';
		render(<App />);
		expect(screen.getByText('Example City')).toBeInTheDocument();
	});
});
