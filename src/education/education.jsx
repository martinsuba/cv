import SectionLabel from '../section-label/section-label.jsx';
import './education.css';

export default function education({ education, number }) {
	return (
		<section className="section education">
			<SectionLabel number={number} name="Education" />
			<div className="entries">
				{education.map((item) => (
					<article className="entry">
						<div className="dates">
							{item.from} - {item.to}
						</div>
						<div className="body">
							<h3>{item.degree}</h3>
							<div className="meta">
								<span>{item.institution}</span>
								<span className="sep"> · </span>
								<span>{item.field}</span>
							</div>
						</div>
					</article>
				))}
			</div>
		</section>
	);
}
