#!/usr/bin/env python3
"""Run and check the Python, the check blocks and the value tables of the Calculus series' pages.

    python3 -I tools/calc.py                   every page; also writes out/code/ and out/calculus-code.zip
    python3 -I tools/calc.py --module 05       one module page (src/en/module_05.md)
    python3 -I tools/calc.py --page formulas   one other page (src/en/formulas.md)
    python3 -I tools/calc.py --lang zh         check src/zh; write downloads and run files under out/zh
    python3 -I tools/calc.py --update          write the real outputs and computed tables into the pages

What it does (PLAN.md section 7):
  * the python blocks of each ::: compute box (and of each ::: solution) run in one fresh process, in
    page order; what each block prints must equal the output block after it. A `python fails` block
    must raise an error; its output is the error's last line. `python norun` blocks are not run.
  * the check blocks of a page run in page order in one namespace (sympy, the helpers of
    tools/calccheck.py, the symbols x y z t ...); every failed check is reported with its line.
  * every value table is computed with 30-digit arithmetic and must equal the rows on the page.
  * every ::: example and ::: solution must contain a check block, unless marked `nocheck`.
The code runs in worker processes (tools/calc_worker.py) with the Python in $CALC_PYTHON (default: the
Python running this script), which needs the packages of tools/requirements.txt. Exits 1 on problems.
"""
import concurrent.futures as cf
import difflib
import json
import os
import re
import subprocess
import sys
import zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOOLS = os.path.join(ROOT, 'tools')
SRC = os.path.join(ROOT, 'src', 'en')
OUT = os.path.join(ROOT, 'out')
PY = os.environ.get('CALC_PYTHON') or sys.executable
ZIP = 'calculus-code.zip'
SESSION_TIMEOUT = 180
CHECKS_TIMEOUT = 600

FENCE = re.compile(r'^(\s*)(`{3,})([\w-]*)(.*)$')
OPEN = re.compile(r'^\s*(:{3,})\s*(\w+)\b(.*)$')
CLOSE = re.compile(r'^\s*(:{3,})\s*$')
HEADING = re.compile(r'^##\s+(.*?)\s*(\{#[\w-]+\})?\s*$')


class Block:
    def __init__(self, kind, flags, start, end, body, indent, boxes, section):
        self.kind, self.flags, self.start, self.end = kind, flags, start, end
        self.body, self.indent, self.boxes, self.section = body, indent, boxes, section
        self.new_body = None          # replacement, when --update changes it

    @property
    def line(self):                    # 1-based line of the opening fence
        return self.start + 1


class Box:
    def __init__(self, kind, line, info, parent):
        self.kind, self.line, self.info, self.parent = kind, line, info, parent
        self.flags = info.split()

    def title(self):
        return ' '.join(f for f in self.flags if not re.fullmatch(r'★+|nocheck|\{#[\w-]+\}|#[\w-]+', f))


def parse(text):
    lines = text.split('\n')
    blocks, boxes, stack, sections = [], [], [], []
    i = 0
    in_front = lines[0].strip() == '---'
    while i < len(lines):
        ln = lines[i]
        if in_front:
            if i > 0 and ln.strip() == '---':
                in_front = False
            i += 1
            continue
        m = FENCE.match(ln)
        if m:
            indent, fence, kind, rest = len(m.group(1)), m.group(2), m.group(3), m.group(4)
            j = i + 1
            close = re.compile(r'^\s*' + fence + r'`*\s*$')
            while j < len(lines) and not close.match(lines[j]):
                j += 1
            body = [l[min(indent, len(l) - len(l.lstrip(' '))):] for l in lines[i + 1:j]]
            blocks.append(Block(kind, rest.split(), i, j, body, indent, list(stack), len(sections)))
            i = j + 1
            continue
        h = HEADING.match(ln)
        if h:
            sections.append(h.group(1))
        m = OPEN.match(ln)
        if m:
            box = Box(m.group(2), i + 1, m.group(3).strip(), stack[-1] if stack else None)
            stack.append(box)
            boxes.append(box)
        elif CLOSE.match(ln) and stack:
            stack.pop()
        i += 1
    return lines, blocks, boxes, sections


def worker(job, timeout):
    env = {k: v for k, v in os.environ.items() if k in ('PATH', 'HOME', 'LANG', 'LC_ALL', 'TMPDIR', 'SYSTEMROOT')}
    env.update(PYTHONHASHSEED='0', PYTHONIOENCODING='utf-8', MPLBACKEND='Agg', PYTHONDONTWRITEBYTECODE='1')
    run_dir = os.path.join(OUT, 'run')
    os.makedirs(run_dir, exist_ok=True)
    try:
        p = subprocess.run([PY, '-s', '-P', os.path.join(TOOLS, 'calc_worker.py')], input=json.dumps(job),
                           capture_output=True, text=True, timeout=timeout, env=env, cwd=run_dir)
    except subprocess.TimeoutExpired:
        return {'crash': f'timed out after {timeout} s'}
    if p.returncode != 0 or not p.stdout.strip():
        return {'crash': (p.stderr or 'no output').strip()[-1500:]}
    try:
        return json.loads(p.stdout)
    except json.JSONDecodeError:
        return {'crash': 'unreadable answer: ' + p.stdout[-500:]}


