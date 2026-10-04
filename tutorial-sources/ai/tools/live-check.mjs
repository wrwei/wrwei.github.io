// Check published pages on the live site: KaTeX errors, untypeset maths, broken images, widgets,
// literal ** outside code, and page script errors.
//   node tools/live-check.mjs [--base https://wrwei.github.io/tutorials/ai/] module_05_EN module_05_ZH index
// Behind a TLS-intercepting proxy, pass the proxy CA's SPKI hash in LIVE_SPKI; if the KaTeX CDN is
// blocked, its files are served from tools/node_modules/katex/dist instead.
import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const KATEX = path.join(here, 'node_modules/katex/dist/');
const args = process.argv.slice(2);
let base = 'https://wrwei.github.io/tutorials/ai/';
const bi = args.indexOf('--base');
if (bi >= 0) { base = args[bi + 1]; args.splice(bi, 2); }
const pages = args.length ? args : ['index', 'index_ZH'];
const chrome = process.env.CHROME_PATH || '/opt/pw-browsers/chromium';
const flags = ['--no-sandbox'];
if (process.env.LIVE_SPKI) flags.push('--ignore-certificate-errors-spki-list=' + process.env.LIVE_SPKI);
const types = { '.css': 'text/css', '.js': 'application/javascript', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf' };

const browser = await puppeteer.launch({ executablePath: chrome, args: flags });
let failed = 0;
for (const p of pages) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.setRequestInterception(true);
  page.on('request', r => {
    const u = r.url();
    if (u.includes('katex') && u.includes('/dist/')) {
      const f = KATEX + u.split('/dist/')[1].split('?')[0];
      if (fs.existsSync(f)) return r.respond({ status: 200, headers: { 'Access-Control-Allow-Origin': '*' },
        contentType: types[path.extname(f)] || 'application/octet-stream', body: fs.readFileSync(f) });
    }
    r.continue();
  });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  const url = base + (p.endsWith('.html') ? p : p + '.html');
  const resp = await page.goto(url, { waitUntil: 'networkidle0', timeout: 90000 });
  const r = await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 800) { window.scrollTo(0, y); await new Promise(s => setTimeout(s, 30)); }
    await new Promise(s => setTimeout(s, 1500));
    const clone = document.body.cloneNode(true);
    clone.querySelectorAll('pre, code, script, style, .katex').forEach(n => n.remove());
    const imgs = [...document.images];
    return {
      katex: document.querySelectorAll('.katex').length,
      katexErrors: document.querySelectorAll('.katex-error').length,
      rawTex: (clone.textContent.match(/\$\$|\\frac|\\mathbf/g) || []).length,
      literalStars: (clone.textContent.match(/\*\*/g) || []).length,
      images: imgs.length,
      broken: imgs.filter(i => i.complete && i.naturalWidth === 0).map(i => i.src),
      widgets: document.querySelectorAll('.widget').length,
    };
  });
  const bad = resp.status() !== 200 || r.katexErrors || r.rawTex || r.literalStars || r.broken.length || errors.length;
  if (bad) failed++;
  console.log(`${bad ? 'FAIL' : 'ok  '} ${p} http ${resp.status()} ${JSON.stringify(r)} pageErrors ${errors.length}`, errors.slice(0, 3));
  await page.close();
}
await browser.close();
process.exit(failed ? 1 : 0);
