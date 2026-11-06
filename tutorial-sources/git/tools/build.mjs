// Build the Git series pages.
//   node tools/build.mjs                    every page, both languages, into out/git/
//   node tools/build.mjs --lang en          one language
//   node tools/build.mjs --out ../../docs/tutorials/git    publish into the site
// Reads src/<lang>/*.md, src/figures/<lang>/*.svg, src/assets/, src/widgets/ and
// replay/file-states.json (written by tools/replay.py). Prints problems; exits 1 if any.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { makeMd, newEnv, escapeHtml, frontMatter, LABELS } from './md.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const argv = process.argv.slice(2)
const arg = k => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : null }
const OUT = arg('--out') ? path.resolve(arg('--out')) : path.join(ROOT, 'out', 'git')
const LANGS = arg('--lang') ? [arg('--lang')] : ['en', 'zh']
const FONTS = 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500;600;700&display=swap'

export const UI = {
  en: {
    htmlLang: 'en', series: 'Git and GitHub, Step by Step', crumb: 'Git & GitHub', author: 'Ran Wei',
    lesson: 'Lesson', of: 'of', contents: 'On this page', minutes: 'min', needs: 'You need', colon: ': ',
    goals: 'In this lesson you will', reference: 'Reference', cheatsheet: 'Cheat sheet', troubleshooting: 'Troubleshooting',
    prev: 'Previous', next: 'Next', index: 'All lessons', switchTo: '中文', footer: 'Licensed under',
    doneQ: 'Finished this lesson?', doneBtn: 'Mark as done', doneYes: 'Done', doneUndo: 'Mark as not done',
    progress: (d, n) => `${d} of ${n} lessons done`, start: 'Start with Lesson 1', resume: 'Continue with',
    helpLinks: 'Stuck?', allLessons: 'Lessons',
  },
  zh: {
    htmlLang: 'zh-CN', series: '一步一步学 Git 与 GitHub', crumb: 'Git 与 GitHub', author: 'Ran Wei',
    lesson: '第', of: '/', contents: '本页内容', minutes: '分钟', needs: '开始之前', colon: '：',
    goals: '在本课中，你将', reference: '参考', cheatsheet: '速查表', troubleshooting: '问题排查',
    prev: '上一课', next: '下一课', index: '全部课程', switchTo: 'English', footer: '许可协议',
    doneQ: '学完这一课了吗？', doneBtn: '标记为已完成', doneYes: '已完成', doneUndo: '标记为未完成',
    progress: (d, n) => `已完成 ${d} / ${n} 课`, start: '从第 1 课开始', resume: '继续学习',
    helpLinks: '遇到困难？', allLessons: '课程',
  },
}
const lessonLabel = (n, lang) => lang === 'zh' ? `第 ${n} 课` : `Lesson ${n}`
const pad = n => String(n).padStart(2, '0')
const SUFFIX = { en: 'EN', zh: 'ZH' }
const pageFile = (name, lang) => name === 'index' ? (lang === 'zh' ? 'index_ZH.html' : 'index.html') : `${name}_${SUFFIX[lang]}.html`

function read(p) { return fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n').replace(/^﻿/, '') }

function lessons(lang) {
  const dir = path.join(ROOT, 'src', lang)
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir).filter(f => /^lesson_\d\d\.md$/.test(f)).sort().map(f => {
    const { meta } = frontMatter(read(path.join(dir, f)))
    return { n: Number(f.slice(7, 9)), file: f, meta }
  })
}

const STATES = (() => {
  const p = path.join(ROOT, 'replay', 'file-states.json')
  return fs.existsSync(p) ? JSON.parse(read(p)) : {}
})()

const problems = []

