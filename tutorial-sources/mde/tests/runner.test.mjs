import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {ensureRunner, runJobs} from '../tools/runner.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const file = name => path.join(HERE, 'fixtures', 'epsilon', name);
const base = {emfatic: file('components.emf'), flexmi: file('alarm.flexmi')};

test('the runner runs each language and reports problems in plain words', () => {
  const jar = ensureRunner(path.join(HERE, '..', 'runner'));
  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'mde-runner-'));
  const results = runJobs(jar, [
    {key: 'eol', language: 'eol', program: file('tour.eol'), ...base},
    {key: 'evl', language: 'evl', program: file('rules.evl'), ...base, flexmi: file('alarm-loop.flexmi')},
    {key: 'egl', language: 'egl', program: file('parts.egl'), ...base},
    {key: 'egx', language: 'egx', program: file('components.egx'), secondProgram: file('template.egl'), ...base},
    {key: 'etl', language: 'etl', program: file('components2graph.etl'), secondEmfatic: file('graph.emf'), ...base},
    {key: 'dangling', language: 'eol', program: file('tour.eol'), ...base, flexmi: file('alarm-broken.flexmi')},
    {key: 'badMetamodel', language: 'eol', program: file('tour.eol'), ...base, emfatic: file('broken.emf')},
    {key: 'badProgram', language: 'eol', program: file('syntax.eol'), ...base},
  ], work);

  assert.deepEqual(results.get('eol'), {status: 'ok', output: 'OrGate: door, window, open\nAndGate: open, armed, sound\nSiren: sound\n'});
  assert.deepEqual(results.get('evl'), {status: 'ok', output: [
    'Error [NoSelfLoop]: A connector joins AndGate to itself',
    'Warning [Connected]: OrGate.door is not connected',
    'Warning [Connected]: OrGate.window is not connected',
    'Warning [Connected]: Siren.sound is not connected', ''].join('\n')});
  assert.equal(results.get('egl').status, 'ok');
  assert.match(results.get('egl').output, /<tr><td>Siren<\/td><td>1<\/td><td>0<\/td><\/tr>/);
  assert.deepEqual(results.get('egx'), {status: 'ok', output: [
    '--- AndGate.txt ---', 'Component AndGate has 3 ports.',
    '--- OrGate.txt ---', 'Component OrGate has 3 ports.',
    '--- Siren.txt ---', 'Component Siren has 1 ports.', ''].join('\n')});
  assert.deepEqual(results.get('etl'), {status: 'ok', output: [
    'Graph name="Alarm"', '  Node name="OrGate"', '  Node name="AndGate"', '  Node name="Siren"',
    '  Edge source->OrGate target->AndGate', '  Edge source->AndGate target->Siren', ''].join('\n')});
  assert.equal(results.get('dangling').status, 'ok');
  assert.match(results.get('dangling').output, /^Model warning \(line 18\): Could not resolve target Alarm\.Siren\.sond/);
  assert.equal(results.get('badMetamodel').status, 'error');
  assert.match(results.get('badMetamodel').output, /^Metamodel error in broken\.emf: .*line 3/);
  assert.equal(results.get('badProgram').status, 'error');
  assert.match(results.get('badProgram').output, /^Parse error in syntax\.eol line 1: /);
  assert.equal(results.get('badProgram').output.trim().split('\n').length, 1, 'only the first parse problem is reported');
});
