// Build the Formal Methods with Isabelle pages.
//   node tools/build.mjs                    every page, both languages, into out/site/
//   node tools/build.mjs --lang en          one language
//   node tools/build.mjs --out ../../docs/tutorials/formal-methods    publish into the site
// Reads src/<lang>/*.md, src/figures/<lang>/*.svg, src/assets/, src/widgets/, the Isabelle fonts
// and KaTeX, and out/formal-methods-theories.zip (written by tools/isa.py). Exits 1 on problems.
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { makeMd, newEnv, escapeHtml, frontMatter } from './md.mjs'

const require = createRequire(import.meta.url)
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const argv = process.argv.slice(2)
const arg = k => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : null }
const OUT = arg('--out') ? path.resolve(arg('--out')) : path.join(ROOT, 'out', 'site')
const LANGS = arg('--lang') ? [arg('--lang')] : ['en', 'zh']
// Built in one language only (e.g. --lang en while the Chinese edition is in preparation): no language switch.
const BILINGUAL = LANGS.length > 1
const FONTS = 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500;600;700&display=swap'
export const ZIP = 'formal-methods-theories.zip'

export const UI = {
  en: {
    htmlLang: 'en', series: 'Formal Methods with Isabelle', crumb: 'Formal methods', author: 'Ran Wei',
    module: 'Module', of: 'of', contents: 'On this page', minutes: 'min', hours: h => `about ${h} hours`, needs: 'You need', colon: ': ',
    goals: 'In this module you will', reference: 'Reference', cheatsheet: 'Cheat sheet', troubleshooting: 'Troubleshooting',
    glossary: 'Glossary', downloads: 'Theory files (ZIP)', prev: 'Previous', next: 'Next', index: 'All modules',
    switchTo: '中文', footer: 'Licensed under',
    doneQ: 'Finished this module?', doneBtn: 'Mark as done', doneYes: 'Done', doneUndo: 'Mark as not done',
    progress: (d, n) => `${d} of ${n} modules done`, start: 'Start with Module 1', resume: 'Continue with',
    helpLinks: 'Reference', parts: ['Part I · Foundations', 'Part II · Formal proof', 'Part III · Isabelle/HOL in practice', 'Part IV · Verification'],
    modules: 'modules', tagline: 'a tutorial series',
  },
  zh: {
    htmlLang: 'zh-CN', series: '用 Isabelle 学形式化方法', crumb: '形式化方法', author: 'Ran Wei',
    module: '模块', of: '/', contents: '本页内容', minutes: '分钟', hours: h => `约 ${h} 小时`, needs: '开始之前', colon: '：',
    goals: '在本模块中，你将', reference: '参考', cheatsheet: '速查表', troubleshooting: '问题排查',
    glossary: '术语表', downloads: '理论文件（ZIP）', prev: '上一模块', next: '下一模块', index: '全部模块',
    switchTo: 'English', footer: '许可协议',
    doneQ: '学完这个模块了吗？', doneBtn: '标记为已完成', doneYes: '已完成', doneUndo: '标记为未完成',
    progress: (d, n) => `已完成 ${d} / ${n} 个模块`, start: '从模块 1 开始', resume: '继续学习',
    helpLinks: '参考', parts: ['第一部分 · 基础', '第二部分 · 形式化证明', '第三部分 · Isabelle/HOL 实践', '第四部分 · 验证'],
    modules: '个模块', tagline: '系列教程',
  },
}
const REFS = ['cheatsheet', 'troubleshooting', 'glossary']
const moduleLabel = (n, lang) => lang === 'zh' ? `模块 ${n}` : `Module ${n}`
const pad = n => String(n).padStart(2, '0')
const SUFFIX = { en: 'EN', zh: 'ZH' }
export const pageFile = (name, lang) => name === 'index' ? (lang === 'zh' ? 'index_ZH.html' : 'index.html') : `${name}_${SUFFIX[lang]}.html`

