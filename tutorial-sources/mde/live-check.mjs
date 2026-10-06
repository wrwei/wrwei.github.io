/* After publication: runs every published example in the real Epsilon Playground and checks that it
   succeeds or fails as its example.json declares. It uses the Playground's public service, so it runs
   one example at a time with a pause between runs. From the repository root, after deployment:
     node tutorial-sources/mde/live-check.mjs        all published modules
     node tutorial-sources/mde/live-check.mjs 1      Module 01 only
   Set MDE_BROWSER_PATH to choose a Chromium-based browser. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {dirname, resolve, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {loadExamples} from './tools/examples.mjs';
import {playgroundLink} from './tools/bundle.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(resolve(here, '../ai/tools/package.json'));
const puppeteer = require('puppeteer-core');
const BUNDLE_URL = 'https://wrwei.github.io/tutorials/mde/playground/examples.json';
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

const live = await (await fetch(BUNDLE_URL, {cache: 'no-store'})).json();
const liveIds = new Set(live.examples.flatMap(group => group.examples.map(e => e.id)));
const only = process.argv[2] ? Number(process.argv[2]) : null;
const series = JSON.parse(fs.readFileSync(join(here, 'plan', 'series.json'), 'utf8'));
const modules = series.modules.map(m => m.number)
  .filter(n => (only === null || n === only) && fs.existsSync(join(here, 'src', 'en', `module_${pad(n)}.md`)));
const examples = modules.flatMap(n => loadExamples(join(here, 'examples', `module_${pad(n)}`), n));
const unpublished = examples.filter(e => !liveIds.has(e.id)).map(e => e.id);
assert.deepEqual(unpublished, [], `Not in the published bundle yet (deploy first): ${unpublished.join(', ')}`);

const browser = await puppeteer.launch({executablePath, headless: true});
const mismatches = [];
try {
  const page = await browser.newPage();
  for (const example of examples) {
    await page.goto(playgroundLink(BUNDLE_URL, example.id), {waitUntil: 'networkidle2', timeout: 90000});
    await page.waitForFunction(() => typeof window.runProgram === 'function', {timeout: 30000});
    const [response] = await Promise.all([
      page.waitForResponse(r => r.request().method() === 'POST' && new URL(r.url()).pathname.endsWith('/epsilon'), {timeout: 90000}),
      page.evaluate(() => window.runProgram()),
    ]);
    const result = await response.json();
    const status = 'error' in result ? 'error' : 'ok';
    const line = `${example.id}: ${status}${status === 'error' ? ` (${String(result.error).split('\n')[0]})` : ''}`;
    console.log(line);
    if (status !== example.expect) mismatches.push(`${line}; example.json expects "${example.expect}"`);
    await new Promise(r => setTimeout(r, PAUSE_MS));
  }
} finally {
  await browser.close();
}
assert.deepEqual(mismatches, [], `The Playground disagrees with the build:\n${mismatches.join('\n')}`);
console.log(`PASS: ${examples.length} examples behave in the Playground as their example.json declares.`);
