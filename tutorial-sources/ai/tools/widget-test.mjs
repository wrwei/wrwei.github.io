// Exercise one widget in headless Chrome: mount it, screenshot it, drive every control, report errors.
//   node widget-test.mjs <name> [--lang en|zh] [--out prefix] [--width 900] [--attrs "k=v&k2=v2"]
// Prints JSON: errors (console + page), whether the canvas changed when each control moved,
// and the screenshot paths (initial state, then one after driving the controls).
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import puppeteer from 'puppeteer-core'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const CHROME = [process.env.CHROME_PATH, 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium',
  '/usr/bin/chromium-browser'].find(p => p && fs.existsSync(p))
const argv = process.argv.slice(2)
const name = argv[0]
const get = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d }
const lang = get('--lang', 'en')
const out = get('--out', path.join(HERE, '..', 'shots', `widget-${name}-${lang}`))
const width = Number(get('--width', 900))
const attrs = get('--attrs', '')
fs.mkdirSync(path.dirname(out), { recursive: true })
const url = `${pathToFileURL(path.join(HERE, 'widget-harness.html')).href}?w=${encodeURIComponent(name)}&lang=${lang}${attrs ? '&' + attrs : ''}`

const report = { widget: name, lang, errors: [], controls: [], shots: [] }
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox', '--allow-file-access-from-files'] })
try {
  const page = await browser.newPage()
  await page.setViewport({ width, height: 900 })
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') report.errors.push(`${m.type()}: ${m.text().slice(0, 300)}`) })
  page.on('pageerror', e => report.errors.push(`pageerror: ${String(e.message || e).slice(0, 300)}`))
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 })
  await page.waitForFunction('window.__mounted', { timeout: 15000 }).catch(() => report.errors.push('widget never mounted'))
  if (await page.evaluate('window.__mounted') === 'missing') report.errors.push(`src/widgets/${name}.js not found`)
  await new Promise(r => setTimeout(r, 600))
  const wrap = await page.$('.widget-wrap')
  const snap = async label => { const p = `${out}-${label}.png`; await wrap.screenshot({ path: p }); report.shots.push(p); return p }
  const canvasHash = () => page.evaluate(() => [...document.querySelectorAll('#w canvas')].map(c => { try { const d = c.toDataURL(); let h = 0; for (let i = 0; i < d.length; i += 7) h = (h * 31 + d.charCodeAt(i)) | 0; return h } catch (e) { return 0 } }).join(',') + '|' + document.querySelector('#w').innerText.length)
  await snap('1-initial')
  const empty = await page.evaluate(() => document.querySelector('#w').childElementCount === 0)
  if (empty) report.errors.push('widget rendered nothing')
  // drive controls: range inputs to min, max, middle; selects through every option; buttons once; checkboxes toggled
  const n = await page.evaluate(() => document.querySelectorAll('#w input, #w select, #w button').length)
  for (let i = 0; i < n; i++) {
    const before = await canvasHash()
    const kind = await page.evaluate(async i => {
      const el = document.querySelectorAll('#w input, #w select, #w button')[i]
      if (!el) return 'control gone (the widget rebuilt its controls)'
      const fire = (e, t) => e.dispatchEvent(new Event(t, { bubbles: true }))
      const label = (el.closest('label') && el.closest('label').innerText.split('\n')[0]) || el.innerText || el.type
      if (el.tagName === 'INPUT' && el.type === 'range') {
        for (const v of [el.min, el.max, (Number(el.min) + Number(el.max)) / 2]) { el.value = v; fire(el, 'input'); fire(el, 'change'); await new Promise(r => setTimeout(r, 120)) }
        return `range "${label}"`
      }
      if (el.tagName === 'SELECT') {
        for (const o of [...el.options].map(o => o.value).concat([el.options[0] && el.options[0].value])) { el.value = o; fire(el, 'change'); await new Promise(r => setTimeout(r, 150)) }
        return `select "${label}"`
      }
      if (el.tagName === 'INPUT' && el.type === 'checkbox') { el.click(); await new Promise(r => setTimeout(r, 150)); el.click(); return `checkbox "${label}"` }
      if (el.tagName === 'INPUT' && (el.type === 'number' || el.type === 'text')) { const old = el.value; el.value = el.type === 'number' ? String(Number(old || 0) + 1) : old; fire(el, 'input'); fire(el, 'change'); await new Promise(r => setTimeout(r, 150)); el.value = old; fire(el, 'input'); fire(el, 'change'); return `${el.type} input "${label}"` }
      if (el.tagName === 'BUTTON') { el.click(); await new Promise(r => setTimeout(r, 400)); return `button "${label.trim()}"` }
      return el.tagName
    }, i)
    await new Promise(r => setTimeout(r, 250))
    const after = await canvasHash()
    report.controls.push({ control: kind, changedOutput: before !== after })
  }
  await new Promise(r => setTimeout(r, 1500))
  await snap('2-after-controls')
  // narrow screen
  await page.setViewport({ width: 400, height: 900 })
  await new Promise(r => setTimeout(r, 500))
  await snap('3-narrow')
} finally {
  await browser.close()
}
console.log(JSON.stringify(report, null, 2))
