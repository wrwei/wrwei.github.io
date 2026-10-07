# Git and Version Control Series: Modules 6–8 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish-ready Modules 6 (Remotes), 7 (Collaborating with pull requests) and 8 (Rewriting history and recovering) in English and Chinese, with the session-runner fixes that remotes and rebasing need.

**Architecture:** The series tooling is unchanged except for four fixes in the session runner, found while running Modules 6–8's sessions:
- **Deterministic hashes:** sessions run in fixed sandbox folders, because `git pull` writes the server's real path into merge messages, and so into commit hashes.
- **Readable graph labels:** graph labels show readable paths.
- **Progress lines:** a line that a terminal would overwrite shows only its final state.
- **Person switches:** a change of person is shown only before that person's next visible step, so hidden setup can act as anyone.

Each module adds configuration, sessions pinned by tests, figures, and finished English and Chinese lessons.

**Tech Stack:**
- Node 22.2+ (`node:test`; `markdown-it` and `puppeteer-core` via `tutorial-sources/ai/tools`);
- Git, exactly `git version 2.50.1 (Apple Git-155)`;
- Chrome or Edge;
- MkDocs (root `requirements.txt`).

**Spec:** `tutorial-sources/git/SPEC.md` (approved 2026-10-07): §3 (Modules 6–8 rows and teaching choices), §4 (command sessions, determinism), §6 (quality checks), §9 (risks: authentication, changing GitHub pages). Read it, and `tutorial-sources/git/README.md`, before starting.

**Provenance:** before this plan was written, every file in it was run in a scratch copy of branch `git-modules-03-05`:
- each test failed before its change, for the reasons given;
- all 60 tests then passed;
- `build.mjs` built Modules 1–8 (50 sessions) twice with byte-identical output;
- `validate.mjs` passed for Modules 1–8;
- every external link returned HTTP 200 without a redirect.

The lessons in this plan are finished text, written and checked against the official documentation and the session output, so Tasks 3–5 copy them rather than write them. Copy every file exactly.

## Global Constraints

- **Separate worktree, stacked branch.** Another agent is editing the MDE series in the main checkout. Work in the worktree `../wrwei.github.io-git-modules` on branch `git-modules-06-08`. That branch was created from `git-modules-03-05` (Modules 3–5, reviewed but not yet merged) to commit this plan.
- **Allowed paths.** Change only `tutorial-sources/git/`, `docs/tutorials/git/` and the Git card in `docs/tutorials/index.md`. Stage files by explicit path; never `git add -A` or `git add .`.
- **Git version.** The build runs only with `git version 2.50.1 (Apple Git-155)`. Node 22.2 or later.
- **Bilingual.** Every module is in English and Simplified Chinese, with the same sections, sessions, graphs, figures, exercises and quiz answers. Chinese follows `GLOSSARY.md`; GitHub's button names stay in English, because GitHub's web interface is not translated.
- **Real output only.** Output shown on pages comes only from the build's runs of real Git. The one hand-typed listing, Module 8's rebase to-do list, is pinned by tests to the session's hashes.
- **Plain commands.** Sessions use only `git` and the built-ins, with plain arguments. Braces such as `HEAD@{1}` are rejected; lessons use hashes and explain the PowerShell quoting.
- **Follow-along.** Every teaching session and coding exercise tells learners how to recreate its starting situation in their own repository, or why their output differs (lesson from the Modules 3–5 review).
- **Shared files.** Do not modify the AI series' shared files: `md.mjs`, `style.css`, `tutorial.js`.
- **Commits.** Commit after each task. Messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- **Publishing.** Do not push, merge into `main` or deploy unless the site owner explicitly asks (Task 7).

## Review Focus

1. **A commit whose content names a sandbox path,** such as a merge made by `git pull`, getting a new hash on every build. Expected: two builds are byte-identical. Pinned by `tests/build.test.mjs` 'a pull that merges gives the same commit on every run…' (Task 1), and the double build in Task 6.
2. **Two builds or test runs at once, or a crashed run's leftover folder.** Expected: a second run waits for the session's folder, and a folder older than ten minutes is cleared. Pinned by `tests/build.test.mjs` 'a sandbox folder left behind by a run that crashed…' (Task 1). Running at once is handled by the wait loop, and is not tested.
3. **Learners who cannot create `/srv/git`, or who play two people on one computer.** Expected: the lesson gives commands that work in their own folders. Pinned by `tests/lesson-facts.test.mjs` 'Module 6 tells learners where to put their stand-in server' (Task 3).
4. **A change of person shown with nothing after it**, for example while hidden setup acts as Sam. Expected: "Now acting as…" appears only before that person's visible steps. Pinned by `tests/session.test.mjs` (Task 1) and the `people()` assertions in `tests/series-sessions.test.mjs` (Task 2).
5. **The hand-typed to-do list or quoted hashes drifting from the sessions.** Expected: a test fails. Pinned by `tests/series-sessions.test.mjs` (Task 2) and `tests/lesson-facts.test.mjs` 'Module 8 shows the to-do list…' (Task 5).

## File Structure

```
tutorial-sources/git/
  PLAN-modules-06-08.md          this plan
  README.md                      plans line, @as note, fixed sandboxes, readable graph labels           (Task 1)
  tools/session.mjs              progress lines, lazy person switches, readable graph labels           (Task 1)
  build.mjs                      claimSandbox: fixed sandbox folder per session                        (Task 1)
  tests/session.test.mjs, tests/build.test.mjs                                                         (Task 1)
  GLOSSARY.md                    terms for remotes, pull requests, rewriting history                   (Task 2)
  plan/module_06.json, module_07.json, module_08.json                                                  (Task 2)
  sessions/module_06 (6), module_07 (8), module_08 (7)                                                 (Task 2)
  figures/{en,zh}/fig-06-01.svg, fig-07-01.svg, fig-07-02.svg, fig-08-01.svg                           (Task 2)
  tests/series-sessions.test.mjs                                                                       (Task 2)
  src/{en,zh}/module_06.md, module_07.md, module_08.md; tests/lesson-facts.test.mjs                    (Tasks 3–5)
docs/tutorials/git/              generated                                                             (Tasks 3–5)
docs/tutorials/index.md          the Git card says Modules 1 to 8                                      (Task 6)
```

Test command used throughout:

```
node --test --test-concurrency=1 "tutorial-sources/git/tests/*.test.mjs"
```

---

### Task 1: Session runner fixes for remotes and rebasing

**Files:**
- Modify: `tutorial-sources/git/tools/session.mjs`, `tutorial-sources/git/build.mjs`, `tutorial-sources/git/README.md`
- Modify: `tutorial-sources/git/tests/session.test.mjs`, `tutorial-sources/git/tests/build.test.mjs`

**Interfaces:**
- Consumes: the current `runSession`, `runModuleSessions` and `sandboxPaths`.
- Produces:
  - **`runModuleSessions(dir, number, git)`** runs each session in the fixed folder `/tmp/wrwei-git-sessions/<id>` (on Windows, `<os.tmpdir()>/wrwei-git-sessions/<id>`), using `mkdir` as a lock. It waits up to 120 s while another run holds the folder, removes a folder older than ten minutes, and deletes the folder after the run.
  - **`runSession(...).record`** has an `{kind: 'as'}` entry only just before the first visible step of a different person.
  - **Graph commit `subject`s** use shown paths.
  - **Command outputs** keep, on each line, only the text after the last carriage return.

- [ ] **Step 1: Write the failing tests**

Replace `tutorial-sources/git/tests/session.test.mjs` and `tutorial-sources/git/tests/build.test.mjs` with these versions. Each adds tests at the end.

`tutorial-sources/git/tests/session.test.mjs`:

`````js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {parseSession, splitCommand, runSession, gitVersion, sandboxPaths} from '../tools/session.mjs';

const HEADER = 'title: T\ntitle-zh: 题\n---\n';
function run(body) {
  const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'git-test-'));
  try {
    return runSession(parseSession(HEADER + body, 't.session'), {sandbox});
  } finally {
    fs.rmSync(sandbox, {recursive: true, force: true});
  }
}
const commands = result => result.record.filter(r => r.kind === 'command');

test('a session script parses into steps', () => {
  const session = parseSession(HEADER + '# a comment\n$ git init\n$! git switch nowhere\n> mkdir hidden\n@as sam\n+file notes.txt\nline one\n\nline three\n+end\n+hidden empty.txt\n+end\n@graph after-init\n', 't.session');
  assert.deepEqual(session.title, {en: 'T', zh: '题'});
  assert.equal(session.role, 'example');
  assert.deepEqual(session.steps.map(s => [s.kind, s.shown, s.expectFail]), [
    ['run', true, false], ['run', true, true], ['run', false, false], ['as', undefined, undefined],
    ['file', true, undefined], ['file', false, undefined], ['graph', undefined, undefined]]);
  assert.equal(session.steps[4].content, 'line one\n\nline three\n');
  assert.equal(session.steps[5].content, '');
});

test('the parser rejects what a session cannot run, naming the line', () => {
  const bad = (body, message) => assert.throws(() => parseSession(HEADER + body, 't.session'), message);
  bad('$ echo hi\n', /t\.session:4: "echo" is neither git nor a built-in/);
  bad('$ git log | head\n', /shell syntax "\|"/);
  bad('$ git add *.md\n', /shell syntax "\*"/);
  bad('+file a.txt\nno end\n', /has no closing "\+end"/);
  bad('@as bob\n', /unknown person "bob"/);
  bad('what is this\n', /cannot read/);
  assert.throws(() => parseSession('title: only English\n---\n', 'x.session'), /needs "title:" and "title-zh:"/);
});

test('commands split like a shell, with quotes', () => {
  assert.deepEqual(splitCommand(`git commit -m "Add a README" --author='A B'`, 'w'), ['git', 'commit', '-m', 'Add a README', '--author=A B']);
  assert.deepEqual(splitCommand('git commit -m ""', 'w'), ['git', 'commit', '-m', '']);
  assert.throws(() => splitCommand('git commit -m "Cost $5"', 'w'), /inside double quotes/);
});

test('sessions are deterministic: the same script gives the same hashes and output', () => {
  const body = '$ git init recipes\n$ cd recipes\n+file README.md\n# Recipes\n+end\n$ git add README.md\n$ git commit -m "Add a README"\n$ git log\n';
  const first = run(body);
  assert.deepEqual(first.problems, []);
  assert.deepEqual(run(body), first);
  const [init, , , commit, log] = commands(first);
  assert.equal(init.output, 'Initialized empty Git repository in /home/alex/recipes/.git/\n');
  assert.equal(commit.output, '[main (root-commit) 186280d] Add a README\n 1 file changed, 1 insertion(+)\n create mode 100644 README.md\n');
  assert.match(log.output, /^commit 186280d\w{33}\nAuthor: Alex Smith <alex@example\.com>\nDate:   Mon Jan 5 09:04:00 2026 \+0000\n\n    Add a README\n$/);
});

test('a command that behaves differently from its declaration is reported', () => {
  const failed = run('$ git switch nowhere\n');
  assert.equal(failed.problems.length, 1);
  assert.match(failed.problems[0], /t\.session:4: "git switch nowhere" failed with exit code 128, but is declared to succeed/);
  assert.match(run('$! git --version\n').problems[0], /succeeded, but is declared to fail/);
  const expected = run('$! git switch nowhere\n');
  assert.deepEqual(expected.problems, []);
  assert.equal(commands(expected)[0].ok, false);
});

test('built-ins behave the same on every operating system', () => {
  const result = run('$ pwd\n$ mkdir notes\n$ ls\n$ cd notes\n$ pwd\n+file todo.txt\nbuy flour\n+end\n$ cat todo.txt\n$ ls -a\n$ cd ..\n$ ls notes\n$! cd nowhere\n$! cat missing.txt\n');
  assert.deepEqual(result.problems, []);
  assert.deepEqual(commands(result).map(c => c.output), [
    '/home/alex\n', '', 'notes\n', '', '/home/alex/notes\n', 'buy flour\n', '.  ..  todo.txt\n', '', 'todo.txt\n',
    'cd: no such directory: nowhere\n', 'cat: missing.txt: No such file or directory\n']);
});

test('two people share a server repository, and paths stay readable', () => {
  const result = run([
    '$ git init shop', '$ cd shop', '+file a.txt', 'a', '+end', '$ git add a.txt', '$ git commit -m "Start"',
    '> git init --bare /srv/git/shop.git', '$ git remote add origin /srv/git/shop.git', '$ git push -u origin main',
    '@as sam', '$ git clone /srv/git/shop.git', '$ cd shop', '$ git log --format="%an %s"', '@graph cloned', ''].join('\n'));
  assert.deepEqual(result.problems, []);
  const outputs = commands(result).map(c => c.output);
  assert.match(outputs[5], /^To \/srv\/git\/shop\.git\n \* \[new branch\]      main -> main\n/);
  assert.equal(outputs[6], "Cloning into 'shop'...\ndone.\n");
  assert.equal(outputs[8], 'Alex Smith Start\n');
  assert.deepEqual(result.record.filter(r => r.kind === 'as'), [{kind: 'as', persona: 'sam'}]);
  const graph = result.graphs.cloned;
  assert.equal(graph.commits.length, 1);
  assert.equal(graph.commits[0].subject, 'Start');
  assert.equal(graph.commits[0].refs, 'HEAD -> refs/heads/main, refs/remotes/origin/main, refs/remotes/origin/HEAD');
  assert.match(graph.text, /^\* \w{7} \(HEAD -> main, origin\/main, origin\/HEAD\) Start\n$/);
});

test('a graph of an empty repository is reported as a problem', () => {
  assert.match(run('$ git init empty\n$ cd empty\n@graph nothing\n').problems[0], /no commits to draw/);
});

test('gitVersion reads the version line', () => {
  assert.match(gitVersion(), /^git version \d+\.\d+\.\d+/);
});

test('no configuration from the builder machine reaches a session', () => {
  const result = run('$ git config --global user.name "Alex Smith"\n$ git config --list --show-origin\n');
  const output = commands(result)[1].output;
  assert.doesNotMatch(output, /\/Library\/|osxkeychain|credential\./, 'no system or vendor configuration');
  assert.match(output, /^file:\/home\/alex\/\.gitconfig\tuser\.name=Alex Smith$/m, 'the global file is in the shown home folder');
});

test('the sandbox looks like a small file system: /home and /srv, and nothing else', () => {
  const result = run('$ cd ..\n$ pwd\n$ ls\n$ cd ..\n$ pwd\n$ ls\n$ cd ..\n$ pwd\n$ cd /home/alex\n$ git config --global user.name "Alex Smith"\n$ ls -a\n$ cat /home/alex/.gitconfig\n');
  assert.deepEqual(result.problems, []);
  assert.deepEqual(commands(result).map(c => c.output), [
    '', '/home\n', 'alex  sam\n', '', '/\n', 'home  srv\n', '', '/\n', '', '', '.  ..  .gitconfig\n', '[user]\n\tname = Alex Smith\n']);
});

test('output that would show a path outside the sandbox is reported', () => {
  const paths = sandboxPaths('/tmp/run/root', '/tmp/run/internal');
  assert.equal(paths.toShown('/tmp/run/root/home/alex/x'), '/home/alex/x');
  assert.equal(paths.toShown('/tmp/run/root'), '/');
  assert.deepEqual(paths.leaks('fatal: see /tmp/run/internal/output.txt'), ['/tmp/run/internal']);
  assert.deepEqual(paths.leaks('cd into /tmp/run'), ['/tmp/run']);
  assert.deepEqual(paths.leaks('/home/alex is fine'), []);
});

test('on Windows, shown paths use forward slashes and Git gets forward-slash paths', () => {
  const paths = sandboxPaths('C:\\Users\\me\\AppData\\Local\\Temp\\run\\root', 'C:\\Users\\me\\AppData\\Local\\Temp\\run\\internal', path.win32);
  assert.equal(paths.toShown('C:\\Users\\me\\AppData\\Local\\Temp\\run\\root\\home\\alex\\projects'), '/home/alex/projects');
  assert.equal(paths.toShown('Initialized empty Git repository in C:/Users/me/AppData/Local/Temp/run/root/home/alex/recipes/.git/'), 'Initialized empty Git repository in /home/alex/recipes/.git/');
  assert.equal(paths.forGit('/srv/git/recipes.git'), 'C:/Users/me/AppData/Local/Temp/run/root/srv/git/recipes.git');
});

test('built-ins accept only the forms they implement', () => {
  const bad = (line, message) => assert.throws(() => parseSession(HEADER + line + '\n', 't.session'), message);
  bad('$ ls -la', /ls: only "ls", "ls -a" and one folder are supported/);
  bad('$ ls -l', /ls: only/);
  bad('$ mkdir -p a/b', /mkdir: options are not supported/);
  bad('$ pwd -P', /pwd takes no arguments/);
  bad('$ cd a b', /cd takes at most one folder/);
  bad('$ cat', /cat needs at least one file/);
});

test('the parser rejects words a shell would change', () => {
  const bad = (line, message) => assert.throws(() => parseSession(HEADER + line + '\n', 't.session'), message);
  bad('$ git log --format=[%h]', /shell syntax "\["/);
  bad('$ git commit -m #wip', /a word starting with "#" is a comment in a shell/);
  bad('$ cat ~/.gitconfig', /"~" is expanded by a shell; write \/home\/alex instead/);
  assert.doesNotThrow(() => parseSession(HEADER + "$ git log --format='[%h]'\n$ cd ~\n", 't.session'));
});

test('a built-in that fails reports a failure instead of crashing', () => {
  const result = run('$! mkdir a/b\n$ mkdir a\n$ mkdir a/b\n$ ls a\n');
  assert.deepEqual(result.problems, []);
  assert.deepEqual(commands(result).map(c => c.output), ['mkdir: a/b: No such file or directory\n', '', '', 'b\n']);
});

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

test('progress lines that a terminal would overwrite show only their final state', () => {
  const result = run([
    '$ git init shop', '$ cd shop', '+file a.txt', 'a', '+end', '$ git add a.txt', '$ git commit -m "Start"',
    '$ git switch -c topic', '+file b.txt', 'b', '+end', '$ git add b.txt', '$ git commit -m "Add b"',
    '+file c.txt', 'c', '+end', '$ git add c.txt', '$ git commit -m "Add c"',
    '$ git switch main', '+file d.txt', 'd', '+end', '$ git add d.txt', '$ git commit -m "Add d"',
    '$ git switch topic', '$ git rebase main', ''].join('\n'));
  assert.deepEqual(result.problems, []);
  assert.equal(commands(result).at(-1).output, 'Successfully rebased and updated refs/heads/topic.\n');
});

test('a change of person is shown only when the next visible step is someone else\'s', () => {
  const result = run([
    '> git init --bare /srv/git/shop.git', '@as sam', '> git clone /srv/git/shop.git', '@as alex',
    '$ git clone /srv/git/shop.git', '@as sam', '> cd shop', '@as alex', '$ cd shop',
    '@as sam', '$ pwd', '@as alex', ''].join('\n'));
  assert.deepEqual(result.problems, []);
  assert.deepEqual(result.record.map(r => r.kind === 'as' ? `as ${r.persona}` : r.line), [
    'git clone /srv/git/shop.git', 'cd shop', 'as sam', 'pwd']);
});

test('graph labels show readable paths, as the transcripts do', () => {
  const result = run([
    '> git init --bare /srv/git/shop.git', '$ git clone /srv/git/shop.git', '$ cd shop', '+file a.txt', 'a', '+end', '$ git add a.txt',
    '$ git commit -m "Start"', '$ git push', '@as sam', '> git clone /srv/git/shop.git', '> cd shop', '+file b.txt', 'b', '+end',
    '> git add b.txt', '> git commit -m "Add b"', '> git push', '@as alex', '+file c.txt', 'c', '+end', '$ git add c.txt',
    '$ git commit -m "Add c"', '$ git pull --no-rebase', '@graph merged', ''].join('\n'));
  assert.deepEqual(result.problems, []);
  assert.equal(result.graphs.merged.commits[0].subject, "Merge branch 'main' of /srv/git/shop");
});
`````

`tutorial-sources/git/tests/build.test.mjs`:

`````js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {build, runModuleSessions} from '../build.mjs';
import {gitVersion} from '../tools/session.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const VERSION = gitVersion();

function copyFixture() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'git-build-'));
  const root = path.join(tmp, 'src');
  fs.cpSync(path.join(HERE, 'fixtures', 'series'), root, {recursive: true});
  return {root, dest: path.join(tmp, 'site')};
}

test('build runs the sessions and writes both editions and the overview', () => {
  const {root, dest} = copyFixture();
  assert.deepEqual(build({root, dest, expectVersion: VERSION}), {published: [1], sessions: 2, version: VERSION});
  const en = fs.readFileSync(path.join(dest, 'module_01_EN.html'), 'utf8');
  assert.match(en, /\[main \(root-commit\) \w{7}\] Say hello/);
  assert.match(en, /Initialized empty Git repository in \/home\/alex\/hello\/\.git\//);
  assert.equal((en.match(/<figure class="graph">/g) || []).length, 2, 'the inline snapshot and the {{GRAPH}} marker');
  assert.match(en, /<text>Three areas<\/text>/);
  assert.match(fs.readFileSync(path.join(dest, 'module_01_ZH.html'), 'utf8'), /<text>三个区域<\/text>/);
  const overview = fs.readFileSync(path.join(dest, 'index.html'), 'utf8');
  assert.equal((overview.match(/class="module-card/g) || []).length, 2);
  assert(fs.existsSync(path.join(dest, 'assets', 'style.css')));
});

test('build stops when this machine runs a different Git from the published output', () => {
  const {root, dest} = copyFixture();
  assert.throws(() => build({root, dest, expectVersion: 'git version 0.0.0'}), /This machine has "git version .*", but the published output came from "git version 0\.0\.0"/);
});

test('build rejects a Chinese edition whose structure differs', () => {
  const {root, dest} = copyFixture();
  const zh = path.join(root, 'src', 'zh', 'module_01.md');
  fs.writeFileSync(zh, fs.readFileSync(zh, 'utf8').replace('{{GRAPH:m01-hello@first}}\n', ''));
  assert.throws(() => build({root, dest, expectVersion: VERSION}), /Chinese edition's graphs differ/);
});

test('build rejects a session that does not behave as declared', () => {
  const {root, dest} = copyFixture();
  fs.appendFileSync(path.join(root, 'sessions', 'module_01', 'm01-hello.session'), '$ git switch nowhere\n');
  assert.throws(() => build({root, dest, expectVersion: VERSION}), /Sessions did not behave as declared:\nm01-hello\.session:\d+: "git switch nowhere" failed/);
});

test('a pull that merges gives the same commit on every run, although its message names the server', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'git-module-'));
  try {
    fs.writeFileSync(path.join(dir, 'm09-pull.session'), [
      'title: T', 'title-zh: 题', '---', '> git init --bare /srv/git/shop.git', '> git clone /srv/git/shop.git', '> cd shop',
      '+hidden a.txt', 'a', '+end', '> git add a.txt', '> git commit -m "Start"', '> git push', '@as sam', '> git clone /srv/git/shop.git',
      '> cd shop', '+hidden b.txt', 'b', '+end', '> git add b.txt', '> git commit -m "Add b"', '> git push', '@as alex',
      '+hidden c.txt', 'c', '+end', '> git add c.txt', '> git commit -m "Add c"', '$ git pull --no-rebase', '@graph merged', ''].join('\n'));
    const merge = () => runModuleSessions(dir, 9).get('m09-pull').graphs.merged.commits[0];
    const first = merge();
    assert.equal(first.subject, "Merge branch 'main' of /srv/git/shop");
    assert.equal(merge().hash, first.hash);
  } finally {
    fs.rmSync(dir, {recursive: true, force: true});
  }
});

test('a sandbox folder left behind by a run that crashed does not block the next run', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'git-module-'));
  const left = process.platform === 'win32' ? path.join(os.tmpdir(), 'wrwei-git-sessions', 'm09-left') : '/tmp/wrwei-git-sessions/m09-left';
  try {
    fs.writeFileSync(path.join(dir, 'm09-left.session'), 'title: T\ntitle-zh: 题\n---\n$ pwd\n');
    fs.mkdirSync(path.join(left, 'root'), {recursive: true});
    const hourAgo = new Date(Date.now() - 3600000);
    fs.utimesSync(left, hourAgo, hourAgo);
    assert.equal(runModuleSessions(dir, 9).get('m09-left').record[0].output, '/home/alex\n');
    assert(!fs.existsSync(left), 'the run removes its sandbox afterwards');
  } finally {
    fs.rmSync(dir, {recursive: true, force: true});
    fs.rmSync(left, {recursive: true, force: true});
  }
});
`````


- [ ] **Step 2: Run the tests to see them fail**

Run: `node --test --test-concurrency=1 "tutorial-sources/git/tests/*.test.mjs"`
Expected: `# tests 52`, `# fail 5`. The failing tests are:
- 'progress lines that a terminal would overwrite…': the output is `Rebasing (1/2)\rRebasing (2/2)\rSuccessfully…`;
- 'a change of person is shown only when…': extra `as` records;
- 'graph labels show readable paths…': the subject names the real sandbox;
- 'a pull that merges gives the same commit on every run…': two different hashes;
- 'a sandbox folder left behind…': the folder is never removed.

- [ ] **Step 3: Implement the runner fixes**

Replace `tutorial-sources/git/tools/session.mjs` and `tutorial-sources/git/build.mjs` with these versions.

The changes are:
- in `session.mjs`, the `visible()` helper, carriage-return handling in `show()`, and `show()` applied to the graph log;
- in `build.mjs`, `SANDBOXES` and `claimSandbox`.

`tutorial-sources/git/tools/session.mjs`:

`````js
// Command sessions: a .session script is parsed into steps and run with real Git in a sandbox.
// Everything that could differ between machines or runs is fixed: identities, dates, configuration
// and paths, so the same script always produces the same output and commit hashes.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

export const PERSONAS = {
  alex: {name: 'Alex Smith', email: 'alex@example.com'},
  sam: {name: 'Sam Lee', email: 'sam@example.com'},
};
export const BUILTINS = ['pwd', 'ls', 'cd', 'mkdir', 'cat'];
const START = Date.UTC(2026, 0, 5, 9, 0, 0) / 1000; // Monday 5 January 2026, 09:00 UTC
const TICK = 60; // seconds between commands

/** Splits a command line like a shell, but rejects the shell features sessions do not support. */
export function splitCommand(line, where, allowTilde = false) {
  const words = [];
  let word = '';
  let started = false;
  let quote = null;
  for (const ch of line) {
    if (quote) {
      if (ch === quote) quote = null;
      else if (quote === '"' && '$`\\'.includes(ch)) throw new Error(`${where}: "${ch}" inside double quotes would be expanded by a shell; use single quotes`);
      else word += ch;
      continue;
    }
    if (ch === '"' || ch === "'") { quote = ch; started = true; continue; }
    if (/\s/.test(ch)) {
      if (started) { words.push(word); word = ''; started = false; }
      continue;
    }
    if (!started && ch === '#') throw new Error(`${where}: a word starting with "#" is a comment in a shell; quote it`);
    if (!started && ch === '~' && !allowTilde) throw new Error(`${where}: "~" is expanded by a shell; write /home/alex instead`);
    if ('|&;<>$`\\*?(){}[]'.includes(ch)) throw new Error(`${where}: shell syntax "${ch}" is not supported; a session runs one plain command per line`);
    word += ch;
    started = true;
  }
  if (quote) throw new Error(`${where}: a quote is not closed`);
  if (started) words.push(word);
  return words;
}

/** The forms of each built-in that the runner implements; anything else is rejected while parsing. */
function checkBuiltin([name, ...args], where) {
  const options = args.filter(a => a.startsWith('-'));
  const operands = args.filter(a => !a.startsWith('-'));
  const fail = message => { throw new Error(`${where}: ${message}`); };
  if (name === 'pwd' && args.length) fail('pwd takes no arguments');
  if (name === 'ls' && (options.some(o => o !== '-a') || options.length > 1 || operands.length > 1)) fail('ls: only "ls", "ls -a" and one folder are supported');
  if (name === 'cd' && (options.length || operands.length > 1)) fail('cd takes at most one folder');
  if (name === 'mkdir' && options.length) fail('mkdir: options are not supported');
  if (name === 'mkdir' && !operands.length) fail('mkdir needs a folder name');
  if (name === 'cat' && options.length) fail('cat: options are not supported');
  if (name === 'cat' && !operands.length) fail('cat needs at least one file');
}

/**
 * Parses a session script. The header holds "title:" and "title-zh:" (and optionally "role: solution")
 * and ends at "---". Then, one step per line:
 *   $ command      shown, must succeed          $! command   shown, must fail
 *   > command      hidden setup, must succeed   >! command   hidden setup, must fail
 *   @as sam        act as another person
 *   @graph label   snapshot of the commit graph
 *   +file path     shown file edit, contents until "+end";  +hidden path  the same, not shown
 * Blank lines and lines starting with "#" are ignored.
 */
