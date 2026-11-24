// Check the series sources (what tools/calc.py and the build do not).
//   node tools/check.mjs            every page (and, for pages that exist in Chinese, parity with English)
//   node tools/check.mjs --lang en  English only
// Structure of module pages (front matter, the last three sections, exercises with solutions and all
// three levels, an 8-question quiz, numbering of figures and exercises), links and anchors between
// pages, figures drawn, widgets with a script and a test, fences on list-item lines, and prose style
// (filler words, American spellings, exclamation marks). Exits 1 on errors.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { frontMatter } from './md.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const REPO = path.resolve(ROOT, '..', '..')
const argv = process.argv.slice(2)
const only = argv.includes('--lang') ? argv[argv.indexOf('--lang') + 1] : null
const errors = []
const warnings = []
const err = (where, msg) => errors.push(`${where}: ${msg}`)
const warn = (where, msg) => warnings.push(`${where}: ${msg}`)
const SHARED = new Set(['python', 'output', 'check', 'valuetable', 'terminal'])

function read(lang, f) {
  const p = path.join(ROOT, 'src', lang, f)
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n') : null
}

// What a page contains, besides prose.
function skeleton(src) {
  const { meta, body, offset } = frontMatter(src)
  const lines = body.split('\n')
  const out = { meta, sections: [], anchors: new Set(), blocks: [], figures: [], widgets: [], tabs: [], quiz: [], exercises: [], links: [],
    count: { trouble: 0, solution: 0, definition: 0, theorem: 0, example: 0, proof: 0, deeper: 0, compute: 0 } }
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i], lineNo = i + 1 + offset
    let m
    if ((m = ln.match(/^(#{2,3}) .*\{#([\w-]+)\}\s*$/))) { if (m[1] === '##') out.sections.push(m[2]); out.anchors.add(m[2]) }
    if ((m = ln.match(/^(\s*)(`{3,})(\w+)(.*)$/))) {
      const fence = m[2], indent = m[1].length, kind = m[3]
      const body = []
      let j = i + 1
      while (j < lines.length && !new RegExp('^\\s*' + fence + '`*\\s*$').test(lines[j])) { body.push(lines[j].slice(Math.min(indent, lines[j].search(/\S|$/)))); j++ }
      if (SHARED.has(kind)) out.blocks.push({ line: lineNo, info: (m[3] + m[4]).trim(), body: body.join('\n') })
      if (kind === 'quiz') {
        let opt = 0
        for (const q of body) {
          if (/^\s*\?\s/.test(q)) { out.quiz.push(null); opt = 0 }
          const o = q.match(/^\s*-\s+\[( |x|X)\]/)
          if (o) { if (o[1] !== ' ') out.quiz[out.quiz.length - 1] = opt; opt++ }
        }
      }
      i = j
      continue
    }
    if ((m = ln.match(/^\s*::: figure\s+id=([\w-]+)(.*)$/))) out.figures.push({ id: m[1], image: /image=/.test(m[2]), line: lineNo })
    if ((m = ln.match(/^\s*::: widget\s+name=([\w-]+)/))) out.widgets.push({ name: m[1], line: lineNo })
    if ((m = ln.match(/^\s*::: tab\s+(.+)$/))) out.tabs.push(m[1].trim())
    if ((m = ln.match(/^\s*:{3,} exercise\b.*\{#([\w-]+)\}\s*(★*)\s*$/))) { out.exercises.push({ id: m[1], stars: m[2].length, line: lineNo }); out.anchors.add(m[1]) }
    else if (/^\s*:{3,} exercise\b/.test(ln)) out.exercises.push({ id: null, stars: 0, line: lineNo })
    for (const k of Object.keys(out.count)) if (new RegExp(`^\\s*:{3,} ${k}\\b`).test(ln)) out.count[k]++
    if ((m = ln.match(/\bid=([\w-]+)/))) out.anchors.add(m[1])
    for (const l of ln.matchAll(/\]\(([^)\s]+)\)/g)) out.links.push({ line: lineNo, href: l[1] })
    // A fence that opens on a list-marker line ("2. ```python") is shown but never run or checked.
    if (/^\s*(\d+[.)]|[-*+])\s+`{3,}/.test(ln)) err(`line ${lineNo}`, 'a code fence on a list-item line is not seen by tools/calc.py: put the fence on its own line, indented under the item')
  }
  return out
}

// Style (English prose only, outside code and mathematics).
const FILLER = /\b(simply(?!\s+connected)|just|obviously|clearly|of course|trivially|easy to see|it is easy)\b/i   // "simply connected" is a term
const AMERICAN = /\b(formaliz\w*|behavior\w*|color\w*|modeling|modeled|analyz\w*|organiz\w*|recogniz\w*|generaliz\w*|minimiz\w*|maximiz\w*|realiz\w*|specializ\w*|utiliz\w*|optimiz\w*|summariz\w*|emphasiz\w*|characteriz\w*|initializ\w*|normaliz\w*|parametriz\w*|visualiz\w*|linearliz\w*|center|centers|centered|favor\w*|labeled|labeling|traveled|catalog|meter|meters|liter|liters|fiber|gray)\b/
function styleCheck(f, src) {
  let fence = null
  const { offset } = frontMatter(src)
  src.split('\n').forEach((ln, i) => {
    const m = ln.match(/^\s*(`{3,})/)
    if (m) { if (!fence) fence = m[1]; else if (ln.trim().startsWith(fence)) fence = null; return }
    if (fence || i < offset) return
    const prose = ln.replace(/`[^`]*`/g, '').replace(/\$\$?[^$]*\$\$?/g, '').replace(/\]\([^)]*\)/g, ']').replace(/<[^>]+>/g, '')
    const a = prose.match(FILLER), b = prose.match(AMERICAN)
    if (a) warn(`en/${f}:${i + 1}`, `filler word "${a[1]}"`)
    if (b) warn(`en/${f}:${i + 1}`, `American spelling "${b[1]}"`)
    if (/!\s*$|!\s+[A-Z]/.test(prose) && !/<!--/.test(ln) && !/\d!/.test(prose)) warn(`en/${f}:${i + 1}`, 'exclamation mark')
  })
}

// A "$" that is not part of a formula, e.g. "$ x$" (a formula may not start or end with a space), is
// shown to readers as a raw dollar sign. Literal dollars are written \$.
function dollarCheck(lang, f, src) {
  const { offset } = frontMatter(src)
  const lines = src.split('\n')
  // Blank out code fences and the front matter, keeping line breaks so that positions map to lines.
  let fence = null
  const kept = lines.map((ln, i) => {
    const m = ln.match(/^\s*(`{3,})/)
    if (m) { if (!fence) fence = m[1]; else if (ln.trim().startsWith(fence)) fence = null; return '' }
    return fence || i < offset ? '' : ln
  }).join('\n')
  const text = kept
    .replace(/`[^`\n]*`/g, m => ' '.repeat(m.length))                                   // inline code
    .replace(/\$\$[\s\S]*?\$\$/g, m => m.replace(/[^\n]/g, ' '))                          // display mathematics
    .replace(/\\\$/g, '  ')                                                             // escaped dollars
    .replace(/\$(?![\s$])(?:\\.|[^$\\])*?(?<![\s\\])\$/g, m => m.replace(/[^\n]/g, ' '))  // inline mathematics
  let pos = -1
  const seen = new Set()
  while ((pos = text.indexOf('$', pos + 1)) >= 0) {
    const line = text.slice(0, pos).split('\n').length
    if (seen.has(line)) continue
    seen.add(line)
    err(`${lang}/${f}:${line}`, 'a "$" that does not form a formula (no space may follow the opening $ or precede the closing one; write \\$ for a dollar sign)')
  }
}

const pages = fs.readdirSync(path.join(ROOT, 'src', 'en')).filter(f => f.endsWith('.md') && !f.startsWith('zz_')).sort()
const names = new Set(pages.map(f => f.replace(/\.md$/, '')))
const chinese = path.join(ROOT, 'src', 'zh')
if (only !== 'en' && fs.existsSync(chinese) && fs.readdirSync(chinese).some(f => f.endsWith('.md') && !f.startsWith('zz_'))) {
  for (const f of pages) {
    if (!fs.existsSync(path.join(chinese, f))) err(`zh/${f}`, 'missing Chinese page')
  }
}
const skels = {}
for (const f of pages) skels[f] = skeleton(read('en', f))

for (const f of pages) {
  const langs = only ? [only] : ['en', 'zh']
  const sk = {}
  for (const lang of langs) {
    const src = read(lang, f)
    if (src == null) continue
    const before = errors.length
    sk[lang] = lang === 'en' ? skels[f] : skeleton(src)
    for (let k = before; k < errors.length; k++) errors[k] = `${lang}/${f}:${errors[k]}`
    if (lang === 'en') styleCheck(f, src)
    dollarCheck(lang, f, src)
    const s = sk[lang], where = `${lang}/${f}`
    const n = f.startsWith('module_') ? Number(f.slice(7, 9)) : null
    s.figures.forEach((fig, k) => {
      if (!fig.image && !['en', lang].some(l => fs.existsSync(path.join(ROOT, 'src', 'figures', l, `${fig.id}.svg`)))) err(`${where}:${fig.line}`, `figure ${fig.id} is not drawn (run src/figures/_gen/figs.py)`)
      if (n && fig.id !== `fig-${String(n).padStart(2, '0')}-${k + 1}`) err(`${where}:${fig.line}`, `figure id ${fig.id}: expected fig-${String(n).padStart(2, '0')}-${k + 1} (figures are numbered in page order)`)
    })
    for (const w of s.widgets) {
      if (!fs.existsSync(path.join(ROOT, 'src', 'widgets', `${w.name}.js`))) err(`${where}:${w.line}`, `widget ${w.name} has no src/widgets/${w.name}.js`)
      if (!fs.existsSync(path.join(ROOT, 'tools', 'widget-tests', `${w.name}.mjs`))) err(`${where}:${w.line}`, `widget ${w.name} has no test tools/widget-tests/${w.name}.mjs`)
    }
    for (const { line, href } of s.links) {
      if (/^(https?:|mailto:)/.test(href) || href === 'calculus-code.zip') continue
      const m = href.match(/^(\.\.\/[\w-]+\/)?([\w-]+?)(?:_(EN|ZH))?\.html(?:#([\w-]+))?$/) || href.match(/^#([\w-]+)$/)
      if (!m) { err(`${where}:${line}`, `link ${href}: not a link to a page of the site`); continue }
      if (m.length === 2) { if (!s.anchors.has(m[1])) err(`${where}:${line}`, `link ${href}: no such anchor on this page`); continue }
      const [, other, name, suffix, anchor] = m
      if (other) {   // another series of the site, e.g. ../math/module_00_EN.html
        const target = path.join(REPO, 'docs', 'tutorials', other.slice(3, -1), href.slice(other.length).replace(/#.*$/, ''))
        if (!fs.existsSync(target)) err(`${where}:${line}`, `link ${href}: ${path.relative(REPO, target)} does not exist`)
        continue
      }
      if (name === 'index') continue
      if (!names.has(name)) { err(`${where}:${line}`, `link to ${href}: no such page (yet)`); continue }
      if (suffix && suffix !== lang.toUpperCase()) err(`${where}:${line}`, `link to ${href} points to the other language`)
      if (anchor && skels[`${name}.md`] && !skels[`${name}.md`].anchors.has(anchor)) err(`${where}:${line}`, `link ${href}: ${name} has no anchor #${anchor}`)
    }
    if (n) {
      for (const k of ['title', 'lead', 'minutes', 'needs', 'part']) if (!s.meta[k]) err(where, `front matter has no ${k}`)
      if (!Array.isArray(s.meta.goals) || s.meta.goals.length < 4 || s.meta.goals.length > 7) err(where, `front matter needs 4 to 7 goals (has ${(s.meta.goals || []).length})`)
      const last3 = s.sections.slice(-3).join(' ')
      if (last3 !== 'summary exercises quiz') err(where, `the last three sections must be {#summary} {#exercises} {#quiz} (are: ${last3})`)
      const ex = s.exercises
      if (ex.length < 10 || ex.length > 14) err(where, `${ex.length} exercises (10 to 12 expected)`)
      for (const lvl of [1, 2, 3]) if (ex.filter(e => e.stars === lvl).length < 2) err(where, `fewer than two ${'★'.repeat(lvl)} exercises`)
      ex.forEach((e, k) => { if (e.id !== `ex-${n}-${k + 1}`) err(`${where}:${e.line}`, `exercise id ${e.id}: expected ex-${n}-${k + 1}`) })
      if (s.count.solution < ex.length) err(where, `${ex.length} exercises but ${s.count.solution} solutions`)
      if (s.quiz.length !== 8) err(where, `the quiz has ${s.quiz.length} questions (8 expected)`)
      if (s.quiz.some(a => a == null)) err(where, 'a quiz question has no right answer')
      const answers = s.quiz.filter(a => a != null)
      if (answers.length >= 6 && new Set(answers).size === 1) warn(where, 'every quiz answer is in the same position')
      if (!Number(s.meta.minutes) || Number(s.meta.minutes) < 120 || Number(s.meta.minutes) > 330) warn(where, `minutes ${s.meta.minutes}: modules take 180 to 270 minutes`)
    }
  }
  if (sk.en && sk.zh) {   // the Chinese page must match the English one in everything that is not prose
    const e = sk.en, z = sk.zh, where = `zh/${f}`
    for (const k of ['minutes', 'part']) if (String(e.meta[k] ?? '') !== String(z.meta[k] ?? '')) err(where, `${k} ${z.meta[k]} (English: ${e.meta[k]})`)
    if ((e.meta.goals || []).length !== (z.meta.goals || []).length) err(where, `${(z.meta.goals || []).length} goals (English: ${(e.meta.goals || []).length})`)
    if (e.sections.join() !== z.sections.join()) err(where, `section ids differ:\n    en ${e.sections.join(' ')}\n    zh ${z.sections.join(' ')}`)
    if (e.blocks.length !== z.blocks.length) err(where, `${z.blocks.length} python/output/check/table/terminal blocks (English: ${e.blocks.length})`)
    for (let i = 0; i < Math.min(e.blocks.length, z.blocks.length); i++) {
      const a = e.blocks[i], b = z.blocks[i]
      if (a.info !== b.info || (a.body !== b.body && !a.info.startsWith('valuetable'))) err(where + ':' + b.line, `block ${i + 1} differs from English (line ${a.line}): ${a.info}`)
    }
    const same = (k, label, key = x => x) => { if (e[k].map(key).join() !== z[k].map(key).join()) err(where, `${label} differ`) }
    same('figures', 'figures', x => x.id); same('widgets', 'widgets', x => x.name); same('tabs', 'OS tabs'); same('exercises', 'exercises', x => `${x.id}${x.stars}`)
    if (JSON.stringify(e.quiz) !== JSON.stringify(z.quiz)) err(where, 'quiz answers differ')
    for (const k of Object.keys(e.count)) if (e.count[k] !== z.count[k]) err(where, `${z.count[k]} ${k} box(es) (English: ${e.count[k]})`)
  }
}
for (const w of warnings) console.log('warning: ' + w)
for (const e of errors) console.log('error:   ' + e)
console.log(`${pages.length} pages checked: ${errors.length} error(s), ${warnings.length} warning(s)`)
process.exit(errors.length ? 1 : 0)
