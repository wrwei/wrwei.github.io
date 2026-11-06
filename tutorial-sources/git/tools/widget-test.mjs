// Drive the two demos through scripted clicks, check what they print, and screenshot them.
//   node tools/widget-test.mjs [out/git] [--lang en|zh]
// Exits 1 if a check fails.
import puppeteer from 'puppeteer-core'
import path from 'node:path'
import fs from 'node:fs'

const args = process.argv.slice(2)
const dir = path.resolve(args.find(a => !a.startsWith('--')) || 'out/git')
const lang = args.includes('--lang') ? args[args.indexOf('--lang') + 1] : 'en'
const suffix = lang === 'zh' ? 'ZH' : 'EN'
fs.mkdirSync('shots', { recursive: true })
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || '/opt/pw-browsers/chromium', args: ['--no-sandbox'] })
let failed = 0
const check = (ok, what) => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`); if (!ok) failed++ }

async function open(file, widget) {
  const page = await browser.newPage()
  await page.setViewport({ width: 1100, height: 900 })
  const errors = []
  page.on('pageerror', e => errors.push(e.message))
  await page.goto('file://' + path.join(dir, file), { waitUntil: 'load' })
  await page.waitForSelector(`.widget[data-widget="${widget}"][data-mounted]`, { timeout: 10000 })
  const root = `.widget[data-widget="${widget}"]`
  const click = async label => {
    const ok = await page.evaluate((root, label) => {
      const b = [...document.querySelectorAll(root + ' button')].find(b => b.textContent.trim() === label)
      if (!b || b.disabled) return false
      b.click(); return true
    }, root, label)
    if (!ok) throw new Error(`no button "${label}"`)
  }
  const nth = async (i) => page.evaluate((root, i) => { document.querySelectorAll(root + ' .gw-controls button')[i].click() }, root, i)
  const term = () => page.evaluate(root => document.querySelector(root + ' .gw-term').innerText, root)
  return { page, errors, root, click, nth, term }
}

// ---- three-areas ----
{
  const w = await open(`lesson_03_${suffix}.html`, 'three-areas')
  check((await w.term()).includes('Untracked files:'), 'three-areas starts with an untracked file')
  await w.nth(1)   // git add
  check((await w.term()).includes('new file:   index.html'), 'git add stages the new file')
  await w.nth(0)   // edit
  check((await w.term()).includes('Changes not staged for commit:') && (await w.term()).includes('new file:'), 'edit after add: staged and not staged')
  await w.nth(2)   // commit
  check((await w.term()).includes('Changes not staged for commit:') && !(await w.term()).includes('No commits yet'), 'commit saves what was staged; the later edit stays unstaged')
  await w.nth(1); await w.nth(2)
  check((await w.term()).includes('nothing to commit, working tree clean'), 'add and commit again: clean')
  await w.nth(2)
  check((await w.term()).split('\n').length > 2 && (await w.term()).includes('git commit'), 'commit with nothing staged explains itself')
  const n = await w.page.evaluate(root => document.querySelectorAll(root + ' .gw-chip.commit').length, w.root)
  check(n === 2, `two commits in the repository column (found ${n})`)
  const el = await w.page.$(w.root)
  await el.screenshot({ path: `shots/widget-three-areas-${lang}.png` })
  check(!w.errors.length, 'three-areas: no page errors ' + w.errors.join('; '))
  await w.page.close()
}

// ---- branch-graph ----
{
  const w = await open(`lesson_05_${suffix}.html`, 'branch-graph')
  const sel = async (i, value) => w.page.evaluate((root, i, value) => {
    const s = document.querySelectorAll(root + ' select')[i]; s.value = value; s.dispatchEvent(new Event('change'))
  }, w.root, i, value)
  await w.nth(0)  // commit on main -> c2
  await w.nth(1)  // new branch "idea" and switch
  check((await w.term()).includes("Switched to a new branch 'idea'"), 'new branch switches to it')
  await w.nth(0); await w.nth(0)   // c3, c4 on idea
  await sel(0, 'main'); await w.nth(2)
  check((await w.term()).includes("Switched to branch 'main'"), 'switch back to main')
  await sel(1, 'idea'); await w.nth(3)
  check((await w.term()).includes('Fast-forward'), 'merge idea into main: fast-forward')
  await w.nth(3)
  check((await w.term()).includes('Already up to date.'), 'merging again: already up to date')
  await w.nth(0)  // c5 on main
  await sel(0, 'idea'); await w.nth(2); await w.nth(0)  // c6 on idea
  await sel(0, 'main'); await w.nth(2)
  await sel(1, 'idea'); await w.nth(3)
  check((await w.term()).includes("Merge made by the 'ort' strategy."), 'both moved on: merge commit')
  const circles = await w.page.evaluate(root => document.querySelectorAll(root + ' svg circle').length, w.root)
  check(circles === 7, `seven commits drawn (found ${circles})`)
  const head = await w.page.evaluate(root => [...document.querySelectorAll(root + ' svg text')].map(t => t.textContent).filter(t => t.startsWith('HEAD')), w.root)
  check(head.length === 1 && head[0] === 'HEAD -> main', `one HEAD label, on main (${head.join(', ')})`)
  await w.nth(1)  // "idea-2" (the suggested name)
  check((await w.term()).includes("Switched to a new branch 'idea-2'"), 'second branch gets the next suggested name')
  const el = await w.page.$(w.root)
  await el.screenshot({ path: `shots/widget-branch-graph-${lang}.png` })
  check(!w.errors.length, 'branch-graph: no page errors ' + w.errors.join('; '))
  await w.page.close()
}

await browser.close()
console.log(failed ? `${failed} check(s) failed` : 'all widget checks passed')
process.exit(failed ? 1 : 0)
