import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/preact';
import Header from './header.jsx';

const cv = {
	name: 'Jane Example',
	title: 'Example Engineer',
	contact: {
		email: 'jane@example.invalid',
		linkedin: 'https://linkedin.com/in/jane-example',
		github: 'https://github.com/jane-example',
		npm: 'https://npmjs.com/~jane-example',
		other: 'https://other.example.invalid/jane',
	},
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

	it('shows a decorative inline SVG icon for linkedin, github and npm only', () => {
		const { container } = render(<Header cv={cv} />);
		const items = [...container.querySelectorAll('.contact li')];
		const withIcon = items.filter((li) => li.querySelector('svg')).map((li) => li.textContent);
		expect(withIcon).toEqual([
			'linkedin.com/in/jane-example',
			'github.com/jane-example',
			'npmjs.com/~jane-example',
		]);
		for (const svg of container.querySelectorAll('.contact svg')) {
			expect(svg).toHaveAttribute('aria-hidden', 'true');
			expect(svg).toHaveAttribute('focusable', 'false');
		}
		expect(container.querySelector('i')).toBeNull();
	});

	it('opens contact links in a new tab with rel noopener noreferrer', () => {
		const { container } = render(<Header cv={cv} />);
		for (const a of container.querySelectorAll('a')) {
			expect(a).toHaveAttribute('target', '_blank');
			expect(a).toHaveAttribute('rel', 'noopener noreferrer');
		}
	});

	it('gives the photo alt text equal to the name', () => {
		render(<Header cv={cv} />);
		expect(screen.getByRole('img')).toHaveAttribute('alt', 'Jane Example');
	});
});
