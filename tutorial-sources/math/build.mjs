// Reproducible maths pages. Reuses the repository's Markdown dialect without
// changing or building the AI series. Run: node tutorial-sources/math/build.mjs
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {makeMd, newEnv, escapeHtml as esc, KATEX_MACROS} from '../ai/tools/md.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(ROOT, '../..');
const DEST = path.join(REPO, 'docs/tutorials/math');
const require = createRequire(path.join(ROOT, '../ai/tools/package.json'));
const katex = require('katex');
const PYTHON = process.env.MATH_PYTHON || 'python';
const roadmap = JSON.parse(fs.readFileSync(path.join(DEST, 'plan.json'), 'utf8'));
const pad = n => String(n).padStart(2, '0');
const file = (n, lang) => `module_${pad(n)}_${lang === 'en' ? 'EN' : 'ZH'}.html`;
const overview = lang => lang === 'en' ? 'index.html' : 'index_ZH.html';
const other = lang => lang === 'en' ? 'zh' : 'en';
const UI = {
  en: {series:'Mathematical Foundations for Computer Science and AI', crumb:'Maths Series', module:'Module', contents:'Contents', skip:'Skip to content', outcomes:'By the end you can', before:'Before you start', progress:'Progress', completed:'sessions done', study:'Study plan', session:'Session', done:'Done', min:'min', hours:'hours', language:'中文', roadmap:'Full roadmap', available:'Available', planned:'Planned', download:'Download', output:'Captured output', overview:'Course overview', next:'Next module', read:'Read', lab:'Lab', exercises:'Exercises', quiz:'Quiz', papers:'Reading', review:'Review'},
  zh: {series:'计算机科学与人工智能的数学基础', crumb:'数学系列', module:'模块', contents:'目录', skip:'跳到正文', outcomes:'完成后你能够', before:'开始之前', progress:'进度', completed:'个时段已完成', study:'学习计划', session:'时段', done:'已完成', min:'分钟', hours:'小时', language:'English', roadmap:'完整路线', available:'已开放', planned:'计划中', download:'下载', output:'实际运行输出', overview:'课程概览', next:'下一模块', read:'阅读', lab:'实验', exercises:'练习', quiz:'自测', papers:'阅读', review:'复习'}
};
const NOTICE = '<!-- Created by Ran Wei · Licensed under CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/) -->';
fs.mkdirSync(path.join(DEST, 'assets'), {recursive:true});
fs.mkdirSync(path.join(DEST, 'labs'), {recursive:true});
fs.copyFileSync(path.join(ROOT,'requirements.txt'),path.join(DEST,'labs/requirements.txt'));
fs.cpSync(path.join(ROOT, 'assets'), path.join(DEST, 'assets'), {recursive:true});
const katexDist = path.dirname(require.resolve('katex/dist/katex.min.css'));
fs.copyFileSync(path.join(katexDist,'katex.min.css'), path.join(DEST,'assets/katex.min.css'));
fs.cpSync(path.join(katexDist,'fonts'), path.join(DEST,'assets/fonts'), {recursive:true});
fs.copyFileSync(path.join(katexDist,'../LICENSE'), path.join(DEST,'assets/KATEX-LICENSE.txt'));

const published = [];
const buildRecords = [];
const labDirectory = meta => meta.labDirectory || `module_${pad(meta.number)}`;

function runLabs(meta) {
  const results = {};
  for (const lab of meta.labs || []) {
    const folder = path.join(ROOT,'labs',labDirectory(meta));
    const artifactDir = path.join(ROOT,'artifacts',labDirectory(meta));
    fs.mkdirSync(artifactDir,{recursive:true});
    const args = [path.join(folder,lab.file)];
    if (lab.plot) args.push('--output',path.join(artifactDir,lab.plot));
    const process = spawnSync(PYTHON,args,{cwd:folder,encoding:'utf8',timeout:30000});
    if (process.error || process.status !== 0) throw new Error(`Lab ${lab.file} failed: ${process.error || process.stderr}`);
    const destination = path.join(DEST,'labs',labDirectory(meta));
    fs.mkdirSync(destination,{recursive:true});
    fs.copyFileSync(path.join(folder,lab.file),path.join(destination,lab.file));
    results[lab.id] = {code:fs.readFileSync(path.join(folder,lab.file),'utf8'),output:process.stdout.replace(/\r\n/g,'\n')};
    fs.writeFileSync(path.join(artifactDir,`${lab.id}.output.txt`),results[lab.id].output);
    if (lab.plot) fs.copyFileSync(path.join(artifactDir,lab.plot),path.join(DEST,'assets',`m${pad(meta.number)}-${lab.plot}`));
  }
  return results;
}

