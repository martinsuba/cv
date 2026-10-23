import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/preact';
import Header from './header.jsx';

const cv = {
	name: 'Jane Example',
	title: 'Example Engineer',
	contact: { email: 'jane@example.invalid', github: 'https://github.com/jane-example' },
};

describe('Header', () => {
	it('renders name and title', () => {
		render(<Header cv={cv} />);
		expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Jane Example');
		expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Example Engineer');
	});

	it('links email as mailto: and other contacts to their URL', () => {
		render(<Header cv={cv} />);
		expect(screen.getByText('jane@example.invalid').closest('a')).toHaveAttribute(
			'href',
			'mailto:jane@example.invalid',
		);
		expect(screen.getByText('github.com/jane-example').closest('a')).toHaveAttribute(
			'href',
			'https://github.com/jane-example',
		);
	});
});
