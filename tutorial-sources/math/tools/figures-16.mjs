import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {text,box,svg} from './svg.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
for(const lang of ['en','zh']){
 const zh=lang==='zh',directory=path.join(ROOT,'src/figures',lang);fs.mkdirSync(directory,{recursive:true});
 const write=(n,title,description,body,height=350)=>fs.writeFileSync(path.join(directory,`fig-16-${n}.svg`),svg(title,description,body,height));
 function curve(fn,left,right,px,py,colour,width=3){const pts=[];for(let i=0;i<=120;i++){const x=left+(right-left)*i/120;pts.push(`${px(x)},${py(fn(x))}`);}return `<path d="M${pts.join('L')}" fill="none" stroke="${colour}" stroke-width="${width}"/>`;}
 let body=text(380,30,zh?'x³ 在 a=2 的局部模型':'The local model of x³ at a=2',24,'middle'),px=h=>380+760*h,py=y=>175-22*y;
 body+='<path d="M80,175H680M380,65V290" stroke="#94a3b8"/>'+curve(h=>12*h,-.3,.3,px,py,'#15803d')+curve(h=>12*h+6*h*h+h*h*h,-.3,.3,px,py,'#2563eb')+curve(h=>12.61*h,-.3,.3,px,py,'#c2410c',2)+`<circle cx="${px(.1)}" cy="${py(1.261)}" r="5" fill="#c2410c"/>`;
 body+=text(380,316,zh?'横轴 h；纵轴增量 f(2+h)−f(2)。':'Horizontal h; vertical increment f(2+h)−f(2).',17,'middle')+text(380,343,zh?'蓝：真实；绿：12h；橙：h=.1 的割线。':'Blue: true; green: 12h; orange: secant at h=.1.',17,'middle');
 write(1,zh?'三次函数割线与切线':'Cubic secant and tangent',zh?'零中心增量图中真实三次增量、斜率十二切线与零点一处斜率十二点六一割线比较，余项为六h平方加h立方。':'Increment plot compares the true cubic change, tangent slope twelve and secant slope 12.61 at h=0.1. The remainder is 6h²+h³.',body,370);
 body=text(380,30,zh?'同一中心的不同有限模型':'Different finite models about the same centre',24,'middle');px=x=>95+(x+.8)/2*570;py=y=>175-70*y;
 body+='<path d="M95,175H665M'+px(0)+',65V290" stroke="#94a3b8"/>'+curve(Math.log1p,-.8,1.2,px,py,'#2563eb')+curve(()=>0,-.8,1.2,px,py,'#94a3b8',2)+curve(x=>x,-.8,1.2,px,py,'#15803d')+curve(x=>x-x*x/2,-.8,1.2,px,py,'#c2410c');
 body+=text(380,316,zh?'蓝 ln(1+x)；灰 T₀；绿 T₁；橙 T₂。':'Blue ln(1+x); grey T₀; green T₁; orange T₂.',18,'middle')+text(380,345,zh?'中心 a=0；真实函数仍要求 x>−1。':'Centre a=0; the true function still requires x>−1.',18,'middle');
 write(2,zh?'对数泰勒模型':'Logarithm Taylor models',zh?'零中心对数真实曲线与零一二阶多项式比较，远离中心时偏差增加，真实域仍为x大于负一。':'The true logarithm and order-zero, one and two models share centre zero but differ away from it. The real log domain remains x greater than minus one.',body,370);
 body=text(380,30,zh?'示意误差模型：h² + 10⁻⁸/h':'Illustrative error model: h² + 10⁻⁸/h',23,'middle');px=z=>90+(z+5)/5*580;py=e=>285-(e+7)/8*210;
 body+='<path d="M90,285H670M90,65V285" stroke="#94a3b8"/>'+curve(z=>2*z,-5,0,px,py,'#15803d')+curve(z=>-8-z,-5,0,px,py,'#c2410c')+curve(z=>Math.log10(10**(2*z)+1e-8/10**z),-5,0,px,py,'#2563eb');
 for(const z of [-5,-4,-3,-2,-1,0])body+=text(px(z),310,'10^'+z,16,'middle');
 body+=text(380,343,zh?'横：h 对数；纵：误差对数；绿截断、橙舍入、蓝总和。':'Log axes: green truncation, orange rounding, blue total.',17,'middle');
 // Clip the low ends of illustrative component curves to the plotting area.
 body=body.replace('<path d="M90,285H670M90,65V285"','<defs><clipPath id="error-window"><rect x="90" y="65" width="580" height="220"/></clipPath></defs><path d="M90,285H670M90,65V285"').replace('stroke="#94a3b8"/>','stroke="#94a3b8"/><g clip-path="url(#error-window)">').replace('<text x="90" y="310"','</g><text x="90" y="310"');
 write(3,zh?'差分误差权衡':'Finite-difference error trade-off',zh?'示意而非实验拟合的误差模型，步长降低时平方截断项下降、反比舍入项上升，二者和有中间最小。':'An illustrative model, rather than a fit to lab observations: quadratic truncation falls with step size, inverse-step rounding rises, and their sum has an intermediate minimum.',body,370);
 body=text(380,30,zh?'中心平均不能证明折点可导':'A central average does not prove differentiability at a kink',22,'middle')+box(35,65,325,245)+box(395,65,325,245);
 body+='<path d="M80,190L195,115L310,190M440,190H555L670,115" stroke="#2563eb" stroke-width="4"/>'+text(195,100,'|x|',22,'middle')+text(555,100,'ReLU(x)',22,'middle')+text(195,230,zh?'左 −1，右 +1':'Left −1, right +1',20,'middle')+text(555,230,zh?'左 0，右 1':'Left 0, right 1',20,'middle')+text(195,276,zh?'中心 = 0；不可导':'Central = 0; no derivative',18,'middle')+text(555,276,zh?'中心 = 0.5；不可导':'Central = 0.5; no derivative',18,'middle');
 // Absolute value must open upward in a conventional upward-value plot.
 body=body.replace('M80,190L195,115L310,190','M80,115L195,190L310,115');
 write(4,zh?'绝对值与ReLU的单侧斜率':'One-sided slopes of absolute value and ReLU',zh?'绝对值左右斜率负一正一，ReLU左右零一；中心差分分别稳定零和零点五，但都没有双侧导数。':'Absolute value has left/right slopes minus one/plus one, ReLU zero/one. Their central differences are respectively zero and one-half despite absent two-sided derivatives.',body);
}
