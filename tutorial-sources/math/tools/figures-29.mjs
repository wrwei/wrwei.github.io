import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {text,box,arrow,svg} from './svg.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
for(const lang of ['en','zh']){
 const zh=lang==='zh',dir=path.join(ROOT,'src/figures',lang);fs.mkdirSync(dir,{recursive:true});
 const write=(n,title,desc,body)=>fs.writeFileSync(path.join(dir,`fig-29-${n}.svg`),svg(title,desc,body,350));
 let body=text(380,30,zh?'示意 p=4：二进制量级越大，间距越大':'Illustrative p=4: spacing grows with the binade',22,'middle');
 [[110,1,.125],[240,2,.25]].forEach(([y,start,step])=>{body+='<path d="M65,'+y+'H700" stroke="#64748b"/>';for(let i=0;i<=8;i++){let x=65+78*i;body+='<path d="M'+x+','+(y-12)+'V'+(y+12)+'" stroke="#0284c7" stroke-width="2"/>';if(i%2===0)body+=text(x,y+40,(start+i*step).toFixed(2),18,'middle');}body+=text(380,y-35,zh?'此段间距 '+step:'Spacing on this binade: '+step,21,'middle');});
 body+=text(380,327,zh?'图为简化格式，不是 binary16。':'This simplified format is not binary16.',19,'middle');
 write(1,zh?'跨量级的浮点间距':'Floating-point spacing across binades',zh?'四位有效数字示意，一到二间距八分之一，二到四间距四分之一，局部间距随量级增长。':'Illustrative four-bit precision: spacing from one to two is one-eighth, and from two to four is one-quarter; local spacing grows with scale.',body);
 body=text(380,30,zh?'一个小残差不等于小前向误差':'A small residual need not mean small forward error',22,'middle')+text(380,83,'A = ((1,1),(1,1+ε)); ε=10⁻⁸',22,'middle');
 body+=box(35,115,690,67)+text(55,145,zh?'真解 (1,1)，候选 (0,2)':'True (1,1), candidate (0,2)',22)+text(55,171,zh?'相对解误差 = 1':'Relative solution error = 1',20);
 body+=box(35,200,690,67,'#faf5ff','#7e22ce')+text(55,231,'relative residual ≈ 3.54×10⁻⁹',22)+text(55,257,'κ₂(A) ≈ 4×10⁸',20)+text(380,327,zh?'残差度量邻近输入，条件数控制解敏感性。':'Residual measures a nearby input; conditioning controls sensitivity.',19,'middle');
 write(2,zh?'残差与敏感性反例':'Residual and sensitivity counterexample',zh?'近相关二维矩阵的候选相对误差一，残差仅约三点五四乘十的负九次；大条件数解释放大。':'The nearly dependent two-dimensional matrix has candidate relative error one but relative residual about three point five four times ten to minus nine; its large condition number explains amplification.',body);
 body=text(380,30,zh?'先稳定求值，再检查同一导数':'Stabilise evaluation, then check the same derivative',22,'middle');
 [[65,zh?'原始 logits':'Raw logits','(1000,1001,1002)'],[145,zh?'减公共最大值':'Subtract common maximum','(−2,−1,0)'],[225,zh?'概率与零类 NLL':'Probabilities and class-0 NLL','(.09003,.24473,.66524); 2.407606']].forEach(([y,label,eq])=>{body+=box(35,y,690,65)+text(55,y+27,label,20)+text(55,y+53,eq,22);});
 body+=text(380,330,zh?'差分 h 太大：截断；太小：舍入。':'Difference h too large: truncation; too small: rounding.',19,'middle');
 write(3,zh?'稳定 logits 与差分权衡':'Stable logits and finite-difference balance',zh?'大 logits 减最大值后得到有限概率和原模型损失；导数差分需要平衡截断与舍入。':'Large logits shifted by their maximum give finite probabilities and the original model loss; derivative differences balance truncation and rounding.',body);
 body=text(380,30,zh?'数值报告的五个联系':'Five links in a numerical report',22,'middle');
 const labels=zh?['方程、输入约定与目标尺度','输入 / 累加 / 输出精度','奇异值、条件数及秩阈值','算法、预算与停止准则','残差、参考、容差与版本']:['Equation, input contract and target scale','Input / accumulation / output precision','Singular values, condition and rank cutoff','Algorithm, budget and stopping rule','Residual, reference, tolerance and versions'];
 labels.forEach((label,i)=>{body+=box(45,48+i*56,670,42)+text(380,76+i*56,label,20,'middle');if(i<4)body+=arrow(380,91+i*56,380,102+i*56);});
 write(4,zh?'可审计数值实验':'Auditable numerical experiment',zh?'从方程和尺度到精度、条件性、算法，最后声明误差证据容差及版本。':'Connect equation and scale to precision, conditioning and algorithm, then declare error evidence, tolerances and versions.',body);
}
