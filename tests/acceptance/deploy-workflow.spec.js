// REQ-009: static check of .github/workflows/deploy.yml. Live checks (Pages URL, content-type) belong to the deploy phase.
import { test, expect } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'yaml';
import { ROOT } from '../helpers.js';

const FILE = resolve(ROOT, '.github/workflows/deploy.yml');
const load = () => {
	expect(existsSync(FILE), 'deploy.yml exists').toBe(true);
	const raw = readFileSync(FILE, 'utf8');
	const wf = parse(raw);
	const steps = Object.values(wf.jobs).flatMap((j) => j.steps ?? []);
	const cmds = steps.map((s) => s.run ?? '').join('\n');
	const uses = steps.map((s) => s.uses ?? '');
	return { wf, cmds, uses };
};

test.describe('REQ-009 deploy workflow (static)', () => {
	test('REQ-009: the only trigger is workflow_dispatch (no push, pull_request or schedule)', () => {
		const { wf } = load();
		expect(Object.keys(wf.on ?? wf[true])).toEqual(['workflow_dispatch']);
	});

	test('REQ-009: it validates, builds, generates the PDF and deploys to GitHub Pages', () => {
		const { cmds, uses } = load();
		expect(cmds).toMatch(/npm ci/);
		expect(cmds).toMatch(/npm run validate/);
		expect(cmds).toMatch(/npm run build/);
		expect(cmds).toMatch(/npm run pdf/);
		expect(uses.some((u) => u.startsWith('actions/upload-pages-artifact'))).toBe(true);
		expect(uses.some((u) => u.startsWith('actions/deploy-pages'))).toBe(true);
		const order = (re) => cmds.search(re);
		expect(order(/npm run validate/)).toBeLessThan(order(/npm run pdf/));
	});

	test('REQ-009: it has pages: write and id-token: write permissions and the pages concurrency group', () => {
		const { wf } = load();
		const perms = {
			...wf.permissions,
			...Object.assign({}, ...Object.values(wf.jobs).map((j) => j.permissions)),
		};
		expect(perms.pages).toBe('write');
		expect(perms['id-token']).toBe('write');
		expect(wf.concurrency?.group ?? wf.concurrency).toBe('pages');
	});
});
