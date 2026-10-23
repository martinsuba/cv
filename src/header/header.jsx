import icons from './icons.jsx';
import photo from '../../data/photo.jpg';
import './header.css';

export default function header({ cv }) {
	return (
		<header>
			<div className="identity">
				<img className="photo" src={photo} alt={cv.name} width="800" height="800" />
				<div className="who">
					<h1>{cv.name}</h1>
					<p className="job">{cv.title}</p>
				</div>
			</div>
			<nav aria-label="Contact">
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
			</nav>
		</header>
	);
}
