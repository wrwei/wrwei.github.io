"""Check every Isabelle block of the series with Isabelle, and fill in the output blocks.

usage: python3 -I tools/isa.py [--update] [--module NN ...] [--isabelle PATH] [--jobs N]

For each page src/en/module_NN.md:

1. Collects the ```isabelle blocks in page order. Blocks inside a `::: solution` box go into
   Module_NN_Solutions (which imports Module_NN); ```isabelle fails blocks each go into a probe
   theory made of the module's earlier blocks plus the failing one; ```isabelle norun blocks are
   only shown. Unicode symbols are written as Isabelle symbols (\\<forall> etc.).
2. Writes the theories and a ROOT file under out/isa/ (out/isa-NN/ with --module NN, so that runs
   for different modules can go on at the same time) and runs
   `isabelle build -o show_states`, then reads every message with `isabelle build_log -U -v`.
3. Maps the messages to the blocks. A normal block must not produce an error; a fails block must.
   The ```output block after an isabelle block must equal what Isabelle printed for the last
   command of that block (with --update, it is rewritten).
4. Writes the downloadable theories, a ROOT file and a ZIP under out/theories/ (full runs only).

Output block options (first line, after ```output):
  (none)   every message of the block's last line that has messages
  state    only the proof state of that line
  result   everything but the proof state
  all      every message of every line of the block
  varies   output that differs between runs (Sledgehammer, timings): filled in by --update when the
           block is empty, never compared afterwards; the page labels it as an example run
           (combine with the others, e.g. ```output result varies)
"""
import argparse
import fcntl
import glob
import os
import re
import shutil
import subprocess
import sys
import zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SRC = os.path.join(ROOT, 'src', 'en')
OUT = os.path.join(ROOT, 'out')
DEFAULT_ISABELLE = os.environ.get('ISABELLE_TOOL') or os.path.join(
    '/tmp/claude-0/-home-user-wrwei-github-io/7b6368c3-ecc9-5d53-a462-2dab7e36d355/scratchpad',
    'isabelle', 'Isabelle2026', 'bin', 'isabelle')
VERSION = 'Isabelle2026'

FENCE = re.compile(r'^(\s*)(`{3,})(\w+)?(.*)$')
CONTAINER = re.compile(r'^\s*(:{3,})\s*([\w-]+)?')
HEADER = re.compile(r'^([A-Z][\w ]*?) \(line (\d+) of "([^"]+)"\):$')
AT_COMMAND = re.compile(r'^\*\*\* At command "[^"]*" \(line (\d+) of "([^"]+)"\)$')
HERE_POS = re.compile(r' \((?:line \d+ of |file )"[^"]*"\)')


# ---------------------------------------------------------------- symbols

def load_symbols(isabelle):
    """Unicode character -> Isabelle symbol name, from the distribution's etc/symbols."""
    home = os.path.dirname(os.path.dirname(isabelle))
    table = {}
    with open(os.path.join(home, 'etc', 'symbols'), encoding='utf-8') as fh:
        for line in fh:
            m = re.match(r'^(\\<[^>]+>)\s+code:\s*0x([0-9a-fA-F]+)', line)
            if m:
                ch = chr(int(m.group(2), 16))
                table.setdefault(ch, m.group(1))   # the first name for a character wins
    return table


def to_ascii(text, symbols, where):
    out = []
    for ch in text:
        if ord(ch) < 128:
            out.append(ch)
        elif ch in symbols:
            out.append(symbols[ch])
        else:
            raise SystemExit(f'{where}: "{ch}" (U+{ord(ch):04X}) is not an Isabelle symbol')
    return ''.join(out)


# ---------------------------------------------------------------- pages

def front_matter(lines):
    meta = {}
    if lines and lines[0].strip() == '---':
        for i in range(1, len(lines)):
            if lines[i].strip() == '---':
                for ln in lines[1:i]:
                    m = re.match(r'^(\w+):\s*(.*)$', ln)
                    if m:
                        meta[m.group(1)] = m.group(2).strip()
                return meta, i + 1
    return meta, 0


PAGE_TEXT = {}      # page path -> its text when this run read it (an update is written only if unchanged)


