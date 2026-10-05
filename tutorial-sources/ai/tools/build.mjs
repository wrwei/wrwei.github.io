// Build the AI series pages.
//   node build.mjs                 build every module that has parts, both languages, plus index pages
//   node build.mjs --module 3      build one module (both languages)
//   node build.mjs --lang en       one language only
//   node build.mjs --modules 1,2,3,4   publish only these modules: the index lists them, navigation
//                                  skips the others, and links into the others become plain text
// Output: out/ai/ under the series root, or --out <dir> (e.g. --out ../../docs/tutorials/ai to publish)
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { makeMd, newEnv, escapeHtml, LABELS, flushPlots } from './md.mjs'

const ROOT = process.env.AIS_ROOT || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
// --out <dir> or AIS_OUT publishes elsewhere, e.g. --out ../../docs/tutorials/ai
const OUT_ARG = process.argv.indexOf('--out')
const OUT = OUT_ARG > 0 ? path.resolve(process.argv[OUT_ARG + 1]) : (process.env.AIS_OUT || path.join(ROOT, 'out', 'ai'))
const CDN = {
  katexCss: 'https://cdn.jsdelivr.net/npm/katex@0.18.10/dist/katex.min.css',
  katexJs: 'https://cdn.jsdelivr.net/npm/katex@0.18.10/dist/katex.min.js',
  hljs: 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.11.1/build/highlight.min.js',
}
// Modules being published; null means all. Set by --modules.
let PUBLISHED = null
const isPublished = n => !PUBLISHED || PUBLISHED.includes(n)
// Links into modules that are not published become plain text, so no page links to a missing file.
function unlinkUnpublished(html) {
  if (!PUBLISHED) return html
  return html.replace(/<a href="module_(\d\d)_(?:EN|ZH)\.html[^"]*"[^>]*>([\s\S]*?)<\/a>/g,
    (all, nn, text) => isPublished(Number(nn)) ? all : `<span class="xref-pending">${text}</span>`)
}
const FONTS = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;0,9..144,700;1,9..144,300&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500;600&display=swap'

export const UI = {
  en: {
    htmlLang: 'en', series: 'From Machine Learning to Large Language Models', crumb: 'AI Series',
    seriesLabel: 'AI Series — Ran Wei', module: 'Module', of: 'of', contents: 'Contents',
    groups: { concepts: 'Concepts', labs: 'Labs', practice: 'Practice', wrap: 'Wrap-up' },
    glance: 'At a glance', outcomes: 'By the end you can', prereq: 'Before you start', software: 'You will need',
    plan: 'Study plan', planLead: 'Five study sessions, with about ten hours of scheduled activities. Allow 10–15 hours including derivations, reruns and review. Tick a session when you finish it; your progress is kept in this browser.',
    session: 'Session', done: 'Done', progress: 'Progress', sessionsDone: 'sessions done',
    hours: 'h', min: 'min', approxRead: 'min read', labTime: 'lab', cpu: 'CPU run', download: 'download', none: 'none',
    prev: 'Previous', next: 'Up next', index: 'Series overview', terms: 'Key terms', termsHead: ['English', '中文'],
    kinds: { read: 'Read', lab: 'Lab', exercises: 'Exercises', quiz: 'Quiz', papers: 'Papers', review: 'Review' },
    stats: (s) => [`10–15 hours`, `${s.sessions} sessions`, `${s.labs} labs`, `${s.exercises} exercises`, `${s.quiz} quiz questions`],
    switchTo: '中文', footer: 'Licensed under',
  },
  zh: {
    htmlLang: 'zh-CN', series: '从机器学习到大语言模型', crumb: 'AI 系列',
    seriesLabel: 'AI 系列 — Ran Wei', module: '模块', of: '/', contents: '目录',
    groups: { concepts: '概念', labs: '实验', practice: '练习', wrap: '总结' },
    glance: '概览', outcomes: '学完本模块，你能够', prereq: '预备知识', software: '所需环境',
    plan: '学习计划', planLead: '分五次学习，计划活动约十小时。计入推导、重复实验和复习后，请预留 10–15 小时。每完成一次学习就勾选一次；进度保存在本浏览器中。',
    session: '第', done: '已完成', progress: '进度', sessionsDone: '次已完成',
    hours: '小时', min: '分钟', approxRead: '分钟阅读', labTime: '实验', cpu: 'CPU 运行', download: '下载', none: '无',
    prev: '上一模块', next: '下一模块', index: '系列总览', terms: '关键术语', termsHead: ['English', '中文'],
    kinds: { read: '阅读', lab: '实验', exercises: '练习', quiz: '测验', papers: '论文', review: '复习' },
    stats: (s) => [`10–15 小时`, `${s.sessions} 次学习`, `${s.labs} 个实验`, `${s.exercises} 道练习`, `${s.quiz} 道自测题`],
    switchTo: 'English', footer: '许可协议',
  },
}

