import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {text,box,arrow,svg} from './svg.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
for(const lang of ['en','zh']){
  const zh=lang==='zh',directory=path.join(ROOT,'src/figures',lang);fs.mkdirSync(directory,{recursive:true});
  const write=(n,title,description,body,height)=>fs.writeFileSync(path.join(directory,`fig-05-${n}.svg`),svg(title,description,body,height));
  let body=text(380,28,zh?'每位置二选一，三位置共八叶':'Two options per position, three positions, eight leaves',19,'middle');
  const levels=[[380],[190,570],[95,285,475,665],[47.5,142.5,237.5,332.5,427.5,522.5,617.5,712.5]];
  levels.forEach((points,depth)=>{const y=70+depth*66;points.forEach((x,i)=>{if(depth<3)body+='<circle cx="'+x+'" cy="'+y+'" r="5" fill="#1a2e4a"/>';else body+=text(x,y+7,i.toString(2).padStart(3,'0'),20,'middle');if(depth>0){const px=levels[depth-1][Math.floor(i/2)],py=y-66;body+='<path d="M'+px+','+py+'L'+x+','+(y-12)+'" stroke="#2563eb" fill="none"/>'+text((px+x)/2+(i%2?7:-7),(py+y)/2,i%2,14,'middle');}});});
  write(1,zh?'三位二进制决策树':'Three-bit decision tree',zh?'根逐次选择零或一，叶为 000 到 111 八个有序串。':'At each level choose zero or one; the eight leaves are the strings 000 through 111.',body,320);
  body=text(200,35,zh?'有序表示':'Ordered representations',20,'middle')+text(570,35,zh?'无序结果':'Unordered outcomes',20,'middle');
  [['AB, BA','{A, B}'],['AC, CA','{A, C}'],['BC, CB','{B, C}']].forEach(([orders,subset],i)=>{const y=65+i*78;body+=box(45,y,310,58)+text(200,y+37,orders,25,'middle')+arrow(360,y+29,440,y+29)+box(450,y,245,58,'#f0fdf4','#15803d')+text(570,y+37,subset,25,'middle');});
  write(2,zh?'顺序被遗忘后的子集':'Forgetting order to obtain subsets',zh?'AB 与 BA、AC 与 CA、BC 与 CB 分别合并；每子集两表示。':'AB and BA, AC and CA, BC and CB each merge to one subset. Every subset has two representations.',body);
  body=text(380,40,zh?'五个相同任务，两个隔板':'Five identical tasks, two bars',21,'middle');
  ['★','★','|','★','|','★','★'].forEach((value,i)=>{let x=55+i*100;body+=box(x,85,65,70,value==='|'?'#f0f9ff':'#fff7ed',value==='|'?'#2563eb':'#c2410c')+text(x+32,133,value,32,'middle',value==='|'?'#2563eb':'#c2410c');});
  body+=text(380,220,'(2, 1, 2)',30,'middle')+text(380,280,zh?'七个位置选两个板：C(7,2) = 21':'Choose two bar positions out of seven: C(7,2) = 21',18,'middle');
  write(3,zh?'隔板法编码':'Stars and bars encoding',zh?'星星、板、星、板、星星编码三个具名工人的份额 2、1、2。':'Two stars, bar, one star, bar, two stars encode the named-worker allocation (2,1,2).',body);
  body=box(40,45,680,235)+text(380,83,zh?'完整均匀样本空间：64 元组':'Complete uniform sample space: 64 triples',21,'middle')+box(80,112,270,130,'#f0fdf4','#15803d')+text(215,154,zh?'全不同：24':'All distinct: 24',22,'middle')+text(215,207,'4 × 3 × 2',22,'middle')+box(410,112,270,130,'#fff7ed','#c2410c')+text(545,154,zh?'至少一碰撞：40':'At least one collision: 40',17,'middle')+text(545,207,'64 − 24',22,'middle')+text(380,320,zh?'等权模型下：P(碰撞) = 40/64 = 5/8':'Under equal weights: P(collision) = 40/64 = 5/8',18,'middle');
  write(4,zh?'用补集计算碰撞':'Collision counting by complement',zh?'三具名项独立均匀选四桶，64 结果中 24 全不同，40 碰撞。':'Three named items independently and uniformly choose four buckets: 24 of 64 outcomes are distinct and 40 collide.',body,350);
}
