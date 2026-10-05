import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {text,box,arrow,svg} from './svg.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
for(const lang of ['en','zh']){
 const zh=lang==='zh',directory=path.join(ROOT,'src/figures',lang);fs.mkdirSync(directory,{recursive:true});
 const write=(n,title,description,body,height)=>fs.writeFileSync(path.join(directory,`fig-13-${n}.svg`),svg(title,description,body,height));
 let body=text(380,30,zh?'对称映射的和差方向：互相垂直，缩放分离':'Sum and difference modes of a symmetric map: perpendicular scalings',20,'middle');
 body+='<path d="M30,220H380M180,310V65" stroke="#94a3b8"/>'+arrow(180,220,270,130)+arrow(180,220,240,280)+text(278,123,'(1,1): λ=3',21)+text(248,301,'(1,−1): λ=1',21);
 body+=box(445,75,290,220)+text(590,119,'A=[[2,1],[1,2]]',23,'middle')+text(590,174,'A = Q diag(1,3) Qᵀ',22,'middle')+text(590,229,'QᵀQ = I',26,'middle')+text(590,272,zh?'单位方向分别除以 √2':'Unit directions divide by √2',17,'middle');
 write(1,zh?'正交特征方向':'Orthogonal eigendirections',zh?'二一一二矩阵的和方向特征值三、差方向一，单位化后正交，Q对角一三Q转置重构。':'Matrix [[2,1],[1,2]] has sum eigenvalue three and difference eigenvalue one; unit directions are orthogonal and Q diag(1,3) Q transpose reconstructs it.',body);
 body=text(380,30,zh?'等值集不是映射伸缩：正定、半正定与不定':'Level sets differ from map scaling: definite, semidefinite, indefinite',19,'middle');
 body+='<ellipse cx="130" cy="170" rx="85" ry="49" transform="rotate(45 130 170)" fill="none" stroke="#2563eb" stroke-width="3"/><path d="M350,85V255M410,85V255" stroke="#15803d" stroke-width="3"/>';
 for(const sign of [-1,1]){let points=[];for(let j=0;j<=60;j++){const t=-1.4+j*2.8/60;points.push([635+sign*40*Math.cosh(t),170-40*Math.sinh(t)]);}body+='<path d="M'+points.map(p=>p.join(',')).join('L')+'" fill="none" stroke="#c2410c" stroke-width="3"/>';}
 body+=text(130,300,'c₁²+3c₂²=1',22,'middle')+text(380,300,'x₁²=1',22,'middle')+text(635,300,'x₁²−x₂²=1',22,'middle')+text(130,342,zh?'椭圆；半轴 1、1/√3':'Ellipse; axes 1, 1/√3',17,'middle')+text(380,342,zh?'平坦第二方向':'Flat second direction',17,'middle')+text(635,342,zh?'双曲线；符号混合':'Hyperbola; mixed signs',17,'middle');
 write(2,zh?'三种二次等值集':'Three quadratic level sets',zh?'正定二次型椭圆，半正定一零的单位等值为两平行线，不定一负一为双曲线。':'A positive-definite form has an ellipse, diag(1,0) unit level has two parallel lines, and diag(1,−1) unit level has a hyperbola.',body,375);
 body=text(380,30,zh?'谱半径边界与暂态：不能只看单步范数':'Spectral boundary and transients: one-step norms do not tell all',20,'middle')+box(25,70,345,235)+box(395,70,340,235,'#fff7ed','#c2410c');
 body+=text(197,112,'B=[[0.5,3],[0,0.5]]',22,'middle')+text(197,158,'ρ=0.5',25,'middle')+text(197,208,'e₀=(0,1) → e₁=(3,0.5)',20,'middle')+text(197,256,zh?'首步放大，最终趋零':'First amplification, eventual decay',18,'middle');
 body+=text(565,112,'J=[[1,1],[0,1]]',22,'middle')+text(565,158,'ρ=1',25,'middle')+text(565,208,'Jᵏ(0,1)=(k,1)',23,'middle')+text(565,256,zh?'单位亏损：无界增长':'Unit defective block: unbounded',18,'middle')+text(380,342,zh?'N²=0 时，(λI+N)ᵏ=λᵏI+kλᵏ⁻¹N（k≥1）。':'When N²=0: (λI+N)ᵏ=λᵏI+kλᵏ⁻¹N for k≥1.',20,'middle');
 write(3,zh?'亏损幂的几何与多项式因素':'Geometric and polynomial factors in defective powers',zh?'半特征值亏损首步放大却最终衰减，单位特征值亏损产生k一无界增长。':'A defective half-eigenvalue map first amplifies but eventually decays; a unit defective map produces unbounded (k,1).',body,375);
 body=text(380,30,zh?'正定条件比：强目标方向与弱逆扰动方向':'SPD condition ratio: a strong target and a weak inverse disturbance',20,'middle')+box(30,70,700,235);
 body+=text(380,113,'A=diag(1,100);    κ₂=100',27,'middle')+text(225,169,'b=(0,100)',25,'middle')+text(535,169,'x=(0,1)',25,'middle')+arrow(330,160,420,160)+text(225,226,'δb=(0.01,0)',25,'middle')+text(535,226,'δx=(0.01,0)',25,'middle')+arrow(330,217,420,217)+text(380,282,zh?'相对变化 10⁻⁴ → 10⁻²：本方向达到最坏界。':'Relative change 10⁻⁴ → 10⁻²: these directions attain the bound.',20,'middle')+text(380,347,zh?'其他扰动方向未必同样放大；一般非对称矩阵需奇异值。':'Other directions need not amplify equally; nonsymmetric maps need singular values.',18,'middle');
 write(4,zh?'正定逆的方向敏感性':'Directional sensitivity in an SPD inverse',zh?'对角一一百的条件数一百，强方向目标零一百，弱方向扰动零点零一零，相对变化放大一百。':'For diag(1,100), the condition ratio is 100. Target (0,100) and perturbation (0.01,0) attain relative amplification 100.',body,380);
}
