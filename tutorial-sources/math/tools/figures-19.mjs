import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {text,box,arrow,svg} from './svg.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
for(const lang of ['en','zh']){
 const zh=lang==='zh',directory=path.join(ROOT,'src/figures',lang);fs.mkdirSync(directory,{recursive:true});
 const write=(n,title,description,body,height=350)=>fs.writeFileSync(path.join(directory,`fig-19-${n}.svg`),svg(title,description,body,height));
 const pathCurve=(fn,lo,hi,px,py,colour)=>{const points=[];for(let i=0;i<=100;i++){const x=lo+(hi-lo)*i/100;points.push(`${px(x)},${py(fn(x))}`);}return `<path d="M${points.join('L')}" fill="none" stroke="${colour}" stroke-width="3"/>`;};
 let body=text(380,30,zh?'凸弦与支持切线':'Convex chords and supporting tangents',24,'middle'),px=x=>380+180*x,py=y=>260-110*y;
 body+='<defs><clipPath id="convex-window"><rect x="90" y="65" width="585" height="225"/></clipPath></defs><g clip-path="url(#convex-window)"><path d="M90,260H675M380,65V290" stroke="#94a3b8"/>'+pathCurve(x=>x*x,-1.25,1.25,px,py,'#c2410c')+`<path d="M${px(-1)},${py(1)}H${px(1)}" stroke="#15803d" stroke-width="3"/>`+pathCurve(x=>x-.25,-.5,1.2,px,py,'#2563eb')+`<circle cx="${px(.5)}" cy="${py(.25)}" r="5" fill="#2563eb"/></g>`;
 body+=text(380,105,zh?'绿弦位于图上方':'Green chord lies above the graph',20,'middle')+text(525,245,zh?'切点 x=.5':'Tangent at x=.5',18)+text(380,325,zh?'f=x²；蓝支持线 x−1/4；强凸 μ=2。':'f=x²; blue supporting line x−1/4; strong convexity μ=2.',18,'middle');
 write(1,zh?'凸性与一阶支持':'Convexity and first-order support',zh?'平方函数在两端点弦下、在半点支持切线上，强凸常数二给统一二次裕量。':'The square function lies below its endpoint chord and above its tangent at one-half, with strong-convexity constant two.',body);
 body=text(380,30,zh?'下降方向仍可能被大步长过冲':'A descent direction can overshoot with a large step',23,'middle');px=x=>380+170*x;py=y=>275-52*y;
 body+='<path d="M100,275H665M380,60V290" stroke="#94a3b8"/>'+pathCurve(x=>2*x*x,-1.4,1.4,px,py,'#2563eb');
 for(const [x,col] of [[1,'#1a2e4a'],[.2,'#15803d'],[-1.2,'#c2410c']])body+=`<circle cx="${px(x)}" cy="${py(2*x*x)}" r="6" fill="${col}"/>`;
 body+=text(590,170,zh?'起点 (1,2)':'Start (1,2)',18)+text(430,263,'η=.2 → f=.08',18)+text(180,106,'η=.55 → f=2.88',18,'middle','#c2410c')+text(380,325,zh?'f=2x²，g(1)=4；新点 1−4η。':'f=2x², g(1)=4; next point 1−4η.',20,'middle');
 write(2,zh?'梯度步的有限变化':'Finite change of a gradient step',zh?'正曲率四的二次从一点用零点二步下降到零点二，用零点五五步过冲负一点二且目标增加。':'For curvature-four quadratic at one, step 0.2 moves to 0.2 and lowers the objective; step 0.55 overshoots to -1.2 and raises it.',body);
 body=text(380,30,zh?'同一步作用于两个特征模态':'One step acts on two eigenmodes',24,'middle');
 const headers=zh?['η','λ=2 因子','λ=4 因子','最坏幅度']:['η','λ=2 factor','λ=4 factor','Worst magnitude'];
 headers.forEach((s,i)=>{body+=text(100+185*i,83,s,19,'middle');});
 [['.2','.6','.2','.6'],['1/3','1/3','−1/3','1/3'],['.5','0','−1','1'],['.55','−.1','−1.2','1.2']].forEach((row,j)=>{body+=box(25,98+j*44,710,40,j>=2?'#fff7ed':'#f0f9ff');row.forEach((s,i)=>{body+=text(100+185*i,125+j*44,s,21,'middle');});});
 body+=text(380,319,zh?'ρ=max|1−ηλ|；保证全初值需 ρ<1。':'ρ=max|1−ηλ|; every-start convergence needs ρ<1.',20,'middle');
 write(3,zh?'二次谱步长表':'Quadratic spectral step table',zh?'特征值二四时步长零点二、三分之一、零点五、零点五五的最坏因子分别零点六、三分之一、一、一点二，严格小于一才全起点收敛。':'Eigenvalues two and four give worst magnitudes 0.6, one-third, one and 1.2 for steps 0.2, one-third, 0.5 and 0.55. The strict magnitude bound is essential.',body);
 body=text(380,30,zh?'同一目标，不同更新模型':'One objective, different update models',24,'middle')+box(35,70,215,210)+box(275,70,210,210)+box(510,70,215,210);
 body+=text(142,109,zh?'梯度':'Gradient',23,'middle')+text(380,109,zh?'循环坐标':'Cyclic coordinates',20,'middle')+text(617,109,zh?'牛顿':'Newton',23,'middle')+text(142,163,'x ← x−ηg',22,'middle')+text(380,163,'xᵢ ← xᵢ−gᵢ/Aᵢᵢ',19,'middle')+text(617,163,'Hp=−g',22,'middle')+text(142,218,zh?'统一标量步':'One scalar step',19,'middle')+text(380,218,zh?'后步用新坐标':'Use fresh coordinates',18,'middle')+text(617,218,zh?'求解而非显式逆':'Solve the system',19,'middle')+text(380,329,zh?'比较目标下降、总成本与保障；不是只数迭代。':'Compare decrease, total cost and safeguards, as well as iteration counts.',17,'middle');
 write(4,zh?'梯度坐标牛顿比较':'Gradient coordinate and Newton comparison',zh?'梯度统一标量步，循环坐标用刚更新值，牛顿求耦合曲率系统，成本和非凸保障各不同。':'Gradient uses one scalar step, cyclic coordinates use fresh updates, and Newton solves a coupled curvature system; costs and nonconvex safeguards differ.',body);
}