function render(lang, srcFile, opts = {}) {
  const raw = read(path.join(ROOT, 'src', lang, srcFile))
  const { meta, body } = frontMatter(raw)
  const figDirs = [path.join(ROOT, 'src', 'figures', lang), path.join(ROOT, 'src', 'figures', 'en')]
  const md = makeMd({ lang, figDirs, fileStates: STATES[srcFile] || [] })
  const env = newEnv(lang)
  env.lessonNo = opts.lessonNo || 0
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
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="${FONTS}" rel="stylesheet">
<link rel="stylesheet" href="assets/style.css">
</head>`
}

function footer(lang) {
  return `<footer class="site-footer"><p>&copy; Ran Wei &middot; ${UI[lang].footer} <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a></p></footer>`
}

function dropdown(lang, list, current) {
  const ui = UI[lang]
  const items = list.map(l => `<a href="${pageFile(`lesson_${pad(l.n)}`, lang)}"${current === l.n ? ' class="active"' : ''}><span class="dd-n">${l.n}</span>${escapeHtml(l.meta.title)}<span class="dd-done" data-lesson="${l.n}"></span></a>`).join('\n')
  const refs = ['cheatsheet', 'troubleshooting'].map(r => `<a href="${pageFile(r, lang)}"${current === r ? ' class="active"' : ''}><span class="dd-n">&#9670;</span>${ui[r]}</a>`).join('\n')
  const label = typeof current === 'number' ? (lang === 'zh' ? `第 ${current} 课 / 共 ${list.length} 课` : `${ui.lesson} ${current} ${ui.of} ${list.length}`) : ui.reference
  return `<div class="module-dropdown" id="moduleDropdown"><button class="badge" type="button" aria-haspopup="true" aria-expanded="false">${label}</button><div class="dropdown-menu">${items}<div class="dd-sep"></div>${refs}</div></div>`
}

function topbar(lang, list, current, other) {
  const ui = UI[lang]
  const now = typeof current === 'number' ? lessonLabel(current, lang) : ui[current]
  return `<div id="progress-bar"></div>
<header id="topbar">
  <a href="../../tutorials/" class="brand">Ran <span>Wei</span></a><span class="sep">/</span>
  <a href="${pageFile('index', lang)}" class="crumb">${ui.crumb}</a><span class="sep">/</span><span class="crumb crumb-now">${now}</span>
  ${dropdown(lang, list, current)}
  <a href="${other}" class="lang-switch" hreflang="${UI[lang === 'en' ? 'zh' : 'en'].htmlLang}">${ui.switchTo}</a>
</header>`
}

function sidebar(lang, env) {
  const ui = UI[lang]
  const md = makeMd({ lang })
  const items = env.sections.map(s => `<a href="#${escapeHtml(s.id)}"><span class="num">${s.n}</span><span class="side-t">${md.renderInline(s.title, newEnv(lang))}</span></a>`).join('')
  return `<aside id="sidebar"><div class="sidebar-label">${ui.contents}</div><nav>${items}</nav>
<div class="sidebar-label">${ui.helpLinks}</div><div class="side-links"><a href="${pageFile('troubleshooting', lang)}">${ui.troubleshooting}</a><a href="${pageFile('cheatsheet', lang)}">${ui.cheatsheet}</a></div></aside>`
}

