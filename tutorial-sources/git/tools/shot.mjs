// Screenshot a built page (or an SVG) and report page errors.
//   node tools/shot.mjs out/git/lesson_04_EN.html --out shots/l04 [--pages 6] [--width 1280] [--full]
//   node tools/shot.mjs src/figures/en/fig-03-1.svg --out shots/fig-03-1
//   node tools/shot.mjs page.html --out src/images/final-page --single --width 760 --height 500 --scale 2
// Writes <out>-1.png, <out>-2.png, ... (one per screen height), or <out>.png with --full.
// Set CHROME_PATH if Chromium is not at /opt/pw-browsers/chromium.
import puppeteer from 'puppeteer-core'
import path from 'node:path'
import fs from 'node:fs'

const args = process.argv.slice(2)
const get = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d }
const file = path.resolve(args[0])
const out = path.resolve(get('--out', 'shots/page'))
const pages = Number(get('--pages', 4))
const width = Number(get('--width', 1280))
const height = Number(get('--height', 900))
const full = args.includes('--full')
const single = args.includes('--single')        // one screenshot of the first screen, <out>.png
const scale = Number(get('--scale', 1))
fs.mkdirSync(path.dirname(out), { recursive: true })

const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || '/opt/pw-browsers/chromium', args: ['--no-sandbox'] })
const page = await browser.newPage()
// an SVG is shot at its own size
const svgSize = file.endsWith('.svg') && fs.readFileSync(file, 'utf8').match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/)
if (svgSize) await page.setViewport({ width: Math.ceil(+svgSize[1]), height: Math.ceil(+svgSize[2]), deviceScaleFactor: scale })
else await page.setViewport({ width, height, deviceScaleFactor: scale })
const errors = []
page.on('pageerror', e => errors.push('pageerror: ' + e.message))
page.on('console', m => { if (m.type() === 'error' && !/fonts\.(googleapis|gstatic)/.test(m.text())) errors.push('console: ' + m.text()) })
page.on('requestfailed', r => { if (!/fonts\.(googleapis|gstatic)/.test(r.url())) errors.push('request failed: ' + r.url()) })
await page.goto('file://' + file, { waitUntil: 'networkidle0', timeout: 60000 }).catch(e => errors.push('goto: ' + e.message))
await new Promise(r => setTimeout(r, 600))
if (single) {
  await page.screenshot({ path: out + '.png' })
} else if (svgSize) {
  await page.screenshot({ path: out + '.png' })
} else if (full) {
  await page.screenshot({ path: out + '.png', fullPage: true })
} else {
  const total = await page.evaluate(() => document.documentElement.scrollHeight)
  const n = Math.min(pages, Math.ceil(total / height))
  for (let i = 0; i < n; i++) {
    await page.evaluate(y => window.scrollTo(0, y), i * height)
    await new Promise(r => setTimeout(r, 250))
    await page.screenshot({ path: `${out}-${i + 1}.png` })
  }
  console.log(`page height ${total}px, ${n} screenshot(s)`)
}
const broken = await page.evaluate(() => [...document.images].filter(i => i.complete && i.naturalWidth === 0).map(i => i.src))
for (const b of broken) errors.push('broken image: ' + b)
console.log(errors.length ? errors.join('\n') : 'no page errors')
await browser.close()