def parse_page(path):
    """The page's Isabelle blocks, each with its output block (if any), in order."""
    with open(path, encoding='utf-8') as fh:
        text = fh.read()
    PAGE_TEXT[path] = text
    lines = text.split('\n')
    meta, start = front_matter(lines)
    blocks = []
    stack = []            # open containers: (fence length, name)
    i = start
    while i < len(lines):
        ln = lines[i]
        m = FENCE.match(ln)
        if m:
            indent, ticks, lang, rest = m.group(1), m.group(2), m.group(3) or '', m.group(4).strip()
            j = i + 1
            while j < len(lines) and not re.match(r'^\s*' + ticks + r'`*\s*$', lines[j]):
                j += 1
            body = [b[len(indent):] if b.startswith(indent) else b.lstrip() for b in lines[i + 1:j]]
            if lang == 'isabelle':
                flags = rest.split()
                kind = 'fails' if 'fails' in flags else 'norun' if 'norun' in flags else \
                    'solution' if any(name == 'solution' for _, name in stack) else 'main'
                blocks.append({'kind': kind, 'start': i, 'end': j, 'indent': indent, 'text': body,
                               'output': None})
            elif lang == 'output':
                if not blocks or blocks[-1]['output'] is not None:
                    raise SystemExit(f'{path}:{i + 1}: an output block must follow an isabelle block')
                blocks[-1]['output'] = {'start': i, 'end': j, 'indent': indent, 'text': body,
                                        'opts': rest.split()}
            i = j + 1
            continue
        c = CONTAINER.match(ln)
        if c:
            fence, name = len(c.group(1)), c.group(2)
            if name:
                stack.append((fence, name))
            elif stack:
                # a bare fence closes the innermost container it can close
                for k in range(len(stack) - 1, -1, -1):
                    if stack[k][0] <= fence:
                        del stack[k:]
                        break
        i += 1
    return meta, lines, blocks


# ---------------------------------------------------------------- theories

def theory_text(name, imports, chunks, symbols, path):
    """Theory source and, for each chunk, the line where it starts."""
    head = [f'theory {name}', f'  imports {imports}', 'begin', '']
    out, starts = list(head), []
    for chunk in chunks:
        starts.append(len(out) + 1)
        for k, ln in enumerate(chunk['text']):
            out.append(to_ascii(ln, symbols, f'{path}:{chunk["start"] + 2 + k}'))
        out.append('')
    out.append('end')
    return '\n'.join(out) + '\n', starts


def plan_module(nn, path, symbols):
    meta, lines, blocks = parse_page(path)
    imports = meta.get('imports') or 'Main'
    mod = f'Module_{nn}'
    main = [b for b in blocks if b['kind'] == 'main']
    sols = [b for b in blocks if b['kind'] == 'solution']
    theories = []
    text, starts = theory_text(mod, imports, main, symbols, path)
    theories.append({'session': mod, 'name': mod, 'text': text, 'blocks': list(zip(main, starts)),
                     'expect_error': None})
    if sols:
        text, starts = theory_text(mod + '_Solutions', mod, sols, symbols, path)
        theories.append({'session': mod, 'name': mod + '_Solutions', 'text': text,
                         'blocks': list(zip(sols, starts)), 'expect_error': None})
    probe = 0
    for idx, b in enumerate(blocks):
        if b['kind'] != 'fails':
            continue
        probe += 1
        before = [x for x in blocks[:idx] if x['kind'] == 'main']
        name = f'{mod}_Probe_{probe}'
        text, starts = theory_text(name, imports, before + [b], symbols, path)
        theories.append({'session': name, 'name': name, 'text': text,
                         'blocks': list(zip(before + [b], starts)), 'expect_error': b})
    return {'nn': nn, 'path': path, 'lines': lines, 'blocks': blocks, 'imports': imports,
            'theories': theories, 'meta': meta}


def needs_library(imports):
    return sorted({m.group(1) for m in re.finditer(r'"?(HOL-[\w-]+)\.', imports)})


