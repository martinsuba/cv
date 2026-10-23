import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/preact';
import App from './app.jsx';
import cv from '../data/cv.json';

describe('App', () => {
	it('renders the name from data/cv.json and one entry per experience', () => {
		render(<App />);
		expect(screen.getByRole('heading', { level: 1, name: cv.name })).toBeInTheDocument();
		for (const e of cv.experience) {
			expect(screen.getAllByText(e.title).length).toBeGreaterThan(0);
		}
	});

	it('numbers the section labels 01, 02, ... in render order', () => {
		render(<App />);
		const labels = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
		expect(labels.length).toBeGreaterThan(1);
		labels.forEach((text, i) => {
			expect(text).toMatch(new RegExp(`^${String(i + 1).padStart(2, '0')} / \\S`));
		});
	});
});
