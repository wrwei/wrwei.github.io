import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {text,box,arrow,svg} from './svg.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
for(const lang of ['en','zh']){
 const zh=lang==='zh',directory=path.join(ROOT,'src/figures',lang);fs.mkdirSync(directory,{recursive:true});
 const write=(n,title,description,body,height=350)=>fs.writeFileSync(path.join(directory,`fig-26-${n}.svg`),svg(title,description,body,height));
 let body=text(380,30,zh?'真参数固定；区间随数据变化':'Truth is fixed; intervals change with data',23,'middle');
 body+='<path d="M380,63V285" stroke="#7e22ce" stroke-width="3"/>';
 [[230,460],[290,520],[140,310],[345,575],[405,655]].forEach(([lo,hi],i)=>{let y=88+42*i,col=lo<=380&&380<=hi?'#0284c7':'#c2410c';body+=`<path d="M${lo},${y}H${hi}M${lo},${y-8}V${y+8}M${hi},${y-8}V${y+8}" stroke="${col}" stroke-width="4"/>`+text(35,y+6,zh?'样本 '+(i+1):'Sample '+(i+1),18);});
 body+=text(380,319,zh?'示意区间；五条线不定义理论覆盖率。':'Schematic intervals; five lines do not define theoretical coverage.',18,'middle');
 write(1,zh?'重复区间与固定真值':'Repeated intervals and fixed truth',zh?'固定真值用紫竖线表示，五个示意区间中三条蓝线包含真值，两条橙线不包含；理论覆盖必须按真实抽样律计算。':'A purple vertical line marks fixed truth; three blue schematic intervals contain it and two orange intervals miss it. Theoretical coverage requires the actual sampling law.',body);
 body=text(380,30,zh?'比较与重抽样以独立主体为单位':'Compare and resample independent subjects',23,'middle');
 for(let i=0;i<3;i++){let x=30+i*245;body+=box(x,68,215,167)+text(x+107,102,zh?'主体 '+(i+1):'Subject '+(i+1),21,'middle')+text(x+107,143,'A_i, B_i',22,'middle')+text(x+107,180,zh?'相关变体留组内':'Keep variants together',17,'middle')+text(x+107,214,'D_i = A_i − B_i',20,'middle');}
 body+=text(380,286,'Var(D̄) = [Var(A)+Var(B)−2Cov(A,B)]/n',21,'middle')+text(380,329,zh?'对内相关保留；对间独立是声明条件。':'Preserve within-pair dependence; state cross-pair independence.',18,'middle');
 write(2,zh?'配对主体与分组单位':'Paired subjects and grouped units',zh?'三个不同主体各含两个方法和相关变体，变体留在主体组内，再以独立主体差值平均和重抽。':'Three distinct subjects each contain two methods and related variants; variants stay within subject groups, and independent subject differences are averaged and resampled.',body);
 body=text(380,30,zh?'响应模型决定损失与预测对象':'The response model defines loss and prediction',23,'middle')+box(30,65,700,72)+text(55,95,zh?'高斯：连续响应':'Gaussian: continuous response',21)+text(700,123,'SSE/(2σ²) + constant',21,'end')+box(30,157,700,72,'#faf5ff','#7e22ce')+text(55,187,zh?'Bernoulli：二值响应':'Bernoulli: binary response',21)+text(700,215,'Σ[softplus(z) − yz]',21,'end')+text(380,278,zh?'均值预测方差 = 拟合不确定性':'Mean prediction variance = fit uncertainty',21,'middle')+text(380,321,zh?'新结果方差 = 拟合不确定性 + 新噪声':'New-outcome variance = fit uncertainty + new noise',21,'middle');
 write(3,zh?'回归模型与预测方差':'Regression models and predictive variation',zh?'高斯响应负似然给平方损失，二值响应给 logistic 损失；新结果预测还包括独立观测噪声。':'Gaussian response negative likelihood gives squared loss, binary response gives logistic loss, and new-outcome prediction includes additional independent observation noise.',body);
 body=text(380,30,zh?'拟合、选择、冻结后评估':'Fit, select, then evaluate after freezing',23,'middle');
 [[30,zh?'训练':'Training',zh?'拟合变换与参数':'Fit transforms and parameters'],[275,zh?'验证':'Validation',zh?'选择模型和停止':'Select model and stopping'],[520,zh?'最终测试':'Final test',zh?'冻结后独立评估':'Independent frozen evaluation']].forEach(([x,label,detail])=>{body+=box(x,85,210,145)+text(x+105,133,label,22,'middle')+text(x+105,175,detail,16,'middle');});
 body+=arrow(244,155,265,155)+arrow(489,155,510,155)+text(380,280,zh?'交叉验证：每个训练折重新拟合预处理。':'Cross-validation: refit preprocessing in each training fold.',20,'middle')+text(380,327,zh?'测试结果指导选择后，不再是未触碰测试。':'A test used for selection is no longer untouched.',19,'middle');
 write(4,zh?'评估拆分与选择角色':'Evaluation splits and selection roles',zh?'训练拟合变换和参数，验证选择模型及停止，最终测试仅在流程冻结后作独立评估；每折重新拟合预处理。':'Training fits transforms and parameters, validation selects models and stopping, and a final test evaluates the frozen pipeline independently; preprocessing is refitted inside folds.',body);
}
