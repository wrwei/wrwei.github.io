// Example definitions: one folder per runnable example, described by its example.json.
import fs from 'node:fs';
import path from 'node:path';

export const LANGUAGES = ['eol', 'evl', 'egl', 'egx', 'etl'];
export const FILE_FIELDS = ['program', 'secondProgram', 'flexmi', 'emfatic', 'secondEmfatic'];

/** Loads and checks every examples/module_NN/<id>/example.json; adds `dir` to each. */
export function loadExamples(moduleDir, number) {
  if (!fs.existsSync(moduleDir)) return [];
  return fs.readdirSync(moduleDir)
    .filter(name => fs.existsSync(path.join(moduleDir, name, 'example.json')))
    .sort()
    .map(name => {
      const dir = path.join(moduleDir, name);
      const example = JSON.parse(fs.readFileSync(path.join(dir, 'example.json'), 'utf8'));
      const problems = checkDefinition(example, name, number, dir);
      if (problems.length) throw new Error(`Example ${name}:\n- ${problems.join('\n- ')}`);
      return {...example, dir};
    });
}

export function checkDefinition(example, folder, number, dir) {
  const problems = [];
  const prefix = `m${String(number).padStart(2, '0')}-`;
  const id = String(example.id ?? '');
  if (id !== folder) problems.push(`id "${id}" must equal its folder name "${folder}"`);
  if (!id.startsWith(prefix)) problems.push(`id must start with "${prefix}"`);
  if (!/^[a-z0-9-]+$/.test(id)) problems.push('id may contain only lower-case letters, digits and hyphens');
  if (!example.title?.en || !example.title?.zh) problems.push('title needs "en" and "zh"');
  if (!LANGUAGES.includes(example.language)) problems.push(`language must be one of ${LANGUAGES.join(', ')}`);
  for (const field of ['program', 'emfatic', 'flexmi']) if (!example[field]) problems.push(`"${field}" is required`);
  if (example.language === 'etl' && !example.secondEmfatic) problems.push('ETL examples need "secondEmfatic" (the target metamodel)');
  // The Playground saves an EGX example's second program as template.egl, so the EGX rules must use that name.
  if (example.language === 'egx' && example.secondProgram !== 'template.egl') problems.push('EGX examples need "secondProgram": "template.egl"');
  for (const field of FILE_FIELDS) {
    if (example[field] && !fs.existsSync(path.join(dir, example[field]))) problems.push(`${field} file "${example[field]}" does not exist`);
  }
  if (!['ok', 'error'].includes(example.expect)) problems.push('"expect" must be "ok" or "error"');
  if (example.expect === 'error' && !example.expectContains) problems.push('"expect": "error" needs "expectContains"');
  if (!['example', 'solution'].includes(example.role ?? 'example')) problems.push('"role" must be "example" or "solution"');
  for (const field of example.show ?? []) if (!FILE_FIELDS.includes(field) || !example[field]) problems.push(`"show" lists "${field}", which this example does not have`);
  return problems;
}

export function toJob(example) {
  const job = {key: example.id, language: example.language};
  for (const field of FILE_FIELDS) if (example[field]) job[field] = path.join(example.dir, example[field]);
  return job;
}

/** Removes build-machine paths so outputs are the same on every machine. */
export function sanitize(text, roots) {
  let out = text.replace(/\r\n/g, '\n');
  for (const root of roots) {
    const forward = root.replace(/\\/g, '/');
    for (const prefix of [`file:${forward}/`, `file:/${forward}/`, `${forward}/`, `${root}${path.sep}`]) out = out.split(prefix).join('');
  }
  return out.split('\n').map(line => line.trimEnd()).join('\n').trimEnd() + '\n';
}

/** Lists the ways a run differs from what its example.json declares; empty when it behaved as declared. */
export function problemsWithOutput(example, result) {
  const problems = [];
  if (result.status !== example.expect) problems.push(`expected "${example.expect}" but the run ended with "${result.status}"`);
  if (example.expect === 'error' && !result.output.includes(example.expectContains)) problems.push(`output does not contain "${example.expectContains}"`);
  if (result.output.includes('Model warning') && !example.allowWarnings) problems.push('the model does not conform (set "allowWarnings": true only when that is the point of the example)');
  if (/(?:\b[A-Za-z]:[\\/]|\/(?:Users|home|private|tmp|var)\/|file:\/)/.test(result.output)) problems.push('output contains a file-system path');
  if (/@[0-9a-f]{6,8}\b/.test(result.output)) problems.push('output contains a Java object identity, which changes on every run; pick an error whose message does not print an object');
  if (/^`{4,}/m.test(result.output)) problems.push('output contains a line starting with four backticks, which would end its code block');
  return problems;
}
