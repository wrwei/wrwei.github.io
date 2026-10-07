# Git and Version Control Series: Modules 3–5 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish-ready Modules 3 (History and undoing), 4 (Branches) and 5 (Merge conflicts) in English and Chinese. This includes two small tooling changes that branches and conflicts need.

**Architecture:** The tooling, page templates and checks from `PLAN.md` (Modules 1–2) stay as they are, with two exceptions:
- Commit graphs now read full ref names, so a local branch called `feature/login` is no longer drawn as a remote branch.
- Sessions gain a hidden setup step that must fail (`>!`), so a session can start in the middle of a conflicted merge.

Each module adds a configuration file, command sessions pinned by tests, and English and Chinese lessons written from frames.

**Tech Stack:**
- Node 22.2+ (`node:test`; `markdown-it` and `puppeteer-core` via `tutorial-sources/ai/tools`);
- Git, exactly `git version 2.50.1 (Apple Git-155)`;
- Chrome or Edge;
- MkDocs (root `requirements.txt`).

**Spec:** `tutorial-sources/git/SPEC.md` (approved 2026-10-07): §3 (Modules 3–5 rows and teaching choices), §4 (command sessions), §6 (quality checks). Read it, and `tutorial-sources/git/README.md`, before starting.

**Provenance:** before this plan was written, every file in it was run in a scratch copy of the repository:
- the tests failed before each change, for the reasons given below;
- all 40 tests then passed;
- `build.mjs` built Modules 1–5 (29 sessions) with stand-in prose;
- `validate.mjs` passed;
- every external link in the frames returned HTTP 200;
- after the tooling change, a rebuild of Modules 1–2 was byte-identical to the published pages.

Copy code exactly as given.

## Global Constraints

- **Separate worktree.** Another agent is editing the MDE series in the main checkout at the same time. Work in the worktree `../wrwei.github.io-git-modules` (next to the main checkout), on branch `git-modules-03-05`. That branch was created from `main` to commit this plan. If the worktree is missing, recreate it from the main checkout and install the dependencies:
  ```bash
  git worktree add ../wrwei.github.io-git-modules git-modules-03-05
  cd ../wrwei.github.io-git-modules
  npm ci --prefix tutorial-sources/ai/tools
  ```
  Run every later command from that worktree's root.
- **Allowed paths.** Change only `tutorial-sources/git/`, `docs/tutorials/git/` and the Git card in `docs/tutorials/index.md`. Never touch `tutorial-sources/mde/` or `docs/tutorials/mde/`. Stage files by explicit path; never `git add -A` or `git add .`.
- **Git version.** The build runs only with `git version 2.50.1 (Apple Git-155)`, recorded as "gitVersion" in `plan/series.json`. Node 22.2 or later.
- **Bilingual.** Every module is in English (`en`) and Simplified Chinese (`zh`, HTML `lang="zh-CN"`). Both editions have the same sections, sessions, graphs, exercises and quiz answers.
- **Real output only.** Output shown on pages comes only from the build's runs of real Git. Never type expected output by hand.
- **Plain commands.** Sessions use only `git` and the built-ins `pwd`, `ls`, `cd`, `mkdir` and `cat`, with plain arguments: no pipes, redirection, wildcards or variables.
- **Modern commands first.** The modern commands `git switch` and `git restore` are taught. The older `git checkout` and `git reset` equivalents are noted (spec §3).
- **Shared files.** Do not modify the AI series' shared files: `tutorial-sources/ai/tools/md.mjs`, `docs/tutorials/ai/assets/style.css` and `docs/tutorials/ai/assets/tutorial.js`.
- **Commits.** Commit after each task. Commit messages end with the line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- **Publishing.** Do not push, merge into `main` or deploy unless the site owner explicitly asks (Task 7).

## Review Focus

1. **A local branch whose name contains a slash** (`feature/login`) drawn as a remote-tracking branch, in a different colour. Expected: drawn as a local branch, as in Module 4's naming advice. Pinned by the full-ref tests in `tests/graph.test.mjs` and `tests/session.test.mjs` (Task 1).
2. **A hidden setup step that should leave a conflict, but succeeds.** For example, a changed recipe merges cleanly. The session would then show a situation the lesson does not describe. Expected: the build stops and names the line. Pinned by the `>!` test in `tests/session.test.mjs` (Task 1), and by the conflict assertions in `tests/series-sessions.test.mjs` (Task 2).
3. **The tooling change altering the published Module 1–2 pages.** Expected: a rebuild of Modules 1–2 is byte-identical. Pinned by the rebuild check in Task 1, Step 6.
4. **Lesson text contradicting its transcript.** Examples: a hash, a diff's `@@` line numbers, conflict-marker line numbers, or a detached HEAD drawn on the wrong commit. Expected: the text matches what the build prints. Pinned by the Module 3–5 tests in `tests/series-sessions.test.mjs` (Task 2), which fix every value the frames quote.
5. **The Chinese edition drifting from the English one** in sessions, graphs or quiz answers. Expected: the build stops and names the difference. Pinned by the existing parity check, which every build in Tasks 3–5 runs.

## File Structure

```
tutorial-sources/git/
  PLAN-modules-03-05.md        this plan
  README.md                    session format gains ">!"; names this plan                        (Task 1)
  GLOSSARY.md                  terms for history, undoing, branches and conflicts                (Task 3)
  tools/session.mjs            ">!" steps; graphs read full ref names                            (Task 1)
  tools/graph.mjs              parseRefs understands full ref names                              (Task 1)
  tests/graph.test.mjs, tests/session.test.mjs                                                   (Task 1)
  tests/series-sessions.test.mjs   pins Modules 3–5 outputs                                      (Tasks 1–2)
  plan/module_03.json, plan/module_04.json, plan/module_05.json                                  (Task 2)
  sessions/module_03/*.session (8), sessions/module_04/*.session (6), sessions/module_05/*.session (5) (Task 2)
  src/en/module_03.md, src/zh/module_03.md                                                       (Task 3)
  src/en/module_04.md, src/zh/module_04.md                                                       (Task 4)
  src/en/module_05.md, src/zh/module_05.md                                                       (Task 5)
docs/tutorials/git/            generated: new pages; menus and overview updated                  (Tasks 3–5)
docs/tutorials/index.md        the Git card says Modules 1–5 are available                       (Task 6)
```

Test command used throughout (Node expands the quoted pattern itself, so it also works in PowerShell):

```
node --test --test-concurrency=1 "tutorial-sources/git/tests/*.test.mjs"
```

---

### Task 1: Full ref names in graphs, and hidden steps that must fail

