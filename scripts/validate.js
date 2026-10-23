// Validates data/cv.json (or the file named in env CV_JSON) against data/cv.schema.json.
// Prints field-level errors and exits non-zero when the data is invalid.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import Ajv from 'ajv';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const schema = JSON.parse(readFileSync(resolve(root, 'data/cv.schema.json'), 'utf8'));
const ajv = new Ajv({ allErrors: true, strict: true, validateFormats: false });
const check = ajv.compile(schema);

/** Returns a list of error strings (empty when valid). */
export function validateData(data) {
	if (check(data)) return [];
	return check.errors.map((e) => {
		const path = e.instancePath || '(root)';
		const extra = e.keyword === 'additionalProperties' ? ` '${e.params.additionalProperty}'` : '';
		return `${path}: ${e.message}${extra}`;
	});
}

/** Reads and validates a JSON file; parse and read problems are returned as errors too. */
export function validateFile(file) {
	let text;
	try {
		text = readFileSync(file, 'utf8');
	} catch (err) {
		return [`cannot read ${file}: ${err.message}`];
	}
	let data;
	try {
		data = JSON.parse(text);
	} catch (err) {
		return [`${file} is not valid JSON (parse error): ${err.message}`];
	}
	return validateData(data);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	const file = process.env.CV_JSON ? resolve(process.env.CV_JSON) : resolve(root, 'data/cv.json');
	const errors = validateFile(file);
	if (errors.length) {
		console.error(`Validation failed for ${file}:`);
		for (const e of errors) console.error(`  - ${e}`);
		process.exit(1);
	}
	console.log(`${file} is valid`);
}