def write_sessions(plans, isa_dir):
    if os.path.isdir(isa_dir):
        # keep heaps and databases elsewhere; only sources live here
        for entry in os.listdir(isa_dir):
            p = os.path.join(isa_dir, entry)
            shutil.rmtree(p) if os.path.isdir(p) else os.remove(p)
    os.makedirs(isa_dir, exist_ok=True)
    root = []
    sessions = {}
    for plan in plans:
        for th in plan['theories']:
            sessions.setdefault(th['session'], {'theories': [], 'libs': needs_library(plan['imports'])})
            sessions[th['session']]['theories'].append(th)
    for sess, info in sessions.items():
        d = os.path.join(isa_dir, sess)
        os.makedirs(d, exist_ok=True)
        for th in info['theories']:
            with open(os.path.join(d, th['name'] + '.thy'), 'w', encoding='utf-8') as fh:
                fh.write(th['text'])
        root.append(f'session {sess} in "{sess}" = HOL +')
        root.append('  options [document = false, show_states, timeout = 300]')
        if info['libs']:
            root.append('  sessions ' + ' '.join(f'"{lib}"' for lib in info['libs']))
        root.append('  theories')
        root.extend(f'    {th["name"]}' for th in info['theories'])
        root.append('')
    with open(os.path.join(isa_dir, 'ROOT'), 'w', encoding='utf-8') as fh:
        fh.write('\n'.join(root))
    return list(sessions)


# ---------------------------------------------------------------- running Isabelle

def run(cmd, **kw):
    return subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, **kw)


FALLBACK = set()   # (file, line) of errors known only from the "Build errors" copy (narrower layout)


def parse_log(text):
    """Messages from `isabelle build_log -U -v`: (file basename, line) -> [(kind, body)]."""
    msgs = {}
    lines = text.split('\n')
    i = 0
    cur = None
    in_errors = False
    pending = []

    def flush():
        nonlocal cur
        if cur:
            kind, line, file, body = cur
            while body and not body[-1].strip():
                body.pop()
            msgs.setdefault((os.path.basename(file), line), []).append((kind, '\n'.join(body)))
        cur = None

    while i < len(lines):
        ln = lines[i]
        if ln.startswith('Build errors:'):
            flush()
            in_errors = True
        elif in_errors:
            m = AT_COMMAND.match(ln)
            if m:
                key = (os.path.basename(m.group(2)), int(m.group(1)))
                if not any(k == 'Error' for k, _ in msgs.get(key, [])):
                    msgs.setdefault(key, []).append(('Error', '\n'.join(pending)))
                    FALLBACK.add(key)
                pending = []
            elif ln.startswith('*** '):
                pending.append(ln)
            elif ln.startswith('Return code'):
                in_errors = False
        else:
            m = HEADER.match(ln)
            if m:
                flush()
                cur = (m.group(1), int(m.group(2)), m.group(3), [])
            elif re.match(r'^Theory ".*" \(in .*\):$', ln):
                flush()
            elif cur is not None:
                cur[3].append(ln)
        i += 1
    flush()
    return msgs


def clean(body):
    """A message as Isabelle/jEdit shows it: positions as ⌂."""
    return HERE_POS.sub('⌂', body)


def same_text(a, b):
    """Equal apart from whitespace and line wrapping, ignoring the *** and ### prefixes of wrapped lines."""
    def norm(lines):
        return ' '.join(' '.join(re.sub(r'^(\*\*\*|###)( |$)', '', x) for x in lines).split())
    return norm(a) == norm(b)


def block_messages(th_name, start, nlines, msgs, opts):
    """The messages for an output block after a block of nlines lines starting at `start`."""
    lines_with = sorted(line for (f, line) in msgs if f == th_name + '.thy' and start <= line < start + nlines)
    if not lines_with:
        return []
    chosen = lines_with if 'all' in opts else [lines_with[-1]]
    out = []
    for line in chosen:
        for kind, body in msgs[(th_name + '.thy', line)]:
            if kind == 'Information':
                continue
            if 'state' in opts and kind != 'State':
                continue
            if 'result' in opts and kind == 'State':
                continue
            out.append(clean(body))
    return out


