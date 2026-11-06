"""Rewrite Git 2.43 messages into the wording of Git 2.56, the release readers install.

The replay runs the Git of the build machine (2.43). Each rule below is a message whose wording
changed between v2.43.0 and v2.56.0, found by comparing the two releases' source (see
notes/FACTS.md, "Git messages"). Keep the rules few, exact and justified.
"""
import re

RULES = [
    # builtin/pack-objects.c: 2.44 added "(from N)", the number of packs objects were reused from.
    # Nothing is reused from a pack in the sandbox, so N is 0 whenever the count before it is 0.
    (r'^((?:remote: )?Total \d+ \(delta \d+\), reused \d+ \(delta \d+\), pack-reused 0)$', r'\1 (from 0)'),
    # builtin/branch.c: the second line became a hint (advise_if_enabled, ADVICE_FORCE_DELETE_BRANCH),
    # which advice.c follows with how to turn it off, now with `git config set`.
    (r"^error: the branch '([^']+)' is not fully merged\.\nIf you are sure you want to delete it, run 'git branch -D \1'$",
     "error: the branch '\\1' is not fully merged\n"
     "hint: If you are sure you want to delete it, run 'git branch -D \\1'\n"
     'hint: Disable this message with "git config set advice.forceDeleteBranch false"'),
]


def rewrite(text):
    for pattern, repl in RULES:
        text = re.sub(pattern, repl, text, flags=re.M)
    return text