function head(title,lead,lang) {
  return `${NOTICE}\n<!DOCTYPE html><html lang="${lang === 'en' ? 'en' : 'zh-CN'}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(title)} — ${esc(UI[lang].series)}</title><meta name="description" content="${esc(lead)}"><link rel="icon" type="image/svg+xml" href="assets/favicon.svg"><link rel="stylesheet" href="assets/style.css"><link rel="stylesheet" href="assets/katex.min.css"></head>`;
}

function footer(lang) {
  return `<footer class="site-footer">${lang === 'en' ? 'Created by' : '作者'} Ran Wei · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></footer>`;
}

function studyPlan(meta,lang,source) {
  if (!meta.sessions?.length) return '';
  const L=UI[lang];
  assert.equal(meta.sessions.reduce((a,s)=>a+s.minutes,0),meta.hours*60,'Session total matches hours');
  const cards = meta.sessions.map((session,index)=>{
    assert.equal(session.activities.reduce((a,x)=>a+x.minutes,0),session.minutes);
    const activities=session.activities.map(a=>`<li class="act act-${a.kind}"><span class="act-kind">${L[a.kind]}</span><span class="act-what"><a href="#${a.anchor}">${esc(a.text[lang])}</a></span><span class="act-min">${a.minutes}</span></li>`).join('');
    return `<div class="session"><div class="session-head"><span class="session-n">${L.session} ${index+1}</span><span class="session-min">${session.minutes} ${L.min}</span></div><div class="session-title">${esc(session.title[lang])}</div><ul class="acts">${activities}</ul><label class="session-done"><input type="checkbox" data-key="math-series:m${pad(meta.number)}:s${index+1}"> ${L.done}</label></div>`;
  }).join('');
  const extensionMinutes=[...source.matchAll(/::: exercise #e(?:13|14)\b[^\r\n]*\bminutes=(\d+)/g)].reduce((sum,match)=>sum+Number(match[1]),0);
  const extensionText=extensionMinutes ? (lang==='en'?`Optional extension exercises add ${extensionMinutes} minutes. `:`可选拓展练习额外需要 ${extensionMinutes} 分钟。`):'';
  const planLead=meta.planLead?.[lang]||(lang==='en' ? `Times include practice and are estimates. Split a session when useful. ${extensionText}Progress is stored in this browser and shared between language editions.` : `时间包含练习，是估计值；可按需要拆分时段。${extensionText}进度保存在当前浏览器，中英文版本共享。`);
  return `<section class="plan" id="plan"><div class="plan-head"><h2 class="plan-title">${L.study}</h2><span class="plan-total">${meta.hours} ${L.hours}</span></div><p class="plan-lead">${esc(planLead)}</p><div class="sessions">${cards}</div></section>`;
}

function renderSource(source,meta,lang,labs={}) {
  const L=UI[lang];
  source=source.replace(/\{\{LAB:(lab\d+)\}\}/g,(_,id)=>{
    const lab=meta.labs.find(x=>x.id===id), result=labs[id];
    assert(lab && result,`Known lab ${id}`);
    let html=`<p><a href="labs/${labDirectory(meta)}/${lab.file}" download>${L.download} ${lab.file}</a></p>\n\n\`\`\`python\n${result.code.trimEnd()}\n\`\`\`\n\n\`\`\`output\n${result.output.trimEnd()}\n\`\`\`\n`;
    if(lab.plot) html+=`\n<figure class="lab-plot"><img src="assets/m${pad(meta.number)}-${lab.plot}" alt="${esc(lab.plotAlt?.[lang]||(lang==='en'?'Linear, square, exponential and logarithmic curves on shared axes; the logarithm is defined only for positive inputs.':'同一坐标轴上的一次、平方、指数与对数曲线；对数仅在正输入上有定义。'))}" loading="lazy"><figcaption>${lang==='en'?'Plot generated by the downloadable Python script.':'可下载的 Python 脚本生成的图像。'}</figcaption></figure>\n`;
    return html;
  });
  assert(!source.includes('{{LAB:'),'All lab markers expanded');
  const env=newEnv();
  const md=makeMd({lang,figDirs:[path.join(ROOT,'src/figures',lang)]});
  let html=md.render(source,env);
  assert.deepEqual(env.errors,[]);
  assert.deepEqual(env.missingFigures,[]);
  let count=0;
  html=html.replace(/<(span|div) class="math-([id])">[\s\S]*?<\/\1>/g,(_,tag,mode)=>{
    const expression=env.math[count++];
    assert(expression,'Math order matches rendered spans');
    const rendered=katex.renderToString(expression.tex,{displayMode:mode==='d',throwOnError:true,strict:'ignore',macros:KATEX_MACROS});
    return `<${tag} class="math-${mode}" data-done="1">${rendered}</${tag}>`;
  });
  assert.equal(count,env.math.length,'Every formula is rendered at build time');
  if(meta.number>0 && meta.number<=30) {
    assert.equal(env.counts.exercise,14);
    assert.equal(env.counts.solution,14);
    assert.equal(env.counts.quiz,9);
    assert.equal(env.counts.output,3);
    assert(env.counts.figure>=3 && env.counts.figure<=6);
    assert.equal(env.counts.widget,1);
    assert.equal(env.sections.filter(s=>/^s[1-6]$/.test(s.id)).length,6);
    assert(env.counts.worked>=6 && env.counts.check>=6);
    assert(source.includes('data-free-response'),'Written quiz response is present');
  }
  if(meta.number===31 || meta.number===32){
    assert.equal(env.counts.output,3,'Capstone contains three executed reference scripts');
    assert.equal(env.counts.figure,4,'Capstone contains four original figures');
    for(const id of ['contract','st1','st2','st3','st4','proofs','complexity','appendix','rubric','assessment','reading'])assert(html.includes(`id="${id}"`),`Capstone section ${id}`);
    assert(source.includes(`data-key="math-series:m${meta.number}:report"`),'Capstone defence is saved independently');
  }
  return {html,env};
}

function lesson(meta,lang,source,labs,slug=null) {
  const L=UI[lang];
  const title=meta.title[lang];
  const lead=meta.lead[lang];
  const current=slug ? `${slug}_${lang==='en'?'EN':'ZH'}.html` : file(meta.number,lang);
  const switched=slug ? `${slug}_${lang==='en'?'ZH':'EN'}.html` : file(meta.number,other(lang));
  const {html,env}=renderSource(source,meta,lang,labs);
  const toc=env.sections.map((s,i)=>`<a href="#${s.id}"><span class="num">${i+1}</span><span>${esc(s.title)}</span></a>`).join('');
  const mobile=env.sections.map(s=>`<a href="#${s.id}">${esc(s.title)}</a>`).join('');
  const sessions=meta.sessions?.length||0;
  const progress=sessions ? `<div class="side-progress"><div class="side-progress-label">${L.progress}: <span class="side-progress-n">0</span>/${sessions} ${L.completed}</div><div class="side-progress-bar"><span></span></div></div>`:'';
  const chips=[`${meta.hours} ${L.hours}`];
  if(sessions)chips.push(`${sessions} ${lang==='en'?'sessions':'个时段'}`);
  if(meta.labs?.length)chips.push(`${meta.labs.length} ${lang==='en'?'labs':'个实验'}`);
  if(meta.number>0 && meta.number<=30)chips.push(lang==='en'?'12 exercises + 2 extensions':'12 道练习与 2 道拓展',lang==='en'?'10 quiz questions':'10 道自测题');
  const items=(meta.outcomes?.[lang]||[]).map(x=>`<li>${esc(x)}</li>`).join('');
  const badge=slug ? title : `${L.module} ${pad(meta.number)}`;
  let page=head(title,lead,lang)+`<body data-module="${meta.number??slug}"><a class="skip-link" href="#main">${L.skip}</a><div id="progress-bar"></div><header id="topbar"><a href="../../tutorials/" class="brand">Ran <span>Wei</span></a><span class="sep">/</span><a href="${overview(lang)}" class="crumb">${L.crumb}</a><div class="module-dropdown" id="moduleDropdown"><button class="badge" type="button" aria-expanded="false" aria-controls="module-menu">${esc(badge)}</button><div class="dropdown-menu" id="module-menu"><a href="${current}" class="active" aria-current="page">${esc(title)}</a><a href="${overview(lang)}#modules">${L.roadmap}</a></div></div><a class="lang-switch" href="${switched}" hreflang="${other(lang)==='en'?'en':'zh-CN'}">${L.language}</a></header><div id="layout"><aside id="sidebar">${progress}<div class="sidebar-label">${L.contents}</div><nav aria-label="${L.contents}">${toc}</nav></aside><main id="main"><div class="module-hero"><div class="series">${L.series} — Ran Wei</div><h1 class="module-title">${esc(title)}</h1><p class="module-lead">${esc(lead)}</p><div class="hero-chips">${chips.map((c,i)=>`<span class="chip${i===0?' chip-time':''}">${c}</span>`).join('')}</div></div><section class="glance"><div class="glance-col"><h2 class="glance-h">${L.outcomes}</h2><ul class="outcomes">${items}</ul></div><div class="glance-col"><h2 class="glance-h">${L.before}</h2><p>${esc(meta.prerequisites?.[lang]||'')}</p></div></section><details class="mobile-toc"><summary>${L.contents}</summary><nav aria-label="${L.contents}">${mobile}</nav></details>${studyPlan(meta,lang,source)}<div class="content">${html}</div><nav class="module-nav" aria-label="${L.roadmap}"><a href="${overview(lang)}">← ${L.overview}</a><a href="${overview(lang)}#modules">${L.roadmap} →</a></nav>${footer(lang)}</main></div><script src="../ai/assets/tutorial.js" defer></script><script src="assets/widgets.js" defer></script></body></html>`;
  if(!slug){
    const complete=n=>n>=0 && ['en','zh'].every(language=>fs.existsSync(path.join(ROOT,`src/${language}/module_${pad(n)}.md`))) && fs.existsSync(path.join(ROOT,`plan/module_${pad(n)}.json`));
    const back=complete(meta.number-1)?`<a href="${file(meta.number-1,lang)}">← ${L.module} ${pad(meta.number-1)}</a>`:`<a href="${overview(lang)}">← ${L.overview}</a>`;
    const forward=complete(meta.number+1)?`<a href="${file(meta.number+1,lang)}">${L.module} ${pad(meta.number+1)} →</a>`:`<a href="${overview(lang)}#modules">${L.roadmap} →</a>`;
    page=page.replace(/<nav class="module-nav"[\s\S]*?<\/nav>/,`<nav class="module-nav" aria-label="${L.roadmap}">${back}${forward}</nav>`);
  }
  fs.writeFileSync(path.join(DEST,current),page);
  buildRecords.push({file:current,sections:env.sections.map(s=>s.id),counts:env.counts,formula_count:env.math.length});
}

function index(lang) {
  const L=UI[lang];
  const cards=roadmap.modules.map(m=>{
    const available=published.includes(m.number);
    const tag=available?'a':'article';
    const href=available?` href="${file(m.number,lang)}"`:'';
    const title=m.title[lang==='en'?'en':'zh-CN'];
    const summary=lang==='en'?(m.lesson_sequence?.slice(0,2).join(' ')||m.problem):(m.number>=31?'综合运用数学，完成可解释、可验证的项目。':title+'：定义、计算、推导与实践。');
    return `<${tag}${href} class="module-card${available?'':' planned'}"><div class="card-num">${L.module} ${pad(m.number)}</div><div class="card-title">${esc(title)}</div><div class="card-desc">${esc(summary)}</div><div class="card-status">${available?L.available:L.planned} · ${m.hours} ${L.hours}</div><div class="card-footer"><span class="card-theme">${m.part}</span><span class="card-lang">EN · 中文</span></div></${tag}>`;
  }).join('');
  const intro=lang==='en'?'Build mathematical fluency for programs, algorithms, data, and learning systems. Start with precise notation, then follow the CS or AI route.':'掌握程序、算法、数据与学习系统所需的数学。从精确记法开始，再沿计算机科学或人工智能路线学习。';
  const complete=published.length===roadmap.modules.length;
  const availability=complete?(lang==='en'?'All 32 modules, including both capstone projects, are available in English and Simplified Chinese.':'全部 32 个模块，包括两个综合项目，均已提供英文及简体中文版本。'):(lang==='en'?`${published.length===1?'Module':'Modules'} ${published.map(pad).join(', ')} ${published.length===1?'is':'are'} available in English and Chinese. Other modules remain planned; their cards describe the curriculum without linking to unfinished lessons.`:`模块 ${published.map(pad).join('、')} 已提供中英文版本。其他模块仍在计划中；卡片介绍课程内容，不链接尚未完成的课程。`);
  const study=lang==='en'?'Predict before calculating. State the domain, show intermediate steps, and explain why an answer is valid. Modules 01–30 combine worked examples, three runnable labs, exercises with complete solutions, an interactive explorer and a ten-question review. The capstones provide implemented reference projects, proof obligations, actual outputs and assessment rubrics. Progress and written reviews are saved in this browser.':'先预测，再计算。说明定义域、展示中间步骤并解释答案为何有效。模块 01–30 含例题、三个可运行实验、完整练习解答、交互演示和十题复习。综合项目提供已实现参考、证明义务、实际输出与评分标准。进度和书面复习保存在当前浏览器。';
  const supportPages=[pages[0],{slug:'module_00',title:{en:'Optional algebra refresher',zh:'可选代数复习'}},...pages.slice(1)];
  const support=supportPages.map(p=>`<a href="${p.slug}_${lang==='en'?'EN':'ZH'}.html">${esc(p.title[lang])}</a>`).join(' · ');
  const routes=roadmap.routes.map(r=>`<tr><td>${esc(lang==='en'?r.title:({full:'完整基础',cs:'计算机科学核心',ai:'人工智能基础',ai_entry:'现有 AI 系列的数学准备'})[r.id])}</td><td>${r.modules.map(pad).join(', ')}</td><td>${r.hours}</td></tr>`).join('');
  const body=`<body class="index-page"><a class="skip-link" href="#main">${L.skip}</a><nav class="site-nav" aria-label="${L.roadmap}"><a class="nav-brand" href="../../tutorials/">Ran <span>Wei</span></a><span class="nav-sep">/</span><span class="nav-crumb">${L.crumb}</span><a class="lang-switch" href="${overview(other(lang))}" hreflang="${other(lang)==='en'?'en':'zh-CN'}">${L.language}</a></nav><main id="main" style="max-width:none;padding:0"><div class="index-hero"><h1>${L.series}</h1><p class="lead">${intro}</p><div class="hero-tags"><span class="tag tag-module">32 ${lang==='en'?'modules':'个模块'}</span><span class="tag tag-time">328 ${L.hours}</span><span class="tag tag-theme">EN / 中文</span></div></div><div class="index-body"><h2>${lang==='en'?'Start here':'从这里开始'}</h2><p>${support}</p><p>${availability}</p><h2>${lang==='en'?'How to study':'学习方式'}</h2><p>${study}</p><h2>${lang==='en'?'Choose a route':'选择路线'}</h2><div class="table-wrap"><table><thead><tr><th>${lang==='en'?'Route':'路线'}</th><th>${lang==='en'?'Modules':'模块'}</th><th>${L.hours}</th></tr></thead><tbody>${routes}</tbody></table></div><p>${lang==='en'?'Hours cover the full curriculum; probability has a discrete CS branch and a continuous AI branch. The complete syllabus records conditional prerequisites and optional extensions.':'时间涵盖完整课程；概率分离散 CS 分支与连续 AI 分支。大纲列明条件先修及可选拓展。'}</p><p><a href="PLAN/">${lang==='en'?'Detailed curriculum and production plan (English)':'详细课程与制作计划（英文）'}</a> · <a href="plan.json">${lang==='en'?'Roadmap metadata':'路线元数据'}</a></p><h2 id="modules">${lang==='en'?'The modules':'模块列表'}</h2></div><div class="index-grid">${cards}</div></main>${footer(lang)}<script src="assets/widgets.js" defer></script></body></html>`;
  fs.writeFileSync(path.join(DEST,overview(lang)),head(L.series,intro,lang)+body);
}

for(const name of fs.readdirSync(path.join(ROOT,'plan')).filter(n=>/^module_\d\d\.json$/.test(n)).sort()) {
  const meta=JSON.parse(fs.readFileSync(path.join(ROOT,'plan',name),'utf8'));
  const sources=['en','zh'].map(lang=>path.join(ROOT,'src',lang,`module_${pad(meta.number)}.md`));
  assert(sources.every(p=>fs.existsSync(p)),`${name}: both languages required`);
  const labs=runLabs(meta);
  for(const [i,lang] of ['en','zh'].entries())lesson(meta,lang,fs.readFileSync(sources[i],'utf8'),labs);
  if(meta.number>0)published.push(meta.number);
}
const pages=JSON.parse(fs.readFileSync(path.join(ROOT,'plan/pages.json'),'utf8'));
for(const meta of pages){const labs=runLabs(meta);for(const lang of ['en','zh'])lesson(meta,lang,fs.readFileSync(path.join(ROOT,'src',lang,`${meta.slug}.md`),'utf8'),labs,meta.slug);}
for(const lang of ['en','zh'])index(lang);
roadmap.status=published.length===roadmap.modules.length?'complete':'in_progress';
for(const m of roadmap.modules)m.status=published.includes(m.number)?'available':'planned';
roadmap.supplementary_modules[0].status='available';
roadmap.published_modules=published;
fs.writeFileSync(path.join(DEST,'plan.json'),JSON.stringify(roadmap,null,2)+'\n');
fs.mkdirSync(path.join(ROOT,'artifacts'),{recursive:true});
fs.writeFileSync(path.join(ROOT,'artifacts/build-report.json'),JSON.stringify({published,records:buildRecords},null,2)+'\n');
console.log(`Built ${buildRecords.length} bilingual lesson/support pages and 2 overviews. Published modules: ${published.join(', ')}. Every formula rendered and every lab executed.`);
