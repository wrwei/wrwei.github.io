"""Raw material for the glossary and the common-mistakes page of the calculus series.

    python3 -I extract.py SRC_DIR OUT_DIR

Reads SRC_DIR/module_NN.md and writes OUT_DIR/terms.md (definition boxes, bold terms and theorem
names, with the section each is in) and OUT_DIR/pitfalls.md (every pitfall box, with its section).
Sections are numbered as the build numbers them: every "## " heading of a page, in order.
"""
import glob
import json
import os
import re
import sys

src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)

H2 = re.compile(r'^## (.+?)\s*\{#([\w-]+)\}\s*$')
H3 = re.compile(r'^### (.+?)\s*\{#([\w-]+)\}\s*$')
BOX = re.compile(r'^(:{3,})\s*(\w+)\s*(.*?)\s*$')
BOLD = re.compile(r'\*\*([^*\n]{2,80}?)\*\*')
SKIP_BOLD = re.compile(r'^(\(|Solution|Answer|Step|Hint|Check|Note|Part|Example|Exercise|Case|Why|Answer)', re.I)

terms, pitfalls, index = [], [], []
for path in sorted(glob.glob(os.path.join(src, 'module_[0-9][0-9].md'))):
    m = int(re.search(r'module_(\d\d)', path).group(1))
    text = open(path, encoding='utf-8').read()
    title = re.search(r'^title:\s*(.+)$', text, re.M).group(1).strip()
    body = text.split('\n---\n', 1)[1] if text.startswith('---') else text
    lines = body.split('\n')
    sec_n, sec_id, sec_title, anchor = 0, None, '', None
    counters = {}
    stack = []            # open containers: (colons, kind)
    in_fence = False
    i = 0
    while i < len(lines):
        line = lines[i]
        if line.startswith('```'):
            in_fence = not in_fence
            i += 1
            continue
        if in_fence:
            i += 1
            continue
        h2 = H2.match(line)
        if h2:
            sec_n += 1
            sec_title, sec_id = h2.group(1), h2.group(2)
            anchor = sec_id
            index.append((m, sec_n, sec_id, sec_title))
            i += 1
            continue
        h3 = H3.match(line)
        if h3:
            anchor = h3.group(2)
            i += 1
            continue
        bx = BOX.match(line)
        if bx:
            colons, kind, rest = bx.groups()
            if kind in ('definition', 'theorem', 'example', 'deeper', 'exercise', 'solution', 'pitfall',
                        'keyidea', 'tip', 'note', 'analogy', 'quiz', 'widget', 'figure', 'compute'):
                stack.append((len(colons), kind))
                if kind in ('definition', 'theorem'):
                    counters[kind] = counters.get(kind, 0) + 1
                    label = f'{kind.capitalize()} {m}.{counters[kind]}'
                    # the box's text, up to its closing fence
                    j, buf = i + 1, []
                    while j < len(lines) and not re.match(r'^:{%d}\s*$' % len(colons), lines[j]):
                        buf.append(lines[j])
                        j += 1
                    terms.append({'m': m, 'sec': f'{m}.{sec_n}', 'anchor': anchor, 'kind': label,
                                  'term': re.sub(r'\s*\{#[\w-]+\}\s*$', '', rest).strip(),
                                  'text': ' '.join(buf).strip()[:600]})
                if kind == 'pitfall':
                    j, buf = i + 1, []
                    while j < len(lines) and not re.match(r'^:{%d}\s*$' % len(colons), lines[j]):
                        buf.append(lines[j])
                        j += 1
                    pitfalls.append({'m': m, 'sec': f'{m}.{sec_n}', 'anchor': anchor,
                                     'section': sec_title, 'text': '\n'.join(buf).strip()})
                i += 1
                continue
        if re.match(r'^:{3,}\s*$', line) and stack:
            stack.pop()
            i += 1
            continue
        kinds = {k for _, k in stack}
        if not kinds & {'solution', 'quiz', 'exercise'}:
            for b in BOLD.finditer(line):
                t = b.group(1).strip()
                if SKIP_BOLD.match(t) or t.endswith(':') or t.endswith('.'):
                    continue
                # the sentence around it
                s = line
                start = max(s.rfind('. ', 0, b.start()) + 2, 0)
                end = s.find('. ', b.end())
                ctx = s[start: end + 1 if end >= 0 else len(s)]
                terms.append({'m': m, 'sec': f'{m}.{sec_n}', 'anchor': anchor, 'kind': 'bold',
                              'term': t, 'text': ctx.strip()[:400]})
        i += 1

with open(os.path.join(out, 'terms.md'), 'w', encoding='utf-8') as f:
    cur = None
    for t in terms:
        if t['m'] != cur:
            cur = t['m']
            f.write(f'\n# Module {cur}\n\n')
        f.write(f"- [{t['sec']} #{t['anchor']}] {t['kind']}: **{t['term']}** — {t['text']}\n")
with open(os.path.join(out, 'pitfalls.md'), 'w', encoding='utf-8') as f:
    cur = None
    for p in pitfalls:
        if p['m'] != cur:
            cur = p['m']
            f.write(f'\n# Module {cur}\n\n')
        f.write(f"## {p['sec']} {p['section']} (#{p['anchor']})\n\n{p['text']}\n\n")
with open(os.path.join(out, 'sections.json'), 'w', encoding='utf-8') as f:
    json.dump(index, f)
print(f'{len(terms)} terms ({sum(t["kind"] == "bold" for t in terms)} bold), {len(pitfalls)} pitfalls, '
      f'{len(index)} sections')
