// The Markdown dialect of the Calculus series (PLAN.md, section 5).
// One renderer for the build and the checks. The quiz format, attribute parsing, containers and
// figures follow the Formal Methods series' tools/md.mjs.
//
//   ## Title {#id}                 numbered section with that anchor
//   $...$  $$...$$                 mathematics (KaTeX, rendered at build time)
//   ```python [fails|norun]        Python, run by tools/calc.py
//   ```output                      what the python block above printed (filled in by tools/calc.py)
//   ```check                       hidden SymPy verification of the surrounding example or solution
//   ```valuetable                  a table of values computed by tools/calc.py
//   ```terminal                    shell commands, not run
//   ```quiz                        end-of-module quiz
//   ::: definition|theorem|example TITLE   numbered boxes
//   ::: proof [TITLE]              a proof, ended with ∎
//   ::: note|tip|pitfall|keyidea|analogy   callouts
//   ::: deeper TITLE  ::: compute TITLE    "Going deeper" and "Compute it" boxes
//   ::: trouble                    collapsed "If something went wrong" box
//   :::: exercise TITLE {#id} ★★   with a ::: solution inside (folded)
//   :::: tabs / ::: tab NAME        operating-system tabs
//   ::: figure id=fig-NN-k         figure (src/figures/<lang>/<id>.svg);  ::: widget name=...
import MarkdownIt from 'markdown-it'
import container from 'markdown-it-container'
import cjkFriendly from 'markdown-it-cjk-friendly'
import katex from 'katex'
import fs from 'node:fs'
import path from 'node:path'

export const LABELS = {
  en: {
    note: 'Good to know', tip: 'Tip', pitfall: 'Watch out', keyidea: 'Key idea', analogy: 'Think of it like this',
    definition: 'Definition', theorem: 'Theorem', example: 'Example', proof: 'Proof', deeper: 'Going deeper',
    compute: 'Compute it', exercise: 'Exercise', solution: 'Show solution', figure: 'Figure', interactive: 'Try it',
    trouble: 'If something went wrong', copy: 'Copy', copied: 'Copied', quizReset: 'Try again',
    terminal: 'Terminal', python: 'Python', pyFails: 'raises an error on purpose', pyNorun: 'not run', output: 'Output',
    error: 'Error', checked: 'Checked', checkedTitle: 'The results in this box were verified with the SymPy computer algebra system',
    undefined: 'undefined',
  },
  zh: {
    note: '须知', tip: '提示', pitfall: '注意', keyidea: '要点', analogy: '打个比方',
    definition: '定义', theorem: '定理', example: '例', proof: '证明', deeper: '深入一步',
    compute: '动手计算', exercise: '练习', solution: '查看解答', figure: '图', interactive: '动手试试',
    trouble: '如果出了问题', copy: '复制', copied: '已复制', quizReset: '重新作答',
    terminal: '终端', python: 'Python', pyFails: '故意出错的例子', pyNorun: '未运行', output: '输出',
    error: '错误', checked: '已检验', checkedTitle: '本框中的结果已用计算机代数系统 SymPy 检验',
    undefined: '无定义',
  },
}

export function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// key=value key="value with spaces" #id flag
export function parseAttrs(info) {
  const out = { _kind: '', _flags: [] }
  const re = /(\w[\w-]*)="([^"]*)"|(\w[\w-]*)=(\S+)|\{#([\w-]+)\}|#([\w-]+)|(\S+)/g
  let m, first = true
  while ((m = re.exec(info.trim()))) {
    if (first && m[7] !== undefined) { out._kind = m[7]; first = false; continue }
    first = false
    if (m[1]) out[m[1]] = m[2]
    else if (m[3]) out[m[3]] = m[4]
    else if (m[5] || m[6]) out.id = m[5] || m[6]
    else if (m[7]) out._flags.push(m[7])
  }
  return out
}

