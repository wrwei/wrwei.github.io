import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {text,box,arrow,svg} from './svg.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
for(const lang of ['en','zh']){
 const zh=lang==='zh',directory=path.join(ROOT,'src/figures',lang);fs.mkdirSync(directory,{recursive:true});
 const write=(n,title,description,body,height=350)=>fs.writeFileSync(path.join(directory,`fig-20-${n}.svg`),svg(title,description,body,height));
 let body=text(380,30,zh?'最近点由可行集决定':'The feasible set determines the nearest point',23,'middle');
 const px=x=>130+230*x,py=y=>285-150*y;
 body+=`<rect x="${px(0)}" y="${py(1)}" width="230" height="150" fill="#f0f9ff" stroke="#0ea5e9"/><path d="M${px(0)},${py(1)}L${px(1)},${py(0)}" stroke="#15803d" stroke-width="5"/>`;
 for(const [x,y,col] of [[1.2,.4,'#1a2e4a'],[1,.4,'#2563eb'],[.9,.1,'#15803d']])body+=`<circle cx="${px(x)}" cy="${py(y)}" r="6" fill="${col}"/>`;
 body+=text(445,92,zh?'二维输入 (1.2,.4)':'2D input (1.2,.4)',20)+text(445,139,zh?'盒投影 (1,.4)':'Box: (1,.4)',20)+text(445,186,zh?'线段投影 (.9,.1)':'Segment: (.9,.1)',20)+text(445,233,'x+y=1; x,y≥0',20)+text(380,327,zh?'正方形与绿线段不同；可行不等于最近。':'The square and green segment differ; feasible need not mean nearest.',18,'middle');
 write(1,zh?'盒与单纯形投影':'Box and simplex projection',zh?'二维盒为零一正方形，单纯形为连接零一与一零的线段；输入一点二零点四分别投到一零点四和零点九零点一。':'The two-coordinate box is the unit square, the simplex is the sum-one segment; input (1.2,0.4) projects to (1,0.4) and (0.9,0.1) respectively.',body);
 body=text(380,30,zh?'完整KKT证书有四行':'A complete KKT certificate has four lines',24,'middle');
 const rows=zh?[['原始可行','g≤0; h=0'],['对偶可行','λ≥0; ν任意'],['互补松弛','λᵢgᵢ=0'],['驻点','∇f+Σλᵢ∇gᵢ+Σνⱼ∇hⱼ=0']]:[['Primal feasibility','g≤0; h=0'],['Dual feasibility','λ≥0; ν unrestricted'],['Complementarity','λᵢgᵢ=0'],['Stationarity','∇f+Σλᵢ∇gᵢ+Σνⱼ∇hⱼ=0']];
 rows.forEach((r,i)=>{body+=box(40,64+52*i,680,45)+text(60,94+52*i,r[0],20)+text(410,94+52*i,r[1],18);});
 body+=text(380,324,zh?'活跃可有零乘子；凸充分性与资格必要性分开。':'Active can mean zero price; convex sufficiency differs from qualified necessity.',17,'middle');
 write(2,zh?'四项KKT条件':'Four KKT conditions',zh?'四行分别检查原始可行、非负不等式乘子、逐项互补及完整拉格朗日梯度，活跃不必正价格。':'Separate rows check primal feasibility, nonnegative inequality multipliers, individual complementarity and the full Lagrangian gradient; active need not mean positive price.',body);
 body=text(380,30,zh?'下界链与取得是不同问题':'The lower-bound chain and attainment differ',23,'middle');
 body+=box(45,65,190,90)+box(285,65,190,90)+box(525,65,190,90)+text(140,118,'q(λ,ν)',25,'middle')+text(380,118,'L(x,λ,ν)',25,'middle')+text(620,118,'f(x)',25,'middle')+text(260,120,'≤',28,'middle')+text(500,120,'≤',28,'middle');
 body+=text(380,193,zh?'x可行且λ≥0 ⇒ 弱对偶':'Feasible x and λ≥0 ⇒ weak duality',21,'middle')+text(380,240,zh?'min x; x²≤0: p*=d*=0':'min x; x²≤0: p*=d*=0',22,'middle')+text(380,284,'q(λ)=−1/(4λ), λ>0',22,'middle')+text(380,327,zh?'零间隙，但有限λ不取得对偶最优。':'Zero gap, but no finite λ attains the dual optimum.',19,'middle');
 write(3,zh?'弱对偶与零间隙取得':'Weak duality and zero-gap attainment',zh?'有效乘子和可行点给q小于等于L小于等于f；极小x约束x平方非正虽零间隙，却只有乘子趋无穷时逼近对偶最优。':'Valid multipliers and feasible points give q≤L≤f; minimising x with x squared nonpositive has zero gap but approaches dual optimality only as its multiplier diverges.',body);
 body=text(380,30,zh?'投影强制可行；罚项改变目标':'Projection enforces feasibility; penalties change the objective',22,'middle');
 body+=box(35,65,330,220)+box(395,65,330,220)+text(200,109,zh?'投影':'Projection',23,'middle')+text(560,109,zh?'平方罚':'Squared penalty',23,'middle')+text(200,155,'x⁺=P_C(x−αg)',23,'middle')+text(560,155,'fρ=f+ρx²/2',23,'middle')+text(200,202,zh?'精确投影 ⇒ x⁺∈C':'Exact projection ⇒ x⁺∈C',19,'middle')+text(560,202,'xρ=2/(1+ρ)>0',23,'middle')+text(200,248,zh?'边界普通g可非零':'Boundary raw g can be nonzero',17,'middle')+text(560,248,zh?'原等式 x=0仍违反':'Original equality x=0 is violated',17,'middle')+text(380,327,zh?'例 f=(x−2)²/2、约束 x=0；任意有限平方罚权仍不可行。':'Example f=(x−2)²/2 with x=0; every finite squared weight remains infeasible.',17,'middle');
 write(4,zh?'投影与有限平方罚比较':'Projection versus finite squared penalty',zh?'精确投影每步在可行集；标量平方罚问题的极小点二除以一加权重在有限权重下非零，仍违反原等式。':'Exact projection stays feasible at each step; the scalar squared-penalty minimiser 2/(1+weight) remains nonzero at finite weight and violates the original equality.',body);
}
