import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/preact';
import Skills from './skills.jsx';

describe('Skills', () => {
	it('renders each group name and its items', () => {
		render(<Skills skills={{ Testing: ['Unit', 'E2E'], Other: ['Misc'] }} />);
		expect(screen.getByRole('heading', { name: /Testing/ })).toBeInTheDocument();
		expect(screen.getByRole('heading', { name: /Other/ })).toBeInTheDocument();
		expect(screen.getByText('Unit')).toBeInTheDocument();
		expect(screen.getByText('E2E')).toBeInTheDocument();
		expect(screen.getByText('Misc')).toBeInTheDocument();
	});
});
