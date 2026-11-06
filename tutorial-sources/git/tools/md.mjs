// The Markdown dialect of the Git series (PLAN.md, section 5). One renderer for build and checks.
// The quiz format, attribute parsing and containers follow the AI series' tools/md.mjs.
//
//   ## Title {#id}          numbered section with that anchor
//   ```terminal [norun]     "$ command" lines and their output, coloured as Git colours them
//   ```file NAME [check]    a whole file; lines that changed since the previous version are marked
//   ```quiz                 end-of-lesson quiz
//   ::: note|tip|pitfall|keyidea|analogy   callouts
//   ::: where github|vscode|browser        steps done outside the terminal
//   ::: trouble             collapsed "If something went wrong" box
//   :::: tabs / ::: tab NAME              operating-system tabs
//   ::: check / ::: answer  quick question
//   ::: figure id=fig-NN-k  SVG figure;  ::: widget name=...  interactive demo
import MarkdownIt from 'markdown-it'
import container from 'markdown-it-container'
import cjkFriendly from 'markdown-it-cjk-friendly'
import hljs from 'highlight.js'
import fs from 'node:fs'
import path from 'node:path'

export const LABELS = {
  en: {
    note: 'Good to know', tip: 'Tip', pitfall: 'Watch out', keyidea: 'Key idea', analogy: 'Think of it like this',
    check: 'Check your understanding', answer: 'Show answer', figure: 'Figure', interactive: 'Try it',
    trouble: 'If something went wrong', copy: 'Copy', copied: 'Copied',
    where: { github: 'On GitHub', vscode: 'In VS Code', browser: 'In your browser' },
    terminal: 'Terminal', changed: 'highlighted: the lines to add or change', conflict: 'as Git left it',
    quizReset: 'Try again',
  },
  zh: {
    note: '须知', tip: '提示', pitfall: '注意', keyidea: '要点', analogy: '打个比方',
    check: '检验理解', answer: '查看答案', figure: '图', interactive: '动手试试',
    trouble: '如果出了问题', copy: '复制', copied: '已复制',
    where: { github: '在 GitHub 上', vscode: '在 VS Code 中', browser: '在浏览器中' },
    terminal: '终端', changed: '高亮：需要添加或修改的行', conflict: 'Git 留下的样子',
    quizReset: '重新作答',
  },
}

