import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/preact';
import Education from './education.jsx';

describe('Education', () => {
	it('renders every entry', () => {
		const education = [
			{
				institution: 'Example University',
				field: 'Examples',
				degree: "Bachelor's degree",
				from: '2010',
				to: '2013',
			},
			{
				institution: 'Sample College',
				field: 'Samples',
				degree: "Master's degree",
				from: '2013',
				to: '2015',
			},
		];
		render(<Education education={education} />);
		expect(screen.getByText('Example University')).toBeInTheDocument();
		expect(screen.getByText('Sample College')).toBeInTheDocument();
		expect(screen.getByText('2013 - 2015')).toBeInTheDocument();
		expect(screen.getByText("Master's degree")).toBeInTheDocument();
	});
});
