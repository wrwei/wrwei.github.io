// Render a page (or an SVG) in headless Chrome, report problems, take screenshots.
//   node shot.mjs <file-or-url> [--out prefix] [--width 1280] [--height 900] [--full]
//                 [--elements "figure.fig, .widget-wrap"] [--max 40] [--wait 1200] [--scale 1]
// Prints a JSON report: console errors, page errors, failed requests, KaTeX errors, maths left
// unrendered, widgets that failed to mount, and the screenshot paths.
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import puppeteer from 'puppeteer-core'

const CHROME = [process.env.CHROME_PATH, 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium',
  '/usr/bin/chromium-browser'].find(p => p && fs.existsSync(p))
const argv = process.argv.slice(2)
const target = argv[0]
const get = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d }
const has = k => argv.includes(k)
const out = get('--out', path.join(process.env.TEMP || '.', 'shot'))
const width = Number(get('--width', 1280))
const height = Number(get('--height', 900))
const max = Number(get('--max', 40))
const wait = Number(get('--wait', 1200))
const scale = Number(get('--scale', 1))
fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true })
const url = /^https?:|^file:/.test(target) ? target : pathToFileURL(path.resolve(target)).href

const report = { url, consoleErrors: [], pageErrors: [], failedRequests: [], katexErrors: [], unrendered: 0, widgets: 0, widgetsFailed: [], shots: [] }
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox', '--allow-file-access-from-files'] })
try {
  const page = await browser.newPage()
  await page.setViewport({ width, height, deviceScaleFactor: scale })
  page.on('console', m => { if (m.type() === 'error') report.consoleErrors.push(m.text().slice(0, 300)) })
  page.on('pageerror', e => report.pageErrors.push(String(e.message || e).slice(0, 300)))
  page.on('requestfailed', r => report.failedRequests.push(`${r.url().slice(0, 160)} (${r.failure() && r.failure().errorText})`))
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 90000 })
  // lazy images below the fold would otherwise be missing from screenshots
  await page.evaluate(async () => {
    const imgs = [...document.images]
    imgs.forEach(i => { i.loading = 'eager' })
    await Promise.all(imgs.map(i => i.complete ? null : new Promise(r => { i.onload = i.onerror = r })))
  })
  await new Promise(r => setTimeout(r, wait))
  if (!/\.svg$/i.test(target)) {
    const info = await page.evaluate(() => {
      const errs = [...document.querySelectorAll('.katex-error')].map(e => (e.getAttribute('title') || e.textContent).slice(0, 200))
      const unrendered = [...document.querySelectorAll('.math-i, .math-d')].filter(e => !e.querySelector('.katex')).length
      const widgets = [...document.querySelectorAll('.widget[data-widget]')]
      const failed = widgets.filter(w => w.querySelector('.w-note') && /not available|failed|暂不可用|启动失败/.test(w.textContent) || w.childElementCount === 0).map(w => w.getAttribute('data-widget'))
      const brokenImgs = [...document.images].filter(i => i.complete && i.naturalWidth === 0).map(i => i.getAttribute('src'))
      return { errs, unrendered, widgets: widgets.length, failed, brokenImgs, height: document.documentElement.scrollHeight }
    })
    report.katexErrors = info.errs
    report.unrendered = info.unrendered
    report.widgets = info.widgets
    report.widgetsFailed = info.failed
    report.brokenImages = info.brokenImgs
    report.pageHeight = info.height
  }
  const sel = get('--elements', null)
  const pages = Number(get('--pages', 0))
  if (pages > 0) {
    // N viewport screenshots at evenly spaced scroll positions, for a layout pass over a long page
    const total = await page.evaluate(() => document.documentElement.scrollHeight)
    for (let i = 0; i < pages; i++) {
      const y = pages === 1 ? 0 : Math.round(i * (total - height) / (pages - 1))
      await page.evaluate(y => window.scrollTo(0, y), y)
      await new Promise(r => setTimeout(r, 250))
      const p = `${out}-p${String(i + 1).padStart(2, '0')}.png`
      await page.screenshot({ path: p })
      report.shots.push(p)
    }
  } else if (sel) {
    const els = await page.$$(sel)
    let i = 0
    for (const el of els.slice(0, max)) {
      i++
      const p = `${out}-${String(i).padStart(2, '0')}.png`
      await el.evaluate(e => e.scrollIntoView({ block: 'center' }))
      await new Promise(r => setTimeout(r, 150))
      await el.screenshot({ path: p })
      report.shots.push(p)
    }
    if (els.length > max) report.note = `${els.length - max} more elements not captured (raise --max)`
  } else {
    const p = `${out}.png`
    await page.screenshot({ path: p, fullPage: has('--full') })
    report.shots.push(p)
  }
} finally {
  await browser.close()
}
console.log(JSON.stringify(report, null, 2))
