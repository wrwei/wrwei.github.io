import fs from 'node:fs'
import path from 'node:path'
import {createRequire} from 'node:module'
import {fileURLToPath} from 'node:url'
import {escapeHtml as html, finish, frontMatter, makeMd, newEnv} from '../../calculus/tools/md.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
const calculus = path.resolve(root, '../calculus')
const math = path.resolve(root, '../math')
const require = createRequire(path.join(calculus, 'tools', 'package.json'))
const katex = path.dirname(require.resolve('katex/package.json')) + '/dist'
const source = path.join(root, 'src/en')
const out = process.argv[2] ? path.resolve(process.argv[2]) : path.join(root, 'out/site')
const zip = 'linear-algebra-code.zip'
const md = makeMd()
const core = ['formulas', 'glossary', 'mistakes']
const title = 'Linear Algebra'
const parts = ['Vectors and linear systems', 'Structure and approximation', 'Spectra and data']
const pad = n => String(n).padStart(2, '0')
const lessonFile = n => 'module_' + pad(n) + '_EN.html'
const pageFile = name => name === 'index' ? 'index.html' : name + '_EN.html'
const files = fs.readdirSync(source).filter(name => name.startsWith('module_')).sort()
const lessons = files.map((file, i) => {
  if (file !== 'module_' + pad(i + 1) + '.md') throw new Error('Out-of-order module ' + file)
  return {name: file.slice(0, -3), n: i + 1}
})
const problems = []
const pages = new Map()

for (const name of ['index', ...core, ...lessons.map(lesson => lesson.name)]) {
  const {meta, body} = frontMatter(fs.readFileSync(path.join(source, name + '.md'), 'utf8'))
  const env = newEnv()
  env.moduleNo = lessons.find(lesson => lesson.name === name)?.n || 0
  env.plainHeadings = name === 'index'
  const content = finish(md.render(body, env), env)
  problems.push(...env.errors.map(problem => name + ': ' + problem))
  if (env.moduleNo && (!meta.needs || !Number(meta.minutes) || !parts[Number(meta.part) - 1] ||
      (!Array.isArray(meta.goals) || meta.goals.length < 3) || env.counts.exercise < 3 || env.counts.quiz < 3)) {
    problems.push(name + ': missing lesson metadata, exercises or quiz questions')
  }
  pages.set(name, {meta, env, content})
}
for (const lesson of lessons) lesson.meta = pages.get(lesson.name).meta

const links = core.map(name => '<a href="' + pageFile(name) + '">' + html(pages.get(name).meta.title) + '</a>').join('')
const download = '<a href="' + zip + '">Download the Python examples</a>'
const inline = text => md.renderInline(String(text || ''), newEnv())

