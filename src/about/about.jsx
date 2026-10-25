import SectionLabel from '../section-label/section-label.jsx';
import NoBreak from '../no-break/no-break.jsx';
import './about.css';

export default function about({ about, number }) {
	if (about == null) {
		return null;
	}
	return (
		<section className="section about">
			<SectionLabel number={number} name="About" />
			<p>
				<NoBreak text={about} />
			</p>
		</section>
	);
}
