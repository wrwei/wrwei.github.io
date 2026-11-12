import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {text,box,arrow,svg} from './svg.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
for(const lang of ['en','zh']){
 const zh=lang==='zh',directory=path.join(ROOT,'src/figures',lang);fs.mkdirSync(directory,{recursive:true});
 const write=(n,title,description,body,height=350)=>fs.writeFileSync(path.join(directory,`fig-24-${n}.svg`),svg(title,description,body,height));
 let body=text(380,30,zh?'行数与独立抽样数不同':'Rows and independent draws can differ',23,'middle');
 [[zh?'N 个 IID 抽样':'N IID draws','σ²/N'],[zh?'m 个独立簇，各复制 b 次':'m independent draws, b copies each','σ²/m = bσ²/N'],[zh?'一个抽样复制 N 次':'One draw copied N times','σ²']].forEach(([label,v],i)=>{body+=box(30,62+i*82,700,65,i===0?'#f0fdf4':'#fff7ed')+text(55,89+i*82,label,21)+text(700,113+i*82,'Var(M) = '+v,21,'end');});
 body+=text(380,334,zh?'协方差不能因增加副本而忽略。':'Adding copies does not remove covariance.',19,'middle');
 write(1,zh?'独立与复制均值方差':'Mean variance under independence and copying',zh?'三个模型的均值方差分别为 sigma 平方除 N、除独立簇数 m、以及 sigma 平方；复制行不会增加独立信息。':'Three model mean variances are sigma squared over N, over independent cluster count m, and sigma squared; copied rows do not add independent information.',body,360);
 body=text(380,30,zh?'弱法则与 CLT 使用不同尺度':'Weak law and CLT use different scales',23,'middle');
 body+=box(30,60,700,107)+text(55,91,zh?'固定 ε > 0，N 增长':'Fix ε > 0, increase N',22)+text(380,130,'P(|M_N − μ| ≥ ε) ≤ σ²/(Nε²) → 0',22,'middle');
 body+=arrow(380,174,380,199)+box(30,213,700,98,'#faf5ff','#7e22ce')+text(55,246,zh?'重新缩放波动，而非原观测':'Rescale fluctuations, not raw observations',22)+text(380,282,'Z_N = √N(M_N − μ)/σ   ⇒   N(0,1)',22,'middle');
 body+=text(380,339,zh?'CLT 假设 IID，0 < σ² < ∞；这里不给有限误差率。':'CLT: IID, 0 < σ² < ∞; no finite error rate stated here.',18,'middle');
 write(2,zh?'固定容差与标准化极限':'Fixed tolerance and standardised limits',zh?'弱法则固定容差使尾概率趋零，中心极限定理除以标准误使均值波动的分布趋标准高斯。':'The weak law fixes tolerance and sends the tail probability to zero; the CLT divides mean fluctuations by standard error for a standard Gaussian limit.',body,360);
 body=text(380,30,zh?'同一 IID Bernoulli(.5) 事件':'The same IID Bernoulli(.5) event',23,'middle')+text(380,66,'N=20; ε=.20; |M−.5| ≥ .20',22,'middle');
 [[zh?'有限模型尾概率':'Finite-model tail',.11531829833984375,'#0ea5e9'],['Chebyshev',.3125,'#c2410c'],['Hoeffding',2*Math.exp(-1.6),'#7e22ce']].forEach(([label,v,col],i)=>{body+=text(32,113+i*68,label,19)+box(245,85+i*68,Math.max(1,v*970),38,col,col)+text(700,113+i*68,v.toFixed(6),21,'end');});
 body+=text(380,321,zh?'上界并非实际概率；不同界的条件必须有效。':'An upper bound is not the actual probability; check its conditions.',18,'middle');
 write(3,zh?'尾概率与有效上界':'Tail probability and valid upper bounds',zh?'二十项公平 Bernoulli 均值偏差至少点二的尾概率约点一一五三，切比雪夫界点三一二五，Hoeffding 界约点四零三八。':'For twenty fair Bernoulli draws the mean deviation tail at least point two is approximately point1153, below Chebyshev point3125 and Hoeffding approximately point4038.',body);
 body=text(380,30,zh?'保持边缘，再比较差值方差':'Preserve marginals, then compare difference variance',23,'middle')+text(380,71,'Var(A−B) = Var(A)+Var(B)−2Cov(A,B)',22,'middle');
 body+=box(30,104,700,78)+text(55,135,zh?'独立阈值 .60 与 .55':'Independent thresholds .60 and .55',21)+text(700,166,'.24 + .2475 = .4875',21,'end');
 body+=box(30,202,700,87,'#f0fdf4','#15803d')+text(55,235,zh?'共同 U，对内 Cov=.22':'Shared U, within-pair Cov=.22',21)+text(700,272,'.4875 − .44 = .0475',21,'end');
 body+=text(380,332,zh?'不同对仍需独立；负 Cov 会增大差值方差。':'Pairs still need independence; negative Cov increases difference variance.',18,'middle');
 write(4,zh?'共同随机数的带条件收益':'Qualified common-random-number benefit',zh?'相同边缘的独立差值方差点四八七五，共同均匀数产生正协方差点二二后，差值方差降至点零四七五；该收益不是普遍结论。':'With preserved marginals, independent difference variance point4875 falls to point0475 with shared uniforms and positive covariance point22; this benefit is not universal.',body);
}
