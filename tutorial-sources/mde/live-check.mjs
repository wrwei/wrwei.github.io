/* Runs every example in the real Epsilon Playground and compares the result with the output that
   Epsilon 2.8.0 produces in the build. It uses the Playground's public service, so it runs one example
   at a time with a pause between runs. From the repository root:
     node tutorial-sources/mde/live-check.mjs              before publication: serves the bundle from docs/
     node tutorial-sources/mde/live-check.mjs 1            Module 01 only
     node tutorial-sources/mde/live-check.mjs --published  after deployment: uses the live bundle
   Run build.mjs first. Set MDE_BROWSER_PATH to choose a Chromium-based browser. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import {dirname, resolve, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {ensureRunner, runJobs} from './tools/runner.mjs';
import {loadExamples, toJob, sanitize} from './tools/examples.mjs';
import {playgroundLink} from './tools/bundle.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(resolve(here, '../ai/tools/package.json'));
const puppeteer = require('puppeteer-core');
const SITE = 'https://wrwei.github.io/tutorials/mde/';
const BUNDLE_URL = SITE + 'playground/examples.json';
const PAUSE_MS = 3000;
const pad = n => String(n).padStart(2, '0');
const executablePath = process.env.MDE_BROWSER_PATH || [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/chromium', '/usr/bin/google-chrome',
].find(fs.existsSync);
assert(executablePath, 'Set MDE_BROWSER_PATH to a Chromium-based browser');

const args = process.argv.slice(2);
const published = args.includes('--published');
const only = args.find(a => /^\d+$/.test(a));
const series = JSON.parse(fs.readFileSync(join(here, 'plan', 'series.json'), 'utf8'));
const modules = series.modules.map(m => m.number)
  .filter(n => (!only || n === Number(only)) && fs.existsSync(join(here, 'src', 'en', `module_${pad(n)}.md`)));
const examples = modules.flatMap(n => loadExamples(join(here, 'examples', `module_${pad(n)}`), n));
const site = join(here, '..', '..', 'docs', 'tutorials', 'mde');
const bundle = published
  ? await (await fetch(BUNDLE_URL, {cache: 'no-store'})).json()
  : JSON.parse(fs.readFileSync(join(site, 'playground', 'examples.json'), 'utf8'));
const bundled = new Set(bundle.examples.flatMap(group => group.examples.map(e => e.id)));
const missing = examples.filter(e => !bundled.has(e.id)).map(e => e.id);
assert.deepEqual(missing, [], `Not in the ${published ? 'published' : 'built'} bundle: ${missing.join(', ')}. ${published ? 'Deploy first.' : 'Run build.mjs first.'}`);

// The output the build shows for each example.
const work = fs.mkdtempSync(join(os.tmpdir(), 'mde-live-'));
const runs = runJobs(ensureRunner(join(here, 'runner')), examples.map(toJob), work);
const captured = id => sanitize(runs.get(id).output, [examples.find(e => e.id === id).dir, work]);

// How the Playground presents results (observed 2026-10-06; README "Things the tools do not catch"):
// - it never shows model warnings, such as unresolved Flexmi references;
// - EVL results appear only as notes on the validated model diagram, not in the console.
const NOTE_KIND = {_Constraint: 'Error', _Critique: 'Warning'};

/** EVL notes on the diagram, in the build's wording: "Error: …", "Warning: …" or "All constraints are satisfied." */
function evlNotes(source) {
  return [...source.matchAll(/^note [^\n]*<<(_\w+)>>\n([\s\S]*?)\nend note$/gm)].map(([, kind, text]) =>
    kind === '_Success' ? 'All constraints are satisfied.' : `${NOTE_KIND[kind]}: ${text.replace(/^\S+\s+/, '').replace(/\s*\n\s*/g, ' ')}`);
}

/** What the Playground shows for a run, in the build's wording where the two can be compared. */
function playgroundView(language, result) {
  if ('error' in result) return {status: 'error', text: null};
  if (language === 'eol') return {status: 'ok', text: result.output ?? ''};
  if (language === 'egl') return {status: 'ok', text: (result.output ?? '') + (result.generatedText ?? '')};
  if (language === 'evl') return {status: 'ok', text: [...(result.output ?? '').split('\n').filter(Boolean), ...evlNotes(result.validatedModelDiagramSource ?? '')].sort().join('\n')};
  return {status: 'ok', text: null};
}

/** The part of the build's output that the Playground is expected to show. */
function expectedView(language, output) {
  const lines = output.split('\n').filter(line => !line.startsWith('Model warning'));
  if (language === 'eol' || language === 'egl') return lines.join('\n');
  if (language === 'evl') return lines.filter(Boolean).map(line => line.replace(/^(Error|Warning) \[[^\]]*\]:/, '$1:')).sort().join('\n');
  return null;
}

const normalise = text => text.replace(/\r\n/g, '\n').split('\n').map(l => l.trimEnd()).join('\n').trim();
const browser = await puppeteer.launch({executablePath, headless: true});
const mismatches = [];
const report = [];
try {
  const page = await browser.newPage();
  if (!published) {
    await page.setRequestInterception(true);
    page.on('request', request => {
      const url = request.url();
      if (!url.startsWith(SITE)) return request.continue();
      const file = resolve(site, decodeURIComponent(url.slice(SITE.length).split('?')[0]));
      const headers = {'Access-Control-Allow-Origin': '*'};
      if (!file.startsWith(site) || !fs.existsSync(file)) return request.respond({status: 404, headers, body: ''});
      return request.respond({status: 200, headers, body: fs.readFileSync(file)});
    });
  }
  for (const example of examples) {
    await page.goto(playgroundLink(BUNDLE_URL, example.id), {waitUntil: 'networkidle2', timeout: 90000});
    await page.waitForFunction(() => typeof window.runProgram === 'function', {timeout: 30000});
    const [response] = await Promise.all([
      page.waitForResponse(r => r.request().method() === 'POST' && new URL(r.url()).pathname.endsWith('/epsilon'), {timeout: 90000}),
      page.evaluate(() => window.runProgram()),
    ]);
    const result = await response.json();
    const seen = playgroundView(example.language, result);
    const expected = expectedView(example.language, captured(example.id));
    const problems = [];
    if (seen.status !== example.expect) problems.push(`status ${seen.status}, example.json expects "${example.expect}"${seen.status === 'error' ? ` (${String(result.error).split('\n')[0]})` : ''}`);
    else if (expected !== null && seen.text !== null && normalise(seen.text) !== normalise(expected)) {
      problems.push(`the Playground shows\n${normalise(seen.text).replace(/^/gm, '      | ')}\n    but the build captured\n${normalise(expected).replace(/^/gm, '      | ')}`);
    }
    console.log(`${example.id}: ${problems.length ? 'MISMATCH' : 'ok'}`);
    for (const p of problems) mismatches.push(`${example.id}: ${p}`);
    report.push({id: example.id, language: example.language, result});
    await new Promise(r => setTimeout(r, PAUSE_MS));
  }
} finally {
  await browser.close();
}
fs.mkdirSync(join(here, 'out'), {recursive: true});
fs.writeFileSync(join(here, 'out', 'live-check.json'), JSON.stringify(report, null, 2) + '\n');
assert.deepEqual(mismatches, [], `The Playground disagrees with the build:\n${mismatches.join('\n')}`);
console.log(`PASS: ${examples.length} examples behave in the Playground as the build shows them${published ? ' (published bundle)' : ' (local bundle)'}.`);
