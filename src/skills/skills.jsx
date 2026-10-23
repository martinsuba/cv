import './skills.css';

export default function skills({ skills }) {
	return (
		<section className="skills">
			<h1>Skills</h1>
			{Object.entries(skills).map(([key, value]) => (
				<div className="item">
					<h2>{key}:</h2>
					<p>{value.join(', ')}</p>
				</div>
			))}
		</section>
	);
}
