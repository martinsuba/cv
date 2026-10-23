import './section-label.css';

// "01 / About": the number is a UI string generated in render order, the name is passed by the section.
export default function SectionLabel({ number, name }) {
	return (
		<h2 className="section-label">
			{String(number).padStart(2, '0')} / {name}
		</h2>
	);
}