export function parseSession(text, name = 'session') {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const meta = {};
  let i = 0;
  for (; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === '---') { i++; break; }
    if (!line.trim()) continue;
    const m = /^([a-z-]+):\s*(.*)$/.exec(line);
    if (!m) throw new Error(`${name}:${i + 1}: the header needs "key: value" lines ending with "---"`);
    meta[m[1]] = m[2].trim();
  }
  if (!meta.title || !meta['title-zh']) throw new Error(`${name}: the header needs "title:" and "title-zh:"`);
  if (meta.role && !['example', 'solution'].includes(meta.role)) throw new Error(`${name}: "role" must be "example" or "solution"`);
  const steps = [];
  for (; i < lines.length; i++) {
    const line = lines[i];
    const where = `${name}:${i + 1}`;
    if (!line.trim() || line.startsWith('#')) continue;
    let m;
    if ((m = /^(\$!|\$|>!|>)\s+(.+)$/.exec(line))) {
      const words = splitCommand(m[2], where, /^cd\s+~$/.test(m[2].trim()));
      if (words[0] !== 'git' && !BUILTINS.includes(words[0])) throw new Error(`${where}: "${words[0]}" is neither git nor a built-in (${BUILTINS.join(', ')})`);
      if (words[0] !== 'git') checkBuiltin(words, where);
      steps.push({kind: 'run', line: m[2].trim(), words, shown: m[1].startsWith('$'), expectFail: m[1].endsWith('!'), where});
    } else if ((m = /^\+(file|hidden)\s+(\S+)$/.exec(line))) {
      const content = [];
      for (i++; i < lines.length && lines[i] !== '+end'; i++) content.push(lines[i]);
      if (i >= lines.length) throw new Error(`${where}: "+${m[1]}" has no closing "+end"`);
      steps.push({kind: 'file', path: m[2], content: content.length ? content.join('\n') + '\n' : '', shown: m[1] === 'file', where});
    } else if ((m = /^@as\s+(\S+)$/.exec(line))) {
      if (!PERSONAS[m[1]]) throw new Error(`${where}: unknown person "${m[1]}" (${Object.keys(PERSONAS).join(', ')})`);
      steps.push({kind: 'as', persona: m[1], where});
    } else if ((m = /^@graph\s+([a-z0-9-]+)$/.exec(line))) {
      steps.push({kind: 'graph', label: m[1], where});
    } else {
      throw new Error(`${where}: cannot read "${line}"`);
    }
  }
  return {title: {en: meta.title, zh: meta['title-zh']}, role: meta.role ?? 'example', steps};
}

/** The first line of `git --version`, e.g. "git version 2.50.1 (Apple Git-155)". */
export function gitVersion(git = 'git') {
  const r = spawnSync(git, ['--version'], {encoding: 'utf8'});
  if (r.error || r.status !== 0) throw new Error(`Cannot run "${git} --version": ${r.error || r.stderr}`);
  return r.stdout.trim();
}

/**
 * Maps between the sandbox's real paths and the paths a lesson shows. `root` holds the shown file
 * system (/home/alex, /home/sam, /srv/git); `internal` holds the runner's own files and must never
 * appear in output. `pathApi` is node:path, or path.win32 in tests.
 */