**Files:**
- Modify: `tutorial-sources/git/tools/graph.mjs` (the `parseRefs` function)
- Modify: `tutorial-sources/git/tools/session.mjs` (the parser's doc comment and step pattern; the `@graph` log command)
- Modify: `tutorial-sources/git/tests/graph.test.mjs`, `tutorial-sources/git/tests/session.test.mjs`, `tutorial-sources/git/tests/series-sessions.test.mjs`
- Modify: `tutorial-sources/git/README.md`

**Interfaces:**
- Consumes: the existing `parseSession`, `runSession` and `parseRefs`.
- Produces:
  - **`>! command`**, a hidden setup step that must fail. It parses to `{kind: 'run', shown: false, expectFail: true}`. Task 2's Module 5 sessions use it to start a conflicted merge.
  - **Full ref names in graph records.** `graphs[label].commits[i].refs` now holds full ref names: `'HEAD -> refs/heads/main, refs/heads/desserts'`, or `'refs/heads/main'` and `'HEAD'` on a detached HEAD. `graphs[label].text` (the `git log --graph` alternative) is unchanged and keeps short names.
  - **`parseRefs(refs)`** turns full names into labels: `refs/heads/x` becomes a `branch` "x"; `refs/remotes/o/x` becomes a `remote` "o/x"; `tag: refs/tags/v` becomes a `tag` "v"; `HEAD -> refs/heads/x` becomes a `head` "HEAD → x". Short names are still accepted as before.

- [ ] **Step 1: Write the failing tests**

Append to `tutorial-sources/git/tests/graph.test.mjs`:

```js

test('full ref names tell local branches with slashes from remote-tracking branches', () => {
  assert.deepEqual(parseRefs('HEAD -> refs/heads/main, refs/heads/feature/login, refs/remotes/origin/main, refs/remotes/origin/HEAD, tag: refs/tags/v1.0'), [
    {text: 'HEAD → main', kind: 'head'}, {text: 'feature/login', kind: 'branch'}, {text: 'origin/main', kind: 'remote'}, {text: 'v1.0', kind: 'tag'}]);
});
```

In `tutorial-sources/git/tests/session.test.mjs`, in the test 'two people share a server repository, and paths stay readable', replace

```js
  assert.equal(graph.commits[0].refs, 'HEAD -> main, origin/main, origin/HEAD');
```

with

```js
  assert.equal(graph.commits[0].refs, 'HEAD -> refs/heads/main, refs/remotes/origin/main, refs/remotes/origin/HEAD');
```

and append to the end of the file:

```js

test('a hidden setup step can be declared to fail, to prepare a situation such as a conflict', () => {
  const session = parseSession(HEADER + '>! git switch nowhere\n> git --version\n', 't.session');
  assert.deepEqual(session.steps.map(s => [s.shown, s.expectFail]), [[false, true], [false, false]]);
  assert.deepEqual(run('>! git switch nowhere\n').problems, []);
  assert.match(run('>! git --version\n').problems[0], /succeeded, but is declared to fail/);
});

test('graphs record full ref names, so a local feature/login is not mistaken for a remote branch', () => {
  const result = run('$ git init shop\n$ cd shop\n+file a.txt\na\n+end\n$ git add a.txt\n$ git commit -m "Start"\n$ git branch feature/login\n@graph refs\n');
  assert.equal(result.graphs.refs.commits[0].refs, 'HEAD -> refs/heads/main, refs/heads/feature/login');
  assert.match(result.graphs.refs.text, /\(HEAD -> main, feature\/login\) Start/);
});
```

In `tutorial-sources/git/tests/series-sessions.test.mjs`, in the Module 2 test, replace

```js
  assert.deepEqual(graph.commits.map(c => [c.short, c.refs]), [['40bc459', 'HEAD -> main'], ['3f65e55', ''], ['907a979', '']]);
```

with

```js
  assert.deepEqual(graph.commits.map(c => [c.short, c.refs]), [['40bc459', 'HEAD -> refs/heads/main'], ['3f65e55', ''], ['907a979', '']]);
```

- [ ] **Step 2: Run the tests to see them fail**

Run: `node --test --test-concurrency=1 "tutorial-sources/git/tests/*.test.mjs"`
Expected: `# tests 37`, `# fail 5`. The failing tests are:
- 'full ref names tell local branches with slashes…': `feature/login` comes back as kind `remote`;
- 'Module 2 sessions print what the lesson describes…' and 'two people share a server repository…': the refs are still short names;
- 'a hidden setup step can be declared to fail…': error `t.session:4: cannot read ">! git switch nowhere"`;
- 'graphs record full ref names…'.

- [ ] **Step 3: Teach `parseRefs` full ref names**

In `tutorial-sources/git/tools/graph.mjs`, replace the whole `parseRefs` function and its comment:

```js
/** "HEAD -> main, origin/main, tag: v1.0" becomes [{text: 'HEAD → main', kind: 'head'}, {text: 'origin/main', kind: 'remote'}, ...]. */
export function parseRefs(refs) {
  return (refs ? refs.split(', ') : []).filter(ref => !ref.endsWith('/HEAD')).map(ref => {
    if (ref.startsWith('HEAD -> ')) return {text: `HEAD → ${ref.slice(8)}`, kind: 'head'};
    if (ref === 'HEAD') return {text: 'HEAD', kind: 'head'};
    if (ref.startsWith('tag: ')) return {text: ref.slice(5), kind: 'tag'};
    return {text: ref, kind: ref.includes('/') ? 'remote' : 'branch'};
  });
}
```

with

```js
/**
 * Turns a %D decoration into labels. With full ref names (git log --decorate=full),
 * "HEAD -> refs/heads/main, refs/remotes/origin/main, tag: refs/tags/v1.0" becomes
 * [{text: 'HEAD → main', kind: 'head'}, {text: 'origin/main', kind: 'remote'}, {text: 'v1.0', kind: 'tag'}];
 * short names are still accepted, with names containing "/" taken as remote.
 */
export function parseRefs(refs) {
  const short = name => name.replace(/^refs\/(heads|remotes|tags)\//, '');
  return (refs ? refs.split(', ') : []).filter(ref => !ref.endsWith('/HEAD')).map(ref => {
    if (ref.startsWith('HEAD -> ')) return {text: `HEAD → ${short(ref.slice(8))}`, kind: 'head'};
    if (ref === 'HEAD') return {text: 'HEAD', kind: 'head'};
    if (ref.startsWith('tag: ')) return {text: short(ref.slice(5)), kind: 'tag'};
    if (ref.startsWith('refs/heads/')) return {text: short(ref), kind: 'branch'};
    if (ref.startsWith('refs/remotes/')) return {text: short(ref), kind: 'remote'};
    return {text: ref, kind: ref.includes('/') ? 'remote' : 'branch'};
  });
}
```

- [ ] **Step 4: Add `>!` steps and full ref names to the session runner**

In `tutorial-sources/git/tools/session.mjs`, make three replacements.

1. In the doc comment of `parseSession`, replace

```js
 *   > command      hidden setup, must succeed   @as sam      act as another person
```

with

```js
 *   > command      hidden setup, must succeed   >! command   hidden setup, must fail
 *   @as sam        act as another person
```

2. In `parseSession`, replace

```js
    if ((m = /^(\$!|\$|>)\s+(.+)$/.exec(line))) {
```

with

```js
    if ((m = /^(\$!|\$|>!|>)\s+(.+)$/.exec(line))) {
```

and, three lines below it, replace

```js
      steps.push({kind: 'run', line: m[2].trim(), words, shown: m[1] !== '>', expectFail: m[1] === '$!', where});
```

with

```js
      steps.push({kind: 'run', line: m[2].trim(), words, shown: m[1].startsWith('$'), expectFail: m[1].endsWith('!'), where});
```

3. In `runSession`, in the `@graph` branch, replace

```js
      const log = runGit(['log', '--all', '--topo-order', '--format=%h%x09%H%x09%P%x09%D%x09%s']);
```

with

```js
      const log = runGit(['log', '--all', '--topo-order', '--decorate=full', '--format=%h%x09%H%x09%P%x09%D%x09%s']);
```

- [ ] **Step 5: Run the tests to see them pass**

Run: `node --test --test-concurrency=1 "tutorial-sources/git/tests/*.test.mjs"`
Expected: `# tests 37`, `# pass 37`, `# fail 0`.

- [ ] **Step 6: Check that the published Modules 1–2 are unchanged**

```bash
node tutorial-sources/git/build.mjs
git status --short docs/tutorials/git
```

Expected:
- the build prints `Built modules 01, 02 in English and Chinese; ran 10 sessions with git version 2.50.1 (Apple Git-155).`;
- `git status` prints nothing: graph labels look exactly as before.

- [ ] **Step 7: Document `>!` in the README**

In `tutorial-sources/git/README.md`, replace

```
`SPEC.md` is the design, `PLAN.md` the implementation plan for the shared tooling and Modules 1–2,
and `GLOSSARY.md` the English–Chinese terminology.
```

with

```
`SPEC.md` is the design, `PLAN.md` the implementation plan for the shared tooling and Modules 1–2,
`PLAN-modules-03-05.md` the plan for Modules 3–5, and `GLOSSARY.md` the English–Chinese terminology.
```

and, in the session format example, insert this line directly after the line `  > git init                hidden setup command`:

```
  >! git merge topic        hidden setup command that must fail (to prepare a conflict, say)
```

- [ ] **Step 8: Commit**

```bash
git add tutorial-sources/git/tools/graph.mjs tutorial-sources/git/tools/session.mjs tutorial-sources/git/tests/graph.test.mjs tutorial-sources/git/tests/session.test.mjs tutorial-sources/git/tests/series-sessions.test.mjs tutorial-sources/git/README.md
git commit -m "Git series: graphs read full ref names; hidden setup steps can be declared to fail" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Modules 3–5 configuration and sessions

**Files:**
- Create: `tutorial-sources/git/plan/module_03.json`, `module_04.json`, `module_05.json`
- Create: `tutorial-sources/git/sessions/module_03/` (8 sessions), `sessions/module_04/` (6), `sessions/module_05/` (5)
- Modify: `tutorial-sources/git/tests/series-sessions.test.mjs` (adds the Module 3, 4 and 5 tests)

**Interfaces:**
- Consumes: `runModuleSessions` (from `build.mjs`), and `>!` steps and full ref names from Task 1.
- Produces: the session ids, graph labels and pinned values that the lessons (Tasks 3–5) reference.
- **Contracts.** Each module needs 3–6 teaching sessions, 6 exercises and a 6–8 question quiz. Modules 3 and 4 have sections `s1`–`s6`, `exercises`, `quiz` and `reading`; Module 5 has `s1`–`s5`, `exercises`, `quiz` and `reading`.
- **Module 3** (3 hours):
  - teaching: `m03-log`, `m03-diff`, `m03-restore`, `m03-amend`, `m03-revert`, `m03-old-version` (graph `detached`);
  - solutions: `m03-e2-solution`, `m03-e4-solution`.
- **Module 4** (3 hours):
  - teaching: `m04-branches` (graphs `two-labels`, `desserts-ahead`), `m04-fast-forward` (graphs `before`, `after`), `m04-three-way` (graphs `diverged`, `merged`), `m04-switch-c`;
  - solutions: `m04-e3-solution`, `m04-e5-solution`.
- **Module 5** (2 hours):
  - teaching: `m05-no-conflict`, `m05-conflict` (graph `resolved`), `m05-abort`;
  - solutions: `m05-e3-solution`, `m05-e6-solution`.
- **Shared setup.** The Module 3 sessions share a hidden setup: the recipes repository at the end of Module 2. Its oneline log is `1ad5842 Say what the notes are for / 8bf3c2d Add a pancake recipe / 907a979 Add a README`. Only the first hash matches Module 2's: the setup runs fewer commands, so the later commits get different times.

- [ ] **Step 1: Write the failing test**

Replace `tutorial-sources/git/tests/series-sessions.test.mjs` with this version. It keeps the Module 1–2 tests, including Task 1's change, and adds one test per new module. It pins every output and hash the lessons quote.

`tutorial-sources/git/tests/series-sessions.test.mjs`:

`````js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {runModuleSessions} from '../build.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const modules = fs.readdirSync(path.join(ROOT, 'sessions')).filter(n => /^module_\d\d$/.test(n)).sort();
let all;
/** Runs every session of the series once; id -> session with record and graphs. */
function sessions() {
  all ??= new Map(modules.flatMap(name => [...runModuleSessions(path.join(ROOT, 'sessions', name), Number(name.slice(7)))]));
  return all;
}
const outputs = id => sessions().get(id).record.filter(r => r.kind === 'command').map(r => r.output);

test('every session in sessions/ runs as declared', () => {
  const files = modules.flatMap(name => fs.readdirSync(path.join(ROOT, 'sessions', name)).filter(f => f.endsWith('.session')));
  assert.equal(sessions().size, files.length, 'runModuleSessions throws if any session misbehaves');
});

test('Module 1 sessions print what the lesson describes', () => {
  assert.match(outputs('m01-version')[0], /^git version \d+\.\d+\.\d+/);
  assert.deepEqual(outputs('m01-terminal'), ['/home/alex\n', '', 'projects\n', '', '/home/alex/projects\n', '', 'hello.txt\n', 'Hello from the terminal.\n', '', '/home/alex\n']);
  const config = outputs('m01-config');
  assert.equal(config[4], 'user.name=Alex Smith\nuser.email=alex@example.com\ninit.defaultbranch=main\ncore.editor=code --wait\n');
  assert.equal(config[5], 'Alex Smith\n');
  assert.deepEqual(outputs('m01-e4-solution'), ['', 'nano\n']);
});

test('Module 2 sessions print what the lesson describes, with the same hashes everywhere', () => {
  assert.equal(outputs('m02-init')[2], 'Initialized empty Git repository in /home/alex/recipes/.git/\n');
  assert.equal(outputs('m02-init')[3], '.  ..  .git\n');
  const first = outputs('m02-first-commit');
  assert.match(first[0], /Untracked files:[\s\S]*README\.md/);
  assert.match(first[2], /Changes to be committed:[\s\S]*new file:   README\.md/);
  assert.equal(first[3], '[main (root-commit) 2cf38b1] Add a README\n 1 file changed, 3 insertions(+)\n create mode 100644 README.md\n');
  assert.equal(first[4], 'On branch main\nnothing to commit, working tree clean\n');
  const staging = outputs('m02-staging');
  assert.match(staging[2], /Changes to be committed:[\s\S]*new file:   pancakes\.md[\s\S]*Changes not staged for commit:[\s\S]*modified:   README\.md/);
  assert.equal(staging.at(-1), '40bc459 Say what the notes are for\n3f65e55 Add a pancake recipe\n907a979 Add a README\n');
  const graph = sessions().get('m02-staging').graphs['three-commits'];
  assert.deepEqual(graph.commits.map(c => [c.short, c.refs]), [['40bc459', 'HEAD -> refs/heads/main'], ['3f65e55', ''], ['907a979', '']]);
  const ignore = outputs('m02-ignore');
  assert.match(ignore[0], /shopping\.tmp/);
  assert.doesNotMatch(ignore[1], /shopping\.tmp/);
  assert.equal(outputs('m02-e3-solution').at(-1), '0bbe433 Add a soda bread recipe\n78fc921 Add a tomato soup recipe\n');
  assert.doesNotMatch(outputs('m02-e5-solution')[0], /photos/);
  // solutions show their own setup, in a folder of their own, so no repository ends up inside recipes
  assert.deepEqual(sessions().get('m02-e3-solution').record.filter(r => r.kind === 'command').slice(0, 3).map(r => r.line), ['mkdir menu', 'cd menu', 'git init']);
  // exercise 5 works in the existing recipes repository, as its question says
  assert.match(outputs('m02-e5-solution')[0], /^On branch main\nUntracked files:/);
  assert.match(outputs('m02-e5-solution')[2], /^\[main [0-9a-f]{7}\] Keep photos out of the repository\n/);
});

test('Module 3 sessions print what the lesson describes', () => {
  assert.equal(outputs('m03-log')[0], '1ad5842 Say what the notes are for\n8bf3c2d Add a pancake recipe\n907a979 Add a README\n');
  assert.equal(outputs('m03-log')[3], '8bf3c2d Add a pancake recipe\n');
  const diff = outputs('m03-diff');
  assert.match(diff[0], /@@ -2,4 \+2,5 @@\n \n - 200 g flour\n - 2 eggs\n-- 300 ml milk\n\+- 250 ml milk\n\+- a pinch of salt\n$/);
  assert.equal(diff[2], '', 'nothing left to diff once everything is staged');
  assert.equal(diff[3], diff[0]);
  const amend = outputs('m03-amend');
  assert.match(amend[1], /^\[main 087bb2c\] Add a sdoa bread recipe\n/);
  assert.match(amend[2], /^\[main 3fc0d24\] Add a soda bread recipe\n Date: /);
  assert.match(amend[4], /^\[main 31783ba\] Add a soda bread recipe\n/);
  const revert = outputs('m03-revert');
  assert.match(revert[2], /^\[main [0-9a-f]{7}\] Revert "Use more flour"\n/);
  assert.match(revert[4], /- 200 g flour/);
  assert.deepEqual(sessions().get('m03-old-version').graphs.detached.commits.map(c => [c.short, c.refs]), [['1ad5842', 'refs/heads/main'], ['8bf3c2d', ''], ['907a979', 'HEAD']]);
  assert.equal(outputs('m03-old-version')[1], 'HEAD is now at 907a979 Add a README\n');
  assert.equal(outputs('m03-e4-solution').at(-1), 'README.md  pancakes.md  passwords.txt\n', 'the file stays on disk');
});

test('Module 4 sessions print what the lesson describes', () => {
  const branches = outputs('m04-branches');
  assert.equal(branches[2], '  desserts\n* main\n');
  assert.equal(branches[7], 'README.md  pancakes.md\n');
  assert.equal(branches[9], 'README.md  cake.md  pancakes.md\n');
  assert.equal(sessions().get('m04-branches').graphs['two-labels'].commits[0].refs, 'HEAD -> refs/heads/main, refs/heads/desserts');
  assert.match(outputs('m04-fast-forward')[0], /^Updating 288d56b\.\.4d632df\nFast-forward\n/);
  assert.match(outputs('m04-three-way')[0], /^Merge made by the 'ort' strategy\.\n/);
  assert.equal(sessions().get('m04-three-way').graphs.merged.commits[0].parents.length, 2);
  assert.match(outputs('m04-e5-solution')[0], /^error: the branch 'experiment' is not fully merged\n/);
});

test('Module 5 sessions print what the lesson describes', () => {
  const conflict = sessions().get('m05-conflict').record.filter(r => r.kind === 'command');
  assert.equal(conflict[0].ok, false, 'the merge stops');
  assert.match(conflict[0].output, /CONFLICT \(content\): Merge conflict in pancakes\.md/);
  assert.match(conflict[2].output, /<<<<<<< HEAD\n- 40 g sugar\n=======\n- 30 g sugar\n>>>>>>> less-sugar\n/);
  assert.match(conflict[4].output, /All conflicts fixed but you are still merging\./);
  assert.match(conflict[5].output, /^\[main [0-9a-f]{7}\] Merge branch 'less-sugar'\n/);
  assert.match(outputs('m05-abort')[3], /- 40 g sugar/);
  assert.match(outputs('m05-no-conflict')[1], /- 250 g flour[\s\S]*rest for 20 minutes/);
  assert.equal(outputs('m05-e6-solution')[0], 'pancakes.md:6: leftover conflict marker\npancakes.md:8: leftover conflict marker\npancakes.md:10: leftover conflict marker\n');
});
`````


- [ ] **Step 2: Run the test to see it fail**

Run: `node --test --test-concurrency=1 "tutorial-sources/git/tests/*.test.mjs"`
Expected: `# tests 40`, `# fail 3`. Each Module 3, 4 and 5 test fails with `Cannot read properties of undefined (reading 'record')`, because its sessions do not exist yet.

- [ ] **Step 3: Create the module configuration**

`tutorial-sources/git/plan/module_03.json`:

`````json
{
  "number": 3,
  "hours": 3,
  "title": {"en": "History and undoing", "zh": "查看历史与撤销"},
  "lead": {"en": "Read your project's history, see exactly what changed, and undo mistakes at every stage: before staging, after staging, in the last commit and in older commits.", "zh": "阅读项目的历史，准确查看改动内容，并在各个阶段撤销错误：暂存之前、暂存之后、最近一次提交中以及更早的提交中。"},
  "prerequisites": {"en": "Module 2: creating a repository, staging with git add and committing with clear messages.", "zh": "第 2 模块：创建仓库、用 git add 暂存，以及写清楚说明进行提交。"},
  "outcomes": {
    "en": [
      "List and filter history with git log.",
      "Read a diff, and use git diff, git diff --staged and git show.",
      "Throw away uncommitted changes and unstage files with git restore.",
      "Fix the last commit with git commit --amend, and undo older commits with git revert.",
      "Look at an old version safely, and explain what a detached HEAD is."
    ],
    "zh": [
      "用 git log 列出并筛选历史。",
      "读懂差异（diff），并使用 git diff、git diff --staged 和 git show。",
      "用 git restore 丢弃未提交的改动，以及取消暂存文件。",
      "用 git commit --amend 修改最近一次提交，用 git revert 撤销更早的提交。",
      "安全地查看旧版本，并解释什么是分离的 HEAD。"
    ]
  },
  "sessions": [
    {"minutes": 60, "title": {"en": "Looking back", "zh": "回顾历史"}, "activities": [
      {"kind": "practice", "anchor": "s1", "minutes": 20, "text": {"en": "Reading the history", "zh": "阅读历史"}},
      {"kind": "practice", "anchor": "s2", "minutes": 25, "text": {"en": "Seeing what changed", "zh": "查看改动"}},
      {"kind": "practice", "anchor": "s3", "minutes": 15, "text": {"en": "Undoing changes you have not committed", "zh": "撤销尚未提交的改动"}}
    ]},
    {"minutes": 60, "title": {"en": "Undoing commits", "zh": "撤销提交"}, "activities": [
      {"kind": "practice", "anchor": "s4", "minutes": 15, "text": {"en": "Fixing the last commit", "zh": "修改最近一次提交"}},
      {"kind": "practice", "anchor": "s5", "minutes": 20, "text": {"en": "Undoing a commit", "zh": "撤销一次提交"}},
      {"kind": "practice", "anchor": "s6", "minutes": 25, "text": {"en": "Looking at an old version", "zh": "查看旧版本"}}
    ]},
    {"minutes": 60, "title": {"en": "Practice", "zh": "练习"}, "activities": [
      {"kind": "exercises", "anchor": "exercises", "minutes": 45, "text": {"en": "Six exercises", "zh": "六道练习"}},
      {"kind": "quiz", "anchor": "quiz", "minutes": 15, "text": {"en": "Self-check quiz", "zh": "自测"}}
    ]}
  ],
  "contract": {"sessions": [3, 6], "exercises": 6, "quiz": [6, 8], "sections": ["s1", "s2", "s3", "s4", "s5", "s6", "exercises", "quiz", "reading"]}
}
`````

`tutorial-sources/git/plan/module_04.json`:

`````json
{
  "number": 4,
  "hours": 3,
  "title": {"en": "Branches", "zh": "分支"},
  "lead": {"en": "Work on separate ideas side by side: create and switch branches, understand HEAD, and bring work together with fast-forward and three-way merges.", "zh": "并行推进不同的想法：创建和切换分支，理解 HEAD，并用快进合并和三方合并把工作汇合起来。"},
  "prerequisites": {"en": "Modules 2 and 3: committing, reading history with git log, and the idea of a detached HEAD.", "zh": "第 2 和第 3 模块：提交、用 git log 阅读历史，以及分离的 HEAD 这一概念。"},
  "outcomes": {
    "en": [
      "Explain a branch as a movable label that points at a commit.",
      "Create, list and switch branches with git branch and git switch.",
      "Say where HEAD points, and read it in a commit graph.",
      "Tell a fast-forward merge from a three-way merge, and carry out both.",
      "Rename and delete branches safely."
    ],
    "zh": [
      "把分支解释为指向某次提交的可移动标签。",
      "用 git branch 和 git switch 创建、列出和切换分支。",
      "说出 HEAD 指向哪里，并在提交图中认出它。",
      "区分快进合并与三方合并，并完成这两种合并。",
      "安全地重命名和删除分支。"
    ]
  },
  "sessions": [
    {"minutes": 60, "title": {"en": "Branches and HEAD", "zh": "分支与 HEAD"}, "activities": [
      {"kind": "read", "anchor": "s1", "minutes": 15, "text": {"en": "What a branch is", "zh": "分支是什么"}},
      {"kind": "practice", "anchor": "s2", "minutes": 30, "text": {"en": "Creating and switching branches", "zh": "创建和切换分支"}},
      {"kind": "read", "anchor": "s3", "minutes": 15, "text": {"en": "HEAD", "zh": "HEAD"}}
    ]},
    {"minutes": 60, "title": {"en": "Merging", "zh": "合并"}, "activities": [
      {"kind": "practice", "anchor": "s4", "minutes": 20, "text": {"en": "Fast-forward merges", "zh": "快进合并"}},
      {"kind": "practice", "anchor": "s5", "minutes": 25, "text": {"en": "Three-way merges", "zh": "三方合并"}},
      {"kind": "practice", "anchor": "s6", "minutes": 15, "text": {"en": "Tidying up branches", "zh": "整理分支"}}
    ]},
    {"minutes": 60, "title": {"en": "Practice", "zh": "练习"}, "activities": [
      {"kind": "exercises", "anchor": "exercises", "minutes": 45, "text": {"en": "Six exercises", "zh": "六道练习"}},
      {"kind": "quiz", "anchor": "quiz", "minutes": 15, "text": {"en": "Self-check quiz", "zh": "自测"}}
    ]}
  ],
  "contract": {"sessions": [3, 6], "exercises": 6, "quiz": [6, 8], "sections": ["s1", "s2", "s3", "s4", "s5", "s6", "exercises", "quiz", "reading"]}
}
`````

`tutorial-sources/git/plan/module_05.json`:

`````json
{
  "number": 5,
  "hours": 2,
  "title": {"en": "Merge conflicts", "zh": "合并冲突"},
  "lead": {"en": "Understand why merges sometimes stop, read conflict markers with confidence, and resolve, finish or abort a merge.", "zh": "理解合并为何有时会停下来，自信地读懂冲突标记，并解决、完成或放弃一次合并。"},
  "prerequisites": {"en": "Module 4: branches, switching, and fast-forward and three-way merges.", "zh": "第 4 模块：分支、切换分支，以及快进合并与三方合并。"},
  "outcomes": {
    "en": [
      "Explain when Git can merge on its own and when it reports a conflict.",
      "Read the conflict markers <<<<<<<, ======= and >>>>>>>.",
      "Resolve a conflict, mark it with git add and conclude the merge with git commit.",
      "Abort a merge with git merge --abort.",
      "Keep conflicts small, and find leftover markers with git diff --check."
    ],
    "zh": [
      "解释 Git 何时能自行合并、何时会报告冲突。",
      "读懂冲突标记 <<<<<<<、======= 和 >>>>>>>。",
      "解决冲突，用 git add 标记为已解决，再用 git commit 完成合并。",
      "用 git merge --abort 放弃一次合并。",
      "让冲突保持在小范围内，并用 git diff --check 找出遗留的标记。"
    ]
  },
  "sessions": [
    {"minutes": 60, "title": {"en": "Conflicts", "zh": "冲突"}, "activities": [
      {"kind": "read", "anchor": "s1", "minutes": 10, "text": {"en": "Why conflicts happen", "zh": "冲突为何发生"}},
      {"kind": "practice", "anchor": "s2", "minutes": 15, "text": {"en": "When Git merges on its own", "zh": "Git 能自行合并的情况"}},
      {"kind": "practice", "anchor": "s3", "minutes": 35, "text": {"en": "Reading and resolving a conflict", "zh": "读懂并解决冲突"}}
    ]},
    {"minutes": 60, "title": {"en": "Aborting, preventing and practice", "zh": "放弃、预防与练习"}, "activities": [
      {"kind": "practice", "anchor": "s4", "minutes": 10, "text": {"en": "Backing out of a merge", "zh": "放弃一次合并"}},
      {"kind": "read", "anchor": "s5", "minutes": 10, "text": {"en": "Keeping conflicts small", "zh": "让冲突保持在小范围内"}},
      {"kind": "exercises", "anchor": "exercises", "minutes": 30, "text": {"en": "Six exercises", "zh": "六道练习"}},
      {"kind": "quiz", "anchor": "quiz", "minutes": 10, "text": {"en": "Self-check quiz", "zh": "自测"}}
    ]}
  ],
  "contract": {"sessions": [3, 6], "exercises": 6, "quiz": [6, 8], "sections": ["s1", "s2", "s3", "s4", "s5", "exercises", "quiz", "reading"]}
}
`````


- [ ] **Step 4: Create the Module 3 sessions**

`tutorial-sources/git/sessions/module_03/m03-log.session`:

`````text
title: Read the history
title-zh: 阅读历史
---
# The recipes repository at the end of Module 2
> mkdir recipes
> cd recipes
> git init
+hidden README.md
# Family recipes

Recipes we cook again and again.
+end
> git add README.md
> git commit -m "Add a README"
+hidden pancakes.md
# Pancakes

- 200 g flour
- 2 eggs
- 300 ml milk
+end
> git add pancakes.md
> git commit -m "Add a pancake recipe"
+hidden README.md
# Family recipes

Recipes we cook again and again, with notes on what worked.
+end
> git add README.md
> git commit -m "Say what the notes are for"
$ git log --oneline
$ git log -n 1
$ git log --oneline --stat
$ git log --oneline pancakes.md
`````

`tutorial-sources/git/sessions/module_03/m03-diff.session`:

`````text
title: See what changed
title-zh: 查看改动
---
# The recipes repository at the end of Module 2
> mkdir recipes
> cd recipes
> git init
+hidden README.md
# Family recipes

Recipes we cook again and again.
+end
> git add README.md
> git commit -m "Add a README"
+hidden pancakes.md
# Pancakes

- 200 g flour
- 2 eggs
- 300 ml milk
+end
> git add pancakes.md
> git commit -m "Add a pancake recipe"
+hidden README.md
# Family recipes

Recipes we cook again and again, with notes on what worked.
+end
> git add README.md
> git commit -m "Say what the notes are for"
+file pancakes.md
# Pancakes

- 200 g flour
- 2 eggs
- 250 ml milk
- a pinch of salt
+end
$ git diff
$ git add pancakes.md
$ git diff
$ git diff --staged
$ git commit -m "Use less milk and add salt"
$ git show
`````

`tutorial-sources/git/sessions/module_03/m03-restore.session`:

`````text
title: Throw away changes you have not committed
title-zh: 丢弃尚未提交的改动
---
# The recipes repository at the end of Module 2
> mkdir recipes
> cd recipes
> git init
+hidden README.md
# Family recipes

Recipes we cook again and again.
+end
> git add README.md
> git commit -m "Add a README"
+hidden pancakes.md
# Pancakes

- 200 g flour
- 2 eggs
- 300 ml milk
+end
> git add pancakes.md
> git commit -m "Add a pancake recipe"
+hidden README.md
# Family recipes

Recipes we cook again and again, with notes on what worked.
+end
> git add README.md
> git commit -m "Say what the notes are for"
+file README.md
# Family recipes

Oops: the description is gone.
+end
$ git status
$ git restore README.md
$ git status
$ cat README.md
+file pancakes.md
# Pancakes

- 200 g flour
- 3 eggs
- 300 ml milk
+end
$ git add pancakes.md
$ git status
$ git restore --staged pancakes.md
$ git status
`````

`tutorial-sources/git/sessions/module_03/m03-amend.session`:

`````text
title: Fix the last commit
title-zh: 修改最近一次提交
---
# The recipes repository at the end of Module 2
> mkdir recipes
> cd recipes
> git init
+hidden README.md
# Family recipes

Recipes we cook again and again.
+end
> git add README.md
> git commit -m "Add a README"
+hidden pancakes.md
# Pancakes

- 200 g flour
- 2 eggs
- 300 ml milk
+end
> git add pancakes.md
> git commit -m "Add a pancake recipe"
+hidden README.md
# Family recipes

Recipes we cook again and again, with notes on what worked.
+end
> git add README.md
> git commit -m "Say what the notes are for"
+file bread.md
# Soda bread

- 450 g flour
- 400 ml buttermilk
+end
$ git add bread.md
$ git commit -m "Add a sdoa bread recipe"
$ git commit --amend -m "Add a soda bread recipe"
+file bread.md
# Soda bread

- 450 g flour
- 400 ml buttermilk
- 1 teaspoon bicarbonate of soda
+end
$ git add bread.md
$ git commit --amend --no-edit
$ git log --oneline -n 2
$ git show --stat
`````

`tutorial-sources/git/sessions/module_03/m03-revert.session`:

`````text
title: Undo a commit with a new commit
title-zh: 用一次新提交撤销旧提交
---
# The recipes repository at the end of Module 2
> mkdir recipes
> cd recipes
> git init
+hidden README.md
# Family recipes

Recipes we cook again and again.
+end
> git add README.md
> git commit -m "Add a README"
+hidden pancakes.md
# Pancakes

- 200 g flour
- 2 eggs
- 300 ml milk
+end
> git add pancakes.md
> git commit -m "Add a pancake recipe"
+hidden README.md
# Family recipes

Recipes we cook again and again, with notes on what worked.
+end
> git add README.md
> git commit -m "Say what the notes are for"
+file pancakes.md
# Pancakes

- 2000 g flour
- 2 eggs
- 300 ml milk
+end
$ git add pancakes.md
$ git commit -m "Use more flour"
$ git revert HEAD
$ git log --oneline -n 3
$ cat pancakes.md
`````

`tutorial-sources/git/sessions/module_03/m03-old-version.session`:

`````text
title: Look at an old version safely
title-zh: 安全地查看旧版本
---
# The recipes repository at the end of Module 2
> mkdir recipes
> cd recipes
> git init
+hidden README.md
# Family recipes

Recipes we cook again and again.
+end
> git add README.md
> git commit -m "Add a README"
+hidden pancakes.md
# Pancakes

- 200 g flour
- 2 eggs
- 300 ml milk
+end
> git add pancakes.md
> git commit -m "Add a pancake recipe"
+hidden README.md
# Family recipes

Recipes we cook again and again, with notes on what worked.
+end
> git add README.md
> git commit -m "Say what the notes are for"
$ git show HEAD~2:README.md
$ git switch --detach HEAD~2
$ git status
$ cat README.md
@graph detached
$ git switch main
$ git status
`````

`tutorial-sources/git/sessions/module_03/m03-e2-solution.session`:

`````text
title: Compare two commits
title-zh: 比较两次提交
role: solution
---
# The recipes repository at the end of Module 2
> mkdir recipes
> cd recipes
> git init
+hidden README.md
# Family recipes

Recipes we cook again and again.
+end
> git add README.md
> git commit -m "Add a README"
+hidden pancakes.md
# Pancakes

- 200 g flour
- 2 eggs
- 300 ml milk
+end
> git add pancakes.md
> git commit -m "Add a pancake recipe"
+hidden README.md
# Family recipes

Recipes we cook again and again, with notes on what worked.
+end
> git add README.md
> git commit -m "Say what the notes are for"
$ git log --oneline
$ git diff HEAD~2 HEAD
`````

`tutorial-sources/git/sessions/module_03/m03-e4-solution.session`:

`````text
title: Stop tracking a file
title-zh: 停止跟踪文件
role: solution
---
# The recipes repository at the end of Module 2
> mkdir recipes
> cd recipes
> git init
+hidden README.md
# Family recipes

Recipes we cook again and again.
+end
> git add README.md
> git commit -m "Add a README"
+hidden pancakes.md
# Pancakes

- 200 g flour
- 2 eggs
- 300 ml milk
+end
> git add pancakes.md
> git commit -m "Add a pancake recipe"
+hidden README.md
# Family recipes

Recipes we cook again and again, with notes on what worked.
+end
> git add README.md
> git commit -m "Say what the notes are for"
+hidden passwords.txt
wifi: hunter2
+end
> git add passwords.txt
> git commit -m "Add notes"
+file .gitignore
passwords.txt
+end
$ git rm --cached passwords.txt
$ git status
$ git add .gitignore
$ git commit -m "Stop tracking the passwords file"
$ git status
$ ls
`````


- [ ] **Step 5: Create the Module 4 sessions**

`tutorial-sources/git/sessions/module_04/m04-branches.session`:

`````text
title: Create a branch and work on it
title-zh: 创建分支并在其上工作
---
# A recipes repository with two commits on main
> mkdir recipes
> cd recipes
> git init
+hidden README.md
# Family recipes

Recipes we cook again and again, with notes on what worked.
+end
> git add README.md
> git commit -m "Add a README"
+hidden pancakes.md
# Pancakes

- 200 g flour
- 2 eggs
- 300 ml milk
+end
> git add pancakes.md
> git commit -m "Add a pancake recipe"
$ git branch
$ git branch desserts
$ git branch
@graph two-labels
$ git switch desserts
+file cake.md
# Lemon cake

- 200 g flour
- 2 lemons
+end
$ git add cake.md
$ git commit -m "Add a lemon cake recipe"
@graph desserts-ahead
$ git switch main
$ ls
$ git switch desserts
$ ls
`````

`tutorial-sources/git/sessions/module_04/m04-fast-forward.session`:

`````text
title: Merge a branch that is simply ahead
title-zh: 合并一个只是领先的分支
---
# A recipes repository with two commits on main
> mkdir recipes
> cd recipes
> git init
+hidden README.md
# Family recipes

Recipes we cook again and again, with notes on what worked.
+end
> git add README.md
> git commit -m "Add a README"
+hidden pancakes.md
# Pancakes

- 200 g flour
- 2 eggs
- 300 ml milk
+end
> git add pancakes.md
> git commit -m "Add a pancake recipe"
> git switch -c desserts
+hidden cake.md
# Lemon cake
+end
> git add cake.md
> git commit -m "Add a lemon cake recipe"
> git switch main
@graph before
$ git merge desserts
@graph after
$ git branch -d desserts
$ git branch
`````

`tutorial-sources/git/sessions/module_04/m04-three-way.session`:

`````text
title: Merge two lines of work
title-zh: 合并两条工作线
---
# A recipes repository with two commits on main
> mkdir recipes
> cd recipes
> git init
+hidden README.md
# Family recipes

Recipes we cook again and again, with notes on what worked.
+end
> git add README.md
> git commit -m "Add a README"
+hidden pancakes.md
# Pancakes

- 200 g flour
- 2 eggs
- 300 ml milk
+end
> git add pancakes.md
> git commit -m "Add a pancake recipe"
> git switch -c soups
+hidden soup.md
# Tomato soup
+end
> git add soup.md
> git commit -m "Add a tomato soup recipe"
> git switch main
+hidden pancakes.md
# Pancakes

- 200 g flour
- 2 eggs
- 300 ml milk
- a pinch of salt
+end
> git add pancakes.md
> git commit -m "Add salt to the pancakes"
@graph diverged
$ git merge soups
@graph merged
$ git log --oneline --graph
`````

`tutorial-sources/git/sessions/module_04/m04-switch-c.session`:

`````text
title: Branch in one step, and look around
title-zh: 一步创建分支，并四处看看
---
# A recipes repository with two commits on main
> mkdir recipes
> cd recipes
> git init
+hidden README.md
# Family recipes

Recipes we cook again and again, with notes on what worked.
+end
> git add README.md
> git commit -m "Add a README"
+hidden pancakes.md
# Pancakes

- 200 g flour
- 2 eggs
- 300 ml milk
+end
> git add pancakes.md
> git commit -m "Add a pancake recipe"
$ git switch -c breakfast
+file porridge.md
# Porridge
+end
$ git add porridge.md
$ git commit -m "Add a porridge recipe"
$ git branch -v
$ git switch -
$ git branch -m breakfast brunch
$ git branch -v
`````

`tutorial-sources/git/sessions/module_04/m04-e3-solution.session`:

`````text
title: A feature branch, merged back
title-zh: 一个功能分支，合并回来
role: solution
---
# A recipes repository with two commits on main
> mkdir recipes
> cd recipes
> git init
+hidden README.md
# Family recipes

Recipes we cook again and again, with notes on what worked.
+end
> git add README.md
> git commit -m "Add a README"
+hidden pancakes.md
# Pancakes

- 200 g flour
- 2 eggs
- 300 ml milk
+end
> git add pancakes.md
> git commit -m "Add a pancake recipe"
$ git switch -c drinks
+file lemonade.md
# Lemonade
+end
$ git add lemonade.md
$ git commit -m "Add a lemonade recipe"
+file tea.md
# Iced tea
+end
$ git add tea.md
$ git commit -m "Add an iced tea recipe"
$ git switch main
$ git merge drinks
$ git branch -d drinks
$ git log --oneline
`````

`tutorial-sources/git/sessions/module_04/m04-e5-solution.session`:

`````text
title: Delete a branch that was never merged
title-zh: 删除一个从未合并的分支
role: solution
---
# A recipes repository with two commits on main
> mkdir recipes
> cd recipes
> git init
+hidden README.md
# Family recipes

Recipes we cook again and again, with notes on what worked.
+end
> git add README.md
> git commit -m "Add a README"
+hidden pancakes.md
# Pancakes

- 200 g flour
- 2 eggs
- 300 ml milk
+end
> git add pancakes.md
> git commit -m "Add a pancake recipe"
> git switch -c experiment
+hidden curry.md
# A curry that did not work
+end
> git add curry.md
> git commit -m "Try a curry recipe"
> git switch main
$! git branch -d experiment
$ git branch -D experiment
$ git branch
`````


- [ ] **Step 6: Create the Module 5 sessions**

`tutorial-sources/git/sessions/module_05/m05-no-conflict.session`:

`````text
title: Two changes to one file, no conflict
title-zh: 同一文件的两处改动，没有冲突
---
# A recipes repository with a pancake recipe on main
> mkdir recipes
> cd recipes
> git init
+hidden pancakes.md
# Pancakes

- 200 g flour
- 2 eggs
- 300 ml milk
- 50 g sugar

Mix everything and leave the batter to rest for 30 minutes.
+end
> git add pancakes.md
> git commit -m "Add a pancake recipe"
> git switch -c resting-time
+hidden pancakes.md
# Pancakes

- 200 g flour
- 2 eggs
- 300 ml milk
- 50 g sugar

Mix everything and leave the batter to rest for 20 minutes.
+end
> git add pancakes.md
> git commit -m "Shorten the resting time"
> git switch main
+hidden pancakes.md
# Pancakes

- 250 g flour
- 2 eggs
- 300 ml milk
- 50 g sugar

Mix everything and leave the batter to rest for 30 minutes.
+end
> git add pancakes.md
> git commit -m "Use more flour"
$ git merge resting-time
$ cat pancakes.md
`````

`tutorial-sources/git/sessions/module_05/m05-conflict.session`:

`````text
title: Resolve a merge conflict
title-zh: 解决合并冲突
---
# A recipes repository with a pancake recipe on main
> mkdir recipes
> cd recipes
> git init
+hidden pancakes.md
# Pancakes

- 200 g flour
- 2 eggs
- 300 ml milk
- 50 g sugar

Mix everything and leave the batter to rest for 30 minutes.
+end
> git add pancakes.md
> git commit -m "Add a pancake recipe"
> git switch -c less-sugar
+hidden pancakes.md
# Pancakes

- 200 g flour
- 2 eggs
- 300 ml milk
- 30 g sugar

Mix everything and leave the batter to rest for 30 minutes.
+end
> git add pancakes.md
> git commit -m "Use less sugar"
> git switch main
+hidden pancakes.md
# Pancakes

- 200 g flour
- 2 eggs
- 300 ml milk
- 40 g sugar

Mix everything and leave the batter to rest for 30 minutes.
+end
> git add pancakes.md
> git commit -m "Reduce the sugar a little"
$! git merge less-sugar
$ git status
$ cat pancakes.md
+file pancakes.md
# Pancakes

- 200 g flour
- 2 eggs
- 300 ml milk
- 35 g sugar

Mix everything and leave the batter to rest for 30 minutes.
+end
$ git add pancakes.md
$ git status
$ git commit
@graph resolved
$ git log --oneline --graph
`````

`tutorial-sources/git/sessions/module_05/m05-abort.session`:

`````text
title: Back out of a merge
title-zh: 放弃一次合并
---
# A recipes repository with a pancake recipe on main
> mkdir recipes
> cd recipes
> git init
+hidden pancakes.md
# Pancakes

- 200 g flour
- 2 eggs
- 300 ml milk
- 50 g sugar

Mix everything and leave the batter to rest for 30 minutes.
+end
> git add pancakes.md
> git commit -m "Add a pancake recipe"
> git switch -c less-sugar
+hidden pancakes.md
# Pancakes

- 200 g flour
- 2 eggs
- 300 ml milk
- 30 g sugar

Mix everything and leave the batter to rest for 30 minutes.
+end
> git add pancakes.md
> git commit -m "Use less sugar"
> git switch main
+hidden pancakes.md
# Pancakes

- 200 g flour
- 2 eggs
- 300 ml milk
- 40 g sugar

Mix everything and leave the batter to rest for 30 minutes.
+end
> git add pancakes.md
> git commit -m "Reduce the sugar a little"
$! git merge less-sugar
$ git merge --abort
$ git status
$ cat pancakes.md
`````

`tutorial-sources/git/sessions/module_05/m05-e3-solution.session`:

`````text
title: Keep both changes
title-zh: 保留两处改动
role: solution
---
# A recipes repository with a pancake recipe on main
> mkdir recipes
> cd recipes
> git init
+hidden pancakes.md
# Pancakes

- 200 g flour
- 2 eggs
- 300 ml milk
- 50 g sugar

Mix everything and leave the batter to rest for 30 minutes.
+end
> git add pancakes.md
> git commit -m "Add a pancake recipe"
> git switch -c chocolate
+hidden pancakes.md
# Pancakes

- 200 g flour
- 2 eggs
- 300 ml milk
- 50 g sugar
- 50 g chocolate chips

Mix everything and leave the batter to rest for 30 minutes.
+end
> git add pancakes.md
> git commit -m "Add chocolate chips"
> git switch main
+hidden pancakes.md
# Pancakes

- 200 g flour
- 2 eggs
- 300 ml milk
- 50 g sugar
- 1 banana, mashed

Mix everything and leave the batter to rest for 30 minutes.
+end
> git add pancakes.md
> git commit -m "Add a banana"
>! git merge chocolate
$ cat pancakes.md
+file pancakes.md
# Pancakes

- 200 g flour
- 2 eggs
- 300 ml milk
- 50 g sugar
- 1 banana, mashed
- 50 g chocolate chips

Mix everything and leave the batter to rest for 30 minutes.
+end
$ git add pancakes.md
$ git commit
$ git log --oneline --graph
`````

`tutorial-sources/git/sessions/module_05/m05-e6-solution.session`:

`````text
title: Find a leftover conflict marker
title-zh: 找出遗留的冲突标记
role: solution
---
# A recipes repository with a pancake recipe on main
> mkdir recipes
> cd recipes
> git init
+hidden pancakes.md
# Pancakes

- 200 g flour
- 2 eggs
- 300 ml milk
- 50 g sugar

Mix everything and leave the batter to rest for 30 minutes.
+end
> git add pancakes.md
> git commit -m "Add a pancake recipe"
> git switch -c less-sugar
+hidden pancakes.md
# Pancakes

- 200 g flour
- 2 eggs
- 300 ml milk
- 30 g sugar

Mix everything and leave the batter to rest for 30 minutes.
+end
> git add pancakes.md
> git commit -m "Use less sugar"
> git switch main
+hidden pancakes.md
# Pancakes

- 200 g flour
- 2 eggs
- 300 ml milk
- 40 g sugar

Mix everything and leave the batter to rest for 30 minutes.
+end
> git add pancakes.md
> git commit -m "Reduce the sugar a little"
>! git merge less-sugar
> git add pancakes.md
> git commit
$! git diff --check HEAD~1
+file pancakes.md
# Pancakes

- 200 g flour
- 2 eggs
- 300 ml milk
- 35 g sugar

Mix everything and leave the batter to rest for 30 minutes.
+end
$ git add pancakes.md
$ git commit -m "Remove leftover conflict markers"
`````


- [ ] **Step 7: Run the tests to see them pass**

Run: `node --test --test-concurrency=1 "tutorial-sources/git/tests/*.test.mjs"`
Expected: `# tests 40`, `# pass 40`, `# fail 0`.

Then run `node tutorial-sources/git/build.mjs`.
Expected:
- it still prints `Built modules 01, 02 …; ran 10 sessions …`, because a module is published only once both lesson sources exist;
- `git status --short docs/tutorials/git` prints nothing.

- [ ] **Step 8: Commit**

```bash
git add tutorial-sources/git/plan/module_03.json tutorial-sources/git/plan/module_04.json tutorial-sources/git/plan/module_05.json tutorial-sources/git/sessions/module_03 tutorial-sources/git/sessions/module_04 tutorial-sources/git/sessions/module_05 tutorial-sources/git/tests/series-sessions.test.mjs
git commit -m "Git series: Modules 3-5 configuration and sessions" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Module 3 in English and Chinese

**Files:**
- Modify: `tutorial-sources/git/GLOSSARY.md`
- Create: `tutorial-sources/git/src/en/module_03.md`, `tutorial-sources/git/src/zh/module_03.md`
- Modify (generated): `docs/tutorials/git/`. This adds `module_03_EN.html` and `module_03_ZH.html`, and updates the overview pages and the menus of Modules 1–2.

**Interfaces:**
- Consumes: Tasks 1–2. The frames reference Module 3's eight session ids. The quiz answer positions are `1, 2, 3, 0, 1, 2, 0` in both languages.
- Produces: a published Module 3.

The frames fix the structure: headings, session placement, the exercises with worked solutions, the quiz and the reading list. You write the prose in this task, replacing each `<!-- BRIEF … -->` note; the build refuses to run while any note remains.

Style for every lesson:
- second person, short paragraphs, British spelling;
- every claim about a session's output must match what the build prints. Task 2's test pins these values; the transcripts on the built page are the reference;
- explain what Git's messages mean, not only their exact wording (spec §9);
- do not change the exercises, quiz or reading list.

- [ ] **Step 1: Read the official sources the module relies on**

Read:
- the [git log](https://git-scm.com/docs/git-log), [git diff](https://git-scm.com/docs/git-diff), [git restore](https://git-scm.com/docs/git-restore) and [git revert](https://git-scm.com/docs/git-revert) references;
- the [git commit](https://git-scm.com/docs/git-commit) (`--amend`), [git show](https://git-scm.com/docs/git-show) and [git switch](https://git-scm.com/docs/git-switch) (`--detach`) references;
- Pro Git's [Viewing the Commit History](https://git-scm.com/book/en/v2/Git-Basics-Viewing-the-Commit-History) and [Undoing Things](https://git-scm.com/book/en/v2/Git-Basics-Undoing-Things).

Every command, option and fact must match them (spec §6, item 6). Write in your own words: do not copy from Pro Git, which uses a non-commercial licence.

- [ ] **Step 2: Update the glossary**

Replace `tutorial-sources/git/GLOSSARY.md` with this version, which adds the terms Modules 3–5 use:

`tutorial-sources/git/GLOSSARY.md`:

`````markdown
# English–Chinese glossary

Use these renderings in every Chinese page. On first use in a module, give the English term in parentheses, e.g. 暂存区（staging area）. Commands, options, file names and Git's output are never translated. Names of GitHub features follow GitHub's own Chinese interface.

| English | 中文 | Notes |
|---|---|---|
| command session ("Try it" transcript) | 动手环节 | 练习 is only for exercises |
| version control | 版本控制 | |
| centralised / distributed version control | 集中式 / 分布式版本控制 | |
| repository | 仓库 | |
| working tree | 工作区 | |
| staging area (index) | 暂存区（索引） | |
| commit (noun and verb) | 提交 | |
| commit message | 提交说明 | |
| snapshot | 快照 | |
| hash | 哈希（值） | |
| history | 历史 | |
| untracked / tracked | 未跟踪 / 已跟踪 | |
| staged / modified | 已暂存 / 已修改 | |
| branch | 分支 | |
| detached HEAD | 分离的 HEAD | first use: 分离的 HEAD（detached HEAD） |
| diff | 差异 | the output of git diff |
| context lines | 上下文 | unchanged lines shown in a diff |
| restore / unstage | 恢复 / 取消暂存 | git restore |
| amend | 修补 | git commit --amend |
| revert | 撤销 | git revert: undo with a new commit |
| merge commit | 合并提交 | |
| parent (commit) | 父提交 | |
| three-way merge | 三方合并 | |
| conflict marker | 冲突标记 | <<<<<<<, =======, >>>>>>> |
| resolve (a conflict) | 解决（冲突） | |
| abort (a merge) | 放弃（合并） | git merge --abort |
| HEAD | HEAD | not translated |
| merge | 合并 | |
| fast-forward | 快进 | |
| merge conflict | 合并冲突 | |
| remote (repository) | 远程仓库 | |
| clone / fetch / pull / push | 克隆 / 获取 / 拉取 / 推送 | |
| tracking branch / upstream | 跟踪分支 / 上游 | |
| pull request | 拉取请求 | GitHub's Chinese interface |
| fork | 复刻 | GitHub's Chinese interface |
| issue | 议题 | GitHub's Chinese interface |
| code review | 代码评审 | |
| rebase | 变基 | |
| squash | 压缩 | |
| stash | 储藏 | |
| reflog | 引用日志（reflog） | |
| tag / release | 标签 / 发布 | |
| terminal / command line | 终端 / 命令行 | |
| folder / home folder | 文件夹 / 主文件夹 | |
| editor | 编辑器 | |
| configuration / setting | 配置 / 设置 | |
`````


- [ ] **Step 3: Create the English source from its frame and write the prose**

Save this as `tutorial-sources/git/src/en/module_03.md`. Replace each note with finished text that meets its brief; the finished file is about 3,000 words (`wc -w`).

`tutorial-sources/git/src/en/module_03.md`:

`````markdown
## Reading the history {#s1}

<!-- BRIEF part 1 (about 200 words)
- git log lists commits newest first. By default it shows each commit's full hash, author, date and message.
- Useful options: --oneline (one line per commit), -n 2 (only the newest two), --stat (which files changed, and by how much), and a file name at the end (only commits that changed that file).
- ::: tip callout: when the history is longer than the window, git log opens a pager. Scroll with the arrow keys or Space, and press q to leave. The sessions on these pages print everything at once.
-->

{{SESSION:m03-log}}

<!-- BRIEF part 2 (about 120 words)
- Read the --stat lines: "README.md | 2 +-" means one line added and one removed in README.md.
- The last command lists only the pancake commit, because no other commit changed pancakes.md.
-->

## Seeing what changed {#s2}

<!-- BRIEF part 1 (about 150 words)
- git diff compares the working tree with the staging area: changes you have made but not staged.
- git diff --staged compares the staging area with the last commit: what your next commit will contain.
- git show shows a commit: its message and its changes (the newest commit if you give none).
-->

{{SESSION:m03-diff}}

<!-- BRIEF part 2 (about 200 words)
- How to read a diff: the header names the file; "@@ -2,4 +2,5 @@" says the change touches four lines starting at line 2 before, and five lines starting at line 2 after; lines starting with - were removed, lines starting with + were added, and lines starting with a space are unchanged context.
- Why the second git diff printed nothing: everything had been staged. git diff --staged then shows the same change.
- git show after the commit shows the change once more, with the commit's message and author.
- git diff can also compare two commits: git diff <older> <newer>, with hashes from git log --oneline. Lines are then marked - or + by how the newer commit differs from the older one. Exercise 2 practises this.
-->

## Undoing changes you have not committed {#s3}

<!-- BRIEF part 1 (about 150 words)
- git restore <file> replaces the file in the working tree with the version in the staging area, which is normally the last commit: your edits are thrown away.
- git restore --staged <file> unstages a change: it leaves the staging area, but your edit stays in the working tree.
- Git's own status hints suggest both commands.
-->

{{SESSION:m03-restore}}

<!-- BRIEF part 2 (about 100 words)
- ::: pitfall callout: git restore without --staged throws away edits that were never committed, and Git cannot bring them back.
- Older guides use git checkout -- <file> and git reset HEAD <file> for the same jobs; git restore (Git 2.23 and later) says what it does.
-->

## Fixing the last commit {#s4}

<!-- BRIEF part 1 (about 120 words)
- git commit --amend replaces the last commit with a new one: with a new message (-m), or with the same message (--no-edit) and whatever you have staged since.
-->

{{SESSION:m03-amend}}

<!-- BRIEF part 2 (about 150 words)
- The hash changed twice, from 087bb2c to 3fc0d24 to 31783ba: amending makes a new commit and drops the old one from the branch. The "Date:" line shows that the original date is kept.
- ::: pitfall callout: amend only commits you have not shared with anyone; rewriting shared history is the subject of Module 8.
-->

## Undoing a commit {#s5}

<!-- BRIEF part 1 (about 120 words)
- When a commit is older, or already shared, do not rewrite it: git revert <commit> makes a new commit that undoes its changes. HEAD means the newest commit.
- The session undoes a mistaken "Use more flour" commit.
-->

{{SESSION:m03-revert}}

<!-- BRIEF part 2 (about 150 words)
- git revert opened the editor with a ready-made message, Revert "Use more flour"; the session kept it unchanged.
- The history now holds both the mistake and its undo, which is honest and safe for shared branches; cat shows the original 200 g again.
-->

## Looking at an old version {#s6}

<!-- BRIEF part 1 (about 150 words)
- git show <commit>:<file> prints a file as it was in that commit. HEAD~2 means "two commits before HEAD".
- git switch --detach <commit> puts the whole working tree back to an old commit so that you can look around. HEAD then points at a commit, not at a branch, which Git calls a detached HEAD.
-->

{{SESSION:m03-old-version}}

<!-- BRIEF part 2 (about 150 words)
- Read the graph: HEAD sits alone on 907a979 while main stays on the newest commit; nothing is lost, and git switch main returns.
- ::: tip callout: if you make commits while HEAD is detached, create a branch for them (git switch -c <name>) before you switch away; Exercise 6 shows why.
- Older guides use git checkout <commit> for the same thing.
-->

## Exercises {#exercises}

::: exercise #e1 level=1 kind=conceptual minutes=6
**Which command shows it?** Name the command that shows each of these.

1. The changes you have made but not yet staged.
2. The changes you have staged for the next commit.
3. What the last commit changed.
4. Every commit that changed `pancakes.md`.
:::

::: solution
1. `git diff`
2. `git diff --staged`
3. `git show`
4. `git log --oneline pancakes.md` (or `git log pancakes.md` for the full entries)
:::

::: exercise #e2 level=1 kind=coding minutes=8
**Compare two commits.** In the recipes repository, show everything that changed between the first commit and the newest one.
:::

::: solution
List the commits to see how far back the first one is, then compare it with `HEAD`:

{{SESSION:m03-e2-solution}}

`HEAD~2` is the first commit here. The diff shows the reworded line in `README.md`, and the whole of `pancakes.md` as added lines, because the file did not exist in the first commit.
:::

::: exercise #e3 level=1 kind=conceptual minutes=7
**Choose the undo.** Which command fits each situation?

1. You edited `README.md` and want the committed version back.
2. You staged `notes.md` by mistake, but want to keep your edits.
3. The last commit, which you have not shared, has a typo in its message.
4. A commit from last week, already shared with your team, broke the bread recipe.
:::

::: solution
1. `git restore README.md`
2. `git restore --staged notes.md`
3. `git commit --amend -m "…"` with the corrected message
4. `git revert <hash>`, which undoes the commit with a new commit instead of rewriting shared history
:::

::: exercise #e4 level=2 kind=coding minutes=10
**Stop tracking a file.** In Module 2's last exercise, `passwords.txt` was committed by mistake. Keep the file on your disk, but stop tracking it from now on.
:::

::: solution
List the file in `.gitignore`, remove it from the staging area only, and commit:

{{SESSION:m03-e4-solution}}

`git rm --cached` removes the file from the next commit but leaves it on disk, as `ls` shows. The passwords are still in the older commits, so change them, as Module 2 advised.
:::

::: exercise #e5 level=1 kind=coding minutes=7
**Forgot a file.** You committed `bread.md`, then noticed that `butter.md`, part of the same change, was never added. Fix this without making a second commit. When should you not do this?
:::

::: solution
Stage the file and amend the commit, keeping its message:

```text
git add butter.md
git commit --amend --no-edit
```

Do not amend a commit you have already shared: amending replaces it with a new commit, and anyone who has the old one ends up with a different history (Module 8).
:::

::: exercise #e6 level=2 kind=conceptual minutes=7
**Commits on a detached HEAD.** You ran `git switch --detach HEAD~2`, edited a file and made a commit. What happens when you run `git switch main`? How can you keep the commit?
:::

::: solution
Git switches, but warns that you are leaving a commit behind that is not connected to any of your branches, and suggests a `git branch` command with its hash. The commit still exists, but no branch points at it.

To keep it, create a branch before you switch away: `git switch -c rescue`. If you have already switched, the hash in Git's warning (or the reflog, in Module 8) lets you create the branch afterwards.
:::

## Self-check quiz {#quiz}

```quiz
? Which command shows the changes you have staged but not yet committed?
- [ ] `git diff`
- [x] `git diff --staged`
- [ ] `git log`
- [ ] `git status --all`
> `git diff` compares the working tree with the staging area; `--staged` compares the staging area with the last commit.

? In a diff, what does a line starting with `+` mean?
- [ ] The line was removed.
- [ ] The line is unchanged context.
- [x] The line was added.
- [ ] The line has a conflict.
> `+` marks added lines, `-` removed lines, and a leading space unchanged context.

? You want to throw away your uncommitted edits to `README.md`. Which command does that?
- [ ] `git revert README.md`
- [ ] `git restore --staged README.md`
- [ ] `git commit --amend`
- [x] `git restore README.md`
> `git restore <file>` replaces the working-tree file with the staged version; `--staged` only unstages.

? What does `git commit --amend` do?
- [x] It replaces the last commit with a new one.
- [ ] It adds a note to an old commit without changing it.
- [ ] It undoes the last commit with a new commit.
- [ ] It merges the last two commits.
> Amending makes a new commit, with a new hash, in place of the last one.

? A commit you shared last week introduced a bug. What is the safe way to undo it?
- [ ] `git commit --amend`
- [x] `git revert <commit>`
- [ ] Delete the `.git` folder
- [ ] `git restore`
> `git revert` adds a new commit that undoes the old one, without rewriting shared history.

? What does "HEAD detached at 907a979" mean?
- [ ] The repository is damaged.
- [ ] HEAD has been deleted.
- [x] You are looking at a commit directly, not at a branch.
- [ ] Commit 907a979 is not in the history.
> HEAD normally points at a branch; detached, it points straight at a commit.

? What does `HEAD~2` refer to?
- [x] The commit two before the current one
- [ ] The second branch
- [ ] The two newest commits
- [ ] A file called `HEAD~2`
> `~2` means "go back two commits from HEAD".
```

## Further reading {#reading}

- Scott Chacon and Ben Straub, *Pro Git*, sections [2.3: Viewing the Commit History](https://git-scm.com/book/en/v2/Git-Basics-Viewing-the-Commit-History) and [2.4: Undoing Things](https://git-scm.com/book/en/v2/Git-Basics-Undoing-Things).
- The reference pages for [git log](https://git-scm.com/docs/git-log), [git diff](https://git-scm.com/docs/git-diff), [git restore](https://git-scm.com/docs/git-restore) and [git revert](https://git-scm.com/docs/git-revert).
`````


- [ ] **Step 4: Create the Chinese source from its frame and translate**

Save this as `tutorial-sources/git/src/zh/module_03.md`. Replace each note with a translation of the matching finished English text, following `GLOSSARY.md`. Git's output stays in English; the text explains it.

`tutorial-sources/git/src/zh/module_03.md`:

`````markdown
## 阅读历史 {#s1}

<!-- BRIEF Translate English s1 part 1, using GLOSSARY.md. Call the sessions 动手环节. -->

{{SESSION:m03-log}}

<!-- BRIEF Translate English s1 part 2. -->

## 查看改动 {#s2}

<!-- BRIEF Translate English s2 part 1. -->

{{SESSION:m03-diff}}

<!-- BRIEF Translate English s2 part 2. Translate "diff" as 差异 on first use, with the English term in parentheses. -->

## 撤销尚未提交的改动 {#s3}

<!-- BRIEF Translate English s3 part 1. -->

{{SESSION:m03-restore}}

<!-- BRIEF Translate English s3 part 2. -->

## 修改最近一次提交 {#s4}

<!-- BRIEF Translate English s4 part 1. -->

{{SESSION:m03-amend}}

<!-- BRIEF Translate English s4 part 2. -->

## 撤销一次提交 {#s5}

<!-- BRIEF Translate English s5 part 1. -->

{{SESSION:m03-revert}}

<!-- BRIEF Translate English s5 part 2. -->

## 查看旧版本 {#s6}

<!-- BRIEF Translate English s6 part 1. Translate "detached HEAD" as 分离的 HEAD, with the English term in parentheses on first use. -->

{{SESSION:m03-old-version}}

<!-- BRIEF Translate English s6 part 2. -->

## 练习 {#exercises}

::: exercise #e1 level=1 kind=conceptual minutes=6
**用哪条命令查看？** 说出查看下列内容的命令。

1. 你已做出但尚未暂存的改动。
2. 你已为下一次提交暂存的改动。
3. 最近一次提交改动了什么。
4. 所有改动过 `pancakes.md` 的提交。
:::

::: solution
1. `git diff`
2. `git diff --staged`
3. `git show`
4. `git log --oneline pancakes.md`（或用 `git log pancakes.md` 查看完整条目）
:::

::: exercise #e2 level=1 kind=coding minutes=8
**比较两次提交。** 在食谱仓库中，查看从第一次提交到最新一次提交之间的全部改动。
:::

::: solution
先列出提交，看看第一次提交在多久之前，再把它与 `HEAD` 比较：

{{SESSION:m03-e2-solution}}

这里 `HEAD~2` 就是第一次提交。差异显示了 `README.md` 中改写的那一行，以及以新增行形式出现的整个 `pancakes.md`，因为第一次提交时这个文件还不存在。
:::

::: exercise #e3 level=1 kind=conceptual minutes=7
**选择撤销方式。** 下列每种情况分别适用哪条命令？

1. 你编辑了 `README.md`，想恢复为已提交的版本。
2. 你误暂存了 `notes.md`，但想保留你的修改。
3. 最近一次提交（尚未共享）的说明中有错别字。
4. 上周的一次提交已与团队共享，它弄坏了面包食谱。
:::

::: solution
1. `git restore README.md`
2. `git restore --staged notes.md`
3. `git commit --amend -m "…"`，写上改正后的说明
4. `git revert <哈希>`，用一次新提交撤销那次提交，而不改写共享的历史
:::

::: exercise #e4 level=2 kind=coding minutes=10
**停止跟踪文件。** 在第 2 模块的最后一道练习中，`passwords.txt` 被误提交了。请把文件保留在磁盘上，但从现在起停止跟踪它。
:::

::: solution
把文件写进 `.gitignore`，只从暂存区中删除它，然后提交：

{{SESSION:m03-e4-solution}}

`git rm --cached` 把文件从下一次提交中移除，但保留在磁盘上，`ls` 的输出说明了这一点。密码仍然保存在更早的提交中，所以要按第 2 模块的建议更换密码。
:::

::: exercise #e5 level=1 kind=coding minutes=7
**漏了一个文件。** 你提交了 `bread.md`，随后发现属于同一项改动的 `butter.md` 没有添加。请在不做第二次提交的情况下修正。什么情况下不应这样做？
:::

::: solution
暂存该文件并修补提交，保留原来的说明：

```text
git add butter.md
git commit --amend --no-edit
```

不要修补已经共享的提交：修补会用一次新提交替换它，已拿到旧提交的人会因此得到不同的历史（第 8 模块）。
:::

::: exercise #e6 level=2 kind=conceptual minutes=7
**在分离的 HEAD 上提交。** 你运行了 `git switch --detach HEAD~2`，编辑了一个文件并做了一次提交。运行 `git switch main` 时会发生什么？怎样才能保留这次提交？
:::

::: solution
Git 会切换过去，但会警告你留下了一次不属于任何分支的提交，并给出一条带有其哈希的 `git branch` 命令。这次提交仍然存在，只是没有分支指向它。

要保留它，在切换离开之前先创建一个分支：`git switch -c rescue`。如果已经切换走了，可以用 Git 警告中的哈希（或第 8 模块介绍的引用日志）补建分支。
:::

## 自测 {#quiz}

```quiz
? 哪条命令显示已暂存但尚未提交的改动？
- [ ] `git diff`
- [x] `git diff --staged`
- [ ] `git log`
- [ ] `git status --all`
> `git diff` 比较工作区与暂存区；`--staged` 比较暂存区与最近一次提交。

? 在差异中，以 `+` 开头的行表示什么？
- [ ] 这一行被删除了。
- [ ] 这一行是未改动的上下文。
- [x] 这一行是新增的。
- [ ] 这一行存在冲突。
> `+` 表示新增的行，`-` 表示删除的行，以空格开头的是未改动的上下文。

? 你想丢弃对 `README.md` 尚未提交的修改。应使用哪条命令？
- [ ] `git revert README.md`
- [ ] `git restore --staged README.md`
- [ ] `git commit --amend`
- [x] `git restore README.md`
> `git restore <文件>` 用暂存的版本替换工作区中的文件；`--staged` 只取消暂存。

? `git commit --amend` 的作用是什么？
- [x] 用一次新提交替换最近一次提交。
- [ ] 为旧提交添加注释，而不改变它。
- [ ] 用一次新提交撤销最近一次提交。
- [ ] 合并最近的两次提交。
> 修补会生成一次哈希不同的新提交，取代最近一次提交。

? 你上周共享的一次提交引入了缺陷。安全的撤销方法是什么？
- [ ] `git commit --amend`
- [x] `git revert <提交>`
- [ ] 删除 `.git` 文件夹
- [ ] `git restore`
> `git revert` 添加一次撤销旧提交的新提交，不会改写共享的历史。

? “HEAD detached at 907a979” 是什么意思？
- [ ] 仓库损坏了。
- [ ] HEAD 被删除了。
- [x] 你正直接查看一次提交，而不是一个分支。
- [ ] 提交 907a979 不在历史中。
> HEAD 通常指向一个分支；处于分离状态时，它直接指向一次提交。

? `HEAD~2` 指的是什么？
- [x] 当前提交之前的第二次提交
- [ ] 第二个分支
- [ ] 最新的两次提交
- [ ] 一个名为 `HEAD~2` 的文件
> `~2` 表示“从 HEAD 往回数两次提交”。
```

## 延伸阅读 {#reading}

- Scott Chacon、Ben Straub，[《Pro Git》中文版](https://git-scm.com/book/zh/v2)第 2.3 节“查看提交历史”和第 2.4 节“撤消操作”。
- [git log](https://git-scm.com/docs/git-log)、[git diff](https://git-scm.com/docs/git-diff)、[git restore](https://git-scm.com/docs/git-restore) 和 [git revert](https://git-scm.com/docs/git-revert) 的参考文档（英文）。
`````


- [ ] **Step 5: Build and read**

Run: `node tutorial-sources/git/build.mjs`
Expected: `Built modules 01, 02, 03 in English and Chinese; ran 18 sessions with git version 2.50.1 (Apple Git-155).`

Open both Module 3 pages through a local server, for example `python3 -m http.server -d docs 8000`, and read them. Check that:
- the prose matches the transcripts: the hashes `087bb2c` → `3fc0d24` → `31783ba` in the amend session, the diff's `@@ -2,4 +2,5 @@`, and `HEAD is now at 907a979`;
- the `detached` graph shows `HEAD` alone on `907a979` and `main` on `1ad5842`;
- each command's Copy button copies only the command;
- the Chinese reads naturally.

- [ ] **Step 6: Commit**

```bash
git add tutorial-sources/git/GLOSSARY.md tutorial-sources/git/src/en/module_03.md tutorial-sources/git/src/zh/module_03.md docs/tutorials/git
git commit -m "Git series: Module 3 in English and Chinese" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Module 4 in English and Chinese

**Files:**
- Create: `tutorial-sources/git/src/en/module_04.md`, `tutorial-sources/git/src/zh/module_04.md`
- Modify (generated): `docs/tutorials/git/`. This adds `module_04_EN.html` and `module_04_ZH.html`, and updates the overview pages and the menus.

**Interfaces:**
- Consumes: Tasks 1–3. The frames reference:
  - Module 4's six session ids;
  - the graphs `two-labels` and `desserts-ahead` (in `m04-branches`), `before` and `after` (in `m04-fast-forward`), and `diverged` and `merged` (in `m04-three-way`).

  Quiz answer positions are `1, 2, 0, 3, 1, 2, 0` in both languages.
- Produces: a published Module 4.

- [ ] **Step 1: Read the official sources the module relies on**

Read:
- the [git branch](https://git-scm.com/docs/git-branch), [git switch](https://git-scm.com/docs/git-switch) and [git merge](https://git-scm.com/docs/git-merge) references;
- Pro Git's [Branches in a Nutshell](https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell) and [Basic Branching and Merging](https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging).

- [ ] **Step 2: Create the English source from its frame and write the prose**

Save this as `tutorial-sources/git/src/en/module_04.md`. Replace each note in the style given in Task 3; the finished file is about 2,900 words.

`tutorial-sources/git/src/en/module_04.md`:

`````markdown
## What a branch is {#s1}

<!-- BRIEF (about 300 words)
- A branch is a movable label that points at a commit. Creating one copies nothing, so branches are cheap and fast.
- main is an ordinary branch; it is simply the one a repository starts with.
- When you commit, the label of the branch you are on moves forward to the new commit.
- Branches let you work on separate ideas without disturbing each other, then combine them when they are ready.
- ::: analogy callout: bookmarks in a book that you can move, rather than photocopies of the book.
-->

## Creating and switching branches {#s2}

<!-- BRIEF part 1 (about 120 words)
- git branch lists branches (an asterisk marks the current one); git branch <name> creates a branch at the current commit without switching to it.
- git switch <name> moves you onto a branch, updating the files in the working tree to match it.
-->

{{SESSION:m04-branches}}

<!-- BRIEF part 2 (about 200 words)
- Read the output: after git branch desserts, both labels point at the same commit, as the first graph shows.
- The commit on desserts moves only the desserts label; main stays where it was (second graph).
- ls on main does not list cake.md, and ls on desserts does: switching changes the files in your folder to match the branch. The file is not lost; it lives in the desserts commit.
-->

## HEAD {#s3}

<!-- BRIEF (about 200 words)
- HEAD is Git's name for "where you are now". Normally it points at a branch, which points at a commit; the graphs label this "HEAD → desserts".
- Committing moves the branch HEAD points at; switching moves HEAD to another branch.
- A detached HEAD (Module 3) is HEAD pointing straight at a commit instead of at a branch.
-->

## Fast-forward merges {#s4}

<!-- BRIEF part 1 (about 150 words)
- git merge <branch> brings another branch's work into the branch you are on.
- When the other branch contains everything on your branch plus more commits, Git simply moves your branch's label forward to its newest commit. This is a fast-forward: no new commit is needed.
-->

{{SESSION:m04-fast-forward}}

<!-- BRIEF part 2 (about 150 words)
- Read the output: "Updating 288d56b..4d632df" and "Fast-forward"; the graphs before and after show main's label jumping forward.
- git branch -d deletes a branch that has been merged. Only the label goes; the commits stay, reachable from main.
-->

## Three-way merges {#s5}

<!-- BRIEF part 1 (about 150 words)
- When both branches have new commits since they split, Git cannot just move a label. It combines them in a new merge commit, which has two parents.
- Git opens your editor with a ready-made message, "Merge branch 'soups'"; the session keeps it.
-->

{{SESSION:m04-three-way}}

<!-- BRIEF part 2 (about 200 words)
- Read the two graphs: before the merge the branches have split; afterwards the merge commit joins them.
- "Merge made by the 'ort' strategy" names the method Git used; you do not need to know more about it.
- git log --oneline --graph draws the same shape in text: the merge commit, with each branch's commit on its own line underneath.
- It is called a three-way merge because Git compares three versions: the two branch tips and the commit where they split.
-->

## Tidying up branches {#s6}

<!-- BRIEF part 1 (about 100 words)
- git switch -c <name> creates a branch and switches to it in one step; git branch -v shows each branch with its newest commit; git switch - goes back to the previous branch; git branch -m <old> <new> renames a branch.
-->

{{SESSION:m04-switch-c}}

<!-- BRIEF part 2 (about 100 words)
- Older guides use git checkout -b <name> and git checkout <name> for creating and switching.
- Name branches after what they are for: short, lower case, with hyphens (fix-oven-temperature). Slashes are allowed and often used for groups (feature/login).
-->

## Exercises {#exercises}

::: exercise #e1 level=1 kind=conceptual minutes=5
**True or false?**

1. Creating a branch copies all your files.
2. A branch is a label that points at a commit.
3. When you commit, the label of the branch you are on moves to the new commit.
4. Deleting a merged branch deletes its commits.
:::

::: solution
1. **False.** Creating a branch creates a label; no files are copied.
2. **True.**
3. **True.**
4. **False.** Only the label is deleted; the commits stay, because the branch they were merged into still contains them.
:::

::: exercise #e2 level=1 kind=conceptual minutes=7
**Fast-forward or merge commit?** Say which kind of merge each situation produces.

1. You create `fix-typo` from `main`, commit twice, and nobody changes `main`. Then you merge `fix-typo` into `main`.
2. You create `soups` from `main` and commit; meanwhile someone commits to `main`. Then you merge `soups` into `main`.
3. You are on your branch, which has no new commits, and you merge `main`, which has two new ones.
:::

::: solution
1. **Fast-forward.** `main` has not moved, so its label can jump to `fix-typo`'s newest commit.
2. **Merge commit.** Both branches have new commits, so Git creates a commit with two parents.
3. **Fast-forward** of your branch: it contains nothing that `main` lacks, so its label simply moves to `main`'s newest commit.
:::

::: exercise #e3 level=1 kind=coding minutes=10
**A feature branch.** Create a branch called `drinks`, make two commits on it, merge it into `main` and delete it.
:::

::: solution
{{SESSION:m04-e3-solution}}

Because `main` did not move while you worked on `drinks`, the merge is a fast-forward, and `git log --oneline` shows a straight line.
:::

::: exercise #e4 level=2 kind=conceptual minutes=7
**Uncommitted changes and switching.** You edited `pancakes.md` without committing and run `git switch desserts`. What can happen?
:::

::: solution
If `pancakes.md` is the same on both branches, Git switches and carries your uncommitted edit along. If switching would overwrite your edit, because the file differs on `desserts`, Git refuses with "Your local changes to the following files would be overwritten by checkout" and leaves everything as it was. Commit your change first, or put it aside with `git stash` (Module 8).
:::

::: exercise #e5 level=1 kind=coding minutes=8
**Delete a branch that was never merged.** A branch called `experiment` holds a recipe that did not work. Delete the branch.
:::

::: solution
`git branch -d` refuses, because the branch has commits that no other branch contains; `-D` deletes it anyway:

{{SESSION:m04-e5-solution}}

Use `-D` with care: the commit is no longer on any branch. For a while it can still be found through the reflog (Module 8).
:::

::: exercise #e6 level=2 kind=conceptual minutes=8
**Read the graph.** `git log --oneline --graph --all` prints:

```text
* 5049848 (HEAD -> main) Add salt to the pancakes
| * 689ed1b (soups) Add a tomato soup recipe
|/
* 288d56b Add a pancake recipe
* 02804ba Add a README
```

Which branch are you on? Which commits are on both branches? What would `git merge soups` do?
:::

::: solution
You are on `main`. Commits `288d56b` and `02804ba` are on both branches. Both branches have a commit the other lacks, so `git merge soups` would create a merge commit whose parents are `5049848` and `689ed1b`, exactly as in Section 5.
:::

## Self-check quiz {#quiz}

```quiz
? What is a branch in Git?
- [ ] A copy of all the project's files
- [x] A movable label that points at a commit
- [ ] A backup of the repository
- [ ] A connection to a server
> Creating a branch copies nothing; it is a label that moves forward as you commit.

? Which command creates a branch and switches to it?
- [ ] `git branch -v`
- [ ] `git switch -`
- [x] `git switch -c <name>`
- [ ] `git merge <name>`
> `-c` creates the branch; `git branch <name>` creates it without switching.

? You are on `main` and run `git merge desserts`. `desserts` contains `main`'s newest commit plus two more. What happens?
- [x] A fast-forward: `main`'s label moves to `desserts`' newest commit.
- [ ] Git creates a merge commit with two parents.
- [ ] Git reports a conflict.
- [ ] The `desserts` branch is deleted.
> Nothing on `main` is missing from `desserts`, so no merge commit is needed.

? How many parents does a merge commit have?
- [ ] None
- [ ] One
- [ ] Three
- [x] Two
> It joins two lines of work, so it has one parent on each side.

? What does the label `HEAD → desserts` in a graph mean?
- [ ] The `desserts` branch has been deleted.
- [x] You are on `desserts`, and your next commit will move it.
- [ ] `desserts` is a detached HEAD.
- [ ] `desserts` has been merged into `main`.
> HEAD points at the branch you are on.

? `git branch -d experiment` reports that the branch is not fully merged. Why?
- [ ] The branch name is misspelt.
- [ ] You are on the `experiment` branch.
- [x] It has commits that the current branch does not contain.
- [ ] Git cannot delete branches.
> `-d` protects work that would no longer be on any branch; `-D` deletes anyway.

? Which older command does `git switch -c fix` replace?
- [x] `git checkout -b fix`
- [ ] `git branch -d fix`
- [ ] `git merge fix`
- [ ] `git commit -b fix`
> Older guides use `git checkout -b`; `git switch -c` does the same job.
```

## Further reading {#reading}

- Scott Chacon and Ben Straub, *Pro Git*, sections [3.1: Branches in a Nutshell](https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell) and [3.2: Basic Branching and Merging](https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging).
- The reference pages for [git branch](https://git-scm.com/docs/git-branch), [git switch](https://git-scm.com/docs/git-switch) and [git merge](https://git-scm.com/docs/git-merge).
- [Learn Git Branching](https://learngitbranching.js.org/), for extra practice with branches and merges in your browser.
`````


- [ ] **Step 3: Create the Chinese source from its frame and translate**

Save this as `tutorial-sources/git/src/zh/module_04.md` and translate as in Task 3:

`tutorial-sources/git/src/zh/module_04.md`:

`````markdown
## 分支是什么 {#s1}

<!-- BRIEF Translate the finished English section s1, using GLOSSARY.md. -->

## 创建和切换分支 {#s2}

<!-- BRIEF Translate English s2 part 1. -->

{{SESSION:m04-branches}}

<!-- BRIEF Translate English s2 part 2. Call the session 动手环节. -->

## HEAD {#s3}

<!-- BRIEF Translate the finished English section s3. -->

## 快进合并 {#s4}

<!-- BRIEF Translate English s4 part 1. -->

{{SESSION:m04-fast-forward}}

<!-- BRIEF Translate English s4 part 2. -->

## 三方合并 {#s5}

<!-- BRIEF Translate English s5 part 1. -->

{{SESSION:m04-three-way}}

<!-- BRIEF Translate English s5 part 2. -->

## 整理分支 {#s6}

<!-- BRIEF Translate English s6 part 1. -->

{{SESSION:m04-switch-c}}

<!-- BRIEF Translate English s6 part 2. Keep the example branch names in English. -->

## 练习 {#exercises}

::: exercise #e1 level=1 kind=conceptual minutes=5
**判断对错。**

1. 创建分支会复制你的所有文件。
2. 分支是指向某次提交的标签。
3. 提交时，你所在分支的标签会移到新的提交上。
4. 删除一个已合并的分支会删除它的提交。
:::

::: solution
1. **错。**创建分支只是创建一个标签，不会复制任何文件。
2. **对。**
3. **对。**
4. **错。**只有标签被删除；提交仍然保留，因为它们已合并进的那个分支仍然包含它们。
:::

::: exercise #e2 level=1 kind=conceptual minutes=7
**快进还是合并提交？** 说出每种情况产生哪一种合并。

1. 你从 `main` 创建了 `fix-typo`，提交了两次，期间没有人修改 `main`。然后你把 `fix-typo` 合并进 `main`。
2. 你从 `main` 创建了 `soups` 并提交；与此同时，有人向 `main` 提交了。然后你把 `soups` 合并进 `main`。
3. 你位于自己的分支上，该分支没有新提交；你合并了有两次新提交的 `main`。
:::

::: solution
1. **快进。**`main` 没有移动，所以它的标签可以直接跳到 `fix-typo` 的最新提交。
2. **合并提交。**两个分支都有新提交，所以 Git 创建一次有两个父提交的提交。
3. 你的分支**快进**：它没有 `main` 所缺少的内容，所以它的标签直接移到 `main` 的最新提交。
:::

::: exercise #e3 level=1 kind=coding minutes=10
**一个功能分支。** 创建名为 `drinks` 的分支，在其上提交两次，把它合并进 `main`，然后删除它。
:::

::: solution
{{SESSION:m04-e3-solution}}

由于你在 `drinks` 上工作期间 `main` 没有移动，这次合并是快进，`git log --oneline` 显示为一条直线。
:::

::: exercise #e4 level=2 kind=conceptual minutes=7
**未提交的改动与切换分支。** 你修改了 `pancakes.md` 但没有提交，然后运行 `git switch desserts`。可能会发生什么？
:::

::: solution
如果 `pancakes.md` 在两个分支上相同，Git 会切换过去，并把你未提交的修改一起带过去。如果切换会覆盖你的修改（因为该文件在 `desserts` 上不同），Git 会拒绝，提示 “Your local changes to the following files would be overwritten by checkout”，并保持一切不变。请先提交你的改动，或者用 `git stash` 把它暂时放到一边（第 8 模块）。
:::

::: exercise #e5 level=1 kind=coding minutes=8
**删除一个从未合并的分支。** 名为 `experiment` 的分支保存着一份失败的食谱。请删除这个分支。
:::

::: solution
`git branch -d` 会拒绝，因为这个分支有其他分支都不包含的提交；`-D` 则会强制删除：

{{SESSION:m04-e5-solution}}

使用 `-D` 要小心：这次提交不再属于任何分支。在一段时间内，仍可以通过引用日志找到它（第 8 模块）。
:::

::: exercise #e6 level=2 kind=conceptual minutes=8
**读懂提交图。** `git log --oneline --graph --all` 输出：

```text
* 5049848 (HEAD -> main) Add salt to the pancakes
| * 689ed1b (soups) Add a tomato soup recipe
|/
* 288d56b Add a pancake recipe
* 02804ba Add a README
```

你位于哪个分支？哪些提交同时属于两个分支？`git merge soups` 会做什么？
:::

::: solution
你位于 `main`。提交 `288d56b` 和 `02804ba` 同时属于两个分支。两个分支各有对方没有的提交，所以 `git merge soups` 会创建一次合并提交，其父提交是 `5049848` 和 `689ed1b`，与第 5 节完全相同。
:::

## 自测 {#quiz}

```quiz
? Git 中的分支是什么？
- [ ] 项目所有文件的一份副本
- [x] 指向某次提交的可移动标签
- [ ] 仓库的备份
- [ ] 与服务器的连接
> 创建分支不复制任何东西；它是一个随提交向前移动的标签。

? 哪条命令创建分支并切换过去？
- [ ] `git branch -v`
- [ ] `git switch -`
- [x] `git switch -c <名称>`
- [ ] `git merge <名称>`
> `-c` 创建分支；`git branch <名称>` 只创建而不切换。

? 你位于 `main`，运行 `git merge desserts`。`desserts` 包含 `main` 的最新提交，另外还多两次提交。会发生什么？
- [x] 快进：`main` 的标签移到 `desserts` 的最新提交。
- [ ] Git 创建一次有两个父提交的合并提交。
- [ ] Git 报告冲突。
- [ ] `desserts` 分支被删除。
> `main` 上的内容 `desserts` 都有，所以不需要合并提交。

? 一次合并提交有几个父提交？
- [ ] 没有
- [ ] 一个
- [ ] 三个
- [x] 两个
> 它连接两条工作线，所以两边各有一个父提交。

? 提交图中的标签 `HEAD → desserts` 是什么意思？
- [ ] `desserts` 分支已被删除。
- [x] 你位于 `desserts`，下一次提交会让它向前移动。
- [ ] `desserts` 是一个分离的 HEAD。
- [ ] `desserts` 已合并进 `main`。
> HEAD 指向你所在的分支。

? `git branch -d experiment` 提示该分支没有完全合并。为什么？
- [ ] 分支名称拼错了。
- [ ] 你正位于 `experiment` 分支上。
- [x] 它有当前分支所不包含的提交。
- [ ] Git 不能删除分支。
> `-d` 保护那些删除后将不属于任何分支的工作；`-D` 会强制删除。

? `git switch -c fix` 取代了哪条旧命令？
- [x] `git checkout -b fix`
- [ ] `git branch -d fix`
- [ ] `git merge fix`
- [ ] `git commit -b fix`
> 较早的教程使用 `git checkout -b`；`git switch -c` 完成同样的工作。
```

## 延伸阅读 {#reading}

- Scott Chacon、Ben Straub，[《Pro Git》中文版](https://git-scm.com/book/zh/v2)第 3.1 节“分支简介”和第 3.2 节“分支的新建与合并”。
- [git branch](https://git-scm.com/docs/git-branch)、[git switch](https://git-scm.com/docs/git-switch) 和 [git merge](https://git-scm.com/docs/git-merge) 的参考文档（英文）。
- [Learn Git Branching](https://learngitbranching.js.org/?locale=zh_CN)：在浏览器中额外练习分支与合并。
`````


- [ ] **Step 4: Build and read**

Run: `node tutorial-sources/git/build.mjs`
Expected: `Built modules 01, 02, 03, 04 in English and Chinese; ran 24 sessions with git version 2.50.1 (Apple Git-155).`

Read both Module 4 pages as in Task 3. Also check:
- each graph shows its branch labels: `desserts` with the light-blue label of a local branch, never the grey label of a remote one;
- `merged` draws the merge commit with two parent lines;
- the prose quotes `Updating 288d56b..4d632df` and "Merge made by the 'ort' strategy." as printed.

- [ ] **Step 5: Commit**

```bash
git add tutorial-sources/git/src/en/module_04.md tutorial-sources/git/src/zh/module_04.md docs/tutorials/git
git commit -m "Git series: Module 4 in English and Chinese" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Module 5 in English and Chinese

**Files:**
- Create: `tutorial-sources/git/src/en/module_05.md`, `tutorial-sources/git/src/zh/module_05.md`
- Modify (generated): `docs/tutorials/git/`. This adds `module_05_EN.html` and `module_05_ZH.html`, and updates the overview pages and the menus.

**Interfaces:**
- Consumes: Tasks 1–4. The frames reference Module 5's five session ids and the graph `resolved` (in `m05-conflict`). Quiz answer positions are `1, 2, 3, 0, 1, 2` in both languages.
- Produces: a published Module 5.

- [ ] **Step 1: Read the official sources the module relies on**

Read:
- the [git merge](https://git-scm.com/docs/git-merge) reference: the sections "How conflicts are presented" and "How to resolve conflicts", and `--abort`;
- [git diff](https://git-scm.com/docs/git-diff) (`--check`);
- GitHub Docs' [Resolving a merge conflict using the command line](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/addressing-merge-conflicts/resolving-a-merge-conflict-using-the-command-line).

- [ ] **Step 2: Create the English source from its frame and write the prose**

Save this as `tutorial-sources/git/src/en/module_05.md`. Replace each note in the style given in Task 3; the finished file is about 2,400 words.

`tutorial-sources/git/src/en/module_05.md`:

`````markdown
## Why conflicts happen {#s1}

<!-- BRIEF (about 250 words)
- Git merges line by line. Changes to different files, or to different parts of one file, combine automatically.
- A conflict happens when both branches changed the same lines differently, or when one branch deleted a file that the other changed. Git cannot know which version is right, so it stops and asks you.
- Conflicts are a normal part of working with others, not an error and not a sign that something is broken.
- ::: analogy callout: two editors marking the same sentence of a manuscript in different ways; someone has to decide.
-->

## When Git merges on its own {#s2}

<!-- BRIEF part 1 (about 100 words)
- Both branches change pancakes.md: one changes the amount of flour, the other the resting time, several lines apart.
-->

{{SESSION:m05-no-conflict}}

<!-- BRIEF part 2 (about 100 words)
- "Auto-merging pancakes.md" and then a merge commit: Git combined the two changes, as cat shows.
- Changes on neighbouring lines can still conflict, because Git needs at least one unchanged line between them to tell them apart.
-->

## Reading and resolving a conflict {#s3}

<!-- BRIEF part 1 (about 150 words)
- This time both branches change the same line: less-sugar reduces the sugar to 30 g, while main has reduced it to 40 g. The merge stops with a conflict; the session then resolves it.
-->

{{SESSION:m05-conflict}}

<!-- BRIEF part 2 (about 300 words)
- The merge reports "CONFLICT (content)" and stops; git status says "You have unmerged paths" and lists the file as "both modified".
- In the file, the conflicting part sits between markers: from <<<<<<< HEAD to ======= is the version on your current branch, and from ======= to >>>>>>> less-sugar is the version from the branch you are merging. Everything outside the markers merged cleanly.
- To resolve: edit the file into the version you want (here a compromise of 35 g) and delete all three marker lines.
- git add marks the file as resolved; git status then says "All conflicts fixed but you are still merging".
- git commit concludes the merge; the editor opens with "Merge branch 'less-sugar'", which the session keeps. The graph shows the finished merge.
- ::: tip callout: editors such as Visual Studio Code highlight conflicts and offer buttons to accept either version or both; you still finish with git add and git commit.
-->

## Backing out of a merge {#s4}

<!-- BRIEF part 1 (about 80 words)
- If you are not ready to resolve a conflict, git merge --abort puts everything back as it was before the merge started.
-->

{{SESSION:m05-abort}}

<!-- BRIEF part 2 (about 60 words)
- After the abort, git status is clean, and the file still has main's 40 g.
-->

## Keeping conflicts small {#s5}

<!-- BRIEF (about 250 words)
- Merge main into your branch often, so that you meet other people's changes early, while they are small (Module 8 shows rebase as an alternative).
- Keep branches short-lived and commits focused on one change.
- Agree who works on which files; talk before both reworking the same part.
- Do not reformat or re-indent whole files on a feature branch: such changes touch every line and conflict with everything.
- Before committing a resolution, check for leftover markers; git diff --check reports them (Exercise 6).
-->

## Exercises {#exercises}

::: exercise #e1 level=1 kind=conceptual minutes=5
**Will it conflict?** Say whether each merge stops with a conflict.

1. Branch A edits `soup.md`; branch B edits `bread.md`.
2. Both edit `pancakes.md`: A the first ingredient, B the last line of the method.
3. Both change the sugar line of `pancakes.md`, to different amounts.
4. Branch A deletes `cake.md`; branch B edits it.
:::

::: solution
1. **No.** Different files merge automatically.
2. **No**, as long as unchanged lines separate the two changes, as in Section 2.
3. **Yes.** Both changed the same line differently.
4. **Yes.** Git cannot both delete the file and keep the edit, so it asks you to choose.
:::

::: exercise #e2 level=1 kind=conceptual minutes=5
**Read the markers.** A conflicted file contains:

```text
<<<<<<< HEAD
- 40 g sugar
=======
- 30 g sugar
>>>>>>> less-sugar
```

Which version is from the branch you are on, and which from the branch you are merging? What must the file contain when you have resolved the conflict?
:::

::: solution
`- 40 g sugar`, between `<<<<<<< HEAD` and `=======`, is from the branch you are on. `- 30 g sugar`, between `=======` and `>>>>>>> less-sugar`, is from `less-sugar`. When resolved, the file contains only the line you choose (one of them, both, or something new), and none of the three marker lines.
:::

::: exercise #e3 level=2 kind=coding minutes=8
**Keep both changes.** On one branch you added chocolate chips to the pancakes; on `main` someone added a banana, in the same place. Merge the branch and keep both ingredients.
:::

::: solution
The merge stops, because both changes are on the same line of the list. Keep both lines and remove the markers:

{{SESSION:m05-e3-solution}}

A resolution does not have to pick a side: here the right answer is both.
:::

::: exercise #e4 level=1 kind=conceptual minutes=4
**Committing too early.** You removed the markers from `pancakes.md` and ran `git commit`, but Git refused, saying that committing is not possible because you have unmerged files. Why?
:::

::: solution
You skipped `git add pancakes.md`. Until you stage the file, Git still counts it as unmerged, whatever its content. Run `git add pancakes.md`, then `git commit`.
:::

::: exercise #e5 level=1 kind=conceptual minutes=4
**Prevent it.** Two cooks changed the sugar line at the same time, on different branches. What could they have done to avoid the conflict?
:::

::: solution
Any of these: talk first and let one person make the change; keep the branches short, so that one change is merged before the other begins; merge `main` into each branch often, so that the second cook sees the first change before editing the same line.
:::

::: exercise #e6 level=2 kind=coding minutes=4
**A leftover marker.** Someone resolved the sugar conflict in a hurry and committed the file with the markers still in it. Find them and fix the file.
:::

::: solution
`git diff --check` reports leftover conflict markers, and fails when it finds any; comparing with `HEAD~1` checks what the last commit changed:

{{SESSION:m05-e6-solution}}

Run `git diff --check` (without arguments, for your unstaged changes) before you commit a resolution, and you will not need this repair.
:::

## Self-check quiz {#quiz}

```quiz
? When does Git report a merge conflict?
- [ ] Whenever both branches changed the same file
- [x] When both branches changed the same lines differently
- [ ] Whenever a merge creates a merge commit
- [ ] When the branches have different names
> Changes to different parts of a file merge automatically; the same lines changed differently need a decision.

? In a conflicted file, what lies between `<<<<<<< HEAD` and `=======`?
- [ ] The version from the branch you are merging
- [ ] The version from the first commit
- [x] The version from the branch you are on
- [ ] Git's suggested resolution
> HEAD is your current branch; the part after `=======` comes from the other branch.

? You have edited a conflicted file into its final form. What do you run next?
- [ ] `git merge` again
- [ ] `git restore` on the file
- [ ] `git merge --abort`
- [x] `git add` on the file
> Staging the file marks it as resolved; `git commit` then concludes the merge.

? Which command puts everything back as it was before the merge started?
- [x] `git merge --abort`
- [ ] `git revert HEAD`
- [ ] `git restore --staged .`
- [ ] `git branch -D`
> Aborting undoes the unfinished merge.

? Which habit keeps conflicts small?
- [ ] Reformatting whole files on feature branches
- [x] Merging `main` into your branch often
- [ ] Keeping a branch open for months
- [ ] Making one large commit at the end
> Meeting other people's changes early keeps each conflict small.

? What does `git diff --check` warn about?
- [ ] Commits that have not been pushed
- [ ] Branches that have not been merged
- [x] Leftover conflict markers and whitespace errors
- [ ] Files that are not tracked
> It is a quick check before committing a resolution.
```

## Further reading {#reading}

- Scott Chacon and Ben Straub, *Pro Git*, section [3.2: Basic Branching and Merging](https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging), part "Basic Merge Conflicts".
- The reference page for [git merge](https://git-scm.com/docs/git-merge), section "How conflicts are presented".
- GitHub Docs, [Resolving a merge conflict using the command line](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/addressing-merge-conflicts/resolving-a-merge-conflict-using-the-command-line).
`````


- [ ] **Step 3: Create the Chinese source from its frame and translate**

Save this as `tutorial-sources/git/src/zh/module_05.md` and translate as in Task 3:

`tutorial-sources/git/src/zh/module_05.md`:

`````markdown
## 冲突为何发生 {#s1}

<!-- BRIEF Translate the finished English section s1, using GLOSSARY.md. -->

## Git 能自行合并的情况 {#s2}

<!-- BRIEF Translate English s2 part 1. Call the session 动手环节. -->

{{SESSION:m05-no-conflict}}

<!-- BRIEF Translate English s2 part 2. -->

## 读懂并解决冲突 {#s3}

<!-- BRIEF Translate English s3 part 1. -->

{{SESSION:m05-conflict}}

<!-- BRIEF Translate English s3 part 2. Keep the conflict markers and Git's messages in English. -->

## 放弃一次合并 {#s4}

<!-- BRIEF Translate English s4 part 1. -->

{{SESSION:m05-abort}}

<!-- BRIEF Translate English s4 part 2. -->

## 让冲突保持在小范围内 {#s5}

<!-- BRIEF Translate the finished English section s5. -->

## 练习 {#exercises}

::: exercise #e1 level=1 kind=conceptual minutes=5
**会冲突吗？** 判断下列每次合并是否会因冲突而停下。

1. 分支 A 修改 `soup.md`；分支 B 修改 `bread.md`。
2. 两个分支都修改 `pancakes.md`：A 修改第一种配料，B 修改做法的最后一行。
3. 两个分支都把 `pancakes.md` 中糖的那一行改成了不同的用量。
4. 分支 A 删除了 `cake.md`；分支 B 修改了它。
:::

::: solution
1. **不会。**不同的文件会自动合并。
2. **不会**，只要两处改动之间隔着未改动的行，就像第 2 节那样。
3. **会。**两个分支对同一行做了不同的修改。
4. **会。**Git 无法既删除文件又保留修改，所以会请你做出选择。
:::

::: exercise #e2 level=1 kind=conceptual minutes=5
**读懂标记。** 一个有冲突的文件包含：

```text
<<<<<<< HEAD
- 40 g sugar
=======
- 30 g sugar
>>>>>>> less-sugar
```

哪个版本来自你所在的分支，哪个来自你正在合并的分支？解决冲突后，文件中应该包含什么？
:::

::: solution
位于 `<<<<<<< HEAD` 和 `=======` 之间的 `- 40 g sugar` 来自你所在的分支；位于 `=======` 和 `>>>>>>> less-sugar` 之间的 `- 30 g sugar` 来自 `less-sugar`。解决之后，文件中只包含你选定的内容（二者之一、两者都要，或是新的写法），三行标记都不能留下。
:::

::: exercise #e3 level=2 kind=coding minutes=8
**保留两处改动。** 你在一个分支上给煎饼加了巧克力豆；有人在 `main` 上同一位置加了一根香蕉。合并该分支，并保留这两种配料。
:::

::: solution
合并会停下来，因为两处改动位于清单的同一行。保留这两行并删除标记：

{{SESSION:m05-e3-solution}}

解决冲突不一定要选边站：这里正确的答案是两者都要。
:::

::: exercise #e4 level=1 kind=conceptual minutes=4
**提交得太早。** 你删除了 `pancakes.md` 中的标记，然后运行 `git commit`，但 Git 拒绝了，说因为存在未合并的文件而无法提交。为什么？
:::

::: solution
你漏掉了 `git add pancakes.md`。在你暂存这个文件之前，无论其内容如何，Git 都把它视为未合并。先运行 `git add pancakes.md`，再运行 `git commit`。
:::

::: exercise #e5 level=1 kind=conceptual minutes=4
**防患于未然。** 两位厨师在不同的分支上同时修改了糖的那一行。他们本可以怎样避免这次冲突？
:::

::: solution
以下任意一种：事先沟通，由一个人来做这项修改；让分支保持短小，使一项改动在另一项开始之前就已合并；经常把 `main` 合并进各自的分支，这样第二位厨师在编辑同一行之前就能看到第一项改动。
:::

::: exercise #e6 level=2 kind=coding minutes=4
**遗留的标记。** 有人匆忙解决了糖的冲突，把仍带着标记的文件提交了。请找出这些标记并修复文件。
:::

::: solution
`git diff --check` 会报告遗留的冲突标记，发现标记时它会以失败结束；与 `HEAD~1` 比较可以检查最近一次提交改动的内容：

{{SESSION:m05-e6-solution}}

在提交冲突解决结果之前，先运行 `git diff --check`（不带参数时检查未暂存的改动），就不需要这样补救了。
:::

## 自测 {#quiz}

```quiz
? Git 什么时候报告合并冲突？
- [ ] 只要两个分支修改了同一个文件
- [x] 当两个分支对同一些行做了不同的修改时
- [ ] 只要合并产生了合并提交
- [ ] 当两个分支名称不同时
> 对文件不同部分的修改会自动合并；同一些行的不同修改需要人来决定。

? 在有冲突的文件中，`<<<<<<< HEAD` 和 `=======` 之间是什么？
- [ ] 来自你正在合并的分支的版本
- [ ] 来自第一次提交的版本
- [x] 来自你所在分支的版本
- [ ] Git 建议的解决方案
> HEAD 是你当前的分支；`=======` 之后的部分来自另一个分支。

? 你已把有冲突的文件编辑成最终形式。下一步运行什么？
- [ ] 再次运行 `git merge`
- [ ] 对该文件运行 `git restore`
- [ ] `git merge --abort`
- [x] 对该文件运行 `git add`
> 暂存文件就把它标记为已解决；随后 `git commit` 完成合并。

? 哪条命令能让一切恢复到合并开始之前的状态？
- [x] `git merge --abort`
- [ ] `git revert HEAD`
- [ ] `git restore --staged .`
- [ ] `git branch -D`
> 放弃会撤销这次未完成的合并。

? 哪种习惯能让冲突保持在小范围内？
- [ ] 在功能分支上重新排版整个文件
- [x] 经常把 `main` 合并进你的分支
- [ ] 让一个分支开着好几个月
- [ ] 在最后做一次大提交
> 尽早接触他人的改动，每次冲突就会很小。

? `git diff --check` 会就什么发出警告？
- [ ] 尚未推送的提交
- [ ] 尚未合并的分支
- [x] 遗留的冲突标记和空白错误
- [ ] 未被跟踪的文件
> 它是提交冲突解决结果之前的一项快速检查。
```

## 延伸阅读 {#reading}

- Scott Chacon、Ben Straub，[《Pro Git》中文版](https://git-scm.com/book/zh/v2)第 3.2 节“分支的新建与合并”中的“遇到冲突时的分支合并”。
- [git merge](https://git-scm.com/docs/git-merge) 参考文档（英文）中的“How conflicts are presented”一节。
- GitHub 文档：[使用命令行解决合并冲突](https://docs.github.com/zh/pull-requests/collaborating-with-pull-requests/addressing-merge-conflicts/resolving-a-merge-conflict-using-the-command-line)。
`````


- [ ] **Step 4: Build and read**

Run: `node tutorial-sources/git/build.mjs`
Expected: `Built modules 01, 02, 03, 04, 05 in English and Chinese; ran 29 sessions with git version 2.50.1 (Apple Git-155).`

Read both Module 5 pages as in Task 3. Also check:
- the failed `git merge less-sugar` is shown as a failed command;
- the prose describes the conflict markers exactly as `cat` prints them (`<<<<<<< HEAD`, `=======`, `>>>>>>> less-sugar`);
- Exercise 6's solution quotes the three `leftover conflict marker` lines (6, 8 and 10).

- [ ] **Step 5: Commit**

```bash
git add tutorial-sources/git/src/en/module_05.md tutorial-sources/git/src/zh/module_05.md docs/tutorials/git
git commit -m "Git series: Module 5 in English and Chinese" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Tutorials index card and full verification

**Files:**
- Modify: `docs/tutorials/index.md` (the Git card's description only)

- [ ] **Step 1: Update the Git card**

In `docs/tutorials/index.md`, in the "Git and Version Control" card, replace

```
Modules 1 and 2 are available now; the other modules are in preparation.
```

with

```
Modules 1 to 5 are available now; the other modules are in preparation.
```

Change nothing else in the file. The MDE card above it may be changing in the main checkout.

- [ ] **Step 2: Full verification**

```bash
node --test --test-concurrency=1 "tutorial-sources/git/tests/*.test.mjs"
node tutorial-sources/git/build.mjs
git status --short docs/tutorials/git
node tutorial-sources/git/validate.mjs
python -m mkdocs build --strict -d /tmp/wrwei-site-check
```

Expected:
- The tests show `# pass 40` and `# fail 0`.
- The build reports modules 01–05 and 29 sessions.
- `git status` prints nothing, so the rebuild is byte-identical, hashes included.
- The validator prints `PASS: modules 01, 02, 03, 04, 05 in both languages: sessions, copyable commands, graphs, quiz, solutions, progress, language switch and layouts at 360–1280px.`
- MkDocs exits 0. Use an environment with `requirements.txt` installed; the site goes to a temporary folder outside the repository.

- [ ] **Step 3: Look at the screenshots**

Open the `wrwei-git-module-0[345]-*.png` files from the temp folder the validator printed. Check that transcripts and graphs are legible at both widths, and that the Chinese text is not garbled.

- [ ] **Step 4: Commit and stop**

```bash
git add docs/tutorials/index.md
git commit -m "Git series: Modules 1-5 available" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git log --oneline main..git-modules-03-05
```

Report the branch's commits, the verification results and the screenshots' location to the site owner. **Do not push or merge.**

---

### Task 7: Publication (only when the site owner asks)

- [ ] **Step 1: Merge and push as instructed**

Bring `git-modules-03-05` into `main` the way the site owner chooses: a merge or a pull request.
- The main checkout may hold uncommitted MDE work by another agent. Do not stash, reset or commit it.
- If merging there would touch those files, stop and ask.

Pushing `main` runs `.github/workflows/deploy.yml`.

```bash
gh run list --workflow deploy.yml --limit 1
gh run watch <run-id> --exit-status
```

Expected: the deployment succeeds.

- [ ] **Step 2: Check the live site**

```bash
for p in tutorials/git/ tutorials/git/module_03_EN.html tutorials/git/module_04_ZH.html tutorials/git/module_05_EN.html; do curl -s -o /dev/null -w "%{http_code} $p\n" "https://wrwei.github.io/$p"; done
```

Expected: `200` for each page. GitHub Pages can take a minute to update.

- [ ] **Step 3: Remove the worktree**

From the main checkout, run `git worktree remove ../wrwei.github.io-git-modules`, once the branch is merged.
