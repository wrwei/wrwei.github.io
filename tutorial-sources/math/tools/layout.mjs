// Read-only narrow-screen layout diagnostics. Usage: node .../layout.mjs module_08_EN.html
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const require=createRequire(path.join(root,'../ai/tools/package.json'));
const browser=await require('puppeteer-core').launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
  const page=await browser.newPage();await page.setViewport({width:360,height:900});
  await page.goto(pathToFileURL(path.resolve(root,'../../docs/tutorials/math',process.argv[2]||'module_08_EN.html')).href,{waitUntil:'networkidle0'});
  console.log(JSON.stringify(await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,elements:[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();return r.right>innerWidth+1&&r.width>0;}).map(e=>({tag:e.tagName,classes:e.className?.baseVal??e.className,text:e.textContent.slice(0,130),right:e.getBoundingClientRect().right,width:e.getBoundingClientRect().width,overflow:getComputedStyle(e).overflowX})).slice(0,35)})),null,2));
  console.log(JSON.stringify(await page.evaluate(()=>[...document.querySelectorAll('.katex-mathml')].map(e=>({text:e.textContent.slice(0,45),width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height,overflow:getComputedStyle(e).overflowX,position:getComputedStyle(e).position,clip:getComputedStyle(e).clip})).filter(e=>e.text.startsWith('a≡'))),null,2));
  console.log(JSON.stringify(await page.evaluate(()=>{const initial=document.documentElement.scrollWidth;return [...document.querySelector('.content').children].flatMap(e=>{const old=e.style.display;e.style.display='none';const width=document.documentElement.scrollWidth;e.style.display=old;return width<initial?[{tag:e.tagName,text:e.textContent.slice(0,190),width}]:[];});}),null,2));
}finally{await browser.close();}