const pad = n => String(n).padStart(2, '0')
const fileFor = (n, lang) => `module_${pad(n)}_${lang.toUpperCase()}.html`
const readJson = p => JSON.parse(fs.readFileSync(p, 'utf8'))

export function loadMeta(n, lang) {
  const plan = readJson(path.join(ROOT, 'plan', `module_${pad(n)}.json`))
  if (lang === 'en') return plan
  const zp = path.join(ROOT, 'src', 'zh', `module_${pad(n)}.meta.json`)
  if (!fs.existsSync(zp)) return null
  const zh = readJson(zp)
  // structural fields come from the English plan; text fields from the translation
  return { ...plan, ...zh, labs: plan.labs.map((l, i) => ({ ...l, ...(zh.labs && zh.labs[i] ? { title: zh.labs[i].title } : {}) })), terms: plan.terms }
}

export function partFiles(n, lang) {
  const dir = path.join(ROOT, 'src', lang, `module_${pad(n)}`)
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir).filter(f => f.endsWith('.md')).sort().map(f => path.join(dir, f))
}

// Concatenate parts; remember where each part starts so errors can be located.
export function assemble(n, lang, meta) {
  const files = partFiles(n, lang)
  const map = []
  let src = ''
  let line = 1
  for (const f of files) {
    const text = fs.readFileSync(f, 'utf8').replace(/\r\n/g, '\n').replace(/^\uFEFF/, '')
    map.push({ file: f, start: line })
    src += text.endsWith('\n') ? text : text + '\n'
    src += '\n'
    line += text.split('\n').length + (text.endsWith('\n') ? 0 : 1)
  }
  // Key terms table, generated from the plan, placed before the references
  if (meta && meta.terms && meta.terms.length && src) {
    const ui = UI[lang]
    const rows = meta.terms.map(t => `| ${t.en} | ${t.zh} |`).join('\n')
    const block = `## ${ui.terms} {#terms}\n\n| ${ui.termsHead[0]} | ${ui.termsHead[1]} |\n|---|---|\n${rows}\n\n`
    const m = src.match(/^## .*\{#refs\}\s*$/m)
    src = m ? src.slice(0, m.index) + block + src.slice(m.index) : src + '\n' + block
  }
  const locate = gl => {
    let cur = map[0]
    for (const p of map) if (p.start <= gl) cur = p
    return cur ? `${path.relative(ROOT, cur.file)}:${gl - cur.start + 1}` : `line ${gl}`
  }
  return { src, files, locate }
}

// labs/module_NN/labK.plots.json = [[block, file], ...]  ->  { labK: { block: [file, ...] } }
function loadPlots(n) {
  const dir = path.join(ROOT, 'labs', `module_${pad(n)}`)
  const plots = {}
  if (!fs.existsSync(dir)) return plots
  for (const f of fs.readdirSync(dir).filter(f => /^lab\d+\.plots\.json$/.test(f))) {
    const lab = f.split('.')[0]
    try {
      for (const [block, file] of JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))) {
        if (!fs.existsSync(path.join(ROOT, 'labs', 'plots', file))) continue
        plots[lab] = plots[lab] || {}
        ;(plots[lab][block] = plots[lab][block] || []).push(file)
      }
    } catch { /* a manifest from a crashed run is ignored */ }
  }
  return plots
}

function groupOf(id) {
  if (/^lab\d+/.test(id)) return 'labs'
  if (id === 'exercises' || id === 'quiz') return 'practice'
  if (['reading', 'summary', 'terms', 'refs'].includes(id)) return 'wrap'
  return 'concepts'
}

function allTitles(lang) {
  const titles = {}
  for (let n = 1; n <= 10; n++) {
    try { const m = loadMeta(n, lang) || loadMeta(n, 'en'); titles[n] = m.title } catch { titles[n] = `Module ${n}` }
  }
  return titles
}

function heroTitle(meta) {
  const t = escapeHtml(meta.title)
  const em = meta.title_em ? escapeHtml(meta.title_em) : ''
  return em && t.includes(em) ? t.replace(em, `<em>${em}</em>`) : t
}

