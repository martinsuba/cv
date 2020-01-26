import Header from './header/header';
import About from './about/about';
import Experience from './experience/experience';
import Education from './education/education';
import Skills from './skills/skills';

import cv from '../data/cv.json';

import './style';
import './devicon/devicon';
import './devicon/devicon-colors';

export default function app() {
	return (
		<div className="container">
			<Header cv={ cv }/>
			<About about={ cv.about } />
			<Experience experience={ cv.experience } />
			<Education education={ cv.education } />
			<Skills skills={ cv.skills } />
		</div>
	);
}
