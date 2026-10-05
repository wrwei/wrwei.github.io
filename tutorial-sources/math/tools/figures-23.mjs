import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {text,box,arrow,svg} from './svg.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
for(const lang of ['en','zh']){
 const zh=lang==='zh',directory=path.join(ROOT,'src/figures',lang);fs.mkdirSync(directory,{recursive:true});
 const write=(n,title,description,body,height=350)=>fs.writeFileSync(path.join(directory,`fig-23-${n}.svg`),svg(title,description,body,height));
 let body=text(380,30,zh?'平均成本依赖输入位置模型':'Average cost depends on the input-position model',23,'middle');
 [1/2,1/4,1/8,1/8].forEach((p,i)=>{body+=text(100,99+49*i,'K='+(i+1),22,'middle')+box(170,73+49*i,p*750,34)+text(580,99+49*i,'p='+p,21);});
 body+=text(380,307,'E[K]=Σkp(k)=15/8; ΣP(K≥k)=15/8',20,'middle')+text(380,338,zh?'均匀位置给5/2；最坏成功成本仍4。':'Uniform positions give5/2; worst successful cost remains4.',19,'middle');
 write(1,zh?'加权搜索成本':'Weighted search cost',zh?'目标位置一二三四的概率分别二分之一四分之一八分之一八分之一，期望八分之十五，与均匀期望二点五不同。':'Target positions one through four have probabilities one-half, one-quarter, one-eighth, one-eighth; expected comparisons15/8 differ from the uniform2.5.',body,360);
 body=text(380,30,zh?'联合质量先求和 再按情况归一':'Sum joint masses, then normalise by the case',23,'middle');
 ['X / Y','0','2',zh?'行和':'Row sum'].forEach((s,i)=>{body+=text(105+180*i,85,s,20,'middle');});
 [['0','1/2','1/4','3/4'],['1','1/8','1/8','1/4'],[zh?'列和':'Column sum','5/8','3/8','1']].forEach((r,j)=>{body+=box(25,104+52*j,710,44,j===2?'#fff7ed':'#f0f9ff');r.forEach((s,i)=>{body+=text(105+180*i,135+52*j,s,21,'middle');});});
 body+=text(380,309,'P(X=1|Y=0)=1/5; P(X=1|Y=2)=1/3',20,'middle')+text(380,339,zh?'条件分母为对应列和，不是原始X边缘。':'The conditional denominator is its column sum, not the original X marginal.',17,'middle');
 write(2,zh?'精确联合边缘条件表':'Exact joint marginal conditional table',zh?'两行X零一两列Y零二，行和四分之三四分之一，列和八分之五八分之三；列内X一条件分别五分之一三分之一。':'Rows X zero and one, columns Y zero and two, have row sums3/4 and1/4, column sums5/8 and3/8, and conditional X-one rates1/5 and1/3.',body,365);
 body=text(380,30,zh?'全方差 = 组内 + 组间':'Total variance = within + between',24,'middle')+box(35,65,325,210)+box(400,65,325,210);
 body+=text(197,107,zh?'期望条件方差':'Expected conditional variance',18,'middle')+text(562,107,zh?'条件均值的方差':'Variance of conditional means',18,'middle')+text(197,157,'E[Var(X|Y)]',24,'middle')+text(562,157,'Var(E[X|Y])',24,'middle')+text(197,209,'11/60',29,'middle')+text(562,209,'1/240',29,'middle')+text(197,250,zh?'组权5/8与3/8':'Case weights5/8 and3/8',18,'middle')+text(562,250,zh?'均值1/5与1/3':'Means1/5 and1/3',18,'middle')+text(380,325,'Var(X)=3/16=11/60+1/240',23,'middle');
 write(3,zh?'全方差分解':'Total variance decomposition',zh?'表的期望组内方差六十分之十一与组间二百四十分之一相加为十六分之三，权重为八分之五和八分之三。':'Expected within-case variance11/60 and between-case variance1/240 sum to3/16, using actual case weights5/8 and3/8.',body);
 body=text(380,30,zh?'PSD允许零投影方差':'PSD permits a zero projected variance',24,'middle');
 const px=x=>245+70*x,py=y=>205-70*y;
 body+='<path d="M70,205H420M245,60V300" stroke="#94a3b8"/>'+`<path d="M${px(-2.3)},${py(-1.15)}L${px(2.3)},${py(1.15)}" stroke="#15803d" stroke-width="3"/>`;
 [[-2,-1],[-1,-.5],[1,.5],[2,1]].forEach(([x,y])=>{body+=`<circle cx="${px(x)}" cy="${py(y)}" r="6" fill="#15803d"/>`;});
 body+=arrow(px(0),py(0),px(-1),py(2))+text(472,100,zh?'经验Cov，分母N':'Empirical Cov, denominator N',18)+text(472,145,'[[2.5,1.25],',21)+text(472,176,' [1.25,.625]]',21)+text(472,225,zh?'线方向Var=3.125':'Line direction Var=3.125',19)+text(472,267,zh?'垂直方向Var=0':'Perpendicular Var=0',19)+text(380,327,zh?'每方向非负，仍可奇异；几何方差不认证预测。':'Every direction nonnegative, possibly singular; variance does not certify prediction.',17,'middle');
 write(4,zh?'奇异协方差几何':'Singular covariance geometry',zh?'四点在y=x除二上，主方向方差三点一二五，垂直方向零；协方差半正定而奇异。':'Four points lie on y=x/2, with principal variance3.125 and perpendicular variance zero; covariance is positive semidefinite and singular.',body);
}