def norm(text):
    lines = [l.rstrip() for l in text.replace('\r\n', '\n').split('\n')]
    while lines and not lines[-1]:
        lines.pop()
    while lines and not lines[0]:
        lines.pop(0)
    return lines


def show_diff(old, new):
    d = list(difflib.unified_diff(old, new, 'page', 'real', lineterm='', n=1))
    return '\n'.join('      ' + l for l in d[2:40]) + ('\n      ...' if len(d) > 42 else '')


def session_box(block):
    for box in reversed(block.boxes):
        if box.kind in ('compute', 'solution'):
            return box
    return None


class Page:
    def __init__(self, name):
        self.name = name
        self.path = os.path.join(SRC, name + '.md')
        with open(self.path, encoding='utf-8') as f:
            self.text = f.read()
        self.lines, self.blocks, self.boxes, self.sections = parse(self.text)
        self.problems, self.warnings = [], []
        self.stats = dict(python=0, output=0, check=0, checks=0, tables=0)

    def where(self, line):
        return f'{self.name}.md:{line}'

    def problem(self, line, msg):
        self.problems.append(f'{self.where(line)}: {msg}')

    # -------------------------------------------------- structure
    def jobs(self):
        sessions, outputs = {}, {}
        last_py = None
        for b in self.blocks:
            if b.kind == 'python':
                self.stats['python'] += 1
                if 'norun' in b.flags:
                    last_py = None
                    continue
                box = session_box(b)
                if box is None:
                    self.problem(b.line, 'a python block outside a ::: compute box or a ::: solution')
                    last_py = None
                    continue
                sessions.setdefault(box.line, (box, []))[1].append(b)
                last_py = b
            elif b.kind == 'output':
                self.stats['output'] += 1
                if last_py is None:
                    self.problem(b.line, 'an output block that does not follow a python block')
                else:
                    if session_box(b) is not session_box(last_py):
                        self.problem(b.line, 'an output block in a different box from its python block')
                    outputs[id(last_py)] = b
                last_py = None
            elif b.kind in ('check', 'valuetable'):
                last_py = None
        checks = [b for b in self.blocks if b.kind == 'check']
        tables = [b for b in self.blocks if b.kind == 'valuetable']
        self.stats['check'], self.stats['tables'] = len(checks), len(tables)
        for box in self.boxes:
            if box.kind in ('example', 'solution') and 'nocheck' not in box.flags:
                if not any(box in b.boxes for b in checks):
                    self.problem(box.line, f'::: {box.kind} {box.title()[:50]!s} has no check block (add one, or mark it nocheck if it computes nothing)')
        return sessions, outputs, checks, tables

    # -------------------------------------------------- results
    def apply_session(self, box, blocks, res, outputs, update):
        if 'crash' in res:
            self.problem(box.line, f'the Python process failed: {res["crash"]}')
            return
        for b, r in zip(blocks, res['results']):
            fails = 'fails' in b.flags
            if fails:
                if not r['error']:
                    self.problem(b.line, 'a `python fails` block did not raise an error')
                    continue
                real = norm(r['error'].split('\n')[0])
            else:
                if r['error']:
                    self.problem(b.line, 'the block raised an error:\n      ' + r['error'].replace('\n', '\n      '))
                    continue
                real = norm(r['stdout'])
            if r['stderr'].strip() and not fails:
                self.problem(b.line, 'the block wrote to stderr (a warning?):\n      ' + r['stderr'].strip()[-600:].replace('\n', '\n      '))
            out = outputs.get(id(b))
            if out is None:
                if real:
                    self.problem(b.line, 'the block prints something but has no output block after it (add an empty ```output block)')
                continue
            if not real:
                self.problem(out.line, 'the python block before this output block prints nothing: remove the output block')
                continue
            if norm('\n'.join(out.body)) != real:
                if update:
                    out.new_body = real
                    print(f'  updated output at {self.where(out.line)}')
                else:
                    self.problem(out.line, 'the output differs from what Python printed:\n' + show_diff(norm('\n'.join(out.body)), real))

    def apply_checks(self, checks, tables, res, update):
        if 'crash' in res:
            self.problem(checks[0].line if checks else (tables[0].line if tables else 1), f'the check process failed: {res["crash"]}')
            return
        for b, r in zip(checks, res['results']):
            self.stats['checks'] += r['checks']
            if r['failure']:
                self.problem(b.line, 'check failed: ' + r['failure'].replace('\n', '\n  '))
            elif r['checks'] == 0:
                self.problem(b.line, 'this check block checks nothing (call same, rounds, holds, ...)')
            if r['seconds'] > 5:
                self.warnings.append(f'{self.where(b.line)}: this check block took {r["seconds"]} s')
        for b, r in zip(tables, res['tables']):
            if 'error' in r:
                self.problem(b.line, f'value table: {r["error"]}')
                continue
            body = b.body
            sep = next((k for k, l in enumerate(body) if l.strip() == '---'), None)
            spec = body if sep is None else body[:sep]
            have = [] if sep is None else [l.strip() for l in body[sep + 1:] if l.strip()]
            real = [' | '.join(row) for row in r['rows']]
            if have != real:
                if update:
                    b.new_body = [l for l in spec if l.strip() or True] + ['---'] + real
                    print(f'  updated value table at {self.where(b.line)}')
                else:
                    self.problem(b.line, 'the value table differs from the computed values:\n' + show_diff(have, real))

    def write(self):
        changed = [b for b in self.blocks if b.new_body is not None]
        if not changed:
            return
        with open(self.path, encoding='utf-8') as f:
            if f.read() != self.text:
                self.problem(1, 'the page changed while calc.py ran: not written; run again')
                return
        lines = list(self.lines)
        for b in sorted(changed, key=lambda b: -b.start):
            pad = ' ' * b.indent
            lines[b.start + 1:b.end] = [(pad + l) if l else l for l in b.new_body]
        with open(self.path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(lines))

    # -------------------------------------------------- downloadable code
    def export(self):
        """(compute script, solutions script) of this page, or None for pages without python."""
        def code_of(blocks):
            return '\n'.join('\n'.join(b.body) for b in blocks if 'fails' not in b.flags and 'norun' not in b.flags)
        compute, solutions = [], []
        exercise_no = {}
        n = 0
        for box in self.boxes:
            if box.kind == 'exercise':
                n += 1
                exercise_no[box.line] = n
        seen = {}
        for b in self.blocks:
            if b.kind != 'python':
                continue
            box = session_box(b)
            if box is None:
                continue
            seen.setdefault(box.line, (box, b.section, []))[2].append(b)
        mod = self.name.replace('module_', '')
        for box, sec, blocks in seen.values():
            code = code_of(blocks)
            if not code.strip():
                continue
            if box.kind == 'compute':
                compute.append(f'# %% Section {int(mod)}.{sec}' + (f': {box.title()}' if box.title() else '') + '\n' + code + '\n')
            else:
                ex = box.parent
                k = exercise_no.get(ex.line) if ex is not None else None
                label = f'Exercise {int(mod)}.{k}' if k else 'Solution'
                solutions.append(f'# %% {label}' + (f': {ex.title()}' if ex is not None and ex.title() else '') + '\n' + code + '\n')
        return compute, solutions


