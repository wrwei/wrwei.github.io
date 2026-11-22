import re, glob, sys
terms_text = ''
names = []
for f in sorted(glob.glob(sys.argv[1] + '/terms-*.txt')):
    t = open(f, encoding='utf-8').read()
    terms_text += t.lower()
    names += [l[3:].strip().lower() for l in t.split('\n') if l.startswith('## ')]
src = open(sys.argv[2], encoding='utf-8').read()
seen = set()
for m in re.finditer(r'^- \[(\d+\.\d+) #([\w-]+)\] (bold|Definition [\d.]+|Theorem [\d.]+): \*\*(.+?)\*\* — ', src, re.M):
    sec, anc, kind, term = m.groups()
    if sec.split('.')[1] in ('summary',): continue
    t = term.lower().strip().rstrip('.')
    t2 = re.sub(r'^the ', '', t)
    if (t2, kind.split()[0]) in seen: continue
    seen.add((t2, kind.split()[0]))
    hit = any(t2 in n or n in t2 for n in names) if len(t2) > 3 else t2 in names
    if not hit and t2 not in terms_text:
        print(f'{sec:6} #{anc:22} {kind:14} {term[:70]}')
