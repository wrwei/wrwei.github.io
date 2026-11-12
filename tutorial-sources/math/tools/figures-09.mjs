import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {text,box,arrow,svg} from './svg.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
for(const lang of ['en','zh']){
  const zh=lang==='zh',directory=path.join(ROOT,'src/figures',lang);fs.mkdirSync(directory,{recursive:true});
  const write=(n,title,description,body,height)=>fs.writeFileSync(path.join(directory,`fig-09-${n}.svg`),svg(title,description,body,height));
  let body=text(380,32,zh?'同加偏移后，点坐标变而位移不变':'A common offset changes point coordinates, not displacement',19,'middle');
  [[110,250,230,90,'p = (1,2)','q = (4,6)'],[470,250,590,90,'p′ = (11,−3)','q′ = (14,1)']].forEach(([x,y,ex,ey,start,end])=>{body+=arrow(x,y,ex,ey)+'<circle cx="'+x+'" cy="'+y+'" r="6" fill="#1a2e4a"/>'+text(x,y+34,start,19,'middle')+text(ex,ey-18,end,19,'middle')+text((x+ex)/2-24,(y+ey)/2,'(3,4)',22,'middle');});
  body+=text(380,333,zh?'新坐标同加 (10,−5)；差仍 (3,4)。':'Both new tuples add (10,−5); the difference stays (3,4).',18,'middle');
  write(1,zh?'点与位移的平移':'Translation of points and displacements',zh?'原点 p 一二、q 四六，差三四；新 p 十一负三、q 十四一，差仍三四。':'Points p=(1,2), q=(4,6) have difference (3,4). New points (11,−3), (14,1) have the same difference.',body,360);
  body=text(380,30,zh?'沿第一单位轴分量为二':'The component along the first unit axis is two',21,'middle')+arrow(180,260,300,80)+text(310,75,'w = (2,3)',21)+arrow(180,260,300,260)+'<path d="M300,80V260" stroke="#15803d" stroke-width="3" stroke-dasharray="7 5"/>'+text(240,298,'2e₁ = (2,0)',21,'middle')+text(320,178,'(0,3)',21)+text(160,275,'0',20)+'<path d="M284,260V244H300" fill="none" stroke="#475569" stroke-width="2"/>';
  body+=box(460,100,250,150)+text(585,147,'w·e₁ = 2',25,'middle')+text(585,202,'(0,3)·e₁ = 0',23,'middle');
  write(2,zh?'分量与正交余量':'A component and orthogonal remainder',zh?'二三向量沿第一轴投影二零，余量零三垂直，点积选择分量二。':'Vector (2,3) has first-axis component (2,0) and perpendicular remainder (0,3). The dot product with the first unit axis is two.',body);
  body=text(380,28,zh?'二维单位球：每个边界都表示相应长度一':'Two-dimensional unit balls: each boundary has its norm one',19,'middle');
  body+='<path d="M220,180H540M380,45V335" stroke="#94a3b8"/><rect x="265" y="65" width="230" height="230" fill="none" stroke="#15803d" stroke-width="3"/><circle cx="380" cy="180" r="115" fill="none" stroke="#2563eb" stroke-width="3"/><path d="M380,65L495,180L380,295L265,180z" fill="none" stroke="#c2410c" stroke-width="3"/>'+text(380,185,'0',16)+text(501,174,'1',16)+text(255,174,'−1',16,'end');
  body+=text(100,358,zh?'曼哈顿：菱形':'Manhattan: diamond',18,'start','#c2410c')+text(380,358,zh?'欧几里得：圆':'Euclidean: circle',18,'middle','#2563eb')+text(670,358,zh?'最大：方形':'Maximum: square',18,'end','#15803d');
  write(3,zh?'三种范数的单位球':'Unit balls for three norms',zh?'最大范数单位边界是正方形，欧几里得圆，曼哈顿菱形，均过坐标单位轴端点。':'The maximum-norm boundary is a square, Euclidean a circle, Manhattan a diamond. All meet the coordinate unit-axis endpoints.',body,385);
  body=text(380,30,zh?'预测 (3,) − 观测 (3,1)：全部两两差':'Predictions (3,) − observations (3,1): all pairwise differences',18,'middle')+text(225,70,zh?'错误广播 (3,3)':'Wrong broadcast (3,3)',22,'middle')+text(605,70,zh?'修复配对 (3,1)':'Repaired pairs (3,1)',22,'middle');
  [[0,1,2],[-1,0,1],[-3,-2,-1]].forEach((row,i)=>{row.forEach((value,j)=>{const x=110+j*80,y=100+i*65;body+=box(x,y,65,48)+text(x+32,y+32,value,24,'middle');});const x=573,y=100+i*65;body+=box(x,y,65,48,'#f0fdf4','#15803d')+text(x+32,y+32,i===2?-1:0,24,'middle');});
  body+=text(225,325,zh?'九平方均值 7/3':'Nine squared entries: mean 7/3',18,'middle')+text(605,325,zh?'三平方均值 1/3':'Three squared entries: mean 1/3',17,'middle');
  write(4,zh?'广播改变配对问题':'Broadcasting changes the pairing problem',zh?'平坦一二三与列一二四相减生成九差，列配对只有零零负一，均方分别为三分之七与三分之一。':'Subtracting flat [1,2,3] and column [1,2,4] generates nine differences; paired columns yield only [0,0,−1]. Mean squares are 7/3 and 1/3 respectively.',body,355);
}
