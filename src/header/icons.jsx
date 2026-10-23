// Small inline brand marks for the header contact links. Decorative only:
// the link text is the accessible name.
const common = {
	'aria-hidden': 'true',
	focusable: 'false',
	width: '18',
	height: '18',
	class: 'icon',
};

function LinkedIn() {
	return (
		<svg {...common} viewBox="0 0 24 24">
			<rect width="24" height="24" rx="3" fill="#0a66c2" />
			<circle cx="7" cy="7.2" r="1.8" fill="#fff" />
			<rect x="5.4" y="10" width="3.2" height="8.6" fill="#fff" />
			<path
				d="M10.6 10h3v1.2c.5-.9 1.6-1.4 2.8-1.4 2.4 0 3.1 1.5 3.1 3.7v5.1h-3.2v-4.5c0-1-.2-1.8-1.3-1.8s-1.4.8-1.4 1.8v4.5h-3z"
				fill="#fff"
			/>
		</svg>
	);
}

function GitHub() {
	return (
		<svg {...common} viewBox="0 0 16 16">
			<path
				fill="#24292e"
				d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
			/>
		</svg>
	);
}

function Npm() {
	return (
		<svg {...common} viewBox="0 0 24 24">
			<path
				fill="#cb3837"
				d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0zM5.13 5.323l13.837.019-.009 13.836h-3.464l.01-10.382h-3.456L12.04 19.17H5.113z"
			/>
		</svg>
	);
}

// Keyed by contact key; no fuzzy matching. Contacts without an entry (email) get no icon.
const icons = { linkedin: LinkedIn, github: GitHub, npm: Npm };

export default icons;
