import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {text,box,arrow,svg} from './svg.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
for(const lang of ['en','zh']){
  const zh=lang==='zh',directory=path.join(ROOT,'src/figures',lang);fs.mkdirSync(directory,{recursive:true});
  const write=(n,title,description,body,height)=>fs.writeFileSync(path.join(directory,`fig-07-${n}.svg`),svg(title,description,body,height));
  const graph={A:['B','C'],B:['A','D'],C:['A','D'],D:['B','C','E'],E:['D'],F:[]};
  let body=text(170,30,zh?'邻接列表':'Adjacency lists',21,'middle')+text(545,30,zh?'同图的矩阵':'Matrix of the same graph',21,'middle');
  Object.keys(graph).forEach((u,i)=>{body+=text(35,85+i*38,u+': ['+graph[u].join(', ')+']',20);body+=text(390,85+i*38,u,18);body+=text(425+i*52,55,u,18,'middle');Object.keys(graph).forEach((v,j)=>body+=text(425+j*52,85+i*38,Number(graph[u].includes(v)),19,'middle'));});
  body+=text(380,338,zh?'F 是现存孤立点；无向每边在列表中出现两次。':'F is present and isolated; each undirected edge appears twice.',17,'middle');
  write(1,zh?'保留孤立点的图表示':'Graph representations preserve isolated vertices',zh?'六点列表及六乘六对称矩阵表示五边 AB、AC、BD、CD、DE。F 行列为零。':'Six lists and a symmetric six-by-six matrix represent edges AB, AC, BD, CD, DE. F has a zero row and column.',body,365);
  body=text(190,30,zh?'五点四边':'Five vertices, four edges',19,'middle')+text(570,30,zh?'删 E：四点三边':'Remove E: four vertices, three edges',19,'middle');
  for(let side=0;side<2;side++){
    const positions={A:[75+side*380,110],B:[175+side*380,70],C:[175+side*380,180],D:[275+side*380,145],E:[275+side*380,240]};
    ['AB','AC','CD',...(side?[]:['CE'])].forEach(([u,v])=>{const p=positions[u],q=positions[v];body+='<path d="M'+p.join(',')+'L'+q.join(',')+'" stroke="#2563eb" stroke-width="3"/>';});
    ['A','B','C','D',...(side?[]:['E'])].forEach(v=>{const p=positions[v];body+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="17" fill="'+(v==='E'?'#fff7ed':'#f0f9ff')+'" stroke="#2563eb"/>'+text(p[0],p[1]+6,v,18,'middle');});
  }
  body+=text(380,309,zh?'余点路径仍存在；基础：单点零边。':'Remaining paths survive; base case: one vertex, zero edges.',17,'middle');
  write(2,zh?'删叶归纳':'Induction by leaf deletion',zh?'树边 AB、AC、CD、CE，删叶 E 与 CE，剩四点三边连通无环。':'A tree with edges AB, AC, CD, CE loses leaf E and edge CE, leaving four vertices and three edges, still connected and acyclic.',body,340);
  body=text(380,30,zh?'按距离分层：父边给最短边数证书':'Distance layers: parent edges certify minimum edge counts',19,'middle');
  const p={A:[80,160],B:[255,100],C:[255,220],D:[430,160],E:[605,160],F:[670,290]};
  ['AB','AC','BD','CD','DE'].forEach(([u,v])=>body+='<path d="M'+p[u].join(',')+'L'+p[v].join(',')+'" stroke="'+(u==='C'?'#94a3b8':'#2563eb')+'" stroke-width="3"/>');
  Object.keys(p).forEach(v=>body+='<circle cx="'+p[v][0]+'" cy="'+p[v][1]+'" r="22" fill="#f0f9ff" stroke="#2563eb"/>'+text(p[v][0],p[v][1]+7,v,20,'middle'));
  [0,1,2,3].forEach((d,i)=>body+=text(80+i*175,68,'d='+d,19,'middle'));
  body+=text(360,307,zh?'F 从 A 不可达，不应标零。':'F is unreachable from A; its distance is not zero.',17,'middle');
  write(3,zh?'BFS 距离层':'BFS distance layers',zh?'A 距离零，B,C 一，D 二，E 三，F 不可达。CD 为非父边，其他边给父路径。':'A has distance zero, B and C one, D two, E three, and F is unreachable. CD is a nonparent edge; the others certify parent paths.',body,350);
  body=text(380,30,zh?'完整状态 = 控制、发送次数、确认标志':'Complete state = control, send count, acknowledgement flag',19,'middle');
  const nodes=[['idle,0,F',35,75],['waiting,1,F',285,75],['waiting,2,F',285,205],['idle,1,T',535,75],['idle,2,T',535,205],['idle,2,F',285,345]];
  nodes.forEach(([label,x,y],i)=>{body+=box(x,y,185,55,i===5?'#fff1f2':'#f0f9ff',i===5?'#be123c':'#2563eb')+text(x+92,y+34,label,18,'middle');});
  body+=arrow(225,102,275,102)+text(250,91,'send',14,'middle')+arrow(377,135,377,195)+text(405,170,'retry',15)+arrow(475,102,525,102)+text(500,90,'ack',14,'middle')+arrow(475,232,525,232)+text(500,220,'ack',14,'middle')+arrow(377,265,377,335)+text(405,298,zh?'错误 timeout':'faulty timeout',15);
  body+='<path d="M315,260C200,320 200,190 285,220" fill="none" stroke="#15803d" stroke-width="2.5" marker-end="url(#arrow)"/>'+text(50,305,zh?'修复 timeout：保持 waiting':'Repair timeout: stay waiting',15)+text(380,438,zh?'红态不安全；安全自环仍可能永远等待。':'Red state is unsafe; a safe self-loop can still wait forever.',17,'middle');
  write(4,zh?'重试协议的乘积状态':'Product states in the retry protocol',zh?'send、retry、timeout 给未确认空闲坏态。ack 给两个已确认态；修复 timeout 保持第二等待态。':'Send, retry, timeout reach unacknowledged idle. Acknowledgement reaches two acknowledged states; repaired timeout stays in the second waiting state.',body,465);
}
