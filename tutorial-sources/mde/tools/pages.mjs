// Page templates for the MDE series. Reuses the AI series' Markdown dialect, styles and page script.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {makeMd, newEnv, escapeHtml as esc} from '../../ai/tools/md.mjs';
import {playgroundLink} from './bundle.mjs';
import {highlightBlocks} from './highlight.mjs';

export const EPSILON_VERSION = '2.8.0';
export const pad = n => String(n).padStart(2, '0');
export const lessonFile = (n, lang) => `module_${pad(n)}_${lang === 'en' ? 'EN' : 'ZH'}.html`;
export const overviewFile = lang => (lang === 'en' ? 'index.html' : 'index_ZH.html');
const other = lang => (lang === 'en' ? 'zh' : 'en');
const htmlLang = lang => (lang === 'en' ? 'en' : 'zh-CN');
const NOTICE = '<!-- Created by Ran Wei · Licensed under CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/) -->';

export const UI = {
  en: {
    series: 'Model-Driven Engineering with Eclipse Epsilon', crumb: 'MDE Series', module: 'Module', contents: 'Contents',
    skip: 'Skip to content', outcomes: 'By the end you can', before: 'Before you start', progress: 'Progress',
    completed: 'sessions done', study: 'Study plan', session: 'Session', done: 'Done', min: 'min', hours: 'hours',
    language: '中文', roadmap: 'All modules', available: 'Available', planned: 'Planned', overview: 'Series overview',
    read: 'Read', examples: 'Examples', exercises: 'Exercises', quiz: 'Quiz', reading: 'Reading',
    example: 'Example', solution: 'Solution', open: 'Open in Playground', files: 'More files',
    captured: `Output captured from Epsilon ${EPSILON_VERSION} when this page was built. The Playground may word messages differently and does not show warnings about the model.`,
    download: 'Download all examples of this module (zip)',
    planLead: 'Times are estimates and include running the examples. Progress is saved in this browser and shared by both language editions.',
  },
  zh: {
    series: '基于 Eclipse Epsilon 的模型驱动工程', crumb: 'MDE 系列', module: '模块', contents: '目录',
    skip: '跳到正文', outcomes: '完成后你能够', before: '开始之前', progress: '进度',
    completed: '个时段已完成', study: '学习计划', session: '时段', done: '已完成', min: '分钟', hours: '小时',
    language: 'English', roadmap: '全部模块', available: '已开放', planned: '计划中', overview: '系列概览',
    read: '阅读', examples: '示例', exercises: '练习', quiz: '自测', reading: '延伸阅读',
    example: '示例', solution: '参考解答', open: '在 Playground 中打开', files: '其他文件',
    captured: `以下输出由构建本页时的 Epsilon ${EPSILON_VERSION} 实际运行得到。Playground 中的提示措辞可能有所不同，并且不显示关于模型的警告。`,
    download: '下载本模块全部示例（zip）',
    planLead: '时间为估计值，包含运行示例的时间。进度保存在当前浏览器，中英文版本共享。',
  },
};

const FENCE = {eol: 'eol', evl: 'evl', egl: 'egl', egx: 'egx', etl: 'etl', emf: 'emfatic', flexmi: 'flexmi'};
const ORDER = ['program', 'secondProgram', 'flexmi', 'emfatic', 'secondEmfatic'];

function fileBlock(example, field) {
  const text = fs.readFileSync(path.join(example.dir, example[field]), 'utf8').replace(/\r\n/g, '\n').trimEnd();
  assert(!/^`{4,}/m.test(text), `${example.id}/${example[field]}: a line starts with four backticks`);
  return [`<div class="example-file">${esc(example[field])}</div>`, '', `\`\`\`\`${FENCE[example[field].split('.').pop()] || 'text'}`, text, '````', ''];
}