function renderLesson(lang, l, list) {
  const ui = UI[lang]
  const { meta, html, env, md } = render(lang, l.file, { lessonNo: l.n })
  const inl = s => md.renderInline(String(s || ''), newEnv(lang))
  const prev = list.find(x => x.n === l.n - 1)
  const next = list.find(x => x.n === l.n + 1)
  const nav = `<nav class="module-nav">${prev
    ? `<a class="mnav prev" href="${pageFile(`lesson_${pad(prev.n)}`, lang)}"><span class="mnav-label">&larr; ${ui.prev}</span><span class="mnav-title">${lessonLabel(prev.n, lang)}${ui.colon}${escapeHtml(prev.meta.title)}</span></a>`
    : `<a class="mnav prev" href="${pageFile('index', lang)}"><span class="mnav-label">&larr; ${ui.index}</span><span class="mnav-title">${ui.series}</span></a>`}${next
    ? `<a class="mnav next" href="${pageFile(`lesson_${pad(next.n)}`, lang)}"><span class="mnav-label">${ui.next} &rarr;</span><span class="mnav-title">${lessonLabel(next.n, lang)}${ui.colon}${escapeHtml(next.meta.title)}</span></a>`
    : `<a class="mnav next" href="${pageFile('cheatsheet', lang)}"><span class="mnav-label">${ui.next} &rarr;</span><span class="mnav-title">${ui.cheatsheet}</span></a>`}</nav>`
  const goals = Array.isArray(meta.goals) && meta.goals.length
    ? `<section class="goals"><h3 class="goals-h">${ui.goals}</h3><ul>${meta.goals.map(g => `<li>${inl(g)}</li>`).join('')}</ul></section>` : ''
  const page = `${head(lang, `${lessonLabel(l.n, lang)}${ui.colon}${meta.title} — ${ui.series}`, meta.lead)}
<body data-lesson="${l.n}" data-lessons="${list.length}">
${topbar(lang, list, l.n, pageFile(`lesson_${pad(l.n)}`, lang === 'en' ? 'zh' : 'en'))}
<div id="layout">
${sidebar(lang, env)}
  <main id="main">
    <div class="module-hero">
      <div class="series">${ui.series}</div>
      <h1 class="module-title"><span class="title-n">${lessonLabel(l.n, lang)}</span>${escapeHtml(meta.title)}</h1>
      <p class="module-lead">${inl(meta.lead)}</p>
      <div class="hero-chips"><span class="chip chip-time">&#9201; ${meta.minutes} ${ui.minutes}</span>${meta.needs ? `<span class="chip chip-needs">${ui.needs}${ui.colon}${inl(meta.needs)}</span>` : ''}</div>
    </div>
${goals}
<div class="content">
${html}
</div>
<section class="done-box" data-lesson="${l.n}"><div class="done-q">${ui.doneQ}</div><button type="button" class="done-btn" data-yes="${ui.doneYes}" data-no="${ui.doneBtn}" data-undo="${ui.doneUndo}">${ui.doneBtn}</button><div class="done-progress" data-label-en="${escapeHtml(UI.en.progress('{d}', '{n}'))}" data-label="${escapeHtml(ui.progress('{d}', '{n}'))}"></div></section>
${nav}
  </main>
</div>
${footer(lang)}
<script src="assets/widgets.js" defer></script>
<script src="assets/tutorial.js" defer></script>
</body></html>
`
  fs.writeFileSync(path.join(OUT, pageFile(`lesson_${pad(l.n)}`, lang)), page)
  return env
}

function renderReference(lang, name, list) {
  const ui = UI[lang]
  const { meta, html, env, md } = render(lang, `${name}.md`)
  const inl = s => md.renderInline(String(s || ''), newEnv(lang))
  const page = `${head(lang, `${meta.title} — ${ui.series}`, meta.lead)}
<body class="reference" data-lessons="${list.length}">
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
<nav class="module-nav"><a class="mnav prev" href="${pageFile('index', lang)}"><span class="mnav-label">&larr; ${ui.index}</span><span class="mnav-title">${ui.series}</span></a><a class="mnav next" href="${pageFile(name === 'cheatsheet' ? 'troubleshooting' : 'cheatsheet', lang)}"><span class="mnav-label">${ui.reference} &rarr;</span><span class="mnav-title">${ui[name === 'cheatsheet' ? 'troubleshooting' : 'cheatsheet']}</span></a></nav>
  </main>
</div>
${footer(lang)}
<script src="assets/widgets.js" defer></script>
<script src="assets/tutorial.js" defer></script>
</body></html>
`
  fs.writeFileSync(path.join(OUT, pageFile(name, lang)), page)
  return env
}

