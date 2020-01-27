import getIconClass from '../get-icon-class';
import photo from '../../data/photo.jpg';

import './header.css';

export default function header({ cv }) {
	return (
		<header>
			<ul class="contact">
				{Object.entries(cv.contact).map(([key, value]) => {
					const text = value.replace(/(^\w+:|^)\/\//, '');
					const href = key === 'email' ? `mailto:${value}` : value;
					return (
						<li>
							<i class={`devicon-${getIconClass(key)} colored`} />
							<a href={href} target="_blank">{ text }</a>
						</li>
					);
				})}
			</ul>

			<div className="photo">
				<img src={photo} />
			</div>
			<h1>{ cv.name }</h1>
			<h2>{ cv.title }</h2>

		</header>
	);
}
