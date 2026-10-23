import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/preact';
import Skills from './skills.jsx';

describe('Skills', () => {
	it('renders each group as a heading followed by a list with one li per skill', () => {
		render(<Skills skills={{ Testing: ['Unit', 'E2E'], Other: ['Misc'] }} number={3} />);
		expect(screen.getByRole('heading', { name: 'Testing' })).toBeInTheDocument();
		expect(screen.getByRole('heading', { name: 'Other' })).toBeInTheDocument();
		const items = screen.getAllByRole('listitem').map((li) => li.textContent);
		expect(items).toEqual(['Unit', 'E2E', 'Misc']);
		expect(screen.getByText('Unit').parentElement.tagName).toBe('UL');
	});
	it('labels the section with the number it is given', () => {
		render(<Skills skills={{ A: ['x'] }} number={3} />);
		expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('03 / Skills');
	});

	it('keeps the group order of the data', () => {
		render(<Skills skills={{ B: ['x'], A: ['y'] }} />);
		const names = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
		expect(names).toEqual(['B', 'A']);
	});
});
