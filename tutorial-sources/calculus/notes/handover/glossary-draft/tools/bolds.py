"""All bold spans of the modules, with M.S and anchor; prints those missing from terms.md."""
import os
import re, sys, json
ROOT = os.path.join(os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..')), 'src', 'en')
terms = open(sys.argv[1], encoding='utf-8').read()
known = set()
for m in re.finditer(r'^- \[(\d+)\.(\d+) #([\w-]+)\] bold: \*\*(.+?)\*\* — ', terms, re.M):
    known.add((int(m.group(1)), m.group(4)))
out = []
for mod in range(1, 21):
    lines = open(f'{ROOT}/module_{mod:02d}.md', encoding='utf-8').read().split('\n')
    fence = False; sec = 0; h2 = h3 = None
    for i, L in enumerate(lines, 1):
        if L.lstrip().startswith('```'):
            fence = not fence; continue
        if fence: continue
        m = re.match(r'^## .*\{#([\w-]+)\}', L)
        if m: sec += 1; h2 = m.group(1); h3 = None
        m = re.match(r'^### .*\{#([\w-]+)\}', L)
        if m: h3 = m.group(1)
        for b in re.finditer(r'\*\*(.+?)\*\*', L):
            t = b.group(1)
            if (mod, t) not in known:
                out.append(f'{mod}.{sec} #{h3 or h2} L{i}: **{t}**')
print('\n'.join(out))
print(len(out), 'bold spans not in terms.md')