export function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// key=value key="value with spaces" #id flag
export function parseAttrs(info) {
  const out = { _kind: '', _flags: [] }
  const re = /(\w[\w-]*)="([^"]*)"|(\w[\w-]*)=(\S+)|#([\w-]+)|(\S+)/g
  let m, first = true
  while ((m = re.exec(info.trim()))) {
    if (first && m[6] !== undefined) { out._kind = m[6]; first = false; continue }
    first = false
    if (m[1]) out[m[1]] = m[2]
    else if (m[3]) out[m[3]] = m[4]
    else if (m[5]) out.id = m[5]
    else if (m[6]) out._flags.push(m[6])
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

// ---------- terminal blocks ----------
// Colours follow Git's defaults: status sections, diff lines, hashes and branch labels.
function decorate(s) {
  // "(HEAD -> main, origin/main, tag: v1)" after a hash
  return s.replace(/\(([^()]*(?:HEAD|main|origin\/)[^()]*)\)/, (all, inner) => {
    const parts = inner.split(', ').map(p => {
      if (p.startsWith('HEAD -> ')) return `<span class="t-head">HEAD -&gt; </span><span class="t-branch">${escapeHtml(p.slice(8))}</span>`
      if (p === 'HEAD') return '<span class="t-head">HEAD</span>'
      if (p.startsWith('tag: ')) return `<span class="t-tag">${escapeHtml(p)}</span>`
      if (p.includes('/')) return `<span class="t-remote">${escapeHtml(p)}</span>`
      return `<span class="t-branch">${escapeHtml(p)}</span>`
    })
    return `<span class="t-hash">(</span>${parts.join('<span class="t-hash">, </span>')}<span class="t-hash">)</span>`
  })
}

function colourOutput(cmd, lines) {
  // `git commit` with nothing staged, and other commands, print the same sections as `git status`
  const isStatus = /^git status\b/.test(cmd) || lines.some(l => /^(Changes to be committed|Changes not staged for commit|Untracked files|Unmerged paths):/.test(l))
  const isDiff = /^git (diff|show|log -p)\b/.test(cmd)
  const isLog = /^git (log|reflog)\b/.test(cmd)
  let section = ''
  let inDiff = false
  return lines.map(raw => {
    const e = escapeHtml(raw)
    if (/^hint:/.test(raw)) return `<span class="t-hint">${e}</span>`
    if (/^ ! \[rejected\]/.test(raw) || /^ ! \[remote rejected\]/.test(raw)) return `<span class="t-bad">${e}</span>`
    if (isStatus) {
      if (/^Changes to be committed:/.test(raw)) section = 'good'
      else if (/^(Changes not staged for commit|Untracked files|Unmerged paths):/.test(raw)) section = 'bad'
      else if (/^\S/.test(raw)) section = ''
      if (/^\t/.test(raw) && section) return `<span class="t-${section}">${e}</span>`
      return e
    }
    if (isDiff || /^diff --git /.test(raw)) {
      if (/^diff --git /.test(raw)) inDiff = true
      if (inDiff) {
        if (/^(diff --git|index |--- |\+\+\+ )/.test(raw)) return `<span class="t-meta">${e}</span>`
        if (/^@@/.test(raw)) return `<span class="t-hunk">${e}</span>`
        if (/^\+/.test(raw)) return `<span class="t-good">${e}</span>`
        if (/^-/.test(raw)) return `<span class="t-bad">${e}</span>`
      }
    }
    if (isLog || /^git (show|clone)\b/.test(cmd)) {
      let m
      if ((m = raw.match(/^commit ([0-9a-f]{7,40})(.*)$/))) return `<span class="t-hash">commit ${m[1]}</span>${decorate(escapeHtml(m[2]))}`
      // --oneline, optionally after --graph characters
      if ((m = raw.match(/^([*|\\/ ]*)([0-9a-f]{7,12})( .*)$/)) && isLog) return `${escapeHtml(m[1])}<span class="t-hash">${m[2]}</span>${decorate(escapeHtml(m[3]))}`
    }
    return e
  }).join('\n')
}

export function renderTerminal(content, info, L) {
  const lines = content.replace(/\n$/, '').split('\n')
  let html = ''
  let cmd = ''
  let out = []
  const cmds = []
  const flush = () => {
    if (out.length) html += `<span class="t-out">${colourOutput(cmd, out)}</span>`
    out = []
  }
  for (const ln of lines) {
    if (ln === '$' || ln.startsWith('$ ')) {
      flush()
      cmd = ln.slice(2)
      cmds.push(cmd)
      html += `<span class="t-line"><span class="t-prompt">$ </span><span class="t-cmd">${escapeHtml(cmd)}</span></span>`
    } else if (/^\S+@\S+.*(?:[$%#])\s*$|^\S+@\S+\s+MINGW64/.test(ln) && !cmds.length) {
      // a prompt shown as an example (Lesson 2)
      html += `<span class="t-example">${escapeHtml(ln)}</span>`
    } else out.push(ln)
  }
  flush()
  // nocopy: commands the reader must type with their own details (Lesson 2's name and email)
  const copy = /\bnocopy\b/.test(info) ? '' : cmds.filter(Boolean).join('\n')
  const norun = /\bnorun\b/.test(info)
  return `<div class="term"${norun ? ' data-norun' : ''}><div class="term-bar"><span class="term-dots"><i></i><i></i><i></i></span><span class="term-title">${L.terminal}</span>${copy ? `<button type="button" class="copy-btn" data-copy="${escapeHtml(copy)}">${L.copy}</button>` : ''}</div><pre class="term-body"><code>${html}</code></pre></div>\n`
}

// ---------- file blocks ----------
const LANG = { html: 'xml', htm: 'xml', css: 'css', md: 'markdown', js: 'javascript', json: 'json', txt: 'plaintext' }

// Lines of `next` that are new or changed compared with `prev` (longest common subsequence).
export function changedLines(prev, next) {
  if (prev == null) return new Set()
  const a = prev.replace(/\n$/, '').split('\n'), b = next.replace(/\n$/, '').split('\n')
  const n = a.length, m = b.length
  const L = Array.from({ length: n + 1 }, () => new Int32Array(m + 1))
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--)
    L[i][j] = a[i] === b[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1])
  const keep = new Set()
  let i = 0, j = 0
  while (i < n && j < m) {
    if (a[i] === b[j]) { keep.add(j); i++; j++ } else if (L[i + 1][j] >= L[i][j + 1]) i++; else j++
  }
  const changed = new Set()
  for (let k = 0; k < m; k++) if (!keep.has(k)) changed.add(k)
  return changed
}

export function renderFile(content, info, L, prev) {
  const a = parseAttrs(info)
  const name = a._flags[0] || ''
  const check = a._flags.includes('check')
  const ext = (name.match(/\.(\w+)$/) || [])[1] || (name === '.gitignore' ? 'txt' : '')
  const lang = LANG[ext] || 'plaintext'
  const text = content.replace(/\n$/, '')
  const changed = check ? new Set() : changedLines(prev, content)
  const rows = text.split('\n').map((ln, k) => {
    let h = lang === 'plaintext' ? escapeHtml(ln) : hljs.highlight(ln, { language: lang, ignoreIllegals: true }).value
    if (name === '.gitignore' && /^#/.test(ln)) h = `<span class="hljs-comment">${escapeHtml(ln)}</span>`
    const conflict = /^(<{7}|={7}|>{7})( |$)/.test(ln)
    const cls = conflict ? ' class="ln conflict"' : changed.has(k) ? ' class="ln hl"' : ' class="ln"'
    return `<span${cls}>${h || ' '}</span>`
  }).join('')
  const note = check ? L.conflict : changed.size ? L.changed : ''
  return `<div class="file"><div class="file-bar"><span class="file-name">${escapeHtml(name)}</span>${note ? `<span class="file-note">${note}</span>` : ''}${check ? '' : `<button type="button" class="copy-btn" data-copy="${escapeHtml(text)}">${L.copy}</button>`}</div><pre class="file-body"><code class="language-${lang}">${rows}</code></pre></div>\n`
}

// ---------- quiz fence (the AI series' format) ----------
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

// ---------- icons (plain shapes, no logos) ----------
const ICON = {
  github: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M1.5 8h13M8 1.5c2 2 2 11 0 13M8 1.5c-2 2-2 11 0 13" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>',
  browser: '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="1.5" y="2.5" width="13" height="11" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M1.5 5.5h13" stroke="currentColor" stroke-width="1.5"/></svg>',
  vscode: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5.5 4.5 2 8l3.5 3.5M10.5 4.5 14 8l-3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
}

// ---------- the renderer ----------
export function makeMd({ lang = 'en', figDirs = [], fileStates = [] } = {}) {
  const L = LABELS[lang]
  const md = new MarkdownIt({ html: true, linkify: false, typographer: true })
  md.disable(['replacements'])
  md.use(cjkFriendly)
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
    if (kind === 'terminal') { env.counts.terminal++; return renderTerminal(t.content, info, L) }
    if (kind === 'file') {
      env.counts.file++
      const a = parseAttrs(info)
      const name = a._flags[0]
      // tools/replay.py records what the file held before each file block it runs, in order.
      // It skips blocks marked norun, and blocks inside an OS tab unless marked run; so do we.
      const runs = !a._flags.includes('norun') && (!env.inTab || a._flags.includes('run'))
      const recorded = runs ? fileStates[env.fileIndex++] : undefined
      const prev = recorded !== undefined ? recorded : env.lastFile[name]
      const html = renderFile(t.content, info, L, prev)
      if (!a._flags.includes('check')) env.lastFile[name] = t.content
      return html
    }
    const cls = kind ? ` class="language-${escapeHtml(kind)}"` : ''
    let body = escapeHtml(t.content)
    if (kind && hljs.getLanguage(kind)) body = hljs.highlight(t.content, { language: kind, ignoreIllegals: true }).value
    return `<pre class="code"><code${cls}>${body}</code></pre>\n`
  }

  const KINDS = ['note', 'tip', 'pitfall', 'keyidea', 'analogy', 'where', 'trouble', 'tabs', 'tab', 'check', 'answer', 'figure', 'widget']
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

function openContainer(md, kind, a, L, env, figDirs) {
  const inl = s => md.renderInline(s || '', env)
  switch (kind) {
    case 'note': case 'tip': case 'pitfall': case 'keyidea': case 'analogy':
      return `<div class="callout ${kind}"><div class="callout-label">${L[kind]}${a.title ? ` — ${inl(a.title)}` : ''}</div>\n`
    case 'where': {
      const w = a._flags[0] || 'github'
      return `<div class="where where-${escapeHtml(w)}"><div class="where-label">${ICON[w] || ''}<span>${L.where[w] || w}</span></div>\n`
    }
    case 'trouble':
      env.counts.trouble++
      return `<details class="trouble"><summary>${L.trouble}</summary><div class="details-body">\n`
    case 'tabs':
      env.tabGroup = (env.tabGroup || 0) + 1
      return `<div class="tabs" data-group="${env.tabGroup}"><div class="tab-buttons" role="tablist"></div>\n`
    case 'tab': {
      env.inTab = true
      const name = a._flags.join(' ')
      const key = OS_KEYS[name.toLowerCase()] || name.toLowerCase()
      return `<div class="tab-panel" role="tabpanel" data-tab="${escapeHtml(key)}" data-label="${escapeHtml(name)}">\n`
    }
    case 'check':
      return `<div class="check"><div class="check-label">${L.check}</div>\n`
    case 'answer':
      return `<details class="answer"><summary>${L.answer}</summary><div class="details-body">\n`
    case 'figure': {
      env.counts.figure++
      env.figures.push(a.id)
      const num = env.figures.length
      // image=NAME.png shows a picture from src/images instead of an SVG figure
      // url=ADDRESS draws a browser window around the picture, with that address in its bar
      const img = a.image ? `<img src="assets/${escapeHtml(a.image)}" alt="${escapeHtml(a.alt || '')}" loading="lazy">` : ''
      const body = !a.image ? `<div class="fig-svg">${readFigure(a.id, figDirs, env)}</div>`
        : a.url ? `<div class="fig-photo browser"><div class="browser-bar"><span class="term-dots"><i></i><i></i><i></i></span><span class="browser-url">${escapeHtml(a.url)}</span></div>${img}</div>`
          : `<div class="fig-photo">${img}</div>`
      return `<figure class="fig"${a.id ? ` id="${escapeHtml(a.id)}"` : ''}>${body}<figcaption><span class="fig-num">${L.figure} ${env.lessonNo ? `${env.lessonNo}.` : ''}${num}</span> `
    }
    case 'widget': {
      env.counts.widget++
      env.widgets.push(a.name)
      return `<div class="widget-wrap"><div class="widget-label">${L.interactive}</div><div class="widget" data-widget="${escapeHtml(a.name || '')}"></div><div class="widget-caption">\n`
    }
  }
  return '<div>'
}

function closeContainer(kind, env) {
  switch (kind) {
    case 'trouble': case 'answer': return '</div></details>\n'
    case 'figure': return '</figcaption></figure>\n'
    case 'widget': return '</div></div>\n'
    case 'tab': env.inTab = false; return '</div>\n'
    default: return '</div>\n'
  }
}

export function newEnv(lang = 'en') {
  return {
    L: LABELS[lang], sections: [], errors: [], missingFigures: [], figures: [], widgets: [], stack: [],
    counts: { quiz: 0, terminal: 0, file: 0, figure: 0, widget: 0, trouble: 0 },
    fileIndex: 0, lastFile: {}, inTab: false,
  }
}
