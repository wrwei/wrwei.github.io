// Validate the AI series sources.
//   node check.mjs                      all modules, both languages
//   node check.mjs --module 3 --lang en
//   node check.mjs --module 3 --words   also print word counts per concept section
//   node check.mjs --module 3 --part 11-concepts-b.md   check one Chinese part against its English original
// Exit code 1 if any error. Warnings do not fail.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import katex from 'katex'
import * as parse5 from 'parse5'
import { KATEX_MACROS, makeMd, newEnv } from './md.mjs'
import { renderModule, assemble, loadMeta, partFiles } from './build.mjs'

const ROOT = process.env.AIS_ROOT || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
// the site's tutorials folder: this series root is tutorial-sources/ai inside the site repo
const SITE_TUTORIALS = process.env.AIS_SITE_TUTORIALS || path.resolve(ROOT, '..', '..', 'docs', 'tutorials')
const argv = process.argv.slice(2)
const get = k => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : null }
const mods = get('--module') ? [Number(get('--module'))] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const langs = get('--lang') ? [get('--lang')] : ['en', 'zh']
const showWords = argv.includes('--words')
const pad = n => String(n).padStart(2, '0')

// This file is public, so the names of the private source repository's internals are not listed
// here: they are read from notes/private-terms.txt (git-ignored), one regular expression per line.
const FORBIDDEN = [
  [/\bthe platform('s)?\b/i, '"the platform" (public pages must stand alone)'],
  [/\bthis repository\b|\bthis repo\b/i, 'refers to a repository'],
  [/docs\/[A-Z]/, 'internal docs path'],
]
const PRIVATE_TERMS = path.join(ROOT, 'notes', 'private-terms.txt')
if (fs.existsSync(PRIVATE_TERMS)) for (const line of fs.readFileSync(PRIVATE_TERMS, 'utf8').split(/\r?\n/)) {
  const t = line.trim()
  if (t && !t.startsWith('#')) FORBIDDEN.push([new RegExp(t, 'i'), 'names an internal of the private source repository'])
}

let errors = 0
let warnings = 0
const out = []
const err = (m, where, msg) => { errors++; out.push(`  ERROR  [${m}] ${where ? where + ': ' : ''}${msg}`) }
const warn = (m, where, msg) => { warnings++; out.push(`  warn   [${m}] ${where ? where + ': ' : ''}${msg}`) }

function codeBlocks(src) {
  const blocks = []
  const re = /^(```+)([^\n]*)\n([\s\S]*?)^\1\s*$/gm
  let m
  while ((m = re.exec(src))) blocks.push({ info: m[2].trim(), body: m[3] })
  return blocks
}

function katexError(tex, display) {
  try { katex.renderToString(tex, { displayMode: display, throwOnError: true, macros: { ...KATEX_MACROS }, strict: 'ignore' }); return null } catch (e) {
    return String(e.message).replace(/^KaTeX parse error: /, '').slice(0, 160)
  }
}

function stripForWords(s) {
  return s.replace(/^```[\s\S]*?^```\s*$/gm, ' ').replace(/\$\$[\s\S]*?\$\$/g, ' ').replace(/\$[^$\n]+\$/g, ' x ')
    .replace(/^:::.*$/gm, ' ').replace(/[#*_`>|]/g, ' ')
}
function countWords(s, lang) {
  const t = stripForWords(s)
  if (lang === 'zh') { const han = (t.match(/[\u4e00-\u9fff]/g) || []).length; const lat = (t.replace(/[\u4e00-\u9fff]/g, ' ').match(/[A-Za-z0-9]+/g) || []).length; return han + lat }
  return (t.match(/[A-Za-z0-9][A-Za-z0-9'’-]*/g) || []).length
}

// ---------- one translated part against its English original ----------
if (get('--part')) {
  const part = get('--part')
  const n = mods[0]
  const enP = path.join(ROOT, 'src', 'en', `module_${pad(n)}`, part)
  const zhP = path.join(ROOT, 'src', 'zh', `module_${pad(n)}`, part)
  const tag = `m${pad(n)}/${part}`
  if (!fs.existsSync(enP) || !fs.existsSync(zhP)) { console.log(`missing ${fs.existsSync(enP) ? zhP : enP}`); process.exit(1) }
  const en = fs.readFileSync(enP, 'utf8').replace(/\r\n/g, '\n')
  const zh = fs.readFileSync(zhP, 'utf8').replace(/\r\n/g, '\n')
  const blocks = s => codeBlocks(s).filter(b => b.info.split(/\s+/)[0] !== 'quiz')
  const a = blocks(en)
  const b = blocks(zh)
  if (a.length !== b.length) err(tag, '', `EN has ${a.length} code/output blocks, ZH has ${b.length}`)
  else a.forEach((x, i) => { if (x.body !== b[i].body || x.info !== b[i].info) err(tag, '', `code block ${i + 1} differs (${x.info}): "${x.body.slice(0, 60).replace(/\n/g, '⏎')}"`) })
  const ids = s => [...s.matchAll(/^## .*\{#([\w-]+)\}\s*$/gm)].map(m => m[1]).join(',')
  if (ids(en) !== ids(zh)) err(tag, '', `section ids differ:\n      EN ${ids(en)}\n      ZH ${ids(zh)}`)
  const conts = s => {
    let inF = false
    return s.split('\n').filter(l => { if (/^```/.test(l)) inF = !inF; return !inF && /^:::+\s*[a-z]/.test(l) })
      .map(l => l.replace(/title="[^"]*"/, 'title=…').trim())
  }
  const ca = conts(en)
  const cb = conts(zh)
  if (ca.join('\n') !== cb.join('\n')) {
    const k = ca.findIndex((x, i) => x !== cb[i])
    err(tag, '', `container lines differ (${ca.length} vs ${cb.length}); first difference:\n      EN ${ca[k]}\n      ZH ${cb[k]}`)
  }
  const md = makeMd({ lang: 'zh', figDirs: [] })
  const env = newEnv()
  md.render(zh, env)
  for (const e of env.errors) err(tag, '', e.msg)
  for (const m of env.math) {
    const e = katexError(m.tex, m.display)
    if (e) err(tag, `line ${m.line}`, `KaTeX: ${e}  in  ${m.tex.slice(0, 100)}`)
  }
  // untranslated prose: long English-only lines outside code, maths and references
  let inF = false
  let inRefs = false
  zh.split('\n').forEach((l, i) => {
    if (/^```/.test(l)) { inF = !inF; return }
    if (/^## .*\{#refs\}/.test(l)) inRefs = true
    else if (/^## /.test(l)) inRefs = false
    if (inF || inRefs || /^:::/.test(l)) return
    const plain = l.replace(/\$\$[^$]*\$\$|\$[^$]*\$|`[^`]*`|\[[^\]]*\]\([^)]*\)|\*[^*]+\*/g, ' ')
    if (!/[\u4e00-\u9fff]/.test(plain) && (plain.match(/[A-Za-z]{2,}/g) || []).length >= 12) warn(tag, `line ${i + 1}`, `looks untranslated: "${l.trim().slice(0, 90)}"`)
  })
  console.log(out.join('\n') || `  ok     [${tag}] parity, maths and quiz fine`)
  console.log(`\n${errors} error(s), ${warnings} warning(s)`)
  process.exit(errors ? 1 : 0)
}

// ---------- whole modules ----------
for (const n of mods) {
  const tag = `m${pad(n)}`
  const perLang = {}
  for (const lang of langs) {
    const L = `${tag}/${lang}`
    let meta
    try { meta = loadMeta(n, lang) } catch (e) { err(L, '', `cannot read plan/meta: ${e.message}`); continue }
    if (!meta) { if (lang === 'zh') continue; err(L, '', 'no plan'); continue }
    const files = partFiles(n, lang)
    if (!files.length) continue
    // containers balanced per part file; forbidden references
    for (const f of files) {
      const lines = fs.readFileSync(f, 'utf8').split(/\r?\n/)
      let depth = 0
      let inFence = false
      lines.forEach((ln, i) => {
        if (/^```/.test(ln)) inFence = !inFence
        if (inFence) return
        if (/^:::+\s*[a-z]/.test(ln)) depth++
        else if (/^:::+\s*$/.test(ln)) { depth--; if (depth < 0) { err(L, `${path.relative(ROOT, f)}:${i + 1}`, 'closing ::: without an opener'); depth = 0 } }
      })
      if (depth > 0) err(L, path.relative(ROOT, f), `${depth} unclosed ::: container(s)`)
      if (inFence) err(L, path.relative(ROOT, f), 'unclosed ``` fence')
      lines.forEach((ln, i) => { for (const [re, why] of FORBIDDEN) if (re.test(ln)) (/the platform|this repo/i.test(why) ? warn : err)(L, `${path.relative(ROOT, f)}:${i + 1}`, `${why}: "${ln.trim().slice(0, 90)}"`) })
    }
    let r
    try { r = renderModule(n, lang, { write: false }) } catch (e) { err(L, '', `render failed: ${e.stack}`); continue }
    if (!r) continue
    const { env, html, src } = r
    const { locate } = assemble(n, lang, meta)
    perLang[lang] = { src, env }
    for (const e of env.errors) err(L, '', e.msg)
    // maths
    for (const m of env.math) {
      const e = katexError(m.tex, m.display)
      if (e) err(L, locate(m.line), `KaTeX: ${e}  in  ${m.tex.slice(0, 100)}`)
      if (!m.display && /(^|[^\\a-zA-Z{])[a-zA-Z]{3,}\s+[a-zA-Z]{3,}\s+[a-zA-Z]{3,}/.test(m.tex.replace(/\\(text|mathrm|operatorname|textbf|mathbf|mathit)\{[^}]*\}/g, '')))
        warn(L, locate(m.line), `inline maths reads like prose (a stray dollar sign for money?): ${m.tex.slice(0, 80)}`)
      if (!m.display && m.tex.length > 260) warn(L, locate(m.line), `very long inline maths (${m.tex.length} chars): unbalanced dollar sign?`)
    }
    // structure
    const ids = env.sections.map(s => s.id)
    const dup = ids.filter((x, i) => ids.indexOf(x) !== i)
    if (dup.length) err(L, '', `duplicate section ids: ${[...new Set(dup)].join(', ')}`)
    for (const req of ['s1', 'wrong', 'exercises', 'quiz', 'reading', 'summary', 'refs']) if (!ids.includes(req)) warn(L, '', `missing section {#${req}}`)
    const labIds = ids.filter(x => /^lab\d+$/.test(x))
    const planLabs = (meta.labs || []).map(l => l.id)
    for (const id of planLabs) if (!labIds.includes(id)) warn(L, '', `lab ${id} from the plan has no section`)
    const anchorIds = new Set([...ids, ...env.exercises.map(e => e.id).filter(Boolean), ...env.figures.filter(Boolean), 'plan'])
    for (const s of meta.sessions || []) for (const a of s.activities) for (const ref of a.refs || [])
      if (!anchorIds.has(ref)) warn(L, '', `session ${s.n} links to #${ref}, which does not exist`)
    if (env.counts.exercise < 15) warn(L, '', `${env.counts.exercise} exercises (want 15–20)`)
    if (env.counts.solution < env.counts.exercise) warn(L, '', `${env.counts.exercise - env.counts.solution} exercise(s) without a ::: solution`)
    if (env.counts.quiz < 10) warn(L, '', `${env.counts.quiz} quiz questions (want 10–12)`)
    if (env.counts.paper < 2) warn(L, '', `${env.counts.paper} guided papers (want 2–3)`)
    if (labIds.length < 4) warn(L, '', `${labIds.length} labs (want 4–6)`)
    if (env.missingFigures.length) warn(L, '', `figures not drawn yet: ${env.missingFigures.join(', ')}`)
    if (env.figRefsMissing && env.figRefsMissing.length) warn(L, '', `text cites figures with no ::: figure on the page (the number is a figure id): ${[...new Set(env.figRefsMissing)].join(', ')}`)
    for (const w of env.widgets) if (!fs.existsSync(path.join(ROOT, 'src', 'widgets', `${w}.js`))) warn(L, '', `widget "${w}" has no src/widgets/${w}.js yet`)
    // links
    for (const m of src.matchAll(/\]\(([^)\s]+)\)/g)) {
      const href = m[1]
      if (/^(https?:|mailto:)/.test(href)) continue
      if (href.startsWith('#')) { if (!anchorIds.has(href.slice(1)) && !html.includes(`id="${href.slice(1)}"`)) warn(L, '', `link to missing anchor ${href}`); continue }
      const target = href.split('#')[0]
      const p = path.join(SITE_TUTORIALS, 'ai', target)
      const local = path.join(ROOT, 'out', 'ai', target)
      if (!fs.existsSync(p) && !fs.existsSync(local) && !/^module_\d\d_(EN|ZH)\.html$/.test(target) && !/^index(_ZH)?\.html$/.test(target)) warn(L, '', `link target not found: ${href}`)
    }
    // HTML well-formedness of the generated page
    const perr = []
    parse5.parse(html, { onParseError: e => perr.push(e) })
    const serious = perr.filter(e => !['missing-doctype', 'non-void-html-element-start-tag-with-trailing-solidus'].includes(e.code))
    if (serious.length) {
      const lines = html.split('\n')
      for (const e of serious.slice(0, 8)) err(L, `html:${e.startLine}`, `${e.code} near "${(lines[e.startLine - 1] || '').slice(Math.max(0, e.startCol - 40), e.startCol + 40)}"`)
      if (serious.length > 8) err(L, '', `${serious.length - 8} more HTML parse errors`)
    }
    // word counts
    if (showWords && meta.sections) {
      const secs = src.split(/^(?=## )/m)
      let total = 0
      const rows = []
      for (const s of meta.sections) {
        const chunk = secs.find(c => new RegExp(`\\{#${s.id}\\}`).test(c.split('\n')[0])) || ''
        const w = countWords(chunk, lang)
        total += w
        rows.push(`${s.id.padEnd(5)} ${String(w).padStart(6)} / ${String(s.target_words).padStart(5)}  ${s.title}`)
      }
      out.push(`  words  [${L}] concept sections: ${total} (target ${meta.sections.reduce((a, s) => a + s.target_words, 0)})\n         ` + rows.join('\n         '))
    }
    out.push(`  ok     [${L}] sections=${ids.length} labs=${labIds.length} exercises=${env.counts.exercise} quiz=${env.counts.quiz} papers=${env.counts.paper} figures=${env.counts.figure} widgets=${env.counts.widget} math=${env.math.length} code=${env.counts.code} outputs=${env.counts.output}`)
  }
  // parity between languages
  if (perLang.en && perLang.zh) {
    const a = codeBlocks(perLang.en.src).filter(b => b.info.split(/\s+/)[0] !== 'quiz')
    const b = codeBlocks(perLang.zh.src).filter(b => b.info.split(/\s+/)[0] !== 'quiz')
    if (a.length !== b.length) err(`${tag}`, '', `EN has ${a.length} code/output blocks, ZH has ${b.length}`)
    else a.forEach((x, i) => { if (x.body !== b[i].body || x.info !== b[i].info) err(`${tag}`, '', `code block ${i + 1} differs between EN and ZH (${x.info}): "${x.body.slice(0, 60).replace(/\n/g, '⏎')}"`) })
    const ia = perLang.en.env.sections.map(s => s.id).join(',')
    const ib = perLang.zh.env.sections.map(s => s.id).join(',')
    if (ia !== ib) err(`${tag}`, '', `section ids differ between EN and ZH:\n      EN ${ia}\n      ZH ${ib}`)
    if (perLang.en.env.counts.quiz !== perLang.zh.env.counts.quiz) err(`${tag}`, '', 'quiz question counts differ between EN and ZH')
    if (perLang.en.env.counts.exercise !== perLang.zh.env.counts.exercise) err(`${tag}`, '', 'exercise counts differ between EN and ZH')
  }
}
console.log(out.join('\n'))
console.log(`\n${errors} error(s), ${warnings} warning(s)`)
process.exit(errors ? 1 : 0)
