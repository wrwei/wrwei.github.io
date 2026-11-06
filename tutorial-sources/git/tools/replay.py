"""Run every command of the Git series in order and check (or write) the outputs the text shows.

    python3 tools/replay.py              check: report each block whose output differs
    python3 tools/replay.py --update     write the real outputs into the English sources
    python3 tools/replay.py --keep       keep the sandboxes afterwards (/tmp/gitreplay, /tmp/gitreplay-trouble)
    python3 tools/replay.py --lessons 3-5  stop after lesson 5 (lessons always start from 2)

What it runs, in this order, from src/en/lesson_02.md to the last lesson:
  ```terminal          each "$ command" line, in a pseudo-terminal, so Git prints what it prints
                       for a person (progress lines, branch labels in git log); the lines after a
                       command are its expected output
  ```file NAME         writes the block's content to NAME (relative to the current folder)
  <!-- replay: ... --> runs the comment's text as a bash script: what the reader does by hand
                       on GitHub's website, done with the gh-* helpers below
Blocks marked norun, blocks inside ::: tab containers, and `code ...` commands are skipped.

The sandbox: a home folder that outputs show as /Users/you, its own global Git config, a fixed
clock (one minute per command, each lesson on its own day) so commit hashes never change, and
bare repositories under remote/ that play GitHub (https://github.com/ is rewritten to them).
"""
import argparse
import datetime
import difflib
import fcntl
import os
import pty
import re
import select
import shutil
import struct
import subprocess
import sys
import tempfile
import termios

import json

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)   # run with python3 -I, which leaves the script's folder off the path
import git256  # noqa: E402

STATES = os.path.join(os.path.dirname(HERE), 'replay', 'file-states.json')

ROOT = os.path.dirname(HERE)
SRC = os.path.join(ROOT, 'src', 'en')

USER = 'your-username'
NAME = 'Your Name'
EMAIL = '12345678+your-username@users.noreply.github.com'
SHOWN_HOME = '/Users/you'

# ---------------------------------------------------------------- the sandbox


