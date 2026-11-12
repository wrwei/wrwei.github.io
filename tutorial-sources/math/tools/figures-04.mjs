import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {text,box,arrow,svg} from './svg.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
for(const lang of ['en','zh']){
  const zh=lang==='zh',directory=path.join(ROOT,'src/figures',lang);
  fs.mkdirSync(directory,{recursive:true});
  function write(n,title,description,body,height){fs.writeFileSync(path.join(directory,`fig-04-${n}.svg`),svg(title,description,body,height));}
  let body='';
  const steps=zh?['任意允许输入','展开假设','应用定义与规则','确立结论']:['Arbitrary allowed inputs','Unpack hypotheses','Definitions and rules','Establish conclusion'];
  steps.forEach((label,i)=>{const x=25+i*187;body+=box(x,85,158,90)+text(x+79,138,label,zh?18:12,'middle');if(i<3)body+=arrow(x+160,130,x+184,130);});
  body+=text(380,235,zh?'每个步骤都需要理由；输入的任意性决定覆盖范围':'Every step needs a reason; arbitrary inputs determine coverage',18,'middle');
  write(1,zh?'证明的结构':'Proof architecture',zh?'从任意允许输入到假设、定义和有效规则，再到结论。':'Arbitrary allowed inputs, hypotheses, definitions and rules, then conclusion.',body);
  body=text(380,42,zh?'基础与后继步缺一不可':'Both base and successor step are needed',20,'middle');
  ['P(0)','P(1)','P(2)','P(3)','…'].forEach((label,i)=>{const x=30+i*145;body+=box(x,95,115,70,i===0?'#f0fdf4':'#f0f9ff',i===0?'#15803d':'#0ea5e9')+text(x+57,138,label,24,'middle');if(i<4)body+=arrow(x+117,130,x+139,130);});
  body+=text(90,203,zh?'基础已证明':'Base proved',15,'middle')+text(395,203,zh?'每步：假设 P(k)，推出 P(k+1)':'Each step: assume P(k), derive P(k+1)',16,'middle')+text(380,285,zh?'错误 n²+1：步能延续，但基础 0 ≠ 1':'Faulty n²+1: consistent step, but base 0 ≠ 1',19,'middle');
  write(2,zh?'归纳链与缺失基础':'Induction chain and missing base',zh?'证明 P0 并通过逐项后继步覆盖全部自然数。错误奇数和的基础失败，尽管步一致。':'P0 and immediate successor implications cover the naturals. The faulty odd-sum base fails even though its step is consistent.',body);
  body=box(35,45,205,190)+text(137,84,zh?'基础：空列表':'Base: empty list',20,'middle')+text(137,144,'[]',30,'middle')+text(137,196,'length = 0',18,'middle')+box(335,45,390,190)+text(530,84,zh?'构造：头与较小尾':'Constructor: head and smaller tail',19,'middle')+text(530,135,'h :: t',29,'middle')+text(530,179,zh?'归纳假设在 t 上':'Induction hypothesis on t',18,'middle')+text(530,213,'length = 1 + length(t)',18,'middle')+arrow(245,140,325,140)+text(380,294,zh?'证明构造保持性质，不假设整个新列表的结论':'Prove the constructor preserves the property',18,'middle');
  write(3,zh?'列表结构归纳':'List structural induction',zh?'空列表基础长度零；头尾构造使用尾的假设并增加一个头。':'Empty-list base has length zero. The head-tail constructor uses the smaller-tail hypothesis and adds one.',body);
  body=text(380,28,zh?'a = [2, 5, 2, 7]，目标 3 缺失':'a = [2, 5, 2, 7], target 3 is absent',20,'middle')+text(70,67,'i',17)+text(380,67,zh?'已处理前缀':'Processed prefix',17,'middle')+text(650,67,'n − i',17,'middle');
  for(let i=0;i<=4;i++){const y=82+i*49;body+=text(75,y+26,i,20,'middle')+text(655,y+26,4-i,20,'middle');[2,5,2,7].forEach((v,j)=>{const x=180+j*95;body+=box(x,y,75,38,j<i?'#f0fdf4':'#f8fafc',j<i?'#15803d':'#cbd5e1')+text(x+37,y+26,v,19,'middle');});}
  body+=text(380,368,zh?'前缀无目标始终成立；变式严格递减至零':'No prefix match persists; the variant strictly decreases to zero',17,'middle');
  write(4,zh?'搜索不变式与变式':'Search invariant and variant',zh?'i 从零到四，已处理前缀扩大且无三，n−i 从四到零。':'i goes from zero to four; the processed prefix grows without a three, while n-i falls from four to zero.',body,395);
}
