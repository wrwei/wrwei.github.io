// The Markdown dialect of the Formal Methods with Isabelle series (PLAN.md, section 5).
// One renderer for the build and the checks. The quiz format, attribute parsing, containers and
// figures follow the Git series' tools/md.mjs.
//
//   ## Title {#id}            numbered section with that anchor
//   $...$  $$...$$            mathematics (KaTeX, rendered at build time)
//   ```isabelle [fails|norun] Isabelle text (checked by tools/isa.py)
//   ```output [state|result|all]   what Isabelle printed for the block above
//   ```prooftree              natural-deduction tree (indented premises)
//   ```truthtable             truth table computed from a formula
//   ```quiz                   end-of-module quiz
//   ::: definition|example|fact TITLE    numbered boxes
//   ::: note|tip|pitfall|keyidea|analogy  callouts
//   ::: isabelle              "Check it in Isabelle" box
//   ::: trouble               collapsed "If something went wrong" box
//   :::: exercise TITLE {#id} ★★   with a ::: solution inside (folded)
//   :::: tabs / ::: tab NAME   operating-system tabs
//   ::: figure id=fig-NN-k    SVG figure;  ::: widget name=...  interactive widget
import MarkdownIt from 'markdown-it'
import container from 'markdown-it-container'
import cjkFriendly from 'markdown-it-cjk-friendly'
import katex from 'katex'
import fs from 'node:fs'
import path from 'node:path'