function read(p) { return fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n').replace(/^﻿/, '') }

export function modules(lang) {
  const dir = path.join(ROOT, 'src', lang)
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir).filter(f => /^module_\d\d\.md$/.test(f)).sort().map(f => {
    const { meta } = frontMatter(read(path.join(dir, f)))
    return { n: Number(f.slice(7, 9)), file: f, meta }
  })
}

const problems = []

function render(lang, srcFile, opts = {}) {
  const raw = read(path.join(ROOT, 'src', lang, srcFile))
  const { meta, body } = frontMatter(raw)
  const figDirs = [path.join(ROOT, 'src', 'figures', lang), path.join(ROOT, 'src', 'figures', 'en')]
  const md = makeMd({ lang, figDirs })
  const env = newEnv(lang)
  env.moduleNo = opts.moduleNo || 0
  env.plainHeadings = !!opts.plainHeadings
  const html = md.render(body, env)
  for (const e of env.errors) problems.push(`${lang}/${srcFile}: ${e}`)
  for (const f of env.missingFigures) problems.push(`${lang}/${srcFile}: figure ${f} is not drawn yet`)
  return { meta, html, env, md }
}

function head(lang, title, description) {
  return `<!-- Created by Ran Wei · Licensed under CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/) -->
<!DOCTYPE html><html lang="${UI[lang].htmlLang}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description || '')}">
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="${FONTS}" rel="stylesheet">
<link rel="stylesheet" href="assets/katex.min.css">
<link rel="stylesheet" href="assets/style.css">
</head>`
}

function footer(lang) {
  return `<footer class="site-footer"><p>&copy; Ran Wei &middot; ${UI[lang].footer} <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a> &middot; Isabelle fonts: BSD-3-Clause</p></footer>`
}

function dropdown(lang, list, current) {
  const ui = UI[lang]
  const items = list.map(l => `<a href="${pageFile(`module_${pad(l.n)}`, lang)}"${current === l.n ? ' class="active"' : ''}><span class="dd-n">${l.n}</span>${escapeHtml(l.meta.title)}<span class="dd-done" data-lesson="${l.n}"></span></a>`).join('\n')
  const refs = REFS.filter(r => fs.existsSync(path.join(ROOT, 'src', lang, `${r}.md`)))
    .map(r => `<a href="${pageFile(r, lang)}"${current === r ? ' class="active"' : ''}><span class="dd-n">&#9670;</span>${ui[r]}</a>`).join('\n')
  const label = typeof current === 'number' ? (lang === 'zh' ? `模块 ${current} / 共 ${list.length} 个` : `${ui.module} ${current} ${ui.of} ${list.length}`) : ui.reference
  return `<div class="module-dropdown" id="moduleDropdown"><button class="badge" type="button" aria-haspopup="true" aria-expanded="false">${label}</button><div class="dropdown-menu">${items}<div class="dd-sep"></div>${refs}</div></div>`
}

function topbar(lang, list, current, other) {
  const ui = UI[lang]
  const now = typeof current === 'number' ? moduleLabel(current, lang) : ui[current]
  return `<div id="progress-bar"></div>
<header id="topbar">
  <a href="../../tutorials/" class="brand">Ran <span>Wei</span></a><span class="sep">/</span>
  <a href="${pageFile('index', lang)}" class="crumb">${ui.crumb}</a><span class="sep">/</span><span class="crumb crumb-now">${now}</span>
  ${dropdown(lang, list, current)}
  ${BILINGUAL ? `<a href="${other}" class="lang-switch" hreflang="${UI[lang === 'en' ? 'zh' : 'en'].htmlLang}">${ui.switchTo}</a>` : ''}
</header>`
}

function sidebar(lang, env) {
  const ui = UI[lang]
  const md = makeMd({ lang })
  const items = env.sections.map(s => `<a href="#${escapeHtml(s.id)}"><span class="num">${s.n}</span><span class="side-t">${md.renderInline(s.title, newEnv(lang))}</span></a>`).join('')
  const refs = REFS.filter(r => fs.existsSync(path.join(ROOT, 'src', lang, `${r}.md`))).map(r => `<a href="${pageFile(r, lang)}">${ui[r]}</a>`).join('')
  return `<aside id="sidebar"><div class="sidebar-label">${ui.contents}</div><nav>${items}</nav>
<div class="sidebar-label">${ui.helpLinks}</div><div class="side-links">${refs}<a href="${ZIP}">${ui.downloads}</a></div></aside>`
}

