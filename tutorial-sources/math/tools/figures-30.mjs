import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {text,box,arrow,svg} from './svg.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
for(const lang of ['en','zh']){
 const zh=lang==='zh',dir=path.join(ROOT,'src/figures',lang);fs.mkdirSync(dir,{recursive:true});
 const write=(n,title,desc,body)=>fs.writeFileSync(path.join(dir,`fig-30-${n}.svg`),svg(title,desc,body,350));
 let body=text(380,30,zh?'先选择，冻结后再估计':'Select first, freeze before estimating',23,'middle');
 const stages=zh?['训练：参数与变换','验证：候选选择','冻结：模型与规则','测试：目标风险估计']:['Train: parameters and transforms','Validate: candidate selection','Freeze: model and rules','Test: estimate target risk'];
 stages.forEach((label,i)=>{body+=box(35,52+i*66,690,47)+text(380,82+i*66,label,21,'middle');if(i<3)body+=arrow(380,101+i*66,380,114+i*66);});
 body+=text(380,336,zh?'每次使用标签都应进入信息依赖说明。':'Every use of labels belongs in the information-dependency account.',18,'middle');
 write(1,zh?'选择与冻结测试':'Selection and frozen testing',zh?'训练拟合参数和变换，验证选候选，冻结所有规则，再用独立测试估计声明目标风险。':'Training fits parameters and transforms, validation selects, all rules are frozen, then independent testing estimates the declared target risk.',body);
 body=text(380,30,zh?'PSD 的证明，比对称性更强':'A PSD proof is stronger than symmetry',23,'middle');
 body+=box(35,65,690,91)+text(55,97,'k(s,t)=φ(s)ᵀφ(t); φ(t)=(1,t)',22)+text(55,135,'cᵀKc = ‖Σᵢ cᵢφ(xᵢ)‖² ≥ 0',24);
 body+=box(35,185,690,91,'#fff7ed','#c2410c')+text(55,219,'K=((1,2),(2,1)); c=(1,−1)',22)+text(55,257,'cᵀKc = −2',24)+text(380,327,zh?'正对角与对称不能排除负二次型。':'Positive diagonal and symmetry do not exclude a negative quadratic form.',18,'middle');
 write(2,zh?'特征平方和与负见证':'Feature sum of squares and negative witness',zh?'特征核的二次型为特征和平方非负；对称正对角矩阵一二二一有向量一负一给负二。':'Feature-kernel quadratic forms are squared norms; the symmetric positive-diagonal matrix one-two-two-one has vector one-minus-one giving minus two.',body);
 body=text(380,30,zh?'软间隔：分数、松弛及范数':'Soft margin: score, slack and norm',23,'middle')+text(380,88,'yᵢ(wᵀφᵢ+b) ≥ 1−ξᵢ; ξᵢ≥0',25,'middle');
 body+=box(35,125,690,75)+text(380,170,'min ½‖w‖² + CΣᵢξᵢ',25,'middle')+text(380,246,'ξᵢ* = max(0,1−yᵢfᵢ)',24,'middle')+text(380,296,zh?'自由截距的对偶条件：Σᵢαᵢyᵢ=0':'Free-intercept dual condition: Σᵢαᵢyᵢ=0',21,'middle')+text(380,331,zh?'几何距离 yᵢfᵢ/‖w‖ 需要 w≠0。':'Geometric distance yᵢfᵢ/‖w‖ requires w≠0.',19,'middle');
 write(3,zh?'软 SVM 模型约定':'Soft SVM model conventions',zh?'间隔约束含非负松弛，目标半范数平方加 C 总松弛，固定分数最小松弛为 hinge，自由截距产生对偶等式。':'Margin constraints include nonnegative slack; objective is half norm squared plus C total slack; fixed-score optimal slack is hinge loss and a free intercept creates the dual equality.',body);
 body=text(380,30,zh?'同一报告，四种论证':'Four arguments in one report',23,'middle');
 const claims=zh?['样本：IID 单位、损失范围及目标 P','类：预先控制或独立构造候选','数值：PSD、尺度、求解与目标约定','评估：冻结选择、配对指标及偏移限制']:['Sample: IID units, loss range and target P','Class: precontrolled or independently built candidates','Numerics: PSD, scale, solve and objective convention','Evaluation: frozen choice, paired metrics and shift limits'];
 claims.forEach((label,i)=>{body+=box(35,58+i*66,690,50)+text(380,90+i*66,label,20,'middle');});
 write(4,zh?'泛化报告的条件链':'Assumption chain for a generalisation report',zh?'风险声明需要样本条件、候选控制、数值模型有效性和冻结目标评估，任一条件不能由单个训练分数替代。':'A risk claim needs sample assumptions, candidate control, numerical model validity and frozen target evaluation; a single training score cannot replace any of them.',body);
}
