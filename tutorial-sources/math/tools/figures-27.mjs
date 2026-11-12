import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {text,box,arrow,svg} from './svg.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
for(const lang of ['en','zh']){
 const zh=lang==='zh',directory=path.join(ROOT,'src/figures',lang);fs.mkdirSync(directory,{recursive:true});
 const write=(n,title,description,body,height=350)=>fs.writeFileSync(path.join(directory,`fig-27-${n}.svg`),svg(title,description,body,height));
 let body=text(380,30,zh?'前缀叶码 0、10、11':'Prefix leaf code 0,10,11',23,'middle');
 body+='<path d="M380,70L155,151M380,70L510,151M510,151L420,241M510,151L630,241" fill="none" stroke="#0284c7" stroke-width="3"/>';
 body+=text(265,99,'0',20)+text(463,99,'1',20)+text(445,198,'0',20)+text(582,198,'1',20);
 [[380,70],[510,151]].forEach(([x,y])=>{body+=`<circle cx="${x}" cy="${y}" r="7" fill="#0284c7"/>`;});
 [[155,151,'a: 0; p=1/2'],[420,241,'b: 10; p=1/4'],[630,241,'c: 11; p=1/4']].forEach(([x,y,label])=>{body+=`<circle cx="${x}" cy="${y}" r="7" fill="#15803d"/>`+text(x,y+32,label,19,'middle');});
 body+=text(380,327,'E[length] = .5×1 + .25×2 + .25×2 = 1.5 bits',21,'middle');
 write(1,zh?'三符号前缀码树':'Three-symbol prefix-code tree',zh?'根的零分支直接到 a，右一分支再分零到 b、一到 c，码字零一零一一无前缀冲突，平均一点五比特。':'The root zero branch reaches a; the one branch splits into zero for b and one for c. Codewords zero, one-zero, one-one are prefix-free and average one point five bits.',body);
 body=text(380,30,zh?'源权重乘预测自信息':'Source weights multiply predicted surprisal',23,'middle');
 [zh?'类别':'Category','p','q','−log₂q','p(−log₂q)'].forEach((s,i)=>{body+=text(85+145*i,78,s,19,'middle');});
 [['a','.5','.25','2','1'],['b','.3','.5','1','.3'],['c','.2','.25','2','.4']].forEach((row,j)=>{body+=box(25,98+j*51,710,43);row.forEach((s,i)=>{body+=text(85+145*i,127+j*51,s,21,'middle');});});
 body+=text(380,292,'H₂(p,q) = 1.7 = H₂(p) + D₂(p||q)',21,'middle')+text(380,331,'1.7 = 1.485475 + .214525 bits',21,'middle');
 write(2,zh?'交叉熵与方向错配':'Cross-entropy and directional mismatch',zh?'三类源点五点三点二加权预测点二五点五点二五的自信息二一二，交叉熵一点七比特，分成源熵与正向散度。':'Source probabilities point five, point three, point two weight prediction surprisal two, one, two; cross-entropy one point seven bits splits into source entropy and forward divergence.',body);
 body=text(380,30,zh?'处理链的条件必须成立':'State the processing-chain condition',23,'middle');
 [[30,'X'],[275,'Y'],[520,'Z']].forEach(([x,label])=>{body+=box(x,85,210,90)+text(x+105,141,label,30,'middle');});
 body+=arrow(245,130,265,130)+arrow(490,130,510,130)+text(380,220,zh?'给定 Y 后，X 与 Z 条件独立。':'X and Z are conditionally independent given Y.',21,'middle')+text(380,266,'I(X;Z) ≤ I(X;Y)',25,'middle')+text(380,319,zh?'新随机噪声可增 H(Z)，却不增关于 X 的信息。':'Fresh noise can increase H(Z) without increasing information about X.',18,'middle');
 write(3,zh?'有限数据处理关系':'Finite data-processing relation',zh?'输入 X 到中间 Y 再到 Z，给 Y 后 X Z 条件独立，X Z 信息不高于 X Y；不能将它误读成输出熵必降。':'Input X passes through Y to Z, with X and Z conditionally independent given Y; information X-Z does not exceed X-Y, without asserting every output entropy decreases.',body);
 body=text(380,30,zh?'同一字符串概率，不同平均单位':'Same string probability, different averaging units',23,'middle')+text(380,74,'q(raw string)=1/16; total NLL=log16',22,'middle');
 [[2,'log4',4],[4,'log2',2]].forEach(([n,loss,ppl],i)=>{body+=box(30,104+86*i,700,68,i?'#faf5ff':'#f0f9ff')+text(55,144+86*i,zh?n+' 个计分词元':n+' scored tokens',21)+text(700,144+86*i,'mean='+loss+'; perplexity='+ppl,21,'end');});
 body+=text(380,311,zh?'匹配分词、底、位置与上下文后再比较。':'Match tokenisation, base, positions and context before comparing.',19,'middle');
 write(4,zh?'困惑度分母与单位':'Perplexity denominator and units',zh?'同一原字符串概率十六分之一，两词元平均 log 四困惑度四，四词元平均 log 二困惑度二；概率没有改善。':'The same raw-string probability one-sixteenth gives perplexity four when scored as two tokens and two when scored as four; string probability has not improved.',body);
}
