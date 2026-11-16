// Check the series sources.
//   node tools/check.mjs            every page, both languages
//   node tools/check.mjs --lang en  one language (no parity check)
// For each page that exists in Chinese, checks that it matches the English in everything that is
// not prose: front matter (minutes, part, number of goals, imports), section ids in order, every
// isabelle/output/prooftree/truthtable/terminal block byte for byte, figures and widgets in order,
// OS tabs, exercises (ids and stars), solutions, numbered boxes, trouble boxes and quiz answers.
// Also checks links between the series' pages and that every figure is drawn. Exits 1 on errors.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { frontMatter } from './md.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const argv = process.argv.slice(2)
const only = argv.includes('--lang') ? argv[argv.indexOf('--lang') + 1] : null
const errors = []
const warnings = []
const err = (where, msg) => errors.push(`${where}: ${msg}`)
const warn = (where, msg) => warnings.push(`${where}: ${msg}`)
const SHARED = new Set(['isabelle', 'output', 'prooftree', 'truthtable', 'terminal'])

function read(lang, f) {
  const p = path.join(ROOT, 'src', lang, f)
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n') : null
}

// The parts of a page that must not change in translation.
function skeleton(src) {
  const { meta, body } = frontMatter(src)
  const lines = body.split('\n')
  const out = { meta, sections: [], blocks: [], figures: [], widgets: [], tabs: [], quiz: [], exercises: [], links: [],
    count: { trouble: 0, solution: 0, definition: 0, example: 0, fact: 0, isabelle: 0 } }
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i]
    let m
    if ((m = ln.match(/^#{2,3} .*\{#([\w-]+)\}\s*$/))) out.sections.push(m[1])
    if ((m = ln.match(/^(\s*)(`{3,})(\w+)(.*)$/)) && SHARED.has(m[3])) {
      const fence = m[2], indent = m[1].length
      const body = []
      let j = i + 1
      while (j < lines.length && !new RegExp('^\\s*' + fence + '`*\\s*$').test(lines[j])) { body.push(lines[j].slice(Math.min(indent, lines[j].search(/\S|$/)))); j++ }
      out.blocks.push({ line: i + 1, info: (m[3] + m[4]).trim(), body: body.join('\n') })
      i = j
      continue
    }
    if ((m = ln.match(/^(\s*)```quiz\s*$/))) {
      let k = i + 1, opt = 0
      while (k < lines.length && !/^\s*```\s*$/.test(lines[k])) {
        if (/^\s*\?\s/.test(lines[k])) { out.quiz.push(null); opt = 0 }
        const o = lines[k].match(/^\s*-\s+\[( |x|X)\]/)
        if (o) { if (o[1] !== ' ') out.quiz[out.quiz.length - 1] = opt; opt++ }
        k++
      }
      i = k
      continue
    }
    if ((m = ln.match(/^\s*::: figure\s+id=([\w-]+)/))) out.figures.push(m[1])
    if ((m = ln.match(/^\s*::: widget\s+name=([\w-]+)/))) out.widgets.push(m[1])
    if ((m = ln.match(/^\s*::: tab\s+(.+)$/))) out.tabs.push(m[1].trim())
    if ((m = ln.match(/^\s*:{3,} exercise\b.*\{#([\w-]+)\}\s*(★*)\s*$/))) out.exercises.push(`${m[1]} ${m[2]}`)
    else if (/^\s*:{3,} exercise\b/.test(ln)) out.exercises.push('(no id)')
    for (const k of Object.keys(out.count)) if (new RegExp(`^\\s*:{3,} ${k}\\b`).test(ln)) out.count[k]++
    for (const l of ln.matchAll(/\]\(([^)\s]+)\)/g)) out.links.push({ line: i + 1, href: l[1] })
  }
  return out
}

// Style (English prose only, outside code): filler words the series avoids, and American spellings.
const FILLER = /\b(simply|just|obviously|clearly|of course|trivially easy|easy to see)\b/i
const AMERICAN = /\b(formaliz\w*|behavior\w*|colou?r(?<!colour)s?|modeling|modeled|analyz\w*|organiz\w*|recogniz\w*|generaliz\w*|minimiz\w*|maximiz\w*|realiz\w*|specializ\w*|utiliz\w*|optimiz\w*|summariz\w*|emphasiz\w*|characteriz\w*|initializ\w*|normaliz\w*|center|centers|favor\w*|labeled|labeling|traveled|license(?=d? to)|catalog)\b/
function styleCheck(f, src) {
  let fence = null
  src.split('\n').forEach((ln, i) => {
    const m = ln.match(/^\s*(`{3,})/)
    if (m) { if (!fence) fence = m[1]; else if (ln.trim().startsWith(fence)) fence = null; return }
    if (fence || /^---|^\s*(title|lead|needs|goals|minutes|part|imports):/.test(ln)) return
    const prose = ln.replace(/`[^`]*`/g, '').replace(/\$[^$]*\$/g, '').replace(/\]\([^)]*\)/g, ']')
    const a = prose.match(FILLER), b = prose.match(AMERICAN)
    if (a) warn(`en/${f}:${i + 1}`, `filler word "${a[1]}"`)
    if (b) warn(`en/${f}:${i + 1}`, `American spelling "${b[1]}"`)
    if (/!\s*$|!\s+[A-Z]/.test(prose) && !/^\s*[-*]?\s*\*\*/.test(prose) && !/<!--/.test(prose)) warn(`en/${f}:${i + 1}`, 'exclamation mark')
  })
}

const pages = fs.readdirSync(path.join(ROOT, 'src', 'en')).filter(f => f.endsWith('.md')).sort()
const names = new Set(pages.map(f => f.replace(/\.md$/, '')))
for (const f of pages) {
  const langs = only ? [only] : ['en', 'zh']
  const sk = {}
  for (const lang of langs) {
    const src = read(lang, f)
    if (src == null) { if (lang === 'zh') warn(`zh/${f}`, 'not translated yet'); continue }
    sk[lang] = skeleton(src)
    if (lang === 'en') styleCheck(f, src)
    const s = sk[lang]
    for (const id of s.figures) {
      const ok = ['en', lang].some(l => fs.existsSync(path.join(ROOT, 'src', 'figures', l, `${id}.svg`)))
      if (!ok && !/image=/.test(src.split('\n').find(l => l.includes(`id=${id}`)) || '')) err(`${lang}/${f}`, `figure ${id} is not drawn`)
    }
    for (const { line, href } of s.links) {
      const m = href.match(/^([\w-]+?)(?:_(EN|ZH))?\.html(#[\w-]+)?$/)
      if (!m || /^https?:/.test(href)) continue
      const [, name, suffix] = m
      if (name === 'index') continue
      if (!names.has(name)) { err(`${lang}/${f}:${line}`, `link to ${href}: no such page`); continue }
      if (suffix && suffix !== lang.toUpperCase()) err(`${lang}/${f}:${line}`, `link to ${href} points to the other language`)
    }
    // An output captured from an interrupted build must not reach a page.
    src.split('\n').forEach((ln, i) => {
      if (/exception Interrupt|Interrupt_Breakdown/.test(ln)) err(`${lang}/${f}:${i + 1}`, 'an Isabelle output from an interrupted build: run tools/isa.py --update again')
    })
    // A fence that opens on a list-marker line ("2. ```isabelle") is shown on the page but never checked by isa.py.
    src.split('\n').forEach((ln, i) => {
      if (/^\s*(\d+[.)]|[-*+])\s+`{3,}\s*(isabelle|output)/.test(ln)) err(`${lang}/${f}:${i + 1}`, 'a code fence on a list-item line is not checked by isa.py: put the fence on its own line, indented under the item')
    })
    if (f.startsWith('module_')) {
      for (const k of ['title', 'lead', 'minutes', 'needs', 'part']) if (!s.meta[k]) err(`${lang}/${f}`, `front matter has no ${k}`)
      if (!Array.isArray(s.meta.goals) || !s.meta.goals.length) err(`${lang}/${f}`, 'front matter has no goals')
      for (const id of ['summary', 'exercises', 'quiz']) if (!s.sections.includes(id)) warn(`${lang}/${f}`, `no {#${id}} section`)
      s.blocks.forEach((b, k) => {
        if (b.info.startsWith('output') && !(k > 0 && s.blocks[k - 1].info.startsWith('isabelle'))) err(`${lang}/${f}:${b.line}`, 'output block not straight after an isabelle block')
      })
    }
  }
  if (sk.en && sk.zh) {
    const e = sk.en, z = sk.zh, where = `zh/${f}`
    for (const k of ['minutes', 'part', 'imports']) if (String(e.meta[k] ?? '') !== String(z.meta[k] ?? '')) err(where, `${k} ${z.meta[k]} (English: ${e.meta[k]})`)
    if ((e.meta.goals || []).length !== (z.meta.goals || []).length) err(where, `${(z.meta.goals || []).length} goals (English: ${(e.meta.goals || []).length})`)
    if (e.sections.join() !== z.sections.join()) err(where, `section ids differ:\n    en ${e.sections.join(' ')}\n    zh ${z.sections.join(' ')}`)
    if (e.blocks.length !== z.blocks.length) err(where, `${z.blocks.length} isabelle/output/proof/table blocks (English: ${e.blocks.length})`)
    for (let i = 0; i < Math.min(e.blocks.length, z.blocks.length); i++) {
      const a = e.blocks[i], b = z.blocks[i]
      if (a.info !== b.info || a.body !== b.body) err(where + ':' + b.line, `block ${i + 1} differs from English (line ${a.line}): ${a.info}`)
    }
    const same = (k, label) => { if (e[k].join() !== z[k].join()) err(where, `${label} differ: en ${e[k].join(' ')} / zh ${z[k].join(' ')}`) }
    same('figures', 'figures'); same('widgets', 'widgets'); same('tabs', 'OS tabs'); same('exercises', 'exercises')
    if (JSON.stringify(e.quiz) !== JSON.stringify(z.quiz)) err(where, `quiz answers differ: en ${JSON.stringify(e.quiz)} / zh ${JSON.stringify(z.quiz)}`)
    for (const k of Object.keys(e.count)) if (e.count[k] !== z.count[k]) err(where, `${z.count[k]} ${k} box(es) (English: ${e.count[k]})`)
  }
}
for (const w of warnings) console.log('warning: ' + w)
for (const e of errors) console.log('error:   ' + e)
console.log(`${pages.length} pages checked: ${errors.length} error(s), ${warnings.length} warning(s)`)
process.exit(errors.length ? 1 : 0)
