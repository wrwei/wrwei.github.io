/* Browser verification using the AI series' existing puppeteer-core dependency.
   Run from the repository root: node tutorial-sources/cs/validate.mjs */
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {dirname, resolve, extname, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {tmpdir} from 'node:os';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(resolve(here, '../ai/tools/package.json'));
const puppeteer = require('puppeteer-core');
const docs = resolve(here, '../../docs');
const executablePath = process.env.CS_BROWSER_PATH || [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/chromium', '/usr/bin/google-chrome'
].find(existsSync);
assert(executablePath, 'Set CS_BROWSER_PATH to your Chromium browser executable');
const types = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css'};
const server = createServer(async (req, res) => {
  const path = resolve(docs, '.' + new URL(req.url, 'http://localhost').pathname);
  if (!path.startsWith(docs + sep)) { res.writeHead(403).end(); return; }
  try { res.setHeader('Content-Type', types[extname(path)] || 'text/plain'); res.end(await readFile(path)); }
  catch { res.writeHead(404).end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
let browser;
try {
  browser = await puppeteer.launch({executablePath, headless: true});
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  const base = `http://127.0.0.1:${server.address().port}/tutorials/cs/`;
  for (const lang of ['EN', 'ZH']) {
    await page.setViewport({width: 1280, height: 900});
    await page.goto(base + `module_01_${lang}.html`, {waitUntil: 'networkidle0'});
    const missing = await page.evaluate(() => [...document.querySelectorAll('a[href^="#"]')]
      .map(a => a.hash.slice(1)).filter(id => !document.getElementById(id)));
    assert.deepEqual(missing, [], 'All section links resolve');
    assert.equal(await page.$eval('#main', el => getComputedStyle(el).fontFamily.includes('DM Sans')), true);
    assert.equal(await page.$$eval('.exercise', els => els.length), 8);
    assert.equal(await page.$$eval('.output', els => els.length), 3);
    await page.click('#moduleDropdown .badge');
    assert.equal(await page.$eval('#moduleDropdown .badge', el => el.getAttribute('aria-expanded')), 'true');
    await page.keyboard.press('Escape');
    assert.equal(await page.$eval('#moduleDropdown', el => el.classList.contains('open')), false);
    const step = '#search-trace [data-action="step"]';
    for (let i = 0; i < 3; i++) await page.click(step);
    assert.equal(await page.$eval(step, el => el.disabled), true);
    assert.match(await page.$eval('.trace-status', el => el.textContent), /(?:index 2.*3|索引 2.*3)/);
    await page.select('#search-trace select', 'Dune');
    await page.click(step);
    assert.match(await page.$eval('.trace-status', el => el.textContent), /(?:index 0.*1|索引 0.*1)/);
    await page.select('#search-trace select', 'Solaris');
    for (let i = 0; i < 5; i++) await page.click(step);
    assert.match(await page.$eval('.trace-status', el => el.textContent), /-1.*4/);
    await page.click('#search-trace input');
    await page.click(step);
    assert.match(await page.$eval('.trace-status', el => el.textContent), /-1.*0/);
    await page.click('.quiz-q [data-i="1"]'); // deliberately wrong for question 1
    assert.equal(await page.$$eval('.quiz-q:first-child .wrong', els => els.length), 1);
    assert.match(await page.$eval('.quiz-score', el => el.textContent), /0 \/ 1/);
    await page.click('.quiz-reset');
    for (const question of await page.$$('.quiz-q')) {
      const answer = await question.evaluate(el => el.dataset.answer);
      await question.$eval(`[data-i="${answer}"]`, el => el.click());
    }
    assert.match(await page.$eval('.quiz-score', el => el.textContent), /8 \/ 8/);
    await page.$eval('.session-done input', el => { el.checked = true; el.dispatchEvent(new Event('change')); });
    await page.reload({waitUntil: 'networkidle0'});
    assert.equal(await page.$eval('.session-done input', el => el.checked), true);
    await page.click('.lang-switch');
    assert.equal(await page.$eval('.session-done input', el => el.checked), true, 'Progress is shared across languages');
    for (const width of [360, 390, 768, 1280]) {
      await page.setViewport({width, height: 900});
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `No horizontal overflow at ${width}`);
      if (width < 900) assert.equal(await page.$eval('.mobile-toc', el => getComputedStyle(el).display), 'block');
    }
    await page.setViewport({width: 1280, height: 900});
    await page.goto(base + `module_01_${lang}.html`, {waitUntil: 'networkidle0'});
    await page.screenshot({path: resolve(tmpdir(), `wrwei-cs-module-${lang}.png`)});
    const index = lang === 'EN' ? 'index.html' : 'index_ZH.html';
    await page.goto(base + index, {waitUntil: 'networkidle0'});
    assert.equal(await page.$$eval('.module-card', els => els.length), 14);
    assert.equal(await page.$$eval('a.module-card', els => els.length), 1);
    assert.equal(await page.$$eval('article.module-card.planned', els => els.length), 13);
    await page.setViewport({width: 360, height: 900});
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'Mobile overview fits');
    await page.screenshot({path: resolve(tmpdir(), `wrwei-cs-overview-${lang}-mobile.png`), fullPage: true});
  }
  assert.deepEqual(errors, [], 'No browser runtime errors');
  console.log('PASS: bilingual pages, roadmap, traces, edge cases, quiz feedback/reset, persisted progress, language switching, and responsive layouts.');
  console.log(`Screenshots: ${tmpdir()}/wrwei-cs-*.png`);
} finally {
  if (browser) await browser.close();
  server.close();
}
