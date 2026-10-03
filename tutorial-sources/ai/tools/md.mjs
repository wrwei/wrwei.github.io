// The Markdown dialect of the AI series. One renderer, shared by build.mjs and check.mjs.
//
// Beyond CommonMark + GFM tables it adds:
//   $...$ and $$...$$ math   -> <span class="math-i">TeX</span> / <div class="math-d">TeX</div>
//                               (rendered client-side by KaTeX; validated at build time)
//   ## Title {#id}            -> numbered section header with that anchor id
//   ::: kind key=value ...    -> callouts, worked examples, checks, exercises, papers, figures, widgets
//   ```output                 -> an expected-output block
//   ```quiz                   -> a multiple-choice quiz (see SPEC.md for the line format)
import MarkdownIt from 'markdown-it'
import container from 'markdown-it-container'
import fs from 'node:fs'
import path from 'node:path'

export const KATEX_MACROS = {
  '\\R': '\\mathbb{R}',
  '\\E': '\\mathbb{E}',
  '\\argmin': '\\operatorname*{arg\\,min}',
  '\\argmax': '\\operatorname*{arg\\,max}',
  '\\KL': '\\mathrm{KL}',
  '\\softmax': '\\operatorname{softmax}',
}

export const LABELS = {
  en: {
    note: 'Note', tip: 'Tip', analogy: 'Analogy', pitfall: 'Pitfall', keyidea: 'Key idea',
    worked: 'Worked example', check: 'Check your understanding', answer: 'Show answer',
    exercise: 'Exercise', solution: 'Show solution', figure: 'Figure', paper: 'Paper',
    output: 'Output', plotAlt: 'Plot produced by the code above', minutes: 'min', interactive: 'Interactive', quiz: 'Self-check quiz',
    quizCheck: 'Check answers', quizReset: 'Try again', kinds: {
      conceptual: 'conceptual', derivation: 'derivation', calculation: 'calculation', coding: 'coding', project: 'mini-project' },
  },
  zh: {
    note: '注意', tip: '提示', analogy: '类比', pitfall: '陷阱', keyidea: '核心思想',
    worked: '例题详解', check: '检验理解', answer: '查看答案',
    exercise: '练习', solution: '查看解答', figure: '图', paper: '论文',
    output: '输出', plotAlt: '上方代码生成的图', minutes: '分钟', interactive: '交互演示', quiz: '自测题',
    quizCheck: '核对答案', quizReset: '重新作答', kinds: {
      conceptual: '概念', derivation: '推导', calculation: '计算', coding: '编程', project: '小项目' },
  },
}

export function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// key=value key="value with spaces" #id .class flag
export function parseAttrs(info) {
  const out = { _kind: '', _flags: [] }
  const re = /(\w[\w-]*)="([^"]*)"|(\w[\w-]*)='([^']*)'|(\w[\w-]*)=(\S+)|#([\w-]+)|(\S+)/g
  let m, first = true
  while ((m = re.exec(info.trim()))) {
    if (first && m[7] === undefined && m[6] === undefined && m[8] !== undefined) { out._kind = m[8]; first = false; continue }
    first = false
    if (m[1]) out[m[1]] = m[2]
    else if (m[3]) out[m[3]] = m[4]
    else if (m[5]) out[m[5]] = m[6]
    else if (m[7]) out.id = m[7]
    else if (m[8]) out._flags.push(m[8])
  }
  return out
}

// ---------- math ----------
function isSpace(c) { return c === 0x20 || c === 0x09 || c === 0x0a || c === 0x0d }

