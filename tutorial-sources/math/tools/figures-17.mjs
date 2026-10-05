import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {text,box,svg} from './svg.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
for(const lang of ['en','zh']){
 const zh=lang==='zh',directory=path.join(ROOT,'src/figures',lang);fs.mkdirSync(directory,{recursive:true});
 const write=(n,title,description,body,height=350)=>fs.writeFileSync(path.join(directory,`fig-17-${n}.svg`),svg(title,description,body,height));
 let body=text(380,30,zh?'递增函数的左右矩形':'Left and right rectangles for an increasing function',23,'middle');
 for(const [left,right] of [[65,false],[430,true]]){
  const px=x=>left+265*x,py=y=>245-150*y;
  for(let k=0;k<4;k++){const height=(k+(right?1:0))/4;body+=`<rect x="${px(k/4)}" y="${py(height)}" width="66.25" height="${150*height}" fill="${right?'#fed7aa':'#bfdbfe'}" stroke="${right?'#c2410c':'#2563eb'}"/>`;}
  body+=`<path d="M${left},245H${left+265}M${left},245V85" stroke="#94a3b8"/><path d="M${left},245L${left+265},95" stroke="#15803d" stroke-width="3"/>`+text(left,268,'0',16,'middle')+text(left+265,268,'1',16,'middle')+text(left+132,305,right?(zh?'右和 = 5/8':'Right sum = 5/8'):(zh?'左和 = 3/8':'Left sum = 3/8'),20,'middle');
 }
 body+=text(380,343,zh?'f(x)=x，n=4；真实积分 1/2，间隙 1/4。':'f(x)=x, n=4; true integral 1/2, gap 1/4.',18,'middle');
 write(1,zh?'左右和夹逼积分':'Left and right sums enclose the integral',zh?'四片左和八分之三，右和八分之五，夹住x在零一上的积分二分之一。':'Four left rectangles total 3/8 and right rectangles 5/8, enclosing the integral 1/2 of x on [0,1].',body,370);
 body=text(380,30,zh?'密度高度与积分质量不同':'Density height differs from integrated mass',24,'middle');
 body+='<path d="M110,260L610,80V260Z" fill="#eff6ff"/><path d="M235,260V215L485,125V260Z" fill="#93c5fd"/><path d="M110,260H640M110,270V60" stroke="#94a3b8"/><path d="M110,260L610,80" stroke="#2563eb" stroke-width="4"/><circle cx="610" cy="80" r="5" fill="#c2410c"/>';
 body+=text(650,82,'p(1)=2',18,'end')+text(360,190,zh?'蓝色质量 = 1/2':'Blue mass = 1/2',20,'middle')+text(110,283,'0',16,'middle')+text(235,283,'1/4',16,'middle')+text(485,283,'3/4',16,'middle')+text(610,283,'1',16,'middle')+text(380,326,zh?'p(x)=2x 在 [0,1]；总积分 = 1。':'p(x)=2x on [0,1]; total integral = 1.',20,'middle');
 write(2,zh?'线性密度的高度和质量':'Linear density height and mass',zh?'零一上二倍x密度高度最大二，总质量一，四分之一至四分之三区间质量二分之一。':'The density 2x on [0,1] has maximum height two and total mass one. The highlighted interval from one-quarter to three-quarters has mass one-half.',body);
 body=text(380,30,zh?'同样三个样点，不同插值曲线':'The same three samples, different interpolants',24,'middle');
 for(const [left,kind] of [[55,'trap'],[425,'simp']]){
  const px=x=>left+270*x,py=y=>235-135*y,points=[];
  for(let i=0;i<=100;i++){const x=i/100,y=kind==='trap'?(x<=.5?.125*x:1.875*x-.875):1.75*x*x-.75*x;points.push(`${px(x)},${py(y)}`);}
  body+=`<path d="M${left},235H${left+270}M${left},260V70" stroke="#94a3b8"/><path d="M${points.join('L')}" fill="none" stroke="#c2410c" stroke-width="3"/>`;
  const truePoints=[];for(let i=0;i<=100;i++){const x=i/100;truePoints.push(`${px(x)},${py(x**4)}`);}body+=`<path d="M${truePoints.join('L')}" fill="none" stroke="#2563eb" stroke-width="3"/>`;
  for(const x of [0,.5,1])body+=`<circle cx="${px(x)}" cy="${py(x**4)}" r="5" fill="#1a2e4a"/>`;
  body+=text(left+135,292,kind==='trap'?(zh?'线性梯形':'Linear trapezoids'):(zh?'二次辛普森':'Quadratic Simpson'),21,'middle');
 }
 body+=text(380,330,zh?'蓝 x⁴；橙插值；二次插值可能低于零。':'Blue x⁴; orange interpolant; the quadratic can dip below zero.',17,'middle');
 write(3,zh?'梯形与辛普森插值':'Trapezoidal and Simpson interpolation',zh?'零二分之一一三个样点用折线或二次曲线插值，真实函数为x四次，二次插值可以局部低于零。':'Samples at zero, one-half and one use linear or quadratic interpolation of x to the fourth power. The quadratic interpolant can locally dip below zero.',body);
 body=text(380,30,zh?'欧拉因子 q=1−ah 的不同区域':'Different regions of the Euler factor q=1−ah',24,'middle')+box(45,75,210,145,'#dcfce7','#15803d')+box(275,75,210,145,'#fff7ed','#c2410c')+box(505,75,210,145,'#fee2e2','#dc2626');
 body+=text(150,111,'0 < ah ≤ 1',21,'middle')+text(380,111,'1 < ah < 2',21,'middle')+text(610,111,'ah > 2',21,'middle')+text(150,153,zh?'非负衰减':'Nonnegative decay',20,'middle')+text(380,153,zh?'交替衰减':'Alternating decay',20,'middle')+text(610,153,zh?'交替增长':'Alternating growth',20,'middle')+text(150,193,'0 ≤ q < 1',19,'middle')+text(380,193,'−1 < q < 0',19,'middle')+text(610,193,'q < −1',19,'middle');
 body+=text(380,270,zh?'ah=2：q=−1，中性振荡，不衰减。':'ah=2: q=−1, neutral oscillation without decay.',20,'middle')+text(380,315,zh?'a>0，h>0；稳定、非负、准确分别检查。':'a>0, h>0; check stability, nonnegativity and accuracy separately.',17,'middle');
 write(4,zh?'欧拉稳定与非负区域':'Euler stability and nonnegativity regions',zh?'正速率正步长下乘积ah在零一范围保持非负，介于一二为稳定交替，大于二不稳定，等于二中性振荡。':'For positive rate and step, ah up to one preserves nonnegative states, between one and two yields stable alternating decay, above two is unstable, and exactly two gives neutral oscillation.',body);
}