function renderModule(lang, l, list) {
  const ui = UI[lang]
  const { meta, html, env, md } = render(lang, l.file, { moduleNo: l.n })
  const inl = s => md.renderInline(String(s || ''), newEnv(lang))
  const prev = list.find(x => x.n === l.n - 1)
  const next = list.find(x => x.n === l.n + 1)
  const nav = `<nav class="module-nav">${prev
    ? `<a class="mnav prev" href="${pageFile(`module_${pad(prev.n)}`, lang)}"><span class="mnav-label">&larr; ${ui.prev}</span><span class="mnav-title">${moduleLabel(prev.n, lang)}${ui.colon}${escapeHtml(prev.meta.title)}</span></a>`
    : `<a class="mnav prev" href="${pageFile('index', lang)}"><span class="mnav-label">&larr; ${ui.index}</span><span class="mnav-title">${ui.series}</span></a>`}${next
    ? `<a class="mnav next" href="${pageFile(`module_${pad(next.n)}`, lang)}"><span class="mnav-label">${ui.next} &rarr;</span><span class="mnav-title">${moduleLabel(next.n, lang)}${ui.colon}${escapeHtml(next.meta.title)}</span></a>`
    : `<a class="mnav next" href="${pageFile('index', lang)}"><span class="mnav-label">${ui.index} &rarr;</span><span class="mnav-title">${ui.series}</span></a>`}</nav>`
  const goals = Array.isArray(meta.goals) && meta.goals.length
    ? `<section class="goals"><h3 class="goals-h">${ui.goals}</h3><ul>${meta.goals.map(g => `<li>${inl(g)}</li>`).join('')}</ul></section>` : ''
  const part = Number(meta.part || 0)
  const page = `${head(lang, `${moduleLabel(l.n, lang)}${ui.colon}${meta.title} — ${ui.series}`, meta.lead)}
<body data-lesson="${l.n}" data-lessons="${list.length}" data-series="formal-methods">
${topbar(lang, list, l.n, pageFile(`module_${pad(l.n)}`, lang === 'en' ? 'zh' : 'en'))}
<div id="layout">
${sidebar(lang, env)}
  <main id="main">
    <div class="module-hero">
      <div class="series">${ui.series}${part ? ` &middot; ${ui.parts[part - 1]}` : ''}</div>
      <h1 class="module-title"><span class="title-n">${moduleLabel(l.n, lang)}</span>${escapeHtml(meta.title)}</h1>
      <p class="module-lead">${inl(meta.lead)}</p>
      <div class="hero-chips"><span class="chip chip-time">&#9201; ${meta.minutes} ${ui.minutes}</span>${meta.needs ? `<span class="chip chip-needs">${ui.needs}${ui.colon}${inl(meta.needs)}</span>` : ''}</div>
    </div>
${goals}
<div class="content">
${html}
</div>
<section class="done-box" data-lesson="${l.n}"><div class="done-q">${ui.doneQ}</div><button type="button" class="done-btn" data-yes="${ui.doneYes}" data-no="${ui.doneBtn}" data-undo="${ui.doneUndo}">${ui.doneBtn}</button><div class="done-progress" data-label="${escapeHtml(ui.progress('{d}', '{n}'))}"></div></section>
${nav}
  </main>
</div>
${footer(lang)}
${widgetScripts(env.widgets)}<script src="assets/tutorial.js" defer></script>
</body></html>
`
  fs.writeFileSync(path.join(OUT, pageFile(`module_${pad(l.n)}`, lang)), page)
  return env
}

