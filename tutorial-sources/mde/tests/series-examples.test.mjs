import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {ensureRunner, runJobs} from '../tools/runner.mjs';
import {loadExamples, toJob, sanitize, problemsWithOutput} from '../tools/examples.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
let runs;
/** Runs every example of the series once and caches the results: id -> {example, result}. */
function series() {
  if (runs) return runs;
  const folders = fs.readdirSync(path.join(ROOT, 'examples')).filter(name => /^module_\d\d$/.test(name)).sort();
  const examples = folders.flatMap(name => loadExamples(path.join(ROOT, 'examples', name), Number(name.slice('module_'.length))));
  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'mde-series-'));
  const results = runJobs(ensureRunner(path.join(ROOT, 'runner')), examples.map(toJob), work);
  runs = new Map(examples.map(example => {
    const raw = results.get(example.id);
    return [example.id, {example, result: {status: raw.status, output: sanitize(raw.output, [example.dir, work])}}];
  }));
  return runs;
}
const output = id => series().get(id).result.output;

test('every example in examples/ behaves as its example.json declares', () => {
  for (const [id, {example, result}] of series()) assert.deepEqual(problemsWithOutput(example, result), [], `${id}:\n${result.output}`);
});

test('Module 1 examples print what the lesson describes', () => {
  const tour = 'OrGate: door, window, open\nAndGate: open, armed, sound\nSiren: sound\n';
  assert.equal(output('m01-tour'), tour);
  assert.equal(output('m01-conformance'), 'Model warning (line 18): Could not resolve target Alarm.Siren.sond for reference target (target)\n' + tour);
  assert.equal(output('m01-validate'), [
    'Error [NoSelfLoop]: A connector joins AndGate to itself',
    'Warning [Connected]: OrGate.door is not connected',
    'Warning [Connected]: OrGate.window is not connected',
    'Warning [Connected]: Siren.sound is not connected', ''].join('\n'));
  assert.match(output('m01-generate'), /<tr><td>Siren<\/td><td>1<\/td><td>0<\/td><\/tr>/);
  assert.equal(output('m01-transform'), [
    'Graph name="Alarm"', '  Node name="OrGate"', '  Node name="AndGate"', '  Node name="Siren"',
    '  Edge source->OrGate target->AndGate', '  Edge source->AndGate target->Siren', ''].join('\n'));
  assert.equal(output('m01-e3-solution'), 'Sequence {"Siren"}\n');
  assert.equal(output('m01-e4-solution'), tour);
  assert.equal(output('m01-e5-solution'), 'All constraints are satisfied.\n');
  assert.equal(output('m01-e6-solution'), 'Sensor: reading\nFilter: raw, smoothed\nDisplay: value\n');
});
