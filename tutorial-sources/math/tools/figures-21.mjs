import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {text,box,svg} from './svg.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
for(const lang of ['en','zh']){
 const zh=lang==='zh',directory=path.join(ROOT,'src/figures',lang);fs.mkdirSync(directory,{recursive:true});
 const write=(n,title,description,body,height=350)=>fs.writeFileSync(path.join(directory,`fig-21-${n}.svg`),svg(title,description,body,height));
 let body=text(380,30,zh?'四个标签不意味着等概率':'Four labels need not have equal probabilities',24,'middle');
 [['HH',1],['HT',2],['TH',3],['TT',4]].forEach(([label,w],i)=>{body+=text(90,95+52*i,label,23,'middle')+box(140,68+52*i,w*110,36,'#dbeafe','#2563eb')+text(175+w*110,95+52*i,`${w}/10`,22);});
 body+=text(380,324,zh?'P(首H)=3/10；P(次H)=4/10；交集=1/10。':'P(first H)=3/10; P(second H)=4/10; intersection=1/10.',20,'middle');
 write(1,zh?'有限加权概率模型':'Finite weighted probability model',zh?'四结果HH HT TH TT质量分别十分之一、十分之二、十分之三、十分之四，条长度表示不等质量。':'The four outcomes HH, HT, TH, TT have masses one, two, three and four tenths; unequal bar lengths display the weighting.',body);
 body=text(380,30,zh?'每100,000记录的模型期望计数':'Model-expected counts per100,000 records',24,'middle');
 body+=text(320,88,zh?'阳性 +':'Positive +',22,'middle')+text(560,88,zh?'阴性 −':'Negative −',22,'middle');
 [['D','900','100'],[zh?'非D':'Not D','4,950','94,050']].forEach((r,i)=>{body+=text(85,156+80*i,r[0],22,'middle')+box(200,110+80*i,225,64,'#fff7ed','#c2410c')+box(445,110+80*i,225,64)+text(312,153+80*i,r[1],25,'middle')+text(557,153+80*i,r[2],25,'middle');});
 body+=text(380,289,'P(+|D)=900/1,000=.9',21,'middle')+text(380,329,'P(D|+)=900/5,850=2/13≈.153846',21,'middle');
 write(2,zh?'灵敏度与后验的不同分母':'Different sensitivity and posterior denominators',zh?'D行900阳性100阴性，非D行4950阳性94050阴性；灵敏度分母1000，后验分母5850，阳性质量零点零五八五。':'The D row has 900 positives and 100 negatives, not-D has 4,950 positives and 94,050 negatives; sensitivity divides by1,000, posterior by5,850, and positive mass is0.0585.',body);
 body=text(380,30,zh?'每对独立，但三重不独立':'Every pair independent, the triple dependent',24,'middle');
 [zh?'结果 (X,Y)':'Outcome (X,Y)','A: X=1','B: Y=1','C: xor=1'].forEach((h,i)=>{body+=text(110+180*i,84,h,i===0?18:20,'middle');});
 [['(0,0)','0','0','0'],['(0,1)','0','1','1'],['(1,0)','1','0','1'],['(1,1)','1','1','0']].forEach((r,j)=>{body+=box(30,100+43*j,700,38);r.forEach((s,i)=>{body+=text(110+180*i,126+43*j,s,21,'middle');});});
 body+=text(380,305,zh?'各边缘1/2；每对交1/4；三重交0≠1/8。':'Each marginal1/2; each pair joint1/4; triple joint0≠1/8.',19,'middle')+text(380,337,zh?'四个结果各质量1/4。':'Each of the four outcomes has mass1/4.',18,'middle');
 write(3,zh?'xor两两而非相互独立':'Xor pairwise but not mutual independence',zh?'公平独立二位的四行各质量四分之一；三个事件每个二分之一、每对四分之一，但没有三个都一的行。':'Four fair-bit outcomes each have mass one-quarter; three events each have mass one-half and every pair one-quarter, but no row has all three indicators one.',body,365);
 body=text(380,30,zh?'不同混合可反转汇总比较':'Different mixtures can reverse a pooled comparison',24,'middle');
 const rows=zh?['易组','难组','原汇总','共同半混合']:['Easy','Hard','Original pooled','Common half mixture'],vals=[[.9,.8],[.3,.2],[39/110,82/110],[.6,.5]];
 rows.forEach((label,i)=>{const y=79+56*i;body+=text(175,y+22,label,18,'end')+box(205,y,vals[i][0]*400,16,'#dbeafe','#2563eb')+box(205,y+21,vals[i][1]*400,16,'#fff7ed','#c2410c')+text(640,y+14,vals[i][0].toFixed(3),17)+text(640,y+35,vals[i][1].toFixed(3),17);});
 body+=text(380,334,zh?'蓝A、橙B；A多难记录，B多易记录。':'Blue A, orange B; A has more hard records, B more easy records.',18,'middle');
 write(4,zh?'选择混合与Simpson反转':'Selection mixtures and Simpson reversal',zh?'A每个难易组成功更高，却原汇总更低，因为评价权重不同；共同半易半难时A零点六高于B零点五。':'A succeeds more often within both difficulty groups but less often in its original pooled sample because group weights differ; a common half-and-half mixture gives A0.6 versus B0.5.',body,360);
}
