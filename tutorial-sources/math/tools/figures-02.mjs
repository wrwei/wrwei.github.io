import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {text,box,arrow,svg} from './svg.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
for(const lang of ['en','zh']){
  const zh=lang==='zh',directory=path.join(ROOT,'src/figures',lang);
  fs.mkdirSync(directory,{recursive:true});
  function write(n,title,description,body,height){fs.writeFileSync(path.join(directory,`fig-02-${n}.svg`),svg(title,description,body,height));}
  let body=text(70,40,'p',20)+text(190,40,'q',20)+text(380,40,'p ⇒ q',20,'middle')+text(590,40,'q ⇒ p',20,'middle');
  [[false,false],[false,true],[true,false],[true,true]].forEach(([p,q],i)=>{let y=65+i*58;body+=box(35,y,680,45,p&&!q?'#fff1f2':'#f0fdf4',p&&!q?'#be123c':'#15803d');body+=text(70,y+29,p?'T':'F',20)+text(190,y+29,q?'T':'F',20)+text(380,y+29,(!p||q)?'T':'F',20,'middle')+text(590,y+29,(!q||p)?'T':'F',20,'middle');});
  write(1,zh?'蕴含与逆命题':'Implication and converse',zh?'按 FF、FT、TF、TT 排列，原蕴含为 T、T、F、T，逆命题为 T、F、T、T。红行违反原蕴含。':'Rows FF, FT, TF, TT give T, T, F, T for implication and T, F, T, T for its converse. Red marks the violation of the original implication.',body);
  body=box(40,35,280,85)+text(180,68,'p ⇒ q',24,'middle')+text(180,97,zh?'原命题':'Original',16,'middle')+box(440,35,280,85)+text(580,68,'¬q ⇒ ¬p',24,'middle')+text(580,97,zh?'逆否命题':'Contrapositive',16,'middle')+arrow(325,77,432,77)+text(380,52,'≡',21,'middle');
  body+=box(40,210,280,85,'#fff7ed','#c2410c')+text(180,243,'q ⇒ p',24,'middle')+text(180,272,zh?'逆命题':'Converse',16,'middle')+box(440,210,280,85,'#fff7ed','#c2410c')+text(580,243,'¬p ⇒ ¬q',24,'middle')+text(580,272,zh?'否命题':'Inverse',16,'middle')+arrow(325,252,432,252)+text(380,227,'≡',21,'middle')+text(380,171,zh?'两组一般不等价':'The two groups need not agree',18,'middle');
  write(2,zh?'两组等价式':'Two equivalence groups',zh?'原命题等价于逆否命题，逆命题等价于否命题，但两组一般不同。':'Original and contrapositive agree; converse and inverse agree. The groups are not generally equivalent.',body);
  body=text(320,45,'a',22,'middle')+text(475,45,'b',22,'middle');
  [[true,false],[false,true]].forEach((row,i)=>{body+=text(155,112+i*80,`r${i+1}`,22,'middle');row.forEach((value,j)=>{let x=260+j*155,y=73+i*80;body+=box(x,y,120,62,value?'#f0fdf4':'#fff1f2',value?'#15803d':'#be123c')+text(x+60,y+39,value?'T':'F',25,'middle');});});
  body+=text(380,270,zh?'每行有 T：∀r ∃v 为真':'Each row has T: ∀r ∃v is true',19,'middle')+text(380,305,zh?'无全 T 列：∃v ∀r 为假':'No all-T column: ∃v ∀r is false',19,'middle');
  write(3,zh?'局部与公共见证':'Local and common witnesses',zh?'r1 只有 a，r2 只有 b。每个请求有审核人，但没有一位审核人覆盖全部请求。':'Only r1-a and r2-b are true. Every request has a reviewer, but no reviewer covers both requests.',body);
  body=box(35,40,320,245)+text(195,76,zh?'有限布尔论域':'Finite Boolean domain',20,'middle')+text(195,115,'FF, FT, TF, TT',21,'middle')+text(195,165,zh?'检查全部四行':'Check all four rows',18,'middle')+text(195,211,zh?'可确立命题有效性':'Can establish validity',17,'middle');
  body+=box(405,40,320,245,'#fff7ed','#c2410c')+text(565,76,zh?'无限整数论域':'Infinite integer domain',20,'middle')+text(565,115,'…, −2, −1, 0, 1, 2, …',18,'middle')+text(565,165,zh?'只检查有限区间':'Check a finite interval',18,'middle')+text(565,211,zh?'其余输入仍未解决':'Other inputs remain open',17,'middle');
  write(4,zh?'穷尽与抽查的区别':'Exhaustion and finite sampling',zh?'四行布尔表可穷尽两个命题字母的赋值；有限整数区间不穷尽所有整数。':'Four Boolean rows exhaust two proposition letters. A finite interval does not exhaust all integers.',body);
}
