import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {text,box,arrow,svg} from './svg.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
for(const lang of ['en','zh']){
 const zh=lang==='zh',dir=path.join(ROOT,'src/figures',lang);fs.mkdirSync(dir,{recursive:true});
 const write=(n,title,desc,body)=>fs.writeFileSync(path.join(dir,`fig-28-${n}.svg`),svg(title,desc,body,350));
 let body=text(380,30,zh?'三种平均：说明随机源':'Three averages: identify the randomness',23,'middle');
 [[55,'R(w) = E_Z ℓ(w;Z)',zh?'未知总体上的风险':'Risk under the population law'],[145,'F(w) = Σᵢ ℓᵢ(w)/N',zh?'固定训练数据上的目标':'Objective on fixed training data'],[235,'E[ĝ | w,data] = ∇F(w)',zh?'新抽样索引的条件均值':'Conditional mean over fresh sampled indices']].forEach(([y,eq,label])=>{body+=box(35,y,690,77)+text(55,y+31,eq,22)+text(55,y+61,label,19);});
 write(1,zh?'总体经验与梯度平均':'Population empirical and gradient averages',zh?'总体风险对新例子的律平均，经验目标对固定数据求和，抽样梯度的无偏性是固定当前状态和数据后的新索引平均。':'Population risk averages over new examples, empirical risk sums over fixed data, and gradient unbiasedness averages fresh indices conditional on the current state and data.',body);
 body=text(380,30,zh?'同一个 b，三个协方差':'Same b, three covariance laws',23,'middle');
 [[55,zh?'独立有放回':'Independent replacement','C/b'],[140,zh?'均匀不同索引子集':'Uniform distinct-index subset','(C/b) (N−b)/(N−1)'],[225,zh?'一个抽样复制 b 次':'One sampled gradient copied b times','C']].forEach(([y,label,eq])=>{body+=box(35,y,690,70)+text(55,y+30,label,21)+text(700,y+56,eq,24,'end');});
 body+=text(380,332,zh?'子集公式需 N>1；C 使用分母 N。':'Subset formula needs N>1; C uses denominator N.',18,'middle');
 write(2,zh?'批次独立性与有限总体校正':'Batch independence and finite-population correction',zh?'有放回独立平均 C 除 b，不同索引再乘有限总体校正，复制同一个梯度没有方差缩减。':'Independent replacement has covariance C over b; distinct subsets add the finite-population factor; copied gradients retain C.',body);
 body=text(380,30,zh?'同一个标量目标，不同惩罚':'Same scalar fit, different penalties',23,'middle')+text(380,77,'½(w−a)²; a=.8, λ=1',24,'middle');
 body+=box(35,115,330,125)+box(395,115,330,125,'#faf5ff','#7e22ce')+text(200,149,zh?'岭 λw²/2':'Ridge λw²/2',23,'middle')+text(200,190,'w*=a/(1+λ)=.4',23,'middle')+text(560,149,zh?'套索 λ|w|':'Lasso λ|w|',23,'middle')+text(560,190,'w*=sign(a)(|a|−λ)₊=0',20,'middle');
 body+=text(380,290,zh?'特征缩放会改变惩罚几何；截距另定。':'Feature scaling changes penalty geometry; specify the intercept.',19,'middle')+text(380,328,zh?'训练拟合尺度 → 验证选择 λ → 一次最终评估':'Fit scales on train → select λ on validation → evaluate once',19,'middle');
 write(3,zh?'岭套索与拆分约定':'Ridge lasso and split conventions',zh?'标量点八岭强度一解点四，套索强度一解零；尺度改变惩罚几何，训练拟合尺度验证选强度最终一次评估。':'Scalar target point eight with strength one gives ridge point four and lasso zero; scaling changes penalty geometry, training fits scales, validation selects strength and final evaluation is frozen.',body);
 body=text(380,30,zh?'审计一次更新与一次报告':'Audit an update and its report',23,'middle');
 const labels=zh?['目标及正则化尺度','抽样及条件协方差','步长与状态递推','预算、验证与最终测试']:['Objective and penalty scale','Sampling and conditional covariance','Rate and state recurrence','Budget, validation and final test'];
 labels.forEach((label,i)=>{body+=box(45,55+i*64,670,47)+text(380,85+i*64,label,21,'middle');if(i<3)body+=arrow(380,105+i*64,380,114+i*64);});
 body+=text(380,333,zh?'训练下降本身不证明总体泛化。':'Training descent alone does not prove population generalisation.',19,'middle');
 write(4,zh?'随机训练报告的数学链':'Mathematical chain for a stochastic training report',zh?'先声明目标尺度，再声明抽样协方差，接着步长与状态，最后预算验证和冻结测试。训练下降本身不是泛化保证。':'Declare objective scales, sampling covariance, rate and optimiser state, then budget, validation and frozen testing. Descent on training data alone is not a generalisation guarantee.',body);
}
