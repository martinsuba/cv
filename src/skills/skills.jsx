import SectionLabel from '../section-label/section-label.jsx';
import NoBreak from '../no-break/no-break.jsx';
import './skills.css';

export default function skills({ skills, number }) {
	return (
		<section className="section skills">
			<SectionLabel number={number} name="Skills" />
			<div className="groups">
				{Object.entries(skills).map(([key, value]) => (
					<div className="group">
						<h3>{key}</h3>
						<ul className="tags">
							{value.map((skill) => (
								<li>
									<NoBreak text={skill} />
								</li>
							))}
						</ul>
					</div>
				))}
			</div>
		</section>
	);
}
