import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {checkDefinition, sanitize, problemsWithOutput} from '../tools/examples.mjs';

function folder(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mde-example-'));
  for (const name of files) fs.writeFileSync(path.join(dir, name), '');
  return dir;
}
const valid = {id: 'm01-tour', title: {en: 'Tour', zh: '导览'}, language: 'eol', program: 'tour.eol', emfatic: 'c.emf', flexmi: 'a.flexmi', expect: 'ok'};

test('a complete definition has no problems', () => {
  assert.deepEqual(checkDefinition(valid, 'm01-tour', 1, folder(['tour.eol', 'c.emf', 'a.flexmi'])), []);
});

test('definitions are checked field by field', () => {
  const dir = folder(['tour.eol', 'c.emf', 'a.flexmi', 'gen.egx', 'page.egl']);
  const problems = (change, name = 'm01-tour', number = 1) => checkDefinition({...valid, ...change}, name, number, dir).join(' | ');
  assert.match(problems({}, 'm01-other'), /must equal its folder name/);
  assert.match(problems({}, 'm01-tour', 2), /must start with "m02-"/);
  assert.match(problems({title: {en: 'Tour'}}), /title needs "en" and "zh"/);
  assert.match(problems({language: 'ocl'}), /language must be one of/);
  assert.match(problems({flexmi: undefined}), /"flexmi" is required/);
  assert.match(problems({program: 'missing.eol'}), /does not exist/);
  assert.match(problems({language: 'etl'}), /secondEmfatic/);
  assert.match(problems({language: 'egx', program: 'gen.egx', secondProgram: 'page.egl'}), /template\.egl/);
  assert.match(problems({expect: 'maybe'}), /"expect" must be/);
  assert.match(problems({expect: 'error'}), /expectContains/);
  assert.match(problems({show: ['secondEmfatic']}), /"show" lists "secondEmfatic"/);
});

test('sanitize removes build-machine paths in POSIX and Windows form', () => {
  const posix = 'Error in file:/repo/ex/m01-a/query.eol and /repo/ex/m01-a/model.flexmi  \n\n';
  assert.equal(sanitize(posix, ['/repo/ex/m01-a']), 'Error in query.eol and model.flexmi\n');
  const windows = 'see file:/C:/repo/ex/m01-a/query.eol';
  assert.equal(sanitize(windows, ['C:\\repo\\ex\\m01-a']), 'see query.eol\n');
});

test('a run is compared with its declaration', () => {
  const ok = {status: 'ok', output: 'fine\n'};
  assert.deepEqual(problemsWithOutput(valid, ok), []);
  assert.match(problemsWithOutput(valid, {status: 'error', output: 'boom\n'}).join(), /expected "ok"/);
  const failing = {...valid, expect: 'error', expectContains: 'Parse error'};
  assert.deepEqual(problemsWithOutput(failing, {status: 'error', output: 'Parse error in q.eol line 1: x\n'}), []);
  assert.match(problemsWithOutput(failing, {status: 'error', output: 'Other\n'}).join(), /does not contain/);
  assert.match(problemsWithOutput(valid, {status: 'ok', output: 'Model warning (line 3): x\n'}).join(), /does not conform/);
  assert.deepEqual(problemsWithOutput({...valid, allowWarnings: true}, {status: 'ok', output: 'Model warning (line 3): x\n'}), []);
  assert.match(problemsWithOutput(valid, {status: 'ok', output: 'at /Users/me/x\n'}).join(), /file-system path/);
  assert.match(problemsWithOutput(valid, {status: 'ok', output: 'DynamicEObjectImpl@72c927f1\n'}).join(), /object identity/);
});
