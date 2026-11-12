import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {text,box,arrow,svg} from './svg.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
for(const lang of ['en','zh']){
 const zh=lang==='zh',dir=path.join(ROOT,'src/figures',lang);fs.mkdirSync(dir,{recursive:true});
 const write=(n,title,desc,body)=>fs.writeFileSync(path.join(dir,`fig-32-${n}.svg`),svg(title,desc,body,350));
 let body=text(380,30,zh?'固定数据，正确的信息流':'Fixed data, explicit information flow',23,'middle');
 const labels=zh?['种子 7：1000 行；种子 11：600/200/200','训练：μ、s、PCA 和模型参数','验证：13 候选、基线与组件选择','冻结规则 → 测试指标及条件区间']:['Seed7: 1000 rows; seed11: 600/200/200','Train: μ, s, PCA and model parameters','Validate: 13 candidates, baseline and components','Freeze rules → test metrics and conditional intervals'];
 labels.forEach((label,i)=>{body+=box(35,55+i*66,690,48)+text(380,86+i*66,label,21,'middle');if(i<3)body+=arrow(380,105+i*66,380,116+i*66);});
 write(1,zh?'学习流程与拆分依赖':'Learning pipeline and split dependencies',zh?'精确生成后分层拆分，训练拟合全部变换，验证选择十三候选，冻结后测试；测试不回流拟合。':'Exact generation precedes stratified splitting; training fits all transforms, validation chooses among thirteen candidates, and frozen testing does not feed back into fitting.',body);
 body=text(380,30,zh?'形状是导数约定的一部分':'Shapes are part of the derivative contract',23,'middle');
 [[65,'Z: n×d → A=[1,Z]: n×(d+1)'],[145,'θ: (d+1,) → t,p,y: (n,)'],[225,'g = Aᵀ(p−y)/n + λ(0,w): (d+1,)']].forEach(([y,label])=>{body+=box(35,y,690,64)+text(380,y+39,label,23,'middle');});
 body+=text(380,332,zh?'PCA 保留 k 后，将 d 换 k；不要广播成 n×n。':'After PCA replace d by k; avoid unintended n×n broadcasting.',19,'middle');
 write(2,zh?'logistic 形状与梯度':'Logistic shapes and gradient',zh?'设计矩阵 n乘d加一，参数 d加一，logits概率标签 n，转置残差均值加斜率罚得参数梯度；PCA用k。':'Design n by d-plus-one, parameter d-plus-one, logits probabilities and labels n; transposed residual mean plus slope penalty gives the parameter gradient; PCA uses k.',body);
 body=text(380,30,zh?'三个实现必须是同一个目标':'Three implementations must express one objective',23,'middle');
 [[65,zh?'推导：均值 NLL + λ‖w‖²/2，b 不罚':'Derivation: mean NLL + λ‖w‖²/2; no b penalty'],[145,zh?'求值：稳定 logit 损失，不裁剪模型':'Evaluation: stable logit loss without changing the model'],[225,zh?'检查：同样归约和惩罚的平滑差分':'Check: smooth differences with the same reduction and penalty']].forEach(([y,label])=>{body+=box(35,y,690,65)+text(380,y+40,label,21,'middle');});
 body+=text(380,332,zh?'遗漏除 n 是公式错误，不能靠更小 h 修复。':'Missing division by n is a formula fault, not fixed by smaller h.',19,'middle');
 write(3,zh?'目标、稳定求值与检查一致性':'Consistency of objective stable evaluation and checking',zh?'均值似然与无罚截距推导，稳定原 logit 求值，以及同一归约惩罚的数值导数应一致。':'Mean likelihood and unpenalised intercept derivation, stable original-logit evaluation and numerical derivatives with the same reduction and penalty must agree.',body);
 body=text(380,30,zh?'对每个结果说明它证明什么':'State what each result establishes',23,'middle');
 const claims=zh?['梯度检查：局部实现证据','曲率与尺度：解释优化稳定性','冻结测试：声明混合的风险估计','分层区间：固定类数与模型的近似不确定']:['Gradient check: local implementation evidence','Curvature and scale: optimisation stability explanation','Frozen test: risk estimate for the declared mixture','Stratified intervals: approximate uncertainty, fixed counts/model'];
 claims.forEach((label,i)=>{body+=box(35,58+i*66,690,50)+text(380,90+i*66,label,20,'middle');});
 write(4,zh?'数值学习证据的解释范围':'Interpretation scope of numerical learning evidence',zh?'梯度、曲率、冻结测试和条件bootstrap各回答不同问题，均不单独保证未来偏移总体。':'Gradient, curvature, frozen testing and conditional bootstrap answer different questions and do not alone guarantee future shifted-population performance.',body);
}
