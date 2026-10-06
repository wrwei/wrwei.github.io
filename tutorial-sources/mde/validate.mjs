/* Browser checks for the MDE series, using the AI tools' puppeteer-core. From the repository root,
   after build.mjs:   node tutorial-sources/mde/validate.mjs
   Set MDE_BROWSER_PATH to choose a Chromium-based browser. Screenshots go to the system temp folder. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {dirname, resolve, extname, sep, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {tmpdir} from 'node:os';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(resolve(here, '../ai/tools/package.json'));
const puppeteer = require('puppeteer-core');
const docs = resolve(here, '../../docs');
const site = join(docs, 'tutorials', 'mde');
const BUNDLE_URL = 'https://wrwei.github.io/tutorials/mde/playground/examples.json';
const FILE_FIELDS = ['program', 'secondProgram', 'flexmi', 'emfatic', 'secondEmfatic'];
const pad = n => String(n).padStart(2, '0');
const executablePath = process.env.MDE_BROWSER_PATH || [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/chromium', '/usr/bin/google-chrome',
].find(fs.existsSync);
assert(executablePath, 'Set MDE_BROWSER_PATH to a Chromium-based browser');

const series = JSON.parse(fs.readFileSync(join(here, 'plan', 'series.json'), 'utf8'));
const published = series.modules.map(m => m.number).filter(n => fs.existsSync(join(site, `module_${pad(n)}_EN.html`)));
assert(published.length, 'No module pages found: run build.mjs first');
const bundle = JSON.parse(fs.readFileSync(join(site, 'playground', 'examples.json'), 'utf8'));
const groups = new Map(bundle.examples.map(g => [Number(g.title.match(/^Module (\d+)/)[1]), g.examples]));
for (const entry of [...groups.values()].flat()) {
  for (const field of FILE_FIELDS) if (entry[field]) assert(fs.existsSync(join(site, 'playground', entry[field])), `examples.json names a missing file: ${entry[field]}`);
}

const types = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.zip': 'application/zip'};
const server = createServer(async (req, res) => {
  const file = resolve(docs, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
  if (!file.startsWith(docs + sep)) { res.writeHead(403).end(); return; }
  try { res.setHeader('Content-Type', types[extname(file)] || 'text/plain; charset=utf-8'); res.end(await readFile(file)); }
  catch { res.writeHead(404).end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/tutorials/mde/`;
let browser;
try {
  browser = await puppeteer.launch({executablePath, headless: true});
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  for (const number of published) {
    const contract = JSON.parse(fs.readFileSync(join(here, 'plan', `module_${pad(number)}.json`), 'utf8')).contract;
    const expected = (groups.get(number) || []).map(e => e.id);
    for (const lang of ['EN', 'ZH']) {
      const file = `module_${pad(number)}_${lang}.html`;
      await page.setViewport({width: 1280, height: 900});
      await page.goto(base + file, {waitUntil: 'networkidle0'});
      const missing = await page.evaluate(() => [...document.querySelectorAll('a[href^="#"]')].map(a => a.hash.slice(1)).filter(id => !document.getElementById(id)));
      assert.deepEqual(missing, [], `${file}: in-page links resolve`);
      const examples = await page.$$eval('.example', els => els.map(el => ({
        id: el.id.replace(/^ex-/, ''),
        href: el.querySelector('.playground-btn')?.href,
        output: el.querySelector('.output pre')?.textContent.trim() || '',
      })));
      assert.deepEqual(examples.map(e => e.id).sort(), [...expected].sort(), `${file}: shows every example of the module once`);
      for (const e of examples) {
        const url = new URL(e.href);
        assert.equal(url.origin + url.pathname, 'https://eclipse.dev/epsilon/playground/', `${file} ${e.id}: Playground address`);
        assert.equal(url.searchParams.get('examples'), BUNDLE_URL, `${file} ${e.id}: bundle address`);
        assert.deepEqual([...url.searchParams.keys()], ['examples', e.id], `${file} ${e.id}: selects its own example`);
        assert(e.output.length > 0, `${file} ${e.id}: has captured output`);
      }
      assert.equal(await page.$$eval('.exercise', els => els.length), contract.exercises, `${file}: exercises`);
      assert.equal(await page.$$eval('details.solution', els => els.length), contract.exercises, `${file}: solutions`);
      const questions = await page.$$eval('.quiz-q', els => els.length);
      assert(questions >= contract.quiz[0] && questions <= contract.quiz[1], `${file}: quiz length`);
      const download = await page.$eval('.download-link', a => a.href);
      assert.equal(await page.evaluate(async href => (await fetch(href)).status, download), 200, `${file}: download exists`);
      await page.click('#moduleDropdown .badge');
      assert.equal(await page.$eval('#moduleDropdown .badge', el => el.getAttribute('aria-expanded')), 'true');
      await page.keyboard.press('Escape');
      assert.equal(await page.$eval('#moduleDropdown', el => el.classList.contains('open')), false);
      for (const question of await page.$$('.quiz-q')) {
        const answer = await question.evaluate(el => el.dataset.answer);
        await question.$eval(`[data-i="${answer}"]`, el => el.click());
      }
      assert.match(await page.$eval('.quiz-score', el => el.textContent), new RegExp(`${questions} / ${questions}`), `${file}: full marks for right answers`);
      await page.$eval('details.solution summary', el => el.click());
      assert.equal(await page.$eval('details.solution', el => el.open), true, `${file}: solutions open`);
      await page.$eval('.session-done input', el => { el.checked = true; el.dispatchEvent(new Event('change')); });
      await page.reload({waitUntil: 'networkidle0'});
      assert.equal(await page.$eval('.session-done input', el => el.checked), true, `${file}: progress survives a reload`);
      await Promise.all([page.waitForNavigation({waitUntil: 'networkidle0'}), page.click('.lang-switch')]);
      assert(page.url().endsWith(`module_${pad(number)}_${lang === 'EN' ? 'ZH' : 'EN'}.html`), `${file}: language switch`);
      assert.equal(await page.$eval('.session-done input', el => el.checked), true, `${file}: progress is shared across languages`);
      await page.$eval('.session-done input', el => { el.checked = false; el.dispatchEvent(new Event('change')); });
      await page.goto(base + file, {waitUntil: 'networkidle0'});
      for (const width of [360, 390, 768, 1280]) {
        await page.setViewport({width, height: 900});
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${file}: no horizontal scrolling at ${width}px`);
        if (width < 900) assert.equal(await page.$eval('.mobile-toc', el => getComputedStyle(el).display), 'block', `${file}: mobile contents at ${width}px`);
      }
      await page.setViewport({width: 1280, height: 900});
      await page.screenshot({path: join(tmpdir(), `wrwei-mde-module-${pad(number)}-${lang}.png`)});
      await page.setViewport({width: 390, height: 844});
      await page.screenshot({path: join(tmpdir(), `wrwei-mde-module-${pad(number)}-${lang}-mobile.png`)});
    }
  }
  for (const lang of ['EN', 'ZH']) {
    const index = lang === 'EN' ? 'index.html' : 'index_ZH.html';
    await page.setViewport({width: 1280, height: 900});
    await page.goto(base + index, {waitUntil: 'networkidle0'});
    assert.equal(await page.$$eval('.module-card', els => els.length), series.modules.length, `${index}: one card per module`);
    assert.equal(await page.$$eval('a.module-card', els => els.length), published.length, `${index}: published modules are linked`);
    assert.equal(await page.$$eval('article.module-card.planned', els => els.length), series.modules.length - published.length, `${index}: other modules are marked planned`);
    assert.equal(await page.$$eval('#acknowledgements', els => els.length), 1, `${index}: acknowledgements`);
    for (const width of [360, 1280]) {
      await page.setViewport({width, height: 900});
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${index}: fits ${width}px`);
    }
    await page.screenshot({path: join(tmpdir(), `wrwei-mde-overview-${lang}.png`), fullPage: true});
  }
  assert.deepEqual(errors, [], 'No browser runtime errors');
  console.log(`PASS: modules ${published.map(pad).join(', ')} in both languages, ${[...groups.values()].flat().length} Playground examples, overview pages, quiz, solutions, progress, language switch and layouts at 360–1280px.`);
  console.log(`Screenshots: ${join(tmpdir(), 'wrwei-mde-*.png')}`);
} finally {
  if (browser) await browser.close();
  server.close();
}
