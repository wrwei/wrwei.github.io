// Screenshot the parts of built pages that contain given text, to check them by eye.
//   node tools/shot-parts.mjs OUT_DIR PAGE "text" [PAGE "text" ...]
// For each pair, finds the smallest block (box, terminal, table, list, paragraph) whose text
// contains "text", takes it with its neighbours above and below, and saves OUT_DIR/NN.png.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer-core'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const [outDir, ...pairs] = process.argv.slice(2)
fs.mkdirSync(outDir, { recursive: true })
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || '/opt/pw-browsers/chromium',
  args: ['--no-sandbox', '--headless'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1000, height: 900, deviceScaleFactor: 1 })
const errors = []
page.on('pageerror', e => errors.push(String(e)))
for (let i = 0; i < pairs.length; i += 2) {
  const file = path.join(ROOT, 'out', 'git', pairs[i])
  await page.goto('file://' + file, { waitUntil: 'load' })
  const box = await page.evaluate((text) => {
    const sel = 'main details, main .callout, main .where, main .term, main .file, main table, main ul, main ol, main p, main h2, main h3, main .tabs, main figure, main div'
    let best = null
    for (const el of document.querySelectorAll(sel)) {
      if (!el.textContent.includes(text)) continue
      if (!best || el.textContent.length < best.textContent.length) best = el
    }
    if (!best) return null
    if (best.tagName === 'DETAILS') best.open = true
    const prev = best.previousElementSibling, next = best.nextElementSibling
    const r = best.getBoundingClientRect()
    const top = Math.min(r.top, prev ? prev.getBoundingClientRect().top : r.top)
    const bottom = Math.max(r.bottom, next ? next.getBoundingClientRect().bottom : r.bottom)
    return { x: 0, y: top + window.scrollY - 8, width: document.documentElement.clientWidth, height: Math.min(bottom - top + 16, 1400) }
  }, pairs[i + 1])
  const name = path.join(outDir, String(i / 2 + 1).padStart(2, '0') + '.png')
  if (!box) { console.log(`${name}: "${pairs[i + 1]}" not found in ${pairs[i]}`); continue }
  await page.screenshot({ path: name, clip: box, captureBeyondViewport: true })
  console.log(`${name}: ${pairs[i]} "${pairs[i + 1]}"`)
}
console.log(errors.length ? 'page errors: ' + errors.join('; ') : 'no page errors')
await browser.close()
