// Reads the Stryker JSON report and prints a Markdown score table (CI appends it to $GITHUB_STEP_SUMMARY).
import { readFileSync, appendFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const COUNTED = ['Killed', 'Survived', 'Timeout', 'NoCoverage'];

/** Counts mutants by status and computes the Stryker score (killed + timeout of all valid mutants). */
export function summarize(report) {
	const counts = Object.fromEntries(COUNTED.map((s) => [s, 0]));
	const survivors = [];
	for (const [file, { mutants }] of Object.entries(report.files)) {
		for (const m of mutants) {
			if (m.status in counts) counts[m.status]++;
			if (m.status === 'Survived' || m.status === 'NoCoverage') {
				survivors.push({
					file,
					line: m.location.start.line,
					mutator: m.mutatorName,
					status: m.status,
				});
			}
		}
	}
	const total = COUNTED.reduce((n, s) => n + counts[s], 0);
	const score = total === 0 ? 100 : ((counts.Killed + counts.Timeout) / total) * 100;
	return { counts, total, score, survivors };
}

export function toMarkdown({ counts, total, score, survivors }) {
	const pct = (n) => (total === 0 ? '0.0' : ((n / total) * 100).toFixed(1));
	const lines = [
		'## Mutation testing (Stryker, Vitest runner)',
		'',
		`**Score: ${score.toFixed(2)} %** (${counts.Killed + counts.Timeout} of ${total} mutants killed)`,
		'',
		'| Killed | Survived | Timeout | No coverage | Score |',
		'| ---: | ---: | ---: | ---: | ---: |',
		`| ${counts.Killed} | ${counts.Survived} | ${counts.Timeout} | ${counts.NoCoverage} | ${score.toFixed(2)} % |`,
		'',
		`Timeouts: ${pct(counts.Timeout)} % of mutants (REQ-014 allows at most 10 %).`,
	];
	const perFile = new Map();
	for (const s of survivors) perFile.set(s.file, (perFile.get(s.file) ?? 0) + 1);
	if (perFile.size > 0) {
		lines.push('', '| File | Survived + no coverage |', '| --- | ---: |');
		for (const [file, n] of [...perFile].sort((a, b) => b[1] - a[1]))
			lines.push(`| ${file} | ${n} |`);
	}
	return lines.join('\n') + '\n';
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	const file = process.argv[2] ?? 'reports/mutation/mutation.json';
	const md = toMarkdown(summarize(JSON.parse(readFileSync(file, 'utf8'))));
	process.stdout.write(md);
	if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, md);
}