export function renderModule(n, lang, { write = true } = {}) {
  const meta = loadMeta(n, lang)
  if (!meta) return null
  const ui = UI[lang]
  const L = LABELS[lang === 'zh' ? 'zh' : 'en']
  const { src, files, locate } = assemble(n, lang, meta)
  if (!files.length) return null
  const figDirs = [path.join(ROOT, 'src', 'figures', lang), path.join(ROOT, 'src', 'figures', 'en')]
  const md = makeMd({ lang, figDirs })
  const env = newEnv()
  const labsById = Object.fromEntries((meta.labs || []).map(l => [l.id, l]))
  const secsById = Object.fromEntries((meta.sections || []).map(s => [s.id, s]))
  env.afterHeader = sec => {
    const lab = labsById[sec.id]
    if (lab) {
      const dl = lab.download_mb ? `${lab.download_mb} MB` : ui.none
      return `<div class="lab-meta"><span class="chip chip-time">${lab.minutes} ${ui.min}</span><span class="chip">${ui.cpu} ≈ ${lab.cpu_runtime_minutes} ${ui.min}</span><span class="chip">${ui.download}: ${dl}</span></div>\n`
    }
    const s = secsById[sec.id]
    if (s && s.minutes) return `<div class="sec-meta">≈ ${s.minutes} ${ui.approxRead}</div>\n`
    return ''
  }
  env.plots = loadPlots(n)
  const body = md.render(src, env) + flushPlots(env)
  env.locate = locate

  const titles = allTitles(lang)
  const other = lang === 'en' ? 'zh' : 'en'
  const stats = {
    sessions: (meta.sessions || []).length, labs: env.sections.filter(s => /^lab\d+/.test(s.id)).length,
    exercises: env.counts.exercise, quiz: env.counts.quiz,
  }

  // sidebar, grouped
  let side = ''
  let lastGroup = ''
  for (const s of env.sections) {
    const g = groupOf(s.id)
    if (g !== lastGroup) { side += `<div class="side-group">${ui.groups[g]}</div>`; lastGroup = g }
    side += `<a href="#${escapeHtml(s.id)}"><span class="num">${s.n}</span><span class="side-t">${md.renderInline(s.title, newEnv())}</span></a>`
  }

  const dropdown = Object.entries(titles).filter(([k]) => isPublished(Number(k))).map(([k, t]) =>
    `<a href="${fileFor(Number(k), lang)}"${Number(k) === n ? ' class="active"' : ''}>${Number(k)} &mdash; ${escapeHtml(t)}</a>`).join('\n')

  // the heading already says "By the end you can", so outcomes start at the verb
  const outcome = o => {
    const s = o.replace(/^\s*(by the end(?: of (?:this|the) module)?,? you (?:can|will be able to)|you can|学完本模块，?你能够|学完后，?你能够|你能够)\s*/i, '')
    return s.charAt(0).toUpperCase() + s.slice(1)
  }
  const glance = `<section class="glance">
<div class="glance-col"><h3 class="glance-h">${ui.outcomes}</h3><ul class="outcomes">${(meta.outcomes || []).map(o => `<li>${md.renderInline(outcome(o), newEnv())}</li>`).join('')}</ul></div>
<div class="glance-col"><h3 class="glance-h">${ui.prereq}</h3><ul>${(meta.prerequisites || []).map(o => `<li>${md.renderInline(o, newEnv())}</li>`).join('')}</ul>
<h3 class="glance-h">${ui.software}</h3><ul>${(meta.software || []).map(o => `<li>${md.renderInline(o, newEnv())}</li>`).join('')}</ul></div>
</section>`

  const totalMin = (meta.sessions || []).reduce((a, s) => a + s.activities.reduce((b, x) => b + x.minutes, 0), 0)
  const fmtDur = m => lang === 'zh' ? (m < 60 ? `${m} 分钟` : m % 60 === 0 ? `${m / 60} 小时` : `${Math.floor(m / 60)} 小时 ${m % 60} 分钟`)
    : m < 60 ? `${m} min` : m % 60 === 0 ? `${m / 60} h` : `${Math.floor(m / 60)} h ${pad(m % 60)} min`
  const sessions = (meta.sessions || []).map(s => {
    const mins = s.activities.reduce((a, x) => a + x.minutes, 0)
    const acts = s.activities.map(x => {
      const ref = (x.refs || [])[0]
      const label = md.renderInline(x.what, newEnv())
      return `<li class="act act-${escapeHtml(x.kind)}"><span class="act-kind">${ui.kinds[x.kind] || x.kind}</span><span class="act-what">${ref ? `<a href="#${escapeHtml(ref)}">${label}</a>` : label}</span><span class="act-min">${x.minutes}</span></li>`
    }).join('')
    const head = lang === 'zh' ? `第 ${s.n} 次` : `${ui.session} ${s.n}`
    return `<div class="session" data-session="${s.n}"><div class="session-head"><span class="session-n">${head}</span><span class="session-min">${fmtDur(mins)}</span></div><div class="session-title">${md.renderInline(s.title, newEnv())}</div><ul class="acts">${acts}</ul><label class="session-done"><input type="checkbox" data-key="ai-series:m${pad(n)}:s${s.n}"> ${ui.done}</label></div>`
  }).join('\n')
  const plan = `<section class="plan" id="plan"><div class="plan-head"><h2 class="plan-title">${ui.plan}</h2><span class="plan-total">${fmtDur(totalMin)}</span></div><p class="plan-lead">${ui.planLead}</p><div class="sessions">${sessions}</div></section>`

  const pubs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter(isPublished)
  const prevN = pubs.filter(k => k < n).pop()
  const nextN = pubs.find(k => k > n)
  const prevHtml = prevN
    ? `<a class="mnav prev" href="${fileFor(prevN, lang)}"><span class="mnav-label">&larr; ${ui.prev}</span><span class="mnav-title">${ui.module} ${prevN} — ${escapeHtml(titles[prevN])}</span></a>`
    : `<a class="mnav prev" href="${lang === 'zh' ? 'index_ZH.html' : 'index.html'}"><span class="mnav-label">&larr; ${ui.index}</span><span class="mnav-title">${ui.series}</span></a>`
  const nextHtml = nextN
    ? `<a class="mnav next" href="${fileFor(nextN, lang)}"><span class="mnav-label">${ui.next} &rarr;</span><span class="mnav-title">${ui.module} ${nextN} — ${escapeHtml(titles[nextN])}</span></a>`
    : `<a class="mnav next" href="${lang === 'zh' ? 'index_ZH.html' : 'index.html'}"><span class="mnav-label">${ui.index} &rarr;</span><span class="mnav-title">${ui.series}</span></a>`

  const html = `<!-- Created by Ran Wei · Licensed under CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/) -->
<!DOCTYPE html><html lang="${ui.htmlLang}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${ui.module} ${n}: ${escapeHtml(meta.title)} — ${escapeHtml(ui.series)}</title>
<meta name="description" content="${escapeHtml(meta.lead || '')}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="${FONTS}" rel="stylesheet">
<link rel="stylesheet" href="${CDN.katexCss}" integrity="sha384-rdqqrpVNEfmY6hsVFS50HU5L84tWeMdr4XpF+TJPvLR6e8YxPgRyDzzpawPHMQE6" crossorigin="anonymous">
<link rel="stylesheet" href="assets/style.css">
</head><body data-module="${n}">
<div id="progress-bar"></div>
<header id="topbar">
  <a href="../../tutorials/" class="brand">Ran <span>Wei</span></a><span class="sep">/</span>
  <a href="${lang === 'zh' ? 'index_ZH.html' : 'index.html'}" class="crumb">${ui.crumb}</a><span class="sep">/</span><span class="crumb crumb-now">${ui.module} ${n}</span>
  <div class="module-dropdown" id="moduleDropdown">
    <button class="badge" type="button" aria-haspopup="true" aria-expanded="false">${lang === 'zh' ? `${ui.module} ${n} / 10` : `${ui.module} ${n} ${ui.of} 10`}</button>
    <div class="dropdown-menu">
${dropdown}
    </div>
  </div>
  <a href="${fileFor(n, other)}" class="lang-switch" hreflang="${UI[other].htmlLang}">${ui.switchTo}</a>
</header>
<div id="layout">
  <aside id="sidebar">
    <div class="side-progress"><div class="side-progress-label">${ui.progress}: <span class="side-progress-n">0</span>/${stats.sessions} ${ui.sessionsDone}</div><div class="side-progress-bar"><span></span></div></div>
    <div class="sidebar-label">${ui.contents}</div>
    <nav>${side}</nav>
  </aside>
  <main id="main">
    <div class="module-hero">
      <div class="series">${ui.seriesLabel}</div>
      <h1 class="module-title">${ui.module} ${n}: ${heroTitle(meta)}</h1>
      <p class="module-lead">${md.renderInline(meta.lead || '', newEnv())}</p>
      <div class="hero-chips">${ui.stats(stats).map(s => `<span class="chip">${s}</span>`).join('')}</div>
    </div>
${glance}
${plan}
<div class="content">
${body}
</div>
<nav class="module-nav">${prevHtml}${nextHtml}</nav>
  </main>
</div>
<footer class="site-footer"><p>&copy; Ran Wei &middot; ${ui.footer} <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a></p></footer>
<script src="${CDN.katexJs}" integrity="sha384-oeXTyN/gxEn/v98/oDFW+7XVfZrp59R6Tporzsg2uNs9g+G9Xel/Afxdamc4Mags" crossorigin="anonymous" defer></script>
<script src="${CDN.hljs}" integrity="sha384-RH2xi4eIQ/gjtbs9fUXM68sLSi99C7ZWBRX1vDrVv6GQXRibxXLbwO2NGZB74MbU" crossorigin="anonymous" defer></script>
<script src="assets/widgets.js" defer></script>
<script src="assets/tutorial.js" defer></script>
</body></html>
`
  if (write) {
    fs.mkdirSync(OUT, { recursive: true })
    fs.writeFileSync(path.join(OUT, fileFor(n, lang)), unlinkUnpublished(html))
  }
  return { html, env, meta, files, src }
}