export function sandboxPaths(root, internal, pathApi = path) {
  const forward = p => p.replace(/\\/g, '/');
  const roots = [...new Set([root, forward(root)])];
  const outside = [...new Set([internal, forward(internal), pathApi.dirname(root), forward(pathApi.dirname(root))])];
  const MARK = '\u0000';
  return {
    /** Rewrites sandbox paths in text as shown paths with forward slashes; the root itself is "/". */
    toShown(text) {
      let out = text;
      for (const r of roots) out = out.split(r).join(MARK);
      return out.replace(/\u0000([^\s'"]*)/g, (_, rest) => forward(rest) || '/');
    },
    /** The real path for a shown absolute path such as /srv/git/recipes.git. */
    toReal(shown) {
      return pathApi.join(root, ...shown.split('/').filter(Boolean));
    },
    /** The same, with forward slashes, which Git accepts on every system. */
    forGit(shown) {
      return forward(pathApi.join(root, ...shown.split('/').filter(Boolean)));
    },
    /** Paths outside the shown file system that appear in (already shown) text. */
    leaks(text) {
      const found = outside.find(p => text.includes(p));
      return found ? [found] : [];
    },
  };
}

const isShownPath = p => p === '/' || /^\/(home|srv)(\/|$)/.test(p);

/**
 * Runs a parsed session in `sandbox`, an empty directory. Returns
 *   record:   what the lesson shows, in order: {kind:'command', line, output, ok} | {kind:'file', path, content}
 *             | {kind:'as', persona} | {kind:'graph', label}. A change of person is recorded just before the
 *             next visible step of the new person, so hidden setup can act as anyone without showing it.
 *   graphs:   label -> {commits, text} for each @graph step
 *   problems: messages for every step that did not behave as declared (empty when all is well)
 */
export function runSession(session, {sandbox, git = 'git'}) {
  const base = fs.realpathSync.native(sandbox);
  const root = path.join(base, 'root');
  const internal = path.join(base, 'internal');
  const homes = {alex: path.join(root, 'home', 'alex'), sam: path.join(root, 'home', 'sam')};
  for (const dir of [...Object.values(homes), path.join(root, 'srv', 'git'), internal]) fs.mkdirSync(dir, {recursive: true});
  const paths = sandboxPaths(root, internal);
  const outputFile = path.join(internal, 'output.txt');
  const cwd = {...homes};
  let persona = 'alex';
  let clock = START;

  // Paths never leave the shown file system: going above / stays at /, as in a shell.
  const confine = p => (p === root || p.startsWith(root + path.sep) ? p : root);
  const toReal = p => confine(isShownPath(p) ? paths.toReal(p) : path.resolve(cwd[persona], p));
  const env = () => {
    const who = PERSONAS[persona];
    const date = `@${clock} +0000`;
    return {
      PATH: process.env.PATH, SYSTEMROOT: process.env.SYSTEMROOT ?? '',
      HOME: homes[persona], USERPROFILE: homes[persona], XDG_CONFIG_HOME: path.join(homes[persona], '.config'),
      // No system or vendor configuration (Apple's Git reads an extra file that GIT_CONFIG_SYSTEM cannot replace);
      // new repositories start on main, as if the learner had followed Module 1.
      GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_COUNT: '1', GIT_CONFIG_KEY_0: 'init.defaultBranch', GIT_CONFIG_VALUE_0: 'main',
      LANG: 'C', LC_ALL: 'C', TZ: 'UTC', GIT_PAGER: 'cat', PAGER: 'cat', GIT_EDITOR: 'true', GIT_TERMINAL_PROMPT: '0',
      GIT_AUTHOR_NAME: who.name, GIT_AUTHOR_EMAIL: who.email, GIT_AUTHOR_DATE: date,
      GIT_COMMITTER_NAME: who.name, GIT_COMMITTER_EMAIL: who.email, GIT_COMMITTER_DATE: date,
    };
  };
  const runGit = args => {
    // stdout and stderr share one file so that their lines stay in order
    const fd = fs.openSync(outputFile, 'w');
    try {
      const r = spawnSync(git, args, {cwd: cwd[persona], env: env(), stdio: ['ignore', fd, fd], timeout: 60000});
      if (r.error) throw r.error;
      return {status: r.status, output: fs.readFileSync(outputFile, 'utf8')};
    } finally {
      fs.closeSync(fd);
    }
  };
  const builtin = ([name, ...args]) => {
    const fail = message => ({status: 1, output: message + '\n'});
    const exists = p => fs.existsSync(p);
    switch (name) {
      case 'pwd': return {status: 0, output: paths.toShown(cwd[persona]) + '\n'};
      case 'cd': {
        const target = !args[0] || args[0] === '~' ? homes[persona] : toReal(args[0]);
        if (!exists(target) || !fs.statSync(target).isDirectory()) return fail(`cd: no such directory: ${args[0]}`);
        cwd[persona] = target;
        return {status: 0, output: ''};
      }
      case 'mkdir': {
        for (const arg of args) {
          const target = toReal(arg);
          if (exists(target)) return fail(`mkdir: ${arg}: File exists`);
          if (!exists(path.dirname(target))) return fail(`mkdir: ${arg}: No such file or directory`);
          fs.mkdirSync(target);
        }
        return {status: 0, output: ''};
      }
      case 'ls': {
        const all = args.includes('-a');
        const named = args.find(a => !a.startsWith('-'));
        const dir = toReal(named ?? '.');
        if (!exists(dir)) return fail(`ls: ${named}: No such file or directory`);
        const names = fs.readdirSync(dir).filter(n => all || !n.startsWith('.')).sort();
        const list = all ? ['.', '..', ...names] : names;
        return {status: 0, output: list.length ? list.join('  ') + '\n' : ''};
      }
      case 'cat': {
        let output = '';
        for (const arg of args) {
          const file = toReal(arg);
          if (!exists(file) || fs.statSync(file).isDirectory()) return fail(`cat: ${arg}: No such file or directory`);
          output += fs.readFileSync(file, 'utf8');
        }
        return {status: 0, output};
      }
    }
    throw new Error(`Unknown built-in ${name}`);
  };

  const record = [];
  let shownPersona = 'alex';
  const visible = item => {
    if (persona !== shownPersona) record.push({kind: 'as', persona: shownPersona = persona});
    record.push(item);
  };
  const graphs = {};
  const problems = [];
  const show = (text, where) => {
    // a terminal overwrites a line at each carriage return, so only the text after the last one stays visible
    const shown = paths.toShown(text.split('\n').map(line => line.replace(/\r$/, '').split('\r').at(-1)).join('\n'));
    for (const leak of paths.leaks(shown)) problems.push(`${where}: the output shows a path outside the sandbox (${leak})`);
    return shown;
  };
  for (const step of session.steps) {
    if (step.kind === 'as') { persona = step.persona; continue; }
    if (step.kind === 'file') {
      const target = toReal(step.path);
      fs.mkdirSync(path.dirname(target), {recursive: true});
      fs.writeFileSync(target, step.content);
      if (step.shown) visible({kind: 'file', path: step.path, content: step.content});
      continue;
    }
    if (step.kind === 'graph') {
      const log = runGit(['log', '--all', '--topo-order', '--decorate=full', '--format=%h%x09%H%x09%P%x09%D%x09%s']);
      const text = runGit(['log', '--all', '--graph', '--oneline', '--decorate']);
      if (log.status !== 0 || !log.output.trim()) { problems.push(`${step.where}: no commits to draw for "@graph ${step.label}"`); continue; }
      // subjects can name paths too, such as "Merge branch 'main' of /srv/git/recipes"
      const commits = show(log.output, step.where).trimEnd().split('\n').map(line => {
        const [short, hash, parents, refs, subject] = line.split('\t');
        return {short, hash, parents: parents ? parents.split(' ') : [], refs, subject};
      });
      graphs[step.label] = {commits, text: show(text.output, step.where)};
      visible({kind: 'graph', label: step.label});
      continue;
    }
    clock += TICK;
    let result;
    if (step.words[0] === 'git') {
      // arguments may name the paths a learner sees, such as /srv/git/recipes.git
      result = runGit(step.words.slice(1).map(a => (isShownPath(a) ? paths.forGit(a) : a)));
    } else {
      try {
        result = builtin(step.words);
      } catch (error) {
        result = {status: 1, output: `${step.words[0]}: ${error.message}\n`};
      }
    }
    const ok = result.status === 0;
    const output = show(result.output, step.where);
    if (ok === step.expectFail) {
      problems.push(`${step.where}: "${step.line}" ${ok ? 'succeeded, but is declared to fail ($!)' : `failed with exit code ${result.status}, but is declared to succeed`}\n${output}`);
    }
    if (step.shown) visible({kind: 'command', line: step.line, output, ok});
  }
  return {record, graphs, problems};
}
`````

`tutorial-sources/git/build.mjs`:

`````js
// Builds the Git and version control series into docs/tutorials/git. From the repository root:
//   node tutorial-sources/git/build.mjs
// Every command session runs with real Git during the build, and the pages show that output.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {parseSession, runSession, gitVersion} from './tools/session.mjs';
import {renderLesson, renderOverview, checkParity, checkContract, lessonFile, overviewFile, pad} from './tools/pages.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));

// Each session runs in a fixed folder rather than a random one: Git writes the server's path into some
// commits (git pull's merge messages), so a fixed path keeps those commits' hashes the same on every run.
const SANDBOXES = process.platform === 'win32' ? path.join(os.tmpdir(), 'wrwei-git-sessions') : '/tmp/wrwei-git-sessions';

/** Takes the sandbox folder of session `id`, waiting while another build or test run is using it. */
function claimSandbox(id) {
  const dir = path.join(SANDBOXES, id);
  fs.mkdirSync(SANDBOXES, {recursive: true});
  const deadline = Date.now() + 120000;
  for (;;) {
    try {
      fs.mkdirSync(dir);
      return dir;
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
    }
    // a folder left behind by a run that crashed is removed after ten minutes
    if (Date.now() - fs.statSync(dir).mtimeMs > 600000) { fs.rmSync(dir, {recursive: true, force: true}); continue; }
    assert(Date.now() < deadline, `${dir} is still in use by another build or test run`);
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 200);
  }
}

/** Parses and runs every sessions/module_NN/*.session. Returns Map(id -> session with its record and graphs). */
export function runModuleSessions(dir, number, git = 'git') {
  const sessions = new Map();
  if (!fs.existsSync(dir)) return sessions;
  const problems = [];
  for (const name of fs.readdirSync(dir).filter(n => n.endsWith('.session')).sort()) {
    const id = name.slice(0, -'.session'.length);
    assert(/^[a-z0-9-]+$/.test(id) && id.startsWith(`m${pad(number)}-`), `${name}: session file names look like m${pad(number)}-<words>.session`);
    const session = parseSession(fs.readFileSync(path.join(dir, name), 'utf8'), name);
    const sandbox = claimSandbox(id);
    try {
      const result = runSession(session, {sandbox, git});
      problems.push(...result.problems);
      sessions.set(id, {...session, ...result});
    } finally {
      fs.rmSync(sandbox, {recursive: true, force: true, maxRetries: 3});
    }
  }
  assert.equal(problems.length, 0, `Sessions did not behave as declared:\n${problems.join('\n')}`);
  return sessions;
}

export function build({root = HERE, dest = path.resolve(HERE, '../../docs/tutorials/git'), git = 'git', expectVersion} = {}) {
  const series = readJson(path.join(root, 'plan/series.json'));
  const version = gitVersion(git);
  const expected = expectVersion ?? series.gitVersion;
  assert.equal(version, expected, `This machine has "${version}", but the published output came from "${expected}". Use that version of Git, or set "gitVersion" in plan/series.json to "${version}" and review every changed output before publishing.`);
  // A module is published once both language sources exist.
  const modules = series.modules.filter(m => ['en', 'zh'].every(lang => fs.existsSync(path.join(root, 'src', lang, `module_${pad(m.number)}.md`))));
  const published = modules.map(m => m.number);
  fs.mkdirSync(dest, {recursive: true});
  fs.cpSync(path.join(root, 'assets'), path.join(dest, 'assets'), {recursive: true});
  let count = 0;
  for (const m of modules) {
    const metaFile = path.join(root, 'plan', `module_${pad(m.number)}.json`);
    assert(fs.existsSync(metaFile), `plan/module_${pad(m.number)}.json is missing`);
    const meta = readJson(metaFile);
    const sessions = runModuleSessions(path.join(root, 'sessions', `module_${pad(m.number)}`), m.number, git);
    count += sessions.size;
    const sources = Object.fromEntries(['en', 'zh'].map(lang => [lang, fs.readFileSync(path.join(root, 'src', lang, `module_${pad(m.number)}.md`), 'utf8')]));
    assert.notEqual(sources.zh, sources.en, `Module ${pad(m.number)}: the Chinese source is a copy of the English one`);
    const records = {};
    for (const lang of ['en', 'zh']) {
      const {html, record} = renderLesson({meta, lang, source: sources[lang], sessions, version, series, published, figDirs: [path.join(root, 'figures', lang)]});
      fs.writeFileSync(path.join(dest, lessonFile(m.number, lang)), html);
      records[lang] = record;
    }
    checkParity(records.en, records.zh, m.number);
    if (meta.contract) checkContract(records.en, meta.contract, sessions, m.number);
  }
  for (const lang of ['en', 'zh']) fs.writeFileSync(path.join(dest, overviewFile(lang)), renderOverview({series, published, lang}));
  return {published, sessions: count, version};
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const {published, sessions, version} = build();
  console.log(`Built modules ${published.map(pad).join(', ') || '(none)'} in English and Chinese; ran ${sessions} sessions with ${version}.`);
}
`````


- [ ] **Step 4: Run the tests to see them pass**

Run: `node --test --test-concurrency=1 "tutorial-sources/git/tests/*.test.mjs"`
Expected: `# tests 52`, `# pass 52`, `# fail 0`.

- [ ] **Step 5: Check that the published Modules 1–5 are unchanged**

```bash
node tutorial-sources/git/build.mjs
git status --short docs/tutorials/git
```

Expected:
- the build prints `Built modules 01, 02, 03, 04, 05 … ran 29 sessions …`;
- `git status` prints nothing: none of Modules 1–5's commits contains a path, and none of their outputs contains a carriage return.

- [ ] **Step 6: Update the README**

Replace `tutorial-sources/git/README.md` with:

`tutorial-sources/git/README.md`:

`````markdown
# Git and version control: sources

Published pages are built into `docs/tutorials/git/`. Edit these sources, never the generated HTML.
`SPEC.md` is the design, `PLAN.md` the implementation plan for the shared tooling and Modules 1–2,
`PLAN-modules-03-05.md` and `PLAN-modules-06-08.md` the plans for Modules 3–5 and 6–8, and `GLOSSARY.md`
the English–Chinese terminology.

## Requirements

- Git: exactly the version named in `plan/series.json` ("gitVersion"), because every output on the
  pages comes from it. That is currently Apple's Git on macOS, so build the pages on a Mac; on any
  other version the build stops (see "Changing the Git version").
- Node 22.2 or later, with the AI tools' packages installed: `npm ci --prefix tutorial-sources/ai/tools`.
- Chrome or Edge for the browser checks, or set `GIT_SERIES_BROWSER_PATH` to another Chromium-based browser.
- Python with the repository's `requirements.txt` for the MkDocs build.

## Build and check

From the repository root:

```
node --test --test-concurrency=1 "tutorial-sources/git/tests/*.test.mjs"
node tutorial-sources/git/build.mjs
node tutorial-sources/git/validate.mjs
python -m mkdocs build --strict
```

Rebuilding must not change any file under `docs/tutorials/git`: `git status --short docs/tutorials/git`
should print nothing after a second build.

## How a module is put together

- `plan/series.json`: the Git version, all ten modules and the overview page text.
- `plan/module_NN.json`: outcomes, study sessions and the module's contract (how many teaching
  sessions, exercises and quiz questions it has, and which sections it must contain).
- `src/en/module_NN.md` and `src/zh/module_NN.md`: the lesson, in the AI series' Markdown dialect.
  A module is published once both exist. `{{SESSION:id}}` on a line of its own shows a session;
  `{{GRAPH:id@label}}` shows one of its graph snapshots on its own.
- `sessions/module_NN/mNN-<words>.session`: the command sessions. The format:

  ```
  title: Your first commit
  title-zh: 你的第一次提交
  role: solution            (optional; solutions do not count towards the contract)
  ---
  $ git status              shown command that must succeed
  $! git switch nowhere     shown command that must fail
  > git init                hidden setup command
  >! git merge topic        hidden setup command that must fail (to prepare a conflict, say)
  +file README.md           shown file edit; the contents follow, ending with +end
  # Recipes
  +end
  +hidden notes.txt         hidden file edit, ending with +end
  +end
  @as sam                   act as Sam Lee (alex is the default; each has a folder). The page shows
                            the change of person only before that person's next visible step
  @graph after-merge        draw the commit graph here
  ```

  Commands are `git` or one of the built-ins in the forms the runner implements: `pwd`,
  `ls [-a] [folder]`, `cd [folder]` (also `cd ~` and `cd ..`), `mkdir folder…` and `cat file…`.
  Arguments are plain: no pipes, redirection, wildcards, brackets, variables, `~` or words starting
  with `#`, so that learners can type them in any shell. Paths such as `/home/alex`, `/home/sam` and `/srv/git` (a stand-in server) are what the
  lesson shows; the build maps them to a temporary sandbox.
- `figures/en/fig-NN-MM.svg` and `figures/zh/fig-NN-MM.svg`: hand-drawn diagrams, one per language.

## What the build guarantees

- Every session runs in a fresh sandbox with fixed names, dates, configuration and paths, so its
  output and commit hashes are the same on every build. The sandbox is always the same folder,
  `/tmp/wrwei-git-sessions/<session id>`, created for each run and removed afterwards, because `git pull`
  writes the server's real path into merge messages, and so into commit hashes. A second build or
  test run waits until the first has finished with a session. The sandbox looks like a
  small file system (`/home/alex`, `/home/sam`, `/srv/git`); each person's home folder is their
  `HOME`, and no system or vendor configuration is read. New repositories start on `main` through a
  command-line setting, which `git config --show-origin` would list as "command line", so avoid
  `--show-origin` and `--show-scope` in sessions.
- The build stops if any output shows a path outside the sandbox. Paths in outputs and in graph
  labels appear as the shown paths, and progress lines that a terminal would overwrite appear only
  in their final form.
- The build stops if a command fails or succeeds against its declaration, if the English and
  Chinese editions differ in sections, sessions, graphs, figures, exercises or quiz answers, if a
  lesson still contains a `<!-- BRIEF` note, if the Chinese source is a copy of the English one, or
  if a module breaks its contract.

## Things the tools do not catch

- Learners use other versions of Git and other shells. Lessons explain what messages mean rather
  than relying on exact wording, and point out where PowerShell behaves differently.
- GitHub's web pages change. Describe GitHub steps in words and link to GitHub Docs for details;
  avoid screenshots.
- Git prints messages in Chinese on computers set to Chinese. The Chinese edition says so where
  learners first meet Git's output.

## Changing the Git version

On a machine with a different Git, the build stops and names both versions. To move the series to
that version, set "gitVersion" in `plan/series.json` to the new version line, rebuild, and review
every changed output in `git diff docs/tutorials/git` before committing: messages and hints can
change between versions, and the lesson text must still match them.

## Publishing

Publishing means pushing to `main`, which triggers the GitHub Pages deployment. Do it only when the
site owner asks.
`````


- [ ] **Step 7: Commit**

```bash
git add tutorial-sources/git/tools/session.mjs tutorial-sources/git/build.mjs tutorial-sources/git/README.md tutorial-sources/git/tests/session.test.mjs tutorial-sources/git/tests/build.test.mjs
git commit -m "Git series: fixed sandboxes keep pull merges deterministic; readable graph labels, progress lines and person switches" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Modules 6–8 configuration, sessions, figures and glossary

**Files:**
- Create: `plan/module_06.json`, `plan/module_07.json`, `plan/module_08.json`
- Create: `sessions/module_06/` (6), `sessions/module_07/` (8), `sessions/module_08/` (7)
- Create: `figures/en/` and `figures/zh/`: `fig-06-01.svg`, `fig-07-01.svg`, `fig-07-02.svg`, `fig-08-01.svg`
- Modify: `GLOSSARY.md`, `tests/series-sessions.test.mjs`

(All paths are under `tutorial-sources/git/`.)

**Interfaces:**
- Consumes: Task 1's runner.
- Produces the session ids, graph labels and figures that the lessons use:
  - **Module 6:**
    - teaching: `m06-first-push` (graph `pushed`), `m06-clone` (`cloned`), `m06-fetch-pull` (`fetched`), `m06-rejected` (`shared`);
    - solutions: `m06-e2-solution`, `m06-e4-solution`;
    - figure: `fig-06-01`.
  - **Module 7:**
    - teaching: `m07-feature-branch`, `m07-review`, `m07-address-review`, `m07-after-merge` (`merged`), `m07-update-branch` (`behind`, `updated`), `m07-fork`;
    - solutions: `m07-e3-solution`, `m07-e5-solution`;
    - figures: `fig-07-01`, `fig-07-02`;
    - sections `s1`–`s7`.
  - **Module 8:**
    - teaching: `m08-stash`, `m08-reset`, `m08-rebase` (`before`, `after`), `m08-squash`, `m08-reflog`;
    - solutions: `m08-e2-solution`, `m08-e5-solution`;
    - figure: `fig-08-01`.
- Glossary changes:
  - new terms: 远程跟踪分支, 裸仓库, 分叉, 功能分支, 审查 (reviewing a pull request), 交互式变基, 待办列表, 重置, 强制推送;
  - stash becomes 贮藏, as in Pro Git's Chinese edition.

- [ ] **Step 1: Write the failing test**

Replace `tutorial-sources/git/tests/series-sessions.test.mjs` with this version. It adds tests that pin Modules 6–8's outputs, including every hash the lessons quote.

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

test('the hashes quoted in the prose of Modules 3 and 4 are the ones the sessions make', () => {
  assert.match(outputs('m03-revert')[1], /^\[main 654de4f\] Use more flour\n/);
  assert.equal(outputs('m03-revert')[3], '4407f3a Revert "Use more flour"\n654de4f Use more flour\n1ad5842 Say what the notes are for\n');
  assert.deepEqual(sessions().get('m04-branches').graphs['two-labels'].commits.map(c => c.short), ['288d56b', '02804ba']);
  assert.match(outputs('m04-branches')[5], /^\[desserts ccf2a69\] Add a lemon cake recipe\n/);
  assert.deepEqual(sessions().get('m04-three-way').graphs.merged.commits.map(c => [c.short, c.parents.map(p => p.slice(0, 7))]), [
    ['e59bfd4', ['5049848', '689ed1b']], ['689ed1b', ['288d56b']], ['5049848', ['288d56b']], ['288d56b', ['02804ba']], ['02804ba', []]]);
  assert.equal(outputs('m04-switch-c')[3], '* breakfast 5ad8c30 Add a porridge recipe\n  main      288d56b Add a pancake recipe\n');
  assert.equal(outputs('m04-fast-forward')[1], 'Deleted branch desserts (was 4d632df).\n');
});

const people = id => sessions().get(id).record.filter(r => r.kind === 'as').map(r => r.persona);

test('Module 6 sessions print what the lesson describes', () => {
  const push = outputs('m06-first-push');
  assert.equal(push[0], 'Initialized empty Git repository in /srv/git/recipes.git/\n');
  assert.equal(push[2], 'origin\t/srv/git/recipes.git (fetch)\norigin\t/srv/git/recipes.git (push)\n');
  assert.equal(push[3], "To /srv/git/recipes.git\n * [new branch]      main -> main\nbranch 'main' set up to track 'origin/main'.\n");
  assert.match(push[4], /Your branch is up to date with 'origin\/main'\./);
  assert.deepEqual(people('m06-first-push'), []);
  const clone = outputs('m06-clone');
  assert.equal(clone[0], "Cloning into 'recipes'...\ndone.\n");
  assert.equal(clone[5], '* main\n  remotes/origin/HEAD -> origin/main\n  remotes/origin/main\n');
  assert.deepEqual(people('m06-clone'), ['sam']);
  const fetch = outputs('m06-fetch-pull');
  assert.match(fetch[2], /^To \/srv\/git\/recipes\.git\n   8bf3c2d\.\.d5392e7  main -> main\n$/);
  assert.match(fetch[3], /Your branch is up to date with 'origin\/main'\./, 'before fetching, Sam\'s clone does not know about the new commit');
  assert.match(fetch[5], /Your branch is behind 'origin\/main' by 1 commit, and can be fast-forwarded\./);
  assert.equal(fetch[6], 'd5392e7 Add a lemon cake recipe\n');
  assert.deepEqual(people('m06-fetch-pull'), ['sam']);
  const rejected = sessions().get('m06-rejected').record.filter(r => r.kind === 'command');
  assert.equal(rejected[2].ok, false);
  assert.match(rejected[2].output, / ! \[rejected\]        main -> main \(fetch first\)/);
  assert.equal(rejected[3].ok, false);
  assert.match(rejected[3].output, /fatal: Need to specify how to reconcile divergent branches\.\n$/);
  assert.match(rejected[5].output, /^Merge made by the 'ort' strategy\./);
  assert.equal(sessions().get('m06-rejected').graphs.shared.commits[0].subject, "Merge branch 'main' of /srv/git/recipes");
  assert.match(outputs('m06-e4-solution').at(-1), /\* soups 995e901 \[origin\/soups\] Add a tomato soup recipe/);
});

test('Module 7 sessions print what the lesson describes', () => {
  assert.match(outputs('m07-feature-branch')[3], /branch 'add-soups' set up to track 'origin\/add-soups'\./);
  const review = outputs('m07-review');
  assert.equal(review[1], "Switched to a new branch 'add-soups'\nbranch 'add-soups' set up to track 'origin/add-soups'.\n");
  assert.equal(review[2], '22abb2e Add a tomato soup recipe\n');
  assert.match(review[3], /^diff --git a\/soup\.md b\/soup\.md\nnew file mode 100644\n/);
  assert.equal(outputs('m07-address-review').at(-1), 'b9835b7 List the soup ingredients\n22abb2e Add a tomato soup recipe\n');
  const tidy = sessions().get('m07-after-merge');
  assert.deepEqual(people('m07-after-merge'), []);
  assert.equal(tidy.graphs.merged.commits[0].subject, "Merge branch 'add-soups'");
  assert.equal(outputs('m07-after-merge')[3], 'From /srv/git/recipes\n - [deleted]         (none)     -> origin/add-soups\n');
  const update = sessions().get('m07-update-branch');
  assert.match(outputs('m07-update-branch')[1], /Your branch is up to date with 'origin\/add-breads'\./);
  assert.equal(update.graphs.updated.commits[0].subject, "Merge remote-tracking branch 'origin/main' into add-breads");
  const fork = outputs('m07-fork');
  assert.match(fork[3], /upstream\t\/srv\/git\/recipes\.git \(fetch\)/);
  assert.deepEqual(people('m07-fork'), ['sam', 'alex', 'sam']);
});

test('Module 8 sessions print what the lesson describes', () => {
  assert.match(outputs('m08-stash')[0], /^Saved working directory and index state WIP on main: 8bf3c2d Add a pancake recipe\n$/);
  assert.match(outputs('m08-stash').at(-1), /\+- a pinch of\n$/);
  const reset = outputs('m08-reset');
  assert.match(reset[2], /Changes to be committed:/);
  assert.match(reset[5], /Changes not staged for commit:/);
  assert.equal(reset[6], '8bf3c2d Add a pancake recipe\n907a979 Add a README\n');
  const rebase = sessions().get('m08-rebase');
  assert.equal(rebase.graphs.before.commits.length, 4);
  assert.deepEqual(rebase.graphs.after.commits.map(c => c.parents.length), [1, 1, 1, 1, 0]);
  assert.match(outputs('m08-rebase')[0], /^Successfully rebased and updated refs\/heads\/soups\.\n$/);
  assert.match(outputs('m08-rebase')[1], /! \[rejected\]        soups -> soups \(non-fast-forward\)/);
  assert.match(outputs('m08-rebase')[2], /\+ 968c34b\.\.\.a11c867 soups -> soups \(forced update\)/);
  const squash = outputs('m08-squash');
  assert.equal(squash[0], '49f29eb Add a soda bread recipe\nbc5616c Add a tomato soup recipe\n8bf3c2d Add a pancake recipe\n907a979 Add a README\n', 'the to-do list in the lesson names these hashes');
  assert.match(squash[2], /^\[soups 2b52993\] fixup! Add a tomato soup recipe\n/);
  assert.equal(squash.at(-1), '4af79ad Add a soda bread recipe\n86756a5 Add a tomato soup recipe\n8bf3c2d Add a pancake recipe\n907a979 Add a README\n');
  const reflog = outputs('m08-reflog');
  assert.equal(reflog[3], '8bf3c2d HEAD@{0}: reset: moving to HEAD~2\nab03771 HEAD@{1}: commit: Add a tomato soup recipe\n98b66a3 HEAD@{2}: commit: Add a lemon cake recipe\n8bf3c2d HEAD@{3}: commit: Add a pancake recipe\n907a979 HEAD@{4}: commit (initial): Add a README\n');
  assert.equal(reflog.at(-1), reflog[0], 'the reset restores the history exactly');
});

test('the prose of Modules 6 to 8 quotes what the sessions print', () => {
  assert.match(outputs('m06-rejected')[3], /^From \/srv\/git\/recipes\n   8bf3c2d\.\.d5392e7  main       -> origin\/main\n/);
  assert.match(outputs('m07-feature-branch')[4], /\n  main      8bf3c2d \[origin\/main\] Add a pancake recipe\n$/);
  assert.match(outputs('m07-address-review')[2], /   22abb2e\.\.b9835b7  add-soups -> add-soups\n$/);
  assert.equal(outputs('m07-e5-solution')[4], '', 'git diff main add-soups finds no difference after the squash merge');
  assert.match(outputs('m07-e5-solution')[3], /^error: the branch 'add-soups' is not fully merged\n/);
  assert.match(outputs('m08-e5-solution')[1], /<<<<<<< HEAD\n- 40 g sugar\n=======\n- 30 g sugar\n>>>>>>> cbca0db \(Use less sugar\)\n/, 'in a rebase, HEAD is the new base');
});
`````


- [ ] **Step 2: Run the test to see it fail**

Run: `node --test --test-concurrency=1 "tutorial-sources/git/tests/*.test.mjs"`
Expected: `# tests 56`, `# fail 4`. The tests for Modules 6, 7 and 8, and 'the prose of Modules 6 to 8 quotes…', fail with `Cannot read properties of undefined (reading 'record')`.

- [ ] **Step 3: Create the configuration**

`tutorial-sources/git/plan/module_06.json`:

`````json
{
  "number": 6,
  "hours": 3,
  "title": {"en": "Remotes", "zh": "远程仓库"},
  "lead": {"en": "Share a repository: put it on a server, clone it, and exchange work with push, fetch and pull, first with a folder on your own computer and then on GitHub.", "zh": "共享一个仓库：把它放到服务器上、克隆它，并用推送、获取和拉取交换工作，先用你自己电脑上的一个文件夹练习，再到 GitHub 上实践。"},
  "prerequisites": {"en": "Modules 4 and 5: branches, merging and resolving conflicts.", "zh": "第 4 和第 5 模块：分支、合并以及解决冲突。"},
  "outcomes": {
    "en": [
      "Explain what a remote is, and what origin and origin/main mean.",
      "Create a stand-in server, connect a repository to it and push with git push -u.",
      "Clone a repository, and read git remote -v and git branch -a.",
      "Bring in other people's work with git fetch and git pull, and read what git status says about it.",
      "Recover from a rejected push, and put a repository on GitHub with secure sign-in."
    ],
    "zh": [
      "解释什么是远程仓库，以及 origin 和 origin/main 的含义。",
      "创建一个替身服务器，把仓库连接到它，并用 git push -u 推送。",
      "克隆仓库，并读懂 git remote -v 和 git branch -a 的输出。",
      "用 git fetch 和 git pull 引入别人的工作，并读懂 git status 对此的说明。",
      "从被拒绝的推送中恢复，并通过安全的登录方式把仓库放到 GitHub 上。"
    ]
  },
  "sessions": [
    {"minutes": 60, "title": {"en": "A remote of your own", "zh": "你自己的远程仓库"}, "activities": [
      {"kind": "read", "anchor": "s1", "minutes": 10, "text": {"en": "What a remote is", "zh": "什么是远程仓库"}},
      {"kind": "practice", "anchor": "s2", "minutes": 25, "text": {"en": "Your first push", "zh": "第一次推送"}},
      {"kind": "practice", "anchor": "s3", "minutes": 25, "text": {"en": "Cloning", "zh": "克隆"}}
    ]},
    {"minutes": 60, "title": {"en": "Exchanging work", "zh": "交换工作"}, "activities": [
      {"kind": "practice", "anchor": "s4", "minutes": 25, "text": {"en": "Fetching and pulling", "zh": "获取与拉取"}},
      {"kind": "practice", "anchor": "s5", "minutes": 35, "text": {"en": "When a push is rejected", "zh": "推送被拒绝时"}}
    ]},
    {"minutes": 60, "title": {"en": "GitHub and practice", "zh": "GitHub 与练习"}, "activities": [
      {"kind": "practice", "anchor": "s6", "minutes": 25, "text": {"en": "Your repository on GitHub", "zh": "把仓库放到 GitHub 上"}},
      {"kind": "exercises", "anchor": "exercises", "minutes": 25, "text": {"en": "Six exercises", "zh": "六道练习"}},
      {"kind": "quiz", "anchor": "quiz", "minutes": 10, "text": {"en": "Self-check quiz", "zh": "自测"}}
    ]}
  ],
  "contract": {"sessions": [3, 6], "exercises": 6, "quiz": [6, 8], "sections": ["s1", "s2", "s3", "s4", "s5", "s6", "exercises", "quiz", "reading"]}
}
`````

`tutorial-sources/git/plan/module_07.json`:

`````json
{
  "number": 7,
  "hours": 3,
  "title": {"en": "Collaborating with pull requests", "zh": "用拉取请求协作"},
  "lead": {"en": "Work in a team the way most projects do: a branch for each change, a pull request to propose it, a review before it is merged, and a fork when you cannot push to the project yourself.", "zh": "像大多数项目那样进行团队协作：每项改动一个分支，用拉取请求提出改动，合并前先经过审查；当你无法直接向项目推送时，就使用复刻。"},
  "prerequisites": {"en": "Module 6: remotes, push, fetch and pull, and a GitHub account.", "zh": "第 6 模块：远程仓库、推送、获取和拉取，以及一个 GitHub 账号。"},
  "outcomes": {
    "en": [
      "Follow the feature-branch workflow: branch, commit, push, propose, merge, tidy up.",
      "Open a pull request on GitHub, and link it to an issue.",
      "Review someone else's branch with git log main..branch and git diff main...branch, and answer a review with new commits.",
      "Bring a branch up to date with main, and clean up merged branches locally and on the server.",
      "Contribute to a project you cannot push to, through a fork and an upstream remote."
    ],
    "zh": [
      "遵循功能分支工作流：创建分支、提交、推送、提出、合并、整理。",
      "在 GitHub 上发起拉取请求，并把它关联到议题。",
      "用 git log main..branch 和 git diff main...branch 审查别人的分支，并用新的提交回应审查意见。",
      "让分支跟上 main，并在本地和服务器上清理已合并的分支。",
      "通过复刻和 upstream 远程仓库，为你无法推送的项目做贡献。"
    ]
  },
  "sessions": [
    {"minutes": 60, "title": {"en": "Proposing a change", "zh": "提出改动"}, "activities": [
      {"kind": "read", "anchor": "s1", "minutes": 15, "text": {"en": "How teams share work", "zh": "团队如何共享工作"}},
      {"kind": "practice", "anchor": "s2", "minutes": 20, "text": {"en": "A branch for each change", "zh": "每项改动一个分支"}},
      {"kind": "practice", "anchor": "s3", "minutes": 25, "text": {"en": "Opening a pull request", "zh": "发起拉取请求"}}
    ]},
    {"minutes": 60, "title": {"en": "Review and merge", "zh": "审查与合并"}, "activities": [
      {"kind": "practice", "anchor": "s4", "minutes": 25, "text": {"en": "Reviewing a pull request", "zh": "审查拉取请求"}},
      {"kind": "practice", "anchor": "s5", "minutes": 20, "text": {"en": "Merging and tidying up", "zh": "合并与整理"}},
      {"kind": "practice", "anchor": "s6", "minutes": 15, "text": {"en": "Keeping a branch up to date", "zh": "让分支保持最新"}}
    ]},
    {"minutes": 60, "title": {"en": "Forks and practice", "zh": "复刻与练习"}, "activities": [
      {"kind": "practice", "anchor": "s7", "minutes": 20, "text": {"en": "Contributing through a fork", "zh": "通过复刻做贡献"}},
      {"kind": "exercises", "anchor": "exercises", "minutes": 30, "text": {"en": "Six exercises", "zh": "六道练习"}},
      {"kind": "quiz", "anchor": "quiz", "minutes": 10, "text": {"en": "Self-check quiz", "zh": "自测"}}
    ]}
  ],
  "contract": {"sessions": [3, 6], "exercises": 6, "quiz": [6, 8], "sections": ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "exercises", "quiz", "reading"]}
}
`````

`tutorial-sources/git/plan/module_08.json`:

`````json
{
  "number": 8,
  "hours": 3,
  "title": {"en": "Rewriting history and recovering", "zh": "改写历史与恢复"},
  "lead": {"en": "Put work aside with stash, take back commits with reset, tidy a branch with rebase and squash, follow the one rule about shared history, and rescue almost anything with the reflog.", "zh": "用 stash 暂存工作，用 reset 收回提交，用变基和压缩整理分支，遵守关于共享历史的那条规则，并用 reflog 挽回几乎任何东西。"},
  "prerequisites": {"en": "Modules 3 to 7, especially amend and revert (Module 3) and pushing branches (Module 6).", "zh": "第 3 至第 7 模块，尤其是修补和撤销（第 3 模块）以及推送分支（第 6 模块）。"},
  "outcomes": {
    "en": [
      "State the rule about rewriting shared history, and explain why it matters.",
      "Put unfinished work aside and bring it back with git stash.",
      "Take back commits with git reset --soft, --mixed and --hard, knowing what each keeps.",
      "Rebase a branch onto main, squash a fix into an earlier commit, and push a rewritten branch safely with --force-with-lease.",
      "Find lost commits in the reflog and restore them."
    ],
    "zh": [
      "说出关于改写共享历史的规则，并解释它为什么重要。",
      "用 git stash 把未完成的工作暂放一边，再把它取回来。",
      "用 git reset --soft、--mixed 和 --hard 收回提交，并清楚每种方式保留了什么。",
      "把分支变基到 main 上，把修正压缩进更早的提交，并用 --force-with-lease 安全地推送改写过的分支。",
      "在 reflog 中找到丢失的提交并恢复它们。"
    ]
  },
  "sessions": [
    {"minutes": 60, "title": {"en": "Rewinding safely", "zh": "安全地回退"}, "activities": [
      {"kind": "read", "anchor": "s1", "minutes": 10, "text": {"en": "The one rule", "zh": "唯一的规则"}},
      {"kind": "practice", "anchor": "s2", "minutes": 20, "text": {"en": "Putting work aside", "zh": "暂放工作"}},
      {"kind": "practice", "anchor": "s3", "minutes": 30, "text": {"en": "Taking back commits", "zh": "收回提交"}}
    ]},
    {"minutes": 60, "title": {"en": "Tidying a branch", "zh": "整理分支"}, "activities": [
      {"kind": "practice", "anchor": "s4", "minutes": 30, "text": {"en": "Rebasing", "zh": "变基"}},
      {"kind": "practice", "anchor": "s5", "minutes": 30, "text": {"en": "Squashing a fix", "zh": "压缩修正"}}
    ]},
    {"minutes": 60, "title": {"en": "Recovery and practice", "zh": "恢复与练习"}, "activities": [
      {"kind": "practice", "anchor": "s6", "minutes": 20, "text": {"en": "The reflog", "zh": "reflog"}},
      {"kind": "exercises", "anchor": "exercises", "minutes": 30, "text": {"en": "Six exercises", "zh": "六道练习"}},
      {"kind": "quiz", "anchor": "quiz", "minutes": 10, "text": {"en": "Self-check quiz", "zh": "自测"}}
    ]}
  ],
  "contract": {"sessions": [3, 6], "exercises": 6, "quiz": [6, 8], "sections": ["s1", "s2", "s3", "s4", "s5", "s6", "exercises", "quiz", "reading"]}
}
`````


- [ ] **Step 4: Create the Module 6 sessions**

`tutorial-sources/git/sessions/module_06/m06-first-push.session`:

`````text
title: Put your repository on a server
title-zh: 把仓库放到服务器上
---
# A recipes repository with two commits
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
$ git init --bare /srv/git/recipes.git
$ git remote add origin /srv/git/recipes.git
$ git remote -v
$ git push -u origin main
$ git status
@graph pushed
`````

`tutorial-sources/git/sessions/module_06/m06-clone.session`:

`````text
title: Clone a repository
title-zh: 克隆仓库
---
# A recipes repository with two commits
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
# Alex has put it on the server
> git init --bare /srv/git/recipes.git
> git remote add origin /srv/git/recipes.git
> git push -u origin main
@as sam
$ git clone /srv/git/recipes.git
$ cd recipes
$ ls
$ git log --oneline
$ git remote -v
$ git branch -a
@graph cloned
`````

`tutorial-sources/git/sessions/module_06/m06-fetch-pull.session`:

`````text
title: Fetch and pull someone else's work
title-zh: 获取和拉取别人的工作
---
# A recipes repository with two commits
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
# Alex has put it on the server
> git init --bare /srv/git/recipes.git
> git remote add origin /srv/git/recipes.git
> git push -u origin main
# Sam has cloned it
@as sam
> git clone /srv/git/recipes.git
> cd recipes
@as alex
+file cake.md
# Lemon cake

- 200 g flour
- 2 lemons
+end
$ git add cake.md
$ git commit -m "Add a lemon cake recipe"
$ git push
@as sam
$ git status
$ git fetch
$ git status
$ git log --oneline main..origin/main
@graph fetched
$ git pull
$ ls
`````

`tutorial-sources/git/sessions/module_06/m06-rejected.session`:

`````text
title: When a push is rejected
title-zh: 推送被拒绝时
---
# A recipes repository with two commits
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
# Alex has put it on the server
> git init --bare /srv/git/recipes.git
> git remote add origin /srv/git/recipes.git
> git push -u origin main
# Sam has cloned it
@as sam
> git clone /srv/git/recipes.git
> cd recipes
# Meanwhile, Alex pushes a cake recipe
@as alex
+hidden cake.md
# Lemon cake

- 200 g flour
- 2 lemons
+end
> git add cake.md
> git commit -m "Add a lemon cake recipe"
> git push
@as sam
+file soup.md
# Tomato soup

- 1 kg tomatoes
+end
$ git add soup.md
$ git commit -m "Add a tomato soup recipe"
$! git push
$! git pull
$ git config --global pull.rebase false
$ git pull
$ git push
@graph shared
`````

`tutorial-sources/git/sessions/module_06/m06-e2-solution.session`:

`````text
title: Clone into a folder of your choice
title-zh: 克隆到你选择的文件夹
role: solution
---
# A recipes repository with two commits
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
# Alex has put it on the server
> git init --bare /srv/git/recipes.git
> git remote add origin /srv/git/recipes.git
> git push -u origin main
@as sam
$ git clone /srv/git/recipes.git family-recipes
$ ls
$ cd family-recipes
$ git log --oneline
`````

`tutorial-sources/git/sessions/module_06/m06-e4-solution.session`:

`````text
title: Share a new branch
title-zh: 分享一个新分支
role: solution
---
# A recipes repository with two commits
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
# Alex has put it on the server
> git init --bare /srv/git/recipes.git
> git remote add origin /srv/git/recipes.git
> git push -u origin main
$ git switch -c soups
+file soup.md
# Tomato soup

- 1 kg tomatoes
+end
$ git add soup.md
$ git commit -m "Add a tomato soup recipe"
$ git push -u origin soups
$ git branch -vv
`````


- [ ] **Step 5: Create the Module 7 sessions**

`tutorial-sources/git/sessions/module_07/m07-feature-branch.session`:

`````text
title: Work on a feature branch
title-zh: 在功能分支上工作
---
# A shared recipes repository: Alex and Sam each have a clone
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
> git init --bare /srv/git/recipes.git
> git remote add origin /srv/git/recipes.git
> git push -u origin main
> git config --global pull.rebase false
@as sam
> git clone /srv/git/recipes.git
> cd recipes
> git config --global pull.rebase false
@as alex
$ git switch -c add-soups
+file soup.md
# Tomato soup
+end
$ git add soup.md
$ git commit -m "Add a tomato soup recipe"
$ git push -u origin add-soups
$ git branch -vv
`````

`tutorial-sources/git/sessions/module_07/m07-review.session`:

`````text
title: Look at a branch before it is merged
title-zh: 在合并之前查看一个分支
---
# A shared recipes repository: Alex and Sam each have a clone
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
> git init --bare /srv/git/recipes.git
> git remote add origin /srv/git/recipes.git
> git push -u origin main
> git config --global pull.rebase false
@as sam
> git clone /srv/git/recipes.git
> cd recipes
> git config --global pull.rebase false
@as alex
# Alex has pushed a branch with a soup recipe
> git switch -c add-soups
+hidden soup.md
# Tomato soup
+end
> git add soup.md
> git commit -m "Add a tomato soup recipe"
> git push -u origin add-soups
@as sam
$ git fetch
$ git switch add-soups
$ git log --oneline main..add-soups
$ git diff main...add-soups
`````

`tutorial-sources/git/sessions/module_07/m07-address-review.session`:

`````text
title: Answer a review with another commit
title-zh: 用一次新提交回应审查意见
---
# A shared recipes repository: Alex and Sam each have a clone
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
> git init --bare /srv/git/recipes.git
> git remote add origin /srv/git/recipes.git
> git push -u origin main
> git config --global pull.rebase false
@as sam
> git clone /srv/git/recipes.git
> cd recipes
> git config --global pull.rebase false
@as alex
# Alex has pushed a branch with a soup recipe
> git switch -c add-soups
+hidden soup.md
# Tomato soup
+end
> git add soup.md
> git commit -m "Add a tomato soup recipe"
> git push -u origin add-soups
@as sam
> git fetch
> git switch add-soups
@as alex
+file soup.md
# Tomato soup

- 1 kg tomatoes
- 1 onion
+end
$ git add soup.md
$ git commit -m "List the soup ingredients"
$ git push
@as sam
$ git pull
$ git log --oneline main..add-soups
`````

`tutorial-sources/git/sessions/module_07/m07-after-merge.session`:

`````text
title: Tidy up after a merge
title-zh: 合并之后的整理
---
# A shared recipes repository: Alex and Sam each have a clone
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
> git init --bare /srv/git/recipes.git
> git remote add origin /srv/git/recipes.git
> git push -u origin main
> git config --global pull.rebase false
@as sam
> git clone /srv/git/recipes.git
> cd recipes
> git config --global pull.rebase false
@as alex
# Alex has pushed a branch with a soup recipe
> git switch -c add-soups
+hidden soup.md
# Tomato soup
+end
> git add soup.md
> git commit -m "Add a tomato soup recipe"
> git push -u origin add-soups
# Sam merges the branch into main on the server, as a pull request's merge button does, and deletes the branch
@as sam
> git fetch
> git switch add-soups
> git switch main
> git merge --no-ff add-soups
> git push
> git push origin --delete add-soups
> git branch -d add-soups
@as alex
$ git switch main
$ git pull
$ git branch -d add-soups
$ git fetch --prune
$ git branch -a
@graph merged
`````

`tutorial-sources/git/sessions/module_07/m07-update-branch.session`:

`````text
title: Bring a branch up to date with main
title-zh: 让分支跟上 main
---
# A shared recipes repository: Alex and Sam each have a clone
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
> git init --bare /srv/git/recipes.git
> git remote add origin /srv/git/recipes.git
> git push -u origin main
> git config --global pull.rebase false
@as sam
> git clone /srv/git/recipes.git
> cd recipes
> git config --global pull.rebase false
@as alex
# Alex works on a branch while Sam's change reaches main
> git switch -c add-breads
+hidden bread.md
# Soda bread
+end
> git add bread.md
> git commit -m "Add a soda bread recipe"
> git push -u origin add-breads
@as sam
+hidden README.md
# Family recipes

Recipes we cook again and again, with notes on what worked.
+end
> git commit -am "Say what the notes are for"
> git push
@as alex
$ git fetch
$ git status
@graph behind
$ git merge origin/main
$ git push
@graph updated
`````

`tutorial-sources/git/sessions/module_07/m07-fork.session`:

`````text
title: Contribute through a fork
title-zh: 通过复刻做贡献
---
# A shared recipes repository: Alex and Sam each have a clone
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
> git init --bare /srv/git/recipes.git
> git remote add origin /srv/git/recipes.git
> git push -u origin main
> git config --global pull.rebase false
@as sam
> git clone /srv/git/recipes.git
> cd recipes
> git config --global pull.rebase false
@as alex
# Sam's own copy of the repository on the server, as GitHub's Fork button makes one
> git clone --bare /srv/git/recipes.git /srv/git/sam-recipes.git
@as sam
> cd ..
$ git clone /srv/git/sam-recipes.git
$ cd sam-recipes
$ git remote add upstream /srv/git/recipes.git
$ git remote -v
@as alex
+file cake.md
# Lemon cake
+end
$ git add cake.md
$ git commit -m "Add a lemon cake recipe"
$ git push
@as sam
$ git fetch upstream
$ git merge upstream/main
$ git push
`````

`tutorial-sources/git/sessions/module_07/m07-e3-solution.session`:

`````text
title: Add a commit to a colleague's branch
title-zh: 在同事的分支上添加一次提交
role: solution
---
# A shared recipes repository: Alex and Sam each have a clone
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
> git init --bare /srv/git/recipes.git
> git remote add origin /srv/git/recipes.git
> git push -u origin main
> git config --global pull.rebase false
@as sam
> git clone /srv/git/recipes.git
> cd recipes
> git config --global pull.rebase false
@as alex
# Alex has pushed a branch with a soup recipe
> git switch -c add-soups
+hidden soup.md
# Tomato soup
+end
> git add soup.md
> git commit -m "Add a tomato soup recipe"
> git push -u origin add-soups
@as sam
$ git fetch
$ git switch add-soups
+file soup.md
# Tomato soup

Serves four.
+end
$ git commit -am "Say how many the soup serves"
$ git push
@as alex
$ git pull
$ git log --oneline -n 2
`````

`tutorial-sources/git/sessions/module_07/m07-e5-solution.session`:

`````text
title: Tidy up after a squash merge
title-zh: 压缩合并之后的整理
role: solution
---
# A shared recipes repository: Alex and Sam each have a clone
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
> git init --bare /srv/git/recipes.git
> git remote add origin /srv/git/recipes.git
> git push -u origin main
> git config --global pull.rebase false
@as sam
> git clone /srv/git/recipes.git
> cd recipes
> git config --global pull.rebase false
@as alex
# Alex has pushed a branch with a soup recipe
> git switch -c add-soups
+hidden soup.md
# Tomato soup
+end
> git add soup.md
> git commit -m "Add a tomato soup recipe"
> git push -u origin add-soups
# The pull request is merged with GitHub's "Squash and merge": one new commit on main, and the branch is deleted
@as sam
> git fetch
> git merge --squash origin/add-soups
> git commit -m "Add a tomato soup recipe (#1)"
> git push
> git push origin --delete add-soups
@as alex
$ git switch main
$ git pull
$ git fetch --prune
$! git branch -d add-soups
$ git diff main add-soups
$ git branch -D add-soups
`````


- [ ] **Step 6: Create the Module 8 sessions**

`tutorial-sources/git/sessions/module_08/m08-stash.session`:

`````text
title: Put unfinished work aside
title-zh: 把未完成的工作暂放一边
---
# A recipes repository with two commits
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
+file pancakes.md
# Pancakes

- 200 g flour
- 2 eggs
- 300 ml milk
- a pinch of
+end
$ git stash
$ git status
$ git stash list
+file README.md
# Family recipes

Recipes we cook again and again, with notes on what worked.
+end
$ git commit -am "Say what the notes are for"
$ git stash pop
$ git diff
`````

`tutorial-sources/git/sessions/module_08/m08-reset.session`:

`````text
title: Take back the last commit
title-zh: 收回最近一次提交
---
# A recipes repository with two commits
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
+file pancakes.md
# Pancakes

- 200 g flour
- 2 eggs
- 300 ml milk
- a pinch of salt
+end
$ git commit -am "Add salt"
$ git reset --soft HEAD~1
$ git status
$ git commit -m "Add a pinch of salt to the pancakes"
$ git reset HEAD~1
$ git status
$ git log --oneline
`````

`tutorial-sources/git/sessions/module_08/m08-rebase.session`:

`````text
title: Replay a branch on top of main
title-zh: 把分支重放到 main 之上
---
# A recipes repository with two commits
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
# A soups branch, already pushed; then main moves on
> git init --bare /srv/git/recipes.git
> git remote add origin /srv/git/recipes.git
> git push -u origin main
> git switch -c soups
+hidden soup.md
# Tomato soup
+end
> git add soup.md
> git commit -m "Add a tomato soup recipe"
> git push -u origin soups
> git switch main
+hidden README.md
# Family recipes

Recipes we cook again and again, with notes on what worked.
+end
> git commit -am "Say what the notes are for"
> git push
> git switch soups
@graph before
$ git rebase main
@graph after
$! git push
$ git push --force-with-lease
`````

`tutorial-sources/git/sessions/module_08/m08-squash.session`:

`````text
title: Fold a fix into an earlier commit
title-zh: 把修正并入更早的提交
---
# A recipes repository with two commits
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
> git switch -c soups
+hidden soup.md
# Tomatoe soup

- 1 kg tomatoes
+end
> git add soup.md
> git commit -m "Add a tomato soup recipe"
+hidden bread.md
# Soda bread
+end
> git add bread.md
> git commit -m "Add a soda bread recipe"
$ git log --oneline
+file soup.md
# Tomato soup

- 1 kg tomatoes
+end
$ git add soup.md
$ git commit --fixup HEAD~1
$ git log --oneline
$ git rebase -i --autosquash main
$ git log --oneline
`````

`tutorial-sources/git/sessions/module_08/m08-reflog.session`:

`````text
title: Recover commits after a hard reset
title-zh: 硬重置之后找回提交
---
# A recipes repository with two commits
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
+hidden cake.md
# Lemon cake
+end
> git add cake.md
> git commit -m "Add a lemon cake recipe"
+hidden soup.md
# Tomato soup
+end
> git add soup.md
> git commit -m "Add a tomato soup recipe"
$ git log --oneline
$ git reset --hard HEAD~2
$ git log --oneline
$ git reflog
$ git reset --hard ab03771
$ git log --oneline
`````

`tutorial-sources/git/sessions/module_08/m08-e2-solution.session`:

`````text
title: Stash, fix something else, and carry on
title-zh: 暂存、修好别的东西，再继续
role: solution
---
# A recipes repository with two commits
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
# Alex is half-way through a soup recipe on a branch
> git switch -c soups
+hidden soup.md
# Tomato soup
+end
> git add soup.md
> git commit -m "Start a tomato soup recipe"
+hidden soup.md
# Tomato soup

- 1 kg tom
+end
$ git stash
$ git switch main
+file README.md
# Family recipes

Recipes we cook again and again, with notes on what worked.
+end
$ git commit -am "Say what the notes are for"
$ git switch soups
$ git stash pop
`````

`tutorial-sources/git/sessions/module_08/m08-e5-solution.session`:

`````text
title: Resolve a conflict during a rebase
title-zh: 解决变基过程中的冲突
role: solution
---
# A pancake recipe with 50 g of sugar; less-sugar and main both change it
> mkdir recipes
> cd recipes
> git init
+hidden pancakes.md
# Pancakes

- 200 g flour
- 2 eggs
- 300 ml milk
- 50 g sugar
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
+end
> git commit -am "Use less sugar"
> git switch main
+hidden pancakes.md
# Pancakes

- 200 g flour
- 2 eggs
- 300 ml milk
- 40 g sugar
+end
> git commit -am "Reduce the sugar a little"
> git switch less-sugar
$! git rebase main
$ cat pancakes.md
+file pancakes.md
# Pancakes

- 200 g flour
- 2 eggs
- 300 ml milk
- 35 g sugar
+end
$ git add pancakes.md
$ git rebase --continue
$ git log --oneline
`````


- [ ] **Step 7: Create the figures and update the glossary**

`tutorial-sources/git/figures/en/fig-06-01.svg`:

`````text
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 250" role="img" aria-labelledby="t">
  <title id="t">Your repository and a remote repository</title>
  <defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0L10 5L0 10z" fill="#334155"/></marker></defs>
  <g font-family="system-ui, -apple-system, Segoe UI, sans-serif" text-anchor="middle">
    <text x="140" y="22" font-size="13" font-weight="700" fill="#475569">Your computer</text>
    <rect x="10" y="34" width="260" height="160" rx="12" fill="#EFF6FF" stroke="#2563EB" stroke-width="2"/>
    <text x="140" y="66" font-size="17" font-weight="700" fill="#1E3A8A">Your repository</text>
    <rect x="30" y="84" width="220" height="34" rx="8" fill="#FFFFFF" stroke="#2563EB" stroke-width="1.5"/>
    <text x="140" y="106" font-size="13" fill="#334155">main: your work</text>
    <rect x="30" y="128" width="220" height="50" rx="8" fill="#F8FAFC" stroke="#94A3B8" stroke-width="1.5"/>
    <text x="140" y="149" font-size="13" fill="#334155">origin/main: the server’s main,</text>
    <text x="140" y="167" font-size="13" fill="#334155">as of your last fetch</text>
    <text x="540" y="22" font-size="13" font-weight="700" fill="#475569">The server</text>
    <rect x="410" y="34" width="260" height="160" rx="12" fill="#DCFCE7" stroke="#16A34A" stroke-width="2"/>
    <text x="540" y="66" font-size="17" font-weight="700" fill="#14532D">Remote repository: origin</text>
    <rect x="450" y="84" width="180" height="34" rx="8" fill="#FFFFFF" stroke="#16A34A" stroke-width="1.5"/>
    <text x="540" y="106" font-size="13" fill="#334155">main</text>
    <line x1="274" y1="100" x2="406" y2="100" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/>
    <text x="340" y="90" font-size="13" font-family="ui-monospace, Menlo, Consolas, monospace" fill="#7C3AED">git push</text>
    <line x1="406" y1="153" x2="274" y2="153" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/>
    <text x="340" y="143" font-size="13" font-family="ui-monospace, Menlo, Consolas, monospace" fill="#7C3AED">git fetch</text>
    <text x="340" y="230" font-size="13" fill="#475569">git push sends your commits; git fetch brings the server’s commits; git pull = git fetch + git merge</text>
  </g>
</svg>
`````

`tutorial-sources/git/figures/zh/fig-06-01.svg`:

`````text
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 250" role="img" aria-labelledby="t">
  <title id="t">你的仓库与远程仓库</title>
  <defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0L10 5L0 10z" fill="#334155"/></marker></defs>
  <g font-family="system-ui, -apple-system, Segoe UI, sans-serif" text-anchor="middle">
    <text x="140" y="22" font-size="13" font-weight="700" fill="#475569">你的电脑</text>
    <rect x="10" y="34" width="260" height="160" rx="12" fill="#EFF6FF" stroke="#2563EB" stroke-width="2"/>
    <text x="140" y="66" font-size="17" font-weight="700" fill="#1E3A8A">你的仓库</text>
    <rect x="30" y="84" width="220" height="34" rx="8" fill="#FFFFFF" stroke="#2563EB" stroke-width="1.5"/>
    <text x="140" y="106" font-size="13" fill="#334155">main：你的工作</text>
    <rect x="30" y="128" width="220" height="50" rx="8" fill="#F8FAFC" stroke="#94A3B8" stroke-width="1.5"/>
    <text x="140" y="149" font-size="13" fill="#334155">origin/main：服务器上的 main，</text>
    <text x="140" y="167" font-size="13" fill="#334155">截至你上次获取时</text>
    <text x="540" y="22" font-size="13" font-weight="700" fill="#475569">服务器</text>
    <rect x="410" y="34" width="260" height="160" rx="12" fill="#DCFCE7" stroke="#16A34A" stroke-width="2"/>
    <text x="540" y="66" font-size="17" font-weight="700" fill="#14532D">远程仓库：origin</text>
    <rect x="450" y="84" width="180" height="34" rx="8" fill="#FFFFFF" stroke="#16A34A" stroke-width="1.5"/>
    <text x="540" y="106" font-size="13" fill="#334155">main</text>
    <line x1="274" y1="100" x2="406" y2="100" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/>
    <text x="340" y="90" font-size="13" font-family="ui-monospace, Menlo, Consolas, monospace" fill="#7C3AED">git push</text>
    <line x1="406" y1="153" x2="274" y2="153" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/>
    <text x="340" y="143" font-size="13" font-family="ui-monospace, Menlo, Consolas, monospace" fill="#7C3AED">git fetch</text>
    <text x="340" y="230" font-size="13" fill="#475569">git push 发送你的提交；git fetch 取回服务器的提交；git pull = git fetch + git merge</text>
  </g>
</svg>
`````

`tutorial-sources/git/figures/en/fig-07-01.svg`:

`````text
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 262" role="img" aria-labelledby="t">
  <title id="t">The life of a pull request</title>
  <defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0L10 5L0 10z" fill="#334155"/></marker></defs>
  <g font-family="system-ui, -apple-system, Segoe UI, sans-serif" text-anchor="middle">
    <rect x="10" y="20" width="150" height="80" rx="12" fill="#EFF6FF" stroke="#2563EB" stroke-width="2"/><text x="85.0" y="48" font-size="15" font-weight="700" fill="#1E3A8A">1 Branch</text><text x="85.0" y="70" font-size="12.5" fill="#334155">git switch -c</text><rect x="180" y="20" width="150" height="80" rx="12" fill="#EFF6FF" stroke="#2563EB" stroke-width="2"/><text x="255.0" y="48" font-size="15" font-weight="700" fill="#1E3A8A">2 Commit</text><text x="255.0" y="70" font-size="12.5" fill="#334155">git add, git commit</text><rect x="350" y="20" width="150" height="80" rx="12" fill="#EFF6FF" stroke="#2563EB" stroke-width="2"/><text x="425.0" y="48" font-size="15" font-weight="700" fill="#1E3A8A">3 Push</text><text x="425.0" y="70" font-size="12.5" fill="#334155">git push -u origin</text><rect x="520" y="20" width="150" height="80" rx="12" fill="#DCFCE7" stroke="#16A34A" stroke-width="2"/><text x="595.0" y="48" font-size="15" font-weight="700" fill="#14532D">4 Pull request</text><text x="595.0" y="70" font-size="12.5" fill="#334155">proposed on GitHub</text><rect x="520" y="140" width="150" height="80" rx="12" fill="#DCFCE7" stroke="#16A34A" stroke-width="2"/><text x="595.0" y="168" font-size="15" font-weight="700" fill="#14532D">5 Review</text><text x="595.0" y="190" font-size="12.5" fill="#334155">comments and fixes</text><rect x="350" y="140" width="150" height="80" rx="12" fill="#DCFCE7" stroke="#16A34A" stroke-width="2"/><text x="425.0" y="168" font-size="15" font-weight="700" fill="#14532D">6 Merge</text><text x="425.0" y="190" font-size="12.5" fill="#334155">into main on GitHub</text><rect x="180" y="140" width="150" height="80" rx="12" fill="#EFF6FF" stroke="#2563EB" stroke-width="2"/><text x="255.0" y="168" font-size="15" font-weight="700" fill="#1E3A8A">7 Tidy up</text><text x="255.0" y="190" font-size="12.5" fill="#334155">git pull, git branch -d</text><line x1="162" y1="60" x2="178" y2="60" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/><line x1="332" y1="60" x2="348" y2="60" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/><line x1="502" y1="60" x2="518" y2="60" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/><line x1="595" y1="102" x2="595" y2="138" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/><line x1="518" y1="180" x2="502" y2="180" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/><line x1="348" y1="180" x2="332" y2="180" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/><text x="340" y="250" font-size="13" fill="#475569">Each change travels on its own branch, and reaches main only after review</text>
  </g>
</svg>
`````

`tutorial-sources/git/figures/zh/fig-07-01.svg`:

`````text
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 262" role="img" aria-labelledby="t">
  <title id="t">拉取请求的生命周期</title>
  <defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0L10 5L0 10z" fill="#334155"/></marker></defs>
  <g font-family="system-ui, -apple-system, Segoe UI, sans-serif" text-anchor="middle">
    <rect x="10" y="20" width="150" height="80" rx="12" fill="#EFF6FF" stroke="#2563EB" stroke-width="2"/><text x="85.0" y="48" font-size="15" font-weight="700" fill="#1E3A8A">1 分支</text><text x="85.0" y="70" font-size="12.5" fill="#334155">git switch -c</text><rect x="180" y="20" width="150" height="80" rx="12" fill="#EFF6FF" stroke="#2563EB" stroke-width="2"/><text x="255.0" y="48" font-size="15" font-weight="700" fill="#1E3A8A">2 提交</text><text x="255.0" y="70" font-size="12.5" fill="#334155">git add、git commit</text><rect x="350" y="20" width="150" height="80" rx="12" fill="#EFF6FF" stroke="#2563EB" stroke-width="2"/><text x="425.0" y="48" font-size="15" font-weight="700" fill="#1E3A8A">3 推送</text><text x="425.0" y="70" font-size="12.5" fill="#334155">git push -u origin</text><rect x="520" y="20" width="150" height="80" rx="12" fill="#DCFCE7" stroke="#16A34A" stroke-width="2"/><text x="595.0" y="48" font-size="15" font-weight="700" fill="#14532D">4 拉取请求</text><text x="595.0" y="70" font-size="12.5" fill="#334155">在 GitHub 上提出</text><rect x="520" y="140" width="150" height="80" rx="12" fill="#DCFCE7" stroke="#16A34A" stroke-width="2"/><text x="595.0" y="168" font-size="15" font-weight="700" fill="#14532D">5 审查</text><text x="595.0" y="190" font-size="12.5" fill="#334155">评论、更多提交</text><rect x="350" y="140" width="150" height="80" rx="12" fill="#DCFCE7" stroke="#16A34A" stroke-width="2"/><text x="425.0" y="168" font-size="15" font-weight="700" fill="#14532D">6 合并</text><text x="425.0" y="190" font-size="12.5" fill="#334155">在 GitHub 上并入 main</text><rect x="180" y="140" width="150" height="80" rx="12" fill="#EFF6FF" stroke="#2563EB" stroke-width="2"/><text x="255.0" y="168" font-size="15" font-weight="700" fill="#1E3A8A">7 整理</text><text x="255.0" y="190" font-size="12.5" fill="#334155">git pull、git branch -d</text><line x1="162" y1="60" x2="178" y2="60" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/><line x1="332" y1="60" x2="348" y2="60" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/><line x1="502" y1="60" x2="518" y2="60" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/><line x1="595" y1="102" x2="595" y2="138" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/><line x1="518" y1="180" x2="502" y2="180" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/><line x1="348" y1="180" x2="332" y2="180" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/><text x="340" y="250" font-size="13" fill="#475569">每项改动都在自己的分支上进行，经过审查后才进入 main</text>
  </g>
</svg>
`````

`tutorial-sources/git/figures/en/fig-07-02.svg`:

`````text
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 266" role="img" aria-labelledby="t">
  <title id="t">Contributing through a fork</title>
  <defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0L10 5L0 10z" fill="#334155"/></marker></defs>
  <g font-family="system-ui, -apple-system, Segoe UI, sans-serif" text-anchor="middle">
    <text x="340" y="18" font-size="13" font-weight="700" fill="#475569">GitHub</text><rect x="10" y="26" width="660" height="110" rx="14" fill="none" stroke="#CBD5E1" stroke-dasharray="5 4"/><rect x="30" y="44" width="230" height="76" rx="12" fill="#DCFCE7" stroke="#16A34A" stroke-width="2"/><text x="145.0" y="72" font-size="15" font-weight="700" fill="#14532D">The project</text><text x="145.0" y="94" font-size="12.5" fill="#334155">upstream: you cannot push here</text><rect x="420" y="44" width="230" height="76" rx="12" fill="#EFF6FF" stroke="#2563EB" stroke-width="2"/><text x="535.0" y="72" font-size="15" font-weight="700" fill="#1E3A8A">Your fork</text><text x="535.0" y="94" font-size="12.5" fill="#334155">origin: your copy on GitHub</text><rect x="420" y="190" width="230" height="66" rx="12" fill="#FEF3C7" stroke="#D97706" stroke-width="2"/><text x="535.0" y="218" font-size="15" font-weight="700" fill="#78350F">Your clone</text><text x="535.0" y="240" font-size="12.5" fill="#334155">on your computer</text><line x1="262" y1="68" x2="418" y2="68" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/><text x="340" y="60" font-size="12.5"  text-anchor="middle" fill="#7C3AED">Fork</text><line x1="418" y1="100" x2="262" y2="100" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/><text x="340" y="118" font-size="12.5"  text-anchor="middle" fill="#7C3AED">pull request</text><line x1="490" y1="122" x2="490" y2="188" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/><text x="480" y="160" font-size="12.5" font-family="ui-monospace, Menlo, Consolas, monospace" text-anchor="end" fill="#7C3AED">git clone</text><line x1="580" y1="188" x2="580" y2="122" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/><text x="590" y="160" font-size="12.5" font-family="ui-monospace, Menlo, Consolas, monospace" text-anchor="start" fill="#7C3AED">git push</text><path d="M418 223 C 200 223 145 190 145 122" stroke="#334155" stroke-width="2" fill="none" marker-end="url(#arrow)"/><text x="250" y="244" font-size="12.5" font-family="ui-monospace, Menlo, Consolas, monospace" text-anchor="middle" fill="#7C3AED">git fetch upstream</text>
  </g>
</svg>
`````

`tutorial-sources/git/figures/zh/fig-07-02.svg`:

`````text
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 266" role="img" aria-labelledby="t">
  <title id="t">通过复刻做贡献</title>
  <defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0L10 5L0 10z" fill="#334155"/></marker></defs>
  <g font-family="system-ui, -apple-system, Segoe UI, sans-serif" text-anchor="middle">
    <text x="340" y="18" font-size="13" font-weight="700" fill="#475569">GitHub</text><rect x="10" y="26" width="660" height="110" rx="14" fill="none" stroke="#CBD5E1" stroke-dasharray="5 4"/><rect x="30" y="44" width="230" height="76" rx="12" fill="#DCFCE7" stroke="#16A34A" stroke-width="2"/><text x="145.0" y="72" font-size="15" font-weight="700" fill="#14532D">原项目</text><text x="145.0" y="94" font-size="12.5" fill="#334155">upstream：你无法推送到这里</text><rect x="420" y="44" width="230" height="76" rx="12" fill="#EFF6FF" stroke="#2563EB" stroke-width="2"/><text x="535.0" y="72" font-size="15" font-weight="700" fill="#1E3A8A">你的复刻</text><text x="535.0" y="94" font-size="12.5" fill="#334155">origin：你在 GitHub 上的副本</text><rect x="420" y="190" width="230" height="66" rx="12" fill="#FEF3C7" stroke="#D97706" stroke-width="2"/><text x="535.0" y="218" font-size="15" font-weight="700" fill="#78350F">你的克隆</text><text x="535.0" y="240" font-size="12.5" fill="#334155">在你的电脑上</text><line x1="262" y1="68" x2="418" y2="68" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/><text x="340" y="60" font-size="12.5"  text-anchor="middle" fill="#7C3AED">Fork</text><line x1="418" y1="100" x2="262" y2="100" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/><text x="340" y="118" font-size="12.5"  text-anchor="middle" fill="#7C3AED">拉取请求</text><line x1="490" y1="122" x2="490" y2="188" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/><text x="480" y="160" font-size="12.5" font-family="ui-monospace, Menlo, Consolas, monospace" text-anchor="end" fill="#7C3AED">git clone</text><line x1="580" y1="188" x2="580" y2="122" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/><text x="590" y="160" font-size="12.5" font-family="ui-monospace, Menlo, Consolas, monospace" text-anchor="start" fill="#7C3AED">git push</text><path d="M418 223 C 200 223 145 190 145 122" stroke="#334155" stroke-width="2" fill="none" marker-end="url(#arrow)"/><text x="250" y="244" font-size="12.5" font-family="ui-monospace, Menlo, Consolas, monospace" text-anchor="middle" fill="#7C3AED">git fetch upstream</text>
  </g>
</svg>
`````

`tutorial-sources/git/figures/en/fig-08-01.svg`:

`````text
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 230" role="img" aria-labelledby="t">
  <title id="t">What git reset keeps</title>
  <g font-family="system-ui, -apple-system, Segoe UI, sans-serif" text-anchor="middle">
    <text x="280" y="28" font-size="14" font-weight="700" fill="#334155">The branch</text>
    <text x="430" y="28" font-size="14" font-weight="700" fill="#334155">Staging area</text>
    <text x="580" y="28" font-size="14" font-weight="700" fill="#334155">Working tree</text>
    <text x="100" y="69" font-size="14" font-family="ui-monospace, Menlo, Consolas, monospace" fill="#7C3AED">--soft</text>
    <rect x="210" y="44" width="140" height="38" rx="8" fill="#EFF6FF" stroke="#2563EB" stroke-width="1.5"/>
    <text x="280" y="68" font-size="13" fill="#1E3A8A">moves back</text>
    <rect x="360" y="44" width="140" height="38" rx="8" fill="#DCFCE7" stroke="#16A34A" stroke-width="1.5"/>
    <text x="430" y="68" font-size="13" fill="#14532D">kept</text>
    <rect x="510" y="44" width="140" height="38" rx="8" fill="#DCFCE7" stroke="#16A34A" stroke-width="1.5"/>
    <text x="580" y="68" font-size="13" fill="#14532D">kept</text>
    <text x="100" y="121" font-size="14" font-family="ui-monospace, Menlo, Consolas, monospace" fill="#7C3AED">--mixed (default)</text>
    <rect x="210" y="96" width="140" height="38" rx="8" fill="#EFF6FF" stroke="#2563EB" stroke-width="1.5"/>
    <text x="280" y="120" font-size="13" fill="#1E3A8A">moves back</text>
    <rect x="360" y="96" width="140" height="38" rx="8" fill="#FEF3C7" stroke="#D97706" stroke-width="1.5"/>
    <text x="430" y="120" font-size="13" fill="#78350F">reset</text>
    <rect x="510" y="96" width="140" height="38" rx="8" fill="#DCFCE7" stroke="#16A34A" stroke-width="1.5"/>
    <text x="580" y="120" font-size="13" fill="#14532D">kept</text>
    <text x="100" y="173" font-size="14" font-family="ui-monospace, Menlo, Consolas, monospace" fill="#7C3AED">--hard</text>
    <rect x="210" y="148" width="140" height="38" rx="8" fill="#EFF6FF" stroke="#2563EB" stroke-width="1.5"/>
    <text x="280" y="172" font-size="13" fill="#1E3A8A">moves back</text>
    <rect x="360" y="148" width="140" height="38" rx="8" fill="#FEF3C7" stroke="#D97706" stroke-width="1.5"/>
    <text x="430" y="172" font-size="13" fill="#78350F">reset</text>
    <rect x="510" y="148" width="140" height="38" rx="8" fill="#FEE2E2" stroke="#DC2626" stroke-width="1.5"/>
    <text x="580" y="172" font-size="13" fill="#7F1D1D">reset: changes lost</text>
    <text x="340" y="215" font-size="13" fill="#475569">Commits that are no longer on any branch can still be found in the reflog for a while</text>
  </g>
</svg>
`````

`tutorial-sources/git/figures/zh/fig-08-01.svg`:

`````text
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 230" role="img" aria-labelledby="t">
  <title id="t">git reset 保留什么</title>
  <g font-family="system-ui, -apple-system, Segoe UI, sans-serif" text-anchor="middle">
    <text x="280" y="28" font-size="14" font-weight="700" fill="#334155">分支</text>
    <text x="430" y="28" font-size="14" font-weight="700" fill="#334155">暂存区</text>
    <text x="580" y="28" font-size="14" font-weight="700" fill="#334155">工作区</text>
    <text x="100" y="69" font-size="14" font-family="ui-monospace, Menlo, Consolas, monospace" fill="#7C3AED">--soft</text>
    <rect x="210" y="44" width="140" height="38" rx="8" fill="#EFF6FF" stroke="#2563EB" stroke-width="1.5"/>
    <text x="280" y="68" font-size="13" fill="#1E3A8A">后退</text>
    <rect x="360" y="44" width="140" height="38" rx="8" fill="#DCFCE7" stroke="#16A34A" stroke-width="1.5"/>
    <text x="430" y="68" font-size="13" fill="#14532D">保留</text>
    <rect x="510" y="44" width="140" height="38" rx="8" fill="#DCFCE7" stroke="#16A34A" stroke-width="1.5"/>
    <text x="580" y="68" font-size="13" fill="#14532D">保留</text>
    <text x="100" y="121" font-size="14" font-family="ui-monospace, Menlo, Consolas, monospace" fill="#7C3AED">--mixed（默认）</text>
    <rect x="210" y="96" width="140" height="38" rx="8" fill="#EFF6FF" stroke="#2563EB" stroke-width="1.5"/>
    <text x="280" y="120" font-size="13" fill="#1E3A8A">后退</text>
    <rect x="360" y="96" width="140" height="38" rx="8" fill="#FEF3C7" stroke="#D97706" stroke-width="1.5"/>
    <text x="430" y="120" font-size="13" fill="#78350F">重置</text>
    <rect x="510" y="96" width="140" height="38" rx="8" fill="#DCFCE7" stroke="#16A34A" stroke-width="1.5"/>
    <text x="580" y="120" font-size="13" fill="#14532D">保留</text>
    <text x="100" y="173" font-size="14" font-family="ui-monospace, Menlo, Consolas, monospace" fill="#7C3AED">--hard</text>
    <rect x="210" y="148" width="140" height="38" rx="8" fill="#EFF6FF" stroke="#2563EB" stroke-width="1.5"/>
    <text x="280" y="172" font-size="13" fill="#1E3A8A">后退</text>
    <rect x="360" y="148" width="140" height="38" rx="8" fill="#FEF3C7" stroke="#D97706" stroke-width="1.5"/>
    <text x="430" y="172" font-size="13" fill="#78350F">重置</text>
    <rect x="510" y="148" width="140" height="38" rx="8" fill="#FEE2E2" stroke="#DC2626" stroke-width="1.5"/>
    <text x="580" y="172" font-size="13" fill="#7F1D1D">重置：改动丢失</text>
    <text x="340" y="215" font-size="13" fill="#475569">不再位于任何分支上的提交，在一段时间内仍可以在 reflog 中找到</text>
  </g>
</svg>
`````

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
| remote-tracking branch | 远程跟踪分支 | origin/main |
| bare repository | 裸仓库 | |
| divergent (branches) | 分叉 | |
| feature branch / feature-branch workflow | 功能分支 / 功能分支工作流 | |
| pull request | 拉取请求 | GitHub's Chinese interface |
| fork | 复刻 | GitHub's Chinese interface |
| issue | 议题 | GitHub's Chinese interface |
| code review (the practice) | 代码评审 | |
| review (a pull request) | 审查 | GitHub's Chinese docs; GitHub's buttons stay in English |
| rebase / interactive rebase | 变基 / 交互式变基 | |
| to-do list (of a rebase) | 待办列表 | |
| reset | 重置 | git reset |
| force push | 强制推送 | |
| squash | 压缩 | |
| stash | 贮藏 | as in Pro Git's Chinese edition |
| reflog | 引用日志（reflog） | |
| tag / release | 标签 / 发布 | |
| terminal / command line | 终端 / 命令行 | |
| folder / home folder | 文件夹 / 主文件夹 | |
| editor | 编辑器 | |
| configuration / setting | 配置 / 设置 | |
`````


- [ ] **Step 8: Run the tests to see them pass**

Run: `node --test --test-concurrency=1 "tutorial-sources/git/tests/*.test.mjs"`
Expected: `# tests 56`, `# pass 56`, `# fail 0`.

- [ ] **Step 9: Commit**

```bash
git add tutorial-sources/git/plan/module_06.json tutorial-sources/git/plan/module_07.json tutorial-sources/git/plan/module_08.json tutorial-sources/git/sessions/module_06 tutorial-sources/git/sessions/module_07 tutorial-sources/git/sessions/module_08 tutorial-sources/git/figures tutorial-sources/git/GLOSSARY.md tutorial-sources/git/tests/series-sessions.test.mjs
git commit -m "Git series: Modules 6-8 configuration, sessions, figures and glossary" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Module 6 in English and Chinese

**Files:**
- Create: `tutorial-sources/git/src/en/module_06.md`, `tutorial-sources/git/src/zh/module_06.md`
- Modify: `tutorial-sources/git/tests/lesson-facts.test.mjs`
- Modify (generated): `docs/tutorials/git/`

**Interfaces:**
- Consumes: Task 2's Module 6 sessions and `fig-06-01`. Quiz answer positions are `1, 2, 0, 2, 1, 1, 2` in both languages.
- Produces: a published Module 6.

- [ ] **Step 1: Write the failing test**

Append to `tutorial-sources/git/tests/lesson-facts.test.mjs`:

```js

test('Module 6 tells learners where to put their stand-in server', () => {
  for (const lang of ['en', 'zh']) {
    assert.match(lesson(lang, 6), /`git init --bare \.\.\/server\/recipes\.git`/, lang);
    assert.match(lesson(lang, 6), /`git config user\.name "Sam Lee"`/, `${lang}: Sam's name is set in Sam's clone only`);
  }
  assert.match(lesson('en', 6), /Wherever the pages show `\/srv\/git\/recipes\.git`, type that path instead\./);
  assert.match(lesson('zh', 6), /页面上凡是出现 `\/srv\/git\/recipes\.git` 的地方，请改用这个路径。/);
});
```

Run: `node --test --test-concurrency=1 "tutorial-sources/git/tests/lesson-facts.test.mjs"`
Expected: 1 failing test, with `ENOENT … src/en/module_06.md`.

- [ ] **Step 2: Check the sources the lesson relies on**

The lesson's facts were checked against:
- the [git remote](https://git-scm.com/docs/git-remote), [git fetch](https://git-scm.com/docs/git-fetch), [git pull](https://git-scm.com/docs/git-pull) and [git push](https://git-scm.com/docs/git-push) references;
- GitHub Docs' [Caching your GitHub credentials in Git](https://docs.github.com/en/get-started/git-basics/caching-your-github-credentials-in-git).

GitHub's pages change, so open the GitHub Docs links in the lesson and confirm that the steps still match. If one has changed, update both languages and note it in the commit message.

- [ ] **Step 3: Create the lessons**

`tutorial-sources/git/src/en/module_06.md`:

`````markdown
## What a remote is {#s1}

So far your repository has lived in one folder on one computer. That is enough to keep a history, but not to share it, or to keep a copy safe when a laptop is lost. For both, Git uses **remotes**: other copies of the same repository, somewhere else, that yours can exchange commits with.

Git is *distributed*: every copy of a repository is complete, with the whole history, and no copy is special to Git itself. In practice, a team agrees that one copy, usually on a hosting service such as GitHub, is the shared one that everybody sends work to and takes work from. To your repository, that copy is a remote with a short name. The usual name is **origin**: it is the name `git clone` gives the repository you cloned from, and the name most people choose when they add a remote themselves.

Four commands move work between your repository and a remote:

- `git clone` makes a new local copy of a remote repository, with all its history.
- `git push` sends your new commits to the remote.
- `git fetch` brings the remote's new commits into your repository, without changing your own branches or files.
- `git pull` fetches, and then merges what it fetched into your current branch.

To remember what the remote had, your repository keeps **remote-tracking branches** with names such as `origin/main`: "where `main` was on `origin`, last time I looked". They move only when you fetch, pull or push. Your own `main` moves only when you commit or merge.

::: figure #fig-06-01
Your repository holds your own branches, and remote-tracking branches such as `origin/main` that record what the remote had at your last fetch. `git push` sends commits to the remote; `git fetch` brings them back.
:::

## Your first push {#s2}

A remote does not have to be on another computer. Any repository Git can reach works, including a folder on your own disk, and that is the easiest way to learn. In this module, a **bare repository** stands in for a server. A bare repository has the history but no working tree: nobody edits files in it, so others can push to it safely. By convention its folder name ends in `.git`.

Three commands put your repository on the stand-in server:

- `git init --bare <path>` creates the empty bare repository.
- `git remote add origin <path>` tells your repository about it, under the name `origin`. `git remote -v` lists your remotes and their addresses.
- `git push -u origin main` sends `main` there. `-u` (short for `--set-upstream`) also records `origin/main` as the **upstream** of your `main`, so that later a plain `git push` or `git pull` knows where to go.

On these pages the server lives in a folder called `/srv/git`. You cannot create that folder on your own computer, so make your stand-in next to your recipes folder instead. Inside `recipes`, run `git init --bare ../server/recipes.git`. Git creates the `server` folder and prints the full path of the new repository, for example `/Users/you/server/recipes.git/` or `C:/Users/you/server/recipes.git/`. Wherever the pages show `/srv/git/recipes.git`, type that path instead.

{{SESSION:m06-first-push}}

`git init --bare` reports the new, empty repository. `git remote add` prints nothing, and `git remote -v` then lists `origin` twice: once as the address to fetch from, once as the address to push to. They are normally the same.

`git push -u origin main` reports where it pushed (`To /srv/git/recipes.git`) and what: `* [new branch] main -> main` means that your `main` created a branch called `main` on the remote, which did not exist there before. The last line confirms the upstream. From now on, `git status` compares your branch with it, and says *Your branch is up to date with 'origin/main'*. The graph shows the new label `origin/main` next to `main`, on the same commit.

::: pitfall
If `git init --bare` prints a hint about the branch name `master`, your Git is not yet set to start repositories on `main`. Run `git config --global init.defaultBranch main` as in Module 1, delete the new `server` folder, and run `git init --bare` again.
:::

## Cloning {#s3}

Now someone else joins. Sam has no copy of the recipes yet. `git clone <address>` creates one: it makes a folder named after the repository (here `recipes`, from `recipes.git`), copies every commit into it, checks out the default branch, and sets up `origin` to point back at the address. There is no need for `git init`, `git remote add` or `-u`; cloning does all of it.

In the session, Sam clones in Sam's own folder. On these pages each person has a home folder, `/home/alex` or `/home/sam`, and a session can act as either of them.

::: note title="Two people on one computer"
To follow along as Sam, open a second terminal window. Make a folder for Sam next to your own recipes, for example a folder called `sam` in your home folder (`cd ~`, `mkdir sam`, `cd sam`), and clone there, using the path of your stand-in server. Then, inside Sam's clone, give it Sam's name and email, without `--global` so that they apply to that repository only: `git config user.name "Sam Lee"` and `git config user.email "sam@example.com"`. Use the first window whenever the pages act as Alex, and the second whenever they act as Sam.
:::

{{SESSION:m06-clone}}

`git clone` says what it is doing, `Cloning into 'recipes'...`, and `done.`. Sam's folder now holds the same files, and `git log --oneline` the same commits, with the same hashes as Alex's: a commit is the same commit in every copy.

`git remote -v` shows that the clone already knows its `origin`. `git branch -a` (for *all*) lists remote-tracking branches as well as local ones. Sam has one local branch, `main`, and two entries under `remotes/origin`: the branch `origin/main`, and `origin/HEAD`, which records the remote's default branch. You can ignore `origin/HEAD`; the graphs on these pages leave it out. Sam's `main` already has `origin/main` as its upstream, so Sam can push and pull straight away.

## Fetching and pulling {#s4}

Alex adds a lemon cake recipe and pushes it. How does Sam get it? Not automatically: Git talks to a remote only when you run a command that does. Until then, Sam's repository has no idea that anything has changed.

`git fetch` asks the remote for any commits you do not have yet. It stores them in your repository and moves the remote-tracking branches, such as `origin/main`, to match the remote. It changes nothing else: not your branches, not your files. You can look at what arrived before you decide what to do with it.

`git pull` does both steps at once: it fetches, then merges the upstream branch, here `origin/main`, into your current branch. When your branch has no commits of its own, the merge is a fast-forward, exactly as in Module 4.

{{SESSION:m06-fetch-pull}}

Alex's `git push` shows a different line from the first push: `8bf3c2d..d5392e7  main -> main` means that `main` on the remote moved from `8bf3c2d` to `d5392e7`.

Then look at Sam's two `git status` commands. Before fetching, Git says *Your branch is up to date with 'origin/main'*, although Alex's commit is already on the server. Git compares your branch only with what your repository knows, and Sam's repository has not asked yet. After `git fetch`, which reports `8bf3c2d..d5392e7  main -> origin/main`, the status is *Your branch is behind 'origin/main' by 1 commit, and can be fast-forwarded*.

`git log --oneline main..origin/main` lists the commits that `origin/main` has and `main` does not: the two dots mean "reachable from the right-hand side, but not from the left". The graph shows the same thing: `origin/main` is one commit ahead of `main`. Finally, `git pull` fast-forwards `main`, and `ls` shows `cake.md` in Sam's folder.

::: tip
Fetch whenever you start work, and before you push. It is always safe: it never changes your branches or your files. Then `git status` tells you whether you are ahead, behind or both.
:::

## When a push is rejected {#s5}

Sometimes two people push in turn without fetching in between. In the next session, Alex has pushed the cake recipe, but Sam has not fetched it, and commits a soup recipe on top of the old `main`. Sam's push then fails, because the remote's `main` has a commit that Sam's `main` does not contain. Accepting the push would throw Alex's commit away, so Git refuses it. The remedy is to bring in Alex's work first, merge it, and then push.

Recent versions of Git also ask you to choose, once, how `git pull` should combine your work with the remote's when both have new commits. In this series you merge, as in Module 5. The session shows the question and the answer.

To follow along, commit something as Alex and push it, then, in Sam's window, commit something else without pulling first, and push.

{{SESSION:m06-rejected}}

The rejected push says `! [rejected] main -> main (fetch first)`, and the hints explain why: the remote contains work that you do not have locally. Nothing has been lost or changed on either side.

The first `git pull` then fetches Alex's commit (`8bf3c2d..d5392e7  main -> origin/main`) but stops with *fatal: Need to specify how to reconcile divergent branches*. *Divergent* means that both branches have commits the other lacks, as in a three-way merge. The hints list three settings:

- `pull.rebase false` merges, as you have done since Module 4.
- `pull.rebase true` rebases, which Module 8 explains.
- `pull.ff only` refuses unless a fast-forward is possible.

`git config --global pull.rebase false` chooses merging for all your repositories, so Git will not ask again. The second `git pull` then merges, and `git push` succeeds. On your computer, the merge opens your editor with the message `Merge branch 'main' of` followed by the remote's address; save and close it, as in Module 4. The graph shows the result: a merge commit that joins Sam's soup recipe and Alex's cake recipe, with `main` and `origin/main` on the same commit.

If both people had changed the same lines, the merge would stop with a conflict. You would resolve it exactly as in Module 5, commit, and then push.

## Your repository on GitHub {#s6}

The stand-in server taught you the commands; a hosting service makes the repository reachable from anywhere. This section puts your recipes on GitHub. Its web pages change from time to time, so follow the linked GitHub Docs for the exact buttons. The Git commands stay the same.

1. **Create an account** at github.com, following [Creating an account on GitHub](https://docs.github.com/en/account-and-profile/how-tos/account-management/creating-an-account-on-github). Choose a username you are happy to show: it appears in the address of every repository you own.
2. **Create an empty repository** called `recipes`, following [Creating a new repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-new-repository). Leave it empty: do not add a README, a licence or a `.gitignore`, because your local repository already has history to push. You can make it private if you prefer.
3. **Set up sign-in for Git.** GitHub does not accept your account password for Git commands. The easiest secure option is the [GitHub CLI](https://cli.github.com/): install it, run `gh auth login`, choose GitHub.com and HTTPS, and agree when it offers to sign Git in with your GitHub credentials. Git for Windows includes Git Credential Manager, which opens a browser window to sign you in the first time you push. [Caching your GitHub credentials in Git](https://docs.github.com/en/get-started/git-basics/caching-your-github-credentials-in-git) describes both. Experienced users often [connect with SSH](https://docs.github.com/en/authentication/connecting-to-github-with-ssh) instead.
4. **Point `origin` at GitHub and push.** GitHub shows the repository's address on its page, in the form `https://github.com/<username>/recipes.git`. In your recipes folder, run:

```text
git remote set-url origin https://github.com/<username>/recipes.git
git push -u origin main
```

`git remote set-url` changes the address of an existing remote, so `origin` now means GitHub instead of your stand-in folder. `git push -u` sends your history and sets the upstream, as before. Reload the repository's page on GitHub: your files and commits are there. From now on, `git push`, `git fetch` and `git pull` talk to GitHub.

::: note title="If you want to keep the stand-in"
You can also keep `origin` as it is and add GitHub as a second remote, under another name: `git remote add github https://github.com/<username>/recipes.git`, then `git push -u github main`. A repository can have as many remotes as you like. Module 7 assumes that `origin` is GitHub.
:::

## Exercises {#exercises}

::: exercise #e1 level=1 kind=conceptual minutes=4
**Which one moved?** Your repository has `main` and `origin/main`. For each command, say which of the two can move: `git fetch`, `git pull`, `git commit`, `git push`.
:::

::: solution
- `git fetch` moves only `origin/main`, to where `main` is on the remote.
- `git pull` moves `origin/main` (the fetch), then `main` (the merge).
- `git commit` moves only `main`.
- `git push` moves `main` on the remote, and therefore your `origin/main` too, which records it. Your own `main` stays where it is.
:::

::: exercise #e2 level=1 kind=coding minutes=4
**Clone into a folder of your choice.** As Sam, clone the recipes repository into a folder called `family-recipes` instead of `recipes`.
:::

::: solution
Give `git clone` the folder name after the address:

{{SESSION:m06-e2-solution}}

The folder name is only local: the remote is still called `origin`, and its address is unchanged.
:::

::: exercise #e3 level=2 kind=conceptual minutes=5
**Read the status.** What does each message mean, and what would you run next?

1. *Your branch is ahead of 'origin/main' by 2 commits.*
2. *Your branch is behind 'origin/main' by 1 commit, and can be fast-forwarded.*
3. *Your branch and 'origin/main' have diverged, and have 1 and 1 different commits each, respectively.*
:::

::: solution
1. You have two commits that the remote does not have, as of your last fetch. Run `git push`.
2. The remote has one commit that you do not have, and you have none of your own. Run `git pull`, which fast-forwards.
3. Both sides have a commit the other lacks. Run `git pull`, which merges (resolve any conflict as in Module 5), then `git push`.

All three compare with `origin/main` as your repository last saw it, so run `git fetch` first for an up-to-date answer.
:::

::: exercise #e4 level=1 kind=coding minutes=5
**Share a new branch.** As Alex, create a branch called `soups`, commit a soup recipe on it, and push the branch so that Sam could fetch it. Check that it has an upstream.
:::

::: solution
Push the branch with `-u`, as you did for `main`:

{{SESSION:m06-e4-solution}}

`git branch -vv` (two `v`s) shows each branch's upstream in square brackets: `soups` now tracks `origin/soups`.
:::

::: exercise #e5 level=1 kind=conceptual minutes=3
**Fetch or pull?** You are in the middle of a change on `main` and want to know whether a colleague has pushed anything, without changing your files yet. Which command do you run, and why?
:::

::: solution
`git fetch`. It brings in the colleague's commits and updates `origin/main`, but leaves your branch and your files alone. `git status` and `git log --oneline main..origin/main` then show what arrived. Pull when you are ready to merge it.
:::

::: exercise #e6 level=1 kind=conceptual minutes=4
**A refused password.** Your first push to GitHub asks for a username and password. You type your GitHub password, and the push fails with a message saying that support for password authentication was removed. What is going on, and what should you do?
:::

::: solution
GitHub stopped accepting account passwords for Git operations in 2021. Set up a secure sign-in instead: run `gh auth login` with the GitHub CLI, or let Git Credential Manager sign you in through the browser, as in Section 6. Then push again. Alternatives are a personal access token, typed where the password was asked, or SSH.
:::

## Self-check quiz {#quiz}

```quiz
? What is `origin`?
- [ ] A special branch that every repository has
- [x] The usual name of the remote a repository was cloned from
- [ ] The first commit in a repository
- [ ] GitHub's name for your account
> `git clone` names the remote `origin`, and most people use the same name with `git remote add`.

? What does `git fetch` change in your repository?
- [ ] Your files in the working tree
- [ ] Your current branch
- [x] Only the remote-tracking branches, such as `origin/main`
- [ ] Nothing at all: it only prints what is new
> Fetching stores the new commits and moves `origin/main`; your branches and files stay as they are.

? With `pull.rebase` set to `false`, what does `git pull` do?
- [x] `git fetch`, then a merge of the upstream branch
- [ ] `git push`, then `git fetch`
- [ ] It copies the whole repository again
- [ ] It deletes your local commits and takes the remote's
> A pull is a fetch followed by a merge (or, with other settings, a rebase).

? A push fails with `! [rejected] main -> main (fetch first)`. What does it mean?
- [ ] Your network connection failed.
- [ ] You are not allowed to push to the repository.
- [x] The remote has commits that your branch does not contain.
- [ ] Your commits contain a conflict.
> Pull first, so that your branch contains the remote's commits, then push again.

? What does `-u` add to `git push -u origin main`?
- [ ] It pushes all branches at once.
- [x] It records `origin/main` as the upstream of your `main`.
- [ ] It undoes the previous push.
- [ ] It pushes without asking for a password.
> With an upstream set, a plain `git push` or `git pull` knows where to go, and `git status` compares with it.

? `git status` says *Your branch is up to date with 'origin/main'*. What do you know for certain?
- [ ] Nobody has pushed anything since you last pulled.
- [x] Your branch matches `origin/main` as your repository last saw it.
- [ ] Your work has been backed up on the server.
- [ ] Your working tree has no changes.
> Git compares with its last record of the remote; run `git fetch` to bring that record up to date.

? Which is a good way to let Git sign in to GitHub?
- [ ] Type your GitHub account password when Git asks for one
- [ ] Put your password in the repository's address
- [x] Run `gh auth login`, or use Git Credential Manager
- [ ] Make the repository public, so that no sign-in is needed
> GitHub does not accept account passwords for Git; the GitHub CLI and Git Credential Manager set up a secure sign-in.
```

## Further reading {#reading}

- Scott Chacon and Ben Straub, *Pro Git*, section [2.5: Working with Remotes](https://git-scm.com/book/en/v2/Git-Basics-Working-with-Remotes).
- The reference pages for [git remote](https://git-scm.com/docs/git-remote), [git fetch](https://git-scm.com/docs/git-fetch), [git pull](https://git-scm.com/docs/git-pull) and [git push](https://git-scm.com/docs/git-push).
- GitHub Docs, [Adding locally hosted code to GitHub](https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github) and [About remote repositories](https://docs.github.com/en/get-started/git-basics/about-remote-repositories).
`````

`tutorial-sources/git/src/zh/module_06.md`:

`````markdown
## 什么是远程仓库 {#s1}

到目前为止，你的仓库只存在于一台电脑上的一个文件夹里。这足以保存历史，却无法与人共享，笔记本丢了也无法保住一份副本。为了这两件事，Git 使用**远程仓库**（remote）：同一个仓库在别处的其他副本，你的仓库可以与它们交换提交。

Git 是*分布式*的：仓库的每一份副本都是完整的，带有全部历史，对 Git 本身而言没有哪份副本是特殊的。实际工作中，团队会约定其中一份（通常放在 GitHub 这样的托管服务上）作为共享副本，大家都把工作发送到那里，也从那里取回工作。对你的仓库来说，那份副本就是一个有简短名字的远程仓库。最常用的名字是 **origin**：`git clone` 会给克隆来源的仓库起这个名字，大多数人自己添加远程仓库时也选用它。

有四条命令在你的仓库和远程仓库之间传递工作：

- `git clone` 为一个远程仓库创建新的本地副本，包含它的全部历史。
- `git push` 把你的新提交发送到远程仓库。
- `git fetch` 把远程仓库的新提交取回你的仓库，但不改变你自己的分支和文件。
- `git pull` 先获取，再把获取到的内容合并到你当前的分支。

为了记住远程仓库里有什么，你的仓库会保存一些**远程跟踪分支**（remote-tracking branch），名字类似 `origin/main`，意思是“上次查看时，`main` 在 `origin` 上的位置”。它们只在你获取、拉取或推送时移动。你自己的 `main` 只在你提交或合并时移动。

::: figure #fig-06-01
你的仓库中既有你自己的分支，也有 `origin/main` 这样的远程跟踪分支，后者记录了你上次获取时远程仓库的状态。`git push` 把提交发送到远程仓库；`git fetch` 把提交取回来。
:::

## 第一次推送 {#s2}

远程仓库不一定在另一台电脑上。只要 Git 能访问到的仓库都可以，包括你自己磁盘上的一个文件夹，而这正是最容易上手的学习方式。在本模块中，一个**裸仓库**（bare repository）充当服务器。裸仓库只有历史，没有工作区：没有人在里面编辑文件，所以别人可以安全地向它推送。按照惯例，它的文件夹名以 `.git` 结尾。

三条命令把你的仓库放到这个替身服务器上：

- `git init --bare <path>` 创建空的裸仓库。
- `git remote add origin <path>` 以 `origin` 这个名字把它告诉你的仓库。`git remote -v` 列出你的远程仓库及其地址。
- `git push -u origin main` 把 `main` 推送过去。`-u`（`--set-upstream` 的简写）还会把 `origin/main` 记录为你的 `main` 的**上游**（upstream），这样以后直接运行 `git push` 或 `git pull` 时，Git 就知道该去哪里。

在本系列页面中，服务器位于一个名为 `/srv/git` 的文件夹。你无法在自己的电脑上创建这个文件夹，所以请把替身放在你的 recipes 文件夹旁边。在 `recipes` 中运行 `git init --bare ../server/recipes.git`。Git 会创建 `server` 文件夹，并打印新仓库的完整路径，例如 `/Users/you/server/recipes.git/` 或 `C:/Users/you/server/recipes.git/`。页面上凡是出现 `/srv/git/recipes.git` 的地方，请改用这个路径。

{{SESSION:m06-first-push}}

`git init --bare` 报告创建了一个新的空仓库。`git remote add` 什么也不打印，随后 `git remote -v` 把 `origin` 列出两次：一次作为获取的地址，一次作为推送的地址。两者通常相同。

`git push -u origin main` 报告了推送的目的地（`To /srv/git/recipes.git`）以及推送的内容：`* [new branch] main -> main` 表示你的 `main` 在远程仓库上创建了一个名为 `main` 的分支，那里之前没有这个分支。最后一行确认了上游。从现在起，`git status` 会与上游比较，并显示 *Your branch is up to date with 'origin/main'*。提交图在 `main` 旁边显示了新标签 `origin/main`，两者位于同一次提交上。

::: pitfall
如果 `git init --bare` 打印了关于分支名 `master` 的提示，说明你的 Git 还没有设置为新仓库从 `main` 开始。请像第 1 模块那样运行 `git config --global init.defaultBranch main`，删除新建的 `server` 文件夹，然后重新运行 `git init --bare`。
:::

## 克隆 {#s3}

现在又有人加入了。Sam 还没有食谱的副本。`git clone <address>` 会创建一份：它新建一个以仓库命名的文件夹（这里由 `recipes.git` 得到 `recipes`），把所有提交复制进去，检出默认分支，并把 `origin` 设置为指回这个地址。不需要 `git init`、`git remote add` 或 `-u`；克隆会把这些都做好。

在这个动手环节中，Sam 在自己的文件夹里克隆。在本系列页面中，每个人都有一个主文件夹，即 `/home/alex` 或 `/home/sam`，动手环节可以以其中任何一人的身份操作。

::: note title="一台电脑扮演两个人"
要以 Sam 的身份跟着操作，请打开第二个终端窗口。在你自己的 recipes 旁边为 Sam 建一个文件夹，例如在主文件夹中建一个名为 `sam` 的文件夹（`cd ~`、`mkdir sam`、`cd sam`），然后在那里用你的替身服务器的路径进行克隆。接着，在 Sam 的克隆中设置 Sam 的姓名和邮箱，不加 `--global`，使它们只对这个仓库生效：`git config user.name "Sam Lee"` 和 `git config user.email "sam@example.com"`。页面以 Alex 的身份操作时使用第一个窗口，以 Sam 的身份操作时使用第二个窗口。
:::

{{SESSION:m06-clone}}

`git clone` 说明了它正在做什么：`Cloning into 'recipes'...`，然后是 `done.`。Sam 的文件夹中现在有同样的文件，`git log --oneline` 也显示同样的提交，哈希与 Alex 的完全相同：同一次提交在每份副本中都是同一次提交。

`git remote -v` 显示克隆已经知道自己的 `origin`。`git branch -a`（*a* 表示 all，全部）除了本地分支，还会列出远程跟踪分支。Sam 有一个本地分支 `main`，以及 `remotes/origin` 下的两项：分支 `origin/main`，以及记录远程仓库默认分支的 `origin/HEAD`。你可以忽略 `origin/HEAD`；本系列的提交图也不画它。Sam 的 `main` 已经把 `origin/main` 作为上游，所以 Sam 可以直接推送和拉取。

## 获取与拉取 {#s4}

Alex 加入了一份柠檬蛋糕食谱并推送了它。Sam 怎样才能拿到呢？不会自动拿到：只有当你运行需要与远程仓库通信的命令时，Git 才会与它通信。在那之前，Sam 的仓库完全不知道有什么变化。

`git fetch` 向远程仓库索要你还没有的提交。它把这些提交存进你的仓库，并移动 `origin/main` 这样的远程跟踪分支，使其与远程仓库一致。除此之外它什么也不改：不改你的分支，也不改你的文件。你可以先看看取回了什么，再决定怎么处理。

`git pull` 一次完成两步：先获取，再把上游分支（这里是 `origin/main`）合并到你当前的分支。如果你的分支没有自己的新提交，这次合并就是快进，和第 4 模块中一样。

{{SESSION:m06-fetch-pull}}

Alex 的 `git push` 显示的一行与第一次推送不同：`8bf3c2d..d5392e7  main -> main` 表示远程仓库上的 `main` 从 `8bf3c2d` 移到了 `d5392e7`。

再看 Sam 的两次 `git status`。获取之前，Git 显示 *Your branch is up to date with 'origin/main'*，尽管 Alex 的提交已经在服务器上了。Git 只会把你的分支与你的仓库所知道的情况进行比较，而 Sam 的仓库还没有去问过。运行 `git fetch`（它报告 `8bf3c2d..d5392e7  main -> origin/main`）之后，状态变成了 *Your branch is behind 'origin/main' by 1 commit, and can be fast-forwarded*。

`git log --oneline main..origin/main` 列出 `origin/main` 有而 `main` 没有的提交：两个点的意思是“从右边能到达、从左边不能到达”。提交图显示了同样的情况：`origin/main` 比 `main` 领先一次提交。最后，`git pull` 快进了 `main`，`ls` 显示 Sam 的文件夹中有了 `cake.md`。

::: tip
每次开始工作时、每次推送之前都先获取一下。这总是安全的：它从不改变你的分支或文件。然后 `git status` 会告诉你，你是领先、落后，还是两者都有。
:::

## 推送被拒绝时 {#s5}

有时两个人先后推送，中间却没有获取。在下一个动手环节中，Alex 已经推送了蛋糕食谱，但 Sam 没有获取，就在旧的 `main` 之上提交了一份汤的食谱。于是 Sam 的推送失败了，因为远程仓库的 `main` 上有一次 Sam 的 `main` 所不包含的提交。接受这次推送就会丢掉 Alex 的提交，所以 Git 拒绝了它。补救办法是先把 Alex 的工作取回来并合并，然后再推送。

较新版本的 Git 还会请你做一次选择：当双方都有新提交时，`git pull` 应该怎样把你的工作与远程仓库的工作结合起来。在本系列中，你选择合并，和第 5 模块一样。这个动手环节展示了这个问题及其答案。

要跟着操作，请以 Alex 的身份提交一些内容并推送，然后在 Sam 的窗口中不先拉取就提交另外一些内容，再推送。

{{SESSION:m06-rejected}}

被拒绝的推送显示 `! [rejected] main -> main (fetch first)`，提示信息解释了原因：远程仓库中有你本地没有的工作。双方都没有丢失或改变任何东西。

接着，第一次 `git pull` 取回了 Alex 的提交（`8bf3c2d..d5392e7  main -> origin/main`），但随后停了下来，显示 *fatal: Need to specify how to reconcile divergent branches*。*Divergent*（分叉）是指两个分支都有对方所没有的提交，就像三方合并那样。提示列出了三种设置：

- `pull.rebase false` 进行合并，就是你从第 4 模块以来一直在做的。
- `pull.rebase true` 进行变基（rebase），第 8 模块会解释。
- `pull.ff only` 只在可以快进时才拉取，否则拒绝。

`git config --global pull.rebase false` 为你的所有仓库选择合并，这样 Git 就不会再问了。第二次 `git pull` 随即完成合并，`git push` 也成功了。在你的电脑上，这次合并会打开编辑器，说明是 `Merge branch 'main' of` 后面跟着远程仓库的地址；像第 4 模块那样保存并关闭即可。提交图显示了结果：一次合并提交把 Sam 的汤食谱和 Alex 的蛋糕食谱连在一起，`main` 和 `origin/main` 位于同一次提交上。

如果两个人改动了相同的行，合并就会因冲突而停下。你要完全像第 5 模块那样解决冲突、提交，然后再推送。

## 把仓库放到 GitHub 上 {#s6}

替身服务器教会了你这些命令；托管服务则让仓库在任何地方都能访问。本节把你的食谱放到 GitHub 上。GitHub 的网页时有变化，所以具体的按钮请参照链接中的 GitHub 文档。Git 命令保持不变。

1. **创建账号**：在 github.com 上按照[在 GitHub 上创建账户](https://docs.github.com/zh/account-and-profile/how-tos/account-management/creating-an-account-on-github)操作。选一个你愿意公开的用户名：它会出现在你拥有的每个仓库的地址中。
2. **创建一个空仓库**，命名为 `recipes`，按照[创建新仓库](https://docs.github.com/zh/repositories/creating-and-managing-repositories/creating-a-new-repository)操作。保持它为空：不要添加 README、许可证或 `.gitignore`，因为你的本地仓库已经有要推送的历史了。如果愿意，你可以把它设为私有。
3. **为 Git 设置登录。** GitHub 不接受用你的账户密码执行 Git 命令。最简单的安全做法是使用 [GitHub CLI](https://cli.github.com/)：安装它，运行 `gh auth login`，选择 GitHub.com 和 HTTPS，并在它询问是否用你的 GitHub 凭据为 Git 登录时选择同意。Git for Windows 自带 Git Credential Manager，你第一次推送时，它会打开浏览器窗口让你登录。[在 Git 中缓存 GitHub 凭据](https://docs.github.com/zh/get-started/git-basics/caching-your-github-credentials-in-git)介绍了这两种方式。有经验的用户常常改用 [SSH 连接](https://docs.github.com/zh/authentication/connecting-to-github-with-ssh)。
4. **把 `origin` 指向 GitHub 并推送。** GitHub 在仓库页面上显示仓库的地址，形如 `https://github.com/<username>/recipes.git`。在你的 recipes 文件夹中运行：

```text
git remote set-url origin https://github.com/<username>/recipes.git
git push -u origin main
```

`git remote set-url` 修改一个已有远程仓库的地址，于是 `origin` 现在指的是 GitHub，而不再是你的替身文件夹。`git push -u` 像之前一样发送你的历史并设置上游。刷新 GitHub 上的仓库页面：你的文件和提交都在那里了。从现在起，`git push`、`git fetch` 和 `git pull` 都与 GitHub 通信。

::: note title="如果你想保留替身"
你也可以保持 `origin` 不变，把 GitHub 以另一个名字添加为第二个远程仓库：`git remote add github https://github.com/<username>/recipes.git`，然后运行 `git push -u github main`。一个仓库想要多少个远程仓库都可以。第 7 模块假定 `origin` 是 GitHub。
:::

## 练习 {#exercises}

::: exercise #e1 level=1 kind=conceptual minutes=4
**哪一个移动了？** 你的仓库有 `main` 和 `origin/main`。对于下面每条命令，说出两者中哪个可能移动：`git fetch`、`git pull`、`git commit`、`git push`。
:::

::: solution
- `git fetch` 只移动 `origin/main`，使其指向远程仓库上 `main` 的位置。
- `git pull` 先移动 `origin/main`（获取），再移动 `main`（合并）。
- `git commit` 只移动 `main`。
- `git push` 移动远程仓库上的 `main`，因此也会移动记录它的 `origin/main`。你自己的 `main` 保持不动。
:::

::: exercise #e2 level=1 kind=coding minutes=4
**克隆到你选择的文件夹。** 以 Sam 的身份把食谱仓库克隆到名为 `family-recipes` 的文件夹，而不是 `recipes`。
:::

::: solution
在地址后面给 `git clone` 加上文件夹名：

{{SESSION:m06-e2-solution}}

文件夹名只在本地有意义：远程仓库仍叫 `origin`，地址也没有变。
:::

::: exercise #e3 level=2 kind=conceptual minutes=5
**读懂状态。** 下面每条信息是什么意思？接下来你会运行什么？

1. *Your branch is ahead of 'origin/main' by 2 commits.*
2. *Your branch is behind 'origin/main' by 1 commit, and can be fast-forwarded.*
3. *Your branch and 'origin/main' have diverged, and have 1 and 1 different commits each, respectively.*
:::

::: solution
1. 你有两次远程仓库所没有的提交（以你上次获取时为准）。运行 `git push`。
2. 远程仓库有一次你所没有的提交，而你没有自己的新提交。运行 `git pull`，它会快进。
3. 双方都有对方所没有的提交。运行 `git pull`，它会进行合并（如有冲突，像第 5 模块那样解决），然后运行 `git push`。

这三条都是与你的仓库上次看到的 `origin/main` 比较，所以要得到最新的结论，请先运行 `git fetch`。
:::

::: exercise #e4 level=1 kind=coding minutes=5
**分享一个新分支。** 以 Alex 的身份创建名为 `soups` 的分支，在上面提交一份汤的食谱，并推送这个分支，让 Sam 能够获取它。检查它是否设置了上游。
:::

::: solution
像推送 `main` 时那样，用 `-u` 推送这个分支：

{{SESSION:m06-e4-solution}}

`git branch -vv`（两个 `v`）在方括号中显示每个分支的上游：`soups` 现在跟踪 `origin/soups`。
:::

::: exercise #e5 level=1 kind=conceptual minutes=3
**获取还是拉取？** 你正在 `main` 上做一处改动，想知道同事是否推送了什么，但暂时不想改变你的文件。你会运行哪条命令？为什么？
:::

::: solution
`git fetch`。它取回同事的提交并更新 `origin/main`，但不动你的分支和文件。随后 `git status` 和 `git log --oneline main..origin/main` 会显示取回了什么。等你准备好合并时再拉取。
:::

::: exercise #e6 level=1 kind=conceptual minutes=4
**被拒绝的密码。** 你第一次向 GitHub 推送时，Git 要求输入用户名和密码。你输入了 GitHub 密码，推送却失败了，提示说已不再支持密码认证。这是怎么回事？你应该怎么做？
:::

::: solution
GitHub 从 2021 年起不再接受用账户密码执行 Git 操作。请改用安全的登录方式：用 GitHub CLI 运行 `gh auth login`，或者像第 6 节那样让 Git Credential Manager 通过浏览器为你登录。然后再次推送。其他做法还有：在要求输入密码的地方输入个人访问令牌（personal access token），或者使用 SSH。
:::

## 自测 {#quiz}

```quiz
? `origin` 是什么？
- [ ] 每个仓库都有的一个特殊分支
- [x] 仓库克隆来源的远程仓库的常用名字
- [ ] 仓库中的第一次提交
- [ ] GitHub 对你账户的称呼
> `git clone` 把远程仓库命名为 `origin`，大多数人用 `git remote add` 时也用这个名字。

? `git fetch` 会改变你仓库中的什么？
- [ ] 工作区中的文件
- [ ] 你当前的分支
- [x] 只改变 `origin/main` 这样的远程跟踪分支
- [ ] 什么都不改变：它只打印有哪些新内容
> 获取会存下新提交并移动 `origin/main`；你的分支和文件保持原样。

? 当 `pull.rebase` 设为 `false` 时，`git pull` 做什么？
- [x] 先 `git fetch`，再合并上游分支
- [ ] 先 `git push`，再 `git fetch`
- [ ] 重新复制整个仓库
- [ ] 删除你的本地提交，换成远程仓库的提交
> 拉取就是获取之后再合并（在其他设置下则是变基）。

? 推送失败并显示 `! [rejected] main -> main (fetch first)`。这是什么意思？
- [ ] 你的网络连接失败了。
- [ ] 你无权向这个仓库推送。
- [x] 远程仓库中有你的分支所不包含的提交。
- [ ] 你的提交中有冲突。
> 先拉取，让你的分支包含远程仓库的提交，然后再推送。

? `git push -u origin main` 中的 `-u` 起什么作用？
- [ ] 一次推送所有分支。
- [x] 把 `origin/main` 记录为你的 `main` 的上游。
- [ ] 撤销上一次推送。
- [ ] 推送时不要求输入密码。
> 设置了上游之后，直接运行 `git push` 或 `git pull` 时 Git 就知道去哪里，`git status` 也会与它比较。

? `git status` 显示 *Your branch is up to date with 'origin/main'*。你能确定什么？
- [ ] 自你上次拉取以来，没有人推送过任何东西。
- [x] 你的分支与你的仓库上次看到的 `origin/main` 一致。
- [ ] 你的工作已经备份到服务器上了。
- [ ] 你的工作区没有任何改动。
> Git 是与它对远程仓库的最新记录比较；运行 `git fetch` 才能更新这份记录。

? 下面哪种方式适合让 Git 登录 GitHub？
- [ ] 在 Git 要求时输入你的 GitHub 账户密码
- [ ] 把密码写进仓库地址里
- [x] 运行 `gh auth login`，或者使用 Git Credential Manager
- [ ] 把仓库设为公开，这样就不需要登录
> GitHub 不接受用账户密码执行 Git 操作；GitHub CLI 和 Git Credential Manager 会设置安全的登录方式。
```

## 延伸阅读 {#reading}

- Scott Chacon 和 Ben Straub，《Pro Git》，第 [2.5 节：远程仓库的使用](https://git-scm.com/book/zh/v2/Git-基础-远程仓库的使用)。
- [git remote](https://git-scm.com/docs/git-remote)、[git fetch](https://git-scm.com/docs/git-fetch)、[git pull](https://git-scm.com/docs/git-pull) 和 [git push](https://git-scm.com/docs/git-push) 的参考页面。
- GitHub 文档：[将本地托管的代码添加到 GitHub](https://docs.github.com/zh/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github) 和[关于远程仓库](https://docs.github.com/zh/get-started/git-basics/about-remote-repositories)。
`````


- [ ] **Step 4: Build, test and read**

```bash
node --test --test-concurrency=1 "tutorial-sources/git/tests/*.test.mjs"
node tutorial-sources/git/build.mjs
```

Expected:
- `# tests 57`, `# pass 57`;
- `Built modules 01, 02, 03, 04, 05, 06 in English and Chinese; ran 35 sessions with git version 2.50.1 (Apple Git-155).`

Read both Module 6 pages through a local server. Check that:
- the figure appears in both languages;
- "Now acting as Sam Lee" appears only before Sam's steps;
- the `shared` graph shows the merge commit `Merge branch 'main' of /srv/git/recipes`.

- [ ] **Step 5: Commit**

```bash
git add tutorial-sources/git/src/en/module_06.md tutorial-sources/git/src/zh/module_06.md tutorial-sources/git/tests/lesson-facts.test.mjs docs/tutorials/git
git commit -m "Git series: Module 6 in English and Chinese" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Module 7 in English and Chinese

**Files:**
- Create: `tutorial-sources/git/src/en/module_07.md`, `tutorial-sources/git/src/zh/module_07.md`
- Modify: `tutorial-sources/git/tests/lesson-facts.test.mjs`
- Modify (generated): `docs/tutorials/git/`

**Interfaces:**
- Consumes: Task 2's Module 7 sessions and figures. Quiz answer positions are `1, 1, 1, 2, 1, 0, 2` in both languages.
- Produces: a published Module 7.

- [ ] **Step 1: Write the failing test**

Append to `tutorial-sources/git/tests/lesson-facts.test.mjs`:

```js

test('Module 7 says to prune before deleting a squash-merged branch', () => {
  assert.match(lesson('en', 7), /Prune first: while `origin\/add-soups` still exists in your repository, `-d` checks against it/);
  assert.match(lesson('zh', 7), /请先清理：只要你的仓库中还存在 `origin\/add-soups`，`-d` 就会以它为准/);
});
```

Run: `node --test --test-concurrency=1 "tutorial-sources/git/tests/lesson-facts.test.mjs"`
Expected: 1 failing test, with `ENOENT … src/en/module_07.md`.

- [ ] **Step 2: Check the sources the lesson relies on**

Open the GitHub Docs links in the lesson, about pull requests, reviews, merging, issues and forks, and confirm that the steps and button names still match. The lesson uses canonical addresses, which returned HTTP 200 without redirects when it was written.

- [ ] **Step 3: Create the lessons**

`tutorial-sources/git/src/en/module_07.md`:

`````markdown
## How teams share work {#s1}

In Module 6, two people pushed straight to `main`, and one push was rejected because the other had got there first. That works for two careful people, but not for a team. Most teams follow a few simple rules instead:

- `main` always works. Nobody commits to it directly.
- Every change, however small, is made on its own branch, called a **feature branch**.
- When a change is ready, its author proposes it with a **pull request**: a page on GitHub that shows the branch's commits and changes, and invites others to review them.
- After review, the pull request is merged into `main`, and the branch is deleted.

This is the **feature-branch workflow**. Its strength is that every change is looked at before it reaches `main`, and that several people can work at once without stepping on each other.

::: figure #fig-07-01
The life of a pull request: a branch is created, committed to and pushed; a pull request proposes it; review may add commits; the branch is merged into `main` on GitHub, and everyone tidies up.
:::

There are two ways to share a project on GitHub. In a **shared repository**, the team members have permission to push branches to the same repository, and pull requests go from one branch of it to another. Companies and small teams usually work this way. In open-source projects, most contributors cannot push to the project at all. Each makes a **fork**, a personal copy of the repository on GitHub, pushes to it, and opens pull requests from the fork to the original. Section 7 covers forks; until then, everyone shares one repository.

GitHub also has **issues**: a list of bugs, ideas and tasks for each repository. A pull request often says which issue it resolves, and GitHub can close the issue automatically when the pull request is merged.

## A branch for each change {#s2}

Alex wants to add a soup recipe. Instead of committing on `main`, Alex starts a branch, commits on it, and pushes the branch to the shared repository with `git push -u`, exactly as in Module 6's Exercise 4.

The sessions in this module use the stand-in server from Module 6, with Alex and Sam each in their own clone. To follow along, use your GitHub repository from Module 6: your own recipes folder plays Alex. For Sam, clone the same GitHub repository into Sam's folder, or point Sam's existing clone at it with `git remote set-url origin` and the GitHub address. On GitHub, both people are you, which works for everything in this module: you can open, review and merge your own pull requests.

{{SESSION:m07-feature-branch}}

The push creates the branch `add-soups` on the server, and `-u` makes `origin/add-soups` its upstream. `git branch -vv` shows both local branches with their upstreams: `add-soups` with the new commit, `main` unchanged at `8bf3c2d`.

Name the branch after the change, short and specific, as Module 4 advised: `add-soups`, `fix-oven-temperature`. The name appears on the pull request, so others read it too.

## Opening a pull request {#s3}

A pull request is a GitHub feature, not a Git command, so this section has no session. Follow the steps on your own repository; GitHub Docs' [Creating a pull request](https://docs.github.com/en/pull-requests/how-tos/create-pull-requests/creating-a-pull-request) shows the current pages.

1. Open your repository on GitHub. Shortly after a push, GitHub offers a **Compare & pull request** button for the branch. Otherwise, go to the **Pull requests** tab and choose **New pull request**.
2. Choose the **base** branch, the one the change should go into (`main`), and the **compare** branch, the one with the change (`add-soups`). GitHub shows the commits and the changes that the pull request would bring.
3. Write a **title** that says what the change does, such as "Add a tomato soup recipe", and a **description** that says why, and anything a reviewer should know.
4. If the change resolves an issue, write `Closes #` followed by the issue number in the description, for example `Closes #4`. When the pull request is merged into the default branch, GitHub closes the issue. [Linking a pull request to an issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue) lists the other keywords.
5. Choose **Create pull request**.

The pull request's page has three tabs: **Conversation**, for the description and comments; **Commits**, listing the branch's commits; and **Files changed**, showing the diff in the same `+` and `-` form as `git diff`. The pull request follows the branch: when you push more commits to `add-soups`, they appear in it automatically.

::: tip
Keep pull requests small. A pull request that does one thing is reviewed quickly and carefully; one that changes thirty files waits for days and gets a quick "looks good". If a change is large, split it into several branches that build on each other.
:::

## Reviewing a pull request {#s4}

Sam is asked to review. Most reviews happen on GitHub: in the **Files changed** tab, you can comment on any line, and then submit the review with **Comment**, **Approve** or **Request changes**. GitHub Docs' [Reviewing proposed changes in a pull request](https://docs.github.com/en/pull-requests/how-tos/review-pull-requests/reviewing-proposed-changes-in-a-pull-request) shows the steps.

Sometimes a reviewer wants the branch on their own computer: to try the change, or to read it in their own editor. In the session, Sam fetches, switches to `add-soups`, and lists what the branch adds.

{{SESSION:m07-review}}

`git fetch` reports the new branch: `* [new branch] add-soups -> origin/add-soups`. Sam has no local `add-soups` yet, but `git switch add-soups` notices that `origin/add-soups` exists, creates a local branch from it, and sets it up to track it, all in one step.

Two commands then show what the branch adds:

- `git log --oneline main..add-soups` lists the commits on `add-soups` that are not on `main`, here the one soup commit. Two dots, as in Module 6, mean "reachable from the right-hand side, but not from the left".
- `git diff main...add-soups`, with three dots, shows the changes made on `add-soups` since it split from `main`, ignoring anything that has happened on `main` since. That is exactly what GitHub shows under **Files changed**.

Suppose that Sam's review asks for the ingredients. Alex answers by changing the file on the same branch, committing and pushing again. Nothing else is needed: the pull request picks up the new commit. Sam then pulls to get it.

{{SESSION:m07-address-review}}

Alex's push moves `add-soups` on the server from `22abb2e` to `b9835b7`, and Sam's `git pull` fast-forwards Sam's copy of the branch. `git log --oneline main..add-soups` now lists both commits of the pull request.

::: note title="Fix or rewrite?"
Answer a review by adding commits, not by amending the ones already pushed: other people may have fetched them, and new commits let reviewers see exactly what changed since their last look. If you want a tidier history before merging, Module 8 shows how to squash commits, and GitHub can squash a pull request when it merges it.
:::

## Merging and tidying up {#s5}

Once the pull request is approved, someone with permission merges it with the **Merge pull request** button. By default GitHub makes a merge commit on `main`, exactly like `git merge --no-ff`: a commit with two parents, even if a fast-forward would have been possible, so that the history shows the whole branch as one unit. Its message reads "Merge pull request #1 from" followed by the branch. GitHub then offers a **Delete branch** button, which deletes the branch on GitHub; your local branch stays. [Merging a pull request](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/merging-a-pull-request) describes the button and its other options, *Squash and merge* and *Rebase and merge*.

In the session, Sam has merged the branch on the server and deleted it there, as the buttons would. Alex now brings `main` up to date and tidies up.

{{SESSION:m07-after-merge}}

- `git switch main` says that Alex's `main` is up to date with `origin/main`, but that refers to Alex's last fetch. `git pull` then fetches the merge and fast-forwards `main` to it.
- `git branch -d add-soups` deletes Alex's local branch. It succeeds without complaint, because `main` now contains its commits.
- `git fetch --prune` removes remote-tracking branches whose branch no longer exists on the server: `- [deleted] (none) -> origin/add-soups`. Without `--prune`, `origin/add-soups` would stay in Alex's repository indefinitely.
- `git branch -a` confirms the result: only `main` and `origin/main` remain.

The graph shows the merge commit joining the soup commit into `main`. In the session it says `Merge branch 'add-soups'`, because Sam merged with `git merge --no-ff`; on GitHub the message names the pull request instead.

::: tip
Run `git config --global fetch.prune true` once, and every `git fetch` and `git pull` will prune automatically.
:::

## Keeping a branch up to date {#s6}

While you work on a branch, `main` moves on: other pull requests are merged. Before you ask for a review, and again if GitHub says that the branch is out of date or has conflicts, bring the latest `main` into your branch. Fetch, then merge `origin/main` into your branch, and push.

In the session, Alex is working on `add-breads`, which is already pushed, and Sam's README change has meanwhile reached `main`. To follow along, push a branch with a commit, then, on GitHub or as Sam, add a commit to `main`.

{{SESSION:m07-update-branch}}

Look at `git status` after the fetch: *Your branch is up to date with 'origin/add-breads'*. That is true, but beside the point: a branch's status compares it with its own upstream, not with `main`. The first graph shows the real situation: `origin/main` has a commit that `add-breads` lacks.

`git merge origin/main` merges it in, with a merge commit whose message is `Merge remote-tracking branch 'origin/main' into add-breads`, and `git push` updates the pull request. The second graph shows `add-breads` with both lines of history. Merging `origin/main` rather than your local `main` saves you from updating `main` first.

If the merge stops with a conflict, resolve it as in Module 5, commit and push. GitHub's **Update branch** button, where it appears, does the same merge on GitHub. Module 8 shows rebasing, an alternative that some teams prefer.

## Contributing through a fork {#s7}

To contribute to a project you cannot push to, such as most open-source projects, you work through a fork:

1. On the project's GitHub page, choose **Fork**. GitHub creates your own copy of the repository, under your account.
2. Clone your fork. In your clone, `origin` is your fork, which you can push to.
3. Add the original project as a second remote, by convention called **upstream**, so that you can fetch its new commits.
4. Work on a branch as usual, push it to `origin`, and open a pull request from your fork's branch to the original project's `main`. GitHub offers this when you open a pull request on either repository.
5. To keep your fork's `main` up to date, fetch `upstream`, merge `upstream/main` into your `main`, and push it to `origin`. GitHub's **Sync fork** button does the same on GitHub.

::: figure #fig-07-02
Working through a fork. You cannot push to the original project, `upstream`. You push to your fork, `origin`, and open pull requests from it; you fetch new work from `upstream`.
:::

In the session, the server holds the original repository and Sam's fork of it, `sam-recipes.git`, which Sam can push to. Sam clones the fork and adds `upstream`. Then Alex, who maintains the original, adds a cake recipe, and Sam brings it into the fork.

{{SESSION:m07-fork}}

`git remote -v` now lists two remotes: `origin`, Sam's fork, and `upstream`, the original. `git fetch upstream` brings in the original's `main` as `upstream/main`, `git merge upstream/main` fast-forwards Sam's `main` to it, and `git push` updates the fork, because Sam's `main` still pushes to `origin`.

To practise on GitHub, fork the practice repository [octocat/Spoon-Knife](https://github.com/octocat/Spoon-Knife), as GitHub Docs' [Fork a repository](https://docs.github.com/en/pull-requests/how-tos/work-with-forks/fork-a-repo) suggests, then clone your fork and add `https://github.com/octocat/Spoon-Knife.git` as `upstream`.

## Exercises {#exercises}

::: exercise #e1 level=1 kind=conceptual minutes=4
**Put the steps in order.** Arrange these steps of the feature-branch workflow: merge the pull request; `git push -u origin fix-typo`; `git switch -c fix-typo`; open a pull request; `git switch main` and `git pull`; commit the fix; answer the review with another commit; `git branch -d fix-typo`.
:::

::: solution
`git switch -c fix-typo`; commit the fix; `git push -u origin fix-typo`; open a pull request; answer the review with another commit (and push it); merge the pull request; `git switch main` and `git pull`; `git branch -d fix-typo`.
:::

::: exercise #e2 level=2 kind=conceptual minutes=5
**Two dots or three?** `main` has gained two commits since `add-soups` split from it, and `add-soups` has one commit of its own. What does `git log --oneline main..add-soups` list? What does `git diff main...add-soups` show, and why would `git diff main add-soups`, without dots, mislead a reviewer?
:::

::: solution
`main..add-soups` lists the one commit on `add-soups` that `main` does not have. `main...add-soups` shows only the changes made on `add-soups` since the split, which is what the pull request would add. `git diff main add-soups` compares the two newest commits directly, so `main`'s two new commits would appear as if `add-soups` removed them, although the branch never touched them.
:::

::: exercise #e3 level=2 kind=coding minutes=6
**Add to a colleague's branch.** Alex's pull request for `add-soups` is missing a note on how many the soup serves. As Sam, add that to the branch, so that the pull request includes it, and let Alex get the change. To follow along, push a branch from Alex's window first.
:::

::: solution
Fetch the branch, switch to it, commit and push; Alex then pulls:

{{SESSION:m07-e3-solution}}

Anyone with push access can add commits to a pull request's branch. Agree on it first, so that two people do not edit the same lines at once.
:::

::: exercise #e4 level=1 kind=conceptual minutes=4
**Write the pull request.** Your branch adds a soup recipe, which issue #4 asked for. Write a title and a description, so that merging the pull request closes the issue.
:::

::: solution
For example, title: *Add a tomato soup recipe*. Description: *Adds `soup.md` with the ingredients and method we used last week. Closes #4.* Any wording works, as long as the description contains `Closes #4` (or `Fixes #4`, or `Resolves #4`).
:::

::: exercise #e5 level=2 kind=coding minutes=6
**A branch that will not delete.** Your pull request was merged with *Squash and merge*: GitHub added one new commit to `main` containing all the branch's changes, and deleted the branch. After `git pull`, `git branch -d add-soups` refuses, saying that the branch is not fully merged. Check that nothing would be lost, and delete the branch. To follow along, merge a pull request on GitHub with *Squash and merge*.
:::

::: solution
Squashing copies the branch's changes into a new commit, so `main` never contains the branch's own commits, and `-d` cannot tell that the work is in `main`. Compare the contents instead:

{{SESSION:m07-e5-solution}}

`git diff main add-soups` prints nothing: the files are identical, so `git branch -D` loses nothing. Prune first: while `origin/add-soups` still exists in your repository, `-d` checks against it and deletes the branch with only a warning.
:::

::: exercise #e6 level=1 kind=conceptual minutes=5
**Fork or branch?** For each situation, would you push a branch to the repository, or work through a fork?

1. You are a member of the team that owns the repository.
2. You found a typo in the documentation of a popular open-source library.
3. You want to experiment with a project's code without anyone seeing it, and you may never contribute it.
:::

::: solution
1. A branch: you can push to the repository, and pull requests between its branches keep things simple.
2. A fork: you cannot push to the library's repository, so you push to your fork and open a pull request from it.
3. A fork, or simply a clone: a clone needs no account, and a fork gives you a copy on GitHub to push to. Keep in mind that a fork of a public repository is public.
:::

## Self-check quiz {#quiz}

```quiz
? What is a pull request?
- [ ] A Git command that pulls a branch from a server
- [x] A proposal on GitHub to merge one branch into another, with room for review
- [ ] A request for permission to push to a repository
- [ ] An automatic copy of a repository
> A pull request is a GitHub page that shows a branch's changes and lets others discuss and review them before merging.

? A reviewer asks for a change. How do you update your pull request?
- [ ] Close it and open a new one
- [x] Commit the change to the same branch and push it
- [ ] Edit the files on the pull request's page
- [ ] Send the reviewer a new branch name
> The pull request follows its branch; new commits on the branch appear in it automatically.

? What does `git diff main...add-soups` show?
- [ ] Every difference between the two newest commits
- [x] The changes made on `add-soups` since it split from `main`
- [ ] The commits on `main` that `add-soups` lacks
- [ ] Nothing, unless the branches have been merged
> Three dots compare with the point where the branches split, which is what GitHub's Files changed tab shows.

? A branch was merged and deleted on GitHub. Which command removes `origin/add-soups` from your repository?
- [ ] `git branch -d add-soups`
- [ ] `git pull`
- [x] `git fetch --prune`
- [ ] `git push origin --delete add-soups`
> `--prune` removes remote-tracking branches whose branch no longer exists on the remote.

? `git status` on your feature branch says *Your branch is up to date with 'origin/add-breads'*. Does that mean your branch has everything on `main`?
- [ ] Yes, Git always compares with `main`.
- [x] No: it compares with the branch's own upstream, `origin/add-breads`.
- [ ] Yes, if you have run `git fetch`.
- [ ] No: it means that the branch has been deleted.
> To bring in `main`'s new commits, fetch and merge `origin/main` into your branch.

? In a fork setup, what is `upstream` usually?
- [x] The original project's repository
- [ ] Your fork on GitHub
- [ ] The branch your pull request goes into
- [ ] Your local clone
> `origin` is your fork, which you push to; `upstream` is the original, which you fetch from.

? Your pull request's description says `Closes #12`. What happens when it is merged into the default branch?
- [ ] Pull request #12 is closed.
- [ ] Twelve commits are squashed.
- [x] Issue #12 is closed automatically.
- [ ] Nothing: it is only a comment.
> GitHub links the pull request to the issue and closes the issue on merging.
```

## Further reading {#reading}

- Scott Chacon and Ben Straub, *Pro Git*, sections [5.1: Distributed Workflows](https://git-scm.com/book/en/v2/Distributed-Git-Distributed-Workflows) and [6.2: Contributing to a Project](https://git-scm.com/book/en/v2/GitHub-Contributing-to-a-Project).
- GitHub Docs, [About pull requests](https://docs.github.com/en/pull-requests/reference/pull-requests), [About forks](https://docs.github.com/en/pull-requests/reference/forks) and [About issues](https://docs.github.com/en/issues/tracking-your-work-with-issues/learning-about-issues/about-issues).
- The reference pages for [git fetch](https://git-scm.com/docs/git-fetch) (`--prune`) and [git diff](https://git-scm.com/docs/git-diff) (the `A...B` form).
`````

`tutorial-sources/git/src/zh/module_07.md`:

`````markdown
## 团队如何共享工作 {#s1}

在第 6 模块中，两个人都直接推送到 `main`，其中一次推送因为对方抢先一步而被拒绝。两个细心的人这样做还行，换成一个团队就不行了。大多数团队转而遵循几条简单的规则：

- `main` 始终可用。没有人直接向它提交。
- 每项改动，无论多小，都在自己的分支上进行，这种分支称为**功能分支**（feature branch）。
- 改动准备好之后，作者用**拉取请求**（pull request）提出它：这是 GitHub 上的一个页面，展示分支的提交和改动，并邀请别人审查（review）。
- 审查通过后，拉取请求被合并到 `main`，分支随即删除。

这就是**功能分支工作流**（feature-branch workflow）。它的长处在于，每项改动在进入 `main` 之前都有人看过，而且好几个人可以同时工作，互不妨碍。

::: figure #fig-07-01
拉取请求的生命周期：创建分支、提交并推送；用拉取请求提出改动；审查过程中可能追加提交；在 GitHub 上把分支合并到 `main`，然后大家各自整理。
:::

在 GitHub 上共享项目有两种方式。在**共享仓库**中，团队成员有权限向同一个仓库推送分支，拉取请求从仓库的一个分支指向另一个分支。公司和小团队通常这样工作。在开源项目中，大多数贡献者根本无法向项目推送。每个人各自创建一个**复刻**（fork），即仓库在 GitHub 上的个人副本，向复刻推送，再从复刻向原项目发起拉取请求。第 7 节会讲复刻；在那之前，大家共用一个仓库。

GitHub 还有**议题**（issue）：每个仓库都有一份关于缺陷、想法和任务的列表。拉取请求常常会说明它解决了哪个议题，GitHub 可以在拉取请求合并时自动关闭该议题。

## 每项改动一个分支 {#s2}

Alex 想加入一份汤的食谱。Alex 没有在 `main` 上提交，而是新建一个分支，在上面提交，然后用 `git push -u` 把分支推送到共享仓库，与第 6 模块练习 4 完全一样。

本模块的动手环节使用第 6 模块中的替身服务器，Alex 和 Sam 各有一个克隆。要跟着操作，请使用你在第 6 模块中创建的 GitHub 仓库：你自己的 recipes 文件夹扮演 Alex。至于 Sam，可以把同一个 GitHub 仓库克隆到 Sam 的文件夹，或者用 `git remote set-url origin` 加上 GitHub 地址，让 Sam 现有的克隆指向它。在 GitHub 上，两个人都是你，这对本模块的所有内容都适用：你可以发起、审查并合并自己的拉取请求。

{{SESSION:m07-feature-branch}}

这次推送在服务器上创建了分支 `add-soups`，`-u` 则把 `origin/add-soups` 设为它的上游。`git branch -vv` 显示两个本地分支及其上游：`add-soups` 位于新提交上，`main` 仍在 `8bf3c2d`。

按改动的内容给分支命名，像第 4 模块建议的那样简短而具体：`add-soups`、`fix-oven-temperature`。这个名字会显示在拉取请求上，别人也会看到。

## 发起拉取请求 {#s3}

拉取请求是 GitHub 的功能，不是 Git 命令，所以本节没有动手环节。请在你自己的仓库上按以下步骤操作；GitHub 文档中的[创建拉取请求](https://docs.github.com/zh/pull-requests/how-tos/create-pull-requests/creating-a-pull-request)展示了当前的页面。

1. 在 GitHub 上打开你的仓库。推送后不久，GitHub 会为这个分支显示一个 **Compare & pull request** 按钮。如果没有，就进入 **Pull requests** 标签页，选择 **New pull request**。
2. 选择 **base** 分支，即改动要进入的分支（`main`），以及 **compare** 分支，即包含改动的分支（`add-soups`）。GitHub 会显示这个拉取请求将带来的提交和改动。
3. 写一个说明改动作用的**标题**，例如“Add a tomato soup recipe”，再写一段**描述**，说明为什么要改，以及审查者需要知道的事情。
4. 如果这项改动解决了某个议题，就在描述中写上 `Closes #` 加议题编号，例如 `Closes #4`。拉取请求合并到默认分支时，GitHub 会关闭该议题。[将拉取请求关联到议题](https://docs.github.com/zh/issues/tracking-your-work-with-issues/using-issues/linking-a-pull-request-to-an-issue)列出了其他关键词。
5. 选择 **Create pull request**。

拉取请求页面有三个标签页：**Conversation**，用于描述和评论；**Commits**，列出分支的提交；**Files changed**，以与 `git diff` 相同的 `+`、`-` 形式显示差异。拉取请求会跟随分支：当你向 `add-soups` 推送更多提交时，它们会自动出现在拉取请求中。

::: tip
让拉取请求保持小巧。只做一件事的拉取请求能得到快速而仔细的审查；改动三十个文件的拉取请求要等好几天，最后只换来一句草草的“看起来没问题”。如果改动很大，就把它拆成几个前后衔接的分支。
:::

## 审查拉取请求 {#s4}

Sam 被请来做审查。大多数审查都在 GitHub 上进行：在 **Files changed** 标签页中，你可以对任意一行发表评论，然后用 **Comment**、**Approve** 或 **Request changes** 提交审查。GitHub 文档中的[审查拉取请求中提议的更改](https://docs.github.com/zh/pull-requests/how-tos/review-pull-requests/reviewing-proposed-changes-in-a-pull-request)展示了具体步骤。

有时审查者希望把分支拿到自己的电脑上：试一试这项改动，或者在自己的编辑器里阅读。在这个动手环节中，Sam 获取、切换到 `add-soups`，并列出这个分支带来了什么。

{{SESSION:m07-review}}

`git fetch` 报告了新分支：`* [new branch] add-soups -> origin/add-soups`。Sam 还没有本地的 `add-soups`，但 `git switch add-soups` 注意到存在 `origin/add-soups`，于是一步之内就从它创建了本地分支，并设置为跟踪它。

接着，两条命令显示这个分支带来了什么：

- `git log --oneline main..add-soups` 列出 `add-soups` 上有而 `main` 上没有的提交，这里是那一次汤的提交。两个点的含义和第 6 模块中一样：“从右边能到达、从左边不能到达”。
- `git diff main...add-soups` 用三个点，显示 `add-soups` 自从与 `main` 分叉以来所做的改动，而不管 `main` 在那之后发生了什么。这正是 GitHub 在 **Files changed** 下显示的内容。

假设 Sam 的审查要求列出配料。Alex 的回应方式是：在同一个分支上修改文件、提交，然后再次推送。不需要做别的：拉取请求会自动收到新提交。随后 Sam 拉取，拿到这次改动。

{{SESSION:m07-address-review}}

Alex 的推送把服务器上的 `add-soups` 从 `22abb2e` 移到了 `b9835b7`，Sam 的 `git pull` 则把 Sam 那份分支快进到同样的位置。`git log --oneline main..add-soups` 现在列出了拉取请求中的两次提交。

::: note title="追加还是改写？"
回应审查时请追加提交，而不是修补已经推送的提交：别人可能已经获取了它们，而新的提交能让审查者准确看到自上次查看以来改了什么。如果你希望合并前的历史更整洁，第 8 模块会介绍如何压缩提交，GitHub 在合并拉取请求时也可以把它压缩。
:::

## 合并与整理 {#s5}

拉取请求获得批准后，有权限的人用 **Merge pull request** 按钮合并它。默认情况下，GitHub 会在 `main` 上生成一次合并提交，与 `git merge --no-ff` 完全一样：即使可以快进，也生成一次有两个父提交的提交，让历史把整个分支作为一个整体显示出来。它的说明写作“Merge pull request #1 from”，后面跟着分支名。随后 GitHub 会提供一个 **Delete branch** 按钮，用来删除 GitHub 上的分支；你的本地分支仍然保留。[合并拉取请求](https://docs.github.com/zh/pull-requests/how-tos/merge-and-close-pull-requests/merging-a-pull-request)介绍了这个按钮及其他选项：*Squash and merge* 和 *Rebase and merge*。

在这个动手环节中，Sam 已经像按下这些按钮那样，在服务器上合并并删除了分支。现在 Alex 更新 `main` 并进行整理。

{{SESSION:m07-after-merge}}

- `git switch main` 说 Alex 的 `main` 与 `origin/main` 一致，但这指的是 Alex 上次获取时的情况。接着 `git pull` 获取到合并提交，并把 `main` 快进过去。
- `git branch -d add-soups` 删除 Alex 的本地分支。它顺利完成，因为 `main` 现在包含了这个分支的提交。
- `git fetch --prune` 删除那些在服务器上已不存在的分支所对应的远程跟踪分支：`- [deleted] (none) -> origin/add-soups`。如果不加 `--prune`，`origin/add-soups` 会一直留在 Alex 的仓库里。
- `git branch -a` 确认了结果：只剩下 `main` 和 `origin/main`。

提交图显示合并提交把汤的提交并入了 `main`。在动手环节中，它的说明是 `Merge branch 'add-soups'`，因为 Sam 用的是 `git merge --no-ff`；在 GitHub 上，说明里写的则是拉取请求。

::: tip
运行一次 `git config --global fetch.prune true`，以后每次 `git fetch` 和 `git pull` 都会自动清理。
:::

## 让分支保持最新 {#s6}

在你开发分支的同时，`main` 也在前进：别的拉取请求被合并了。在你请别人审查之前，以及当 GitHub 提示分支已过时或有冲突时，请把最新的 `main` 带进你的分支：先获取，再把 `origin/main` 合并到你的分支，然后推送。

在这个动手环节中，Alex 正在开发已经推送过的 `add-breads`，与此同时，Sam 对 README 的改动已经进入了 `main`。要跟着操作，请推送一个带有提交的分支，然后在 GitHub 上或以 Sam 的身份向 `main` 添加一次提交。

{{SESSION:m07-update-branch}}

看看获取之后的 `git status`：*Your branch is up to date with 'origin/add-breads'*。这话没错，却不是重点：分支的状态是与它自己的上游比较，而不是与 `main` 比较。第一张提交图显示了真实情况：`origin/main` 上有一次 `add-breads` 所没有的提交。

`git merge origin/main` 把它合并进来，生成一次合并提交，说明为 `Merge remote-tracking branch 'origin/main' into add-breads`，然后 `git push` 更新拉取请求。第二张提交图显示 `add-breads` 包含了两条历史线。合并 `origin/main` 而不是你的本地 `main`，可以省去先更新 `main` 这一步。

如果合并因冲突而停下，就像第 5 模块那样解决、提交并推送。GitHub 上出现的 **Update branch** 按钮会在 GitHub 上完成同样的合并。第 8 模块会介绍变基（rebase），这是一些团队更喜欢的另一种做法。

## 通过复刻做贡献 {#s7}

要为你无法推送的项目（例如大多数开源项目）做贡献，就要通过复刻来工作：

1. 在项目的 GitHub 页面上选择 **Fork**。GitHub 会在你的账户下创建这个仓库的副本。
2. 克隆你的复刻。在你的克隆中，`origin` 就是你的复刻，你可以向它推送。
3. 把原项目添加为第二个远程仓库，按照惯例命名为 **upstream**，这样你就能获取它的新提交。
4. 像平常一样在分支上工作，把分支推送到 `origin`，然后从你复刻中的分支向原项目的 `main` 发起拉取请求。无论你在哪一个仓库上发起拉取请求，GitHub 都会提供这个选项。
5. 要让复刻的 `main` 保持最新，就获取 `upstream`，把 `upstream/main` 合并到你的 `main`，再推送到 `origin`。GitHub 的 **Sync fork** 按钮会在 GitHub 上完成同样的事。

::: figure #fig-07-02
通过复刻工作。你无法向原项目 `upstream` 推送。你向自己的复刻 `origin` 推送，并从它发起拉取请求；你从 `upstream` 获取新的工作。
:::

在这个动手环节中，服务器上有原仓库以及 Sam 的复刻 `sam-recipes.git`，Sam 可以向后者推送。Sam 克隆复刻并添加 `upstream`。随后，维护原仓库的 Alex 加入了一份蛋糕食谱，Sam 再把它带进自己的复刻。

{{SESSION:m07-fork}}

`git remote -v` 现在列出两个远程仓库：Sam 的复刻 `origin`，以及原仓库 `upstream`。`git fetch upstream` 把原仓库的 `main` 取回为 `upstream/main`，`git merge upstream/main` 把 Sam 的 `main` 快进过去，`git push` 则更新复刻，因为 Sam 的 `main` 仍然推送到 `origin`。

要在 GitHub 上练习，可以像 GitHub 文档中的[复刻仓库](https://docs.github.com/zh/pull-requests/how-tos/work-with-forks/fork-a-repo)建议的那样，复刻练习仓库 [octocat/Spoon-Knife](https://github.com/octocat/Spoon-Knife)，然后克隆你的复刻，并把 `https://github.com/octocat/Spoon-Knife.git` 添加为 `upstream`。

## 练习 {#exercises}

::: exercise #e1 level=1 kind=conceptual minutes=4
**排列步骤。** 把功能分支工作流的这些步骤排好顺序：合并拉取请求；`git push -u origin fix-typo`；`git switch -c fix-typo`；发起拉取请求；`git switch main` 和 `git pull`；提交修正；用另一次提交回应审查；`git branch -d fix-typo`。
:::

::: solution
`git switch -c fix-typo`；提交修正；`git push -u origin fix-typo`；发起拉取请求；用另一次提交回应审查（并推送）；合并拉取请求；`git switch main` 和 `git pull`；`git branch -d fix-typo`。
:::

::: exercise #e2 level=2 kind=conceptual minutes=5
**两个点还是三个点？** 自从 `add-soups` 与 `main` 分叉以来，`main` 多了两次提交，而 `add-soups` 有一次自己的提交。`git log --oneline main..add-soups` 会列出什么？`git diff main...add-soups` 会显示什么？为什么不带点的 `git diff main add-soups` 会误导审查者？
:::

::: solution
`main..add-soups` 列出 `add-soups` 上那一次 `main` 所没有的提交。`main...add-soups` 只显示 `add-soups` 自分叉以来的改动，也就是拉取请求将要带来的内容。`git diff main add-soups` 直接比较两边最新的提交，因此 `main` 上的两次新提交看起来就像是被 `add-soups` 删除了，尽管这个分支从未碰过它们。
:::

::: exercise #e3 level=2 kind=coding minutes=6
**向同事的分支追加提交。** Alex 关于 `add-soups` 的拉取请求缺少一句说明这份汤够几个人吃。请以 Sam 的身份把它加到这个分支上，使拉取请求包含这处改动，并让 Alex 拿到它。要跟着操作，请先在 Alex 的窗口中推送一个分支。
:::

::: solution
获取分支、切换过去、提交并推送；然后 Alex 拉取：

{{SESSION:m07-e3-solution}}

任何有推送权限的人都可以向拉取请求的分支追加提交。请事先商量好，免得两个人同时修改相同的行。
:::

::: exercise #e4 level=1 kind=conceptual minutes=4
**撰写拉取请求。** 你的分支加入了一份汤的食谱，这是议题 #4 所要求的。写一个标题和一段描述，使拉取请求合并时能关闭这个议题。
:::

::: solution
例如，标题：*Add a tomato soup recipe*。描述：*Adds `soup.md` with the ingredients and method we used last week. Closes #4.* 措辞随意，只要描述中包含 `Closes #4`（或 `Fixes #4`、`Resolves #4`）即可。
:::

::: exercise #e5 level=2 kind=coding minutes=6
**删不掉的分支。** 你的拉取请求是用 *Squash and merge* 合并的：GitHub 在 `main` 上添加了一次包含该分支全部改动的新提交，并删除了分支。运行 `git pull` 之后，`git branch -d add-soups` 拒绝执行，说这个分支没有完全合并。请确认不会丢失任何内容，然后删除这个分支。要跟着操作，请在 GitHub 上用 *Squash and merge* 合并一个拉取请求。
:::

::: solution
压缩合并会把分支的改动复制到一次新提交中，所以 `main` 永远不包含该分支自己的提交，`-d` 也就无法判断这些工作已经在 `main` 中了。请改为比较文件内容：

{{SESSION:m07-e5-solution}}

`git diff main add-soups` 什么也没有打印：文件完全相同，所以 `git branch -D` 不会丢失任何东西。请先清理：只要你的仓库中还存在 `origin/add-soups`，`-d` 就会以它为准，只给出一条警告就删除分支。
:::

::: exercise #e6 level=1 kind=conceptual minutes=5
**复刻还是分支？** 在下面每种情况下，你会向仓库推送分支，还是通过复刻工作？

1. 你是拥有这个仓库的团队的成员。
2. 你在一个流行的开源库的文档中发现了一个错字。
3. 你想在不让任何人看到的情况下试验一个项目的代码，而且可能永远不会贡献出去。
:::

::: solution
1. 推送分支：你可以向这个仓库推送，在仓库的分支之间发起拉取请求最简单。
2. 复刻：你无法向这个库的仓库推送，所以要推送到你的复刻，再从复刻发起拉取请求。
3. 复刻，或者干脆只克隆：克隆不需要账户，复刻则在 GitHub 上给你一个可以推送的副本。请记住，公开仓库的复刻也是公开的。
:::

## 自测 {#quiz}

```quiz
? 什么是拉取请求？
- [ ] 一条从服务器拉取分支的 Git 命令
- [x] GitHub 上把一个分支合并到另一个分支的提议，可以在其中进行审查
- [ ] 申请向仓库推送的权限
- [ ] 仓库的自动副本
> 拉取请求是 GitHub 上的一个页面，展示分支的改动，让别人在合并前讨论和审查。

? 审查者要求修改。你怎样更新你的拉取请求？
- [ ] 关闭它，再发起一个新的
- [x] 把修改提交到同一个分支并推送
- [ ] 在拉取请求的页面上编辑文件
- [ ] 把新的分支名发给审查者
> 拉取请求会跟随它的分支；分支上的新提交会自动出现在其中。

? `git diff main...add-soups` 显示什么？
- [ ] 两边最新提交之间的所有差异
- [x] `add-soups` 自从与 `main` 分叉以来所做的改动
- [ ] `main` 上有而 `add-soups` 没有的提交
- [ ] 什么也不显示，除非两个分支已经合并
> 三个点是与分叉点比较，这正是 GitHub 的 Files changed 标签页显示的内容。

? 一个分支已在 GitHub 上合并并删除。哪条命令会从你的仓库中删除 `origin/add-soups`？
- [ ] `git branch -d add-soups`
- [ ] `git pull`
- [x] `git fetch --prune`
- [ ] `git push origin --delete add-soups`
> `--prune` 会删除那些在远程仓库上已不存在的分支所对应的远程跟踪分支。

? 在你的功能分支上，`git status` 显示 *Your branch is up to date with 'origin/add-breads'*。这是否意味着你的分支包含 `main` 上的一切？
- [ ] 是的，Git 总是与 `main` 比较。
- [x] 不是：它是与分支自己的上游 `origin/add-breads` 比较。
- [ ] 是的，只要你运行过 `git fetch`。
- [ ] 不是：它表示这个分支已被删除。
> 要引入 `main` 的新提交，请获取并把 `origin/main` 合并到你的分支。

? 在复刻的设置中，`upstream` 通常是什么？
- [x] 原项目的仓库
- [ ] 你在 GitHub 上的复刻
- [ ] 拉取请求要进入的分支
- [ ] 你的本地克隆
> `origin` 是你的复刻，你向它推送；`upstream` 是原项目，你从它获取。

? 你的拉取请求的描述中写着 `Closes #12`。它合并到默认分支时会发生什么？
- [ ] 拉取请求 #12 被关闭。
- [ ] 十二次提交被压缩。
- [x] 议题 #12 被自动关闭。
- [ ] 什么也不会发生：这只是一条注释。
> GitHub 会把拉取请求与议题关联起来，并在合并时关闭议题。
```

## 延伸阅读 {#reading}

- Scott Chacon 和 Ben Straub，《Pro Git》，第 [5.1 节：分布式工作流程](https://git-scm.com/book/zh/v2/分布式-Git-分布式工作流程)和第 [6.2 节：对项目做出贡献](https://git-scm.com/book/zh/v2/GitHub-对项目做出贡献)。
- GitHub 文档：[关于拉取请求](https://docs.github.com/zh/pull-requests/reference/pull-requests)、[关于复刻](https://docs.github.com/zh/pull-requests/reference/forks)和[关于议题](https://docs.github.com/zh/issues/tracking-your-work-with-issues/learning-about-issues/about-issues)。
- [git fetch](https://git-scm.com/docs/git-fetch)（`--prune`）和 [git diff](https://git-scm.com/docs/git-diff)（`A...B` 形式）的参考页面。
`````


- [ ] **Step 4: Build, test and read**

```bash
node --test --test-concurrency=1 "tutorial-sources/git/tests/*.test.mjs"
node tutorial-sources/git/build.mjs
```

Expected:
- `# tests 58`, `# pass 58`;
- `Built modules 01, 02, 03, 04, 05, 06, 07 in English and Chinese; ran 43 sessions …`.

Read both pages. Check that:
- both figures appear;
- the `behind` graph shows `origin/main` ahead of `add-breads`.

- [ ] **Step 5: Commit**

```bash
git add tutorial-sources/git/src/en/module_07.md tutorial-sources/git/src/zh/module_07.md tutorial-sources/git/tests/lesson-facts.test.mjs docs/tutorials/git
git commit -m "Git series: Module 7 in English and Chinese" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Module 8 in English and Chinese

**Files:**
- Create: `tutorial-sources/git/src/en/module_08.md`, `tutorial-sources/git/src/zh/module_08.md`
- Modify: `tutorial-sources/git/tests/lesson-facts.test.mjs`
- Modify (generated): `docs/tutorials/git/`

**Interfaces:**
- Consumes: Task 2's Module 8 sessions and `fig-08-01`. Quiz answer positions are `1, 1, 0, 3, 1, 1, 2` in both languages.
- Produces: a published Module 8.

- [ ] **Step 1: Write the failing tests**

Append to `tutorial-sources/git/tests/lesson-facts.test.mjs`:

```js

test('Module 8 shows the to-do list of its squash session, whose hashes the session tests pin', () => {
  for (const lang of ['en', 'zh']) {
    assert.match(lesson(lang, 8), /`{3}text\npick bc5616c # Add a tomato soup recipe\nfixup 2b52993 # fixup! Add a tomato soup recipe\npick 49f29eb # Add a soda bread recipe\n\n# Rebase 8bf3c2d\.\.2b52993 onto 8bf3c2d \(3 commands\)\n`{3}/, lang);
  }
});

test('Module 8 says which side of a rebase conflict is yours', () => {
  assert.match(lesson('en', 8), /in a rebase, `<<<<<<< HEAD` holds `main`'s version/);
  assert.match(lesson('zh', 8), /在变基中，`<<<<<<< HEAD` 下面是 `main` 的版本/);
});
```

Run: `node --test --test-concurrency=1 "tutorial-sources/git/tests/lesson-facts.test.mjs"`
Expected: 2 failing tests, with `ENOENT … src/en/module_08.md`.

- [ ] **Step 2: Check the sources the lesson relies on**

The lesson's facts were checked against the [git stash](https://git-scm.com/docs/git-stash), [git reset](https://git-scm.com/docs/git-reset), [git rebase](https://git-scm.com/docs/git-rebase) and [git reflog](https://git-scm.com/docs/git-reflog) references. These include:
- `stash pop` keeps the entry after a conflict;
- an empty to-do list aborts the rebase;
- reflog entries expire after 90 and 30 days.

The to-do list was captured from Git 2.50.1 with `git -c sequence.editor=cat rebase -i --autosquash main` run on the squash session's repository.

- [ ] **Step 3: Create the lessons**

`tutorial-sources/git/src/en/module_08.md`:

`````markdown
## The one rule {#s1}

This module gives you tools that change history: commands that move a branch backwards, replay commits somewhere else, or fold several commits into one. Used on your own work, they help you keep a clean, readable history. Used carelessly on shared work, they cause real trouble. So first, the one rule:

::: keyidea
**Do not rewrite commits that other people already have.** Once you have pushed commits to a branch that others use, such as `main`, treat them as fixed. Undo them with `git revert` (Module 3), which adds a new commit, rather than by rewriting them.
:::

Why? Rewriting history never edits commits; it makes new ones, with new hashes, and moves the branch to them, as you saw with `--amend` in Module 3. Everyone who already has the old commits now has a history that no longer matches yours. Their next pull merges the old and new versions together, duplicating work. Your next push is rejected, and forcing it throws their work away.

On your own branches, before anyone else builds on them, rewriting is fine, and often a kindness to reviewers. A feature branch that only you work on, even one already pushed for a pull request, counts as yours, as long as you tell Git that you mean to overwrite it (Section 4).

Two tools in this module rewrite nothing: `git stash` (Section 2) puts uncommitted work aside, and `git reflog` (Section 6) finds commits you thought you had lost.

## Putting work aside {#s2}

You are half-way through a change when something more urgent comes up: a fix on another branch, or a colleague's pull request to try. Your work is not ready to commit, and switching branches with uncommitted changes is risky (Module 4, Exercise 4). `git stash` solves this. It saves your uncommitted changes, both staged and unstaged, on a stack called the **stash**, and returns your working tree to the last commit. Later, `git stash pop` puts the changes back and removes them from the stash.

In the session, Alex is adding an ingredient to the pancakes when the README needs fixing first. To follow along, start an edit to any tracked file, then stash it.

{{SESSION:m08-stash}}

`git stash` reports what it saved, `WIP on main` ("work in progress"), and names the commit it was based on. `git status` then shows a clean working tree, and `git stash list` shows one entry, `stash@{0}`, the newest. With a clean tree, Alex commits the README change. `git stash pop` brings the half-written pancake line back as an unstaged change, and `git diff` shows it waiting to be finished.

A few more things to know:

- `git stash` saves only tracked files. To include new, untracked files, use `git stash -u`.
- `git stash list` shows every entry, newest first. `git stash apply` puts the newest back but keeps it on the stash; `git stash drop` deletes it.
- If the stashed changes conflict with what you have committed since, `git stash pop` stops with conflict markers. Resolve them as in Module 5, then run `git stash drop`, because in that case the entry is kept.
- Stashes are local: they are not pushed. Do not leave work there for long; a branch with a work-in-progress commit is easier to find again.

## Taking back commits {#s3}

`git reset <commit>` moves your current branch back to an earlier commit, taking back the commits after it. Unlike `git revert`, it rewrites history, so use it only on commits that you have not pushed. Its options say what happens to the changes those commits contained:

- `git reset --soft <commit>` moves only the branch. The changes stay in the staging area, ready to commit again.
- `git reset <commit>`, the default, called *mixed*, also resets the staging area. The changes stay in your working tree, unstaged.
- `git reset --hard <commit>` also resets the working tree. The changes are gone from your files, and so is any uncommitted work.

::: figure #fig-08-01
What each form of `git reset` keeps. All three move the branch back; they differ in what happens to the staging area and the working tree.
:::

As in Module 3, `HEAD~1` means "one commit before HEAD". In the session, Alex commits a pinch of salt with a vague message, takes the commit back with `--soft` and commits again with a better message, then takes it back once more with the default reset.

{{SESSION:m08-reset}}

`git reset --soft HEAD~1` prints nothing, but `git status` shows the salt as *Changes to be committed*: the commit is gone, and its change is staged again. That makes `--soft` a way to redo a commit, for example to merge the last few commits into one: reset back over them with `--soft`, then commit once.

After the default reset, Git reports `Unstaged changes after reset:` and lists `pancakes.md`. `git status` agrees: the change is now unstaged, in the working tree. This is the way to split a commit into smaller ones: reset it, then stage and commit the parts separately. `git log --oneline` confirms that both salt commits are gone from `main`.

::: pitfall
`git reset --hard` throws away uncommitted changes in your working tree, and Git cannot bring those back. Commits it takes back can usually be recovered from the reflog (Section 6), but uncommitted work cannot. Run `git status` first, and stash anything you want to keep.
:::

## Rebasing {#s4}

In Module 7, Alex brought a feature branch up to date by merging `origin/main` into it. **Rebasing** is the other way. `git rebase main` takes the commits on your branch that `main` does not have, and replays them, one by one, on top of the newest commit of `main`. The result is the same files as a merge, but a straight line of history with no merge commit, as if you had started the branch from today's `main`.

Replaying makes new commits, with new hashes, so rebasing rewrites the branch. That is fine for your own feature branch, but it has a consequence when the branch is already pushed, and the session shows it. Alex's `soups` branch is on the server, and `main` has moved on. To follow along, make a commit on a branch and push it, then add a commit to `main`.

{{SESSION:m08-rebase}}

Compare the graphs. Before, `soups` and `main` have split, as in a three-way merge. After `git rebase main`, which reports `Successfully rebased and updated refs/heads/soups`, the soup commit sits on top of `main`'s newest commit as a new commit, `a11c867`. The old soup commit, `968c34b`, is still where `origin/soups` points: the server has not changed.

So `git push` is rejected as `non-fast-forward`: the server's `soups` contains `968c34b`, which your rebased branch has replaced. Here you know the branch is yours, so you overwrite it with `git push --force-with-lease`. Git reports `(forced update)`. `--force-with-lease` refuses if the server's branch is not where your `origin/soups` says it is, that is, if someone pushed to it since you last fetched. Plain `--force` overwrites regardless, which can destroy a colleague's work; avoid it.

When should you rebase rather than merge? Many teams rebase their own feature branches to keep history linear, and merge when the branch is finished. Others always merge. Either way, the one rule applies: never rebase a branch that others are working on. Remember too that `git pull` can rebase instead of merge, with `git pull --rebase` or the `pull.rebase true` setting from Module 6.

If a replayed commit conflicts, the rebase stops, much like a merge. Resolve the file, `git add` it, then run `git rebase --continue`; or `git rebase --abort` to go back to where you started. Exercise 5 shows one, and a difference from merging that surprises everyone the first time.

## Squashing a fix {#s5}

Before a branch is reviewed, you may notice a mistake in one of its earlier commits: a typo, a forgotten line. A separate "fix typo" commit makes the history noisier for everyone who reads it later. An **interactive rebase**, `git rebase -i`, lets you edit the list of commits before they are replayed: reorder them, reword their messages, drop them, or **squash** several into one.

The easiest way to squash a fix is to let Git write the instructions for you:

1. Make the fix, and commit it with `git commit --fixup <commit>`, naming the commit it belongs to. Git gives it the message `fixup! ` followed by that commit's message.
2. Run `git rebase -i --autosquash main`. Git opens your editor with a **to-do list**, one line per commit on the branch, already arranged so that the fixup follows the commit it fixes, marked `fixup`.
3. Save and close the editor. Git replays the commits, folding the fix into the earlier commit.

In the session, the soup recipe's title has a typo, "Tomatoe", and a bread recipe has been committed since. To follow along, make two commits on a branch, then fix something from the first.

{{SESSION:m08-squash}}

`git commit --fixup HEAD~1` names the commit before the newest, the soup commit, and Git calls the new commit `fixup! Add a tomato soup recipe`. When you run `git rebase -i --autosquash main` on your computer, the editor shows this to-do list (followed by a long comment explaining the commands):

```text
pick bc5616c # Add a tomato soup recipe
fixup 2b52993 # fixup! Add a tomato soup recipe
pick 49f29eb # Add a soda bread recipe

# Rebase 8bf3c2d..2b52993 onto 8bf3c2d (3 commands)
```

Each line is a command and a commit, applied from top to bottom: `pick` replays a commit as it is, and `fixup` folds it into the commit above, keeping that commit's message. Saving the list unchanged runs it, as the session does. The final `git log --oneline` shows two commits instead of three, with new hashes: the soup commit now contains the corrected title.

You can also edit the list yourself. Change `pick` to `reword` to change a message, to `squash` to fold a commit into the one above and combine both messages, or to `drop` to remove it; move lines to reorder commits. If you save an empty list, the rebase stops without changing anything.

## The reflog {#s6}

Commits that no branch points at any more are not deleted at once. Git keeps them for a while, and the **reflog**, short for *reference log*, records every position HEAD has had: each commit, reset, switch, merge and rebase. `git reflog` lists them, newest first, so you can find a commit that a hard reset, a rebase or a deleted branch took away.

In the session, Alex resets two commits away by mistake, then gets them back. To follow along, make two commits, then `git reset --hard HEAD~2`.

{{SESSION:m08-reflog}}

After `git reset --hard HEAD~2`, `git log --oneline` no longer shows the cake and soup commits. `git reflog` still does. Each line shows where HEAD was, a name for that position, and what moved it: `HEAD@{0}` is now (`reset: moving to HEAD~2`), and `HEAD@{1}` is just before, after the soup commit `ab03771`. `git reset --hard ab03771` moves `main` back there, and the log is exactly as it was.

To rescue a commit without moving your branch, create a new branch at it instead, for example `git branch rescue ab03771`. That also brings back a branch deleted with `git branch -D`: find its last commit in the reflog, and create the branch again.

::: note title="HEAD@{1} and PowerShell"
You can also name positions in the reflog directly, as in `git reset --hard HEAD@{1}`. In PowerShell, put such names in quotes, `'HEAD@{1}'`, because PowerShell gives braces a meaning of its own. The hash from the reflog works in every shell.
:::

The reflog has limits: it is local to your repository and never pushed, and Git eventually deletes old entries, by default after 90 days, or 30 days for commits no longer on any branch. And it records commits only, so it cannot help with uncommitted changes lost to `git reset --hard` or `git restore`. Commit often, and very little can be lost for good.

## Exercises {#exercises}

::: exercise #e1 level=1 kind=conceptual minutes=4
**Safe to rewrite?** Which of these are safe? Explain each.

1. Amending your last commit, which you have not pushed.
2. Rebasing your feature branch, pushed for a pull request that only you work on, and pushing it with `--force-with-lease`.
3. Resetting `main` back two commits, after pushing those commits to the shared repository.
4. Reverting a commit on `main` that the whole team has.
:::

::: solution
1. Safe: nobody else has the commit.
2. Safe: the branch is yours, and `--force-with-lease` stops if someone has pushed to it after all. Tell reviewers you have rewritten it.
3. Not safe: the team already has those commits. Use `git revert` instead.
4. Safe: reverting adds a new commit and rewrites nothing.
:::

::: exercise #e2 level=1 kind=coding minutes=5
**An urgent fix.** You are half-way through a soup recipe on the `soups` branch when the README on `main` needs a fix. Put your work aside, make the fix on `main`, and return to your soup with your work restored. To follow along, start an edit on a branch without committing it.
:::

::: solution
Stash, switch, commit the fix, switch back and pop:

{{SESSION:m08-e2-solution}}

The stash entry records the branch it came from (`WIP on soups`), but you can pop it on any branch.
:::

::: exercise #e3 level=2 kind=conceptual minutes=5
**Which reset?** None of these commits has been pushed. Which form of `git reset HEAD~1` fits each situation?

1. Your last commit mixes two unrelated changes, and you want to commit them separately.
2. You want to add one more file to your last commit and write a better message.
3. Your last commit was a failed experiment, and you want neither the commit nor its changes.
:::

::: solution
1. The default (mixed): the changes come back unstaged, so you can stage and commit each part separately.
2. `--soft`: the changes stay staged; add the file and commit again. (`git commit --amend` does the same in one step.)
3. `--hard`: the commit and its changes are gone. Check `git status` first, so that you do not lose uncommitted work.
:::

::: exercise #e4 level=2 kind=conceptual minutes=5
**A deleted branch.** Yesterday you deleted a branch called `experiment` with `git branch -D`, and today you need one of its commits. How do you get the branch back?
:::

::: solution
Run `git reflog` and look for the last line about `experiment`, such as a commit you made on it, or `checkout: moving from experiment to main`. Note the commit's hash, then run `git branch experiment <hash>`. The branch is back, with all its commits.
:::

::: exercise #e5 level=2 kind=coding minutes=7
**A conflict during a rebase.** On `less-sugar`, you changed the sugar to 30 g; meanwhile `main` changed it to 40 g. Rebase `less-sugar` onto `main`, settling on 35 g. To follow along, create the two changes as in Module 5, Section 3.
:::

::: solution
The rebase stops at the conflicting commit. Resolve the file, stage it, and continue:

{{SESSION:m08-e5-solution}}

Look at the markers: in a rebase, `<<<<<<< HEAD` holds `main`'s version, 40 g, and `>>>>>>> cbca0db (Use less sugar)` holds yours. The labels are the other way round from a merge, because a rebase replays your commits on top of `main`, so HEAD is the new base. `git rebase --continue` then commits the replayed commit, letting you edit its message on your computer, and finishes the rebase.
:::

::: exercise #e6 level=1 kind=conceptual minutes=4
**Which tool?** Name the command for each situation.

1. The message of your last commit, not yet pushed, has a typo.
2. A commit on the shared `main` broke the build.
3. You need a clean working tree for ten minutes, without committing.
4. Your pull request has a "fix typo" commit that belongs in an earlier commit.
5. You reset too far and need the commits back.
:::

::: solution
1. `git commit --amend`.
2. `git revert <commit>`.
3. `git stash`, then `git stash pop`.
4. `git commit --fixup <commit>` and `git rebase -i --autosquash main`, then `git push --force-with-lease`.
5. `git reflog`, then `git reset --hard <hash>`.
:::

## Self-check quiz {#quiz}

```quiz
? What is the rule about rewriting history?
- [ ] Never use `git rebase`.
- [x] Do not rewrite commits that other people already have.
- [ ] Only rewrite history on `main`.
- [ ] Always use `--force` after rewriting.
> On your own unpushed or unshared work, rewriting is fine; shared commits are undone with `git revert`.

? What does `git stash` do?
- [ ] It commits your changes on a hidden branch on the server.
- [x] It saves your uncommitted changes and returns your working tree to the last commit.
- [ ] It deletes your uncommitted changes.
- [ ] It moves the branch back one commit.
> `git stash pop` brings the changes back later.

? After `git reset --soft HEAD~1`, where are the last commit's changes?
- [x] In the staging area
- [ ] Only in the reflog
- [ ] Gone
- [ ] On a new branch
> `--soft` moves only the branch; the default reset unstages the changes, and `--hard` removes them.

? Which command can destroy uncommitted work for good?
- [ ] `git reset --soft HEAD~1`
- [ ] `git stash`
- [ ] `git rebase main`
- [x] `git reset --hard HEAD~1`
> `--hard` resets the working tree; uncommitted changes are not in the reflog.

? After rebasing a branch you had already pushed, why is `git push` rejected?
- [ ] The rebase failed.
- [x] The rebased commits replace the pushed ones, so the push is not a fast-forward.
- [ ] Rebased branches cannot be pushed.
- [ ] The remote is out of date.
> If the branch is yours alone, push with `--force-with-lease`.

? During a rebase onto `main`, which version lies between `<<<<<<< HEAD` and `=======`?
- [ ] Your branch's version
- [x] `main`'s version, the base the commits are being replayed onto
- [ ] The version from the first commit
- [ ] Git's suggested resolution
> In a rebase, HEAD is the new base; your commit's version comes after `=======`.

? What does `git reflog` show?
- [ ] Every commit on the remote
- [ ] The commits that are about to be pushed
- [x] Where HEAD has been, including commits no longer on any branch
- [ ] Changes you have not committed
> Use a hash from the reflog to reset or create a branch, and get lost commits back.
```

## Further reading {#reading}

- Scott Chacon and Ben Straub, *Pro Git*, sections [3.6: Rebasing](https://git-scm.com/book/en/v2/Git-Branching-Rebasing), [7.3: Stashing and Cleaning](https://git-scm.com/book/en/v2/Git-Tools-Stashing-and-Cleaning), [7.6: Rewriting History](https://git-scm.com/book/en/v2/Git-Tools-Rewriting-History) and [7.7: Reset Demystified](https://git-scm.com/book/en/v2/Git-Tools-Reset-Demystified).
- The reference pages for [git stash](https://git-scm.com/docs/git-stash), [git reset](https://git-scm.com/docs/git-reset), [git rebase](https://git-scm.com/docs/git-rebase) and [git reflog](https://git-scm.com/docs/git-reflog).
`````

`tutorial-sources/git/src/zh/module_08.md`:

`````markdown
## 唯一的规则 {#s1}

本模块介绍会改变历史的工具：把分支往回移、把提交重放到别处，或者把几次提交合成一次的命令。用在你自己的工作上，它们能帮你保持历史整洁易读。随意用在共享的工作上，就会惹出真正的麻烦。所以先说那条唯一的规则：

::: keyidea
**不要改写别人已经拿到的提交。** 一旦你把提交推送到了别人也在使用的分支（例如 `main`），就把它们当作固定不变的。要撤销它们，请使用 `git revert`（第 3 模块），它会添加一次新提交，而不是改写它们。
:::

为什么？改写历史从来不是编辑提交，而是生成带有新哈希的新提交，再把分支移过去，就像你在第 3 模块中用 `--amend` 看到的那样。每个已经拿到旧提交的人，手里的历史就与你的不再一致了。他们下一次拉取时会把新旧两个版本合并在一起，造成重复的工作。你下一次推送会被拒绝，而强制推送则会丢掉他们的工作。

在你自己的分支上，只要还没有人在它的基础上工作，改写就没有问题，而且往往是对审查者的体贴。只有你自己在开发的功能分支，即使已经为拉取请求推送过，也算是你自己的，只要你明确告诉 Git 你打算覆盖它（第 4 节）。

本模块中有两个工具不改写任何东西：`git stash`（第 2 节）把未提交的工作暂放一边，`git reflog`（第 6 节）则能找回你以为已经丢失的提交。

## 暂放工作 {#s2}

你的一项改动做到一半，突然来了更紧急的事：另一个分支上要修个问题，或者要试试同事的拉取请求。你的工作还不能提交，而带着未提交的改动切换分支是有风险的（第 4 模块练习 4）。`git stash` 能解决这个问题。它把你未提交的改动（无论是否已暂存）保存到一个叫做**贮藏**（stash）的栈中，并把工作区恢复到最近一次提交的状态。之后，`git stash pop` 会把这些改动放回来，并把它们从贮藏中移除。

在这个动手环节中，Alex 正在给煎饼加一种配料，这时 README 需要先修正一下。要跟着操作，请开始编辑任意一个已跟踪的文件，然后把改动贮藏起来。

{{SESSION:m08-stash}}

`git stash` 报告了它保存的内容 `WIP on main`（“work in progress”，进行中的工作），并给出了它所基于的提交。随后 `git status` 显示工作区是干净的，`git stash list` 显示一个条目 `stash@{0}`，也就是最新的那个。工作区干净了，Alex 提交了对 README 的修改。`git stash pop` 把写了一半的煎饼那一行作为未暂存的改动放了回来，`git diff` 显示它正等着你写完。

还有几点需要了解：

- `git stash` 只保存已跟踪的文件。要把新的未跟踪文件也包括进去，请使用 `git stash -u`。
- `git stash list` 列出所有条目，最新的在前。`git stash apply` 把最新的条目放回来，但仍把它留在贮藏中；`git stash drop` 删除它。
- 如果贮藏的改动与你之后提交的内容冲突，`git stash pop` 会停下来并留下冲突标记。像第 5 模块那样解决，然后运行 `git stash drop`，因为在这种情况下条目会被保留。
- 贮藏只存在于本地，不会被推送。不要把工作在那里放太久；用一个带有“进行中”提交的分支，更容易找回来。

## 收回提交 {#s3}

`git reset <commit>` 把你当前的分支移回到更早的一次提交，收回它之后的那些提交。与 `git revert` 不同，它会改写历史，所以只能用在你还没有推送的提交上。它的选项决定了那些提交中的改动会怎样：

- `git reset --soft <commit>` 只移动分支。改动留在暂存区，可以直接再次提交。
- `git reset <commit>`，即默认的 *mixed* 方式，还会重置暂存区。改动留在你的工作区，处于未暂存状态。
- `git reset --hard <commit>` 还会重置工作区。改动从你的文件中消失，所有未提交的工作也一样。

::: figure #fig-08-01
每种 `git reset` 各保留什么。三种方式都会把分支往回移；区别在于暂存区和工作区会怎样。
:::

和第 3 模块一样，`HEAD~1` 表示“HEAD 之前的一次提交”。在这个动手环节中，Alex 用一条含糊的说明提交了一小撮盐，先用 `--soft` 收回这次提交，再用更好的说明重新提交，然后又用默认方式收回了一次。

{{SESSION:m08-reset}}

`git reset --soft HEAD~1` 什么也不打印，但 `git status` 把盐显示为 *Changes to be committed*：提交没了，它的改动又处于暂存状态。这使 `--soft` 成为重做提交的一种方式，例如把最近几次提交合成一次：用 `--soft` 退回到它们之前，然后只提交一次。

用默认方式重置之后，Git 报告 `Unstaged changes after reset:` 并列出 `pancakes.md`。`git status` 也确认了这一点：改动现在位于工作区，处于未暂存状态。拆分一次提交就用这个办法：重置它，然后分别暂存并提交各个部分。`git log --oneline` 确认两次加盐的提交都已从 `main` 上消失。

::: pitfall
`git reset --hard` 会丢弃工作区中未提交的改动，Git 无法把它们找回来。它收回的提交通常可以从 reflog 中恢复（第 6 节），但未提交的工作不行。请先运行 `git status`，把想保留的东西贮藏起来。
:::

## 变基 {#s4}

在第 7 模块中，Alex 通过把 `origin/main` 合并到功能分支，让分支跟上了最新进展。**变基**（rebase）是另一种做法。`git rebase main` 取出你的分支上 `main` 所没有的提交，把它们逐个重放到 `main` 最新的提交之上。结果中的文件与合并相同，但历史是一条直线，没有合并提交，就好像你是从今天的 `main` 开始这个分支的。

重放会生成带有新哈希的新提交，所以变基会改写分支。对你自己的功能分支来说这没有问题，但如果分支已经推送过，就会产生一个后果，这个动手环节会展示出来。Alex 的 `soups` 分支在服务器上，而 `main` 已经向前推进了。要跟着操作，请在一个分支上提交并推送，然后向 `main` 添加一次提交。

{{SESSION:m08-rebase}}

比较两张提交图。变基之前，`soups` 和 `main` 已经分叉，就像三方合并那样。运行 `git rebase main` 之后（它报告 `Successfully rebased and updated refs/heads/soups`），汤的提交作为一次新提交 `a11c867` 位于 `main` 最新的提交之上。旧的汤提交 `968c34b` 仍然是 `origin/soups` 所指向的位置：服务器没有变化。

所以 `git push` 被拒绝，原因是 `non-fast-forward`：服务器上的 `soups` 包含 `968c34b`，而你变基后的分支已经替换了它。这里你知道这个分支是你自己的，所以用 `git push --force-with-lease` 覆盖它。Git 报告 `(forced update)`。如果服务器上的分支不在你的 `origin/soups` 所记录的位置，也就是说自你上次获取以来有人向它推送过，`--force-with-lease` 就会拒绝执行。普通的 `--force` 则不管三七二十一直接覆盖，可能毁掉同事的工作；不要用它。

什么时候该变基而不是合并？许多团队对自己的功能分支进行变基以保持历史是直线，分支完成时再合并。另一些团队则始终合并。无论哪种，那条唯一的规则都适用：永远不要对别人正在使用的分支变基。还要记住，`git pull` 也可以用变基代替合并，方法是使用 `git pull --rebase`，或者第 6 模块中提到的 `pull.rebase true` 设置。

如果重放的某次提交发生冲突，变基会停下来，与合并很像。解决文件中的冲突，`git add` 它，然后运行 `git rebase --continue`；或者运行 `git rebase --abort` 回到开始之前的状态。练习 5 展示了一次这样的冲突，以及它与合并的一个区别，每个人第一次遇到时都会吃一惊。

## 压缩修正 {#s5}

在分支接受审查之前，你可能会发现它较早的某次提交中有个错误：一个错字，一行漏掉的内容。单独的一次“修正错字”提交，会让以后每个阅读历史的人都多看一些噪音。**交互式变基**（interactive rebase），即 `git rebase -i`，让你在重放之前编辑提交列表：调整顺序、改写说明、丢弃提交，或者把几次提交**压缩**（squash）成一次。

压缩一处修正最简单的办法，是让 Git 替你写好指令：

1. 做出修正，用 `git commit --fixup <commit>` 提交它，并指明它属于哪次提交。Git 会给它的说明加上 `fixup! `，后面跟着那次提交的说明。
2. 运行 `git rebase -i --autosquash main`。Git 会打开编辑器，里面是一份**待办列表**（to-do list），分支上的每次提交占一行，而且已经排好了顺序：修正紧跟在它所修正的提交之后，并标为 `fixup`。
3. 保存并关闭编辑器。Git 重放这些提交，把修正并入较早的那次提交。

在这个动手环节中，汤食谱的标题有个错字“Tomatoe”，而且之后又提交了一份面包食谱。要跟着操作，请在一个分支上做两次提交，然后修正第一次提交中的某处内容。

{{SESSION:m08-squash}}

`git commit --fixup HEAD~1` 指的是最新提交之前的那一次，也就是汤的提交，Git 把新提交命名为 `fixup! Add a tomato soup recipe`。当你在自己的电脑上运行 `git rebase -i --autosquash main` 时，编辑器会显示这份待办列表（后面还有一大段解释各个命令的注释）：

```text
pick bc5616c # Add a tomato soup recipe
fixup 2b52993 # fixup! Add a tomato soup recipe
pick 49f29eb # Add a soda bread recipe

# Rebase 8bf3c2d..2b52993 onto 8bf3c2d (3 commands)
```

每一行是一个命令加一次提交，从上到下依次执行：`pick` 原样重放一次提交，`fixup` 把它并入上面那次提交，并保留上面那次提交的说明。不做修改直接保存，列表就会执行，动手环节中就是这样。最后的 `git log --oneline` 显示两次提交而不是三次，哈希都变了：汤的提交现在包含了改正后的标题。

你也可以自己编辑这份列表。把 `pick` 改成 `reword` 可以修改说明，改成 `squash` 可以把一次提交并入上面那次并合并两者的说明，改成 `drop` 可以删除它；移动各行可以调整提交的顺序。如果你保存的是一份空列表，变基就会停止，什么也不改变。

## reflog {#s6}

不再有任何分支指向的提交并不会被马上删除。Git 会把它们保留一段时间，而**引用日志**（reflog，即 *reference log*）记录了 HEAD 到过的每一个位置：每次提交、重置、切换、合并和变基。`git reflog` 按从新到旧的顺序列出它们，所以你能找到被硬重置、变基或删除分支带走的提交。

在这个动手环节中，Alex 不小心重置掉了两次提交，然后把它们找了回来。要跟着操作，请做两次提交，然后运行 `git reset --hard HEAD~2`。

{{SESSION:m08-reflog}}

运行 `git reset --hard HEAD~2` 之后，`git log --oneline` 不再显示蛋糕和汤的提交。`git reflog` 却仍然显示它们。每一行显示 HEAD 当时所在的位置、这个位置的名字，以及是什么让它移动的：`HEAD@{0}` 是现在（`reset: moving to HEAD~2`），`HEAD@{1}` 是紧挨着的前一个位置，即汤的提交 `ab03771` 之后。`git reset --hard ab03771` 把 `main` 移回那里，日志与原来完全一样。

如果想救回一次提交而又不移动当前分支，可以在它那里新建一个分支，例如 `git branch rescue ab03771`。用 `git branch -D` 删除的分支也能这样找回：在 reflog 中找到它的最后一次提交，然后重新创建这个分支。

::: note title="HEAD@{1} 与 PowerShell"
你也可以直接用 reflog 中的位置名，例如 `git reset --hard HEAD@{1}`。在 PowerShell 中，请给这样的名字加上引号，写成 `'HEAD@{1}'`，因为 PowerShell 对花括号另有解释。reflog 中的哈希在任何 shell 中都能用。
:::

reflog 也有局限：它只存在于你自己的仓库中，从不推送；Git 最终会删除旧的条目，默认是 90 天之后，对于已不在任何分支上的提交则是 30 天之后。而且它只记录提交，所以对于被 `git reset --hard` 或 `git restore` 丢掉的未提交改动，它也无能为力。经常提交，能彻底丢失的东西就会很少。

## 练习 {#exercises}

::: exercise #e1 level=1 kind=conceptual minutes=4
**可以改写吗？** 下面哪些做法是安全的？逐一说明理由。

1. 修补你最近一次尚未推送的提交。
2. 对你的功能分支变基（它为了一个只有你在做的拉取请求而推送过），然后用 `--force-with-lease` 推送。
3. 在把两次提交推送到共享仓库之后，把 `main` 重置回两次提交之前。
4. 撤销 `main` 上一次整个团队都已拿到的提交。
:::

::: solution
1. 安全：没有别人拿到过这次提交。
2. 安全：分支是你自己的，而且如果有人向它推送过，`--force-with-lease` 会停下来。请告诉审查者你改写了它。
3. 不安全：团队已经拿到了这些提交。请改用 `git revert`。
4. 安全：`git revert` 添加一次新提交，不改写任何东西。
:::

::: exercise #e2 level=1 kind=coding minutes=5
**紧急修正。** 你在 `soups` 分支上写汤的食谱写到一半，这时 `main` 上的 README 需要修正。把你的工作暂放一边，在 `main` 上完成修正，再回到你的汤食谱，并恢复你的工作。要跟着操作，请在一个分支上开始编辑，但不要提交。
:::

::: solution
贮藏、切换、提交修正、切换回来，再取回贮藏：

{{SESSION:m08-e2-solution}}

贮藏条目记录了它来自哪个分支（`WIP on soups`），但你可以在任何分支上取回它。
:::

::: exercise #e3 level=2 kind=conceptual minutes=5
**用哪种重置？** 下面这些提交都还没有推送。每种情况适合哪种形式的 `git reset HEAD~1`？

1. 你最近一次提交混杂了两处不相关的改动，你想分别提交它们。
2. 你想给最近一次提交再加一个文件，并写一条更好的说明。
3. 你最近一次提交是一次失败的试验，你既不要这次提交，也不要其中的改动。
:::

::: solution
1. 默认方式（mixed）：改动回到未暂存状态，你可以分别暂存并提交各个部分。
2. `--soft`：改动保持暂存；加上那个文件，再提交一次。（`git commit --amend` 一步就能做到同样的事。）
3. `--hard`：提交和它的改动都没了。请先查看 `git status`，免得丢失未提交的工作。
:::

::: exercise #e4 level=2 kind=conceptual minutes=5
**被删除的分支。** 昨天你用 `git branch -D` 删除了名为 `experiment` 的分支，今天你需要它上面的一次提交。怎样把这个分支找回来？
:::

::: solution
运行 `git reflog`，找到与 `experiment` 有关的最后一行，例如你在它上面做的一次提交，或者 `checkout: moving from experiment to main`。记下那次提交的哈希，然后运行 `git branch experiment <hash>`。分支就回来了，所有提交都在。
:::

::: exercise #e5 level=2 kind=coding minutes=7
**变基过程中的冲突。** 你在 `less-sugar` 上把糖改成了 30 g；与此同时，`main` 把它改成了 40 g。把 `less-sugar` 变基到 `main` 上，最终定为 35 g。要跟着操作，请像第 5 模块第 3 节那样做出这两处改动。
:::

::: solution
变基在发生冲突的那次提交处停下。解决文件中的冲突，暂存它，然后继续：

{{SESSION:m08-e5-solution}}

看看这些标记：在变基中，`<<<<<<< HEAD` 下面是 `main` 的版本 40 g，`>>>>>>> cbca0db (Use less sugar)` 上面才是你的版本。这两个标签与合并时正好相反，因为变基是把你的提交重放到 `main` 之上，所以 HEAD 是新的基础。随后 `git rebase --continue` 提交这次重放的提交（在你的电脑上，它会让你编辑说明），并完成变基。
:::

::: exercise #e6 level=1 kind=conceptual minutes=4
**用哪个工具？** 为每种情况说出对应的命令。

1. 你最近一次尚未推送的提交的说明有个错字。
2. 共享的 `main` 上有一次提交导致构建失败。
3. 你需要一个干净的工作区十分钟，但不想提交。
4. 你的拉取请求中有一次“修正错字”的提交，它本该属于更早的一次提交。
5. 你重置得太远了，需要把那些提交找回来。
:::

::: solution
1. `git commit --amend`。
2. `git revert <commit>`。
3. `git stash`，然后 `git stash pop`。
4. `git commit --fixup <commit>` 和 `git rebase -i --autosquash main`，然后 `git push --force-with-lease`。
5. `git reflog`，然后 `git reset --hard <hash>`。
:::

## 自测 {#quiz}

```quiz
? 关于改写历史的规则是什么？
- [ ] 永远不要使用 `git rebase`。
- [x] 不要改写别人已经拿到的提交。
- [ ] 只在 `main` 上改写历史。
- [ ] 改写之后总是使用 `--force`。
> 在你自己尚未推送或未与人共享的工作上，改写没有问题；共享的提交要用 `git revert` 撤销。

? `git stash` 做什么？
- [ ] 把你的改动提交到服务器上的一个隐藏分支。
- [x] 保存你未提交的改动，并把工作区恢复到最近一次提交的状态。
- [ ] 删除你未提交的改动。
- [ ] 把分支往回移一次提交。
> 之后用 `git stash pop` 把改动取回来。

? 运行 `git reset --soft HEAD~1` 之后，最近一次提交中的改动在哪里？
- [x] 在暂存区中
- [ ] 只在 reflog 中
- [ ] 没了
- [ ] 在一个新分支上
> `--soft` 只移动分支；默认方式会取消暂存这些改动，`--hard` 则会删除它们。

? 哪条命令可能彻底毁掉未提交的工作？
- [ ] `git reset --soft HEAD~1`
- [ ] `git stash`
- [ ] `git rebase main`
- [x] `git reset --hard HEAD~1`
> `--hard` 会重置工作区；未提交的改动不在 reflog 中。

? 对一个已经推送过的分支变基之后，为什么 `git push` 会被拒绝？
- [ ] 变基失败了。
- [x] 变基后的提交取代了已推送的提交，所以这次推送不是快进。
- [ ] 变基后的分支无法推送。
- [ ] 远程仓库过时了。
> 如果分支只属于你一个人，就用 `--force-with-lease` 推送。

? 在变基到 `main` 的过程中，`<<<<<<< HEAD` 和 `=======` 之间是哪个版本？
- [ ] 你的分支上的版本
- [x] `main` 的版本，即这些提交正在被重放到的基础
- [ ] 第一次提交中的版本
- [ ] Git 建议的解决方案
> 在变基中，HEAD 是新的基础；你的提交的版本位于 `=======` 之后。

? `git reflog` 显示什么？
- [ ] 远程仓库上的每一次提交
- [ ] 即将被推送的提交
- [x] HEAD 到过的位置，包括已不在任何分支上的提交
- [ ] 你还没有提交的改动
> 用 reflog 中的哈希进行重置或创建分支，就能找回丢失的提交。
```

## 延伸阅读 {#reading}

- Scott Chacon 和 Ben Straub，《Pro Git》，第 [3.6 节：变基](https://git-scm.com/book/zh/v2/Git-分支-变基)、[7.3 节：贮藏与清理](https://git-scm.com/book/zh/v2/Git-工具-贮藏与清理)、[7.6 节：重写历史](https://git-scm.com/book/zh/v2/Git-工具-重写历史)和 [7.7 节：重置揭密](https://git-scm.com/book/zh/v2/Git-工具-重置揭密)。
- [git stash](https://git-scm.com/docs/git-stash)、[git reset](https://git-scm.com/docs/git-reset)、[git rebase](https://git-scm.com/docs/git-rebase) 和 [git reflog](https://git-scm.com/docs/git-reflog) 的参考页面。
`````


- [ ] **Step 4: Build, test and read**

```bash
node --test --test-concurrency=1 "tutorial-sources/git/tests/*.test.mjs"
node tutorial-sources/git/build.mjs
```

Expected:
- `# tests 60`, `# pass 60`;
- `Built modules 01, 02, 03, 04, 05, 06, 07, 08 in English and Chinese; ran 50 sessions …`.

Read both pages. Check that:
- the `before` and `after` graphs of `m08-rebase` show the soup commit moving on top of `main`, with `origin/soups` left on the old commit;
- the rebase output reads only `Successfully rebased and updated refs/heads/soups.`

- [ ] **Step 5: Commit**

```bash
git add tutorial-sources/git/src/en/module_08.md tutorial-sources/git/src/zh/module_08.md tutorial-sources/git/tests/lesson-facts.test.mjs docs/tutorials/git
git commit -m "Git series: Module 8 in English and Chinese" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Tutorials index card and full verification

- [ ] **Step 1: Update the Git card**

In `docs/tutorials/index.md`, replace `Modules 1 to 5 are available now;` with `Modules 1 to 8 are available now;`. Change nothing else in the file.

- [ ] **Step 2: Full verification**

```bash
node --test --test-concurrency=1 "tutorial-sources/git/tests/*.test.mjs"
node tutorial-sources/git/build.mjs
git status --short docs/tutorials/git
node tutorial-sources/git/build.mjs
git status --short docs/tutorials/git
node tutorial-sources/git/validate.mjs
python -m mkdocs build --strict -d <a temporary folder outside the repository>
```

Expected:
- the tests show `# pass 60` and `# fail 0`;
- both builds report 50 sessions;
- both `git status` commands print nothing, so two consecutive builds are byte-identical, pull merges included;
- the validator prints `PASS: modules 01, 02, 03, 04, 05, 06, 07, 08 in both languages: …`;
- MkDocs exits 0.

- [ ] **Step 3: Look at the screenshots**

Open the `wrwei-git-module-0[678]-*.png` files the validator saved. Check that transcripts, graphs and figures are legible at both widths, and that the Chinese is not garbled.

- [ ] **Step 4: Commit and stop**

```bash
git add docs/tutorials/index.md
git commit -m "Git series: Modules 1-8 available" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git log --oneline git-modules-03-05..git-modules-06-08
```

Report the commits and verification results. **Do not push or merge.**

---

### Task 7: Publication (only when the site owner asks)

Merge `git-modules-03-05` and then `git-modules-06-08` into `main` (or open pull requests), as the site owner chooses.
- The main checkout may hold another agent's uncommitted MDE work. Do not stash, reset or commit it; stop and ask if a merge would touch it.
- Pushing `main` runs `.github/workflows/deploy.yml`. Watch it with `gh run watch <run-id> --exit-status`.
- Then check that `https://wrwei.github.io/tutorials/git/module_06_EN.html`, `module_07_ZH.html` and `module_08_EN.html` return 200.
