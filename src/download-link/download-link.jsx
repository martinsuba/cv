import './download-link.css';

export default function DownloadLink() {
	return (
		<p className="download">
			<a href="cv.pdf" download>
				Download PDF
			</a>
		</p>
	);
}
