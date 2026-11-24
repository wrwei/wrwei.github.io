// Drive every widget through its scripted test and screenshot it.
//   node tools/widget-test.mjs [--site out/site] [--lang en|zh|both] [--only NAME]
// A test is tools/widget-tests/NAME.mjs and exports
//   export const page = 'module_02'          // the page that shows the widget
//   export async function run(t) { ... }     // t: see below
// t.page       the puppeteer Page             t.root     CSS selector of the widget's element
// t.lang       'en' or 'zh'                   t.check(ok, what)   record a result
// Selectors are CSS selectors inside the widget; "SEL >> nth=K" picks the K-th match (from 0).
// t.click(x)   click the button whose text is x, or the element matching selector x (inside the widget)
// t.type(sel, text, {clear: true})   type into an input inside the widget
// t.set(sel, value)     set a slider (or any input) to value and fire its input and change events
// t.select(sel, value)  choose an option of a <select>
// t.clickAt(sel, fx, fy)  click inside an element at a fraction (0..1) of its width and height
// t.drag(sel, [fx0, fy0], [fx1, fy1])  drag with the mouse inside an element
// t.text(sel)  textContent of the match ('' if none); t.texts(sel) all matches; t.attr(sel, name)
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
const langs = opt('--lang', 'en') === 'both' ? ['en', 'zh'] : [opt('--lang', 'en')]
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
    // Screenshots: no sticky header over the widget, and scrolling that happens at once.
    await page.addStyleTag({ content: '#topbar,#progress-bar{display:none!important} html{scroll-behavior:auto!important}' })
    const root = `.widget[data-widget="${name}"]`
    try { await page.waitForSelector(`${root}[data-mounted]`, { timeout: 10000 }) } catch {
      console.log(`FAIL ${name} (${lang}): widget did not mount${errors.length ? ': ' + errors.join('; ') : ''}`); failed++; await page.close(); continue
    }
    // The element for "SEL" or "SEL >> nth=K" inside the widget (in the page).
    const FIND = `(root, sel) => { const m = sel.match(/^(.*?)\\s*>>\\s*nth=(\\d+)$/); const r = document.querySelector(root);
      if (!r) return null; if (!m) return r.querySelector(sel); return r.querySelectorAll(m[1])[Number(m[2])] || null }`
    const find = (sel, fn, ...args) => page.evaluate(new Function('root', 'sel', 'args', `const find = ${FIND}; const el = find(root, sel); return (${fn})(el, ...args)`), root, sel, args)
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
      text: sel => find(sel, 'e => e ? e.textContent.trim() : ""'),
      attr: (sel, name) => find(sel, '(e, n) => e ? e.getAttribute(n) : null', name),
      texts: sel => page.evaluate((root, sel) => [...document.querySelectorAll(root + ' ' + sel)].map(e => e.textContent.trim()), root, sel),
      count: sel => page.evaluate((root, sel) => document.querySelectorAll(root + ' ' + sel).length, root, sel),
      async set(sel, value) {
        const ok = await find(sel, '(e, v) => { if (!e) return false; e.value = v; e.dispatchEvent(new Event("input", { bubbles: true })); e.dispatchEvent(new Event("change", { bubbles: true })); return true }', String(value))
        if (!ok) t.check(false, `set ${sel}: not found`)
        await new Promise(r => setTimeout(r, 60))
      },
      async select(sel, value) { return t.set(sel, value) },
      async clickAt(sel, fx, fy) {
        const box = await find(sel, 'e => { if (!e) return null; e.scrollIntoView({ block: "center", inline: "center", behavior: "instant" }); const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height } }')
        if (!box) { t.check(false, `clickAt ${sel}: not found`); return }
        await page.mouse.click(box.x + fx * box.w, box.y + fy * box.h)
        await new Promise(r => setTimeout(r, 80))
      },
      async drag(sel, from, to) {
        const box = await find(sel, 'e => { if (!e) return null; e.scrollIntoView({ block: "center", inline: "center", behavior: "instant" }); const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height } }')
        if (!box) { t.check(false, `drag ${sel}: not found`); return }
        await page.mouse.move(box.x + from[0] * box.w, box.y + from[1] * box.h)
        await page.mouse.down()
        for (let k = 1; k <= 8; k++) await page.mouse.move(box.x + (from[0] + (to[0] - from[0]) * k / 8) * box.w, box.y + (from[1] + (to[1] - from[1]) * k / 8) * box.h)
        await page.mouse.up()
        await new Promise(r => setTimeout(r, 80))
      },
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
