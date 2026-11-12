import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {text,box,arrow,svg} from './svg.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
for(const lang of ['en','zh']){
  const zh=lang==='zh',directory=path.join(ROOT,'src/figures',lang);fs.mkdirSync(directory,{recursive:true});
  const write=(n,title,description,body,height)=>fs.writeFileSync(path.join(directory,`fig-11-${n}.svg`),svg(title,description,body,height));
  let body=text(380,30,zh?'三条生成向量，两个独立方向':'Three generators, two independent directions',22,'middle');
  body+='<path d="M80,255H380M110,285V70" stroke="#94a3b8"/>'+arrow(110,255,260,255)+arrow(110,255,110,105)+arrow(110,255,260,105)+'<path d="M260,255V105H110" stroke="#94a3b8" stroke-dasharray="6 5" fill="none"/>'+text(275,276,'u=(1,0)',20)+text(120,88,'v=(0,1)',20)+text(280,106,'w=(1,1)',20);
  body+=box(450,100,270,170)+text(585,151,'w = u + v',28,'middle')+text(585,201,'u + v − w = 0',25,'middle')+text(585,244,zh?'张成 R²；维数二':'Span R²; dimension two',20,'middle');
  write(1,zh?'生成列表与独立方向':'Generating list and independent directions',zh?'u一零、v零一、w一一三条向量张成二维平面，w是u加v，故列表相关。':'u=(1,0), v=(0,1), w=(1,1) span a plane; w=u+v makes the three-vector list dependent.',body);
  body=text(380,30,zh?'矩形映射的四个基本空间：例 m=4、n=3、r=2':'Four spaces of a rectangular map: m=4, n=3, r=2',21,'middle');
  body+=box(25,65,290,245)+box(445,65,290,245)+arrow(325,155,435,155)+text(380,138,'A',24,'middle');
  [[170,105,zh?'输入 R³':'Input R³'],[590,105,zh?'输出 R⁴':'Output R⁴'],[170,161,'R(A): dim 2'],[170,209,'N(A): dim 1'],[590,161,'C(A): dim 2'],[590,209,'N(Aᵀ): dim 2']].forEach(([x,y,label])=>{body+=text(x,y,label,22,'middle');});
  body+=text(170,266,'2 + 1 = 3',25,'middle')+text(590,266,'2 + 2 = 4',25,'middle')+text(380,342,zh?'行 ⟂ 零；列 ⟂ 左零。所在空间不能互换。':'Row ⟂ null; column ⟂ left null. Ambient spaces differ.',20,'middle');
  write(2,zh?'输入与输出侧的空间':'Input-side and output-side spaces',zh?'四乘三秩二映射，输入侧行空间二维零空间一维，输出侧列空间二维左零空间二维。':'For a rank-two 4-by-3 map, input row and null spaces have dimensions two and one; output column and left-null spaces each have dimension two.',body,370);
  body=text(380,30,zh?'不同权重，相同有效温度预测':'Different weights, identical valid temperature predictions',21,'middle');
  [[35,90,'w = (5,2,−1)'],[35,225,'w′ = (−11,1.1,−0.5)']].forEach(([x,y,label])=>{body+=box(x,y,330,75)+text(x+165,y+45,label,22,'middle')+arrow(x+340,y+38,470,194);});
  body+=box(480,133,250,120,'#f0fdf4','#15803d')+text(605,178,zh?'共同预测函数':'Shared prediction function',20,'middle')+text(605,220,'−27 + 0.2C',25,'middle')+text(380,345,'w′ − w = 0.5(−32,−1.8,1);   F = 1.8C + 32',20,'middle');
  write(3,zh?'零方向的参数等价':'Parameter equivalence along a null direction',zh?'权重五二负一与负十一一点一负零点五在合法华氏摄氏换算下预测都是负二十七加零点二C。':'Weights (5,2,−1) and (−11,1.1,−0.5) predict −27+0.2C for all records satisfying F=1.8C+32.',body,370);
  body=text(380,30,zh?'非零差异与解析阈值是两种主张':'A nonzero difference and a resolution cutoff are two claims',21,'middle')+box(35,75,330,225)+box(395,75,330,225,'#fff7ed','#c2410c');
  body+=text(200,115,zh?'精确有理模型':'Exact rational model',22,'middle')+text(200,167,'A = [[1,1],[1,1+δ]]',21,'middle')+text(200,216,'δ = 10⁻¹² ≠ 0',25,'middle')+text(200,268,zh?'detA = δ；秩二':'detA = δ; rank two',23,'middle');
  body+=text(560,115,zh?'浮点分辨率策略':'Floating-point resolution policy',21,'middle')+text(560,167,zh?'容差 10⁻¹⁴ → 数值秩二':'tol 10⁻¹⁴ → numerical rank two',18,'middle')+text(560,218,zh?'容差 10⁻¹⁰ → 数值秩一':'tol 10⁻¹⁰ → numerical rank one',18,'middle')+text(560,268,zh?'记录尺度与 dtype':'Record scale and dtype',21,'middle')+text(380,342,zh?'阈值判定不会把精确非零量改成零。':'Threshold decisions do not turn exact nonzero quantities into zero.',20,'middle');
  write(4,zh?'精确秩与数值分辨率':'Exact rank and numerical resolution',zh?'精确δ为十的负十二次非零，秩二；实验浮点阈值十负十四与十负十分别给数值秩二与一。':'Exact delta 10⁻¹² is nonzero and rank is two; the lab numerical cutoffs 10⁻¹⁴ and 10⁻¹⁰ give effective ranks two and one.',body,370);
}
