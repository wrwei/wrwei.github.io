// Builds the Git and version control series into docs/tutorials/git. From the repository root:
//   node tutorial-sources/git/build.mjs
// Every command session runs with real Git during the build, and the pages show that output.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {parseSession, runSession, gitVersion} from './tools/session.mjs';
import {renderLesson, renderOverview, checkParity, checkContract, lessonFile, overviewFile, pad} from './tools/pages.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));

// Each session runs in a fixed folder rather than a random one: Git writes the server's path into some
// commits (git pull's merge messages), so a fixed path keeps those commits' hashes the same on every run.
const SANDBOXES = process.platform === 'win32' ? path.join(os.tmpdir(), 'wrwei-git-sessions') : '/tmp/wrwei-git-sessions';

/** Takes the sandbox folder of session `id`, waiting while another build or test run is using it. */
function claimSandbox(id) {
  const dir = path.join(SANDBOXES, id);
  fs.mkdirSync(SANDBOXES, {recursive: true});
  const deadline = Date.now() + 120000;
  for (;;) {
    try {
      fs.mkdirSync(dir);
      return dir;
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
    }
    // a folder left behind by a run that crashed is removed after ten minutes
    if (Date.now() - fs.statSync(dir).mtimeMs > 600000) { fs.rmSync(dir, {recursive: true, force: true}); continue; }
    assert(Date.now() < deadline, `${dir} is still in use by another build or test run`);
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 200);
  }
}

/** Parses and runs every sessions/module_NN/*.session. Returns Map(id -> session with its record and graphs). */
export function runModuleSessions(dir, number, git = 'git') {
  const sessions = new Map();
  if (!fs.existsSync(dir)) return sessions;
  const problems = [];
  for (const name of fs.readdirSync(dir).filter(n => n.endsWith('.session')).sort()) {
    const id = name.slice(0, -'.session'.length);
    assert(/^[a-z0-9-]+$/.test(id) && id.startsWith(`m${pad(number)}-`), `${name}: session file names look like m${pad(number)}-<words>.session`);
    const session = parseSession(fs.readFileSync(path.join(dir, name), 'utf8'), name);
    const sandbox = claimSandbox(id);
    try {
      const result = runSession(session, {sandbox, git});
      problems.push(...result.problems);
      sessions.set(id, {...session, ...result});
    } finally {
      fs.rmSync(sandbox, {recursive: true, force: true, maxRetries: 3});
    }
  }
  assert.equal(problems.length, 0, `Sessions did not behave as declared:\n${problems.join('\n')}`);
  return sessions;
}

export function build({root = HERE, dest = path.resolve(HERE, '../../docs/tutorials/git'), git = 'git', expectVersion} = {}) {
  const series = readJson(path.join(root, 'plan/series.json'));
  const version = gitVersion(git);
  const expected = expectVersion ?? series.gitVersion;
  assert.equal(version, expected, `This machine has "${version}", but the published output came from "${expected}". Use that version of Git, or set "gitVersion" in plan/series.json to "${version}" and review every changed output before publishing.`);
  // A module is published once both language sources exist.
  const modules = series.modules.filter(m => ['en', 'zh'].every(lang => fs.existsSync(path.join(root, 'src', lang, `module_${pad(m.number)}.md`))));
  const published = modules.map(m => m.number);
  fs.mkdirSync(dest, {recursive: true});
  fs.cpSync(path.join(root, 'assets'), path.join(dest, 'assets'), {recursive: true});
  let count = 0;
  for (const m of modules) {
    const metaFile = path.join(root, 'plan', `module_${pad(m.number)}.json`);
    assert(fs.existsSync(metaFile), `plan/module_${pad(m.number)}.json is missing`);
    const meta = readJson(metaFile);
    const sessions = runModuleSessions(path.join(root, 'sessions', `module_${pad(m.number)}`), m.number, git);
    count += sessions.size;
    const sources = Object.fromEntries(['en', 'zh'].map(lang => [lang, fs.readFileSync(path.join(root, 'src', lang, `module_${pad(m.number)}.md`), 'utf8')]));
    assert.notEqual(sources.zh, sources.en, `Module ${pad(m.number)}: the Chinese source is a copy of the English one`);
    const records = {};
    for (const lang of ['en', 'zh']) {
      const {html, record} = renderLesson({meta, lang, source: sources[lang], sessions, version, series, published, figDirs: [path.join(root, 'figures', lang)]});
      fs.writeFileSync(path.join(dest, lessonFile(m.number, lang)), html);
      records[lang] = record;
    }
    checkParity(records.en, records.zh, m.number);
    if (meta.contract) checkContract(records.en, meta.contract, sessions, m.number);
  }
  for (const lang of ['en', 'zh']) fs.writeFileSync(path.join(dest, overviewFile(lang)), renderOverview({series, published, lang}));
  return {published, sessions: count, version};
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const {published, sessions, version} = build();
  console.log(`Built modules ${published.map(pad).join(', ') || '(none)'} in English and Chinese; ran ${sessions} sessions with ${version}.`);
}