/** Replaces each line "{{EXAMPLE:id}}" with the example's files, Playground link and captured output. */
export function expandExamples(source, byId, lang, bundleUrl) {
  const L = UI[lang];
  const used = [];
  const markdown = source.replace(/^\{\{EXAMPLE:([a-z0-9-]+)\}\}[ \t]*$/gm, (_, id) => {
    const example = byId.get(id);
    assert(example, `Unknown example "${id}"`);
    used.push(id);
    const present = ORDER.filter(field => example[field]);
    const shown = example.show ?? ['program'];
    const hidden = present.filter(field => !shown.includes(field));
    return [
      `<div class="example" id="ex-${id}">`,
      `<div class="example-head"><span class="example-label">${example.role === 'solution' ? L.solution : L.example}</span><span class="example-title">${esc(example.title[lang])}</span><a class="playground-btn" href="${esc(playgroundLink(bundleUrl, id))}" target="_blank" rel="noopener">${L.open} ↗</a></div>`,
      '',
      ...shown.flatMap(field => fileBlock(example, field)),
      ...(hidden.length ? [`<details class="example-files"><summary>${L.files}: ${hidden.map(field => esc(example[field])).join(', ')}</summary>`, '', ...hidden.flatMap(field => fileBlock(example, field)), '</details>', ''] : []),
      `<div class="example-caption">${esc(L.captured)}</div>`,
      '',
      '````output',
      example.result.output.trimEnd(),
      '````',
      '',
      '</div>',
    ].join('\n');
  });
  assert(!markdown.includes('{{EXAMPLE:'), 'Every {{EXAMPLE:id}} marker must be on a line of its own');
  return {markdown, used};
}

function head(title, lead, lang) {
  return `${NOTICE}\n<!DOCTYPE html><html lang="${htmlLang(lang)}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(title)} — ${esc(UI[lang].series)}</title><meta name="description" content="${esc(lead)}"><link rel="icon" type="image/svg+xml" href="assets/favicon.svg"><link rel="stylesheet" href="assets/style.css"></head>`;
}

function footer(lang) {
  return `<footer class="site-footer">${lang === 'en' ? 'Created by' : '作者'} Ran Wei · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></footer>`;
}

function studyPlan(meta, lang) {
  const L = UI[lang];
  assert.equal(meta.sessions.reduce((sum, s) => sum + s.minutes, 0), meta.hours * 60, `Module ${meta.number}: sessions must add up to ${meta.hours} hours`);
  const cards = meta.sessions.map((session, index) => {
    assert.equal(session.activities.reduce((sum, a) => sum + a.minutes, 0), session.minutes, `Module ${meta.number} session ${index + 1}: activities must add up to the session`);
    const activities = session.activities.map(a => {
      assert(L[a.kind], `Unknown activity kind "${a.kind}"`);
      return `<li class="act act-${a.kind}"><span class="act-kind">${L[a.kind]}</span><span class="act-what"><a href="#${a.anchor}">${esc(a.text[lang])}</a></span><span class="act-min">${a.minutes}</span></li>`;
    }).join('');
    return `<div class="session"><div class="session-head"><span class="session-n">${L.session} ${index + 1}</span><span class="session-min">${session.minutes} ${L.min}</span></div><div class="session-title">${esc(session.title[lang])}</div><ul class="acts">${activities}</ul><label class="session-done"><input type="checkbox" data-key="mde-series:m${pad(meta.number)}:s${index + 1}"> ${L.done}</label></div>`;
  }).join('');
  return `<section class="plan" id="plan"><div class="plan-head"><h2 class="plan-title">${L.study}</h2><span class="plan-total">${meta.hours} ${L.hours}</span></div><p class="plan-lead">${esc(L.planLead)}</p><div class="sessions">${cards}</div></section>`;
}

