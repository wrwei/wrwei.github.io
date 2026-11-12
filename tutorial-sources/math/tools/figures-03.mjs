import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {text,box,svg} from './svg.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
for(const lang of ['en','zh']){
  const zh=lang==='zh',directory=path.join(ROOT,'src/figures',lang);
  fs.mkdirSync(directory,{recursive:true});
  function write(n,title,description,body,height){fs.writeFileSync(path.join(directory,`fig-03-${n}.svg`),svg(title,description,body,height));}
  let body=text(80,40,'x ∈ A',18)+text(210,40,'x ∈ B',18)+text(410,40,'A ∪ B',18,'middle')+text(555,40,'A ∩ B',18,'middle')+text(685,40,'A \\ B',18,'middle');
  [[false,false],[false,true],[true,false],[true,true]].forEach(([a,b],i)=>{let y=62+i*58;body+=box(30,y,700,44)+text(100,y+28,a?'T':'F',20,'middle')+text(235,y+28,b?'T':'F',20,'middle')+text(410,y+28,a||b?'T':'F',20,'middle')+text(555,y+28,a&&b?'T':'F',20,'middle')+text(685,y+28,a&&!b?'T':'F',20,'middle');});
  write(1,zh?'成员真值与集合运算':'Membership and set operations',zh?'四行成员赋值完全决定并、交与差，不表示区域大小。':'Four membership valuations determine union, intersection, and difference; they do not represent region sizes.',body);
  body=text(380,35,zh?'共享关键词不是传递关系':'Shared keywords are not transitive',20,'middle');
  [[110,'a','python'],[380,'b','python, ai'],[650,'c','ai']].forEach(([x,name,keywords])=>{body+=box(x-90,95,180,115)+text(x,133,name,26,'middle')+text(x,172,keywords,17,'middle');});
  body+='<path d="M205,151H285M475,151H555" stroke="#15803d" stroke-width="4"/>'+text(245,127,'T',19,'middle')+text(515,127,'T',19,'middle')+'<path d="M110,226Q380,326 650,226" fill="none" stroke="#be123c" stroke-width="3" stroke-dasharray="7 5"/>'+text(380,300,zh?'a 与 c 不匹配':'a and c do not match',18,'middle');
  write(2,zh?'关键词关系的反例':'Keyword relation counterexample',zh?'a 只有 python，b 有 python 和 ai，c 只有 ai。aRb 与 bRc 真而 aRc 假。':'a has python; b has python and ai; c has ai. aRb and bRc hold, but aRc fails.',body);
  body=box(35,35,310,210,'#f0fdf4','#15803d')+text(190,77,zh?'偶数类 [0]':'Even class [0]',21,'middle')+text(190,150,'0, 2, 4',29,'middle')+box(415,35,310,210,'#faf5ff','#7e22ce')+text(570,77,zh?'奇数类 [1]':'Odd class [1]',21,'middle')+text(570,150,'1, 3, 5',29,'middle')+text(380,295,zh?'商集的元素是两个块':'The quotient has the two blocks as elements',18,'middle');
  write(3,zh?'奇偶等价类':'Parity equivalence classes',zh?'域 {0,1,2,3,4,5} 被分成偶数与奇数两不交非空块。':'The domain {0,1,2,3,4,5} is partitioned into disjoint nonempty even and odd blocks.',body);
  body='<path d="M380,282L220,172L380,62L540,172L380,282" fill="none" stroke="#2563eb" stroke-width="3"/>';
  [[380,282,'∅'],[220,172,'{a}'],[540,172,'{b}'],[380,62,'{a, b}']].forEach(([x,y,label])=>{body+='<circle cx="'+x+'" cy="'+y+'" r="7" fill="#1a2e4a"/>'+text(x,y-18,label,21,'middle');});
  body+=text(380,332,zh?'向上表示包含；{a} 与 {b} 不可比':'Upward means inclusion; {a} and {b} are incomparable',17,'middle');
  write(4,zh?'幂集包含的哈斯图':'Hasse diagram of inclusion',zh?'空集在底，a 与 b 的单元素集中间且不可比，全集在顶。四条边是覆盖关系。':'Empty at bottom, incomparable singleton sets in the middle, and full set at top. Four cover edges indicate upward inclusion.',body,365);
}
