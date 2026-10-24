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
		expect(screen.getByText('Example Engineer')).toHaveClass('job');
		expect(screen.queryByRole('heading', { level: 2 })).toBeNull();
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

	it('opens external contact links in a new tab with rel noopener noreferrer', () => {
		const { container } = render(<Header cv={cv} />);
		const external = [...container.querySelectorAll('a')].filter(
			(a) => !a.getAttribute('href').startsWith('mailto:'),
		);
		expect(external).toHaveLength(4);
		for (const a of external) {
			expect(a).toHaveAttribute('target', '_blank');
			expect(a).toHaveAttribute('rel', 'noopener noreferrer');
		}
	});

	it('does not open the mailto: link in a new tab and gives it no rel', () => {
		render(<Header cv={cv} />);
		const a = screen.getByText('jane@example.invalid').closest('a');
		expect(a).not.toHaveAttribute('target');
		expect(a).not.toHaveAttribute('rel');
	});

	it('gives the photo explicit width and height to avoid layout shift', () => {
		render(<Header cv={cv} />);
		const img = screen.getByRole('img');
		expect(img).toHaveAttribute('width', '800');
		expect(img).toHaveAttribute('height', '800');
	});

	it('gives the photo alt text equal to the name', () => {
		render(<Header cv={cv} />);
		expect(screen.getByRole('img')).toHaveAttribute('alt', 'Jane Example');
	});

	it('strips only a leading scheme from the displayed link text', () => {
		const c = {
			...cv,
			contact: {
				a: 'http://plain.example.invalid/x',
				b: '//relative.example.invalid/y',
				c: 'https://redirect.example.invalid/?u=http://inner.example.invalid',
			},
		};
		render(<Header cv={c} />);
		expect(screen.getByText('plain.example.invalid/x')).toBeInTheDocument();
		expect(screen.getByText('relative.example.invalid/y')).toBeInTheDocument();
		expect(
			screen.getByText('redirect.example.invalid/?u=http://inner.example.invalid'),
		).toBeInTheDocument();
	});

	it('renders icons as 18x18 svgs with the icon class', () => {
		const { container } = render(<Header cv={cv} />);
		const svgs = container.querySelectorAll('.contact svg');
		expect(svgs).toHaveLength(3);
		for (const svg of svgs) {
			expect(svg).toHaveAttribute('width', '18');
			expect(svg).toHaveAttribute('height', '18');
			expect(svg).toHaveClass('icon');
		}
	});

	it('shows the location under the job title when present', () => {
		const { container } = render(<Header cv={{ ...cv, location: 'Example City, Nowhere' }} />);
		const loc = screen.getByText('Example City, Nowhere');
		expect(loc).toHaveClass('location');
		expect(loc.previousElementSibling).toBe(container.querySelector('.job'));
	});

	it('shows no location element without a location', () => {
		const { container } = render(<Header cv={cv} />);
		expect(container.querySelector('.location')).toBeNull();
	});
});