export const LABELS = {
  en: {
    note: 'Good to know', tip: 'Tip', pitfall: 'Watch out', keyidea: 'Key idea', analogy: 'Think of it like this',
    definition: 'Definition', example: 'Example', fact: 'Fact', isabelle: 'Check it in Isabelle',
    exercise: 'Exercise', solution: 'Show solution', figure: 'Figure', interactive: 'Try it',
    trouble: 'If something went wrong', copy: 'Copy', copied: 'Copied', quizReset: 'Try again',
    terminal: 'Terminal', isaTitle: 'Isabelle', isaFails: 'fails on purpose', isaNorun: 'not checked', output: 'Output',
    varies: 'one run; yours may differ',
    tt: { tautology: 'Tautology: true in every row.', contradiction: 'Contradiction: false in every row.',
      satisfiable: n => `Satisfiable but not valid: true in ${n}.`, row: r => r === 1 ? '1 row' : `${r} rows` },
  },
  zh: {
    note: '须知', tip: '提示', pitfall: '注意', keyidea: '要点', analogy: '打个比方',
    definition: '定义', example: '例', fact: '事实', isabelle: '在 Isabelle 中检验',
    exercise: '练习', solution: '查看解答', figure: '图', interactive: '动手试试',
    trouble: '如果出了问题', copy: '复制', copied: '已复制', quizReset: '重新作答',
    terminal: '终端', isaTitle: 'Isabelle', isaFails: '故意出错的例子', isaNorun: '未检查', output: '输出',
    varies: '某一次运行的结果，你的可能不同',
    tt: { tautology: '重言式：每一行都为真。', contradiction: '矛盾式：每一行都为假。',
      satisfiable: n => `可满足但非有效：${n}为真。`, row: r => `${r} 行` },
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
  '\\imp': '\\longrightarrow', '\\iff': '\\longleftrightarrow', '\\Imp': '\\Longrightarrow',
  '\\N': '\\mathbb{N}', '\\Z': '\\mathbb{Z}', '\\R': '\\mathbb{R}', '\\pow': '\\mathcal{P}',
}

function tex(src, display, env) {
  try {
    return katex.renderToString(src, { displayMode: display, throwOnError: true, macros: { ...KATEX_MACROS }, strict: 'ignore' })
  } catch (e) {
    env.errors.push(`math: ${e.message.split('\n')[0]} in $${src.slice(0, 60)}$`)
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
    if (!silent) {
      const tok = state.push('math_inline', 'math', 0)
      tok.content = s.slice(start + 1, end)
    }
    state.pos = end + 1
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
  md.renderer.rules.math_inline = (toks, i, opts, env) => tex(toks[i].content, false, env)
  md.renderer.rules.math_block = (toks, i, opts, env) => `<div class="math-display">${tex(toks[i].content, true, env)}</div>\n`
}

// ---------- Isabelle text ----------
const ISA_CMD = new Set(('theory begin end lemma theorem corollary proposition schematic_goal definition abbreviation fun function ' +
  'primrec datatype codatatype type_synonym typedecl record inductive inductive_set coinductive value term typ thm prop ' +
  'find_theorems find_consts print_theorems declare locale interpretation context instantiation instance class consts ' +
  'axiomatization lemmas named_theorems notation no_notation export_code text section subsection subsubsection paragraph ' +
  'txt nitpick quickcheck sledgehammer try try0 inductive_cases fun_cases termination notepad hide_const').split(' '))
const ISA_PROOF = new Set(('proof qed by apply done oops sorry next have show hence thus then from with using unfolding assume ' +
  'fix obtain moreover ultimately also finally note let case presume subgoal defer prefer back consider').split(' '))
const ISA_MINOR = new Set('imports where for and if assumes shows fixes obtains is defines includes when in arbitrary rule'.split(' '))

export function isaHighlight(text) {
  let out = ''
  let i = 0
  const n = text.length
  while (i < n) {
    const c = text[i]
    if (c === '(' && text[i + 1] === '*') {               // comment
      let depth = 0, j = i
      for (; j < n; j++) {
        if (text[j] === '(' && text[j + 1] === '*') { depth++; j++ } else if (text[j] === '*' && text[j + 1] === ')') { depth--; j++; if (!depth) { j++; break } }
      }
      out += `<span class="isa-comment">${escapeHtml(text.slice(i, j))}</span>`; i = j; continue
    }
    if (c === '"') {                                      // inner syntax in quotes
      let j = i + 1
      while (j < n && text[j] !== '"') j += text[j] === '\\' ? 2 : 1
      out += `<span class="isa-inner">${escapeHtml(text.slice(i, j + 1))}</span>`; i = j + 1; continue
    }
    if (c === '‹') {                                      // cartouche
      let depth = 0, j = i
      for (; j < n; j++) { if (text[j] === '‹') depth++; else if (text[j] === '›') { depth--; if (!depth) { j++; break } } }
      out += `<span class="isa-cartouche">${escapeHtml(text.slice(i, j))}</span>`; i = j; continue
    }
    const w = text.slice(i).match(/^[A-Za-z_][\w']*(?:\.[\w']+)*/)
    if (w && (i === 0 || !/[\w']/.test(text[i - 1]))) {
      const word = w[0]
      const cls = ISA_CMD.has(word) ? 'isa-cmd' : ISA_PROOF.has(word) ? 'isa-proof' : ISA_MINOR.has(word) ? 'isa-minor' : ''
      out += cls ? `<span class="${cls}">${escapeHtml(word)}</span>` : escapeHtml(word)
      i += word.length; continue
    }
    out += escapeHtml(c); i++
  }
  return subscripts(out)
}

// Isabelle's ⇩x (subscript) as HTML
function subscripts(html) { return html.replace(/⇩(\w)/g, '<sub>$1</sub>').replace(/⇧([^\s<])/g, '<sup>$1</sup>') }

function renderIsabelle(content, info, L) {
  const a = parseAttrs(info)
  const text = content.replace(/\n$/, '')
  const fails = a._flags.includes('fails'), norun = a._flags.includes('norun')
  const tag = fails ? `<span class="isa-tag isa-tag-fails">${L.isaFails}</span>` : norun ? `<span class="isa-tag">${L.isaNorun}</span>` : ''
  return `<div class="isa${fails ? ' isa-fails' : ''}"><div class="isa-bar"><span class="isa-title">${L.isaTitle}</span>${tag}${fails ? '' : `<button type="button" class="copy-btn" data-copy="${escapeHtml(text)}">${L.copy}</button>`}</div><pre class="isa-body"><code>${isaHighlight(text)}</code></pre></div>\n`
}

function renderOutput(content, L, varies) {
  const lines = content.replace(/\n$/, '').split('\n')
  let html = '', cls = null, buf = []
  const flush = () => { if (buf.length) html += cls ? `<span class="${cls}">${buf.join('\n')}</span>\n` : buf.join('\n') + '\n'; buf = [] }
  for (const ln of lines) {
    const k = ln.startsWith('*** ') || ln === '***' ? 'isa-error' : ln.startsWith('### ') || ln === '###' ? 'isa-warning' : null
    const text = k ? ln.slice(4) : ln
    if (k !== cls) { flush(); cls = k }
    buf.push(subscripts(escapeHtml(text)))
  }
  flush()
  return `<div class="isa-output${varies ? ' varies' : ''}"><div class="isa-output-bar">${L.output}${varies ? `<span class="isa-varies">${L.varies}</span>` : ''}</div><pre class="isa-output-body"><code>${html.replace(/\n$/, '')}</code></pre></div>\n`
}

// ---------- terminal (shell commands: installing Isabelle, building theories) ----------
function renderTerminal(content, L) {
  const lines = content.replace(/\n$/, '').split('\n')
  const cmds = []
  const html = lines.map(ln => {
    if (ln.startsWith('$ ')) { cmds.push(ln.slice(2)); return `<span class="t-line"><span class="t-prompt">$ </span><span class="t-cmd">${escapeHtml(ln.slice(2))}</span></span>` }
    return `<span class="t-out">${escapeHtml(ln)}</span>`
  }).join('')
  const copy = cmds.join('\n')
  return `<div class="term"><div class="term-bar"><span class="term-dots"><i></i><i></i><i></i></span><span class="term-title">${L.terminal}</span>${copy ? `<button type="button" class="copy-btn" data-copy="${escapeHtml(copy)}">${L.copy}</button>` : ''}</div><pre class="term-body"><code>${html}</code></pre></div>\n`
}

// ---------- natural-deduction trees ----------
function renderProofTree(content, env) {
  const rows = content.replace(/\n$/, '').split('\n').filter(l => l.trim())
  const root = { children: [], indent: -1 }
  const stack = [root]
  for (const raw of rows) {
    const indent = raw.match(/^ */)[0].length
    const m = raw.trim().match(/^(.*?)(?:\s{2,}\(([^()]*)\))?$/)
    const node = { formula: m[1], rule: m[2] || '', children: [], indent }
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop()
    stack[stack.length - 1].children.push(node)
    stack.push(node)
  }
  if (root.children.length !== 1) env.errors.push('prooftree: expected exactly one conclusion at the top')
  const draw = (n, last = true) => {
    const f = `<span class="pt-f">${escapeHtml(n.formula)}</span>`
    if (!n.children.length && !n.rule) return `<div class="pt-node pt-leaf">${f}</div>`
    const prem = n.children.length ? `<div class="pt-prem">${n.children.map((c, i) => draw(c, i === n.children.length - 1)).join('')}</div>` : '<div class="pt-prem pt-axiom"></div>'
    // The rule name hangs to the right of the bar. Reserve room for it where it could run into a premise
    // to its right (about 0.5rem per character at the label's font size, plus the gap), and at the root so
    // that it stays inside the box; the last premise's label has free space beside its parent's bar.
    const room = n.rule && (!last || n === root.children[0]) ? ` style="margin-right:${(0.6 + [...n.rule].length * 0.5).toFixed(1)}rem"` : ''
    return `<div class="pt-node"${room}>${prem}<div class="pt-bar"><span class="pt-rule">${escapeHtml(n.rule)}</span></div><div class="pt-concl">${f}</div></div>`
  }
  return `<div class="prooftree"><div class="pt-scroll">${root.children.map(draw).join('')}</div></div>\n`
}

// ---------- truth tables ----------
// Formulas: atoms (identifiers), True, False, ¬ ∧ ∨ ⟶ ⟷ and parentheses; ASCII ~ & | --> <-> too.
// Precedence as in Isabelle, strongest first: ¬, ∧, ∨, then ⟶ and ⟷ (equal); binary connectives group to the right.
export function parseFormula(src) {
  const toks = []
  const re = /\s*(⟷|<->|⟶|-->|∧|&|∨|\||¬|~|\(|\)|True|False|[A-Za-z][\w']*)/y
  let m, pos = 0
  while (pos < src.length) {
    re.lastIndex = pos
    if (!(m = re.exec(src))) { if (/^\s*$/.test(src.slice(pos))) break; throw new Error(`cannot read "${src.slice(pos, pos + 10)}"`) }
    const t = { '<->': '⟷', '-->': '⟶', '&': '∧', '|': '∨', '~': '¬' }[m[1]] || m[1]
    toks.push(t); pos = re.lastIndex
  }
  let k = 0
  const peek = () => toks[k], eat = t => { if (toks[k] !== t) throw new Error(`expected ${t}`); k++ }
  // Isabelle's priorities: ¬ 40, ∧ 35, ∨ 30, ⟶ and ⟷ both 25; all binary ones group to the right.
  const bin = (next, ...ops) => function self() { const l = next(); const op = peek(); if (ops.includes(op)) { k++; return { op, l, r: self() } } return l }
  const atom = () => {
    const t = toks[k++]
    if (t === '¬') return { op: '¬', l: atom() }
    if (t === '(') { const e = top(); eat(')'); return e }
    if (t === 'True' || t === 'False') return { op: 'const', v: t === 'True' }
    if (t && /^[A-Za-z]/.test(t)) return { op: 'var', name: t }
    throw new Error(`unexpected ${t || 'end of formula'}`)
  }
  const and = bin(atom, '∧'), or = bin(and, '∨'), top = bin(or, '⟶', '⟷')
  const f = top()
  if (k !== toks.length) throw new Error(`unexpected ${toks[k]}`)
  return f
}
export function evalFormula(f, v) {
  switch (f.op) {
    case 'var': return v[f.name]
    case 'const': return f.v
    case '¬': return !evalFormula(f.l, v)
    case '∧': return evalFormula(f.l, v) && evalFormula(f.r, v)
    case '∨': return evalFormula(f.l, v) || evalFormula(f.r, v)
    case '⟶': return !evalFormula(f.l, v) || evalFormula(f.r, v)
    case '⟷': return evalFormula(f.l, v) === evalFormula(f.r, v)
  }
}
export function atomsOf(f, acc = new Set()) {
  if (f.op === 'var') acc.add(f.name)
  if (f.l) atomsOf(f.l, acc)
  if (f.r) atomsOf(f.r, acc)
  return acc
}

function renderTruthTable(content, L, env) {
  const lines = content.replace(/\n$/, '').split('\n').map(l => l.trim()).filter(Boolean)
  let main, cols
  try {
    main = parseFormula(lines[0])
    cols = lines.slice(1).map(s => ({ src: s, f: parseFormula(s) }))
  } catch (e) { env.errors.push(`truthtable: ${e.message} in "${lines[0]}"`); return '' }
  const atoms = [...atomsOf(main)].sort()
  const rows = []
  for (let r = 0; r < 2 ** atoms.length; r++) {
    const v = {}
    atoms.forEach((a, i) => { v[a] = !((r >> (atoms.length - 1 - i)) & 1) })   // first row: all true
    rows.push({ v, cols: cols.map(c => evalFormula(c.f, v)), main: evalFormula(main, v) })
  }
  const T = b => `<td class="${b ? 'tt-t' : 'tt-f'}">${b ? 'T' : 'F'}</td>`
  const nTrue = rows.filter(r => r.main).length
  const verdict = nTrue === rows.length ? L.tt.tautology : nTrue === 0 ? L.tt.contradiction : L.tt.satisfiable(L.tt.row(nTrue))
  const head = atoms.map(a => `<th class="tt-atom">${escapeHtml(a)}</th>`).join('') + cols.map(c => `<th>${escapeHtml(c.src)}</th>`).join('') + `<th class="tt-main">${escapeHtml(lines[0])}</th>`
  const body = rows.map(r => `<tr>${atoms.map(a => T(r.v[a])).join('')}${r.cols.map(T).join('')}${T(r.main).replace('<td class="', '<td class="tt-main ')}</tr>`).join('')
  return `<div class="truthtable"><div class="table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div><p class="tt-verdict">${verdict}</p></div>\n`
}

// ---------- quiz fence ----------
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
    if (kind === 'quiz') return renderQuiz(md, t.content, env)
    if (kind === 'isabelle') { env.counts.isabelle++; return renderIsabelle(t.content, info, L) }
    if (kind === 'output') { env.counts.output++; return renderOutput(t.content, L, /\bvaries\b/.test(info)) }
    if (kind === 'prooftree') { env.counts.prooftree++; return renderProofTree(t.content, env) }
    if (kind === 'terminal') { env.counts.terminal = (env.counts.terminal || 0) + 1; return renderTerminal(t.content, L) }
    if (kind === 'truthtable') { env.counts.truthtable++; return renderTruthTable(t.content, L, env) }
    return `<pre class="code"><code${kind ? ` class="language-${escapeHtml(kind)}"` : ''}>${escapeHtml(t.content)}</code></pre>\n`
  }

  const KINDS = ['note', 'tip', 'pitfall', 'keyidea', 'analogy', 'definition', 'example', 'fact', 'isabelle', 'trouble',
    'exercise', 'solution', 'tabs', 'tab', 'figure', 'widget']
  for (const kind of KINDS) {
    md.use(container, kind, {
      validate: params => params.trim().split(/\s+/)[0] === kind,
      render: (toks, i, opts, env) => {
        const t = toks[i]
        if (t.nesting === 1) {
          const a = parseAttrs(t.info)
          env.stack.push({ kind, a })
          return openContainer(md, kind, a, L, env, figDirs)
        }
        const top = env.stack.pop() || { kind, a: {} }
        return closeContainer(top.kind, env)
      },
    })
  }
  return md
}

function readFigure(id, figDirs, env) {
  for (const d of figDirs) {
    const p = path.join(d, `${id}.svg`)
    if (fs.existsSync(p)) {
      let svg = fs.readFileSync(p, 'utf8').replace(/<\?xml[^>]*\?>\s*/, '').replace(/<!DOCTYPE[^>]*>\s*/i, '')
      for (const sid of new Set([...svg.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]))) {
        const nid = `${id}__${sid}`
        svg = svg.split(`id="${sid}"`).join(`id="${nid}"`).split(`url(#${sid})`).join(`url(#${nid})`).split(`href="#${sid}"`).join(`href="#${nid}"`)
      }
      return svg
    }
  }
  env.missingFigures.push(id)
  return `<div class="fig-missing">[figure ${escapeHtml(id)} not drawn yet]</div>`
}

const OS_KEYS = { windows: 'windows', macos: 'mac', mac: 'mac', linux: 'linux' }

function titleOf(a) { return a._flags.filter(f => !/^★+$/.test(f)).join(' ') }

function openContainer(md, kind, a, L, env, figDirs) {
  const inl = s => md.renderInline(s || '', env)
  const no = n => (env.moduleNo ? `${env.moduleNo}.` : '') + n
  switch (kind) {
    case 'note': case 'tip': case 'pitfall': case 'keyidea': case 'analogy':
      return `<div class="callout ${kind}"><div class="callout-label">${L[kind]}</div>\n`
    case 'definition': case 'example': case 'fact': {
      const n = ++env.counts[kind]
      const title = titleOf(a)
      return `<div class="box box-${kind}"${a.id ? ` id="${escapeHtml(a.id)}"` : ''}><div class="box-label">${L[kind]} ${no(n)}${title ? `<span class="box-title">${inl(title)}</span>` : ''}</div>\n`
    }
    case 'isabelle':
      return `<div class="box box-isabelle"><div class="box-label">${L.isabelle}</div>\n`
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
      return `<details class="solution"><summary>${L.solution}</summary><div class="details-body">\n`
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
      const img = a.image ? `<img src="assets/${escapeHtml(a.image)}" alt="${escapeHtml(a.alt || '')}" loading="lazy">` : ''
      const body = a.image ? `<div class="fig-photo">${img}</div>` : `<div class="fig-svg">${readFigure(a.id, figDirs, env)}</div>`
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
    default: return '</div>\n'
  }
}

export function newEnv(lang = 'en') {
  return {
    L: LABELS[lang], sections: [], errors: [], missingFigures: [], figures: [], widgets: [], exercises: [], stack: [],
    counts: { quiz: 0, isabelle: 0, output: 0, prooftree: 0, truthtable: 0, figure: 0, widget: 0, trouble: 0,
      definition: 0, example: 0, fact: 0, exercise: 0, solution: 0 },
  }
}