function renderReference(lang, name, list) {
  const ui = UI[lang]
  const { meta, html, env, md } = render(lang, `${name}.md`)
  const inl = s => md.renderInline(String(s || ''), newEnv(lang))
  const others = REFS.filter(r => r !== name && fs.existsSync(path.join(ROOT, 'src', lang, `${r}.md`)))
  const page = `${head(lang, `${meta.title} — ${ui.series}`, meta.lead)}
<body class="reference" data-lessons="${list.length}" data-series="formal-methods">
${topbar(lang, list, name, pageFile(name, lang === 'en' ? 'zh' : 'en'))}
<div id="layout">
${sidebar(lang, env)}
  <main id="main">
    <div class="module-hero">
      <div class="series">${ui.series} &middot; ${ui.reference}</div>
      <h1 class="module-title">${escapeHtml(meta.title)}</h1>
      <p class="module-lead">${inl(meta.lead)}</p>
    </div>
<div class="content">
${html}
</div>
<nav class="module-nav"><a class="mnav prev" href="${pageFile('index', lang)}"><span class="mnav-label">&larr; ${ui.index}</span><span class="mnav-title">${ui.series}</span></a>${others.length ? `<a class="mnav next" href="${pageFile(others[0], lang)}"><span class="mnav-label">${ui.reference} &rarr;</span><span class="mnav-title">${ui[others[0]]}</span></a>` : ''}</nav>
  </main>
</div>
${footer(lang)}
<script src="assets/tutorial.js" defer></script>
</body></html>
`
  fs.writeFileSync(path.join(OUT, pageFile(name, lang)), page)
  return env
}

// Script tags for the widgets a page uses: the shared core first, then one file per widget.
function widgetScripts(names) {
  const used = [...new Set(names.filter(Boolean))].filter(n => fs.existsSync(path.join(ROOT, 'src', 'widgets', `${n}.js`)))
  for (const n of new Set(names.filter(Boolean))) if (!used.includes(n)) problems.push(`widget ${n} has no src/widgets/${n}.js`)
  return used.length ? ['_core', ...used].map(n => `<script src="assets/widgets/${n}.js" defer></script>\n`).join('') : ''
}

function renderIndex(lang, list) {
  const ui = UI[lang]
  const { meta, html, md } = render(lang, 'index.md', { plainHeadings: true })
  const inl = s => md.renderInline(String(s || ''), newEnv(lang))
  const card = l => `<a class="module-card" href="${pageFile(`module_${pad(l.n)}`, lang)}" data-lesson="${l.n}"><div class="card-top"><span class="card-num">${moduleLabel(l.n, lang)}</span><span class="card-time">${Math.round(Number(l.meta.minutes || 0) / 60 * 10) / 10} h</span></div><div class="card-title">${escapeHtml(l.meta.title)}</div><div class="card-desc">${inl(l.meta.lead)}</div><div class="card-done" aria-hidden="true">&#10003;</div></a>`
  const parts = [1, 2, 3, 4].map(p => {
    const ms = list.filter(l => Number(l.meta.part) === p)
    return ms.length ? `<section class="index-part"><h2 class="part-h">${ui.parts[p - 1]}</h2><div class="index-grid">${ms.map(card).join('')}</div></section>` : ''
  }).join('')
  const progress = `<div class="index-progress" data-label="${escapeHtml(ui.progress('{d}', '{n}'))}"><div class="ip-bar"><span></span></div><span class="ip-text"></span><a class="ip-next" href="${pageFile('module_01', lang)}" data-start="${escapeHtml(ui.start)}" data-resume="${escapeHtml(ui.resume)}">${ui.start} &rarr;</a></div>`
  const [before, after] = html.split('<!-- modules -->')
  const total = list.reduce((a, l) => a + Number(l.meta.minutes || 0), 0)
  const page = `${head(lang, `${ui.series} — ${ui.tagline}`, meta.lead)}
<body class="index-page" data-lessons="${list.length}" data-series="formal-methods">
<nav class="site-nav"><a class="nav-brand" href="../../tutorials/">Ran <span>Wei</span></a><span class="nav-sep">/</span><a class="nav-crumb" href="${pageFile('index', lang)}">${ui.crumb}</a>${BILINGUAL ? `<a class="lang-switch" href="${pageFile('index', lang === 'en' ? 'zh' : 'en')}">${ui.switchTo}</a>` : ''}</nav>
<div class="index-hero">
  <h1>${meta.title_html || escapeHtml(ui.series)}</h1>
  <p class="lead">${inl(meta.lead)}</p>
  <div class="hero-tags"><span class="tag tag-module">${list.length} ${ui.modules}</span><span class="tag tag-theme">${ui.hours(Math.round(total / 60))}</span><span class="tag tag-time">Isabelle2026</span>${BILINGUAL ? '<span class="tag tag-time">EN · 中文</span>' : ''}</div>
  ${progress}
</div>
<div class="index-body content">
${before || ''}
</div>
${parts}
<div class="index-body content">
${after || ''}
</div>
${footer(lang)}
<script src="assets/tutorial.js" defer></script>
</body></html>
`
  fs.writeFileSync(path.join(OUT, pageFile('index', lang)), page)
}

