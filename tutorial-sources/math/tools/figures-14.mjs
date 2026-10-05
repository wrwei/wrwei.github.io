import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {text,box,arrow,svg} from './svg.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
for(const lang of ['en','zh']){
 const zh=lang==='zh',directory=path.join(ROOT,'src/figures',lang);fs.mkdirSync(directory,{recursive:true});
 const write=(n,title,description,body,height)=>fs.writeFileSync(path.join(directory,`fig-14-${n}.svg`),svg(title,description,body,height));
 let body=text(380,30,zh?'矩形映射：输入基 → 缩放与丢方向 → 输出基':'Rectangular map: input basis → scaling and lost directions → output basis',19,'middle');
 [[20,190,'Vᵀ','n × n'],[280,200,'Σ','m × n'],[550,190,'U','m × m']].forEach(([x,w,label,shape])=>{body+=box(x,95,w,130)+text(x+w/2,145,label,30,'middle')+text(x+w/2,197,shape,23,'middle');});
 body+=arrow(220,158,270,158)+arrow(490,158,540,158)+text(380,281,'Avᵢ=σᵢuᵢ;     Aᵀuᵢ=σᵢvᵢ',27,'middle')+text(380,329,zh?'正方向：行 ↔ 列；未使用方向：零与左零。':'Positive directions: row ↔ column; unused directions: null and left null.',18,'middle');
 write(1,zh?'奇异分解的三个阶段':'Three stages of an SVD',zh?'完整V转置输入基、m乘n中因子非负缩放、U输出基，正奇异方向对应行列空间，未用方向对应核。':'Full V transpose changes input basis, rectangular Sigma scales nonnegative strengths, and U changes output basis. Positive directions span row/column spaces; unused directions give kernels.',body,360);
 body=text(380,30,zh?'强度六、三、一：舍弃平方能量精确可算':'Strengths six, three, one: discarded squared energy is exact',21,'middle');
 [[110,36,'σ₁²=36'],[320,9,'σ₂²=9'],[530,1,'σ₃²=1']].forEach(([x,value,label])=>{const h=value*4;body+='<rect x="'+x+'" y="'+(235-h)+'" width="110" height="'+h+'" fill="#2563eb"/>'+text(x+55,265,label,23,'middle');});
 body+=text(380,305,zh?'k=0,1,2,3 → 误差平方 46,10,1,0':'k=0,1,2,3 → squared errors 46,10,1,0',24,'middle')+text(380,348,zh?'算子误差为最大舍弃强度，不是平方和。':'Operator error is the largest discarded strength, not the square sum.',19,'middle');
 write(2,zh?'截断误差的预算':'Truncation error budget',zh?'奇异值六、三、一，平方三十六、九、一，保留零、一、二、三项的误差平方四十六、十、一、零。':'Singular values six, three, one have squares 36,9,1. Retaining zero, one, two, three terms leaves squared errors 46,10,1,0.',body,380);
 body=text(380,30,zh?'先分数据，再拟合；保存同一个变换':'Split first, then fit; save and reuse one transform',22,'middle');
 body+=box(25,75,270,90)+text(160,113,zh?'训练记录 X':'Training records X',25,'middle')+text(160,147,zh?'拟合 μ 与 V_k':'Fit μ and V_k',20,'middle')+arrow(305,120,440,120)+box(450,75,285,90,'#f0fdf4','#15803d')+text(592,115,zh?'保存中心、尺度、方向':'Save centre, scales, directions',20,'middle');
 body+=box(25,220,270,90)+text(160,260,zh?'留出记录 X_new':'Held-out records X_new',24,'middle')+arrow(305,265,440,265)+box(450,220,285,90)+text(592,260,'(X_new − μ)V_k',25,'middle')+'<path d="M592,165V210" stroke="#2563eb" stroke-width="2.5" marker-end="url(#arrow)"/>'+text(380,354,zh?'留出得分均值不必零；不重新拟合。':'Held-out score means need not be zero; do not refit.',21,'middle');
 write(3,zh?'训练拟合的PCA流程':'Training-fitted PCA pipeline',zh?'训练拟合并保存中心尺度方向，留出记录应用同一参数，不将测试信息用于重拟合。':'Training fits and saves centre, scales and directions. Held-out records use the saved parameters without test information refitting them.',body,390);
 body=text(380,30,zh?'高能量保留不保证保留标签信息':'High energy retention need not retain label information',22,'middle');
 body+='<path d="M40,170H380M210,80V265" stroke="#94a3b8"/>';
 [[95,125,'+'],[95,215,'−'],[325,125,'+'],[325,215,'−']].forEach(([x,y,label])=>{body+='<circle cx="'+x+'" cy="'+y+'" r="10" fill="'+(label==='+'?'#c2410c':'#2563eb')+'"/>'+text(x+17,y+6,label,23);});
 body+=text(95,289,'x₁=−100',19,'middle')+text(325,289,'x₁=100',19,'middle')+text(210,329,zh?'竖向坐标 ±1（为可见性放大）':'Vertical ±1 (magnified for visibility)',16,'middle');
 body+=box(435,80,290,230)+text(580,123,'Scatter=diag(40000,4)',20,'middle')+text(580,170,zh?'第一方向：99.99%':'First direction: 99.99%',24,'middle')+text(580,215,zh?'同分数，两个标签':'Same score, both labels',21,'middle')+text(580,262,zh?'第二方向才能区分':'Second direction distinguishes',21,'middle');
 write(4,zh?'方差与标签区别':'Variance and label distinctions',zh?'四记录正负一百和正负一组合，标签依第二符号，第一方向解释百分之九十九点九九却将异标签映同分，竖方向为可见性放大。':'Four combinations of first feature ±100 and second ±1 have labels from the second sign. The first direction explains 99.99% but gives opposite labels identical scores. Vertical scale is magnified for visibility.',body,365);
}
