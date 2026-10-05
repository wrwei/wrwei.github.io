import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {text,box,arrow,svg} from './svg.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
for(const lang of ['en','zh']){
 const zh=lang==='zh',directory=path.join(ROOT,'src/figures',lang);fs.mkdirSync(directory,{recursive:true});
 const write=(n,title,description,body,height=350)=>fs.writeFileSync(path.join(directory,`fig-18-${n}.svg`),svg(title,description,body,height));
 let body=text(380,30,zh?'轴上的偏导可以遗漏对角路径':'Axis partials can miss a diagonal approach',24,'middle')+box(35,65,325,215)+box(400,65,325,215);
 body+=text(195,100,zh?'坐标轴 x=0 或 y=0':'Axes x=0 or y=0',21,'middle')+text(195,150,'f=0',27,'middle')+text(195,220,'∂ₓf(0)=∂ᵧf(0)=0',22,'middle')+text(562,100,zh?'对角 x=y=t≠0':'Diagonal x=y=t≠0',21,'middle')+text(562,150,'f=1/2',27,'middle')+text(562,220,zh?'不连续，更非全可导':'Not continuous or differentiable',20,'middle')+text(380,325,'f(x,y)=xy/(x²+y²); f(0,0)=0',21,'middle');
 write(1,zh?'偏导与全可导反例':'Partials versus total differentiability counterexample',zh?'两轴函数为零，原点两偏导零，对角接近时值始终二分之一，所以原点不连续。':'Both axis restrictions vanish and partials at the origin are zero, while diagonal values remain one-half, proving discontinuity there.',body);
 body=text(380,30,zh?'相同局部线性图的两种传播':'Two propagation directions through one local linear map',24,'middle')+box(45,70,260,85)+box(455,70,260,85);
 body+=text(175,120,zh?'输入切向 v ∈ Rⁿ':'Input tangent v ∈ Rⁿ',21,'middle')+text(585,120,zh?'输出切向 Jv ∈ Rᵐ':'Output tangent Jv ∈ Rᵐ',20,'middle')+arrow(305,112,455,112)+text(380,95,'J: m×n',20,'middle');
 body+=box(45,205,260,85,'#dcfce7','#15803d')+box(455,205,260,85,'#dcfce7','#15803d')+text(175,255,zh?'输入伴随 Jᵀq ∈ Rⁿ':'Input adjoint Jᵀq ∈ Rⁿ',19,'middle')+text(585,255,zh?'输出种子 q ∈ Rᵐ':'Output seed q ∈ Rᵐ',20,'middle')+arrow(455,247,305,247)+text(380,230,'Jᵀ: n×m',20,'middle')+text(380,335,zh?'列约定：df=∇fᵀdx；输出在行，输入在列。':'Column convention: df=∇fᵀdx; outputs in rows, inputs in columns.',17,'middle');
 write(2,zh?'前向JVP与反向VJP形状':'Forward JVP and reverse VJP shapes',zh?'m乘n雅可比将n输入切向映m输出，转置将m输出种子映n输入伴随。':'An m-by-n Jacobian maps n input tangents to m outputs; its transpose maps m output seeds to n input adjoints.',body,360);
 body=text(380,30,zh?'一阶系数与二阶耦合是不同对象':'First-order coefficients and second-order coupling differ',23,'middle')+box(35,75,245,220)+box(310,75,415,220);
 body+=text(158,112,'∇f: 2×1',24,'middle')+text(158,171,'−0.56',27,'middle')+text(158,226,'1.16032',27,'middle')+text(518,112,'H: 2×2',24,'middle')+text(428,174,'−0.8',27,'middle')+text(620,174,'1.4',27,'middle','#c2410c')+text(428,230,'1.4',27,'middle','#c2410c')+text(620,230,'0.67032',27,'middle')+text(380,333,'f=x²y+exp(y); a=(0.7,−0.4)',21,'middle');
 write(3,zh?'梯度与耦合Hessian':'Gradient and coupled Hessian',zh?'x平方y加指数y在零点七负零点四的梯度负零点五六与一点一六零三二，Hessian混合项一点四，表示不同坐标相互影响。':'For x²y+exp(y) at (0.7,-0.4), the gradient is (-0.56,1.16032) and the Hessian has mixed entries 1.4, recording coordinate coupling.',body,355);
 body=text(380,30,zh?'共享图：前向值与反向伴随':'Shared graph: forward values and reverse adjoints',24,'middle');
 const node=(x,y,label,value,adjoint)=>box(x,y,180,110)+text(x+90,y+30,label,21,'middle')+text(x+90,y+66,(zh?'值 ':'value ')+value,20,'middle')+text(x+90,y+96,(zh?'伴随 ':'adjoint ')+adjoint,20,'middle','#15803d');
 body+=arrow(225,108,290,108)+arrow(225,148,290,148)+arrow(470,108,535,108)+arrow(470,148,535,148)+arrow(625,180,625,300)+arrow(470,168,535,300)+arrow(535,355,470,355)+arrow(225,168,290,300);
 body+=node(45,70,'x',2,37)+node(290,70,'u=x*x',4,9)+node(535,70,'v=u*u',16,1)+node(535,300,'w=v+u',20,1)+node(290,300,'z=w+x',22,1);
 body+=text(258,100,'x',18,'middle')+text(258,145,'x',18,'middle')+text(503,100,'u',18,'middle')+text(503,145,'u',18,'middle')+text(643,245,'1',18)+text(500,238,'1',18)+text(503,344,'1',18,'middle')+text(250,238,'1',18)+text(380,463,zh?'ū=2u+1=9；x̄=2x·ū+1=37。':'ū=2u+1=9; x̄=2x·ū+1=37.',22,'middle')+text(380,498,zh?'箭头为前向依赖；每条边都贡献反向系数。':'Arrows show forward dependencies; every edge contributes backward.',17,'middle');
 write(4,zh?'共享平方图的完整累积':'Complete accumulation in a shared-square graph',zh?'x二、u四、v十六、w二十、z二十二，种子一反向给伴随z一w一v一u九x三十七，两重复乘边与直接加路径全部累计。':'At x two, u four, v sixteen, w twenty and z twenty-two, output seed one gives adjoints z one, w one, v one, u nine, x thirty-seven. Both repeated multiplication edges and direct addition paths contribute.',body,525);
}
