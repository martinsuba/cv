import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/preact';
import DownloadLink from './download-link.jsx';

describe('DownloadLink', () => {
	it('renders a "Download PDF" link to the relative cv.pdf', () => {
		render(<DownloadLink />);
		const link = screen.getByRole('link', { name: 'Download PDF' });
		expect(link).toHaveAttribute('href', 'cv.pdf');
	});
	it('is marked as the no-print element', () => {
		const { container } = render(<DownloadLink />);
		expect(container.firstElementChild).toHaveClass('download');
	});
});
