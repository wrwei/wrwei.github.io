"""where.py MODULE LINE [LINE...]: the section number (M.S) and nearest anchor above each line."""
import os
import re, sys
mod = int(sys.argv[1])
path = os.path.join(os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..')), 'src', 'en', f'module_{mod:02d}.md')
lines = open(path, encoding='utf-8').read().split('\n')
infence = False
sec = 0; h2 = None; h3 = None
info = []
for i, L in enumerate(lines, 1):
    if L.startswith('```'):
        infence = not infence
    if not infence:
        m = re.match(r'^## .*\{#([\w-]+)\}', L)
        if m:
            sec += 1; h2 = m.group(1); h3 = None
        m = re.match(r'^### .*\{#([\w-]+)\}', L)
        if m:
            h3 = m.group(1)
    info.append((sec, h2, h3))
for a in sys.argv[2:]:
    n = int(a)
    s, h2, h3 = info[n - 1]
    print(f'{a}: {mod}.{s} #{h3 or h2}')
