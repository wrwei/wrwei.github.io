import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {text,box,arrow,svg} from './svg.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
for(const lang of ['en','zh']){
 const zh=lang==='zh',directory=path.join(ROOT,'src/figures',lang);fs.mkdirSync(directory,{recursive:true});
 const write=(n,title,description,body,height=350)=>fs.writeFileSync(path.join(directory,`fig-22-${n}.svg`),svg(title,description,body,height));
 let body=text(380,30,zh?'随机变量合并原像':'A random variable combines preimages',24,'middle');
 ['TT','HT','TH','HH'].forEach((label,i)=>{body+=box(55,60+49*i,145,39)+text(125,87+49*i,label+' : 1/4',20,'middle');});
 [[0,'1/4',80],[1,'1/2',175],[2,'1/4',270]].forEach(([x,p,y])=>{body+=box(475,y-25,215,48)+text(582,y+6,'X='+x+'; p='+p,22,'middle');});
 body+=arrow(210,80,465,80)+arrow(210,129,465,173)+arrow(210,178,465,173)+arrow(210,227,465,269)+text(380,329,zh?'计数1收HT与TH；F(1)=3/4，F(1−)=1/4。':'Count1 collects HT and TH; F(1)=3/4, F(1−)=1/4.',20,'middle');
 write(1,zh?'两硬币结果到正面计数':'Two-coin outcomes to head count',zh?'四个等可能结果映到零一二，两个原像合成计数一的质量二分之一。':'Four equally likely outcomes map to zero, one, two; two preimages combine into the half-probability count one.',body);
 body=text(380,30,zh?'CDF可保留原子与连续部分':'A CDF retains atoms and continuous parts',23,'middle');
 const px=x=>145+450*x,py=y=>275-175*y;
 body+='<path d="M110,275H650M145,60V285" stroke="#94a3b8"/>';
 body+=`<path d="M${px(-.05)},${py(0)}H${px(0)}V${py(.3)}L${px(1)},${py(1)}H${px(1.1)}" stroke="#2563eb" stroke-width="4" fill="none"/><circle cx="${px(0)}" cy="${py(0)}" r="5" fill="white" stroke="#2563eb"/><circle cx="${px(0)}" cy="${py(.3)}" r="5" fill="#2563eb"/>`;
 body+=text(105,py(.3)+6,'.3',18,'end')+text(105,py(1)+6,'1',18,'end')+text(px(0),305,'0',19,'middle')+text(px(1),305,'1',19,'middle')+text(400,175,'F(t)=.3+.7t',22,'middle')+text(380,335,zh?'零原子.3；(0,1)密度.7；连续部分只积分.7。':'Atom at0: .3; density on(0,1): .7; continuous mass only .7.',18,'middle');
 write(2,zh?'混合分布CDF':'Mixed-distribution CDF',zh?'零处CDF跳到零点三，零到一线性增长至一；普通密度零点七只代表连续部分。':'The CDF jumps to0.3 at zero and rises linearly to one; density0.7 represents only the continuous component.',body,360);
 body=text(380,30,zh?'坐标伸缩与多个逆分支':'Coordinate stretch and multiple inverse branches',24,'middle')+box(35,65,330,220)+box(395,65,330,220);
 body+=text(200,106,'X∼Uniform(0,1)',21,'middle')+text(200,155,'Y=2X',24,'middle')+text(200,203,'fY=1/2 on(0,2)',22,'middle')+text(200,248,zh?'宽度×2，高度÷2':'Width×2, height÷2',20,'middle')+text(560,106,'X∼Uniform(−1,1)',20,'middle')+text(560,155,'Y=X²',24,'middle')+text(560,203,'x=+√y and −√y',22,'middle')+text(560,248,'fY=1/(2√y), 0<y<1',20,'middle')+text(380,329,zh?'两逆支各1/(4√y)；总质量1，零无原子。':'Each inverse branch contributes1/(4√y); total mass1, no atom at0.',18,'middle');
 write(3,zh?'密度变换需因子及两分支':'Density transforms need factors and both branches',zh?'均匀零一倍增后宽二密度二分之一；均匀负一一平方需正负平方根两个逆支，总密度一除二平方根。':'Stretching a unit uniform doubles width and halves density; squaring a symmetric uniform requires both square-root branches.',body);
 body=text(380,30,zh?'从机制与支持选择分布':'Choose a distribution from mechanism and support',24,'middle');
 const rows=zh?[['二项','固定n、独立同p','0,…,n'],['几何试验','稳定尝试首次成功','1,2,…'],['Poisson','固定区间率机制','0,1,…'],['指数（AI）','连续恒率等待','[0,∞)'],['Gaussian（AI）','位置与正尺度误差','R']]:[['Binomial','Fixed n, independent common p','0,…,n'],['Geometric trials','First success, stable attempts','1,2,…'],['Poisson','Rate model in fixed interval','0,1,…'],['Exponential (AI)','Continuous constant-rate wait','[0,∞)'],['Gaussian (AI)','Location and positive error scale','R']];
 rows.forEach((r,i)=>{body+=box(25,60+47*i,710,42)+text(42,88+47*i,r[0],18)+text(245,88+47*i,r[1],16)+text(670,88+47*i,r[2],18,'middle');});
 body+=text(380,333,zh?'几何失败数从0；率≠尺度，方差≠标准差。':'Geometric failures start at0; rate≠scale, variance≠standard deviation.',18,'middle');
 write(4,zh?'分布机制与支持表':'Distribution mechanisms and supports',zh?'表区分二项固定尝试，几何首次成功，Poisson率计数，指数连续等待及Gaussian全实支持，提醒参数约定。':'A table distinguishes fixed-trial binomial, geometric waiting, rate-count Poisson, continuous exponential and real-supported Gaussian, with explicit parameter conventions.',body,360);
}