class Sandbox:
    def __init__(self, keep=False, name='gitreplay'):
        # A fixed place, not a random temporary folder: `git pull` writes the remote's address
        # into its merge message, so the path must be the same on every run and every machine
        # for the commit hashes to be. The lessons and the troubleshooting page each have their own.
        self.base = os.path.join(os.environ.get('REPLAY_TMP', '/tmp'), name)
        shutil.rmtree(self.base, ignore_errors=True)
        os.makedirs(self.base)
        self.keep = keep
        self.home = os.path.join(self.base, 'Users', 'you')
        self.remote = os.path.join(self.base, 'remote')
        self.bin = os.path.join(self.base, 'bin')
        for d in (self.home, self.remote, self.bin):
            os.makedirs(d)
        self.sysconfig = os.path.join(self.base, 'gitconfig-system')
        with open(self.sysconfig, 'w') as f:
            # Only what makes the sandbox behave like a reader's machine and GitHub. Everything a
            # reader sets is set by the commands in Lesson 2, in the global config.
            f.write(f'[url "file://{self.remote}/"]\n\tinsteadOf = https://github.com/\n'
                    '[core]\n\tpager = cat\n'
                    '[color]\n\tui = never\n'
                    '[pack]\n\tthreads = 8\n'
                    '[protocol "file"]\n\tallow = always\n')
        self.write_helpers()
        self.cwd = self.home
        self.clock = datetime.datetime(2026, 11, 2, 10, 0, tzinfo=datetime.timezone.utc)

    def close(self):
        if self.keep:
            print(f'sandbox kept at {self.base}')
        else:
            shutil.rmtree(self.base, ignore_errors=True)

    def next_day(self):
        d = self.clock + datetime.timedelta(days=1)
        self.clock = d.replace(hour=10, minute=0)

    def tick(self):
        self.clock += datetime.timedelta(minutes=1)
        return self.clock.strftime('%Y-%m-%dT%H:%M:%S+0000')

    def env(self, tick=True):
        # every command the reader runs moves the clock on a minute; the replay's own checks do not
        t = self.tick() if tick else self.clock.strftime('%Y-%m-%dT%H:%M:%S+0000')
        e = {
            'HOME': self.home, 'PATH': self.bin + ':/usr/local/bin:/usr/bin:/bin',
            'TERM': 'xterm-256color', 'LANG': 'C.UTF-8', 'LC_ALL': 'C.UTF-8', 'TZ': 'UTC',
            'GIT_CONFIG_SYSTEM': self.sysconfig, 'GIT_EDITOR': 'true', 'GIT_TERMINAL_PROMPT': '0',
            'GIT_AUTHOR_DATE': t, 'GIT_COMMITTER_DATE': t,
            'REPLAY_REMOTE': self.remote, 'REPLAY_NAME': NAME, 'REPLAY_EMAIL': EMAIL,
            'COLUMNS': '100', 'LINES': '40',
        }
        return e

    def write_helpers(self):
        """gh-* commands that do what the reader does on GitHub's website."""
        hook = r'''#!/bin/bash
# GitHub prints this after a push that creates a branch other than the default one.
while read old new ref; do
  b=${ref#refs/heads/}
  if [ "$old" = "0000000000000000000000000000000000000000" ] && [ "$b" != "main" ] && [ "${REPLAY_QUIET:-}" != 1 ]; then
    owner=$(basename "$(dirname "$PWD")"); repo=$(basename "$PWD" .git)
    echo
    echo "Create a pull request for '$b' on GitHub by visiting:"
    echo "     https://github.com/$owner/$repo/pull/new/$b"
    echo
  fi
done
'''
        helpers = {
            # gh-new-repo OWNER/NAME [readme]: a repository as "Create repository" makes it, empty,
            # or with "Add README" on (one commit, "Initial commit", made by GitHub)
            'gh-new-repo': r'''#!/bin/bash
set -e
d="$REPLAY_REMOTE/$1.git"
git init -q --bare -b main "$d"
git -C "$d" config receive.unpackLimit 1
cp "$(dirname "$0")/_post-receive" "$d/hooks/post-receive"
chmod +x "$d/hooks/post-receive"
if [ "$2" = readme ]; then
  t=$(mktemp -d)
  git clone -q "$d" "$t/w" 2>/dev/null
  cd "$t/w"
  printf '# %s\n' "${1#*/}" > README.md
  git add README.md
  GIT_AUTHOR_NAME="$REPLAY_NAME" GIT_AUTHOR_EMAIL="$REPLAY_EMAIL" GIT_COMMITTER_NAME=GitHub GIT_COMMITTER_EMAIL=noreply@github.com \
    git -c user.name=x -c user.email=x commit -q -m "Initial commit"
  git branch -q -M main
  REPLAY_QUIET=1 git push -q origin main 2>/dev/null
  rm -rf "$t"
fi
''',
            # gh-web-edit OWNER/NAME BRANCH FILE "MESSAGE" < content: edit a file on the website
            'gh-web-edit': r'''#!/bin/bash
set -e
t=$(mktemp -d)
git clone -q "$REPLAY_REMOTE/$1.git" "$t/w"
cd "$t/w"
git switch -q "$2"
cat > "$3"
git add "$3"
GIT_AUTHOR_NAME="$REPLAY_NAME" GIT_AUTHOR_EMAIL="$REPLAY_EMAIL" GIT_COMMITTER_NAME=GitHub GIT_COMMITTER_EMAIL=noreply@github.com \
  git -c user.name=x -c user.email=x commit -q -m "$4"
REPLAY_QUIET=1 git push -q origin "$2" 2>/dev/null
rm -rf "$t"
''',
            # gh-merge-pr OWNER/NAME NUMBER BRANCH "TITLE": "Merge pull request" with a merge commit
            'gh-merge-pr': r'''#!/bin/bash
set -e
t=$(mktemp -d)
git clone -q "$REPLAY_REMOTE/$1.git" "$t/w"
cd "$t/w"
owner=${1%%/*}
GIT_AUTHOR_NAME="$REPLAY_NAME" GIT_AUTHOR_EMAIL="$REPLAY_EMAIL" GIT_COMMITTER_NAME=GitHub GIT_COMMITTER_EMAIL=noreply@github.com \
  git -c user.name=x -c user.email=x merge -q --no-ff "origin/$3" -m "Merge pull request #$2 from $owner/$3" -m "$4"
REPLAY_QUIET=1 git push -q origin main 2>/dev/null
rm -rf "$t"
''',
            # gh-delete-branch OWNER/NAME BRANCH: the "Delete branch" button
            'gh-delete-branch': r'''#!/bin/bash
set -e
git -C "$REPLAY_REMOTE/$1.git" update-ref -d "refs/heads/$2"
''',
        }
        with open(os.path.join(self.bin, '_post-receive'), 'w') as f:
            f.write(hook)
        for name, body in helpers.items():
            p = os.path.join(self.bin, name)
            with open(p, 'w') as f:
                f.write(body)
            os.chmod(p, 0o755)

    # ------------------------------------------------------------ running things

    def run_shown(self, cmd):
        """Run a command the reader types; return what their terminal shows."""
        if re.match(r'^cd(\s|$)', cmd):
            return self.cd(cmd[2:].strip())
        out = run_pty(cmd, self.cwd, self.env())
        if re.match(r'^git (pull|fetch)( --prune)?\s*$', cmd):
            self.follow_remote_head()
        return self.normalise(out)

    def follow_remote_head(self):
        """Do what Git 2.48 and later do after a fetch from a configured remote with no refspec
        on the command line: create refs/remotes/origin/HEAD if it is missing
        (remote.<name>.followRemoteHEAD, default "create"; builtin/fetch.c, set_head). The build
        machine's Git 2.43 does not, and it shows in `git log` as the label origin/HEAD."""
        run = lambda *a: subprocess.run(['git', *a], cwd=self.cwd, env=self.env(tick=False), capture_output=True, text=True)
        if run('rev-parse', '--git-dir').returncode != 0:
            return
        if run('symbolic-ref', '-q', 'refs/remotes/origin/HEAD').returncode == 0:
            return
        if run('rev-parse', '-q', '--verify', 'refs/remotes/origin/main').returncode == 0:
            run('symbolic-ref', 'refs/remotes/origin/HEAD', 'refs/remotes/origin/main')

    def run_hidden(self, script):
        """Run a replay comment. A line "@cd DIR" moves the sandbox's current folder, as when the
        reader opens a folder in VS Code; everything else runs as bash."""
        chunk = []

        def flush():
            body = '\n'.join(chunk).strip()
            chunk.clear()
            if not body:
                return
            p = subprocess.run(['bash', '--noprofile', '--norc', '-e', '-c', body], cwd=self.cwd, env=self.env(),
                               capture_output=True, text=True)
            if p.returncode != 0:
                raise RuntimeError(f'replay step failed ({p.returncode}):\n{body}\n{p.stdout}{p.stderr}')
        for line in script.split('\n'):
            m = re.match(r'^\s*@cd\s+(.+?)\s*$', line)
            if m:
                flush()
                if self.cd(m.group(1)):
                    raise RuntimeError(f'replay: no folder {m.group(1)}')
            else:
                chunk.append(line)
        flush()

    def cd(self, arg):
        target = arg or '~'
        if target == '~' or target.startswith('~/'):
            target = self.home + target[1:]
        path = os.path.normpath(os.path.join(self.cwd, target))
        if not os.path.isdir(path):
            return f'bash: cd: {arg}: No such file or directory'
        self.cwd = path
        return ''

    def write_file(self, name, content):
        p = os.path.join(self.cwd, name)
        os.makedirs(os.path.dirname(p), exist_ok=True)
        with open(p, 'w', encoding='utf-8', newline='\n') as f:
            f.write(content)

    def normalise(self, text):
        text = text.replace(f'file://{self.remote}/', 'https://github.com/')
        text = text.replace(self.remote + '/', 'https://github.com/')
        text = text.replace(self.home, SHOWN_HOME)
        text = text.replace(self.base, '/tmp')
        # Git names the machine when it cannot work out an email address
        text = re.sub(r"(unable to auto-detect email address \(got ')[^']*('\))", r"\1you@laptop.(none)\2", text)
        return git256.rewrite(text)


