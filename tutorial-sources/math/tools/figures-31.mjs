import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {text,box,arrow,svg} from './svg.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
for(const lang of ['en','zh']){
 const zh=lang==='zh',dir=path.join(ROOT,'src/figures',lang);fs.mkdirSync(dir,{recursive:true});
 const write=(n,title,desc,body)=>fs.writeFileSync(path.join(dir,`fig-31-${n}.svg`),svg(title,desc,body,350));
 let body=text(380,29,zh?'关键路径总工期 14；无限工作者':'Critical path duration 14; unlimited workers',22,'middle');
 const nodes={A:[65,145,2],B:[200,72,3],C:[200,205,4],D:[335,145,2],E:[450,145,1],F:[560,145,2],H:[680,145,3],G:[450,275,5]};
 const edges=[['A','B'],['A','C'],['B','D'],['C','D'],['D','E'],['E','F'],['F','H']];
 edges.forEach(([a,b])=>{let [x,y]=nodes[a],[u,v]=nodes[b];body+=arrow(x+35,y,u-35,v);});
 Object.entries(nodes).forEach(([id,[x,y,d]])=>{let critical=['A','C','D','E','F','H'].includes(id);body+=box(x-32,y-25,64,50,critical?'#faf5ff':'#f0f9ff',critical?'#7e22ce':'#0284c7')+text(x,y+7,id+':'+d,21,'middle');});
 body+=text(380,333,zh?'紫框路径 A→C→D→E→F→H；G 孤立。':'Purple path A→C→D→E→F→H; G is isolated.',19,'middle');
 write(1,zh?'八任务依赖图及关键路径':'Eight-task dependency graph and critical path',zh?'A 分叉到 B C，汇合 D 后 E F H；G 孤立。紫色框的 A C D E F H 工期和十四。':'A branches to B and C, joins at D then proceeds through E,F,H; G is isolated. Purple boxes mark A,C,D,E,F,H whose durations sum to fourteen.',body);
 body=text(380,30,zh?'两条证明与一条证书':'Two proofs and a certificate',23,'middle');
 [[70,zh?'剩余前驱计数=0 ⇒ 全前驱已输出':'Remaining indegree=0 ⇒ all predecessors emitted'],[160,zh?'F(v)=d(v)+max 前驱完成时间':'F(v)=d(v)+max predecessor finish'],[250,zh?'沿最大前驱追踪 ⇒ 路径和=T':'Trace maximum predecessors ⇒ path sum=T']].forEach(([y,label])=>{body+=box(35,y,690,63)+text(380,y+39,label,21,'middle');});
 write(2,zh?'顺序工期证明链':'Order and finish proof chain',zh?'就绪入度证明优先顺序，最早完成归纳使用无限工作者，最大父指针路径给达到总工期的证书。':'Ready indegree proves precedence, earliest-finish induction uses unlimited workers, and maximum-parent tracing certifies a path attaining makespan.',body);
 body=text(380,30,zh?'有限模和不能保证完整性':'A finite modular sum cannot guarantee integrity',23,'middle');
 [[65,'A:1,B:2','132'],[150,'A:2,B:2','133'],[235,'A:2,B:1','132']].forEach(([y,records,residue])=>{body+=box(35,y,690,63)+text(55,y+40,records,24)+text(700,y+40,'sum(bytes) mod257 = '+residue,22,'end');});
 body+=text(380,333,zh?'首行末行记录不同，校验和相同。':'First and last records differ while checksums match.',19,'middle');
 write(3,zh?'补偿字节修改的碰撞':'Collision by compensating byte changes',zh?'原 A一B二余数一三二，单改 A二得一三三，再改 B一恢复一三二而记录不同。':'Original A-one B-two has residue one-three-two; changing A to two gives one-three-three; changing B to one restores one-three-two despite different records.',body);
 body=text(380,30,zh?'相同边际，不同完成 PMF':'Same marginals, different completion PMFs',23,'middle')+'<path d="M70,70V265H700" fill="none" stroke="#64748b"/>';
 [3,5].forEach((t,i)=>{let x=185+i*300;[[0,i?.75:.25,'#0284c7'],[70,.5,'#7e22ce']].forEach(([off,mass,col])=>{body+=`<rect x="${x+off}" y="${265-220*mass}" width="50" height="${220*mass}" fill="${col}"/>`+text(x+off+25,250-220*mass,mass,21,'middle');});body+=text(x+60,300,'T='+t,22,'middle');});
 body+=text(380,335,zh?'蓝：独立 E[T]=4.5；紫：共享 E[T]=4':'Blue: independent E[T]=4.5; purple: shared E[T]=4',19,'middle');
 write(4,zh?'菱形工期的精确分布':'Exact diamond completion distributions',zh?'完成三与五的独立质量四分一四分三，共享质量各半，相同边际却均值四点五与四。':'Completion at three and five has independent masses one-quarter and three-quarters, versus shared masses one-half each, giving means four point five and four despite identical marginals.',body);
}
