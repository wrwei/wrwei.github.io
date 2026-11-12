// Original SVG diagrams, generated in both languages from the same values.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import './figures-02.mjs';
import './figures-03.mjs';
import './figures-04.mjs';
import './figures-05.mjs';
import './figures-06.mjs';
import './figures-07.mjs';
import './figures-08.mjs';
import './figures-09.mjs';
import './figures-10.mjs';
import './figures-11.mjs';
import './figures-12.mjs';
import './figures-13.mjs';
import './figures-14.mjs';
import './figures-15.mjs';
import './figures-16.mjs';
import './figures-17.mjs';
import './figures-18.mjs';
import './figures-19.mjs';
import './figures-20.mjs';
import './figures-21.mjs';
import './figures-22.mjs';
import './figures-23.mjs';
import './figures-24.mjs';
import './figures-25.mjs';
import './figures-26.mjs';
import './figures-27.mjs';
import './figures-28.mjs';
import './figures-29.mjs';
import './figures-30.mjs';
import './figures-31.mjs';
import './figures-32.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const text=(x,y,s,size=17,anchor='start',colour='#1a2e4a')=>`<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}" fill="${colour}">${esc(s)}</text>`;
const box=(x,y,w,h,fill='#f0f9ff',stroke='#0ea5e9')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${fill}" stroke="${stroke}"/>`;
const arrow=(x1,y1,x2,y2)=>`<path d="M${x1},${y1} L${x2},${y2}" stroke="#2563eb" stroke-width="2.5" marker-end="url(#arrow)"/>`;
function svg(title,description,body,height=340){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 ${height}" role="img" aria-label="${esc(description)}"><title id="title">${esc(title)}</title><desc id="desc">${esc(description)}</desc><defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#2563eb"/></marker></defs><rect width="760" height="${height}" fill="white"/><g font-family="system-ui,Segoe UI,Microsoft YaHei,sans-serif">${body}</g></svg>`;}
for(const lang of ['en','zh']){
  const zh=lang==='zh';
  const directory=path.join(ROOT,'src/figures',lang);fs.mkdirSync(directory,{recursive:true});
  let body=box(20,20,720,300,'#faf5ff','#7e22ce')+text(35,49,zh?'实数 R：例如 √2、π':'Real numbers R: e.g. √2, π');
  body+=box(50,70,660,230,'#fff7ed','#c2410c')+text(66,99,zh?'有理数 Q：例如 1/3、−7/2':'Rational numbers Q: e.g. 1/3, −7/2');
  body+=box(85,122,590,156,'#f0fdf4','#15803d')+text(101,151,zh?'整数 Z：例如 −3、−1':'Integers Z: e.g. −3, −1');
  body+=box(120,174,520,82)+text(137,206,zh?'自然数 N：0、1、2、…':'Natural numbers N: 0, 1, 2, …')+text(137,232,zh?'本系列包含零':'This series includes zero',15);
  fs.writeFileSync(path.join(directory,'fig-01-1.svg'),svg(zh?'数系的包含关系':'Nested number systems',zh?'N 包含于 Z，Z 包含于 Q，Q 包含于 R。框的大小不表示元素数量。':'N is a subset of Z, which is a subset of Q, which is a subset of R. Box sizes do not represent cardinality.',body));
  body=box(70,45,220,245)+box(465,45,220,245,'#faf5ff','#7e22ce')+text(180,30,zh?'定义域 D':'Domain D',18,'middle')+text(575,30,zh?'陪域 C':'Codomain C',18,'middle');
  [0,1,2].forEach((v,i)=>{let y=95+i*65;body+=text(180,y,v,22,'middle')+text(575,y,2*v+1,22,'middle')+arrow(225,y-7,525,y-7);});
  body+=text(575,275,'9',22,'middle','#c2410c')+text(380,317,zh?'像 = {1, 3, 5}；9 未被达到':'Image = {1, 3, 5}; 9 is not attained',17,'middle');
  fs.writeFileSync(path.join(directory,'fig-01-2.svg'),svg(zh?'定义域 陪域与像':'Domain codomain and image',zh?'0 映射到 1，1 映射到 3，2 映射到 5；陪域还有未使用的 9。':'0 maps to 1, 1 maps to 3, and 2 maps to 5. The codomain also contains the unused value 9.',body));
  body=text(35,38,zh?'先 g，再 f：f(g(3))':'g first, then f: f(g(3))',18)+text(35,195,zh?'先 f，再 g：g(f(3))':'f first, then g: g(f(3))',18);
  [[70,3,'g(t) = t²',9,'f(t) = 2t+1',19],[225,3,'f(t) = 2t+1',7,'g(t) = t²',49]].forEach(([y,x,inner,middle,outer,result])=>{
    body+=box(35,y,100,70)+text(85,y+43,x,24,'middle')+arrow(140,y+35,245,y+35)+text(190,y-8,inner,15,'middle')+box(250,y,100,70)+text(300,y+43,middle,24,'middle')+arrow(355,y+35,515,y+35)+text(435,y-8,outer,15,'middle')+box(520,y,180,70,'#f0fdf4','#15803d')+text(610,y+43,result,24,'middle');
  });
  fs.writeFileSync(path.join(directory,'fig-01-3.svg'),svg(zh?'两种复合顺序':'Two composition orders',zh?'相同输入 3：先平方再乘二加一得到 19；先乘二加一再平方得到 49。':'Starting at 3, square then double and add one to obtain 19; reversing the rules obtains 49.',body));
  body=text(380,33,zh?'项 = 10i + j':'Term = 10i + j',20,'middle');
  for(let j=1;j<=3;j++){body+=text(130+j*125,71,`j = ${j}`,17,'middle');}
  for(let i=1;i<=2;i++){body+=text(90,122+(i-1)*78,`i = ${i}`,17,'middle');for(let j=1;j<=3;j++){body+=box(80+j*125,90+(i-1)*78,100,56)+text(130+j*125,125+(i-1)*78,10*i+j,22,'middle');}body+=text(650,125+(i-1)*78,i===1?'= 36':'= 66',20,'middle');}
  body+=text(380,288,zh?'总和：36 + 66 = 102':'Total: 36 + 66 = 102',22,'middle');
  fs.writeFileSync(path.join(directory,'fig-01-4.svg'),svg(zh?'矩形双重求和':'Rectangular double sum',zh?'第一行为 11、12、13，总和 36；第二行为 21、22、23，总和 66；合计 102。':'Row one contains 11, 12, 13 and totals 36. Row two contains 21, 22, 23 and totals 66. Combined total is 102.',body));
}
console.log('Generated original bilingual figures for Modules 01–32.');