export function copyAssets() {
  const ad = path.join(OUT, 'assets')
  fs.mkdirSync(path.join(ad, 'plots'), { recursive: true })
  for (const f of ['style.css', 'tutorial.js']) fs.copyFileSync(path.join(ROOT, 'src', 'assets', f), path.join(ad, f))
  // widgets bundle: the core first, then every widget
  const wd = path.join(ROOT, 'src', 'widgets')
  const parts = [fs.readFileSync(path.join(ROOT, 'src', 'assets', 'widgets-core.js'), 'utf8')]
  if (fs.existsSync(wd)) for (const f of fs.readdirSync(wd).filter(f => f.endsWith('.js')).sort())
    parts.push(`;\n/* ---- ${f} ---- */\n` + fs.readFileSync(path.join(wd, f), 'utf8'))
  fs.writeFileSync(path.join(ad, 'widgets.js'), parts.join('\n'))
  const pd = path.join(ROOT, 'labs', 'plots')
  if (fs.existsSync(pd)) for (const f of fs.readdirSync(pd).filter(f => f.endsWith('.png') && isPublished(Number((f.match(/^m(\d\d)-/) || [])[1]) || 0))) fs.copyFileSync(path.join(pd, f), path.join(ad, 'plots', f))
}

// ---------- index pages ----------
export function renderIndex(lang) {
  const ui = UI[lang]
  const p = path.join(ROOT, 'src', lang, 'index.md')
  if (!fs.existsSync(p)) return null
  const md = makeMd({ lang, figDirs: [path.join(ROOT, 'src', 'figures', lang), path.join(ROOT, 'src', 'figures', 'en')] })
  const env = newEnv()
  env.plainHeadings = true
  const raw = fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n')
  // the card grid is generated: "<!-- modules -->" in index.md marks where it goes
  const THEMES = { 1: 'foundations', 2: 'foundations', 3: 'architectures', 4: 'architectures', 5: 'architectures', 6: 'architectures', 7: 'llm', 8: 'llm', 9: 'llm', 10: 'llm' }
  const THEME_NAMES = {
    en: { foundations: 'Foundations', architectures: 'Architectures', llm: 'Large language models' },
    zh: { foundations: '基础', architectures: '网络结构', llm: '大语言模型' },
  }
  let cards = '<div class="index-grid">'
  for (let n = 1; n <= 10; n++) {
    if (!isPublished(n)) continue
    let meta
    try { meta = loadMeta(n, lang) || loadMeta(n, 'en') } catch { continue }
    const labs = (meta.labs || []).length
    const ex = (meta.exercises || []).length
    cards += `<a class="module-card" href="${fileFor(n, lang)}"><div class="card-num">${ui.module} ${pad(n)}</div><div class="card-title">${escapeHtml(meta.title)}</div><div class="card-desc">${md.renderInline(meta.lead || '', newEnv())}</div><div class="card-meta">${lang === 'zh' ? `10–15 小时 · ${labs} 个实验 · ${ex} 道练习` : `10–15 h · ${labs} labs · ${ex} exercises`}</div><div class="card-footer"><span class="card-theme theme-${THEMES[n]}">${THEME_NAMES[lang][THEMES[n]]}</span><span class="card-lang">EN &middot; 中文</span></div></a>`
  }
  cards += '</div>'
  // a partial publication says which modules are still to come
  const missing = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter(k => !isPublished(k))
  if (missing.length) {
    const range = missing.length > 1 ? `${pad(missing[0])}–${pad(missing[missing.length - 1])}` : pad(missing[0])
    cards += `<p class="index-note">${lang === 'zh' ? `第 ${range} 模块正在编写中，完成后将陆续发布。` : `Modules ${range} are in preparation and will be published as they are finished.`}</p>`
  }
  const fm = raw.match(/^---\n([\s\S]*?)\n---\n/)
  const head = {}
  if (fm) for (const line of fm[1].split('\n')) { const m = line.match(/^(\w+):\s*(.*)$/); if (m) head[m[1]] = m[2] }
  const bodySrc = fm ? raw.slice(fm[0].length) : raw
  const [before, after] = bodySrc.split('<!-- modules -->')
  const html = `<!-- Created by Ran Wei · Licensed under CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/) -->
<!DOCTYPE html><html lang="${ui.htmlLang}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(ui.series)} — ${lang === 'zh' ? '教程系列' : 'Tutorial Series'}</title>
<meta name="description" content="${escapeHtml(head.lead || '')}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="${FONTS}" rel="stylesheet">
<link rel="stylesheet" href="${CDN.katexCss}" integrity="sha384-rdqqrpVNEfmY6hsVFS50HU5L84tWeMdr4XpF+TJPvLR6e8YxPgRyDzzpawPHMQE6" crossorigin="anonymous">
<link rel="stylesheet" href="assets/style.css">
</head><body class="index-page">
<nav class="site-nav"><a class="nav-brand" href="../../tutorials/">Ran <span>Wei</span></a><span class="nav-sep">/</span><a class="nav-crumb" href="${lang === 'zh' ? 'index_ZH.html' : 'index.html'}">${ui.crumb}</a><a class="lang-switch" href="${lang === 'zh' ? 'index.html' : 'index_ZH.html'}">${ui.switchTo}</a></nav>
<div class="index-hero">
  <h1>${head.title_html || escapeHtml(ui.series)}</h1>
  <p class="lead">${md.renderInline(head.lead || '', newEnv())}</p>
  <div class="hero-tags">${(head.tags || '').split('|').filter(Boolean).map((t, i) => `<span class="tag ${['tag-module', 'tag-theme', 'tag-time'][i] || 'tag-time'}">${escapeHtml(t.trim())}</span>`).join('')}</div>
</div>
<div class="index-body">
${md.render(before || '', env)}
</div>
${cards}
<div class="index-body">
${md.render(after || '', env)}
</div>
<footer class="site-footer"><p>&copy; Ran Wei &middot; ${ui.footer} <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a></p></footer>
<script src="${CDN.katexJs}" integrity="sha384-oeXTyN/gxEn/v98/oDFW+7XVfZrp59R6Tporzsg2uNs9g+G9Xel/Afxdamc4Mags" crossorigin="anonymous" defer></script>
<script src="assets/tutorial.js" defer></script>
</body></html>
`
  fs.mkdirSync(OUT, { recursive: true })
  fs.writeFileSync(path.join(OUT, lang === 'zh' ? 'index_ZH.html' : 'index.html'), unlinkUnpublished(html))
  return { html, env }
}

// ---------- CLI ----------
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const argv = process.argv.slice(2)
  const get = k => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : null }
  if (get('--modules')) PUBLISHED = get('--modules').split(',').map(Number)
  const mods = get('--module') ? [Number(get('--module'))] : (PUBLISHED || [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  const langs = get('--lang') ? [get('--lang')] : ['en', 'zh']
  copyAssets()
  for (const n of mods) for (const lang of langs) {
    const r = renderModule(n, lang)
    if (r) console.log(`built ${fileFor(n, lang)}  sections=${r.env.sections.length} math=${r.env.math.length} quiz=${r.env.counts.quiz} exercises=${r.env.counts.exercise} figures=${r.env.counts.figure} widgets=${r.env.counts.widget}`)
  }
  if (!get('--module')) for (const lang of langs) { if (renderIndex(lang)) console.log(`built index (${lang})`) }
}