def module_title(page):
    m = re.search(r'^title:\s*(.*)$', page.text, re.M)
    return m.group(1).strip() if m else page.name


def main():
    global SRC, OUT
    argv = sys.argv[1:]
    if '--lang' in argv:
        values = argv[argv.index('--lang') + 1:]
        if not values or values[0] not in ('en', 'zh'):
            sys.exit('use --lang en or --lang zh')
        lang = values[0]
        SRC = os.path.join(ROOT, 'src', lang)
        if not os.path.isdir(SRC):
            sys.exit(f'no source directory: {os.path.relpath(SRC, ROOT)}')
        if lang == 'zh':
            OUT = os.path.join(ROOT, 'out', 'zh')
    update = '--update' in argv
    only = None
    if '--module' in argv:
        only = ['module_' + argv[argv.index('--module') + 1].zfill(2)]
    elif '--page' in argv:
        only = [argv[argv.index('--page') + 1]]
    names = sorted(f[:-3] for f in os.listdir(SRC) if f.endswith('.md'))
    if only:
        missing = [n for n in only if n not in names]
        if missing:
            sys.exit(f'no such page: {os.path.relpath(SRC, ROOT)}/{missing[0]}.md')
        names = only
    pages = [Page(n) for n in names]
    todo = []
    for p in pages:
        sessions, outputs, checks, tables = p.jobs()
        for key, (box, blocks) in sessions.items():
            label = lambda b, p=p: f'{p.name}.md line {b.line + 1}'
            job = {'mode': 'session', 'blocks': [{'code': '\n'.join(b.body) + '\n', 'fails': 'fails' in b.flags, 'label': label(b)} for b in blocks]}
            todo.append(('session', p, (box, blocks, outputs), job, SESSION_TIMEOUT))
        if checks or tables:
            job = {'mode': 'checks', 'tools': TOOLS,
                   'blocks': [{'code': '\n'.join(b.body) + '\n', 'label': f'{p.name}.md line {b.line + 1}'} for b in checks],
                   'tables': [{'spec': [l for l in (b.body[:next((k for k, l in enumerate(b.body) if l.strip() == '---'), len(b.body))])]} for b in tables]}
            todo.append(('checks', p, (checks, tables), job, CHECKS_TIMEOUT))
    workers = max(1, min(8, (os.cpu_count() or 4)))
    with cf.ThreadPoolExecutor(workers) as ex:
        futures = {ex.submit(worker, job, tmo): (kind, p, extra) for kind, p, extra, job, tmo in todo}
        for fut in cf.as_completed(futures):
            kind, p, extra = futures[fut]
            res = fut.result()
            if kind == 'session':
                box, blocks, outputs = extra
                p.apply_session(box, blocks, res, outputs, update)
            else:
                checks, tables = extra
                p.apply_checks(checks, tables, res, update)
    if update:
        for p in pages:
            p.write()
    problems = 0
    for p in pages:
        s = p.stats
        if not any((s['python'], s['check'], s['tables'])) and not p.problems:
            continue
        verdict = 'all match' if not p.problems else f'{len(p.problems)} problem(s)'
        print(f'{p.name}: {s["python"]} python blocks, {s["output"]} outputs, {s["check"]} check blocks ({s["checks"]} checks), {s["tables"]} value tables: {verdict}')
        for w in p.warnings:
            print('  warning: ' + w)
        for pr in sorted(p.problems, key=lambda x: int(re.search(r':(\d+):', x).group(1)) if re.search(r':(\d+):', x) else 0):
            print('  ' + pr)
        problems += len(p.problems)
    if not only and not update:
        problems += export_code(pages)
    total = sum(p.stats['checks'] for p in pages)
    print(f'{len(pages)} page(s): {total} checks, {problems} problem(s)' + ('' if problems else ': all outputs match'))
    sys.exit(1 if problems else 0)