// ---------- front matter: a small YAML subset (key: value, and lists of "  - item") ----------
export function frontMatter(src) {
  const m = src.match(/^---\n([\s\S]*?)\n---\n/)
  if (!m) return { meta: {}, body: src, offset: 0 }
  const meta = {}
  let key = null
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(.*)$/)
    const item = line.match(/^\s+-\s+(.*)$/)
    if (kv) {
      key = kv[1]
      const v = kv[2].trim()
      meta[key] = v === '' ? [] : v.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1')
    } else if (item && key) {
      if (!Array.isArray(meta[key])) meta[key] = []
      meta[key].push(item[1].replace(/^"(.*)"$/, '$1'))
    }
  }
  return { meta, body: src.slice(m[0].length), offset: m[0].split('\n').length - 1 }
}

// ---------- headings "## Title {#id}" ----------
function headingIds(state) {
  const toks = state.tokens
  for (let i = 0; i < toks.length; i++) {
    if (toks[i].type !== 'heading_open') continue
    const inline = toks[i + 1]
    const m = inline.content.match(/\s*\{#([\w-]+)\}\s*$/)
    if (!m) continue
    toks[i].attrSet('id', m[1])
    inline.content = inline.content.slice(0, m.index)
  }
}

// ---------- mathematics: $...$ and $$...$$ ----------
export const KATEX_MACROS = {
  '\\R': '\\mathbb{R}', '\\N': '\\mathbb{N}', '\\Z': '\\mathbb{Z}', '\\Q': '\\mathbb{Q}', '\\C': '\\mathbb{C}',
  '\\abs': '\\left\\lvert #1\\right\\rvert', '\\norm': '\\left\\lVert #1\\right\\rVert', '\\vb': '\\mathbf{#1}',
  '\\dd': '\\mathop{}\\!d', '\\sech': '\\operatorname{sech}', '\\csch': '\\operatorname{csch}',
  '\\arcsec': '\\operatorname{arcsec}', '\\arccsc': '\\operatorname{arccsc}', '\\arccot': '\\operatorname{arccot}',
}

export function tex(src, display, env) {
  try {
    return katex.renderToString(src, { displayMode: display, throwOnError: true, macros: { ...KATEX_MACROS }, strict: 'ignore' })
  } catch (e) {
    if (env) env.errors.push(`math: ${e.message.split('\n')[0]} in $${src.slice(0, 60)}$`)
    return `<code class="math-error">${escapeHtml(src)}</code>`
  }
}

function mathPlugin(md) {
  md.inline.ruler.after('escape', 'math_inline', (state, silent) => {
    const s = state.src, start = state.pos
    if (s[start] !== '$' || s[start + 1] === '$') return false
    let end = start + 1
    while (end < s.length && (s[end] !== '$' || s[end - 1] === '\\')) end++
    if (end >= s.length || end === start + 1) return false
    if (/\s/.test(s[start + 1]) || /\s/.test(s[end - 1])) return false
    // Closing punctuation straight after the formula stays on the same line.
    const punct = (s.slice(end + 1).match(/^[，。；：、？！）」』”,.;:)!?]+/) || [''])[0]
    if (!silent) {
      const tok = state.push('math_inline', 'math', 0)
      tok.content = s.slice(start + 1, end)
      tok.meta = { punct }
    }
    state.pos = end + 1 + punct.length
    return true
  })
  md.block.ruler.after('blockquote', 'math_block', (state, startLine, endLine, silent) => {
    const pos = state.bMarks[startLine] + state.tShift[startLine]
    const max = state.eMarks[startLine]
    if (state.src.slice(pos, pos + 2) !== '$$') return false
    let first = state.src.slice(pos + 2, max)
    let line = startLine, body = []
    if (first.trim().endsWith('$$') && first.trim().length > 2) {
      body.push(first.trim().slice(0, -2))
    } else {
      if (first.trim()) body.push(first)
      for (line = startLine + 1; line < endLine; line++) {
        const p = state.bMarks[line] + state.tShift[line]
        const txt = state.src.slice(p, state.eMarks[line])
        if (txt.trim().endsWith('$$')) { body.push(txt.trim().slice(0, -2)); break }
        body.push(txt)
      }
      if (line >= endLine) return false
    }
    if (silent) return true
    const tok = state.push('math_block', 'math', 0)
    tok.content = body.join('\n')
    tok.map = [startLine, line + 1]
    state.line = line + 1
    return true
  }, { alt: ['paragraph', 'reference', 'blockquote', 'list'] })
  md.renderer.rules.math_inline = (toks, i, opts, env) => {
    const punct = (toks[i].meta && toks[i].meta.punct) || ''
    const m = tex(toks[i].content, false, env)
    // A word joiner (U+2060) forbids a line break before the punctuation only.
    return punct ? `${m}⁠${escapeHtml(punct)}` : m
  }
  md.renderer.rules.math_block = (toks, i, opts, env) => `<div class="math-display">${tex(toks[i].content, true, env)}</div>\n`
}

// ---------- Python ----------
const PY_KW = new Set(('False None True and as assert async await break class continue def del elif else except finally for ' +
  'from global if import in is lambda nonlocal not or pass raise return try while with yield match case').split(' '))
const PY_BUILTIN = new Set(('print range len abs round sum min max list dict set tuple int float str enumerate zip map filter ' +
  'sorted reversed isinstance type any all pow divmod format input open iter next bool complex').split(' '))

export function pyHighlight(text) {
  const re = /(#[^\n]*)|([rRbBfFuU]{0,2}(?:"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'))|(\b\d[\d_]*(?:\.\d*)?(?:[eE][+-]?\d+)?j?\b|\.\d+(?:[eE][+-]?\d+)?)|([A-Za-z_]\w*)|([\s\S])/g
  let out = '', m, prevWord = ''
  while ((m = re.exec(text))) {
    const [tok, com, str, num, word] = m
    if (com) out += `<span class="py-com">${escapeHtml(com)}</span>`
    else if (str) out += `<span class="py-str">${escapeHtml(str)}</span>`
    else if (num) out += `<span class="py-num">${escapeHtml(num)}</span>`
    else if (word) {
      const nextCh = text.slice(re.lastIndex).match(/^\s*(\S)/)
      const cls = PY_KW.has(word) ? 'py-kw' : (prevWord === 'def' || prevWord === 'class') ? 'py-def'
        : PY_BUILTIN.has(word) && nextCh && nextCh[1] === '(' ? 'py-bi' : nextCh && nextCh[1] === '(' ? 'py-fn' : null
      out += cls ? `<span class="${cls}">${escapeHtml(word)}</span>` : escapeHtml(word)
      prevWord = word
      continue
    } else out += escapeHtml(tok)
    if (!/^\s+$/.test(tok)) prevWord = ''
  }
  return out
}

function renderPython(content, info, L, env) {
  const a = parseAttrs(info)
  const text = content.replace(/\n$/, '')
  const fails = a._flags.includes('fails'), norun = a._flags.includes('norun')
  env.lastPython = { fails }
  const tag = fails ? `<span class="py-tag py-tag-fails">${L.pyFails}</span>` : norun ? `<span class="py-tag">${L.pyNorun}</span>` : ''
  return `<div class="pycode${fails ? ' pycode-fails' : ''}"><div class="pycode-bar"><span class="pycode-title">${L.python}</span>${tag}${fails ? '' : `<button type="button" class="copy-btn" data-copy="${escapeHtml(text)}">${L.copy}</button>`}</div><pre class="pycode-body"><code>${pyHighlight(text)}</code></pre></div>\n`
}

function renderOutput(content, L, env) {
  const isError = !!(env.lastPython && env.lastPython.fails)
  env.lastPython = null
  const text = content.replace(/\n$/, '')
  if (!text.trim()) env.errors.push('an output block is empty: run python3 -I tools/calc.py --update')
  return `<div class="pyout${isError ? ' pyout-error' : ''}"><div class="pyout-bar">${isError ? L.error : L.output}</div><pre class="pyout-body"><code>${escapeHtml(text)}</code></pre></div>\n`
}

// ---------- terminal (shell commands: installing Python and the packages) ----------
function renderTerminal(content, L) {
  const lines = content.replace(/\n$/, '').split('\n')
  const cmds = []
  const html = lines.map(ln => {
    const m = ln.match(/^(\$|PS>|>) (.*)$/)
    if (m) { cmds.push(m[2]); return `<span class="t-line"><span class="t-prompt">${escapeHtml(m[1])} </span><span class="t-cmd">${escapeHtml(m[2])}</span></span>` }
    return `<span class="t-out">${escapeHtml(ln)}</span>`
  }).join('')
  const copy = cmds.join('\n')
  return `<div class="term"><div class="term-bar"><span class="term-dots"><i></i><i></i><i></i></span><span class="term-title">${L.terminal}</span>${copy ? `<button type="button" class="copy-btn" data-copy="${escapeHtml(copy)}">${L.copy}</button>` : ''}</div><pre class="term-body"><code>${html}</code></pre></div>\n`
}

// ---------- value tables: the spec above "---", the rows calc.py computed below it ----------
export function parseValueTable(content) {
  const lines = content.replace(/\n$/, '').split('\n')
  const sep = lines.findIndex(l => l.trim() === '---')
  const spec = (sep >= 0 ? lines.slice(0, sep) : lines).filter(l => l.trim())
  const rows = sep >= 0 ? lines.slice(sep + 1).filter(l => l.trim()).map(l => l.split(' | ').map(c => c.trim())) : []
  const opts = {}
  for (const l of spec) { const m = l.match(/^\s*(digits|decimals|layout|sci)\s*=\s*(\S+)\s*$/); if (m) opts[m[1]] = m[2] }
  return { spec, rows, opts }
}

function renderValueTable(content, L, env) {
  const { rows, opts } = parseValueTable(content)
  if (rows.length < 2) {
    env.errors.push('a value table has not been computed: run python3 -I tools/calc.py --update')
    return `<div class="fig-missing">[value table not computed yet]</div>\n`
  }
  const cell = (c, th) => {
    const tag = th ? 'th' : 'td'
    const body = c === 'undefined' ? `<span class="vt-undef">${L.undefined}</span>` : tex(c, false, env)
    return `<${tag}>${body}</${tag}>`
  }
  let grid = rows
  if (opts.layout === 'columns') grid = rows[0].map((_, j) => rows.map(r => r[j]))
  const head = opts.layout === 'columns' ? '' : `<thead><tr>${grid[0].map(c => cell(c, true)).join('')}</tr></thead>`
  const bodyRows = (opts.layout === 'columns' ? grid : grid.slice(1))
    .map(r => `<tr>${r.map((c, j) => cell(c, opts.layout === 'columns' && j === 0)).join('')}</tr>`).join('')
  return `<div class="table-wrap vt${opts.layout === 'columns' ? ' vt-columns' : ''}"><table>${head}<tbody>${bodyRows}</tbody></table></div>\n`
}

// ---------- quiz ----------
function renderQuiz(md, body, env) {
  const qs = []
  let cur = null
  for (const raw of body.split(/\r?\n/)) {
    const line = raw.trimEnd()
    if (!line.trim()) continue
    let m
    if ((m = line.match(/^\?\s+(.*)$/))) { cur = { q: m[1], opts: [], answer: -1, expl: [] }; qs.push(cur); continue }
    if (!cur) { env.errors.push(`quiz: text before the first question: ${line.slice(0, 60)}`); continue }
    if ((m = line.match(/^\s*-\s+\[( |x|X)\]\s+(.*)$/))) {
      if (m[1].toLowerCase() === 'x') { if (cur.answer >= 0) env.errors.push(`quiz: two right answers in "${cur.q.slice(0, 50)}"`); cur.answer = cur.opts.length }
      cur.opts.push(m[2]); continue
    }
    if ((m = line.match(/^\s*>\s?(.*)$/))) { cur.expl.push(m[1]); continue }
    if (cur.expl.length) cur.expl.push(line.trim())
    else if (cur.opts.length) cur.opts[cur.opts.length - 1] += ' ' + line.trim()
    else cur.q += ' ' + line.trim()
  }
  qs.forEach((q, i) => {
    if (q.answer < 0) env.errors.push(`quiz: question ${i + 1} has no right answer`)
    if (!q.expl.length) env.errors.push(`quiz: question ${i + 1} has no explanation`)
  })
  env.counts.quiz += qs.length
  const inl = s => md.renderInline(s, env)
  let html = `<div class="quiz" data-n="${qs.length}">\n`
  qs.forEach((q, i) => {
    html += `<div class="quiz-q" data-answer="${q.answer}"><div class="quiz-stem"><span class="quiz-n">${i + 1}</span><div>${inl(q.q)}</div></div><ol class="quiz-opts" type="A">`
    q.opts.forEach((o, j) => { html += `<li><button type="button" class="quiz-opt" data-i="${j}">${inl(o)}</button></li>` })
    html += `</ol><div class="quiz-expl" hidden>${inl(q.expl.join(' '))}</div></div>\n`
  })
  html += `<div class="quiz-bar"><span class="quiz-score" aria-live="polite"></span><button type="button" class="quiz-reset">${env.L.quizReset}</button></div></div>\n`
  return html
}

// ---------- the renderer ----------
const CHECKABLE = new Set(['example', 'solution'])

export function makeMd({ lang = 'en', figDirs = [] } = {}) {
  const L = LABELS[lang]
  const md = new MarkdownIt({ html: true, linkify: false, typographer: true })
  md.disable(['replacements'])
  md.use(cjkFriendly)
  md.use(mathPlugin)
  md.core.ruler.before('inline', 'heading_ids', headingIds)

  md.renderer.rules.table_open = () => '<div class="table-wrap"><table>\n'
  md.renderer.rules.table_close = () => '</table></div>\n'
  const linkOpen = md.renderer.rules.link_open || ((t, i, o, e, s) => s.renderToken(t, i, o))
  md.renderer.rules.link_open = (toks, i, opts, env, self) => {
    const href = toks[i].attrGet('href') || ''
    if (/^https?:\/\//.test(href)) { toks[i].attrSet('target', '_blank'); toks[i].attrSet('rel', 'noopener') }
    return linkOpen(toks, i, opts, env, self)
  }

  md.renderer.rules.heading_open = (toks, i, opts, env) => {
    const t = toks[i]
    const id = t.attrGet('id')
    if (t.tag === 'h2' && !env.plainHeadings) {
      const title = toks[i + 1].content.trim()
      const n = env.sections.length + 1
      env.sections.push({ id: id || `sec-${n}`, title, n })
      return `<span class="section-anchor" id="${escapeHtml(id || `sec-${n}`)}"></span>\n<div class="section-header"><span class="section-num">${n}</span><h2>`
    }
    return `<${t.tag}${id ? ` id="${escapeHtml(id)}"` : ''}>`
  }
  md.renderer.rules.heading_close = (toks, i, opts, env) =>
    toks[i].tag === 'h2' && !env.plainHeadings ? '</h2></div>\n' : `</${toks[i].tag}>\n`

  md.renderer.rules.fence = (toks, i, opts, env) => {
    const t = toks[i]
    const info = (t.info || '').trim()
    const kind = info.split(/\s+/)[0] || ''
    if (kind !== 'output') env.lastPython = kind === 'python' ? env.lastPython : null
    if (kind === 'quiz') return renderQuiz(md, t.content, env)
    if (kind === 'python') { env.counts.python++; return renderPython(t.content, info, L, env) }
    if (kind === 'output') { env.counts.output++; return renderOutput(t.content, L, env) }
    if (kind === 'check') {
      env.counts.check++
      const box = [...env.stack].reverse().find(b => CHECKABLE.has(b.kind))
      if (box && box.slot !== undefined) env.checkedSlots.add(box.slot)
      return ''
    }
    if (kind === 'valuetable') { env.counts.valuetable++; return renderValueTable(t.content, L, env) }
    if (kind === 'terminal') { env.counts.terminal++; return renderTerminal(t.content, L) }
    return `<pre class="code"><code${kind ? ` class="language-${escapeHtml(kind)}"` : ''}>${escapeHtml(t.content)}</code></pre>\n`
  }

  const KINDS = ['note', 'tip', 'pitfall', 'keyidea', 'analogy', 'definition', 'theorem', 'example', 'proof', 'deeper', 'compute',
    'trouble', 'exercise', 'solution', 'tabs', 'tab', 'figure', 'widget']
  for (const kind of KINDS) {
    md.use(container, kind, {
      validate: params => params.trim().split(/\s+/)[0] === kind,
      render: (toks, i, opts, env) => {
        const t = toks[i]
        if (t.nesting === 1) {
          const a = parseAttrs(t.info)
          const entry = { kind, a }
          env.stack.push(entry)
          return openContainer(md, kind, a, L, env, figDirs, toks, i, entry)
        }
        const top = env.stack.pop() || { kind, a: {} }
        return closeContainer(top.kind, env)
      },
    })
  }
  return md
}

// Placeholders for the "Checked" badge are filled in once the whole page is rendered.
export function finish(html, env) {
  return html.replace(/<!--CHK(\d+)-->/g, (_, n) => env.checkedSlots.has(Number(n))
    ? `<span class="chk" title="${escapeHtml(env.L.checkedTitle)}">&#10003; ${env.L.checked}</span>` : '')
}

// Width and height of a figure (px) from its SVG, so the page does not jump while images load.
function figureSize(id, figDirs) {
  for (const d of figDirs) {
    const p = path.join(d, `${id}.svg`)
    if (!fs.existsSync(p)) continue
    const head = fs.readFileSync(p, 'utf8').slice(0, 2000)
    const w = head.match(/<svg[^>]*\swidth="([\d.]+)(px)?"/), h = head.match(/<svg[^>]*\sheight="([\d.]+)(px)?"/)
    return { file: p, w: w ? Math.round(Number(w[1])) : null, h: h ? Math.round(Number(h[1])) : null }
  }
  return null
}

// The plain text of a container's content (for a figure's alt text).
function plainContent(toks, i) {
  let depth = 0, out = []
  for (let j = i; j < toks.length; j++) {
    if (toks[j].type.startsWith('container_') && toks[j].type.endsWith('_open')) depth++
    if (toks[j].type.startsWith('container_') && toks[j].type.endsWith('_close')) { depth--; if (depth === 0) break }
    if (toks[j].type === 'inline') out.push(toks[j].content)
  }
  return out.join(' ').replace(/\$([^$]*)\$/g, '$1').replace(/[*_`\\]/g, '').replace(/\s+/g, ' ').trim()
}

const OS_KEYS = { windows: 'windows', macos: 'mac', mac: 'mac', linux: 'linux' }

function titleOf(a) { return a._flags.filter(f => !/^★+$/.test(f) && f !== 'nocheck').join(' ') }

function openContainer(md, kind, a, L, env, figDirs, toks, i, entry) {
  const inl = s => md.renderInline(s || '', env)
  const no = n => (env.moduleNo ? `${env.moduleNo}.` : '') + n
  const slot = () => { entry.slot = env.slotCount++; entry.nocheck = a._flags.includes('nocheck'); return `<!--CHK${entry.slot}-->` }
  switch (kind) {
    case 'note': case 'tip': case 'pitfall': case 'keyidea': case 'analogy':
      return `<div class="callout ${kind}"><div class="callout-label">${L[kind]}</div>\n`
    case 'definition': case 'theorem': case 'example': {
      const n = ++env.counts[kind]
      const title = titleOf(a)
      const badge = kind === 'example' ? slot() : ''
      return `<div class="box box-${kind}"${a.id ? ` id="${escapeHtml(a.id)}"` : ''}><div class="box-label">${L[kind]} ${no(n)}${title ? `<span class="box-title">${inl(title)}</span>` : ''}${badge}</div>\n`
    }
    case 'proof': {
      env.counts.proof++
      const title = titleOf(a)
      return `<div class="proof"><div class="proof-label">${L.proof}${title ? ` ${inl(title)}` : ''}</div>\n`
    }
    case 'deeper': case 'compute': {
      env.counts[kind]++
      const title = titleOf(a)
      return `<div class="box box-${kind}"><div class="box-label">${L[kind]}${title ? `<span class="box-title">${inl(title)}</span>` : ''}</div>\n`
    }
    case 'trouble':
      env.counts.trouble++
      return `<details class="trouble"><summary>${L.trouble}</summary><div class="details-body">\n`
    case 'exercise': {
      const n = ++env.counts.exercise
      const stars = (a._flags.find(f => /^★+$/.test(f)) || '')
      env.exercises.push({ id: a.id, stars: stars.length })
      return `<div class="exercise"${a.id ? ` id="${escapeHtml(a.id)}"` : ''}><div class="ex-label"><span class="ex-num">${L.exercise} ${no(n)}</span>${stars ? `<span class="ex-stars" title="${stars.length}">${stars}</span>` : ''}<span class="ex-title">${inl(titleOf(a))}</span></div>\n`
    }
    case 'solution':
      env.counts.solution++
      return `<details class="solution"><summary>${L.solution}${slot()}</summary><div class="details-body">\n`
    case 'tabs':
      env.tabGroup = (env.tabGroup || 0) + 1
      return `<div class="tabs" data-group="${env.tabGroup}"><div class="tab-buttons" role="tablist"></div>\n`
    case 'tab': {
      const name = a._flags.join(' ')
      const key = OS_KEYS[name.toLowerCase()] || name.toLowerCase()
      return `<div class="tab-panel" role="tabpanel" data-tab="${escapeHtml(key)}" data-label="${escapeHtml(name)}">\n`
    }
    case 'figure': {
      env.counts.figure++
      env.figures.push(a.id)
      const num = env.figures.length
      const alt = a.alt || plainContent(toks, i)
      let body
      if (a.image) body = `<div class="fig-photo"><img src="assets/${escapeHtml(a.image)}" alt="${escapeHtml(alt)}" loading="lazy"></div>`
      else {
        const s = figureSize(a.id, figDirs)
        if (!s) { env.missingFigures.push(a.id); body = `<div class="fig-missing">[figure ${escapeHtml(a.id)} not drawn yet]</div>` }
        else body = `<div class="fig-img"><img src="figures/${escapeHtml(a.id)}.svg" alt="${escapeHtml(alt)}"${s.w ? ` width="${s.w}" height="${s.h}"` : ''} loading="lazy"></div>`
      }
      return `<figure class="fig"${a.id ? ` id="${escapeHtml(a.id)}"` : ''}>${body}<figcaption><span class="fig-num">${L.figure} ${no(num)}</span> `
    }
    case 'widget': {
      env.counts.widget++
      env.widgets.push(a.name)
      return `<div class="widget-wrap"><div class="widget-label">${L.interactive}</div><div class="widget" data-widget="${escapeHtml(a.name || '')}"></div><div class="widget-caption">\n`
    }
  }
  return '<div>'
}

function closeContainer(kind) {
  switch (kind) {
    case 'trouble': case 'solution': return '</div></details>\n'
    case 'figure': return '</figcaption></figure>\n'
    case 'widget': return '</div></div>\n'
    case 'proof': return '<span class="qed" aria-label="end of proof">&#8718;</span></div>\n'
    default: return '</div>\n'
  }
}

export function newEnv(lang = 'en') {
  return {
    L: LABELS[lang], sections: [], errors: [], missingFigures: [], figures: [], widgets: [], exercises: [], stack: [],
    slotCount: 0, checkedSlots: new Set(), lastPython: null,
    counts: { quiz: 0, python: 0, output: 0, check: 0, valuetable: 0, terminal: 0, figure: 0, widget: 0, trouble: 0,
      definition: 0, theorem: 0, example: 0, proof: 0, deeper: 0, compute: 0, exercise: 0, solution: 0 },
  }
}