# ---------------------------------------------------------------- main

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--update', action='store_true')
    ap.add_argument('--module', action='append', default=[])
    ap.add_argument('--isabelle', default=DEFAULT_ISABELLE)
    ap.add_argument('--jobs', default='4')
    args = ap.parse_args()
    if not os.path.exists(args.isabelle):
        raise SystemExit(f'Isabelle not found at {args.isabelle}; set ISABELLE_TOOL or use --isabelle')
    symbols = load_symbols(args.isabelle)

    pages = sorted(f for f in os.listdir(SRC) if re.match(r'module_\d\d\.md$', f))
    wanted = {m.zfill(2) for m in args.module}
    plans = []
    for f in pages:
        nn = f[7:9]
        if wanted and nn not in wanted:
            continue
        plan = plan_module(nn, os.path.join(SRC, f), symbols)
        if plan['theories'][0]['blocks'] or len(plan['theories']) > 1:
            plans.append(plan)
    if not plans:
        print('no Isabelle blocks found')
        return

    # Guard: a user-level Pure or HOL heap (left by `isabelle build -f` or a build of Pure/HOL) hides the
    # prebuilt heaps of the distribution, and every build would then rebuild HOL (minutes, gigabytes).
    stray = sorted(glob.glob(os.path.expanduser(f'~/.isabelle/{VERSION}/heaps/*/Pure')) +
                   glob.glob(os.path.expanduser(f'~/.isabelle/{VERSION}/heaps/*/HOL')) +
                   glob.glob(os.path.expanduser(f'~/.isabelle/{VERSION}/heaps/*/log/Pure.db')) +
                   glob.glob(os.path.expanduser(f'~/.isabelle/{VERSION}/heaps/*/log/HOL.db')))
    if stray:
        raise SystemExit('stopped: user-level Pure/HOL heap files hide the prebuilt heaps, so this build would rebuild\n'
                         'HOL. Remove them (after stopping any running Isabelle builds), then run again:\n  '
                         + '\n  '.join(stray))

    # A run for some modules only uses its own directory, so that runs for different modules can go on
    # at the same time; only a full run writes the downloads.
    isa_dir = os.path.join(OUT, 'isa' if not wanted else 'isa-' + '-'.join(sorted(wanted)))
    # One Isabelle build at a time on this machine: each build needs 2-4 GB, and parallel builds by
    # several authors have run the container out of memory. Runs queue on a lock file. The build
    # directory is written only once the lock is held, so that two runs for the same module cannot
    # replace each other's theory files during a build.
    os.makedirs(OUT, exist_ok=True)
    lock = open(os.path.join(OUT, '.isa-build.lock'), 'w')
    try:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except BlockingIOError:
        print('waiting for another isa.py run to finish its Isabelle build ...', flush=True)
        fcntl.flock(lock, fcntl.LOCK_EX)
    sessions = write_sessions(plans, isa_dir)
    # Results must come from this run only: remove the databases and logs of this run's own sessions
    # (Module_NN, Module_NN_Solutions, Module_NN_Probe_K; never Pure or HOL). Otherwise a killed build, or
    # probes renumbered since an earlier run, would let build_log read old messages for other blocks.
    for heap_dir in glob.glob(os.path.expanduser(f'~/.isabelle/{VERSION}/heaps/*')):
        for sess in sessions:
            if not sess.startswith('Module_'):
                continue
            for f in (os.path.join(heap_dir, 'log', sess + '.db'), os.path.join(heap_dir, 'log', sess + '.gz'),
                      os.path.join(heap_dir, 'log', sess), os.path.join(heap_dir, sess)):
                if os.path.isfile(f):
                    os.remove(f)
    build = run([args.isabelle, 'build', '-d', isa_dir, '-j', args.jobs] + sessions)
    log = run([args.isabelle, 'build_log', '-U', '-v'] + sessions)
    msgs = parse_log(log.stdout)
    # A failed probe's log is sometimes incomplete: its whole theory section (every message) can be missing,
    # or its error is known only from the "Build errors" copy, wrapped at a narrower margin. Build such probes
    # again, up to three times, and keep a complete result as soon as one comes.
    def incomplete(text, names):
        # Errors at definitions (fun, primrec, definition …) appear only under "Build errors", even in a complete
        # log; what is missing in a bad log is the theory section with every other message.
        return sorted(s for s in names if not re.search(r'^Theory "' + re.escape(s) + r'\.', text, re.M))
    narrow = set(FALLBACK)
    todo = incomplete(log.stdout, [s for s in sessions if '_Probe_' in s])
    for _ in range(3):
        if not todo:
            break
        FALLBACK.clear()
        run([args.isabelle, 'build', '-d', isa_dir, '-j', args.jobs] + todo)
        text = run([args.isabelle, 'build_log', '-U', '-v'] + todo).stdout
        again, again_narrow = parse_log(text), set(FALLBACK)
        still = incomplete(text, todo)
        for sess in todo:
            if sess in still:
                continue      # this attempt is no better: keep what we have
            for key in [k for k in msgs if k[0][:-4] == sess]:
                del msgs[key]
            msgs.update({k: v for k, v in again.items() if k[0][:-4] == sess})
            narrow = {k for k in narrow if k[0][:-4] != sess} | {k for k in again_narrow if k[0][:-4] == sess}
        todo = still
    FALLBACK.clear()
    FALLBACK.update(narrow)
    if todo:
        print('incomplete Isabelle log for ' + ', '.join(todo) + ' after three attempts; its outputs may be partial')
    lock.close()
    killed = 'Killed' in build.stdout or 'Interrupt' in build.stdout

    problems = 0
    changes = {}          # page path -> list of (start, end, indent, new body lines)
    checked = 0
    for plan in plans:
        rel = os.path.relpath(plan['path'], ROOT)
        for th in plan['theories']:
            fname = th['name'] + '.thy'
            for b, start in th['blocks']:
                n = len(b['text'])
                errors = [(line, body) for (f, line), ms in msgs.items() if f == fname and start <= line < start + n
                          for kind, body in ms if kind == 'Error']
                is_probe_target = th['expect_error'] is b
                if is_probe_target:
                    if not errors:
                        print(f'{rel}:{b["start"] + 1}: this "fails" block did not fail')
                        problems += 1
                elif errors and th['expect_error'] is None:
                    # errors in a probe's earlier blocks are reported by the module theory itself
                    for line, body in errors:
                        md_line = b['start'] + 2 + (line - start)
                        print(f'{rel}:{md_line}: Isabelle error:\n    ' + clean(body).replace('\n', '\n    '))
                        problems += 1
                # outputs belong to the block in the theory where it is checked for real:
                # normal blocks in the module (or solutions) theory, fails blocks in their probe
                owns_output = (th['expect_error'] is None and b['kind'] in ('main', 'solution')) or is_probe_target
                if b['output'] is not None and owns_output:
                    got = block_messages(th['name'], start, n, msgs, b['output']['opts'])
                    want = '\n\n'.join(got).split('\n') if got else []
                    have = b['output']['text']
                    checked += 1
                    varies = 'varies' in b['output']['opts']
                    if not want and not [x for x in have if x.strip()]:
                        problems += 1
                        print(f'--- {rel}:{b["output"]["start"] + 1}: Isabelle printed nothing for this block and the output '
                              'block is empty' + (' (the build was killed or interrupted; run again)' if killed else
                                                  ': remove the output block, or change the Isabelle text'))
                    elif not want and [x for x in have if x.strip()]:
                        problems += 1
                        print(f'--- {rel}:{b["output"]["start"] + 1}: Isabelle printed nothing for this block'
                              + (' (the build was killed or interrupted; run again)' if killed else '')
                              + '; the output block is kept as it is')
                    elif varies and [x for x in have if x.strip()] and want:
                        pass        # captured once from a real run; differs between runs (e.g. Sledgehammer)
                    elif same_text(have, want):
                        # equal up to line wrapping (Isabelle wraps the two copies of an error differently);
                        # with --update, prefer the full-width layout that Isabelle/jEdit shows
                        narrow = any((th['name'] + '.thy', l) in FALLBACK for l in range(start, start + n + 1))
                        if args.update and not narrow and [x.rstrip() for x in have] != [x.rstrip() for x in want]:
                            print(f'--- {rel}:{b["output"]["start"] + 1}: output re-wrapped as Isabelle/jEdit shows it')
                            changes.setdefault(plan['path'], []).append(
                                (b['output']['start'], b['output']['end'], b['output']['indent'], want))
                    elif [x.rstrip() for x in have] != [x.rstrip() for x in want]:
                        problems += 1
                        print(f'--- {rel}:{b["output"]["start"] + 1}: output differs')
                        for x in have:
                            print('    -' + x)
                        for x in want:
                            print('    +' + x)
                        changes.setdefault(plan['path'], []).append(
                            (b['output']['start'], b['output']['end'], b['output']['indent'], want))
        # errors in a probe's prefix are reported by the module theory itself

    if build.returncode != 0:
        unexpected = [s for s in sessions if '_Probe_' not in s]
        failed = re.findall(r'Unfinished session\(s\): (.*)', build.stdout)
        failed = [s for line in failed for s in line.split(', ')]
        bad = [s for s in failed if s in unexpected]
        if bad:
            print('sessions that failed: ' + ', '.join(bad))
            print('\n'.join(build.stdout.split('\n')[-40:]))
            problems += 1

    if args.update and changes:
        for path, edits in changes.items():
            with open(path, encoding='utf-8') as fh:
                text = fh.read()
            if text != PAGE_TEXT.get(path):
                problems += 1
                print(f'{os.path.relpath(path, ROOT)} changed while Isabelle was running: nothing written; run again')
                continue
            lines = text.split('\n')
            for start, end, indent, body in sorted(edits, reverse=True):
                lines[start + 1:end] = [(indent + x.rstrip()) if x.strip() else "" for x in body]
            with open(path, 'w', encoding='utf-8') as fh:
                fh.write('\n'.join(lines))
            print(f'updated {len(edits)} output block(s) in {os.path.relpath(path, ROOT)}')

    if not wanted:
        write_downloads(plans, symbols)
    print(f'{len(plans)} module(s), {sum(len(t["blocks"]) for p in plans for t in p["theories"] if t["expect_error"] is None)} '
          f'block(s) checked with {VERSION}; {checked} output block(s); '
          + ('all outputs match' if not problems else f'{problems} problem(s)'))
    sys.exit(1 if problems and not args.update else 0)


