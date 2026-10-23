import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/preact';
import About from './about.jsx';

describe('About', () => {
	it('renders the text', () => {
		render(<About about="Synthetic about text." />);
		expect(screen.getByText('Synthetic about text.')).toBeInTheDocument();
	});

	it('renders nothing without text', () => {
		const { container } = render(<About about={null} />);
		expect(container).toBeEmptyDOMElement();
	});
});
