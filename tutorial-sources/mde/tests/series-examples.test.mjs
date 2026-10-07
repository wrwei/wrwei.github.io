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

test('Module 2 examples show each metamodel change through the model', () => {
  assert.equal(output('m02-classes'), 'OrGate\nSiren\n');
  assert.equal(output('m02-bounds'), 'Components: 2\nOrGate\nSiren\n');
  assert.equal(output('m02-references'), 'open -> sound\n');
  assert.equal(output('m02-opposites'), 'OrGate belongs to Alarm\nSiren belongs to Alarm\n');
  assert.equal(output('m02-types'), 'door: DIGITAL\nopen: DIGITAL\nsound: DIGITAL\n');
  assert.equal(output('m02-e4-solution'), 'OrGate: Combines inputs\nSiren: Sounds the alarm\n');
  assert.equal(output('m02-e5-solution'), 'reading: ANALOG\nraw: ANALOG\ncommand: DIGITAL\n');
  assert.equal(output('m02-e6-solution'), 'OrGate.door\nOrGate.open\nSiren.sound\n');
});

test('Module 2 lower-bound example does not silently claim that loading validates bounds', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mde-bound-'));
  try {
    const example = series().get('m02-bounds').example;
    const flexmi = path.join(dir, 'empty.flexmi');
    fs.writeFileSync(flexmi, '<?nsuri components?>\n<architecture name="Empty"/>\n');
    const job = {...toJob(example), key: 'empty', flexmi};
    const result = runJobs(ensureRunner(path.join(ROOT, 'runner')), [job], path.join(dir, 'out')).get('empty');
    assert.deepEqual(result, {status: 'ok', output: 'Components: 0\n'});
  } finally {
    fs.rmSync(dir, {recursive: true, force: true});
  }
});

test('Module 3 XML and legacy YAML load the same structures', () => {
  const alarm = 'Architecture: Alarm\nComponents: 3\nPorts: 7\nConnectors: 2\n';
  const thermostat = 'Architecture: Thermostat\nComponents: 3\nPorts: 4\nConnectors: 2\n';
  assert.equal(output('m03-xml'), alarm);
  assert.equal(output('m03-yaml'), alarm);
  assert.equal(output('m03-diagram'), alarm);
  assert.equal(output('m03-e4-solution'), thermostat);
  assert.equal(output('m03-e5-solution'), thermostat);
});

test('Module 3 distinguishes a loaded connector from a resolved endpoint', () => {
  const endpoints = 'OrGate.open -> AndGate.open\nAndGate.sound -> Siren.sound\n';
  assert.equal(output('m03-references'), endpoints);
  assert.equal(output('m03-e6-solution'), endpoints);
  assert.equal(output('m03-broken'),
    'Model warning (line 17): Could not resolve target Alarm.Siren.sond for reference target (target)\n'
    + 'Architecture: Alarm\nComponents: 3\nPorts: 7\nConnectors: 2\n');
});

test('Modules 4–7 preserve the model-management results described in the lessons', () => {
  assert.equal(output('m04-quantify'), 'All connectors typed: true\nAny unconnected input: true\n');
  assert.equal(output('m04-mutate'), 'Renamed: Bell\nComponents now: AndGate, Bell, OrGate\n');
  assert.match(output('m05-types'), /Error \[CompatibleTypes\]: AndGate\.sound and Siren\.sound/);
  assert.equal(output('m05-guards'), 'All constraints are satisfied.\n');
  assert.match(output('m06-html'), /<tr><td>Siren<\/td><td>1<\/td><td>0<\/td><\/tr>/);
  assert.match(output('m06-java'), /--- Siren\.java ---/);
  assert.equal(output('m07-basic'), output('m07-equivalent'));
  assert.equal((output('m07-guard').match(/Edge source->/g) || []).length, 1);
  assert.equal((output('m07-lazy').match(/Node name=/g) || []).length, 7);
});

test('Module 8 checks illustrative drafts without making an LLM call', () => {
  assert.match(output('m08-draft'), /AndGate\.open -> OrGate\.open/);
  assert.match(output('m08-check'), /Error \[OutputToInput\]/);
  assert.equal(output('m08-correct'), 'All constraints are satisfied.\n');
  assert.match(output('m08-claims'), /model has 2/);
  assert.match(output('m08-prompt'), /--- Siren-review\.txt ---/);
});

test('Modules 9–10 keep the local handoff and capstone artefacts consistent', () => {
  assert.equal(output('m09-generate'), 'Architecture: Alarm\nComponents: 3\nConnectors: 2\n');
  assert.equal(output('m09-validate'), 'All constraints are satisfied.\n');
  assert.equal((output('m10-invalid').match(/Duplicate field: Customer\.email/g) || []).length, 2);
  assert.equal(output('m10-e4-solution'), 'All constraints are satisfied.\n');
  assert.match(output('m10-sql'), /FOREIGN KEY \(customer_id\) REFERENCES Customer\(id\)/);
  assert.match(output('m10-java'), /public Customer customer;/);
  assert.match(output('m10-html'), /<h2>Purchase<\/h2>/);
  assert.equal((output('m10-relational').match(/Column name="id" sqlType="INTEGER"/g) || []).length, 3);
  assert.doesNotMatch(output('m10-relational'), /ForeignKey/);
  assert.match(output('m10-e6-solution'), /Column name="product_id" sqlType="INTEGER"/);
  assert.match(output('m10-e6-solution'), /ForeignKey name="product" column="product_id" target->Product/);
});
