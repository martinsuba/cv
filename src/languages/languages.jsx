import SectionLabel from '../section-label/section-label.jsx';
import NoBreak from '../no-break/no-break.jsx';
import './languages.css';

export default function languages({ languages, number }) {
	return (
		<section className="section languages">
			<SectionLabel number={number} name="Languages" />
			<ul className="language-list">
				{languages.map((item) => (
					<li>
						<NoBreak text={`${item.language} (${item.level})`} />
					</li>
				))}
			</ul>
		</section>
	);
}
