import SectionLabel from '../section-label/section-label.jsx';
import './experience.css';

export default function experience({ experience, number }) {
	return (
		<section className="section experience">
			<SectionLabel number={number} name="Experience" />
			<div className="entries">
				{experience.map((item) => (
					<article className="entry">
						<div className="dates">
							{item.from} - {item.to}
						</div>
						<div className="body">
							<h3>{item.title}</h3>
							<div className="meta">
								<a href={item.company.link} target="_blank" rel="noopener noreferrer">
									{item.company.name}
								</a>
								<span className="sep"> · </span>
								<span>{item.location}</span>
							</div>
							<p className="description">{item.description}</p>
						</div>
					</article>
				))}
			</div>
		</section>
	);
}
