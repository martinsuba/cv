import icons from './icons.jsx';
import photo from '../../data/photo.jpg';

import './header.css';

export default function header({ cv }) {
	return (
		<header>
			<ul class="contact">
				{Object.entries(cv.contact).map(([key, value]) => {
					const text = value.replace(/(^\w+:|^)\/\//, '');
					const href = key === 'email' ? `mailto:${value}` : value;
					const Icon = Object.hasOwn(icons, key) ? icons[key] : null;
					return (
						<li>
							{Icon && <Icon />}
							<a
								href={href}
								{...(key === 'email' ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
							>
								{text}
							</a>
						</li>
					);
				})}
			</ul>

			<div className="photo">
				<img src={photo} alt={cv.name} width="1000" height="1152" />
			</div>
			<h1>{cv.name}</h1>
			<h2>{cv.title}</h2>
		</header>
	);
}
