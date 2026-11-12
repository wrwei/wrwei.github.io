// Builds the Model-Driven Engineering series into docs/tutorials/mde. From the repository root:
//   node tutorial-sources/mde/build.mjs
// Every example runs on Eclipse Epsilon during the build; pages show that captured output.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {ensureRunner, runJobs} from './tools/runner.mjs';
import {loadExamples, toJob, sanitize, problemsWithOutput} from './tools/examples.mjs';
import {writeBundle, writeZip, zipEntries} from './tools/bundle.mjs';
import {renderLesson, renderOverview, checkParity, checkContract, lessonFile, overviewFile, pad, EPSILON_VERSION} from './tools/pages.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const BUNDLE_URL = 'https://wrwei.github.io/tutorials/mde/playground/examples.json';
const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));

export function build({root = HERE, dest = path.resolve(HERE, '../../docs/tutorials/mde'), bundleUrl = BUNDLE_URL, runnerDir = path.join(HERE, 'runner')} = {}) {
  const series = readJson(path.join(root, 'plan/series.json'));
  // A module is published once both language sources exist.
  const modules = series.modules.filter(m => ['en', 'zh'].every(lang => fs.existsSync(path.join(root, 'src', lang, `module_${pad(m.number)}.md`))));
  const published = modules.map(m => m.number);

  const examples = modules.flatMap(m => loadExamples(path.join(root, 'examples', `module_${pad(m.number)}`), m.number).map(e => ({...e, module: m.number})));
  const ids = examples.map(e => e.id);
  assert.equal(new Set(ids).size, ids.length, 'Example ids must be unique');
  const workDir = path.join(root, 'out');
  const results = examples.length ? runJobs(ensureRunner(runnerDir), examples.map(toJob), workDir) : new Map();
  const failures = [];
  for (const example of examples) {
    const raw = results.get(example.id);
    example.result = {status: raw.status, output: sanitize(raw.output, [example.dir, workDir])};
    const problems = problemsWithOutput(example, example.result);
    if (problems.length) failures.push(`${example.id}:\n  - ${problems.join('\n  - ')}\n  output:\n${example.result.output.replace(/^/gm, '    ')}`);
  }
  assert.equal(failures.length, 0, `Examples did not behave as their example.json declares:\n${failures.join('\n')}`);

  fs.mkdirSync(dest, {recursive: true});
  fs.cpSync(path.join(root, 'assets'), path.join(dest, 'assets'), {recursive: true});
  const byId = new Map(examples.map(e => [e.id, e]));
  for (const m of modules) {
    const metaFile = path.join(root, 'plan', `module_${pad(m.number)}.json`);
    assert(fs.existsSync(metaFile), `plan/module_${pad(m.number)}.json is missing`);
    const meta = readJson(metaFile);
    const own = examples.filter(e => e.module === m.number);
    const sources = Object.fromEntries(['en', 'zh'].map(lang => [lang, fs.readFileSync(path.join(root, 'src', lang, `module_${pad(m.number)}.md`), 'utf8')]));
    assert.notEqual(sources.zh, sources.en, `Module ${pad(m.number)}: the Chinese source is a copy of the English one`);
    const records = {};
    for (const lang of ['en', 'zh']) {
      const {html, record} = renderLesson({meta, lang, source: sources[lang], byId, bundleUrl, series, published});
      fs.writeFileSync(path.join(dest, lessonFile(m.number, lang)), html);
      records[lang] = record;
    }
    checkParity(records.en, records.zh, m.number);
    if (meta.contract) checkContract(records.en, meta.contract, own, m.number);
    writeZip(path.join(dest, 'downloads', `module_${pad(m.number)}.zip`), zipEntries(own));
  }
  for (const lang of ['en', 'zh']) fs.writeFileSync(path.join(dest, overviewFile(lang)), renderOverview({series, published, lang}));
  writeBundle(dest, modules.map(m => ({...m, examples: examples.filter(e => e.module === m.number)})));
  return {published, examples: examples.length};
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const {published, examples} = build();
  console.log(`Built modules ${published.map(pad).join(', ') || '(none)'} in English and Chinese; ran ${examples} examples on Epsilon ${EPSILON_VERSION}.`);
}