def run_pty(cmd, cwd, env, timeout=120):
    master, slave = pty.openpty()
    fcntl.ioctl(slave, termios.TIOCSWINSZ, struct.pack('HHHH', 40, 100, 0, 0))
    p = subprocess.Popen(['bash', '--noprofile', '--norc', '-c', cmd], cwd=cwd, env=env,
                         stdin=slave, stdout=slave, stderr=slave, close_fds=True, start_new_session=True)
    os.close(slave)
    chunks = []
    while True:
        r, _, _ = select.select([master], [], [], timeout)
        if not r:
            p.kill()
            chunks.append(b'\n[replay: timed out]')
            break
        try:
            data = os.read(master, 65536)
        except OSError:
            break
        if not data:
            break
        chunks.append(data)
    p.wait()
    os.close(master)
    return screen(b''.join(chunks).decode('utf-8', 'replace'))


CSI = re.compile(r'(\r|\x1b\[[0-9;?]*[A-Za-z]|\x1b[()][A-Z0-9]|\x1b[=>])')


def screen(raw):
    """What a terminal shows for raw output: carriage returns overwrite, ESC[K erases."""
    lines = []
    for line in raw.replace('\r\n', '\n').split('\n'):
        cur, pos = [], 0
        for tok in CSI.split(line):
            if not tok:
                continue
            if tok == '\r':
                pos = 0
            elif tok.startswith('\x1b'):
                if tok.endswith('K'):
                    del cur[pos:]
            else:
                for ch in tok:
                    if pos < len(cur):
                        cur[pos] = ch
                    else:
                        cur.append(ch)
                    pos += 1
        lines.append(''.join(cur).rstrip())
    while lines and not lines[-1]:
        lines.pop()
    return '\n'.join(lines)

