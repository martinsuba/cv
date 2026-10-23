import SectionLabel from '../section-label/section-label.jsx';
import './about.css';

export default function about({ about, number }) {
	if (about == null) {
		return null;
	}
	return (
		<section className="section about">
			<SectionLabel number={number} name="About" />
			<p>{about}</p>
		</section>
	);
}
