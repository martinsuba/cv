import DownloadLink from './download-link/download-link.jsx';
import Header from './header/header.jsx';
import About from './about/about.jsx';
import Experience from './experience/experience.jsx';
import Education from './education/education.jsx';
import Languages from './languages/languages.jsx';
import Skills from './skills/skills.jsx';
import cv from '../data/cv.json';
import './style.css';

export default function App() {
	// Section numbers ("01 / About") are generated in render order, only for sections that have content.
	let n = 0;
	const next = () => ++n;
	return (
		<div className="container">
			<DownloadLink />
			<Header cv={cv} />
			{cv.about != null && <About about={cv.about} number={next()} />}
			{cv.experience.length > 0 && <Experience experience={cv.experience} number={next()} />}
			{Object.keys(cv.skills).length > 0 && <Skills skills={cv.skills} number={next()} />}
			{cv.education.length > 0 && <Education education={cv.education} number={next()} />}
			{cv.languages?.length > 0 && <Languages languages={cv.languages} number={next()} />}
		</div>
	);
}