function mathInline(state, silent) {
  const src = state.src
  const pos = state.pos
  if (src.charCodeAt(pos) !== 0x24) return false
  if (src.charCodeAt(pos + 1) === 0x24) {                     // $$...$$ inside a paragraph: display
    const end = src.indexOf('$$', pos + 2)
    if (end < 0) return false
    if (!silent) { const t = state.push('math_display_inline', '', 0); t.content = src.slice(pos + 2, end) }
    state.pos = end + 2
    return true
  }
  const next = src.charCodeAt(pos + 1)
  if (Number.isNaN(next) || isSpace(next)) return false        // opening $ must touch its content
  let i = pos + 1
  for (;;) {
    i = src.indexOf('$', i)
    if (i < 0) return false
    let bs = 0
    for (let k = i - 1; k > pos && src.charCodeAt(k) === 0x5c; k--) bs++
    if (bs % 2 === 1) { i++; continue }                        // \$ inside math is a literal dollar
    const prev = src.charCodeAt(i - 1)
    const after = src.charCodeAt(i + 1)
    if (isSpace(prev)) { i++; continue }                       // closing $ must touch its content
    if (after >= 0x30 && after <= 0x39) { i++; continue }      // and not be followed by a digit ($5 and $10)
    break
  }
  if (!silent) { const t = state.push('math_inline', '', 0); t.content = src.slice(pos + 1, i) }
  state.pos = i + 1
  return true
}

function mathBlock(state, startLine, endLine, silent) {
  const start = state.bMarks[startLine] + state.tShift[startLine]
  const max = state.eMarks[startLine]
  if (start + 2 > max || state.src.slice(start, start + 2) !== '$$') return false
  const first = state.src.slice(start + 2, max)
  let content
  let last = startLine
  const t1 = first.trim()
  if (t1.length >= 2 && t1.endsWith('$$')) {
    content = t1.slice(0, -2)
  } else {
    const lines = [first]
    let found = false
    for (let ln = startLine + 1; ln < endLine; ln++) {
      const s = state.bMarks[ln] + state.tShift[ln]
      const e = state.eMarks[ln]
      const line = state.src.slice(s, e)
      if (line.trim().endsWith('$$')) { lines.push(line.trim().slice(0, -2)); last = ln; found = true; break }
      lines.push(line)
    }
    if (!found) return false
    content = lines.join('\n')
  }
  if (silent) return true
  const tok = state.push('math_block', 'div', 0)
  tok.block = true
  tok.content = content.trim()
  tok.map = [startLine, last + 1]
  state.line = last + 1
  return true
}

