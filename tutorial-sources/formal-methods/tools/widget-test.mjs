// Drive every widget through its scripted test and screenshot it.
//   node tools/widget-test.mjs [--site out/site] [--lang en|zh|both] [--only NAME]
// A test is tools/widget-tests/NAME.mjs and exports
//   export const page = 'module_02'          // the page that shows the widget
//   export async function run(t) { ... }     // t: see below
// t.page       the puppeteer Page             t.root     CSS selector of the widget's element
// t.lang       'en' or 'zh'                   t.check(ok, what)   record a result
// t.click(x)   click the button whose text is x, or the element matching selector x (inside the widget)
// t.type(sel, text, {clear: true})   type into an input inside the widget
// t.text(sel)  textContent of the first match inside the widget ('' if none); t.texts(sel) all matches
// t.count(sel) number of matches;            t.wait(ms)
// t.shot(suffix)  screenshot of the widget to out/shots/widget-NAME-LANG[-suffix].png
// Exits 1 if any check fails or a page reports a JavaScript error.
import puppeteer from 'puppeteer-core'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const argv = process.argv.slice(2)
const opt = (k, d) => argv.includes(k) ? argv[argv.indexOf(k) + 1] : d
const site = path.resolve(ROOT, opt('--site', 'out/site'))
const langs = opt('--lang', 'both') === 'both' ? ['en', 'zh'] : [opt('--lang')]
const only = opt('--only', null)
const testDir = path.join(ROOT, 'tools', 'widget-tests')
const shots = path.join(ROOT, 'out', 'shots')
fs.mkdirSync(shots, { recursive: true })

const tests = fs.existsSync(testDir) ? fs.readdirSync(testDir).filter(f => f.endsWith('.mjs')).sort() : []
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || '/opt/pw-browsers/chromium', args: ['--no-sandbox'] })
let failed = 0, passed = 0

for (const file of tests) {
  const name = file.replace(/\.mjs$/, '')
  if (only && name !== only) continue
  const mod = await import(pathToFileURL(path.join(testDir, file)).href)
  for (const lang of langs) {
    const html = path.join(site, `${mod.page}_${lang.toUpperCase()}.html`)
    if (!fs.existsSync(html)) { console.log(`skip ${name} (${lang}): ${path.relative(ROOT, html)} not built`); continue }
    const page = await browser.newPage()
    await page.setViewport({ width: 1100, height: 900, deviceScaleFactor: 1 })
    const errors = []
    page.on('pageerror', e => errors.push(e.message))
    await page.goto(pathToFileURL(html).href, { waitUntil: 'load' })
    const root = `.widget[data-widget="${name}"]`
    try { await page.waitForSelector(`${root}[data-mounted]`, { timeout: 10000 }) } catch {
      console.log(`FAIL ${name} (${lang}): widget did not mount${errors.length ? ': ' + errors.join('; ') : ''}`); failed++; await page.close(); continue
    }
    const t = {
      page, root, lang,
      check(ok, what) { console.log(`${ok ? 'ok  ' : 'FAIL'} ${name} (${lang}): ${what}`); if (ok) passed++; else failed++ },
      async click(x) {
        const ok = await page.evaluate((root, x) => {
          const r = document.querySelector(root)
          let el = [...r.querySelectorAll('button')].find(b => b.textContent.trim() === x)
          if (!el) { try { el = r.querySelector(x) } catch { el = null } }
          if (!el || el.disabled) return false
          el.click(); return true
        }, root, x)
        if (!ok) t.check(false, `click "${x}": not found or disabled`)
        await new Promise(r => setTimeout(r, 60))
        return ok
      },
      async type(sel, text, o = { clear: true }) {
        const h = await page.$(`${root} ${sel}`)
        if (!h) { t.check(false, `type into ${sel}: not found`); return }
        if (o.clear) await h.evaluate(el => { el.value = ''; el.dispatchEvent(new Event('input', { bubbles: true })) })
        await h.type(text)
        await new Promise(r => setTimeout(r, 60))
      },
      text: sel => page.evaluate((root, sel) => { const e = document.querySelector(root + ' ' + sel); return e ? e.textContent.trim() : '' }, root, sel),
      texts: sel => page.evaluate((root, sel) => [...document.querySelectorAll(root + ' ' + sel)].map(e => e.textContent.trim()), root, sel),
      count: sel => page.evaluate((root, sel) => document.querySelectorAll(root + ' ' + sel).length, root, sel),
      wait: ms => new Promise(r => setTimeout(r, ms)),
      async shot(suffix) {
        const el = await page.$(root.replace('.widget', '.widget-wrap .widget')) || await page.$(root)
        const wrap = await el.evaluateHandle(e => e.closest('.widget-wrap') || e)
        await wrap.screenshot({ path: path.join(shots, `widget-${name}-${lang}${suffix ? '-' + suffix : ''}.png`) })
      },
    }
    try { await mod.run(t) } catch (e) { t.check(false, `test threw: ${e.message}`) }
    if (errors.length) t.check(false, `page errors: ${errors.join('; ')}`)
    await page.close()
  }
}
await browser.close()
console.log(`${passed} check(s) passed, ${failed} failed`)
process.exit(failed ? 1 : 0)
