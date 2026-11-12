import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {text,box,arrow,svg} from './svg.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
for(const lang of ['en','zh']){
 const zh=lang==='zh',directory=path.join(ROOT,'src/figures',lang);fs.mkdirSync(directory,{recursive:true});
 const write=(n,title,description,body,height=350)=>fs.writeFileSync(path.join(directory,`fig-25-${n}.svg`),svg(title,description,body,height));
 let body=text(380,30,zh?'固定什么，重复什么？':'What is fixed, and what is repeated?',23,'middle');
 body+=box(30,67,190,73)+text(125,100,zh?'固定参数 θ':'Fixed parameter θ',21,'middle')+text(125,126,'P_θ',20,'middle')+arrow(225,103,283,103)+box(290,67,180,73)+text(380,111,zh?'随机数据 X':'Random data X',22,'middle')+arrow(475,103,533,103)+box(540,67,190,73)+text(635,111,'T(X) → t',22,'middle');
 body+=text(380,182,zh?'抽样分布：固定 θ，重新生成 X。':'Sampling law: fix θ, generate new X.',22,'middle')+box(30,221,700,74,'#faf5ff','#7e22ce')+text(380,253,zh?'后验：固定观察 x，条件化参数分布。':'Posterior: fix observed x, condition the parameter law.',20,'middle')+text(380,282,'π(θ|x) ∝ L(θ;x)π(θ)',21,'middle');
 write(1,zh?'参数估计与两种分布':'Estimation and two distributions',zh?'固定参数生成随机数据再应用规则得到估计值；抽样律重复数据，后验在先验模型下固定数据而条件化参数。':'A fixed parameter generates random data, then a rule produces an estimate; sampling laws repeat data, while the posterior fixes data and conditions a prior parameter law.',body);
 body=text(380,30,zh?'Bernoulli 的内部与端点最大值':'Bernoulli interior and endpoint maxima',23,'middle');
 [[10,8,60],[10,0,425]].forEach(([n,k,start])=>{let points=[];for(let j=0;j<=100;j++){let p=j/100,v=Math.pow(p,k)*Math.pow(1-p,n-k),maximum=k===0?1:Math.pow(k/n,k)*Math.pow(1-k/n,n-k);points.push(`${start+270*p},${268-170*v/maximum}`);}body+=text(start+135,70,`n=${n}, k=${k}`,21,'middle')+`<path d="M${start},85V268H${start+275}" fill="none" stroke="#64748b"/><polyline points="${points.join(' ')}" fill="none" stroke="#0284c7" stroke-width="3"/>`+text(start,293,'0',18,'middle')+text(start+270,293,'1',18,'middle')+text(start+135,324,'MLE = '+k/n,21,'middle');});
 write(2,zh?'Bernoulli 相对似然曲线':'Bernoulli relative likelihood curves',zh?'各图独立归一化至最大高度一：十次八成功曲线在点八最大，全失败曲线在允许端点零最大。':'Each curve is independently scaled to maximum height one; eight successes in ten peaks at point eight, while all failures peak at the permitted endpoint zero.',body);
 body=text(380,30,zh?'风险 = 方差 + 偏差平方':'Risk = variance + squared bias',23,'middle');
 const rows=[['p=.30, MLE',.021,0],['p=.30, Beta mean',2.1/196,(.8/14)**2],['p=.95, MLE',.00475,0],['p=.95, Beta mean',.475/196,(-1.8/14)**2]];
 rows.forEach(([label,v,b],i)=>{let y=69+54*i;body+=text(20,y+25,label,18)+box(220,y,v*20000,30,'#0284c7','#0284c7');if(b)body+=box(220+v*20000,y,b*20000,30,'#c2410c','#c2410c');body+=text(725,y+25,(v+b).toFixed(6),18,'end');});
 body+=text(380,317,zh?'蓝：方差；橙：偏差平方。同一横轴尺度。':'Blue: variance; orange: squared bias. One horizontal scale.',18,'middle');
 write(3,zh?'两个真率下的风险比较':'Risk comparison at two true rates',zh?'十项比例估计无偏；Beta二二均值在率点三时总风险较小，在率点九五时虽方差低却偏差平方更大，总风险较高。':'At ten observations, the proportion is unbiased; the Beta two-two mean has lower risk at point three, but higher risk at point nine-five because squared bias outweighs its lower variance.',body);
 body=text(380,30,zh?'从模型推导惩罚尺度':'Derive penalty scale from the model',23,'middle')+box(30,63,700,64)+text(380,103,'−log posterior = SSE/(2σ²) + μ²/(2τ²) + constant',22,'middle')+arrow(380,133,380,178)+text(413,160,'× 2σ²',19)+box(30,189,700,63,'#f0fdf4','#15803d')+text(380,229,'Sum: SSE + (σ²/τ²) μ²',22,'middle')+text(380,295,'Average: SSE/n + (σ²/(nτ²)) μ²',22,'middle')+text(380,333,zh?'相同最优点需要数据项与惩罚同尺度。':'The same optimum requires matching data and penalty scales.',18,'middle');
 write(4,zh?'高斯 MAP 系数约定':'Gaussian MAP coefficient conventions',zh?'噪声与先验负对数合成后，总残差系数为噪声方差除先验方差；改平均时再除样本量。':'Combining noise and prior negative logs gives a sum-SSE penalty coefficient equal to noise variance divided by prior variance; an average objective divides that coefficient by sample count.',body);
}