# ---------------------------------------------------------------- reading the lessons


FENCE = re.compile(r'^(\s*)(`{3,})(.*)$')


def parse(path):
    """Yield the steps of a lesson in order: (kind, info, start_line, end_line, indent, body)."""
    with open(path, encoding='utf-8') as f:
        lines = f.read().split('\n')
    steps = []
    i = 0
    tab_depth = 0
    while i < len(lines):
        line = lines[i]
        m = FENCE.match(line)
        if m:
            indent, ticks, info = m.group(1), m.group(2), m.group(3).strip()
            j = i + 1
            while j < len(lines) and not re.match(r'^\s*' + ticks + r'`*\s*$', lines[j]):
                j += 1
            body = [ln[len(indent):] if ln.startswith(indent) else ln.lstrip() for ln in lines[i + 1:j]]
            kind = info.split()[0] if info else ''
            if kind in ('terminal', 'file'):
                skip = tab_depth > 0 and 'run' not in info.split()[1:]
                steps.append({'kind': kind, 'info': info, 'start': i, 'end': j, 'indent': indent,
                              'body': body, 'skip': skip or 'norun' in info.split()})
            i = j + 1
            continue
        if re.match(r'^\s*:::\s*tab\b', line):
            tab_depth += 1
        elif tab_depth and re.match(r'^\s*:::\s*$', line):
            tab_depth -= 1
        if line.strip().startswith('<!-- replay:'):
            j = i
            while '-->' not in lines[j]:
                j += 1
            text = '\n'.join(lines[i:j + 1])
            script = text.split('<!-- replay:', 1)[1].rsplit('-->', 1)[0]
            steps.append({'kind': 'replay', 'start': i, 'end': j, 'body': script, 'skip': False})
            i = j + 1
            continue
        i += 1
    return lines, steps


