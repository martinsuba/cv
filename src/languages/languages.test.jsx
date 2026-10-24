import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/preact';
import Languages from './languages.jsx';

const languages = [
	{ language: 'Examplish', level: 'native' },
	{ language: 'Testlang', level: 'B2' },
];

describe('Languages', () => {
	it('labels the section with its number and the heading "Languages"', () => {
		render(<Languages languages={languages} number={5} />);
		expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('05 / Languages');
	});

	it('lists each language as "<language> (<level>)" in a ul', () => {
		const { container } = render(<Languages languages={languages} number={5} />);
		const items = [...container.querySelectorAll('ul > li')].map((li) => li.textContent);
		expect(items).toEqual(['Examplish (native)', 'Testlang (B2)']);
	});
});
