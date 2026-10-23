import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/preact';
import Experience from './experience.jsx';

const experience = [
	{
		title: 'Example Role',
		company: { name: 'Example Corp', link: 'https://example.invalid/' },
		from: 'January 2020',
		to: 'Present',
		location: 'Nowhere',
		description: 'Synthetic description.',
	},
];

describe('Experience', () => {
	it('renders every field of an entry', () => {
		render(<Experience experience={experience} number={2} />);
		expect(screen.getByRole('heading', { name: 'Example Role' })).toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'Example Corp' })).toHaveAttribute(
			'href',
			'https://example.invalid/',
		);
		expect(screen.getByText('January 2020 - Present')).toBeInTheDocument();
		expect(screen.getByText('Nowhere')).toBeInTheDocument();
		expect(screen.getByText('Synthetic description.')).toBeInTheDocument();
	});

	it('labels the section with its number and puts dates and title in the entry', () => {
		const { container } = render(<Experience experience={experience} number={2} />);
		expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('02 / Experience');
		const entry = container.querySelector('article.entry');
		expect(entry.querySelector('.dates')).toHaveTextContent('January 2020 - Present');
		expect(entry.querySelector('h3')).toHaveTextContent('Example Role');
	});

	it('opens company links in a new tab with rel noopener noreferrer', () => {
		render(<Experience experience={experience} number={2} />);
		const link = screen.getByRole('link', { name: 'Example Corp' });
		expect(link).toHaveAttribute('target', '_blank');
		expect(link).toHaveAttribute('rel', 'noopener noreferrer');
	});
});
