import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {text,box,arrow,svg} from './svg.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
for(const lang of ['en','zh']){
 const zh=lang==='zh',directory=path.join(ROOT,'src/figures',lang);fs.mkdirSync(directory,{recursive:true});
 const write=(n,title,description,body,height)=>fs.writeFileSync(path.join(directory,`fig-12-${n}.svg`),svg(title,description,body,height));
 let body=text(380,30,zh?'最近点：投影与残差垂直':'Closest point: projection and residual are perpendicular',21,'middle');
 body+='<path d="M80,275H385M110,295V50" stroke="#94a3b8"/><path d="M80,305L335,50" stroke="#93c5fd" stroke-width="4"/>'+arrow(110,275,260,125)+arrow(260,125,290,155)+'<circle cx="260" cy="125" r="5" fill="#15803d"/><circle cx="290" cy="155" r="5" fill="#1a2e4a"/>'+text(170,120,'p=(2.5,2.5)',21)+text(300,176,'y=(3,2)',21)+text(290,100,'r=(0.5,−0.5)',20);
 body+=box(470,90,260,195)+text(600,139,'u·r = 0',26,'middle')+text(600,191,'‖r‖² = 1/2',25,'middle')+text(600,246,zh?'其他候选增加平方项':'Other candidates add a square',17,'middle');
 write(1,zh?'对角线投影的正交分解':'Orthogonal decomposition at a diagonal projection',zh?'三二投影到一一张成为二点五二点五，余量零点五负零点五垂直一一，平方长度二分之一。':'Target (3,2) projects onto span(1,1) at (2.5,2.5); residual (0.5,−0.5) is perpendicular and has squared norm one half.',body);
 body=text(380,30,zh?'先去成分，再归一化：保留相同张成':'Remove the component, then normalise: preserve the span',21,'middle');
 body+=box(25,75,220,180)+text(135,119,'a₂=(1,0,1)',24,'middle')+text(135,173,'q₁=(1,1,0)/√2',20,'middle')+text(135,224,'q₁·a₂=1/√2',21,'middle')+arrow(255,163,295,163)+box(305,75,200,180)+text(405,119,'v₂',26,'middle')+text(405,173,'(1/2,−1/2,1)',21,'middle')+text(405,224,'‖v₂‖=√(3/2)',21,'middle')+arrow(515,163,550,163)+box(560,75,175,180,'#f0fdf4','#15803d')+text(647,119,'q₂',26,'middle')+text(647,172,'(1,−1,2)/√6',20,'middle')+text(647,224,'q₁·q₂=0',21,'middle');
 body+=text(380,315,'A = QR;   R = [[√2,1/√2],[0,√(3/2)]]',22,'middle');
 write(2,zh?'两列格拉姆施密特':'Two-column Gram–Schmidt',zh?'从一零一减去沿第一标准正交方向的成分得二分之一负二分之一一，归一化得到一负一二除根号六，QR重构原列。':'Removing the first-direction component from (1,0,1) yields (1/2,−1/2,1); normalising gives (1,−1,2)/√6, with QR reconstructing the original columns.',body,350);
 body=text(380,30,zh?'竖直线段是坐标；正交成立在观测空间':'Vertical segments are coordinates; orthogonality is in observation space',19,'middle');
 body+=text(210,70,zh?'散点图：x–y 平面':'Scatter plot: x–y plane',21,'middle')+'<path d="M75,275H340M100,300V95" stroke="#94a3b8"/><path d="M100,205L280,145" stroke="#2563eb" stroke-width="3"/>';
 [[100,215,205],[190,155,175],[280,155,145]].forEach(([x,y,fit],i)=>{body+='<path d="M'+x+','+y+'V'+fit+'" stroke="#c2410c" stroke-width="4"/><circle cx="'+x+'" cy="'+y+'" r="5" fill="#1a2e4a"/>'+text(x,300,i,18,'middle');});
 body+=box(410,95,320,185)+text(570,133,zh?'观测向量：R³':'Observation vectors: R³',22,'middle')+text(570,181,'r=(−1/6,1/3,−1/6)',21,'middle')+text(570,228,'Xᵀr=(0,0)',25,'middle')+text(380,337,zh?'残差垂直设计列平面，而非每个散点图线段垂直拟合线。':'Residual ⟂ the design-column plane; individual plot segments need not ⟂ the fit line.',16,'middle');
 write(3,zh?'两种空间中的回归残差':'Regression residuals in two spaces',zh?'散点图显示三个竖直误差，观测三维残差负六分之一三分之一负六分之一与设计两列点积均零。':'The scatter plot shows three vertical errors. In R³, residual (−1/6,1/3,−1/6) has zero dot product with both design columns.',body,365);
 body=text(380,30,zh?'伪逆：先投影目标，再选择无零成分的权重':'Pseudoinverse: project the target, then choose weights with no null component',19,'middle');
 [[20,185,'y ∈ Rᵐ',zh?'任意目标':'Any target'],[280,200,'p ∈ C(X)',zh?'最近预测':'Closest prediction'],[555,185,'w_min ∈ R(X)',zh?'最小范数代表':'Minimum-norm representative']].forEach(([x,w,top,bottom])=>{body+=box(x,110,w,140)+text(x+w/2,163,top,23,'middle')+text(x+w/2,214,bottom,17,'middle');});
 body+=arrow(215,180,270,180)+arrow(490,180,545,180)+text(380,300,'XX⁺ = P_C;     X⁺X = P_R',26,'middle')+text(380,348,zh?'没有消除核，也没有使列空间外的目标精确可达。':'The kernel remains, and targets outside the column space remain unattainable.',18,'middle');
 write(4,zh?'伪逆的投影与提升':'Projection and lifting in the pseudoinverse',zh?'任意目标先到列空间最近预测，再用从行空间到列空间的限制逆提升为最小范数权重。':'Any target first projects to its closest column-space prediction, then the inverse restricted to the row space lifts it to minimum-norm weights.',body,380);
}