def write_downloads(plans, symbols):
    """Reader-facing theories: every module and solutions theory, a ROOT file, a README, a ZIP."""
    d = os.path.join(OUT, 'theories')
    os.makedirs(d, exist_ok=True)
    names, libs = [], set()
    for plan in plans:
        for th in plan['theories']:
            if th['expect_error'] is None:
                with open(os.path.join(d, th['name'] + '.thy'), 'w', encoding='utf-8') as fh:
                    fh.write(th['text'])
        libs.update(needs_library(plan['imports']))
    have = sorted(f[:-4] for f in os.listdir(d) if f.endswith('.thy'))
    root = ['session Formal_Methods = HOL +', '  options [document = false]']
    if libs:
        root.append('  sessions ' + ' '.join(f'"{x}"' for x in sorted(libs)))
    root.append('  theories')
    root.extend(f'    {n}' for n in have)
    with open(os.path.join(d, 'ROOT'), 'w', encoding='utf-8') as fh:
        fh.write('\n'.join(root) + '\n')
    with open(os.path.join(d, 'README.txt'), 'w', encoding='utf-8') as fh:
        fh.write(f'Formal Methods with Isabelle: the theories of every module and the exercise solutions,\n'
                 f'checked with {VERSION}. Open a .thy file in Isabelle/jEdit, or check them all with\n'
                 f'    isabelle build -D .\n')
    with zipfile.ZipFile(os.path.join(OUT, 'formal-methods-theories.zip'), 'w', zipfile.ZIP_DEFLATED) as z:
        for f in sorted(os.listdir(d)):
            z.write(os.path.join(d, f), 'formal-methods-theories/' + f)


if __name__ == '__main__':
    main()
