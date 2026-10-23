import DownloadLink from './download-link/download-link.jsx';
import Header from './header/header.jsx';
import About from './about/about.jsx';
import Experience from './experience/experience.jsx';
import Education from './education/education.jsx';
import Skills from './skills/skills.jsx';

import cv from '../data/cv.json';

import './style.css';

export default function App() {
	return (
		<div className="container">
			<DownloadLink />
			<Header cv={cv} />
			<About about={cv.about} />
			<Experience experience={cv.experience} />
			<Education education={cv.education} />
			<Skills skills={cv.skills} />
		</div>
	);
}
