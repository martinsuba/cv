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

	it('renders highlights as one ul with one li each, after the description', () => {
		const { container } = render(
			<Experience
				experience={[{ ...experience[0], highlights: ['First point.', 'Second point.'] }]}
				number={2}
			/>,
		);
		const body = container.querySelector('.body');
		const list = body.querySelector('ul.highlights');
		expect([...list.querySelectorAll(':scope > li')].map((li) => li.textContent)).toEqual([
			'First point.',
			'Second point.',
		]);
		expect(body.querySelectorAll('ul')).toHaveLength(1);
		expect(body.querySelector('p.description').nextElementSibling).toBe(list);
	});

	it('renders no description paragraph when the entry has only highlights', () => {
		const { description, ...rest } = experience[0];
		const { container } = render(
			<Experience experience={[{ ...rest, highlights: ['Only point.'] }]} number={2} />,
		);
		expect(description).toBeDefined();
		expect(container.querySelector('p.description')).toBeNull();
		expect(screen.getByText('Only point.')).toBeInTheDocument();
	});

	it('renders no highlights list when the entry has only a description', () => {
		const { container } = render(<Experience experience={experience} number={2} />);
		expect(container.querySelector('ul')).toBeNull();
		expect(container.querySelector('p.description')).not.toBeNull();
	});
});
