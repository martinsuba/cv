// REQ-014: workflows run in the official Playwright image; its tag must equal the installed @playwright/test version.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'yaml';

const read = (p) => readFileSync(resolve(process.cwd(), p), 'utf8');
const lock = JSON.parse(read('package-lock.json'));
const version = lock.packages['node_modules/@playwright/test'].version;

describe('workflow container image (REQ-014)', () => {
	for (const [file, jobName] of [
		['ci', 'ci'],
		['screenshots', 'screenshots'],
		['deploy', 'build'],
	]) {
		it(`${file}.yml job ${jobName} uses the Playwright image matching package-lock (${version})`, () => {
			const job = parse(read(`.github/workflows/${file}.yml`)).jobs[jobName];
			expect(job.container.image).toBe(`mcr.microsoft.com/playwright:v${version}-noble`);
		});
		it(`${file}.yml has no browser install or cache step`, () => {
			expect(read(`.github/workflows/${file}.yml`)).not.toMatch(/playwright install|ms-playwright/);
		});
	}
});
