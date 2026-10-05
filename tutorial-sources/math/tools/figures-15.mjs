import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {text,box,arrow,svg} from './svg.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
for(const lang of ['en','zh']){
 const zh=lang==='zh',directory=path.join(ROOT,'src/figures',lang);fs.mkdirSync(directory,{recursive:true});
 const write=(n,title,description,body,height=350)=>fs.writeFileSync(path.join(directory,`fig-15-${n}.svg`),svg(title,description,body,height));
 let body=text(380,30,zh?'控制整个尾部，而不是一个样本':'Control a whole tail, rather than one sample',24,'middle');
 body+='<rect x="55" y="185" width="290" height="40" fill="#dcfce7"/><path d="M55,205H345M410,160H705" stroke="#94a3b8"/>'+text(70,248,'ε = 0.2',16)+text(470,282,zh?'有界，仍不收敛':'Bounded, still divergent',18);
 for(let n=1;n<=16;n++){body+=`<circle cx="${55+n*17}" cy="${205-100/n}" r="4" fill="${n>=6?'#15803d':'#2563eb'}"/>`;body+=`<circle cx="${410+n*17}" cy="${160-60*(n%2?-1:1)}" r="4" fill="#c2410c"/>`;}
 body+=text(190,75,'1/n → 0',22,'middle')+text(565,75,'(−1)ⁿ',22,'middle')+text(190,282,zh?'n ≥ 6：全部误差 < 0.2':'n ≥ 6: every error < 0.2',18,'middle')+text(380,325,zh?'索引从左到右递增；绿带表示距零小于 ε。':'Indices increase left to right; the green band is distance < ε from zero.',16,'middle');
 write(1,zh?'尾部带与交替反例':'Tail band and alternating counterexample',zh?'倒数数列从第六项起都在零的零点二误差带中，交替正负一仍有两种分离返回值。':'Every reciprocal-sequence term from index six has error below 0.2. Alternating plus/minus one repeatedly visits separated values.',body);
 body=text(380,30,zh?'实际值与邻近行为分别检查':'Check assigned values and nearby behaviour separately',23,'middle');
 body+='<path d="M55,245H340M150,70V250M420,245H710M565,70V250" stroke="#94a3b8"/><path d="M65,235L325,105" stroke="#2563eb" stroke-width="3"/><circle cx="195" cy="170" r="7" fill="white" stroke="#2563eb" stroke-width="3"/><circle cx="195" cy="100" r="6" fill="#c2410c"/><path d="M435,220H565M565,130H700" stroke="#2563eb" stroke-width="3"/><circle cx="565" cy="220" r="6" fill="white" stroke="#2563eb" stroke-width="2"/><circle cx="565" cy="130" r="6" fill="#2563eb"/>';
 body+=text(230,94,'g(1)=7',17)+text(235,170,'lim = 2',17)+text(475,210,'0',17)+text(680,118,'1',17)+text(195,288,zh?'改点值可以修复':'Changing one value can repair',18,'middle')+text(565,288,zh?'改点值不能消除跳跃':'One value cannot remove a jump',18,'middle')+text(380,325,zh?'左图纵向示意，不按七与二的比例绘制。':'Left panel is schematic; vertical distances are not to scale.',16,'middle');
 write(2,zh?'可去错配与跳跃':'Removable mismatch and jump',zh?'左图去心极限二而赋值七，可以改赋二修复；右图左右输出零与一不同，任何零处赋值都无法修复。':'The left function has limit two but assigned value seven, repaired by assigning two. The right function has different left/right outputs zero and one, which no single point assignment repairs.',body);
 body=text(380,30,zh?'N 表示项数，保留指数 0 至 N−1':'N counts terms: retain exponents 0 through N−1',23,'middle');
 body+='<path d="M70,100H695" stroke="#15803d" stroke-width="2" stroke-dasharray="7 4"/><path d="M70,245H695" stroke="#94a3b8"/>'+text(700,104,'2',18);
 for(const [i,N] of [1,2,4,10].entries()){const x=130+i*155,sum=2*(1-2**(-N)),y=245-72.5*sum;body+=`<rect x="${x-24}" y="${y}" width="48" height="${245-y}" fill="#93c5fd"/><path d="M${x+33},${y}V100" stroke="#c2410c" stroke-width="3"/>`+text(x,272,`N=${N}`,18,'middle')+text(x,307,['1','1/2','1/8','1/512'][i],18,'middle','#c2410c');}
 body+=text(380,340,zh?'橙色：精确尾部 2^{1−N}；蓝色：部分和。':'Orange: exact tail 2^{1−N}; blue: partial sum.',17,'middle');
 write(3,zh?'几何部分和及精确尾部':'Geometric partial sums and exact tails',zh?'一半比值几何级数的和为二，保留一二四十项时尾部为一、二分之一、八分之一、五百一十二分之一。':'The ratio-one-half series sums to two. Retaining one, two, four and ten terms leaves tails 1, 1/2, 1/8 and 1/512.',body,365);
 body=text(380,30,zh?'小步长不自动表示接近解':'A small applied step does not imply proximity to the solution',22,'middle')+box(35,65,215,160)+box(275,65,210,160)+box(510,65,215,160);
 body+=text(142,100,zh?'当前 x = 0':'Current x = 0',21,'middle')+text(142,145,zh?'原残差 10':'Original residual 10',20,'middle')+text(142,190,'F(x)=.9x+10',18,'middle');
 body+=text(380,100,'α = 10⁻¹⁰',21,'middle')+text(380,145,zh?'应用步长 10⁻⁹':'Applied step 10⁻⁹',20,'middle')+text(380,190,'10⁻⁹ < tol 10⁻⁶',18,'middle');
 body+=text(617,100,zh?'不动点 x* = 100':'Fixed point x* = 100',20,'middle')+text(617,145,zh?'误差近 100':'Error near 100',20,'middle')+text(617,190,'r/(1−.9) ≈ 100',18,'middle')+arrow(250,145,275,145)+arrow(485,145,510,145)+text(380,277,zh?'报告原方程残差与已证明误差界。':'Report the original residual and the proved error bound.',20,'middle')+text(380,322,zh?'使用松弛后，步长阈值的含义发生变化。':'Relaxation changes the meaning of an update threshold.',18,'middle');
 write(4,zh?'松弛产生的假精度':'False accuracy from relaxation',zh?'原映射零处残差十，乘极小松弛后步长低于阈值，但距一百不动点仍几乎一百。':'The original residual at zero is ten. Extreme relaxation puts the applied step below tolerance, while the distance to the fixed point one hundred remains almost one hundred.',body);
}
