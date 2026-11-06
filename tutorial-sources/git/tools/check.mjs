// Check the Git series sources.
//   node tools/check.mjs            every page, both languages
//   node tools/check.mjs --lang en  one language (no parity check)
// For each page that exists in Chinese, checks that it matches the English in everything that is
// not prose: front-matter fields, section ids in order, terminal blocks, file blocks, replay
// comments, figures and widgets in order, OS tabs, quiz answers, and the number of trouble boxes.
// Also checks links between the series' pages, and that every figure is drawn. Exits 1 on errors.
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

function read(lang, f) {
  const p = path.join(ROOT, 'src', lang, f)
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n') : null
}

// The parts of a page that must not change in translation.
function skeleton(src) {
  const { meta, body } = frontMatter(src)
  const lines = body.split('\n')
  const out = { meta, sections: [], blocks: [], replays: [], figures: [], widgets: [], tabs: [], quiz: [], trouble: 0, links: [] }
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i]
    let m
    if ((m = ln.match(/^## .*\{#([\w-]+)\}\s*$/))) out.sections.push(m[1])
    if ((m = ln.match(/^(\s*)(`{3,})(terminal|file)(.*)$/))) {
      const fence = m[2]
      const indent = m[1].length
      const body = []
      let j = i + 1
      while (j < lines.length && !new RegExp('^\\s*' + fence + '`*\\s*$').test(lines[j])) { body.push(lines[j].slice(Math.min(indent, lines[j].search(/\S|$/)))); j++ }
      out.blocks.push({ line: i + 1, info: (m[3] + m[4]).trim(), body: body.join('\n') })
      i = j
      continue
    }
    if ((m = ln.match(/^(\s*)```quiz\s*$/))) {
      // the position of the right answer of each question
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
    if (ln.trim().startsWith('<!-- replay:')) {
      let j = i
      while (!lines[j].includes('-->')) j++
      out.replays.push(lines.slice(i, j + 1).join('\n'))
      i = j
      continue
    }
    if ((m = ln.match(/^\s*::: figure\s+id=([\w-]+)/))) out.figures.push(m[1])
    if ((m = ln.match(/^\s*::: widget\s+name=([\w-]+)/))) out.widgets.push(m[1])
    if ((m = ln.match(/^\s*::: tab\s+(.+)$/))) out.tabs.push(m[1].trim())
    if (/^\s*::: trouble\s*$/.test(ln)) out.trouble++
    for (const l of ln.matchAll(/\]\(([^)\s]+)\)/g)) out.links.push({ line: i + 1, href: l[1] })
  }
  return out
}

const pages = fs.readdirSync(path.join(ROOT, 'src', 'en')).filter(f => f.endsWith('.md')).sort()
const builtNames = new Set(pages.map(f => f.replace(/\.md$/, '')))
for (const f of pages) {
  const langs = only ? [only] : ['en', 'zh']
  const sk = {}
  for (const lang of langs) {
    const src = read(lang, f)
    if (src == null) { if (lang === 'zh') warn(`zh/${f}`, 'not translated yet'); continue }
    sk[lang] = skeleton(src)
    const s = sk[lang]
    // figures drawn?
    for (const id of s.figures) {
      const ok = ['en', lang].some(l => fs.existsSync(path.join(ROOT, 'src', 'figures', l, `${id}.svg`)))
      if (!ok && !/image=/.test(src.split('\n').find(l => l.includes(`id=${id}`)) || '')) err(`${lang}/${f}`, `figure ${id} is not drawn`)
    }
    // links between the series' pages go to pages that exist, in the same language
    for (const { line, href } of s.links) {
      const m = href.match(/^([\w-]+?)(?:_(EN|ZH))?\.html(#[\w-]+)?$/)
      if (!m || /^https?:/.test(href)) continue
      const [, name, suffix] = m
      if (name === 'index') continue
      if (!builtNames.has(name)) { err(`${lang}/${f}:${line}`, `link to ${href}: no such page`); continue }
      if (suffix && suffix !== lang.toUpperCase()) err(`${lang}/${f}:${line}`, `link to ${href} points to the other language`)
    }
    if (f.startsWith('lesson_')) {
      for (const k of ['title', 'lead', 'minutes', 'needs']) if (!s.meta[k]) err(`${lang}/${f}`, `front matter has no ${k}`)
      if (!Array.isArray(s.meta.goals) || !s.meta.goals.length) err(`${lang}/${f}`, 'front matter has no goals')
      if (!s.sections.includes('summary')) warn(`${lang}/${f}`, 'no {#summary} section')
      if (!s.sections.includes('quiz')) warn(`${lang}/${f}`, 'no {#quiz} section')
    }
  }
  if (sk.en && sk.zh) {
    const e = sk.en, z = sk.zh, where = `zh/${f}`
    if (f.startsWith('lesson_')) {
      if (String(e.meta.minutes) !== String(z.meta.minutes)) err(where, `minutes ${z.meta.minutes} (English: ${e.meta.minutes})`)
      if ((e.meta.goals || []).length !== (z.meta.goals || []).length) err(where, `${(z.meta.goals || []).length} goals (English: ${(e.meta.goals || []).length})`)
    }
    if (e.sections.join() !== z.sections.join()) err(where, `section ids differ:\n    en ${e.sections.join(' ')}\n    zh ${z.sections.join(' ')}`)
    if (e.blocks.length !== z.blocks.length) err(where, `${z.blocks.length} terminal/file blocks (English: ${e.blocks.length})`)
    for (let i = 0; i < Math.min(e.blocks.length, z.blocks.length); i++) {
      const a = e.blocks[i], b = z.blocks[i]
      if (a.info !== b.info || a.body !== b.body) {
        err(where + ':' + b.line, `block ${i + 1} differs from English (line ${a.line}): ${a.info}`)
      }
    }
    if (e.replays.join('\n') !== z.replays.join('\n')) err(where, 'replay comments differ from English')
    if (e.figures.join() !== z.figures.join()) err(where, `figures differ: en ${e.figures.join(' ')} / zh ${z.figures.join(' ')}`)
    if (e.widgets.join() !== z.widgets.join()) err(where, `widgets differ: en ${e.widgets.join(' ')} / zh ${z.widgets.join(' ')}`)
    if (e.tabs.length !== z.tabs.length) err(where, `${z.tabs.length} OS tabs (English: ${e.tabs.length})`)
    else for (let i = 0; i < e.tabs.length; i++) if (e.tabs[i] !== z.tabs[i]) err(where, `tab ${i + 1} is "${z.tabs[i]}" (English: "${e.tabs[i]}"); keep the tab names Windows, macOS, Linux`)
    if (JSON.stringify(e.quiz) !== JSON.stringify(z.quiz)) err(where, `quiz answers differ: en ${JSON.stringify(e.quiz)} / zh ${JSON.stringify(z.quiz)}`)
    if (e.trouble !== z.trouble) err(where, `${z.trouble} trouble boxes (English: ${e.trouble})`)
  }
}
for (const w of warnings) console.log('warning: ' + w)
for (const e of errors) console.log('error:   ' + e)
console.log(`${pages.length} pages checked: ${errors.length} error(s), ${warnings.length} warning(s)`)
process.exit(errors.length ? 1 : 0)
