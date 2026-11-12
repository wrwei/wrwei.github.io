import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {text,box,arrow,svg} from './svg.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
for(const lang of ['en','zh']){
  const zh=lang==='zh',directory=path.join(ROOT,'src/figures',lang);fs.mkdirSync(directory,{recursive:true});
  const write=(n,title,description,body,height)=>fs.writeFileSync(path.join(directory,`fig-08-${n}.svg`),svg(title,description,body,height));
  let body=text(380,35,zh?'带余除法：0 ≤ r < 7':'Quotient and remainder: 0 ≤ r < 7',22,'middle');
  [0,1].forEach(i=>{body+=box(50+i*255,80,225,110);for(let j=0;j<7;j++)body+='<circle cx="'+(75+i*255+j*28)+'" cy="120" r="8" fill="#2563eb"/>';body+=text(160+i*255,168,'7',24,'middle');});
  body+=box(560,80,150,110,'#fff7ed','#c2410c');for(let i=0;i<3;i++)body+='<circle cx="'+(600+i*32)+'" cy="120" r="8" fill="#c2410c"/>';
  body+=text(635,168,'3',24,'middle')+text(380,237,'17 = 2 × 7 + 3',25,'middle')+text(380,300,'−17 = (−3) × 7 + 4',25,'middle');
  write(1,zh?'唯一商余数':'Unique quotient and remainder',zh?'十七个点分成两组七与余三，负十七对应商负三余四，均符合余数范围。':'Seventeen dots form two groups of seven and three left over. Negative seventeen has quotient negative three and remainder four under the same range.',body);
  body=text(380,35,zh?'相同共同因数，第二分量严格降':'Same common divisors; strictly decreasing second component',19,'middle');
  [[252,105,2,42],[105,42,2,21],[42,21,2,0]].forEach(([a,b,q,r],i)=>{const y=75+i*65;body+=box(60,y,640,47)+text(380,y+31,a+' = '+q+' × '+b+' + '+r,23,'middle');});
  body+=text(380,301,'21 = −2 × 252 + 5 × 105',24,'middle')+text(380,336,zh?'回代给证书；不是只看猜测 gcd。':'Back-substitution gives a certificate, not merely a guessed gcd.',17,'middle');
  write(2,zh?'欧几里得与贝祖跟踪':'Euclid and Bézout trace',zh?'252、105 经余数 42、21、0，得到 gcd 二十一，贝祖系数负二与五。':'252 and 105 produce remainders 42, 21, 0; the gcd is 21 with Bézout coefficients negative two and five.',body,365);
  body=text(380,30,zh?'乘法是否能反转，由 gcd 决定':'The gcd determines whether multiplication can be reversed',20,'middle');
  [[3,7,70],[2,6,225]].forEach(([a,m,y])=>{body+=text(30,y,a+' × r mod '+m,19);for(let r=0;r<m;r++){const x=65+r*99;body+=text(x,y+32,r,20,'middle')+arrow(x,y+42,x,y+76)+box(x-21,y+85,42,35,(a*r%m===1)?'#f0fdf4':'#f0f9ff',(a*r%m===1)?'#15803d':'#2563eb')+text(x,y+109,a*r%m,21,'middle');}});
  body+=text(380,395,zh?'模七乘三是排列；模六乘二重复输出。':'Times three mod seven permutes; times two mod six repeats.',17,'middle');
  write(3,zh?'可逆与不可逆乘法映射':'Invertible and noninvertible multiplication maps',zh?'模七乘三输出零三六二五一四各一次；模六乘二输出零二四零二四，无一。':'Times three mod seven yields 0,3,6,2,5,1,4 once each. Times two mod six yields 0,2,4,0,2,4 and never one.',body,425);
  body=text(380,35,zh?'先限定代表范围：0 到 14':'First fix a representative range: zero through fourteen',21,'middle')+box(35,80,320,110)+box(405,80,320,110)+text(195,116,'x ≡ 2 (mod 3)',23,'middle')+text(195,160,'{2, 5, 8, 11, 14}',23,'middle')+text(565,116,'x ≡ 3 (mod 5)',23,'middle')+text(565,160,'{3, 8, 13}',23,'middle')+arrow(245,200,340,239)+arrow(515,200,420,239)+box(290,250,180,55,'#f0fdf4','#15803d')+text(380,286,'x = 8',26,'middle')+text(380,350,zh?'无范围限制的全部解：8 + 15k，k 为整数。':'All unrestricted integer solutions: 8 + 15k, integer k.',18,'middle');
  write(4,zh?'互素 CRT 的唯一类':'The unique class from coprime CRT',zh?'零到十四内模三余二集合与模五余三集合只有八相交。所有整数解八加十五整数倍。':'Within zero through fourteen, the two residue sets intersect only at eight. All integer solutions are eight plus a multiple of fifteen.',body,380);
}
