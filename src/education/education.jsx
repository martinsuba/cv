import SectionLabel from '../section-label/section-label.jsx';
import NoBreak from '../no-break/no-break.jsx';
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
							<h3>
								<NoBreak text={item.degree} />
							</h3>
							<div className="meta">
								<span>
									<NoBreak text={item.institution} />
								</span>
								<span className="sep"> · </span>
								<span>
									<NoBreak text={item.field} />
								</span>
							</div>
						</div>
					</article>
				))}
			</div>
		</section>
	);
}