def split_terminal(body):
    """[(command, [expected output lines])] from a terminal block."""
    out = []
    for ln in body:
        if ln.startswith('$ ') or ln == '$':
            out.append([ln[2:], []])
        elif out:
            out[-1][1].append(ln)
    return [(c, '\n'.join(o).rstrip()) for c, o in out]


SPEED = re.compile(r'\d+(?:\.\d+)? (?:bytes|KiB|MiB|GiB)/s')
VERSION = re.compile(r'^git version \S+$', re.M)


def comparable(s):
    s = SPEED.sub('<speed>', s)
    s = VERSION.sub('git version <any>', s)
    return '\n'.join(ln.rstrip() for ln in s.split('\n')).strip('\n')


def merge_kept(expected, actual):
    """Keep the text's own values for what changes from run to run (speeds, the version line)."""
    if comparable(expected) == comparable(actual):
        return expected
    return actual


HEX = re.compile(r'\b[0-9a-f]{7,40}\b')


def hash_changes(expected, actual):
    """Old -> new commit hashes, from an output whose lines differ only in their hashes. The prose
    quotes hashes from the outputs, so when an output's hash changes, the prose must follow."""
    found = {}
    e_lines, a_lines = expected.split('\n'), actual.split('\n')
    if len(e_lines) != len(a_lines):
        return found
    for e, a in zip(e_lines, a_lines):
        eh, ah = HEX.findall(e), HEX.findall(a)
        if len(eh) != len(ah) or HEX.sub('#', e) != HEX.sub('#', a):
            continue
        for o, n in zip(eh, ah):
            if o != n and len(o) == len(n):
                found[o] = n
                if len(o) == 40:
                    found[o[:7]] = n[:7]
    return found

# ---------------------------------------------------------------- main


def lesson_files(last):
    files = sorted(f for f in os.listdir(SRC) if re.match(r'^lesson_\d\d\.md$', f))
    return [os.path.join(SRC, f) for f in files if 2 <= int(f[7:9]) <= last]


class Run:
    """Totals of one replay: what differs, what to rewrite, and what the build needs."""
    def __init__(self, update):
        self.update = update
        self.problems = self.commands = 0
        self.hashes = {}
        self.file_states = {}