function renderIndex(lang, list) {
  const ui = UI[lang]
  const { meta, html, md } = render(lang, 'index.md', { plainHeadings: true })
  const inl = s => md.renderInline(String(s || ''), newEnv(lang))
  const cards = `<div class="index-grid">${list.map(l => `<a class="module-card" href="${pageFile(`lesson_${pad(l.n)}`, lang)}" data-lesson="${l.n}"><div class="card-top"><span class="card-num">${lessonLabel(l.n, lang)}</span><span class="card-time">${l.meta.minutes} ${ui.minutes}</span></div><div class="card-title">${escapeHtml(l.meta.title)}</div><div class="card-desc">${inl(l.meta.lead)}</div><div class="card-done" aria-hidden="true">&#10003;</div></a>`).join('')}</div>`
  const progress = `<div class="index-progress" data-label="${escapeHtml(ui.progress('{d}', '{n}'))}"><div class="ip-bar"><span></span></div><span class="ip-text"></span><a class="ip-next" href="${pageFile('lesson_01', lang)}" data-start="${escapeHtml(ui.start)}" data-resume="${escapeHtml(ui.resume)}">${ui.start} &rarr;</a></div>`
  const [before, after] = html.split('<!-- lessons -->')
  const total = list.reduce((a, l) => a + Number(l.meta.minutes || 0), 0)
  const page = `${head(lang, `${ui.series} — ${lang === 'zh' ? '入门教程' : 'a beginner\'s tutorial'}`, meta.lead)}
<body class="index-page" data-lessons="${list.length}">
<nav class="site-nav"><a class="nav-brand" href="../../tutorials/">Ran <span>Wei</span></a><span class="nav-sep">/</span><a class="nav-crumb" href="${pageFile('index', lang)}">${ui.crumb}</a><a class="lang-switch" href="${pageFile('index', lang === 'en' ? 'zh' : 'en')}">${ui.switchTo}</a></nav>
<div class="index-hero">
  <h1>${meta.title_html || escapeHtml(ui.series)}</h1>
  <p class="lead">${inl(meta.lead)}</p>
  <div class="hero-tags"><span class="tag tag-module">${list.length} ${lang === 'zh' ? '课' : 'lessons'}</span><span class="tag tag-theme">${lang === 'zh' ? `约 ${Math.round(total / 60)} 小时` : `about ${Math.round(total / 60)} hours`}</span><span class="tag tag-time">Windows · macOS · Linux</span><span class="tag tag-time">EN · 中文</span></div>
  ${progress}
</div>
<div class="index-body content">
${before || ''}
</div>
${cards}
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
  fs.mkdirSync(ad, { recursive: true })
  for (const f of fs.readdirSync(path.join(ROOT, 'src', 'assets'))) fs.copyFileSync(path.join(ROOT, 'src', 'assets', f), path.join(ad, f))
  const wd = path.join(ROOT, 'src', 'widgets')
  const parts = fs.existsSync(wd) ? fs.readdirSync(wd).filter(f => f.endsWith('.js')).sort().map(f => `/* ---- ${f} ---- */\n` + read(path.join(wd, f))) : []
  fs.writeFileSync(path.join(ad, 'widgets.js'), parts.join('\n;\n') || '/* no widgets */\n')
  const img = path.join(ROOT, 'src', 'images')
  if (fs.existsSync(img)) for (const f of fs.readdirSync(img)) fs.copyFileSync(path.join(img, f), path.join(ad, f))
}

// ---------- CLI ----------
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  fs.mkdirSync(OUT, { recursive: true })
  copyAssets()
  for (const lang of LANGS) {
    const list = lessons(lang)
    if (!list.length) continue
    for (const l of list) {
      const env = renderLesson(lang, l, list)
      console.log(`built ${pageFile(`lesson_${pad(l.n)}`, lang)}  sections=${env.sections.length} terminal=${env.counts.terminal} files=${env.counts.file} figures=${env.counts.figure} quiz=${env.counts.quiz} trouble=${env.counts.trouble}`)
    }
    for (const r of ['cheatsheet', 'troubleshooting']) if (fs.existsSync(path.join(ROOT, 'src', lang, `${r}.md`))) { renderReference(lang, r, list); console.log(`built ${pageFile(r, lang)}`) }
    if (fs.existsSync(path.join(ROOT, 'src', lang, 'index.md'))) { renderIndex(lang, list); console.log(`built ${pageFile('index', lang)}`) }
  }
  if (problems.length) { console.log(`\n${problems.length} problem(s):`); for (const p of problems) console.log('  ' + p) }
  void LABELS
  process.exit(problems.length ? 1 : 0)
}
