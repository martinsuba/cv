// Exact texts of content v2, copied verbatim from data/cv.json (formerly docs/content-v2.json). REQ-018.
export const ABOUT =
	'Engineering Manager with 10+ years in web product engineering, leading a team that delivers security products to Tier-1 partners at F-Secure. Grew from developer to tech lead to manager on the same product through two acquisitions (SaferPass → Lookout → F-Secure). Focused on growing engineers and predictable delivery. Running AI-orchestrated workflows in my team and exploring how AI-native development reshapes the whole SDLC. Technical enough to guide architecture decisions and review solutions (JavaScript/TypeScript, React, Node.js, Python, web and native SDKs).';

export const LOCATION = 'Bratislava, Slovakia';

export const EM_HIGHLIGHTS = [
	'Managing the team: 1:1s, regular feedback, performance reviews and career development.',
	'Hiring and onboarding new engineers.',
	'Owning delivery and release readiness for partner releases: planning around real capacity, managing dependencies across teams and raising risks early.',
	'Introduced AI-orchestrated workflows and agentic automations into delivery, reducing manual effort by up to 80% in selected workflows, and brought the team along in adopting AI tools.',
	'Improving delivery processes and quality in a security-critical, partner-facing environment.',
];

// Highlights of the other recent roles (entries 2-5), keyed by 'title (company)'.
export const OTHER_HIGHLIGHTS = {
	'Technical Project Lead (alongside the EM role) (F-Secure)': [
		'Led Tier-1 partner deliveries end to end, from scope and planning to release.',
		'Coordinated execution across engineering teams and stakeholder groups, unblocking work and keeping commitments aligned.',
		'Improved the delivery process for complex, customer-facing releases.',
	],
	'Lead Frontend Engineer (F-Secure)': [
		'Led frontend development of the password manager clients: browser extensions and SDKs for TypeScript, iOS and Android.',
		'Owned the architecture for delivering SaferPass as a component of the F-Secure SDK, integrating web and native technologies.',
		'Shipped the SDK release for a Tier-1 partner, enabling the launch of a new product offering.',
		'Partnered with Product on integrating SaferPass into F-Secure products: feasibility, feature scope and a consistent user experience.',
		'Mentored engineers and set technical direction for the frontend.',
	],
	'Lead Frontend Engineer (Lookout (SaferPass))': [
		'Took on team lead responsibilities while staying hands-on in frontend development of the web product and browser extension.',
		'Kept delivery going and supported the team through the acquisition and the move into a larger organization.',
	],
	'JavaScript Developer (SaferPass)': [
		'Built the frontend of the web app and browser extension (JavaScript/TypeScript, AngularJS, React, Web Extension APIs, Node.js).',
		'Delivered new features, refactored legacy code and improved test coverage.',
	],
};

// Descriptions of the entries that have one (EM, Lookout, SaferPass and the earlier roles).
export const DESCRIPTIONS = {
	'Engineering Manager (F-Secure)':
		"Leading the Solution Implementation team, which configures, releases and delivers cybersecurity products to Tier-1 partners, and owning the team's internal automation and delivery tooling.",
	'Lead Frontend Engineer (Lookout (SaferPass))':
		'SaferPass was acquired by Lookout in 2022; the consumer business moved to F-Secure in 2023.',
	'JavaScript Developer (SaferPass)': 'Product startup building a web-based password manager.',
	'Front-end Web Developer (WEZEO)':
		'Responsive web and mobile apps (JavaScript, AngularJS, Angular, Ionic).',
	'Front-end Web Developer (Elite Solutions)':
		'Web interfaces for client projects including O2, Sberbank, SLSP, VÚB and Hyundai.',
	'Front-end Web Developer (pelicantravel.com)':
		'Web pages, e-mail newsletters and WordPress templates.',
	'Coder (webikon)': 'WordPress themes (HTML, CSS).',
};

export const LANGUAGES = [
	'Slovak (native)',
	'English (professional)',
	'Czech (professional)',
	'German (elementary)',
];

export const SKILL_GROUPS_IN_ORDER = ['Leadership', 'Delivery', 'AI', 'Engineering'];

export const REMOVED_SKILLS = [
	'Git',
	'Webpack',
	'npm',
	'Mocha',
	'Jasmine',
	'Travis',
	'Photoshop',
	'Sketch',
];
