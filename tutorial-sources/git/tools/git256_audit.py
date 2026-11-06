"""Find output lines in the lessons whose Git message changed between two Git releases.

    python3 -I tools/git256_audit.py OLD_SRC NEW_SRC

OLD_SRC and NEW_SRC are checkouts of git/git at the two tags (here v2.43.0, the build machine's
Git, and v2.56.0, the current release). The script collects the message strings of both (the
arguments of _(), N_(), Q_()), keeps those the old release has and the new one does not, and
reports every output line in src/en/lesson_*.md that one of them could have produced, with the
closest new message. Each finding is then checked by hand and, if real, becomes a rule in
tools/git256.py. Output lines that git256.py has already rewritten no longer match the old text,
so a clean run means every changed message the lessons show is handled.
"""
import difflib
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OLD, NEW = sys.argv[1], sys.argv[2]

LIT = re.compile(r'"((?:[^"\\]|\\.)*)"')
MACRO = {'PRIuMAX': 'lu', 'PRIu32': 'u', 'PRIdMAX': 'ld', 'PRIu64': 'lu', 'PRItime': 'lu'}


def messages(src):
    """Message strings in a Git source tree: the arguments of _(), N_() and Q_()."""
    out = set()
    for dirpath, _, files in os.walk(src):
        if '/t/' in dirpath + '/' or '/po' in dirpath:
            continue
        for f in files:
            if not f.endswith(('.c', '.h')):
                continue
            text = open(os.path.join(dirpath, f), encoding='utf-8', errors='replace').read()
            for m in re.finditer(r'\b(?:_|N_|Q_)\(', text):
                i = m.end()
                buf, parts = '', []
                # read string literals (and the PRI* macros between them) up to the closing paren
                while i < len(text):
                    lm = re.compile(r'\s*(?:"((?:[^"\\]|\\.)*)"|(PRI\w+)|(,))').match(text, i)
                    if not lm:
                        break
                    if lm.group(3):          # Q_("one", "many"): the second is a message too
                        if buf:
                            parts.append(buf)
                        buf = ''
                    elif lm.group(2):
                        buf += MACRO.get(lm.group(2), 'u')
                    else:
                        buf += lm.group(1)
                    i = lm.end()
                if buf:
                    parts.append(buf)
                for p in parts:
                    out.add(bytes(p, 'utf-8').decode('unicode_escape', errors='replace'))
    return out


def pattern(msg):
    """A regex for one line of a printf-style message."""
    rx = ''
    for tok in re.split(r'(%[-#+ 0]*(?:\*|\d+)?(?:\.(?:\*|\d+))?(?:hh|h|ll|l|z|j|t)?[sdiuxXc%])', msg):
        if not tok:
            continue
        if tok == '%%':
            rx += '%'
        elif tok.startswith('%'):
            rx += '.*?'
        else:
            rx += re.escape(tok)
    return rx


def output_lines():
    for f in sorted(os.listdir(os.path.join(ROOT, 'src', 'en'))):
        if not (f.startswith('lesson_') or f == 'troubleshooting.md'):
            continue
        lines = open(os.path.join(ROOT, 'src', 'en', f), encoding='utf-8').read().split('\n')
        in_term = False
        for n, ln in enumerate(lines, 1):
            s = ln.strip()
            if s.startswith('```terminal'):
                in_term = 'norun' not in s
                continue
            if s.startswith('```'):
                in_term = False
                continue
            if in_term and s and not s.startswith('$ '):
                yield f, n, s


def main():
    old, new = messages(OLD), messages(NEW)
    gone = [m for m in old - new if len(m.strip()) >= 8]
    print(f'{len(old)} messages in the old release, {len(new)} in the new; {len(gone)} changed or removed')
    compiled = []
    # a line of an old message that the new release still prints (alone, or in another message)
    # did not change
    new_frags = {f.strip() for m in new for f in m.split('\n')}
    for m in gone:
        for frag in m.split('\n'):
            if frag.strip() in new_frags:
                continue
            if len(frag.strip()) >= 8 and re.search(r'[A-Za-z]{3}', frag):
                try:
                    compiled.append((m, frag, re.compile(pattern(frag.strip()))))
                except re.error:
                    pass
    newlist = sorted(new)
    seen = set()
    for f, n, line in output_lines():
        body = re.sub(r'^(remote|hint|error|fatal|warning):\s*', '', line)
        for m, frag, rx in compiled:
            if rx.fullmatch(body) or (len(frag.strip()) >= 25 and rx.search(body)):
                key = (frag, line)
                if key in seen:
                    continue
                seen.add(key)
                close = difflib.get_close_matches(m, newlist, n=1, cutoff=0.5)
                print(f'{f}:{n}: {line}\n    old: {m!r}\n    new: {close[0]!r}' if close else
                      f'{f}:{n}: {line}\n    old: {m!r}\n    new: (no close match)')
    print('done')


if __name__ == '__main__':
    main()
