import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {text,box,arrow,svg} from './svg.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
for(const lang of ['en','zh']){
  const zh=lang==='zh',directory=path.join(ROOT,'src/figures',lang);fs.mkdirSync(directory,{recursive:true});
  const write=(n,title,description,body,height)=>fs.writeFileSync(path.join(directory,`fig-10-${n}.svg`),svg(title,description,body,height));
  let body=text(380,30,zh?'列是坐标单位向量的像':'Columns are images of coordinate unit vectors',21,'middle');
  body+=box(30,70,310,230)+text(185,108,'A = [[2,1],[0,1]]',23,'middle')+text(185,157,'Ae₁ = (2,0)',23,'middle','#15803d')+text(185,207,'Ae₂ = (1,1)',23,'middle','#c2410c')+text(185,263,'Ax = x₁Ae₁ + x₂Ae₂',20,'middle');
  body+='<path d="M425,255H700M455,280V65" stroke="#94a3b8"/>'+arrow(455,255,625,255)+arrow(455,255,540,170)+text(625,286,'Ae₁',21,'middle','#15803d')+text(545,148,'Ae₂',21,'middle','#c2410c')+text(440,276,'0',18);
  write(1,zh?'矩阵的列像':'Column images of a matrix',zh?'矩阵二一零一把第一单位向量映到二零，第二映到一一，任意输入以坐标加权两列。':'Matrix [[2,1],[0,1]] sends e₁ to (2,0), e₂ to (1,1); input coordinates weight these column images.',body);
  body=text(380,30,zh?'右侧先作用：两个次序给出不同结果':'The right factor acts first: two orders give different results',20,'middle');
  [['(1,1)','H → (2,1)','S → (4,1)',110],['(1,1)','S → (2,1)','H → (3,1)',240]].forEach(([first,second,last,y])=>{body+=box(25,y-35,180,70)+text(115,y+7,first,25,'middle')+arrow(215,y,270,y)+box(280,y-35,210,70)+text(385,y+7,second,23,'middle')+arrow(500,y,545,y)+box(555,y-35,180,70)+text(645,y+7,last,23,'middle');});
  body+=text(380,328,'S = [[2,0],[0,1]]     H = [[1,1],[0,1]]',22,'middle');
  write(2,zh?'剪切与伸缩复合次序':'Shear and scaling composition order',zh?'输入一一，先剪切到二一再伸缩到四一；先伸缩到二一再剪切到三一，SH不等于HS。':'At (1,1), shear then scaling gives (4,1), scaling then shear gives (3,1). SH and HS differ.',body,360);
  body=text(380,30,zh?'两个未知量：约束的三种几何关系':'Two unknowns: three geometric relationships of constraints',20,'middle');
  [0,1,2].forEach(i=>{const x=20+250*i;body+=box(x,65,220,215,'#fff','#94a3b8')+'<path d="M'+(x+20)+',260L'+(x+200)+',95" stroke="#2563eb" stroke-width="4"/>';if(i===0)body+='<path d="M'+(x+20)+',95L'+(x+200)+',260" stroke="#c2410c" stroke-width="4"/><circle cx="'+(x+110)+'" cy="177.5" r="6" fill="#1a2e4a"/>';if(i===1)body+='<path d="M'+(x+20)+',260L'+(x+200)+',95" stroke="#c2410c" stroke-width="2" stroke-dasharray="8 5"/>';if(i===2)body+='<path d="M'+(x+20)+',210L'+(x+175)+',68" stroke="#c2410c" stroke-width="4"/>';body+=text(x+110,315,(zh?['唯一解','无穷多解','无解']:['Unique solution','Infinitely many','No solution'])[i],21,'middle');});
  write(3,zh?'方程组的三个解集类别':'Three classes of solution sets',zh?'交叉两直线一个解，重合两直线无穷解，平行不同两直线无解；这是两未知量的几何示例。':'Intersecting lines have one solution, coincident lines infinitely many, distinct parallel lines none; a two-variable geometric example.',body,345);
  body=text(380,30,zh?'行批次约定：每一行独立通过同一个仿射映射':'Row-batch convention: each row uses the same affine map',20,'middle');
  [[25,170,'X','B × d'],[285,150,'W = Mᵀ','d × o'],[555,180,'Y','B × o']].forEach(([x,w,name,shape])=>{body+=box(x,105,w,135)+text(x+w/2,148,name,26,'middle')+text(x+w/2,205,shape,24,'middle');});
  body+=text(225,177,'@',35,'middle')+arrow(445,175,540,175)+text(380,285,zh?'内维 d 收缩；偏置形状 (o,) 沿批次 B 广播。':'Inner dimension d contracts; bias (o,) broadcasts over batch B.',20,'middle')+text(380,330,'Y = XW + b',28,'middle')+text(380,369,zh?'偏置 (o,1) 在 B=o 时仍可能成功，却加错方向。':'Bias (o,1) can succeed when B=o while adding along the wrong axis.',17,'middle','#c2410c');
  write(4,zh?'批矩阵乘法的维度':'Dimensions in a batched matrix product',zh?'B乘d的输入乘d乘o的权重得到B乘o输出，形状o的偏置逐行广播，形状o一可能把偏置加到行。':'B-by-d input times d-by-o weights gives B-by-o output. Flat o bias broadcasts across rows; a column bias can add to rows incorrectly.',body,395);
}
