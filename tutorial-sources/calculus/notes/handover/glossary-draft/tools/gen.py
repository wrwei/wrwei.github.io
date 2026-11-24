"""Generate src/en/glossary.md from terms.txt and notation.txt (in the folder above this script).

Data format, blocks separated by blank lines:
    ## term                       (the bold term; markdown and $maths$ allowed)
    sort: key                     (optional: the sort key, for terms that start with maths)
    read: "reading"               (notation only: how the series reads it aloud)
    group: id                     (notation only: the table it belongs to)
    links: 2.1#idea 2.7#precise   (sections, the introducing one first)
    Meaning, on one or more lines.

Every link is checked: the anchor must be a ## or ### id of that module, and the section number must be
the number the build gives the ## section that contains it.
"""
import re, sys, os
from collections import OrderedDict

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.dirname(HERE)
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..'))   # tutorial-sources/calculus
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'src', 'en', 'glossary.md')

# ---- anchors of the modules: id -> section number ----
ANCHORS = {}
EXERCISES = set()
for mod in range(1, 21):
    lines = open(f'{ROOT}/src/en/module_{mod:02d}.md', encoding='utf-8').read().split('\n')
    fence = None; sec = 0; ids = {}
    for L in lines:
        m = re.match(r'^\s*(`{3,})', L)
        if m:
            if fence is None: fence = m.group(1)
            elif L.strip().startswith(fence): fence = None
            continue
        if fence: continue
        m = re.match(r'^(#{2,3}) .*\{#([\w-]+)\}\s*$', L)
        if m:
            if m.group(1) == '##': sec += 1
            ids[m.group(2)] = sec
        m = re.match(r'^\s*:{3,} exercise\b.*\{#(ex-\d+-\d+)\}', L)
        if m: EXERCISES.add(m.group(1))
    ANCHORS[mod] = ids

problems = []

def link(spec, where):
    m = re.fullmatch(r'ex(\d+)\.(\d+)', spec)
    if m:   # an exercise: ex6.11 -> [Ex. 6.11](module_06_EN.html#ex-6-11)
        mod, k = int(m.group(1)), int(m.group(2))
        if f'ex-{mod}-{k}' not in EXERCISES: problems.append(f'{where}: no exercise {mod}.{k}')
        return f'[Ex. {mod}.{k}](module_{mod:02d}_EN.html#ex-{mod}-{k})'
    m = re.fullmatch(r'(\d+)\.(\d+)#([\w-]+)', spec)
    if not m:
        problems.append(f'{where}: bad link {spec}'); return spec
    mod, sec, anc = int(m.group(1)), int(m.group(2)), m.group(3)
    if anc not in ANCHORS.get(mod, {}):
        problems.append(f'{where}: module {mod} has no anchor #{anc}')
    elif ANCHORS[mod][anc] != sec:
        problems.append(f'{where}: #{anc} is in section {mod}.{ANCHORS[mod][anc]}, not {mod}.{sec}')
    return f'[{mod}.{sec}](module_{mod:02d}_EN.html#{anc})'

def parse(path):
    text = open(path, encoding='utf-8').read()
    out = []
    for block in re.split(r'\n\s*\n', text.strip()):
        lines = [l for l in block.split('\n') if not l.startswith('#!')]
        if not lines: continue
        if not lines[0].startswith('## '):
            problems.append(f'{os.path.basename(path)}: block without a term: {lines[0][:60]}'); continue
        e = {'term': lines[0][3:].strip(), 'sort': None, 'read': None, 'group': None, 'links': [], 'meaning': []}
        for l in lines[1:]:
            if l.startswith('sort: '): e['sort'] = l[6:].strip()
            elif l.startswith('read: '): e['read'] = l[6:].strip()
            elif l.startswith('group: '): e['group'] = l[7:].strip()
            elif l.startswith('links: '): e['links'] = l[7:].split()
            else: e['meaning'].append(l.strip())
        e['meaning'] = ' '.join(e['meaning'])
        out.append(e)
    return out

GREEK = {'ε': 'epsilon', 'δ': 'delta', 'Δ': 'delta', 'π': 'pi'}
def sortkey(e):
    k = e['sort'] or e['term']
    for g, w in GREEK.items(): k = k.replace(g, w)
    k = re.sub(r'\\varepsilon', 'epsilon', k)
    k = re.sub(r'\\[a-zA-Z]+', '', k)
    k = k.lower().replace("'", '').replace('’', '')
    k = re.sub(r'[^a-z0-9]+', ' ', k).strip()
    if k.startswith('the '): k = k[4:]
    return k

def cell(s):
    if '|' in s.replace('\\|', ''):
        problems.append(f'a "|" in a table cell: {s[:70]}')
    return s

import glob
terms = [e for f in sorted(glob.glob(os.path.join(DATA, 'terms-*.txt'))) for e in parse(f)]
notation = parse(os.path.join(DATA, 'notation.txt'))

seen = {}
for e in terms:
    k = sortkey(e)
    if k in seen: problems.append(f'duplicate term: {e["term"]} / {seen[k]}')
    seen[k] = e['term']
    if not e['links']: problems.append(f'{e["term"]}: no links')
    if not e['meaning']: problems.append(f'{e["term"]}: no meaning')

groups = OrderedDict()
for e in sorted(terms, key=lambda e: (sortkey(e), e['term'])):
    groups.setdefault(sortkey(e)[0].upper(), []).append(e)

NGROUPS = OrderedDict([
    ('limits', 'Functions, limits and continuity'),
    ('derivatives', 'Derivatives'),
    ('integrals', 'Integrals'),
    ('series', 'Sequences and series'),
    ('several', 'Several variables'),
])

head = open(os.path.join(DATA, 'head.md'), encoding='utf-8').read().rstrip('\n')
md = [head.replace('{{INDEX}}', ' · '.join(f'[{g}](#g-{g.lower()})' for g in groups)), '']

md.append('## Notation {#notation}')
md.append('')
md.append(open(os.path.join(DATA, 'notation-intro.md'), encoding='utf-8').read().strip())
md.append('')
for gid, title in NGROUPS.items():
    rows = [e for e in notation if e['group'] == gid]
    if not rows: continue
    md += [f'### {title} {{#notation-{gid}}}', '', '| Notation | Read aloud | Meaning | Section |', '|---|---|---|---|']
    for e in rows:
        where = 'notation ' + e['term']
        md.append('| ' + ' | '.join([cell(e['term']), cell(e['read'] or '—'), cell(e['meaning']),
                                     ', '.join(link(l, where) for l in e['links'])]) + ' |')
    md.append('')
for e in notation:
    if e['group'] not in NGROUPS: problems.append(f'notation {e["term"]}: group {e["group"]}')

md.append('## Terms from A to Z {#terms}')
md.append('')
for g, es in groups.items():
    md += [f'<div class="section-anchor" id=g-{g.lower()}></div>', '', f'### {g}', '', '| Term | Meaning | Section |', '|---|---|---|']
    for e in es:
        md.append('| ' + ' | '.join([cell(f'**{e["term"]}**'), cell(e['meaning']),
                                     ', '.join(link(l, e['term']) for l in e['links'])]) + ' |')
    md.append('')

open(OUT, 'w', encoding='utf-8').write('\n'.join(md).rstrip('\n') + '\n')
print(f'{len(terms)} terms in {len(groups)} letters, {len(notation)} notation entries -> {OUT}')
for p in problems: print('PROBLEM:', p)
sys.exit(1 if problems else 0)