// ---------- headings: "## Title {#id}" ----------
function headingIds(state) {
  const toks = state.tokens
  for (let i = 0; i < toks.length; i++) {
    if (toks[i].type !== 'heading_open') continue
    const inline = toks[i + 1]
    const m = inline.content.match(/\s*\{#([\w-]+)((?:\s+\.[\w-]+)*)\s*\}\s*$/)
    if (!m) continue
    toks[i].attrSet('id', m[1])
    if (m[2].trim()) toks[i].attrSet('class', m[2].trim().split(/\s+/).map(c => c.slice(1)).join(' '))
    inline.content = inline.content.slice(0, m.index)
  }
}

// ---------- quiz fence ----------
// Line format:
//   ? Question text (Markdown + math allowed)
//   - [ ] wrong option
//   - [x] right option
//   > Explanation (may continue on following "> " lines)
function renderQuiz(md, body, lang, env) {
  const L = LABELS[lang]
  const qs = []
  let cur = null
  for (const raw of body.split(/\r?\n/)) {
    const line = raw.trimEnd()
    if (!line.trim()) continue
    let m
    if ((m = line.match(/^\?\s+(.*)$/))) { cur = { q: m[1], opts: [], answer: -1, expl: [] }; qs.push(cur); continue }
    if (!cur) { env.errors.push({ msg: `quiz: text before the first "? " question: ${line.slice(0, 60)}` }); continue }
    if ((m = line.match(/^\s*-\s+\[( |x|X)\]\s+(.*)$/))) {
      if (m[1].toLowerCase() === 'x') { if (cur.answer >= 0) env.errors.push({ msg: `quiz: two correct options in "${cur.q.slice(0, 60)}"` }); cur.answer = cur.opts.length }
      cur.opts.push(m[2]); continue
    }
    if ((m = line.match(/^\s*>\s?(.*)$/))) { cur.expl.push(m[1]); continue }
    if (cur.expl.length) { cur.expl.push(line.trim()); continue }
    if (cur.opts.length) { cur.opts[cur.opts.length - 1] += ' ' + line.trim(); continue }
    cur.q += ' ' + line.trim()
  }
  qs.forEach((q, i) => {
    if (q.answer < 0) env.errors.push({ msg: `quiz: question ${i + 1} has no [x] option: "${q.q.slice(0, 60)}"` })
    if (q.opts.length < 2) env.errors.push({ msg: `quiz: question ${i + 1} has fewer than two options` })
    if (!q.expl.length) env.errors.push({ msg: `quiz: question ${i + 1} has no "> " explanation` })
  })
  env.counts.quiz += qs.length
  const inl = s => md.renderInline(s, env)
  let html = `<div class="quiz" data-n="${qs.length}">\n`
  qs.forEach((q, i) => {
    html += `<div class="quiz-q" data-answer="${q.answer}"><div class="quiz-stem"><span class="quiz-n">${i + 1}</span><div>${inl(q.q)}</div></div><ol class="quiz-opts" type="A">`
    q.opts.forEach((o, j) => { html += `<li><button type="button" class="quiz-opt" data-i="${j}">${inl(o)}</button></li>` })
    html += `</ol><div class="quiz-expl" hidden>${inl(q.expl.join(' '))}</div></div>\n`
  })
  html += `<div class="quiz-bar"><span class="quiz-score" aria-live="polite"></span><button type="button" class="quiz-reset">${L.quizReset}</button></div></div>\n`
  return html
}

// ---------- the renderer ----------
export function makeMd({ lang = 'en', figDirs = [], env: sharedEnv } = {}) {
  const L = LABELS[lang]
  const md = new MarkdownIt({ html: true, linkify: false, typographer: true })
  md.disable(['replacements'])   // keeps "(c)" in "(a) (b) (c)" from becoming a copyright sign

  md.inline.ruler.before('escape', 'math_inline', mathInline)
  md.block.ruler.before('fence', 'math_block', mathBlock, { alt: ['paragraph', 'reference', 'blockquote', 'list'] })
  md.core.ruler.before('inline', 'heading_ids', headingIds)
  md.core.ruler.after('block', 'figure_numbers', figureNumbers)
  md.core.ruler.after('inline', 'figure_refs', figureRefs)

  const mathOut = (cls, tag) => (toks, i, opts, env) => {
    env && env.math && env.math.push({ tex: toks[i].content, display: cls === 'math-d', line: env.curLine })
    return `<${tag} class="${cls}">${escapeHtml(toks[i].content)}</${tag}>${tag === 'div' ? '\n' : ''}`
  }
  md.renderer.rules.math_inline = mathOut('math-i', 'span')
  md.renderer.rules.math_display_inline = mathOut('math-d', 'span')
  md.renderer.rules.math_block = (toks, i, opts, env) => {
    if (env) env.curLine = toks[i].map ? toks[i].map[0] + 1 : env.curLine
    return mathOut('math-d', 'div')(toks, i, opts, env)
  }

  // tables scroll inside a wrapper on narrow screens
  md.renderer.rules.table_open = () => '<div class="table-wrap"><table>\n'
  md.renderer.rules.table_close = () => '</table></div>\n'

  // external links open in a new tab
  const linkOpen = md.renderer.rules.link_open || ((t, i, o, e, s) => s.renderToken(t, i, o))
  md.renderer.rules.link_open = (toks, i, opts, env, self) => {
    const href = toks[i].attrGet('href') || ''
    if (/^https?:\/\//.test(href)) { toks[i].attrSet('target', '_blank'); toks[i].attrSet('rel', 'noopener') }
    return linkOpen(toks, i, opts, env, self)
  }

  // track the source line of block tokens so math errors can be located
  const origRender = md.renderer.render.bind(md.renderer)
  md.renderer.render = (tokens, options, env) => {
    let out = ''
    const rules = md.renderer.rules
    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i]
      if (t.map && env) env.curLine = t.map[0] + 1 + (env.lineOffset || 0)
      if (t.type === 'inline') out += md.renderer.renderInline(t.children, options, env)
      else if (rules[t.type]) out += rules[t.type](tokens, i, options, env, md.renderer)
      else out += md.renderer.renderToken(tokens, i, options, env)
    }
    return out
  }
  void origRender

  // sections: "## Title {#id}" -> anchor + numbered header
  md.renderer.rules.heading_open = (toks, i, opts, env) => {
    const t = toks[i]
    const id = t.attrGet('id')
    if (t.tag === 'h2' && env.plainHeadings) return `<h2${id ? ` id="${escapeHtml(id)}"` : ''}>`
    if (t.tag === 'h2') {
      const flushed = flushPlots(env)
      env.curSection = id || ''
      env.labBlock = 0
      env.sections = env.sections || []
      const title = toks[i + 1].content.trim()
      const n = env.sections.length + 1
      env.sections.push({ id: id || `sec-${n}`, title, n, line: env.curLine })
      return `${flushed}<span class="section-anchor" id="${escapeHtml(id || `sec-${n}`)}"></span>\n<div class="section-header" data-sec="${escapeHtml(id || '')}"><span class="section-num">${n}</span><h2>`
    }
    return `<${t.tag}${id ? ` id="${escapeHtml(id)}"` : ''}>`
  }
  md.renderer.rules.heading_close = (toks, i, opts, env) => {
    const t = toks[i]
    if (t.tag === 'h2' && env.plainHeadings) return '</h2>\n'
    if (t.tag === 'h2') {
      const sec = env.sections[env.sections.length - 1]
      return `</h2></div>\n${env.afterHeader ? env.afterHeader(sec) : ''}`
    }
    return `</${t.tag}>\n`
  }

  // fences: code, expected output, quiz
  md.renderer.rules.fence = (toks, i, opts, env) => {
    const t = toks[i]
    const info = (t.info || '').trim()
    const langName = info.split(/\s+/)[0] || ''
    if (langName === 'quiz') return renderQuiz(md, t.content, lang, env)
    if (langName === 'output') {
      env.counts.output++
      return `<div class="output"><div class="output-label">${L.output}</div><pre><code>${escapeHtml(t.content)}</code></pre></div>\n${flushPlots(env)}`
    }
    env.counts.code++
    const norun = /\bnorun\b/.test(info)
    const cls = langName ? ` class="language-${escapeHtml(langName)}"` : ''
    const before = flushPlots(env)
    // lab code blocks are numbered as tools/labrun.py numbers them, so captured plots land under their block
    if ((langName === 'python' || langName === 'py') && !norun && /^lab\d+$/.test(env.curSection || '')) {
      env.labBlock = (env.labBlock || 0) + 1
      const files = env.plots && env.plots[env.curSection] && env.plots[env.curSection][env.labBlock]
      if (files && files.length) env.pendingPlots = files.map(f =>
        `<figure class="lab-plot"><img src="assets/plots/${escapeHtml(f)}" alt="${escapeHtml(L.plotAlt)}" loading="lazy"><figcaption>${escapeHtml(L.plotAlt)}</figcaption></figure>`).join('') + '\n'
    }
    return `${before}<pre${norun ? ' data-norun' : ''}><code${cls}>${escapeHtml(t.content)}</code></pre>\n`
  }

  // containers
  const KINDS = ['note', 'tip', 'analogy', 'pitfall', 'keyidea', 'worked', 'check', 'answer', 'exercise',
    'solution', 'paper', 'figure', 'widget']
  for (const kind of KINDS) {
    md.use(container, kind, {
      validate: params => params.trim().split(/\s+/)[0] === kind,
      render: (toks, i, opts, env) => {
        const t = toks[i]
        if (t.nesting === 1) {
          const a = parseAttrs(t.info)
          env.stack = env.stack || []
          env.stack.push({ kind, a })
          return openContainer(md, kind, a, L, env, figDirs)
        }
        const top = (env.stack || []).pop() || { kind, a: {} }
        return closeContainer(top.kind, top.a)
      },
    })
  }
  return md
}

export function flushPlots(env) {
  if (!env || !env.pendingPlots) return ''
  const html = env.pendingPlots
  env.pendingPlots = null
  return html
}

// ---------- figure numbers ----------
// Figures are numbered by order of appearance, so cutting one leaves no gap. The source names a
// figure by its id: fig-01-12 is written "Figure 1.12" in the text, and the page shows its number
// by position (Figure 1.6 if it is the sixth figure). Ids stay stable; numbers follow the page.
const FIG_ID = /^fig-(\d+)-(\d+)$/
const idKey = id => { const m = FIG_ID.exec(id || ''); return m ? `${Number(m[1])}.${Number(m[2])}` : '' }

function figureNumbers(state) {
  if (state.inlineMode) return             // renderInline (quiz, titles) keeps the page's numbers
  const nums = new Map()
  const perModule = {}
  for (const t of state.tokens) {
    if (t.type !== 'container_figure_open') continue
    const id = parseAttrs(t.info).id
    const key = idKey(id)
    if (!key || nums.has(id)) continue
    const mod = key.split('.')[0]
    perModule[mod] = (perModule[mod] || 0) + 1
    nums.set(id, `${mod}.${perModule[mod]}`)
  }
  state.env.figNums = nums
  state.env.figByKey = new Map([...nums].map(([id, n]) => [idKey(id), n]))
}

function figNumber(id, env) {
  return (env.figNums && env.figNums.get(id)) || idKey(id)
}

// "Figure 1.12", "Figures 1.25 to 1.27", "图 1.25 至 1.27": each number is a figure id, shown as the
// figure's position. A number with no figure on the page is kept and recorded for check.mjs.
const FIG_REF = /(Figures?|Fig\.|图)(\s*)(\d+\.\d+(?:\s*(?:to|and|or|至|到|和|与|或|、|,|，|–|-)\s*\d+\.\d+)*)/g
function figureRefs(state) {
  const byKey = state.env.figByKey
  if (!byKey) return
  const missing = state.env.figRefsMissing = state.env.figRefsMissing || []
  const mods = new Set([...byKey.keys()].map(k => k.split('.')[0]))
  const map = list => list.replace(/\d+\.\d+/g, k => {
    if (byKey.has(k)) return byKey.get(k)
    if (mods.has(k.split('.')[0])) missing.push(k)   // another module's numbers (or a paper's) are left alone
    return k
  })
  for (const t of state.tokens) {
    if (t.type !== 'inline' || !t.children) continue
    let carry = false                        // "Figure" ended the previous line, the number starts this one
    for (const c of t.children) {
      if (c.type === 'softbreak') continue
      if (c.type !== 'text') { carry = false; continue }
      if (carry) c.content = c.content.replace(FIG_REF_LEAD, map)
      c.content = c.content.replace(FIG_REF, (all, word, sp, list) => word + sp + map(list))
      carry = /(Figures?|Fig\.|图)\s*$/.test(c.content)
    }
  }
}
const FIG_REF_LEAD = /^\s*\d+\.\d+(?:\s*(?:to|and|or|至|到|和|与|或|、|,|，|–|-)\s*\d+\.\d+)*/

function readFigure(id, figDirs, env) {
  for (const d of figDirs) {
    const p = path.join(d, `${id}.svg`)
    if (fs.existsSync(p)) {
      let svg = fs.readFileSync(p, 'utf8').replace(/<\?xml[^>]*\?>\s*/, '').replace(/<!DOCTYPE[^>]*>\s*/i, '')
      // make ids inside the SVG unique per figure so two inline SVGs cannot clash
      const ids = [...svg.matchAll(/\bid="([^"]+)"/g)].map(m => m[1])
      for (const sid of new Set(ids)) {
        const nid = `${id}__${sid}`
        svg = svg.split(`id="${sid}"`).join(`id="${nid}"`).split(`url(#${sid})`).join(`url(#${nid})`)
          .split(`href="#${sid}"`).join(`href="#${nid}"`)
      }
      return svg
    }
  }
  env.missingFigures.push(id)
  return `<div class="fig-missing">[figure ${escapeHtml(id)} not drawn yet]</div>`
}

function openContainer(md, kind, a, L, env, figDirs) {
  const inl = s => md.renderInline(s || '', env)
  switch (kind) {
    case 'note': case 'tip': case 'analogy': case 'pitfall': case 'keyidea': {
      const title = a.title ? ` — ${inl(a.title)}` : ''
      return `<div class="callout ${kind}"><div class="callout-label">${L[kind]}${title}</div>\n`
    }
    case 'worked':
      env.counts.worked++
      return `<div class="worked"><div class="worked-label">${L.worked}</div>${a.title ? `<div class="worked-title">${inl(a.title)}</div>` : ''}\n`
    case 'check':
      env.counts.check++
      return `<div class="check"><div class="check-label">${L.check}</div>\n`
    case 'answer':
      return `<details class="answer"><summary>${L.answer}</summary><div class="details-body">\n`
    case 'exercise': {
      env.counts.exercise++
      const n = (a.id || '').replace(/^e/, '') || env.counts.exercise
      const level = Math.max(1, Math.min(3, Number(a.level) || 1))
      const kindName = L.kinds[a.kind] || a.kind || ''
      env.exercises.push({ id: a.id, level, minutes: Number(a.minutes) || 0, kind: a.kind })
      return `<div class="exercise"${a.id ? ` id="${escapeHtml(a.id)}"` : ''}><div class="exercise-head"><span class="exercise-n">${L.exercise} ${escapeHtml(String(n))}</span><span class="stars" title="level ${level}">${'★'.repeat(level)}<span class="stars-off">${'★'.repeat(3 - level)}</span></span>${kindName ? `<span class="exercise-kind">${escapeHtml(kindName)}</span>` : ''}${a.minutes ? `<span class="exercise-time">${escapeHtml(a.minutes)} ${L.minutes}</span>` : ''}</div>\n`
    }
    case 'solution':
      env.counts.solution++
      return `<details class="solution"><summary>${L.solution}</summary><div class="details-body">\n`
    case 'paper':
      env.counts.paper++
      return `<div class="paper"><div class="paper-label">${L.paper}${a.minutes ? ` · ${escapeHtml(a.minutes)} ${L.minutes}` : ''}</div>\n`
    case 'figure': {
      env.counts.figure++
      env.figures.push(a.id)
      const num = figNumber(a.id, env)
      return `<figure class="fig"${a.id ? ` id="${escapeHtml(a.id)}"` : ''}><div class="fig-svg">${readFigure(a.id, figDirs, env)}</div><figcaption>${num ? `<span class="fig-num">${L.figure} ${num}</span> ` : ''}`
    }
    case 'widget': {
      env.counts.widget++
      env.widgets.push(a.name)
      const data = Object.entries(a).filter(([k]) => !k.startsWith('_') && k !== 'name' && k !== 'id')
        .map(([k, v]) => ` data-${escapeHtml(k)}="${escapeHtml(v)}"`).join('')
      return `<div class="widget-wrap"><div class="widget-label">${L.interactive}</div><div class="widget" data-widget="${escapeHtml(a.name || '')}"${data}></div><div class="widget-caption">\n`
    }
  }
  return '<div>'
}

function closeContainer(kind) {
  switch (kind) {
    case 'answer': case 'solution': return '</div></details>\n'
    case 'figure': return '</figcaption></figure>\n'
    case 'widget': return '</div></div>\n'
    default: return '</div>\n'
  }
}

export function newEnv() {
  return {
    sections: [], math: [], errors: [], missingFigures: [], figures: [], widgets: [], exercises: [],
    counts: { quiz: 0, output: 0, code: 0, worked: 0, check: 0, exercise: 0, solution: 0, paper: 0, figure: 0, widget: 0 },
    curLine: 0, lineOffset: 0,
  }
}