def replay_file(box, path, run):
    """Run one source page's steps in the sandbox, compare the outputs, and (with --update)
    write the real ones into the page."""
    lines, steps = parse(path)
    rel = os.path.relpath(path, ROOT)
    # the text's expected outputs never change what runs, so replacements are collected and
    # applied bottom-up once the page is done
    replacements = []
    for st in steps:
        if st['skip']:
            continue
        if st['kind'] == 'replay':
            box.run_hidden(st['body'])
            continue
        if st['kind'] == 'file':
            name = st['info'].split()[1]
            # what the file held just before this step, so the page can highlight the lines the
            # reader has to change (after `git restore` it is not simply the previous block)
            p = os.path.join(box.cwd, name)
            before = open(p, encoding='utf-8').read() if os.path.exists(p) else None
            run.file_states.setdefault(os.path.basename(path), []).append(before)
            shown = '\n'.join(st['body']).rstrip('\n') + '\n'
            if 'check' in st['info'].split()[2:]:
                # ```file NAME check: the block shows what Git wrote (a conflict, say)
                if shown != (before or ''):
                    run.problems += 1
                    print(f'--- {rel}:{st["start"] + 1}: file {name} differs from what is on disk')
                    for d in difflib.unified_diff(shown.split('\n'), (before or '').split('\n'),
                                                  'text', 'on disk', lineterm='', n=1):
                        print('    ' + d)
                    ind = st['indent']
                    replacements.append((st['start'] + 1, st['end'],
                                         [(ind + b) if b else '' for b in (before or '').rstrip('\n').split('\n')]))
                continue
            box.write_file(name, shown)
            continue
        new_body = []
        for cmd, expected in split_terminal(st['body']):
            run.commands += 1
            actual = expected if re.match(r'^code(\s|$)', cmd) else box.run_shown(cmd)
            if comparable(expected) != comparable(actual):
                run.hashes.update(hash_changes(expected, actual))
                run.problems += 1
                print(f'--- {rel}:{st["start"] + 1}: $ {cmd}')
                for d in difflib.unified_diff(comparable(expected).split('\n'), comparable(actual).split('\n'),
                                              'text', 'actual', lineterm='', n=1):
                    print('    ' + d)
            kept = merge_kept(expected, actual)
            new_body.append('$ ' + cmd if cmd else '$')
            new_body.extend(kept.split('\n') if kept else [])
        if new_body != st['body']:
            ind = st['indent']
            replacements.append((st['start'] + 1, st['end'], [(ind + b) if b else '' for b in new_body]))
    if run.update and replacements:
        for a, b, new in sorted(replacements, reverse=True):
            lines[a:b] = new
        with open(path, 'w', encoding='utf-8', newline='\n') as f:
            f.write('\n'.join(lines))
        print(f'updated {len(replacements)} block(s) in {rel}')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--update', action='store_true')
    ap.add_argument('--keep', action='store_true')
    ap.add_argument('--lessons', default='2-99')
    args = ap.parse_args()
    last = int(args.lessons.split('-')[-1])
    run = Run(args.update)
    # the lessons run in order, in one sandbox: each starts where the last one ended
    box = Sandbox(keep=args.keep)
    try:
        for path in lesson_files(last):
            box.next_day()
            replay_file(box, path, run)
    finally:
        box.close()
    # the troubleshooting page sets up each of its examples itself, in a sandbox of its own
    trouble = os.path.join(SRC, 'troubleshooting.md')
    if os.path.exists(trouble) and last >= 11:
        box = Sandbox(keep=args.keep, name='gitreplay-trouble')
        try:
            box.next_day()
            replay_file(box, trouble, run)
        finally:
            box.close()
    # read by the build: page -> [content before each ```file block, in order]
    os.makedirs(os.path.dirname(STATES), exist_ok=True)
    with open(STATES, 'w', encoding='utf-8') as f:
        json.dump(run.file_states, f, indent=1, ensure_ascii=False)
    if args.update and run.hashes:
        # the prose quotes hashes from the outputs: carry the new ones into every source page
        alt = re.compile(r'\b(' + '|'.join(sorted(map(re.escape, run.hashes), key=len, reverse=True)) + r')\b')
        pages = [os.path.join(ROOT, 'src', lang, f) for lang in ('en', 'zh')
                 if os.path.isdir(os.path.join(ROOT, 'src', lang))
                 for f in sorted(os.listdir(os.path.join(ROOT, 'src', lang))) if f.endswith('.md')]
        for p in pages:
            with open(p, encoding='utf-8') as f:
                text = f.read()
            new = alt.sub(lambda m: run.hashes[m.group(1)], text)
            if new != text:
                with open(p, 'w', encoding='utf-8', newline='\n') as f:
                    f.write(new)
                print(f'carried {len(set(alt.findall(text)))} hash(es) into {os.path.relpath(p, ROOT)}')
    print(f'{run.commands} commands run; ' + (f'{run.problems} output(s) differ' if run.problems else 'all outputs match'))
    return 1 if run.problems and not args.update else 0


if __name__ == '__main__':
    sys.exit(main())