/** Renders one lesson page. Returns the page and a record used for the English/Chinese parity check. */
export function renderLesson({meta, lang, source, byId, bundleUrl, series, published}) {
  const L = UI[lang];
  const file = lessonFile(meta.number, lang);
  assert(!source.includes('<!-- BRIEF'), `${file}: replace every <!-- BRIEF --> note with finished text`);
  const {markdown, used} = expandExamples(source, byId, lang, bundleUrl);
  const env = newEnv();
  const body = highlightBlocks(makeMd({lang}).render(markdown, env));
  assert.deepEqual(env.errors, [], `${file}: ${JSON.stringify(env.errors)}`);
  assert.equal(env.math.length, 0, `${file}: text between two "$" signs was read as maths; write \\$ for a literal dollar sign`);
  const record = {
    sections: env.sections.map(s => s.id),
    examples: used,
    exercises: env.counts.exercise,
    solutions: env.counts.solution,
    quizAnswers: [...body.matchAll(/class="quiz-q" data-answer="(\d+)"/g)].map(m => Number(m[1])),
  };
  const title = meta.title[lang];
  const toc = env.sections.map((s, i) => `<a href="#${s.id}"><span class="num">${i + 1}</span><span>${esc(s.title)}</span></a>`).join('');
  const mobile = env.sections.map(s => `<a href="#${s.id}">${esc(s.title)}</a>`).join('');
  const menu = published.map(n => {
    const m = series.modules.find(x => x.number === n);
    return `<a href="${lessonFile(n, lang)}"${n === meta.number ? ' class="active" aria-current="page"' : ''}>${pad(n)} · ${esc(m.title[lang])}</a>`;
  }).join('') + `<a href="${overviewFile(lang)}#modules">${L.roadmap}</a>`;
  const position = published.indexOf(meta.number);
  const previous = published[position - 1];
  const next = published[position + 1];
  const back = previous ? `<a href="${lessonFile(previous, lang)}">← ${L.module} ${pad(previous)}</a>` : `<a href="${overviewFile(lang)}">← ${L.overview}</a>`;
  const forward = next ? `<a href="${lessonFile(next, lang)}">${L.module} ${pad(next)} →</a>` : `<a href="${overviewFile(lang)}#modules">${L.roadmap} →</a>`;
  const chips = [`${meta.hours} ${L.hours}`, `${meta.sessions.length} ${lang === 'en' ? 'sessions' : '个时段'}`, `${used.length} ${lang === 'en' ? 'runnable examples' : '个可运行示例'}`, lang === 'en' ? 'Epsilon Playground' : 'Epsilon Playground'];
  const outcomes = meta.outcomes[lang].map(x => `<li>${esc(x)}</li>`).join('');
  const page = head(title, meta.lead[lang], lang)
    + `<body data-module="${meta.number}"><a class="skip-link" href="#main">${L.skip}</a><div id="progress-bar"></div>`
    + `<header id="topbar"><a href="../../tutorials/" class="brand">Ran <span>Wei</span></a><span class="sep">/</span><a href="${overviewFile(lang)}" class="crumb">${L.crumb}</a><div class="module-dropdown" id="moduleDropdown"><button class="badge" type="button" aria-expanded="false" aria-controls="module-menu">${L.module} ${pad(meta.number)}</button><div class="dropdown-menu" id="module-menu">${menu}</div></div><a class="lang-switch" href="${lessonFile(meta.number, other(lang))}" hreflang="${htmlLang(other(lang))}">${L.language}</a></header>`
    + `<div id="layout"><aside id="sidebar"><div class="side-progress"><div class="side-progress-label">${L.progress}: <span class="side-progress-n">0</span>/${meta.sessions.length} ${L.completed}</div><div class="side-progress-bar"><span></span></div></div><div class="sidebar-label">${L.contents}</div><nav aria-label="${L.contents}">${toc}</nav></aside>`
    + `<main id="main"><div class="module-hero"><div class="series">${L.series} — Ran Wei</div><h1 class="module-title">${esc(title)}</h1><p class="module-lead">${esc(meta.lead[lang])}</p><div class="hero-chips">${chips.map((c, i) => `<span class="chip${i === 0 ? ' chip-time' : ''}">${c}</span>`).join('')}</div></div>`
    + `<section class="glance"><div class="glance-col"><h2 class="glance-h">${L.outcomes}</h2><ul class="outcomes">${outcomes}</ul></div><div class="glance-col"><h2 class="glance-h">${L.before}</h2><p>${esc(meta.prerequisites[lang])}</p><p><a class="download-link" href="downloads/module_${pad(meta.number)}.zip" download>${L.download}</a></p></div></section>`
    + `<details class="mobile-toc"><summary>${L.contents}</summary><nav aria-label="${L.contents}">${mobile}</nav></details>${studyPlan(meta, lang)}<div class="content">${body}</div>`
    + `<nav class="module-nav" aria-label="${L.roadmap}">${back}${forward}</nav>${footer(lang)}</main></div><script src="../ai/assets/tutorial.js" defer></script></body></html>`;
  return {html: page, record};
}

