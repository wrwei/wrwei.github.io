import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {text,box,arrow,svg} from './svg.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
for(const lang of ['en','zh']){
  const zh=lang==='zh',directory=path.join(ROOT,'src/figures',lang);fs.mkdirSync(directory,{recursive:true});
  const write=(n,title,description,body,height)=>fs.writeFileSync(path.join(directory,`fig-06-${n}.svg`),svg(title,description,body,height));
  let body=text(380,30,zh?'相同 n，不同增长；数值并非运行秒数':'Same n, different growth; values are not elapsed seconds',19,'middle');
  ['n','log₂ n','n','n log₂ n','n²','2ⁿ'].forEach((label,i)=>body+=text(65+i*125,78,label,19,'middle'));
  [4,8,16].forEach((n,r)=>{const values=[n,Math.log2(n),n,n*Math.log2(n),n*n,2**n];values.forEach((v,i)=>body+=text(65+i*125,126+r*61,v,21,'middle'));});
  body+=text(380,318,zh?'有限表说明数量；无限增长关系仍需证明。':'Finite tables illustrate counts; growth relations still need proof.',17,'middle');
  write(1,zh?'增长数量比较':'Growth-count comparison',zh?'n 为 4、8、16 时分别列对数、线性、n log n、平方与指数的精确数值。':'At n = 4, 8, 16 the rows show logarithmic, linear, n log n, quadratic, and exponential counts.',body,350);
  body=text(380,30,zh?'量词顺序控制界的强度':'Quantifier order controls the strength of a bound',21,'middle');
  body+=box(35,65,690,100)+text(60,98,'O(g):  ∃c > 0   ∃n₀   ∀n ≥ n₀',23)+text(60,138,zh?'固定一个比例，覆盖全部后续输入':'Fix one factor covering every sufficiently large input',18);
  body+=box(35,195,690,100,'#f0fdf4','#15803d')+text(60,228,'o(g):  ∀ε > 0   ∃n₀(ε)   ∀n ≥ n₀(ε)',23)+text(60,268,zh?'任意小比例，都能选后续范围':'For every positive factor, choose a sufficient threshold',18);
  write(2,zh?'O 与小 o 的量词':'Quantifiers in O and little o',zh?'O 先存在一个正常数；小 o 为每个正 epsilon 选阈值，两者都覆盖全部后续 n。':'Big O chooses one positive constant; little o chooses a threshold for each positive epsilon. Both cover all subsequent n.',body);
  body=text(380,30,zh?'T(n) = 2T(n/2) + n，T(1) = 1，n = 8':'T(n) = 2T(n/2) + n, T(1) = 1, n = 8',20,'middle');
  const levels=[[350],[225,475],[162.5,287.5,412.5,537.5],[131.25,193.75,256.25,318.75,381.25,443.75,506.25,568.75]];
  levels.forEach((xs,j)=>{const y=75+j*65;xs.forEach((x,i)=>{if(j)body+=arrow(levels[j-1][Math.floor(i/2)],y-48,x,y-17);body+=box(x-21,y-13,42,30)+text(x,y+8,8/2**j,18,'middle');});body+=text(45,y+8,'j='+j,17)+text(675,y+8,'= 8',19,'middle');});
  body+=text(380,337,zh?'三非叶层各八 + 八单位叶 = 32':'Three nonleaf levels of eight + eight unit leaves = 32',18,'middle');
  write(3,zh?'按层计算递归工作':'Recursion work by level',zh?'输入八，三非叶层各成本八，八单位叶另成本八，合计三十二。':'Input eight has three nonleaf levels costing eight each and eight unit leaves costing eight more, total thirty-two.',body,365);
  body=text(380,30,zh?'追加主体：写一项，扩容时再复制旧项':'Append: write one item, plus old-item copies at resize',19,'middle');
  for(let i=1;i<=9;i++){const copies=[2,3,5,9].includes(i)?i-1:0,x=40+(i-1)*76,height=(copies+1)*18;body+='<rect x="'+x+'" y="'+(235-height)+'" width="45" height="'+height+'" fill="#c2410c"/>'+text(x+22,261,i,17,'middle')+text(x+22,222-height,copies+1,16,'middle');}
  body+=text(380,292,zh?'追加编号（柱高为本次复制 + 新写）':'Append number (bar height = copies + new write)',16,'middle')+text(380,331,zh?'九次总成本 24 < 27；第九次本身成本九。':'Nine appends cost 24 < 27; append nine alone costs nine.',18,'middle');
  write(4,zh?'复制突发与总成本':'Copy bursts and aggregate cost',zh?'容量一开始，九次追加成本依次一、二、三、一、五、一、一、一、九，总二十四。':'Starting capacity one, nine append costs are 1, 2, 3, 1, 5, 1, 1, 1, 9, totalling 24.',body,365);
}
