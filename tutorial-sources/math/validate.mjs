// Content, lab parity, and browser checks for completed maths modules.
// Run: node tutorial-sources/math/validate.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {createServer} from 'node:http';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const ROOT=path.dirname(fileURLToPath(import.meta.url));
const REPO=path.resolve(ROOT,'../..');
const DOCS=path.join(REPO,'docs');
const SITE=process.env.MATH_SITE_ROOT||DOCS;
const require=createRequire(path.join(ROOT,'../ai/tools/package.json'));
const puppeteer=require('puppeteer-core');
const report=JSON.parse(fs.readFileSync(path.join(ROOT,'artifacts/build-report.json'),'utf8'));
const roadmap=JSON.parse(fs.readFileSync(path.join(DOCS,'tutorials/math/plan.json'),'utf8'));
const pad=n=>String(n).padStart(2,'0');
assert.equal(roadmap.total_hours,roadmap.modules.reduce((a,m)=>a+m.hours,0));
assert.deepEqual(roadmap.modules.filter(m=>m.status==='available').map(m=>m.number),report.published);
const modules=new Map(roadmap.modules.map(m=>[m.number,m]));
const visited=new Set(),active=new Set();
function auditPrerequisites(number){
  assert(modules.has(number),`Known prerequisite ${number}`);
  assert(!active.has(number),`No prerequisite cycle through ${number}`);
  if(visited.has(number))return;
  active.add(number);
  const meta=modules.get(number);
  for(const prior of [...meta.prerequisites,...meta.conditional_prerequisites.map(p=>p.module)])auditPrerequisites(prior);
  active.delete(number);visited.add(number);
}
for(const number of modules.keys())auditPrerequisites(number);
for(const route of roadmap.routes){
  assert.equal(new Set(route.modules).size,route.modules.length,'No repeated route module');
  assert.equal(route.hours,route.modules.reduce((total,n)=>total+modules.get(n).hours,0),`${route.id}: hours reconcile`);
  for(const n of route.modules){
    const m=modules.get(n);
    for(const p of [...m.prerequisites,...m.conditional_prerequisites.filter(p=>route.branches.includes(p.branch)).map(p=>p.module)])assert(route.modules.indexOf(p)>=0&&route.modules.indexOf(p)<route.modules.indexOf(n),`${route.id}: prerequisite ${p} before ${n}`);
  }
}
for(const suffix of [...new Set(report.records.map(r=>r.file.replace(/_(EN|ZH)\.html$/,'')))]){
  const en=report.records.find(r=>r.file===`${suffix}_EN.html`);
  const zh=report.records.find(r=>r.file===`${suffix}_ZH.html`);
  assert(en && zh,`${suffix} has both editions`);
  assert.deepEqual(en.sections,zh.sections,`${suffix} section identifiers agree`);
  assert.deepEqual(en.counts,zh.counts,`${suffix} content counts agree`);
}
for(const number of report.published){
  if(number<=30){
    const concepts=fs.readFileSync(path.join(ROOT,`src/en/module_${pad(number)}.md`),'utf8').split('## Common misconceptions')[0];
    assert(concepts.trim().split(/\s+/).length>=4000,`Module ${number} has substantive concept teaching`);
  }
  const meta=JSON.parse(fs.readFileSync(path.join(ROOT,`plan/module_${pad(number)}.json`),'utf8'));
  assert.equal(meta.hours,modules.get(number).hours,'Published and outline hours agree');
  for(const lab of meta.labs||[])assert.equal(fs.readFileSync(path.join(ROOT,`labs/module_${pad(number)}`,lab.file),'utf8'),fs.readFileSync(path.join(DOCS,`tutorials/math/labs/module_${pad(number)}`,lab.file),'utf8'),'Download equals executed source');
}
const executablePath=process.env.MATH_BROWSER_PATH||[
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/chromium','/usr/bin/google-chrome'
].find(fs.existsSync);
assert(executablePath,'Set MATH_BROWSER_PATH to a Chromium executable');
const mime={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf','.json':'application/json','.py':'text/plain; charset=utf-8'};
const server=createServer((req,res)=>{
  let pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(pathname.endsWith('/'))pathname+='index.html';
  const resolved=path.resolve(SITE,'.'+pathname);
  if(!resolved.startsWith(path.resolve(SITE)+path.sep)){res.writeHead(403).end();return;}
  try{res.setHeader('Content-Type',mime[path.extname(resolved)]||'text/plain');res.end(fs.readFileSync(resolved));}
  catch{res.writeHead(404).end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const screenshotDir=fs.mkdtempSync(path.join(os.tmpdir(),'wrwei-math-preview-'));
let browser;
let linksChecked=0;
try{
  browser=await puppeteer.launch({executablePath,headless:true});
  const page=await browser.newPage();
  const errors=[],failures=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400 && r.url().startsWith('http://127.0.0.1'))failures.push(`${r.status()} ${r.url()}`);});
  const base=`http://127.0.0.1:${server.address().port}/tutorials/math/`;
  for(const record of report.records){
    await page.setViewport({width:1280,height:900});
    await page.goto(base+record.file,{waitUntil:'networkidle0'});
    const missing=await page.evaluate(()=>[...document.querySelectorAll('a[href^="#"]')].map(a=>a.hash.slice(1)).filter(id=>!document.getElementById(id)));
    assert.deepEqual(missing,[],`${record.file}: fragment targets exist`);
    assert.equal(await page.$$eval('.katex-error',els=>els.length),0);
    const duplicateIds=await page.evaluate(()=>{const ids=[...document.querySelectorAll('[id]')].map(e=>e.id);return ids.filter((id,i)=>ids.indexOf(id)!==i);});
    assert.deepEqual(duplicateIds,[],`${record.file}: unique identifiers`);
    const brokenAria=await page.evaluate(()=>[...document.querySelectorAll('[aria-labelledby],[aria-describedby]')].flatMap(e=>[e.getAttribute('aria-labelledby'),e.getAttribute('aria-describedby')].filter(Boolean).flatMap(a=>a.split(/\s+/))).filter(id=>!document.getElementById(id)));
    assert.deepEqual(brokenAria,[],`${record.file}: accessible label references`);
    const urls=await page.$$eval('a[href],img[src],script[src],link[rel=stylesheet]',els=>els.map(e=>e.href||e.src));
    for(const url of urls){
      const parsed=new URL(url);
      if(parsed.origin!==new URL(base).origin)continue;
      let relative=decodeURIComponent(parsed.pathname.slice(1));
      if(relative.endsWith('/'))relative+='index.html';
      let target=path.join(SITE,relative);
      if(!fs.existsSync(target)&&SITE===DOCS&&relative.endsWith('/index.html'))target=path.join(DOCS,relative.slice(0,-11)+'.md');
      assert(fs.existsSync(target),`${record.file}: local target ${relative}`);
      if(parsed.hash&&path.extname(target)==='.html'){
        const targetHtml=fs.readFileSync(target,'utf8');
        assert(targetHtml.includes(`id="${decodeURIComponent(parsed.hash.slice(1))}"`),`${record.file}: cross-page anchor ${parsed.hash}`);
      }
      linksChecked++;
    }
    const taught=record.file.match(/^module_(\d\d)_/);
    if(taught&&Number(taught[1])>0&&Number(taught[1])<=30){
      const number=taught[1];
      assert.equal(await page.$$eval('.exercise',els=>els.length),14);
      assert.equal(await page.$$eval('.quiz-q',els=>els.length),9);
      assert.equal(await page.$$eval('[data-free-response]',els=>els.length),1);
      const outputs=await page.$$eval('.output pre code',els=>els.map(e=>e.textContent.trimEnd()));
      const expected=[1,2,3].map(n=>fs.readFileSync(path.join(ROOT,`artifacts/module_${number}/lab${n}.output.txt`),'utf8').trimEnd());
      assert.deepEqual(outputs,expected,'Captured outputs agree with executed labs');
      if(number==='01'){
      const status='.widget-result';
      assert.match(await page.$eval(status,e=>e.textContent),/19/);
      await page.select('[data-input=order]','gf');
      assert.match(await page.$eval(status,e=>e.textContent),/49/);
      await page.select('[data-input=order]','fg');
      await page.select('[data-input=f]','3');
      await page.$eval('[data-input=x]',e=>{e.value='0';e.dispatchEvent(new Event('input'));});
      assert.match(await page.$eval(status,e=>e.textContent),/(Domain failure|违反定义域)/);
      await page.$eval('[data-input=x]',e=>{e.value='2';e.dispatchEvent(new Event('input'));});
      assert.match(await page.$eval(status,e=>e.textContent),/1\.09861/);
      await page.$eval('[data-input=x]',e=>{e.value='5';e.dispatchEvent(new Event('input'));});
      assert.match(await page.$eval(status,e=>e.textContent),/(finite number|有限数)/);
      await page.click('[data-reset]');
      assert.match(await page.$eval(status,e=>e.textContent),/19/);
      }
      if(number==='02'){
        const status='.quantifier-status';
        assert.match(await page.$eval(status,e=>e.textContent),/∀r ∃v: true; ∃v ∀r: false/);
        await page.click('[data-cell="2"]');
        assert.match(await page.$eval(status,e=>e.textContent),/∃v ∀r: true/);
        await page.click('[data-cell="3"]');
        await page.click('[data-cell="2"]');
        assert.match(await page.$eval(status,e=>e.textContent),/∀r ∃v: false/);
        await page.focus('[data-quantifier-reset]');
        await page.keyboard.press('Enter');
        assert.match(await page.$eval(status,e=>e.textContent),/∀r ∃v: true; ∃v ∀r: false/);
        assert.equal(await page.$eval('[data-cell="0"]',e=>e.getAttribute('aria-pressed')),'true');
      }
      if(number==='03'){
        assert.match(await page.$eval('[data-property=transitive]',e=>e.textContent),/(holds|成立)/);
        await page.select('[data-relation-preset]','2');
        assert.match(await page.$eval('[data-property=transitive]',e=>e.textContent),/\(0,1,2\)/);
        assert.match(await page.$eval('[data-property=antisymmetric]',e=>e.textContent),/\(0,1\)/);
        await page.select('[data-relation-preset]','3');
        assert.match(await page.$eval('[data-property=antisymmetric]',e=>e.textContent),/(holds|成立)/);
        await page.click('[data-relation-cell="0"]');
        assert.match(await page.$eval('[data-property=reflexive]',e=>e.textContent),/\(0,0\)/);
      }
      if(number==='04'){
        const widget='[data-widget=invariants]';
        for(let i=0;i<4;i++)await page.click('[data-invariant-next]');
        assert.equal(await page.$eval(widget,e=>e.dataset.result),'3');
        await page.select('[data-invariant-case]','1');
        for(let i=0;i<4;i++)await page.click('[data-invariant-next]');
        assert.equal(await page.$eval(widget,e=>e.dataset.result),'-1');
        assert.equal(await page.$eval(widget,e=>e.dataset.variant),'0');
        await page.select('[data-invariant-case]','2');
        await page.click('[data-invariant-next]');
        assert.equal(await page.$eval(widget,e=>e.dataset.result),'0');
        await page.select('[data-invariant-case]','3');
        assert.equal(await page.$eval(widget,e=>e.dataset.result),'-1');
        assert.equal(await page.$eval('[data-invariant-next]',e=>e.disabled),true);
      }
      if(number==='05'){
        const widget='[data-widget=selections]';
        assert.equal(await page.$eval(widget,e=>e.dataset.count),'6');
        for(const [mode,count] of [['subset','3'],['ordered_repeat','9'],['multiset','6']]){
          await page.select('[data-selection-mode]',mode);
          assert.equal(await page.$eval(widget,e=>e.dataset.count),count);
        }
        await page.$eval('[data-selection-r]',e=>{e.value=0;e.dispatchEvent(new Event('input'));});
        assert.equal(await page.$eval(widget,e=>e.dataset.count),'1');
        await page.select('[data-selection-mode]','ordered');
        await page.$eval('[data-selection-r]',e=>{e.value=4;e.dispatchEvent(new Event('input'));});
        assert.equal(await page.$eval(widget,e=>e.dataset.count),'0');
        await page.$eval('[data-selection-n]',e=>{e.value=9;e.dispatchEvent(new Event('input'));});
        assert.equal(await page.$eval(widget,e=>e.dataset.count),'invalid');
        await page.click('[data-selection-reset]');
        assert.equal(await page.$eval(widget,e=>e.dataset.count),'6');
      }
      if(number==='06'){
        const widget='[data-widget=recurrences]';
        assert.equal(await page.$eval(widget,e=>e.dataset.total),'32');
        for(const [a,total] of [['1','15'],['4','120']]){await page.select('[data-recurrence-a]',a);assert.equal(await page.$eval(widget,e=>e.dataset.total),total);}
        await page.$eval('[data-recurrence-h]',e=>{e.value=0;e.dispatchEvent(new Event('input'));});
        assert.equal(await page.$eval(widget,e=>e.dataset.total),'1');
        await page.select('[data-recurrence-a]','2');
        await page.$eval('[data-recurrence-h]',e=>{e.value=4;e.dispatchEvent(new Event('input'));});
        assert.equal(await page.$eval(widget,e=>e.dataset.total),'80');
        await page.$eval('[data-recurrence-h]',e=>{e.value=9;e.dispatchEvent(new Event('input'));});
        assert.equal(await page.$eval(widget,e=>e.dataset.total),'invalid');
        await page.click('[data-recurrence-reset]');
        assert.equal(await page.$eval(widget,e=>e.dataset.total),'32');
        assert.equal(await page.$$eval('[data-widget=recurrences] tbody tr',els=>els.length),4);
      }
      if(number==='07'){
        const widget='[data-widget=traversal]';
        assert.equal(await page.$eval(widget,e=>e.dataset.queue),'A');
        await page.click('[data-traversal-next]');
        assert.equal(await page.$eval(widget,e=>e.dataset.queue),'BC');
        for(let i=0;i<4;i++)await page.click('[data-traversal-next]');
        assert.deepEqual(JSON.parse(await page.$eval(widget,e=>e.dataset.distances)),{A:0,B:1,C:1,D:2,E:3});
        assert.equal(await page.$eval('[data-traversal-next]',e=>e.disabled),true);
        await page.select('[data-traversal-source]','F');
        await page.click('[data-traversal-next]');
        assert.deepEqual(JSON.parse(await page.$eval(widget,e=>e.dataset.distances)),{F:0});
        await page.select('[data-traversal-source]','A');
        await page.focus('[data-traversal-reset]');await page.keyboard.press('Enter');
        assert.equal(await page.$eval(widget,e=>e.dataset.queue),'A');
      }
      if(number==='08'){
        const widget='[data-widget=residues]';
        assert.equal(await page.$eval(widget,e=>e.dataset.inverse),'5');
        assert.equal(await page.$eval(widget,e=>e.dataset.result),'1');
        await page.$eval('[data-residue-m]',e=>{e.value=6;e.dispatchEvent(new Event('input'));});
        await page.$eval('[data-residue-a]',e=>{e.value=2;e.dispatchEvent(new Event('input'));});
        assert.equal(await page.$eval(widget,e=>e.dataset.inverse),'none');
        assert.equal(await page.$eval(widget,e=>e.dataset.gcd),'2');
        await page.$eval('[data-residue-a]',e=>{e.value=-17;e.dispatchEvent(new Event('input'));});
        await page.$eval('[data-residue-m]',e=>{e.value=7;e.dispatchEvent(new Event('input'));});
        await page.$eval('[data-residue-x]',e=>{e.value=0;e.dispatchEvent(new Event('input'));});
        await page.select('[data-residue-operation]','add');
        assert.equal(await page.$eval(widget,e=>e.dataset.result),'4');
        await page.$eval('[data-residue-a]',e=>{e.value=0;e.dispatchEvent(new Event('input'));});
        assert.equal(await page.$eval(widget,e=>e.dataset.inverse),'none');
        assert.equal(await page.$eval(widget,e=>e.dataset.gcd),'7');
        await page.$eval('[data-residue-m]',e=>{e.value=1;e.dispatchEvent(new Event('input'));});
        assert.equal(await page.$eval(widget,e=>e.dataset.inverse),'invalid');
        await page.focus('[data-residue-reset]');await page.keyboard.press('Enter');
        assert.equal(await page.$eval(widget,e=>e.dataset.result),'1');
      }
      if(number==='09'){
        const widget='[data-widget=vectors]';
        assert.equal(await page.$eval(widget,e=>e.dataset.dot),'0');
        assert.equal(await page.$eval(widget,e=>e.dataset.angle),'90');
        await page.$eval('[data-vector=u]',e=>e.focus());
        assert.equal(await page.evaluate(()=>document.activeElement.dataset.vector),'u');
        await page.keyboard.press('ArrowRight');
        assert.equal(await page.$eval('[data-vector-coordinate="0"]',e=>e.value),'3.25');
        await page.click('[data-vector-reset]');
        for(const i of [0,1])await page.$eval(`[data-vector-coordinate="${i}"]`,e=>{e.value=0;e.dispatchEvent(new Event('input'));});
        assert.equal(await page.$eval(widget,e=>e.dataset.cosine),'undefined');
        await page.$eval('[data-vector-coordinate="0"]',e=>{e.value=6;e.dispatchEvent(new Event('input'));});
        assert.equal(await page.$eval(widget,e=>e.dataset.dot),'invalid');
        await page.click('[data-vector-reset]');
        await page.$eval('[data-vector=u]',e=>e.scrollIntoView({block:'center',behavior:'instant'}));
        const handle=await page.$('[data-vector=u]'),position=await handle.boundingBox();
        const target=await page.$eval('[data-widget=vectors] svg',e=>{const p=e.createSVGPoint();p.x=332;p.y=136;const q=p.matrixTransform(e.getScreenCTM());return {x:q.x,y:q.y};});
        await page.mouse.move(position.x+position.width/2,position.y+position.height/2);await page.mouse.down();
        await page.mouse.move(target.x,target.y,{steps:5});await page.mouse.up();
        assert.equal(await page.$eval('[data-vector-coordinate="0"]',e=>e.value),'1');
        assert.equal(await page.$eval('[data-vector-coordinate="1"]',e=>e.value),'2');
        await page.click('[data-vector-reset]');
      }
      if(number==='10'){
        const widget='[data-widget=matrices]';
        assert.equal(await page.$eval(widget,e=>e.dataset.determinant),'2');
        assert.equal(await page.$eval(widget,e=>e.dataset.image),'4,1');
        await page.select('[data-matrix-preset]','1');
        assert.equal(await page.$eval(widget,e=>e.dataset.image),'3,1');
        await page.select('[data-matrix-preset]','3');
        assert.equal(await page.$eval(widget,e=>e.dataset.determinant),'0');
        assert.equal(await page.$eval(widget,e=>e.dataset.image),'2,4');
        await page.select('[data-matrix-preset]','4');
        assert.equal(await page.$eval(widget,e=>e.dataset.image),'0,0');
        await page.$eval('[data-matrix-entry="0"]',e=>{e.value='4';e.dispatchEvent(new Event('input'));});
        assert.equal(await page.$eval(widget,e=>e.dataset.valid),'false');
        await page.focus('[data-matrix-reset]');await page.keyboard.press('Enter');
        assert.equal(await page.$eval(widget,e=>e.dataset.image),'4,1');
      }
      if(number==='11'){
        const widget='[data-widget=spans]';
        assert.equal(await page.$eval(widget,e=>e.dataset.rank),'2');
        assert.equal(await page.$eval(widget,e=>e.dataset.coefficients),'2,3');
        await page.select('[data-span-preset]','1');
        assert.equal(await page.$eval(widget,e=>e.dataset.rank),'1');
        assert.equal(await page.$eval(widget,e=>e.dataset.consistent),'false');
        assert.equal(await page.$eval(widget,e=>e.dataset.certificate),'1');
        await page.$eval('[data-span-target="1"]',e=>{e.value='2';e.dispatchEvent(new Event('input'));});
        assert.equal(await page.$eval(widget,e=>e.dataset.consistent),'true');
        await page.select('[data-span-preset]','2');
        assert.equal(await page.$eval(widget,e=>e.dataset.rank),'0');
        assert.equal(await page.$eval(widget,e=>e.dataset.consistent),'false');
        await page.$$eval('[data-span-target]',els=>els.forEach(e=>{e.value='0';e.dispatchEvent(new Event('input'));}));
        assert.equal(await page.$eval(widget,e=>e.dataset.consistent),'true');
        await page.select('[data-span-preset]','4');
        assert.equal(await page.$eval(widget,e=>e.dataset.rank),'1');
        await page.$eval('[data-span-target="0"]',e=>{e.value='4';e.dispatchEvent(new Event('input'));});
        assert.equal(await page.$eval(widget,e=>e.dataset.valid),'false');
        await page.focus('[data-span-reset]');await page.keyboard.press('Enter');
        assert.equal(await page.$eval(widget,e=>e.dataset.coefficients),'2,3');
      }
      if(number==='12'){
        const widget='[data-widget=projections]';
        assert.equal(await page.$eval(widget,e=>e.dataset.projection),'2.5,2.5');
        assert.equal(await page.$eval(widget,e=>e.dataset.sse),'0.5');
        await page.select('[data-projection-metric]','weighted');
        assert(Math.abs(Number(await page.$eval(widget,e=>e.dataset.coefficient))-2.8)<1e-12);
        assert(Math.abs(Number(await page.$eval(widget,e=>e.dataset.orthogonality)))<1e-12);
        await page.select('[data-projection-direction]','1');
        assert.equal(await page.$eval(widget,e=>e.dataset.projection),'3,0');
        await page.select('[data-projection-direction]','2');
        assert.equal(await page.$eval(widget,e=>e.dataset.projection),'0,2');
        await page.select('[data-projection-direction]','4');
        assert.equal(await page.$eval(widget,e=>e.dataset.projection),'0,0');
        assert.equal(await page.$eval(widget,e=>e.dataset.sse),'40');
        await page.$eval('[data-projection-target="0"]',e=>{e.value='5';e.dispatchEvent(new Event('input'));});
        assert.equal(await page.$eval(widget,e=>e.dataset.valid),'false');
        await page.focus('[data-projection-reset]');await page.keyboard.press('Enter');
        assert.equal(await page.$eval(widget,e=>e.dataset.projection),'2.5,2.5');
      }
      if(number==='13'){
        const widget='[data-widget=spectra]';
        assert.equal(await page.$eval(widget,e=>e.dataset.eigenvalues),'1,3');
        assert.equal(await page.$eval(widget,e=>e.dataset.classification),'pd');
        assert.equal(await page.$eval(widget,e=>e.dataset.energy),'6');
        await page.select('[data-spectra-preset]','1');
        assert.equal(await page.$eval(widget,e=>e.dataset.classification),'psd');
        assert.equal(await page.$eval(widget,e=>e.dataset.eigenvalues),'0,1');
        await page.select('[data-spectra-preset]','2');
        assert.equal(await page.$eval(widget,e=>e.dataset.classification),'indefinite');
        assert.equal(await page.$eval(widget,e=>e.dataset.energy),'0');
        await page.select('[data-spectra-preset]','3');
        assert.equal(await page.$eval(widget,e=>e.dataset.classification),'negative');
        await page.select('[data-spectra-preset]','4');
        assert.equal(await page.$eval(widget,e=>e.dataset.classification),'zero');
        await page.select('[data-spectra-preset]','5');
        assert.equal(await page.$eval(widget,e=>e.dataset.eigenvalues),'1,1');
        await page.$eval('[data-spectra-coordinate="0"]',e=>{e.value='4';e.dispatchEvent(new Event('input'));});
        assert.equal(await page.$eval(widget,e=>e.dataset.valid),'false');
        await page.focus('[data-spectra-reset]');await page.keyboard.press('Enter');
        assert.equal(await page.$eval(widget,e=>e.dataset.energy),'6');
      }
      if(number==='14'){
        const widget='[data-widget=truncation]';
        assert.equal(await page.$eval(widget,e=>e.dataset.error),'10');
        assert.equal(await page.$eval(widget,e=>e.dataset.storage),'8');
        await page.focus('[data-truncation-rank]');await page.keyboard.press('ArrowRight');
        assert.equal(await page.$eval(widget,e=>e.dataset.rank),'2');
        assert.equal(await page.$eval(widget,e=>e.dataset.error),'1');
        await page.keyboard.press('End');
        assert.equal(await page.$eval(widget,e=>e.dataset.error),'0');
        assert.equal(await page.$eval(widget,e=>e.dataset.storage),'24');
        await page.keyboard.press('Home');
        assert.equal(await page.$eval(widget,e=>e.dataset.rank),'0');
        assert.equal(await page.$eval(widget,e=>e.dataset.error),'46');
        assert.match(await page.$eval(widget+' svg',e=>e.getAttribute('aria-label')),/\[\[0,0,0\]/);
        await page.focus('[data-truncation-reset]');await page.keyboard.press('Enter');
        assert.equal(await page.$eval(widget,e=>e.dataset.error),'10');
      }
      if(number==='15'){
        const widget='[data-widget="limits"]';
        assert.equal(await page.$eval(widget,e=>e.dataset.certificate),'certified');
        await page.select('[data-limit-function]','square');
        assert.equal(await page.$eval(widget,e=>e.dataset.certificate),'certified');
        await page.$eval('[data-limit-delta]',e=>{e.value='.024';e.dispatchEvent(new Event('input'));});
        assert.equal(await page.$eval(widget,e=>e.dataset.certificate),'uncertified');
        assert.match(await page.$eval('.limits-status',e=>e.textContent),/(uncertified|未认证)/);
        await page.select('[data-limit-function]','jump');
        assert.equal(await page.$eval(widget,e=>e.dataset.certificate),'violated');
        await page.$eval('[data-limit-epsilon]',e=>e.focus());
        await page.keyboard.press('ArrowRight');
        assert.equal(await page.$eval('[data-limit-epsilon]',e=>Number(e.value)),.11);
        assert.equal(await page.$eval(widget,e=>e.dataset.certificate),'violated');
        await page.$eval('[data-limit-delta]',e=>{e.value='';e.dispatchEvent(new Event('input'));});
        assert.equal(await page.$eval(widget,e=>e.dataset.valid),'false');
        await page.click('[data-limit-reset]');
        assert.equal(await page.$eval(widget,e=>e.dataset.certificate),'certified');
      }
      if(number==='16'){
        const widget='[data-widget="taylor"]';
        let state=await page.$eval(widget,e=>({error:Number(e.dataset.error),bound:Number(e.dataset.bound)}));
        assert(state.error>0&&state.error<state.bound);
        assert(Math.abs(state.bound-.002666666666666667)<1e-12);
        await page.select('[data-taylor-order]','5');
        assert(await page.$eval(widget,e=>Number(e.dataset.error)<1e-5));
        await page.$eval('[data-taylor-centre]',e=>{e.value='.5';e.dispatchEvent(new Event('input'));});
        await page.$eval('[data-taylor-x]',e=>{e.value='.7';e.dispatchEvent(new Event('input'));});
        state=await page.$eval(widget,e=>({error:Number(e.dataset.error),bound:Number(e.dataset.bound)}));
        assert(state.error<1e-6&&state.error<state.bound);
        await page.$eval('[data-taylor-x]',e=>{e.value='-1';e.dispatchEvent(new Event('input'));});
        assert.equal(await page.$eval(widget,e=>e.dataset.valid),'domain-error');
        assert.equal(await page.$$eval('[data-widget="taylor"] svg circle',e=>e.length),0);
        await page.click('[data-taylor-reset]');
        await page.$eval('[data-taylor-centre]',e=>e.focus());
        await page.keyboard.press('ArrowUp');
        assert.equal(await page.$eval(widget,e=>Number(e.dataset.centre)),.1);
        await page.$eval('[data-taylor-centre]',e=>{e.value='';e.dispatchEvent(new Event('input'));});
        assert.equal(await page.$eval(widget,e=>e.dataset.valid),'false');
        await page.click('[data-taylor-reset]');
        assert.equal(await page.$eval(widget,e=>e.dataset.valid),'true');
      }
      if(number==='17'){
        const widget='[data-widget="accumulation"]';
        assert.equal(await page.$eval('[data-decay-control]',e=>getComputedStyle(e).display),'none');
        assert.equal(await page.$eval(widget,e=>Number(e.dataset.left)),.21875);
        assert.equal(await page.$eval(widget,e=>Number(e.dataset.right)),.46875);
        await page.$eval('[data-accumulation-n]',e=>e.focus());
        await page.keyboard.press('ArrowRight');
        assert.equal(await page.$eval(widget,e=>Number(e.dataset.left)),.24);
        await page.select('[data-accumulation-mode]','decay');
        assert.equal(await page.$eval('[data-area-control]',e=>getComputedStyle(e).display),'none');
        assert.notEqual(await page.$eval('[data-decay-control]',e=>getComputedStyle(e).display),'none');
        assert.equal(await page.$eval(widget,e=>e.dataset.stable),'true');
        assert.equal(await page.$eval(widget,e=>e.dataset.nonnegative),'true');
        await page.$eval('[data-accumulation-h]',e=>{e.value='.8';e.dispatchEvent(new Event('input'));});
        assert.equal(await page.$eval(widget,e=>e.dataset.stable),'true');
        assert.equal(await page.$eval(widget,e=>e.dataset.nonnegative),'false');
        await page.$eval('[data-accumulation-h]',e=>{e.value='1';e.dispatchEvent(new Event('input'));});
        assert.equal(await page.$eval(widget,e=>e.dataset.stable),'false');
        assert.match(await page.$eval('.accumulation-status',e=>e.textContent),/(neutral|中性)/);
        await page.$eval('[data-accumulation-h]',e=>e.focus());
        await page.keyboard.press('ArrowRight');
        assert.equal(await page.$eval('[data-accumulation-h]',e=>Number(e.value)),1.05);
        assert.equal(await page.$eval(widget,e=>e.dataset.stable),'false');
        assert(await page.$eval(widget,e=>Number(e.dataset.endpoint)>1));
        await page.click('[data-accumulation-reset]');
        assert.equal(await page.$eval(widget,e=>e.dataset.mode),'area');
      }
      if(number==='18'){
        const widget='[data-widget="adjoints"]';
        assert.equal(await page.$eval(widget,e=>Number(e.dataset.value)),22);
        assert.equal(await page.$eval(widget,e=>Number(e.dataset.gradient)),37);
        assert.equal(await page.$eval(widget,e=>Number(e.dataset.intermediate)),9);
        await page.$eval('[data-adjoint-seed]',e=>{e.value='0';e.dispatchEvent(new Event('input'));});
        assert.equal(await page.$eval(widget,e=>Number(e.dataset.gradient)),0);
        assert.equal(await page.$eval(widget,e=>Number(e.dataset.derivative)),37);
        await page.$eval('[data-adjoint-seed]',e=>{e.value='-1';e.dispatchEvent(new Event('input'));});
        assert.equal(await page.$eval(widget,e=>Number(e.dataset.gradient)),-37);
        await page.click('[data-adjoint-reset]');
        await page.$eval('[data-adjoint-x]',e=>e.focus());
        await page.keyboard.press('ArrowDown');
        assert.equal(await page.$eval(widget,e=>Number(e.dataset.derivative)),25.9375);
        await page.$eval('[data-adjoint-seed]',e=>e.focus());
        await page.keyboard.press('ArrowRight');
        assert.equal(await page.$eval(widget,e=>Number(e.dataset.gradient)),38.90625);
        await page.$eval('[data-adjoint-x]',e=>{e.value='';e.dispatchEvent(new Event('input'));});
        assert.equal(await page.$eval(widget,e=>e.dataset.valid),'false');
        await page.click('[data-adjoint-reset]');
        assert.equal(await page.$eval(widget,e=>Number(e.dataset.gradient)),37);
      }
      if(number==='19'){
        const widget='[data-widget="descent"]';
        assert.equal(await page.$eval(widget,e=>e.dataset.classification),'stable');
        assert.equal(await page.$eval(widget,e=>Number(e.dataset.rho)),.8);
        await page.$eval('[data-descent-step]',e=>{e.value='.5';e.dispatchEvent(new Event('input'));});
        assert.equal(await page.$eval(widget,e=>e.dataset.classification),'neutral');
        await page.$eval('[data-descent-step]',e=>{e.value='.55';e.dispatchEvent(new Event('input'));});
        assert.equal(await page.$eval(widget,e=>e.dataset.classification),'unstable');
        assert(await page.$eval(widget,e=>Number(e.dataset.outside)>0));
        await page.select('[data-descent-preset]','2');
        assert.equal(await page.$eval(widget,e=>Number(e.dataset.rho)),.99);
        await page.select('[data-descent-preset]','3');
        assert.equal(await page.$eval(widget,e=>Number(e.dataset.error)),0);
        await page.$eval('[data-descent-step]',e=>{e.value='0';e.dispatchEvent(new Event('input'));});
        assert.equal(await page.$eval(widget,e=>e.dataset.classification),'neutral');
        await page.click('[data-descent-reset]');
        await page.$eval('[data-descent-step]',e=>e.focus());
        await page.keyboard.press('ArrowUp');
        assert.equal(await page.$eval(widget,e=>Number(e.dataset.rho)),.79);
        await page.$eval('[data-descent-step]',e=>{e.value='';e.dispatchEvent(new Event('input'));});
        assert.equal(await page.$eval(widget,e=>e.dataset.valid),'false');
        await page.click('[data-descent-reset]');
        assert.equal(await page.$eval(widget,e=>e.dataset.valid),'true');
      }
      if(number==='20'){
        const widget='[data-widget="projection"]';
        assert(Math.abs(await page.$eval(widget,e=>Number(e.dataset.x))-.9)<1e-12);
        assert.equal(await page.$eval(widget,e=>e.dataset.feasible),'true');
        assert.equal(await page.$eval(widget,e=>e.dataset.dual),'true');
        assert(Math.abs(await page.$eval(widget,e=>Number(e.dataset.bound))-.09)<1e-12);
        await page.$eval('[data-projection-a2]',e=>{e.value='-.2';e.dispatchEvent(new Event('input'));});
        assert.equal(await page.$eval(widget,e=>Number(e.dataset.x)),1);
        assert(Math.abs(await page.$eval(widget,e=>Number(e.dataset.lower2))-.4)<1e-12);
        await page.select('[data-projection-mode]','negative');
        assert.equal(await page.$eval(widget,e=>e.dataset.dual),'false');
        await page.select('[data-projection-mode]','infeasible');
        assert.equal(await page.$eval(widget,e=>e.dataset.feasible),'false');
        assert.equal(await page.$eval(widget,e=>e.dataset.dual),'true');
        assert(await page.$eval(widget,e=>Number(e.dataset.stationarity)<1e-12));
        assert(Math.abs(await page.$eval(widget,e=>Number(e.dataset.equality))-.2)<1e-12);
        await page.click('[data-projection-reset]');
        await page.$eval('[data-projection-a1]',e=>e.focus());
        await page.keyboard.press('ArrowDown');
        assert(Math.abs(await page.$eval(widget,e=>Number(e.dataset.x))-.85)<1e-12);
        await page.$eval('[data-projection-a1]',e=>{e.value='';e.dispatchEvent(new Event('input'));});
        assert.equal(await page.$eval(widget,e=>e.dataset.valid),'false');
        assert.equal(await page.$$eval('[data-widget="projection"] svg circle',e=>e.length),0);
        await page.click('[data-projection-reset]');
        assert.equal(await page.$eval(widget,e=>e.dataset.valid),'true');
      }
      if(number==='21'){
        const widget='[data-widget="bayes"]';
        assert(Math.abs(await page.$eval(widget,e=>Number(e.dataset.posterior))-2/13)<1e-12);
        assert(Math.abs(await page.$eval(widget,e=>Number(e.dataset.evidence))-.0585)<1e-12);
        await page.$eval('[data-bayes-prior]',e=>{e.value='50';e.dispatchEvent(new Event('input'));});
        assert(Math.abs(await page.$eval(widget,e=>Number(e.dataset.posterior))-18/19)<1e-12);
        await page.$eval('[data-bayes-false]',e=>{e.value='0';e.dispatchEvent(new Event('input'));});
        assert.equal(await page.$eval(widget,e=>Number(e.dataset.posterior)),1);
        await page.$eval('[data-bayes-sensitivity]',e=>{e.value='0';e.dispatchEvent(new Event('input'));});
        assert.equal(await page.$eval(widget,e=>e.dataset.posterior),'undefined');
        assert.match(await page.$eval('.bayes-status',e=>e.textContent),/(undefined|未定义)/);
        await page.click('[data-bayes-reset]');
        await page.$eval('[data-bayes-prior]',e=>{e.value='0';e.dispatchEvent(new Event('input'));});
        assert.equal(await page.$eval(widget,e=>e.dataset.sensitivity),'undefined');
        assert.equal(await page.$eval(widget,e=>Number(e.dataset.posterior)),0);
        await page.$eval('[data-bayes-prior]',e=>{e.value='100';e.dispatchEvent(new Event('input'));});
        assert.equal(await page.$eval(widget,e=>e.dataset.falseConditional),'undefined');
        assert.equal(await page.$eval(widget,e=>Number(e.dataset.posterior)),1);
        await page.click('[data-bayes-reset]');
        await page.$eval('[data-bayes-prior]',e=>e.focus());
        await page.keyboard.press('ArrowUp');
        assert(Math.abs(await page.$eval(widget,e=>Number(e.dataset.tp))-.0099)<1e-12);
        await page.$eval('[data-bayes-prior]',e=>{e.value='';e.dispatchEvent(new Event('input'));});
        assert.equal(await page.$eval(widget,e=>e.dataset.valid),'false');
        assert.equal(await page.$$eval('[data-widget="bayes"] svg rect',e=>e.length),0);
        await page.click('[data-bayes-reset]');
        assert.equal(await page.$eval(widget,e=>e.dataset.valid),'true');
      }
      if(number==='22'){
        const widget='[data-widget="distributions"]';
        assert(Math.abs(await page.$eval(widget,e=>Number(e.dataset.cdf))-.91296)<1e-12);
        assert(Math.abs(await page.$eval(widget,e=>Number(e.dataset.mass))-.2304)<1e-12);
        await page.$eval('[data-law-t]',e=>{e.value='2.75';e.dispatchEvent(new Event('input'));});
        assert(Math.abs(await page.$eval(widget,e=>Number(e.dataset.cdf))-.68256)<1e-12);
        assert.equal(await page.$eval(widget,e=>Number(e.dataset.mass)),0);
        await page.$eval('[data-law-p]',e=>{e.value='0';e.dispatchEvent(new Event('input'));});
        assert.equal(await page.$eval(widget,e=>Number(e.dataset.cdf)),1);
        await page.$eval('[data-law-p]',e=>{e.value='100';e.dispatchEvent(new Event('input'));});
        assert.equal(await page.$eval(widget,e=>Number(e.dataset.cdf)),0);
        await page.select('[data-law-mode]','uniform');
        assert.equal(await page.$eval('[data-law-discrete]',e=>getComputedStyle(e).display),'none');
        assert.notEqual(await page.$eval('[data-law-continuous]',e=>getComputedStyle(e).display),'none');
        assert.equal(await page.$eval(widget,e=>Number(e.dataset.density)),2);
        assert.equal(await page.$eval(widget,e=>Number(e.dataset.mass)),0);
        assert.equal(await page.$eval(widget,e=>Number(e.dataset.cdf)),.5);
        await page.$eval('[data-law-t]',e=>{e.value='.5';e.dispatchEvent(new Event('input'));});
        assert.equal(await page.$eval(widget,e=>Number(e.dataset.cdf)),1);
        assert.equal(await page.$eval(widget,e=>Number(e.dataset.density)),0);
        await page.$eval('[data-law-b]',e=>e.focus());
        await page.keyboard.press('ArrowUp');
        assert.equal(await page.$eval(widget,e=>Number(e.dataset.parameter)),.75);
        await page.$eval('[data-law-b]',e=>{e.value='0';e.dispatchEvent(new Event('input'));});
        assert.equal(await page.$eval(widget,e=>e.dataset.valid),'false');
        await page.click('[data-law-reset]');
        await page.$eval('[data-law-p]',e=>e.focus());
        await page.keyboard.press('ArrowUp');
        assert.equal(await page.$eval(widget,e=>Number(e.dataset.parameter)),41);
        await page.$eval('[data-law-t]',e=>{e.value='';e.dispatchEvent(new Event('input'));});
        assert.equal(await page.$eval(widget,e=>e.dataset.valid),'false');
        await page.click('[data-law-reset]');
        assert.equal(await page.$eval(widget,e=>e.dataset.valid),'true');
      }
      if(number==='23'){
        const widget='[data-widget="jointmoments"]';
        assert.equal(await page.$eval(widget,e=>Number(e.dataset.covariance)),1/16);
        assert.equal(await page.$eval(widget,e=>Number(e.dataset.sumVariance)),5/4);
        assert(Math.abs(await page.$eval(widget,e=>Number(e.dataset.within))-11/60)<1e-12);
        assert(Math.abs(await page.$eval(widget,e=>Number(e.dataset.between))-1/240)<1e-12);
        await page.click('[data-moments-independent]');
        assert.equal(await page.$eval(widget,e=>e.dataset.independent),'true');
        assert.equal(await page.$eval(widget,e=>Number(e.dataset.covariance)),0);
        assert.equal(await page.$eval(widget,e=>Number(e.dataset.between)),0);
        await page.$eval('[data-moments-c]',e=>{e.value='0';e.dispatchEvent(new Event('input'));});
        assert.equal(await page.$eval(widget,e=>e.dataset.independent),'false');
        assert.equal(await page.$eval(widget,e=>Number(e.dataset.covariance)),-3/16);
        assert.equal(await page.$eval(widget,e=>Number(e.dataset.sumVariance)),.75);
        await page.click('[data-moments-reset]');
        await page.$eval('[data-moments-c]',e=>e.focus());
        await page.keyboard.press('ArrowUp');
        assert.equal(await page.$eval(widget,e=>Number(e.dataset.covariance)),.125);
        await page.select('[data-moments-case]','2');
        assert(Math.abs(await page.$eval(widget,e=>Number(e.dataset.conditionalMean))-5/12)<1e-12);
        await page.$eval('[data-moments-c]',e=>{e.value='.3';e.dispatchEvent(new Event('input'));});
        assert.equal(await page.$eval(widget,e=>e.dataset.valid),'false');
        await page.$eval('[data-moments-c]',e=>{e.value='';e.dispatchEvent(new Event('input'));});
        assert.equal(await page.$eval(widget,e=>e.dataset.valid),'false');
        await page.click('[data-moments-reset]');
        assert.equal(await page.$eval(widget,e=>e.dataset.valid),'true');
        assert.equal(await page.$$eval('.lab-plot img',els=>els.length),1);
        assert.match(await page.$eval('.lab-plot img',e=>e.alt),/(square|平方)/);
      }
      if(number==='24'){
        const widget='[data-widget="sampling"]';
        assert(Math.abs(await page.$eval(widget,e=>Number(e.dataset.tail))-.11531829833984375)<1e-12);
        assert.equal(await page.$eval(widget,e=>Number(e.dataset.variance)),.0125);
        assert(Math.abs(await page.$eval(widget,e=>Number(e.dataset.chebyshev))-.3125)<1e-12);
        assert(Math.abs(await page.$eval(widget,e=>Number(e.dataset.hoeffding))-2*Math.exp(-1.6))<1e-12);
        await page.select('[data-sampling-mode]','copies');
        assert.equal(await page.$eval(widget,e=>Number(e.dataset.tail)),1);
        assert.equal(await page.$eval(widget,e=>Number(e.dataset.variance)),.25);
        assert.equal(await page.$eval(widget,e=>e.dataset.hoeffding),'not-applicable');
        assert.equal(await page.$$eval('[data-widget="sampling"] svg circle',els=>els.length),2);
        await page.click('[data-sampling-reset]');
        await page.$eval('[data-sampling-n]',e=>e.focus());await page.keyboard.press('ArrowUp');
        assert.equal(await page.$eval(widget,e=>Number(e.dataset.n)),21);
        assert(Math.abs(await page.$eval(widget,e=>Number(e.dataset.variance))-.25/21)<1e-12);
        await page.click('[data-sampling-reset]');
        await page.$eval('[data-sampling-p]',e=>{e.value='1';e.dispatchEvent(new Event('input'));});
        assert.equal(await page.$eval(widget,e=>e.dataset.valid),'true');
        assert.equal(await page.$$eval('[data-widget="sampling"] svg circle',els=>els.length),21);
        assert.equal(await page.$eval('[data-widget="sampling"] svg',e=>/(NaN|Infinity)/.test(e.innerHTML)),false);
        await page.$eval('[data-sampling-p]',e=>{e.value='0';e.dispatchEvent(new Event('input'));});
        assert.equal(await page.$eval(widget,e=>e.dataset.valid),'false');
        await page.click('[data-sampling-reset]');
        await page.$eval('[data-sampling-n]',e=>{e.value='20.5';e.dispatchEvent(new Event('input'));});
        assert.equal(await page.$eval(widget,e=>e.dataset.valid),'false');
        await page.$eval('[data-sampling-n]',e=>{e.value='';e.dispatchEvent(new Event('input'));});
        assert.equal(await page.$eval(widget,e=>e.dataset.valid),'false');
        assert.equal(await page.$$eval('[data-widget="sampling"] svg circle',els=>els.length),0);
        await page.click('[data-sampling-reset]');
        assert.equal(await page.$eval(widget,e=>e.dataset.valid),'true');
      }
      if(number==='25'){
        const widget='[data-widget="estimation"]';
        assert.equal(await page.$eval(widget,e=>Number(e.dataset.mle)),.8);
        assert.equal(await page.$eval(widget,e=>Number(e.dataset.mean)),5/7);
        assert.equal(await page.$eval(widget,e=>Number(e.dataset.mode)),.75);
        assert(Math.abs(await page.$eval(widget,e=>Number(e.dataset.posteriorVariance))-2/147)<1e-12);
        assert(Math.abs(await page.$eval(widget,e=>Number(e.dataset.lower))-.461868460765959)<1e-6);
        assert(Math.abs(await page.$eval(widget,e=>Number(e.dataset.upper))-.909079605427904)<1e-6);
        await page.$eval('[data-estimation-k]',e=>e.focus());await page.keyboard.press('ArrowUp');
        assert.equal(await page.$eval(widget,e=>Number(e.dataset.mle)),.9);
        await page.$eval('[data-estimation-k]',e=>{e.value='0';e.dispatchEvent(new Event('input'));});
        assert.equal(await page.$eval(widget,e=>Number(e.dataset.mle)),0);
        assert.equal(await page.$eval(widget,e=>Number(e.dataset.mean)),1/7);
        assert.equal(await page.$eval(widget,e=>Number(e.dataset.mode)),1/12);
        await page.$eval('[data-estimation-a]',e=>{e.value='1';e.dispatchEvent(new Event('input'));});
        assert.equal(await page.$eval(widget,e=>Number(e.dataset.mode)),0);
        await page.$eval('[data-estimation-n]',e=>{e.value='0';e.dispatchEvent(new Event('input'));});
        await page.$eval('[data-estimation-b]',e=>{e.value='1';e.dispatchEvent(new Event('input'));});
        assert.equal(await page.$eval(widget,e=>e.dataset.mle),'all');
        assert.equal(await page.$eval(widget,e=>e.dataset.mode),'all');
        assert(Math.abs(await page.$eval(widget,e=>Number(e.dataset.lower))-.025)<1e-12);
        assert(Math.abs(await page.$eval(widget,e=>Number(e.dataset.upper))-.975)<1e-12);
        await page.click('[data-estimation-reset]');
        await page.$eval('[data-estimation-k]',e=>{e.value='11';e.dispatchEvent(new Event('input'));});
        assert.equal(await page.$eval(widget,e=>e.dataset.valid),'false');
        await page.$eval('[data-estimation-k]',e=>{e.value='';e.dispatchEvent(new Event('input'));});
        assert.equal(await page.$eval(widget,e=>e.dataset.valid),'false');
        assert.equal(await page.$$eval('[data-widget="estimation"] svg polyline',els=>els.length),0);
        await page.click('[data-estimation-reset]');
        assert.equal(await page.$eval(widget,e=>e.dataset.valid),'true');
        assert.equal(await page.$eval('[data-widget="estimation"] svg',e=>/(NaN|Infinity)/.test(e.innerHTML)),false);
      }
      if(number==='26'){
        const widget='[data-widget="inference"]';
        assert(Math.abs(await page.$eval(widget,e=>Number(e.dataset.coverage))-.95861053466796875)<1e-12);
        assert.equal(await page.$eval(widget,e=>e.dataset.selectedContains),'true');
        await page.select('[data-inference-method]','hoeffding');
        assert(Math.abs(await page.$eval(widget,e=>Number(e.dataset.coverage))-.9974231719970703)<1e-12);
        await page.$eval('[data-inference-p]',e=>{e.value='1';e.dispatchEvent(new Event('input'));});
        assert(await page.$eval(widget,e=>Number(e.dataset.coverage))>=.95);
        await page.select('[data-inference-method]','wald');
        assert(await page.$eval(widget,e=>Number(e.dataset.coverage))<.2);
        await page.$eval('[data-inference-k]',e=>{e.value='0';e.dispatchEvent(new Event('input'));});
        assert.equal(await page.$eval(widget,e=>Number(e.dataset.lower)),0);
        assert.equal(await page.$eval(widget,e=>Number(e.dataset.upper)),0);
        assert.equal(await page.$eval(widget,e=>e.dataset.selectedContains),'false');
        await page.click('[data-inference-reset]');await page.$eval('[data-inference-n]',e=>e.focus());await page.keyboard.press('ArrowUp');
        assert.equal(await page.$eval(widget,e=>Number(e.dataset.n)),21);
        await page.select('[data-inference-level]','99');
        assert(await page.$eval(widget,e=>Number(e.dataset.coverage))>=.95);
        await page.$eval('[data-inference-n]',e=>{e.value='4';e.dispatchEvent(new Event('input'));});
        assert.equal(await page.$eval(widget,e=>e.dataset.valid),'false');
        await page.$eval('[data-inference-n]',e=>{e.value='';e.dispatchEvent(new Event('input'));});
        assert.equal(await page.$eval(widget,e=>e.dataset.valid),'false');
        assert.equal(await page.$$eval('[data-widget="inference"] svg path',els=>els.length),0);
        await page.click('[data-inference-reset]');assert.equal(await page.$eval(widget,e=>e.dataset.valid),'true');
        assert.equal(await page.$eval('[data-widget="inference"] svg',e=>/(NaN|Infinity)/.test(e.innerHTML)),false);
      }
      if(number==='27'){
        const widget='[data-widget="information"]';
        assert(Math.abs(await page.$eval(widget,e=>Number(e.dataset.entropy))-1.4854752972273344)<1e-12);
        assert(Math.abs(await page.$eval(widget,e=>Number(e.dataset.crossEntropy))-1.7)<1e-12);
        assert(Math.abs(await page.$eval(widget,e=>Number(e.dataset.forwardKL))-.21452470277266555)<1e-12);
        assert(Math.abs(await page.$eval(widget,e=>Number(e.dataset.reverseKL))-.1989648207911662)<1e-9);
        await page.select('[data-information-unit]','nats');
        assert(Math.abs(await page.$eval(widget,e=>Number(e.dataset.crossEntropy))-1.7*Math.log(2))<1e-12);
        await page.click('[data-information-match]');
        assert.equal(await page.$eval(widget,e=>Number(e.dataset.forwardKL)),0);
        assert.equal(await page.$eval(widget,e=>Number(e.dataset.reverseKL)),0);
        await page.click('[data-information-reset]');
        await page.$eval('[data-information-q0]',e=>e.focus());await page.keyboard.press('ArrowUp');
        assert.equal(await page.$eval('[data-information-q0]',e=>Number(e.value)),3);
        await page.$eval('[data-information-q0]',e=>{e.value='0';e.dispatchEvent(new Event('input'));});
        assert.equal(await page.$eval(widget,e=>e.dataset.forwardKL),'Infinity');
        assert(Number.isFinite(await page.$eval(widget,e=>Number(e.dataset.reverseKL))));
        await page.$eval('[data-information-p0]',e=>{e.value='0';e.dispatchEvent(new Event('input'));});
        assert(Number.isFinite(await page.$eval(widget,e=>Number(e.dataset.forwardKL))));
        await page.$$eval('[data-widget="information"] input',els=>{els.slice(0,3).forEach(e=>{e.value='0';e.dispatchEvent(new Event('input'));});});
        assert.equal(await page.$eval(widget,e=>e.dataset.valid),'false');
        assert.equal(await page.$$eval('[data-widget="information"] svg rect',els=>els.length),0);
        await page.click('[data-information-reset]');
        await page.$eval('[data-information-p0]',e=>{e.value='';e.dispatchEvent(new Event('input'));});
        assert.equal(await page.$eval(widget,e=>e.dataset.valid),'false');
        await page.click('[data-information-reset]');assert.equal(await page.$eval(widget,e=>e.dataset.valid),'true');
        assert.equal(await page.$eval('[data-widget="information"] svg',e=>/(NaN|Infinity)/.test(e.innerHTML)),false);
      }
      if(number==='28'){
        const widget='[data-widget="stochastic"]',set=async(key,value)=>page.$eval('[data-stochastic-'+key+']',(e,v)=>{e.value=v;e.dispatchEvent(new Event('input'));},String(value));
        assert.equal(await page.$eval(widget,e=>e.dataset.stable),'true');
        assert(Math.abs(await page.$eval(widget,e=>Number(e.dataset.meanFinal))-2*.9**60)<1e-12);
        const initial=await page.$eval(widget,e=>e.dataset.firstFinal);
        await set('noise',0);assert(Math.abs(await page.$eval(widget,e=>Number(e.dataset.firstFinal)-Number(e.dataset.meanFinal)))<1e-12);
        await page.click('[data-stochastic-reset]');assert.equal(await page.$eval(widget,e=>e.dataset.firstFinal),initial);
        await set('seed',28029);assert.notEqual(await page.$eval(widget,e=>e.dataset.firstFinal),initial);
        await set('a',10);await set('eta',.5);assert.equal(await page.$eval(widget,e=>e.dataset.stable),'false');assert.equal(await page.$eval(widget,e=>e.dataset.factor),'-4');
        assert.equal(await page.$eval('[data-widget="stochastic"] svg',e=>/(NaN|Infinity)/.test(e.innerHTML)),false);
        await page.click('[data-stochastic-reset]');await page.$eval('[data-stochastic-seed]',e=>e.focus());await page.keyboard.press('ArrowUp');assert.equal(await page.$eval(widget,e=>e.dataset.seed),'28029');
        await set('eta','');assert.equal(await page.$eval(widget,e=>e.dataset.valid),'false');assert.equal(await page.$$eval('[data-widget="stochastic"] svg path',els=>els.length),0);
        await page.click('[data-stochastic-reset]');await set('seed',1.5);assert.equal(await page.$eval(widget,e=>e.dataset.valid),'false');
        await page.click('[data-stochastic-reset]');assert.equal(await page.$eval(widget,e=>e.dataset.firstFinal),initial);
      }
      if(number==='29'){
        const widget='[data-widget="numerical"]',set=async(key,value)=>page.$eval('[data-numerical-'+key+']',(e,v)=>{e.value=v;e.dispatchEvent(new Event('input'));},String(value));
        assert.equal(await page.$eval(widget,e=>e.dataset.condition),'100000000');assert.equal(await page.$eval(widget,e=>Number(e.dataset.solution)),2);
        assert(Math.abs(await page.$eval(widget,e=>Number(e.dataset.forward))-1/Math.sqrt(2))<1e-12);
        assert(Math.abs(await page.$eval(widget,e=>Number(e.dataset.residual))-1e-8)<1e-15);
        await set('k',0);await set('j',-8);await page.select('[data-numerical-precision]','32');assert.equal(await page.$eval(widget,e=>e.dataset.lost),'true');assert.equal(await page.$eval(widget,e=>e.dataset.solution),'1');
        await page.select('[data-numerical-precision]','64');assert.equal(await page.$eval(widget,e=>e.dataset.lost),'false');
        await page.click('[data-numerical-reset]');await page.$eval('[data-numerical-k]',e=>e.focus());await page.keyboard.press('ArrowUp');assert.equal(await page.$eval(widget,e=>e.dataset.condition),'1000000000');
        await set('k',.5);assert.equal(await page.$eval(widget,e=>e.dataset.valid),'false');assert.equal(await page.$$eval('[data-widget="numerical"] svg rect',els=>els.length),0);
        await page.click('[data-numerical-reset]');await set('j','');assert.equal(await page.$eval(widget,e=>e.dataset.valid),'false');
        await page.click('[data-numerical-reset]');assert.equal(await page.$eval(widget,e=>e.dataset.valid),'true');assert.equal(await page.$eval('[data-widget="numerical"] svg',e=>/(NaN|Infinity)/.test(e.innerHTML)),false);
      }
      if(number==='30'){
        const widget='[data-widget="learning"]',set=async(key,value)=>page.$eval('[data-learning-'+key+']',(e,v)=>{e.value=v;e.dispatchEvent(new Event('input'));},String(value));
        assert(Math.abs(await page.$eval(widget,e=>Number(e.dataset.radius))-Math.sqrt(Math.log(800)/2000))<1e-12);assert.equal(await page.$eval(widget,e=>e.dataset.psd),'true');assert.equal(await page.$eval(widget,e=>e.dataset.witness),'0');
        await page.select('[data-learning-kernel]','indefinite');assert.equal(await page.$eval(widget,e=>e.dataset.psd),'false');assert.equal(await page.$eval(widget,e=>e.dataset.witness),'-2');
        await set('n',1337);assert(await page.$eval(widget,e=>Number(e.dataset.radius))<.05);
        await page.select('[data-learning-confidence]','99');assert(await page.$eval(widget,e=>Number(e.dataset.radius))>.05);
        await set('n',10);await set('m',100000);assert(await page.$eval(widget,e=>Number(e.dataset.radius))>.8);
        await page.click('[data-learning-reset]');await page.$eval('[data-learning-m]',e=>e.focus());await page.keyboard.press('ArrowUp');assert.equal(await page.$eval(widget,e=>e.dataset.m),'21');
        await set('m',1.5);assert.equal(await page.$eval(widget,e=>e.dataset.valid),'false');assert.equal(await page.$$eval('[data-widget="learning"] svg rect',els=>els.length),0);
        await page.click('[data-learning-reset]');await set('n','');assert.equal(await page.$eval(widget,e=>e.dataset.valid),'false');await page.click('[data-learning-reset]');assert.equal(await page.$eval(widget,e=>e.dataset.valid),'true');
      }
      await page.$eval('.quiz-q',q=>q.querySelector(`[data-i="${(Number(q.dataset.answer)+1)%3}"]`).click());
      assert.match(await page.$eval('.quiz-score',e=>e.textContent),/0 \/ 1/);
      await page.$eval('.quiz-reset',e=>e.click());
      await page.$$eval('.quiz-q',questions=>questions.forEach(q=>q.querySelector(`[data-i="${q.dataset.answer}"]`).click()));
      assert.match(await page.$eval('.quiz-score',e=>e.textContent),/9 \/ 9/);
      await page.$eval('.session-done input',e=>{e.checked=true;e.dispatchEvent(new Event('change'));});
      await page.$eval('#q10-response',e=>{e.value='Check the intermediate domain.';e.dispatchEvent(new Event('input'));});
      await page.$eval('.free-response input',e=>{e.checked=true;e.dispatchEvent(new Event('change'));});
      await page.reload({waitUntil:'networkidle0'});
      assert.equal(await page.$eval('.session-done input',e=>e.checked),true);
      await page.click('.lang-switch');
      assert.equal(await page.$eval('.session-done input',e=>e.checked),true,'Session progress shared across languages');
      assert.equal(await page.$eval('#q10-response',e=>e.value),'Check the intermediate domain.');
      assert.equal(await page.$eval('.free-response input',e=>e.checked),true);
      await page.goto(base+record.file,{waitUntil:'networkidle0'});
      await page.click('#moduleDropdown .badge');
      await page.keyboard.press('Escape');
      assert.equal(await page.$eval('#moduleDropdown .badge',e=>e.getAttribute('aria-expanded')),'false');
    }
    if(taught&&Number(taught[1])>=31){
      const number=taught[1],source=fs.readFileSync(path.join(ROOT,`src/${record.file.endsWith('_EN.html')?'en':'zh'}/module_${number}.md`),'utf8');
      const labOrder=[...source.matchAll(/\{\{LAB:(lab\d+)\}\}/g)].map(m=>m[1]);
      assert.deepEqual(await page.$$eval('.output pre code',els=>els.map(e=>e.textContent.trimEnd())),labOrder.map(id=>fs.readFileSync(path.join(ROOT,`artifacts/module_${number}/${id}.output.txt`),'utf8').trimEnd()),'Capstone actual outputs agree in source order');
      assert.equal(await page.$$eval('.session-done input',els=>els.length),4);
      assert.equal(await page.$$eval('[data-free-response]',els=>els.length),1);
      assert.equal(await page.$$eval('.lab-plot img',els=>els.length),1);
      await page.$eval('.lab-plot img',e=>e.scrollIntoView({block:'center'}));
      await page.waitForFunction(()=>{const e=document.querySelector('.lab-plot img');return e.complete&&e.naturalWidth>0;},{timeout:10000});
      assert(await page.$eval('.lab-plot img',e=>e.complete&&e.naturalWidth>0),'Executed plot loads');
      await page.$eval('.session-done input',e=>{e.checked=true;e.dispatchEvent(new Event('change'));});
      await page.$eval('#q10-response',e=>{e.value='State the model and proof obligations.';e.dispatchEvent(new Event('input'));});
      await page.$eval('.free-response input',e=>{e.checked=true;e.dispatchEvent(new Event('change'));});
      await page.reload({waitUntil:'networkidle0'});
      assert.equal(await page.$eval('#q10-response',e=>e.value),'State the model and proof obligations.');
      await page.click('.lang-switch');
      assert.equal(await page.$eval('.session-done input',e=>e.checked),true);
      assert.equal(await page.$eval('#q10-response',e=>e.value),'State the model and proof obligations.');
      assert.equal(await page.$eval('.free-response input',e=>e.checked),true);
      await page.goto(base+record.file,{waitUntil:'networkidle0'});
      await page.click('#moduleDropdown .badge');await page.keyboard.press('Escape');
      assert.equal(await page.$eval('#moduleDropdown .badge',e=>e.getAttribute('aria-expanded')),'false');
      await page.$eval('.lab-plot img',e=>e.scrollIntoView({block:'center'}));
      await page.waitForFunction(()=>{const e=document.querySelector('.lab-plot img');return e.complete&&e.naturalWidth>0;},{timeout:10000});
      const plot=await page.$('.lab-plot');await plot.screenshot({path:path.join(screenshotDir,record.file.replace('.html','-labplot.png'))});
    }
    for(const width of [360,390,768,1280]){
      await page.setViewport({width,height:900});
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${record.file}: fits ${width}px`);
    }
    await page.setViewport({width:1280,height:900});
    if(taught&&Number(taught[1])>0)await page.screenshot({path:path.join(screenshotDir,record.file.replace('.html','.png'))});
    if(taught&&Number(taught[1])>0&&Number(taught[1])<=30){
      const widget=await page.$('[data-widget]');
      assert(widget,`${record.file}: interactive demonstration exists`);
      await widget.screenshot({path:path.join(screenshotDir,record.file.replace('.html','-widget.png'))});
    }
  }
  for(const lang of ['EN','ZH']){
    await page.setViewport({width:360,height:900});
    await page.goto(base+(lang==='EN'?'index.html':'index_ZH.html'),{waitUntil:'networkidle0'});
    assert.equal(await page.$$eval('.module-card',els=>els.length),32);
    assert.equal(await page.$$eval('a.module-card',els=>els.length),report.published.length);
    assert.equal(await page.$$eval('article.module-card.planned',els=>els.length),32-report.published.length);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'Mobile overview fits');
    await page.screenshot({path:path.join(screenshotDir,`overview-${lang}-mobile.png`),fullPage:true});
  }
  assert.deepEqual(errors,[],'No browser runtime errors');
  assert.deepEqual(failures,[],'No failed local assets');
  console.log(`PASS: ${report.records.length} bilingual pages; ${linksChecked} links/assets; executed outputs; formulas; quiz/reset; composition/domain cases; saved progress/response; language switching; responsive layouts.`);
  console.log(`Screenshots: ${screenshotDir}`);
}finally{if(browser)await browser.close();server.close();}
