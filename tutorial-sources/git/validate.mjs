/* Browser checks for the Git series, using the AI tools' puppeteer-core. From the repository root,
   after build.mjs:   node tutorial-sources/git/validate.mjs
   Set GIT_SERIES_BROWSER_PATH to choose a Chromium-based browser. Screenshots go to the system temp folder. */
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
const site = join(docs, 'tutorials', 'git');
const pad = n => String(n).padStart(2, '0');
const executablePath = process.env.GIT_SERIES_BROWSER_PATH || [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/chromium', '/usr/bin/google-chrome',
].find(fs.existsSync);
assert(executablePath, 'Set GIT_SERIES_BROWSER_PATH to a Chromium-based browser');

const series = JSON.parse(fs.readFileSync(join(here, 'plan', 'series.json'), 'utf8'));
const published = series.modules.map(m => m.number).filter(n => fs.existsSync(join(site, `module_${pad(n)}_EN.html`)));
assert(published.length, 'No module pages found: run build.mjs first');
const sessionIds = n => {
  const dir = join(here, 'sessions', `module_${pad(n)}`);
  return fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith('.session')).map(f => f.slice(0, -8)).sort() : [];
};

const types = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml'};
const server = createServer(async (req, res) => {
  const file = resolve(docs, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
  if (!file.startsWith(docs + sep)) { res.writeHead(403).end(); return; }
  try { res.setHeader('Content-Type', types[extname(file)] || 'text/plain; charset=utf-8'); res.end(await readFile(file)); }
  catch { res.writeHead(404).end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/tutorials/git/`;
let browser;
try {
  browser = await puppeteer.launch({executablePath, headless: true});
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  for (const number of published) {
    const contract = JSON.parse(fs.readFileSync(join(here, 'plan', `module_${pad(number)}.json`), 'utf8')).contract;
    for (const lang of ['EN', 'ZH']) {
      const file = `module_${pad(number)}_${lang}.html`;
      await page.setViewport({width: 1280, height: 900});
      await page.goto(base + file, {waitUntil: 'networkidle0'});
      const missing = await page.evaluate(() => [...document.querySelectorAll('a[href^="#"]')].map(a => a.hash.slice(1)).filter(id => !document.getElementById(id)));
      assert.deepEqual(missing, [], `${file}: in-page links resolve`);
      const terms = await page.$$eval('.term', els => els.map(el => ({
        id: el.id.replace(/^term-/, ''),
        commands: [...el.querySelectorAll('pre.command code')].map(c => c.textContent),
        commandsWithCopy: el.querySelectorAll('pre.command .copy-btn').length,
        outputsWithCopy: el.querySelectorAll('.output .copy-btn').length,
        caption: el.querySelector('.term-caption')?.textContent || '',
      })));
      assert.deepEqual(terms.map(t => t.id).sort(), sessionIds(number), `${file}: shows every session of the module once`);
      for (const t of terms) {
        assert(t.commands.length > 0, `${file} ${t.id}: has commands`);
        assert(t.commands.every(c => !c.startsWith('$') && !c.endsWith('\n')), `${file} ${t.id}: a copied command has no prompt and no newline that would run it on paste`);
        assert.equal(t.commandsWithCopy, t.commands.length, `${file} ${t.id}: every command can be copied`);
        assert.equal(t.outputsWithCopy, 0, `${file} ${t.id}: outputs have no copy button`);
        assert.match(t.caption, new RegExp(series.gitVersion.replace(/[()]/g, '\\$&')), `${file} ${t.id}: the caption names the Git version`);
      }
      const graphs = await page.$$eval('figure.graph', els => els.map(el => ({svg: !!el.querySelector('svg[aria-hidden="true"]'), text: el.querySelector('pre.visually-hidden')?.textContent.trim() || ''})));
      for (const g of graphs) assert(g.svg && g.text.length > 0, `${file}: every commit graph has a drawing and a text alternative`);
      assert.equal(await page.$$eval('.exercise', els => els.length), contract.exercises, `${file}: exercises`);
      assert.equal(await page.$$eval('details.solution', els => els.length), contract.exercises, `${file}: solutions`);
      const questions = await page.$$eval('.quiz-q', els => els.length);
      assert(questions >= contract.quiz[0] && questions <= contract.quiz[1], `${file}: quiz length`);
      await page.click('#moduleDropdown .badge');
      assert.equal(await page.$eval('#moduleDropdown .badge', el => el.getAttribute('aria-expanded')), 'true');
      await page.keyboard.press('Escape');
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
      await page.screenshot({path: join(tmpdir(), `wrwei-git-module-${pad(number)}-${lang}.png`)});
      await page.setViewport({width: 390, height: 844});
      await page.screenshot({path: join(tmpdir(), `wrwei-git-module-${pad(number)}-${lang}-mobile.png`)});
    }
  }
  for (const lang of ['EN', 'ZH']) {
    const index = lang === 'EN' ? 'index.html' : 'index_ZH.html';
    await page.setViewport({width: 1280, height: 900});
    await page.goto(base + index, {waitUntil: 'networkidle0'});
    assert.equal(await page.$$eval('.module-card', els => els.length), series.modules.length, `${index}: one card per module`);
    assert.equal(await page.$$eval('a.module-card', els => els.length), published.length, `${index}: published modules are linked`);
    assert.equal(await page.$$eval('#acknowledgements', els => els.length), 1, `${index}: acknowledgements`);
    for (const width of [360, 1280]) {
      await page.setViewport({width, height: 900});
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${index}: fits ${width}px`);
    }
    await page.screenshot({path: join(tmpdir(), `wrwei-git-overview-${lang}.png`), fullPage: true});
  }
  assert.deepEqual(errors, [], 'No browser runtime errors');
  console.log(`PASS: modules ${published.map(pad).join(', ')} in both languages: sessions, copyable commands, graphs, quiz, solutions, progress, language switch and layouts at 360–1280px.`);
  console.log(`Screenshots: ${join(tmpdir(), 'wrwei-git-*.png')}`);
} finally {
  if (browser) await browser.close();
  server.close();
}
