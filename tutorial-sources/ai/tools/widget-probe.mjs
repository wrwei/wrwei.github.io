// Set a widget's controls and read back what it displays, to check its numbers against an
// independent calculation.
//   node widget-probe.mjs <name> [--lang en|zh] [--set "0=0.5;3=cosine;5=click"] [--wait 400] [--shot path.png]
// Controls are numbered in DOM order (inputs, selects, buttons). The tool first lists every
// control (index, kind, label, current value), then applies the --set assignments in order
// (a range or number gets the value, a select the option value, a checkbox true/false, a button
// "click"), then prints the widget's full visible text and, if asked, a screenshot.
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
const sets = (get('--set', '') || '').split(';').filter(Boolean).map(s => { const i = s.indexOf('='); return [Number(s.slice(0, i)), s.slice(i + 1)] })
const wait = Number(get('--wait', 400))
const shot = get('--shot', null)
const url = `${pathToFileURL(path.join(HERE, 'widget-harness.html')).href}?w=${encodeURIComponent(name)}&lang=${lang}`

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox', '--allow-file-access-from-files'] })
const errors = []
try {
  const page = await browser.newPage()
  await page.setViewport({ width: 900, height: 900 })
  page.on('pageerror', e => errors.push(String(e.message || e)))
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 })
  await page.waitForFunction('window.__mounted', { timeout: 15000 })
  await new Promise(r => setTimeout(r, 300))
  const list = () => page.evaluate(() => [...document.querySelectorAll('#w input, #w select, #w button')].map((el, i) => ({
    i, kind: el.tagName === 'INPUT' ? el.type : el.tagName.toLowerCase(),
    label: ((el.closest('label') && el.closest('label').innerText.split('\n')[0]) || el.innerText || '').trim().slice(0, 60),
    value: el.tagName === 'BUTTON' ? '' : (el.type === 'checkbox' ? String(el.checked) : el.value),
  })))
  console.log('CONTROLS BEFORE')
  for (const c of await list()) console.log(`  [${c.i}] ${c.kind.padEnd(8)} ${JSON.stringify(c.label).padEnd(40)} = ${c.value}`)
  for (const [i, v] of sets) {
    await page.evaluate((i, v) => {
      const el = document.querySelectorAll('#w input, #w select, #w button')[i]
      if (!el) throw new Error('no control ' + i)
      const fire = t => el.dispatchEvent(new Event(t, { bubbles: true }))
      if (el.tagName === 'BUTTON' || v === 'click') { el.click(); return }
      if (el.type === 'checkbox') { if (String(el.checked) !== v) el.click(); return }
      el.value = v; fire('input'); fire('change')
    }, i, v)
    await new Promise(r => setTimeout(r, wait))
  }
  if (sets.length) {
    console.log('CONTROLS AFTER')
    for (const c of await list()) console.log(`  [${c.i}] ${c.kind.padEnd(8)} ${JSON.stringify(c.label).padEnd(40)} = ${c.value}`)
  }
  console.log('WIDGET TEXT')
  console.log((await page.evaluate(() => document.querySelector('#w').innerText)).split('\n').map(l => '  ' + l).join('\n'))
  if (shot) { const el = await page.$('.widget-wrap'); await el.screenshot({ path: shot }); console.log('SHOT ' + shot) }
} finally {
  await browser.close()
}
if (errors.length) { console.log('ERRORS'); errors.forEach(e => console.log('  ' + e)) }
