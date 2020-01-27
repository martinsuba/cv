import './about.css';

export default function about({ about }) {
	if (about == null) {
		return null;
	}

	return (
		<section className="about">
			<h1>About</h1>
			<div>{ about }</div>
		</section>
	);
}
