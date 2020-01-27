import './education.css';

export default function education({ education }) {
	return (
		<section className="education">
			<h1>Education</h1>
			{
				education.map(item => (
					<div className="item">
						<h2>{ item.institution }</h2>
						<h3>{ item.field }</h3>
						<span>{ item.from } - { item.to }</span>
						<div>{ item.degree }</div>
					</div>
				))
			}
		</section>
	);
}