def export_code(pages):
    """Write out/code/module_NN.py (+ _solutions.py), run each to be sure it works, and zip them."""
    code_dir = os.path.join(OUT, 'code')
    os.makedirs(code_dir, exist_ok=True)
    for f in os.listdir(code_dir):
        os.remove(os.path.join(code_dir, f))
    written, problems = [], 0
    for p in pages:
        if not p.name.startswith('module_'):
            continue
        compute, solutions = p.export()
        for suffix, cells in (('', compute), ('_solutions', solutions)):
            if not cells:
                continue
            name = f'{p.name}{suffix}.py'
            head = (f'"""Calculus, Module {int(p.name[7:9])}: {module_title(p)}' + (' (exercise solutions)' if suffix else '') + '\n\n'
                    'The Python of the module page, one cell (# %%) per box, in page order. Run it with\n'
                    f'    python {name}\n'
                    'or open it in an editor that runs # %% cells (VS Code, Spyder, JupyterLab with jupytext).\n"""\n\n')
            with open(os.path.join(code_dir, name), 'w', encoding='utf-8') as f:
                f.write(head + '\n\n'.join(cells))
            written.append(name)
    def run(name):
        env = {k: v for k, v in os.environ.items() if k in ('PATH', 'HOME', 'LANG', 'TMPDIR')}
        env.update(MPLBACKEND='Agg', PYTHONHASHSEED='0')
        try:
            r = subprocess.run([PY, '-s', name], cwd=code_dir, capture_output=True, text=True, timeout=600, env=env)
            return name, r.returncode, r.stderr[-800:]
        except subprocess.TimeoutExpired:
            return name, -1, 'timed out'
    with cf.ThreadPoolExecutor(8) as ex:
        for name, rc, err in ex.map(run, written):
            if rc != 0:
                print(f'  out/code/{name} does not run: {err.strip()}')
                problems += 1
    readme = ('Calculus: the Python of every module\n\n'
              'One script per module (module_NN.py) and one for the exercise solutions (module_NN_solutions.py).\n'
              'They need Python 3 with SymPy, NumPy and matplotlib:\n\n'
              '    python -m pip install sympy numpy matplotlib\n\n'
              'Every output shown on the pages was produced by this code.\n')
    with zipfile.ZipFile(os.path.join(OUT, ZIP), 'w', zipfile.ZIP_DEFLATED) as z:
        z.writestr('calculus-code/README.txt', readme)
        for name in sorted(written):
            z.write(os.path.join(code_dir, name), f'calculus-code/{name}')
    print(f'wrote {os.path.relpath(os.path.join(OUT, ZIP), ROOT)} ({len(written)} scripts)')
    return problems


if __name__ == '__main__':
    main()