function copyAssets() {
  const ad = path.join(OUT, 'assets')
  fs.mkdirSync(path.join(ad, 'fonts'), { recursive: true })
  const copyDir = (from, to) => {
    for (const f of fs.readdirSync(from)) {
      const s = path.join(from, f), d = path.join(to, f)
      if (fs.statSync(s).isDirectory()) { fs.mkdirSync(d, { recursive: true }); copyDir(s, d) } else fs.copyFileSync(s, d)
    }
  }
  copyDir(path.join(ROOT, 'src', 'assets'), ad)
  // Each widget is its own script (assets/widgets/NAME.js), so that an error in one cannot stop the others.
  const wd = path.join(ROOT, 'src', 'widgets')
  fs.rmSync(path.join(ad, 'widgets'), { recursive: true, force: true })
  fs.mkdirSync(path.join(ad, 'widgets'), { recursive: true })
  if (fs.existsSync(wd)) for (const f of fs.readdirSync(wd).filter(f => f.endsWith('.js'))) fs.copyFileSync(path.join(wd, f), path.join(ad, 'widgets', f))
  fs.rmSync(path.join(ad, 'widgets.js'), { force: true })
  const katexDist = path.dirname(require.resolve('katex/dist/katex.min.css'))
  fs.copyFileSync(path.join(katexDist, 'katex.min.css'), path.join(ad, 'katex.min.css'))
  copyDir(path.join(katexDist, 'fonts'), path.join(ad, 'fonts'))
  const img = path.join(ROOT, 'src', 'images')
  if (fs.existsSync(img)) for (const f of fs.readdirSync(img)) fs.copyFileSync(path.join(img, f), path.join(ad, f))
  const zip = path.join(ROOT, 'out', ZIP)
  if (fs.existsSync(zip)) fs.copyFileSync(zip, path.join(OUT, ZIP))
  else problems.push(`${ZIP} is missing: run python3 -I tools/isa.py first`)
}

// ---------- CLI ----------
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  fs.mkdirSync(OUT, { recursive: true })
  copyAssets()
  for (const lang of LANGS) {
    const list = modules(lang)
    if (!list.length) continue
    for (const l of list) {
      const env = renderModule(lang, l, list)
      const c = env.counts
      console.log(`built ${pageFile(`module_${pad(l.n)}`, lang)}  sections=${env.sections.length} isabelle=${c.isabelle} output=${c.output} figures=${c.figure} widgets=${c.widget} exercises=${c.exercise} quiz=${c.quiz}`)
    }
    for (const r of REFS) if (fs.existsSync(path.join(ROOT, 'src', lang, `${r}.md`))) { renderReference(lang, r, list); console.log(`built ${pageFile(r, lang)}`) }
    if (fs.existsSync(path.join(ROOT, 'src', lang, 'index.md'))) { renderIndex(lang, list); console.log(`built ${pageFile('index', lang)}`) }
  }
  if (problems.length) { console.log(`\n${problems.length} problem(s):`); for (const p of problems) console.log('  ' + p) }
  process.exit(problems.length ? 1 : 0)
}