function shell(pageTitle, lead, body, attributes = '', widget = false) {
  const fonts = 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&display=swap'
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${html(pageTitle)} · Linear Algebra</title>
<meta name="description" content="${html(lead)}">
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="${html(fonts)}"><link rel="stylesheet" href="assets/katex.min.css">
<link rel="stylesheet" href="assets/style.css"><link rel="stylesheet" href="assets/linear-algebra.css"></head>
<body data-series="linear-algebra" data-lessons="${lessons.length}" ${attributes}>
${body}
<footer class="site-footer"><p>Ran Wei · <a href="../../tutorials/">Tutorials</a></p></footer>
${widget ? '<script src="assets/widgets.js" defer></script>' : ''}<script src="assets/tutorial.js" defer></script>
</body></html>
`
}

function navigation(current) {
  const items = lessons.map(({n, meta}) => `<a href="${lessonFile(n)}"${n === current ? ' class="active"' : ''}><span class="dd-n">${n}</span>${html(meta.title)}<span class="dd-done" data-lesson="${n}"></span></a>`).join('')
  return `<div id="progress-bar"></div>
<header id="topbar"><a class="brand" href="../../tutorials/">Ran <span>Wei</span></a><span class="sep">/</span>
<a class="crumb" href="index.html">Linear Algebra</a>
<div id="moduleDropdown" class="module-dropdown"><button class="badge" type="button" aria-expanded="false" aria-haspopup="true">${current ? 'Module ' + current + ' of ' + lessons.length : 'Reference'}</button>
<div class="dropdown-menu">${items}<div class="dd-sep"></div>${links}</div></div></header>`
}

function renderLesson(page) {
  const {meta, env, content} = page
  const n = env.moduleNo
  const toc = env.sections.map(({id, n, title}) => `<a href="#${html(id)}"><span class="num">${n}</span><span class="side-t">${inline(title)}</span></a>`).join('')
  const goals = n ? `<section class="goals"><h2 class="goals-h">In this module you will</h2><ul>${meta.goals.map(g => '<li>' + inline(g) + '</li>').join('')}</ul></section>` : ''
  const metadata = n ? `<div class="hero-chips"><span class="chip chip-time">${meta.minutes} min</span><span class="chip chip-needs">You need ${inline(meta.needs)}</span></div>` : ''
  const done = n ? `<section class="done-box" data-lesson="${n}"><div class="done-q">Finished this module?</div><button type="button" class="done-btn" data-yes="Done" data-no="Mark as done" data-undo="Mark as not done">Mark as done</button><div class="done-progress" data-label="{d} of {n} modules done"></div></section>` : ''
  const next = lessons[n]
  const prev = lessons[n - 2]
  const bottom = `<nav class="module-nav"><a class="mnav prev" href="${prev ? lessonFile(prev.n) : 'index.html'}"><span class="mnav-label">${prev ? 'Previous' : 'All modules'}</span><span class="mnav-title">${html(prev?.meta.title || title)}</span></a>
${next && n ? '<a class="mnav next" href="' + lessonFile(next.n) + '"><span class="mnav-label">Next</span><span class="mnav-title">' + html(next.meta.title) + '</span></a>' : ''}</nav>`
  return shell(meta.title, meta.lead, `
${navigation(n)}<div id="layout">
<aside id="sidebar"><div class="sidebar-label">On this page</div><nav>${toc}</nav>
<div class="sidebar-label">Reference</div><div class="side-links">${links}${download}</div></aside>
<main id="main"><div class="module-hero"><div class="series">Linear Algebra · ${n ? html(parts[Number(meta.part) - 1]) : 'Reference'}</div>
<h1 class="module-title">${n ? '<span class="title-n">Module ' + n + '</span>' : ''}${html(meta.title)}</h1>
<p class="module-lead">${inline(meta.lead)}</p>${metadata}</div>${goals}
<div class="content">${content}</div>${done}${bottom}</main></div>`, n ? 'data-lesson="' + n + '"' : 'class="reference"', env.widgets.length > 0)
}

function renderIndex({meta, content}) {
  const groups = parts.map((part, i) => {
    const cards = lessons.filter(lesson => Number(lesson.meta.part) === i + 1).map(({n, meta}) =>
      `<a class="module-card" href="${lessonFile(n)}" data-lesson="${n}"><div class="card-top"><span class="card-num">Module ${n}</span><span class="card-time">${meta.minutes} min</span></div><div class="card-title">${html(meta.title)}</div><div class="card-desc">${inline(meta.lead)}</div><div class="card-done" aria-hidden="true">✓</div></a>`).join('')
    return `<section class="index-part"><h2 class="part-h">${html(part)}</h2><div class="index-grid">${cards}</div></section>`
  }).join('')
  const [before, after] = content.split('<!-- modules -->')
  return shell(title, meta.lead, `
<nav class="site-nav"><a class="nav-brand" href="../../tutorials/">Ran <span>Wei</span></a><span class="nav-sep">/</span><a class="nav-crumb" href="index.html">Linear Algebra</a></nav>
<main><header class="index-hero"><h1>Linear Algebra</h1><p class="lead">${inline(meta.lead)}</p>
<div class="index-progress" data-label="{d} of {n} modules done"><div class="ip-bar"><span></span></div><span class="ip-text"></span><a class="ip-next" data-resume="Continue with" href="${lessonFile(1)}">Start with Module 1 →</a></div></header>
<div class="index-body">${before}</div>${groups}<div class="index-body">${after}</div></main>`, 'class="index-page"')
}

const rendered = new Map([...pages].map(([name, page]) => [
  pageFile(name), name === 'index' ? renderIndex(page) : renderLesson(page)
]))
for (const [name, page] of rendered) {
  const anchors = new Set([...page.matchAll(/\bid="([\w-]+)"/g)].map(match => match[1]))
  for (const [, target, anchor] of page.matchAll(/href="([\w-]+\.html)?(?:#([\w-]+))?"/g)) {
    if (target && !rendered.has(target)) problems.push(name + ': missing link target ' + target)
    if (!target && anchor && !anchors.has(anchor)) problems.push(name + ': missing anchor ' + anchor)
    if (target && anchor && rendered.has(target) && !rendered.get(target).includes('id="' + anchor + '"'))
      problems.push(name + ': missing anchor ' + target + '#' + anchor)
  }
}
if (problems.length) throw new Error(problems.join('\n'))
fs.mkdirSync(path.join(out, 'assets'), {recursive: true})
const assets = path.join(out, 'assets')
for (const name of ['style.css', 'tutorial.js', 'favicon.svg']) {
  fs.copyFileSync(path.join(calculus, 'src/assets', name), path.join(assets, name))
}
fs.copyFileSync(path.join(root, 'src/linear-algebra.css'), path.join(assets, 'linear-algebra.css'))
fs.copyFileSync(path.join(math, 'assets/widgets.js'), path.join(assets, 'widgets.js'))
fs.copyFileSync(path.join(katex, 'katex.min.css'), path.join(assets, 'katex.min.css'))
fs.cpSync(path.join(katex, 'fonts'), path.join(assets, 'fonts'), {recursive: true})
fs.copyFileSync(path.join(katex, '../LICENSE'), path.join(assets, 'KATEX-LICENSE.txt'))
fs.copyFileSync(path.join(root, 'out', zip), path.join(out, zip))
for (const [file, content] of rendered) fs.writeFileSync(path.join(out, file), content)
console.log('Built ' + rendered.size + ' Linear Algebra pages in ' + out)
