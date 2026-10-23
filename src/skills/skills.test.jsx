import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/preact';
import Skills from './skills.jsx';

describe('Skills', () => {
	it('renders each group as a heading followed by its items joined with ", " in one paragraph', () => {
		const { container } = render(<Skills skills={{ Testing: ['Unit', 'E2E'], Other: ['Misc'] }} />);
		expect(screen.getByRole('heading', { name: 'Testing:' })).toBeInTheDocument();
		expect(screen.getByRole('heading', { name: 'Other:' })).toBeInTheDocument();
		expect(screen.getByText('Unit, E2E').tagName).toBe('P');
		expect(screen.getByText('Misc').tagName).toBe('P');
		expect(container.querySelector('i, li')).toBeNull();
	});

	it('keeps the group order of the data', () => {
		render(<Skills skills={{ B: ['x'], A: ['y'] }} />);
		const names = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
		expect(names).toEqual(['B:', 'A:']);
	});
});