/** English and Chinese editions must have the same structure. */
export function checkParity(en, zh, number) {
  for (const key of ['sections', 'examples', 'exercises', 'solutions', 'quizAnswers']) {
    assert.deepEqual(zh[key], en[key], `Module ${pad(number)}: the Chinese edition's ${key} differ from the English edition's`);
  }
}

/** A module's contract: plan/module_NN.json "contract". */
export function checkContract(record, contract, examples, number) {
  const where = `Module ${pad(number)}`;
  const teaching = examples.filter(e => (e.role ?? 'example') === 'example').length;
  assert(teaching >= contract.examples[0] && teaching <= contract.examples[1], `${where}: ${teaching} teaching examples; the contract allows ${contract.examples.join('–')}`);
  assert.deepEqual([...record.examples].sort(), examples.map(e => e.id).sort(), `${where}: every example and solution must be shown exactly once`);
  assert.equal(record.exercises, contract.exercises, `${where}: ${record.exercises} exercises; the contract needs ${contract.exercises}`);
  assert.equal(record.solutions, contract.exercises, `${where}: every exercise needs a worked solution`);
  const quiz = record.quizAnswers.length;
  assert(quiz >= contract.quiz[0] && quiz <= contract.quiz[1], `${where}: ${quiz} quiz questions; the contract allows ${contract.quiz.join('–')}`);
  for (const id of contract.sections) assert(record.sections.includes(id), `${where}: section {#${id}} is missing`);
}

/** The series overview: introduction, how to study, module cards and acknowledgements. */
export function renderOverview({series, published, lang}) {
  const L = UI[lang];
  const text = series.overview[lang];
  const cards = series.modules.map(m => {
    const available = published.includes(m.number);
    const tag = available ? 'a' : 'article';
    const href = available ? ` href="${lessonFile(m.number, lang)}"` : '';
    return `<${tag}${href} class="module-card${available ? '' : ' planned'}"><div class="card-num">${L.module} ${pad(m.number)}</div><div class="card-title">${esc(m.title[lang])}</div><div class="card-desc">${esc(m.summary[lang])}</div><div class="card-status">${available ? L.available : L.planned} · ${m.hours} ${L.hours}</div><div class="card-footer"><span class="card-theme">${esc(m.focus)}</span><span class="card-lang">EN · 中文</span></div></${tag}>`;
  }).join('');
  const hours = series.modules.reduce((sum, m) => sum + m.hours, 0);
  const paragraphs = list => list.map(p => `<p>${p}</p>`).join('');
  const body = `<body class="index-page"><a class="skip-link" href="#main">${L.skip}</a><nav class="site-nav" aria-label="${L.roadmap}"><a class="nav-brand" href="../../tutorials/">Ran <span>Wei</span></a><span class="nav-sep">/</span><span class="nav-crumb">${L.crumb}</span><a class="lang-switch" href="${overviewFile(other(lang))}" hreflang="${htmlLang(other(lang))}">${L.language}</a></nav>`
    + `<main id="main" style="max-width:none;padding:0"><div class="index-hero"><h1>${L.series}</h1><p class="lead">${esc(text.lead)}</p><div class="hero-tags"><span class="tag tag-module">${series.modules.length} ${lang === 'en' ? 'modules' : '个模块'}</span><span class="tag tag-time">${hours} ${L.hours}</span><span class="tag tag-theme">EN / 中文</span></div></div>`
    + `<div class="index-body"><h2>${lang === 'en' ? 'How to study' : '学习方式'}</h2>${paragraphs(text.study)}<h2 id="modules">${lang === 'en' ? 'The modules' : '模块列表'}</h2></div><div class="index-grid">${cards}</div>`
    + `<div class="index-body"><h2 id="acknowledgements">${lang === 'en' ? 'Acknowledgements' : '致谢'}</h2>${paragraphs(text.acknowledgements)}</div></main>${footer(lang)}</body></html>`;
  return head(L.series, text.lead, lang) + body;
}
