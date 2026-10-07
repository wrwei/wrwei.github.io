# Git and Version Control Series: Tooling and Modules 1–2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the tooling of the bilingual Git tutorial series (sandboxed command sessions run with real Git, commit-graph drawing, page builder, browser checks) and publish-ready Modules 1 and 2 in English and Chinese.

**Architecture:** Sources live in `tutorial-sources/git/` and are built into `docs/tutorials/git/`. Lessons place command sessions with `{{SESSION:id}}` markers. The build runs each session in a fresh sandbox with real Git and fixed names, dates, configuration and paths, so output and commit hashes are identical on every build. Pages are rendered with the AI series' Markdown dialect, following the MDE series' templates, parity checks and contracts.

**Tech Stack:** Node 22.2+ (`node:test`, `markdown-it` via `tutorial-sources/ai/tools`, `puppeteer-core`); Git, exactly `git version 2.50.1 (Apple Git-155)`; Chrome or Edge; MkDocs (root `requirements.txt`).

**Spec:** `tutorial-sources/git/SPEC.md` (approved 2026-10-07). Read it before starting.

**Provenance:** every code file in this plan was run in a scratch copy of the repository before the plan was written. All 25 tests pass, `build.mjs` built Modules 1 and 2 with stand-in prose, `validate.mjs` passed, and every external link in the frames returned HTTP 200. Copy code exactly as given.

## Global Constraints

- Git version: the build runs only with `git version 2.50.1 (Apple Git-155)`, recorded as "gitVersion" in `plan/series.json`. Node 22.2 or later.
- Every module is bilingual: English (`en`) and Simplified Chinese (`zh`, HTML `lang="zh-CN"`), with the same sections, sessions, graphs, figures, exercises and quiz answers.
- Output shown on pages comes only from the build's runs of real Git. Never type expected output by hand.
- Sessions use only `git` and the built-ins `pwd`, `ls`, `cd`, `mkdir` and `cat`, with plain arguments: no pipes, redirection, wildcards or variables.
- Pages carry the site's CC BY 4.0 notice and footer, and load the same Google Fonts link as the AI and CS series.
- Do not modify the AI series' shared files: `tutorial-sources/ai/tools/md.mjs`, `docs/tutorials/ai/assets/style.css` and `docs/tutorials/ai/assets/tutorial.js`.
- Progress keys start with `git-series:`. Session ids are `mNN-<words>` and equal their file names.
- Work on branch `git-series`. Commit after each task. **Do not push, merge into `main` or deploy unless the site owner explicitly asks** (Task 11).
- Commit messages end with the line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Run every command from the repository root unless a step says otherwise.

## Review Focus

1. **Output that varies between machines or builds:** sandbox paths, the builder's own Git configuration (`~/.gitconfig`, system config), dates or locale leaking into the output. Expected: output and hashes are identical on every machine. Pinned by the determinism, paths and person tests in `tests/session.test.mjs` (Task 1), the pinned hashes in `tests/series-sessions.test.mjs` (Task 6), and the clean-rebuild step in Task 10.
2. **A session command that learners cannot type in their own shell** (pipes, wildcards, `$` inside double quotes). Expected: the build rejects it, naming the line. Pinned by the parser tests in `tests/session.test.mjs` (Task 1).
3. **Building with another Git version** (for example on Windows), which would silently change many outputs. Expected: the build stops and names both versions. Pinned by `tests/build.test.mjs` (Task 5).
4. **The Chinese edition drifting from the English one:** a missing session or graph, or re-ordered quiz answers. Expected: the build stops and names the difference. Pinned by `tests/pages.test.mjs` (Task 4) and `tests/build.test.mjs` (Task 5).
5. **Copying a transcript copies the prompt or output, or code renders in a proportional font.** Expected: Copy gives only the command, and code renders in DM Mono. Pinned by the font assertion in `tests/pages.test.mjs` (Task 4) and the copy checks in `validate.mjs` (Task 9).

## File Structure

```
tutorial-sources/git/
  SPEC.md                      design (exists)
  PLAN.md                      this plan
  README.md                    build, check, session format, version changes            (Task 10)
  GLOSSARY.md                  English–Chinese terminology                              (Task 7)
  tools/session.mjs            parseSession, splitCommand, runSession, gitVersion, PERSONAS (Task 1)
  tools/graph.mjs              layout, parseRefs, graphSvg                              (Task 2)
  tools/highlight.mjs          highlightCommand, highlightBlocks                        (Task 3)
  tools/pages.mjs              expandSessions, renderLesson, checkParity, checkContract, renderOverview (Task 4)
  build.mjs                    runModuleSessions, build({root, dest, git, expectVersion}) + CLI (Task 5)
  validate.mjs                 browser checks of the built pages                        (Task 9)
  plan/series.json, plan/module_01.json, plan/module_02.json                            (Task 6)
  assets/style.css, assets/favicon.svg                                                  (Task 6)
  figures/en/fig-02-01.svg, figures/zh/fig-02-01.svg                                    (Task 6)
  sessions/module_01/*.session (4), sessions/module_02/*.session (6)                    (Task 6)
  src/en/module_01.md, src/zh/module_01.md                                              (Task 7)
  src/en/module_02.md, src/zh/module_02.md                                              (Task 8)
  tests/*.test.mjs, tests/fixtures/series/                                              (Tasks 1–6)
docs/tutorials/git/            generated: pages and assets                              (Tasks 7–8)
docs/tutorials/index.md        add the series card                                      (Task 10)
```

Test command used throughout (Node expands the quoted pattern itself, so it also works in PowerShell):

```
node --test --test-concurrency=1 "tutorial-sources/git/tests/*.test.mjs"
```

---

### Task 1: The session sandbox and runner

**Files:**
- Create: `tutorial-sources/git/tools/session.mjs`
- Create: `tutorial-sources/git/tests/session.test.mjs`

**Interfaces:**
- Consumes: nothing (Node built-ins and the `git` program).
- Produces:
  - `PERSONAS = {alex: {name: 'Alex Smith', email: 'alex@example.com'}, sam: {name: 'Sam Lee', email: 'sam@example.com'}}` and `BUILTINS = ['pwd','ls','cd','mkdir','cat']`.
  - `splitCommand(line, where): string[]` splits a command like a shell does and rejects shell features.
  - `parseSession(text, name): {title: {en, zh}, role: 'example'|'solution', steps}`. A step is one of:
    - `{kind:'run', line, words, shown, expectFail, where}`;
    - `{kind:'file', path, content, shown, where}`;
    - `{kind:'as', persona, where}`;
    - `{kind:'graph', label, where}`.
  - `runSession(session, {sandbox, git?}): {record, graphs, problems}`.
    - `record` lists, in order, `{kind:'command', line, output, ok}`, `{kind:'file', path, content}`, `{kind:'as', persona}` or `{kind:'graph', label}`.
    - `graphs` maps each label to `{commits: [{short, hash, parents, refs, subject}], text}`.
    - `problems` is a list of messages.
  - `gitVersion(git?): string` returns the first line of `git --version`.
- The sandbox's fixed environment, which later tasks and lessons rely on:
  - Display paths are `/home/alex`, `/home/sam` and `/srv/git`.
  - The clock starts at Monday 5 January 2026, 09:00 UTC, and advances 60 seconds per command, hidden ones included.
  - Each person has their own `HOME`. The system config holds only `init.defaultBranch = main`.
  - The locale is `LANG=C`, the editor is `true`, and there is no pager.

- [ ] **Step 1: Create the working branch and check the tools**

```bash
git switch -c git-series
npm ci --prefix tutorial-sources/ai/tools
git --version
```

Expected: `Switched to a new branch 'git-series'`, then `added … packages`, then exactly `git version 2.50.1 (Apple Git-155)`. On a different Git version, stop and tell the site owner. The pinned version is a spec decision, and changing it is a reviewed step (README, Task 10).

- [ ] **Step 2: Write the failing test**

`tutorial-sources/git/tests/session.test.mjs`:

`````js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {parseSession, splitCommand, runSession, gitVersion} from '../tools/session.mjs';

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
  assert.equal(graph.commits[0].refs, 'HEAD -> main, origin/main, origin/HEAD');
  assert.match(graph.text, /^\* \w{7} \(HEAD -> main, origin\/main, origin\/HEAD\) Start\n$/);
});

test('a graph of an empty repository is reported as a problem', () => {
  assert.match(run('$ git init empty\n$ cd empty\n@graph nothing\n').problems[0], /no commits to draw/);
});

test('gitVersion reads the version line', () => {
  assert.match(gitVersion(), /^git version \d+\.\d+\.\d+/);
});
`````


- [ ] **Step 3: Run the test to see it fail**

Run: `node --test --test-concurrency=1 "tutorial-sources/git/tests/session.test.mjs"`
Expected: FAIL with `Cannot find module '…/tutorial-sources/git/tools/session.mjs'`.

- [ ] **Step 4: Write the implementation**

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
export function splitCommand(line, where) {
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
    if ('|&;<>$`\\*?(){}'.includes(ch)) throw new Error(`${where}: shell syntax "${ch}" is not supported; a session runs one plain command per line`);
    word += ch;
    started = true;
  }
  if (quote) throw new Error(`${where}: a quote is not closed`);
  if (started) words.push(word);
  return words;
}

/**
 * Parses a session script. The header holds "title:" and "title-zh:" (and optionally "role: solution")
 * and ends at "---". Then, one step per line:
 *   $ command      shown, must succeed          $! command   shown, must fail
 *   > command      hidden setup, must succeed   @as sam      act as another person
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
    if ((m = /^(\$!|\$|>)\s+(.+)$/.exec(line))) {
      const words = splitCommand(m[2], where);
      if (words[0] !== 'git' && !BUILTINS.includes(words[0])) throw new Error(`${where}: "${words[0]}" is neither git nor a built-in (${BUILTINS.join(', ')})`);
      steps.push({kind: 'run', line: m[2].trim(), words, shown: m[1] !== '>', expectFail: m[1] === '$!', where});
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
 * Runs a parsed session in `sandbox`, an empty directory. Returns
 *   record:   what the lesson shows, in order: {kind:'command', line, output, ok} | {kind:'file', path, content}
 *             | {kind:'as', persona} | {kind:'graph', label}
 *   graphs:   label -> {commits, text} for each @graph step
 *   problems: messages for every step that did not behave as declared (empty when all is well)
 */
export function runSession(session, {sandbox, git = 'git'}) {
  const root = fs.realpathSync(sandbox);
  const places = {alex: path.join(root, 'alex'), sam: path.join(root, 'sam'), server: path.join(root, 'server')};
  const shown = [[places.alex, '/home/alex'], [places.sam, '/home/sam'], [places.server, '/srv/git']];
  for (const dir of [...Object.values(places), path.join(root, 'config-alex'), path.join(root, 'config-sam')]) fs.mkdirSync(dir, {recursive: true});
  const systemConfig = path.join(root, 'gitconfig-system');
  fs.writeFileSync(systemConfig, '[init]\n\tdefaultBranch = main\n');
  const outputFile = path.join(root, 'output.txt');
  const cwd = {alex: places.alex, sam: places.sam};
  let persona = 'alex';
  let clock = START;

  const forward = p => p.replace(/\\/g, '/');
  const toShown = text => shown.reduce((t, [real, nice]) => t.split(real).join(nice).split(forward(real)).join(nice), text);
  const toReal = p => {
    for (const [real, nice] of shown) if (p === nice || p.startsWith(nice + '/')) return path.join(real, p.slice(nice.length));
    return path.resolve(cwd[persona], p);
  };
  const env = () => {
    const who = PERSONAS[persona];
    const date = `@${clock} +0000`;
    const config = path.join(root, `config-${persona}`);
    return {
      PATH: process.env.PATH, SYSTEMROOT: process.env.SYSTEMROOT ?? '',
      HOME: config, USERPROFILE: config, XDG_CONFIG_HOME: path.join(config, '.config'), GIT_CONFIG_SYSTEM: systemConfig,
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
    switch (name) {
      case 'pwd': return {status: 0, output: toShown(cwd[persona]) + '\n'};
      case 'cd': {
        const target = !args[0] || args[0] === '~' ? places[persona] : toReal(args[0]);
        if (!fs.existsSync(target) || !fs.statSync(target).isDirectory()) return fail(`cd: no such directory: ${args[0]}`);
        cwd[persona] = target;
        return {status: 0, output: ''};
      }
      case 'mkdir': {
        for (const arg of args) {
          const target = toReal(arg);
          if (fs.existsSync(target)) return fail(`mkdir: ${arg}: File exists`);
          fs.mkdirSync(target);
        }
        return {status: 0, output: ''};
      }
      case 'ls': {
        const all = args.includes('-a');
        const dir = toReal(args.find(a => !a.startsWith('-')) ?? '.');
        if (!fs.existsSync(dir)) return fail(`ls: ${args.find(a => !a.startsWith('-'))}: No such file or directory`);
        const names = fs.readdirSync(dir).filter(n => all || !n.startsWith('.')).sort();
        const list = all ? ['.', '..', ...names] : names;
        return {status: 0, output: list.length ? list.join('  ') + '\n' : ''};
      }
      case 'cat': {
        let output = '';
        for (const arg of args) {
          const file = toReal(arg);
          if (!fs.existsSync(file)) return fail(`cat: ${arg}: No such file or directory`);
          output += fs.readFileSync(file, 'utf8');
        }
        return {status: 0, output};
      }
    }
    throw new Error(`Unknown built-in ${name}`);
  };

  const record = [];
  const graphs = {};
  const problems = [];
  for (const step of session.steps) {
    if (step.kind === 'as') { persona = step.persona; record.push({kind: 'as', persona}); continue; }
    if (step.kind === 'file') {
      const target = toReal(step.path);
      fs.mkdirSync(path.dirname(target), {recursive: true});
      fs.writeFileSync(target, step.content);
      if (step.shown) record.push({kind: 'file', path: step.path, content: step.content});
      continue;
    }
    if (step.kind === 'graph') {
      const log = runGit(['log', '--all', '--topo-order', '--format=%h%x09%H%x09%P%x09%D%x09%s']);
      const text = runGit(['log', '--all', '--graph', '--oneline', '--decorate']);
      if (log.status !== 0 || !log.output.trim()) { problems.push(`${step.where}: no commits to draw for "@graph ${step.label}"`); continue; }
      const commits = log.output.trimEnd().split('\n').map(line => {
        const [short, hash, parents, refs, subject] = line.split('\t');
        return {short, hash, parents: parents ? parents.split(' ') : [], refs, subject};
      });
      graphs[step.label] = {commits, text: toShown(text.output)};
      record.push({kind: 'graph', label: step.label});
      continue;
    }
    clock += TICK;
    // arguments may name the readable paths a learner sees, such as /srv/git/recipes.git
    const args = step.words.slice(1).map(a => (shown.some(([, nice]) => a === nice || a.startsWith(nice + '/')) ? toReal(a) : a));
    const {status, output} = step.words[0] === 'git' ? runGit(args) : builtin(step.words);
    const ok = status === 0;
    if (ok === step.expectFail) {
      problems.push(`${step.where}: "${step.line}" ${ok ? 'succeeded, but is declared to fail ($!)' : `failed with exit code ${status}, but is declared to succeed`}\n${toShown(output)}`);
    }
    if (step.shown) record.push({kind: 'command', line: step.line, output: toShown(output), ok});
  }
  return {record, graphs, problems};
}
`````


Design notes, all found while prototyping (keep them):
- **Shared output file.** stdout and stderr go to one file descriptor so that their lines keep their order.
- **Shown paths in arguments.** Arguments that name a shown path (`/srv/git/…`) are mapped into the sandbox.
- **Empty repositories.** `git log --all` on an empty repository succeeds with no output, so an empty result counts as "nothing to draw".
- **Isolated configuration.** `GIT_CONFIG_SYSTEM` points at a sandbox file, which keeps out the machine's system configuration (on macOS that includes Apple's credential helper).

- [ ] **Step 5: Run the test to see it pass**

Run: `node --test --test-concurrency=1 "tutorial-sources/git/tests/session.test.mjs"`
Expected: PASS (`# pass 9`). The pinned hash `186280d` and date `09:04:00` prove the environment is fixed: four commands ran before the commit, so the clock reads 09:04.

- [ ] **Step 6: Commit**

```bash
git add tutorial-sources/git/tools/session.mjs tutorial-sources/git/tests/session.test.mjs
git commit -m "Git series: run command sessions with real Git in a fixed sandbox" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Commit graphs

**Files:**
- Create: `tutorial-sources/git/tools/graph.mjs`
- Create: `tutorial-sources/git/tests/graph.test.mjs`

**Interfaces:**
- Consumes: `escapeHtml` from `tutorial-sources/ai/tools/md.mjs` (existing).
- Produces:
  - `layout(commits): commits with {row, lane}`. The input is newest first in topological order, with full parent hashes.
  - `parseRefs(refs): [{text, kind: 'head'|'branch'|'remote'|'tag'}]`. `HEAD -> main` becomes `HEAD → main`, and `origin/HEAD` is dropped.
  - `graphSvg({commits, text}, caption?): string` returns one line of HTML with no blank lines: `<figure class="graph"><svg aria-hidden="true" …>…</svg><pre class="visually-hidden">git log --graph text</pre>[<figcaption>]</figure>`. CSS classes: `g-hash`, `g-subject`, `g-ref`, `g-head|g-branch|g-remote|g-tag`, `g-ref-text`.

- [ ] **Step 1: Write the failing test**

`tutorial-sources/git/tests/graph.test.mjs`:

`````js
import test from 'node:test';
import assert from 'node:assert/strict';
import {layout, parseRefs, graphSvg} from '../tools/graph.mjs';

const commit = (hash, parents, refs = '', subject = hash) => ({short: hash, hash, parents, refs, subject});

test('a straight history stays in one lane', () => {
  assert.deepEqual(layout([commit('c', ['b']), commit('b', ['a']), commit('a', [])]).map(c => [c.hash, c.row, c.lane]), [['c', 0, 0], ['b', 1, 0], ['a', 2, 0]]);
});

test('a branch takes a second lane and a merge brings it back', () => {
  // m merges f into main; f and d both grew from a; t is an unmerged branch tip from m
  const rows = layout([commit('t', ['m']), commit('m', ['d', 'f']), commit('f', ['a']), commit('d', ['a']), commit('a', [])]);
  assert.deepEqual(rows.map(c => [c.hash, c.lane]), [['t', 0], ['m', 0], ['f', 1], ['d', 0], ['a', 0]]);
  const fork = layout([commit('x', ['a']), commit('y', ['a']), commit('a', [])]);
  assert.deepEqual(fork.map(c => [c.hash, c.lane]), [['x', 0], ['y', 1], ['a', 0]]);
});

test('refs become labels, with HEAD made visible', () => {
  assert.deepEqual(parseRefs('HEAD -> main, origin/main, origin/HEAD, tag: v1.0, feature'), [
    {text: 'HEAD → main', kind: 'head'}, {text: 'origin/main', kind: 'remote'}, {text: 'v1.0', kind: 'tag'}, {text: 'feature', kind: 'branch'}]);
  assert.deepEqual(parseRefs('HEAD'), [{text: 'HEAD', kind: 'head'}]);
  assert.deepEqual(parseRefs(''), []);
});

test('the SVG is decorative and the git log text is there for screen readers', () => {
  const html = graphSvg({commits: [commit('b2', ['a1'], 'HEAD -> main', 'Add <pancakes> & syrup'), commit('a1', [])], text: '* b2 (HEAD -> main) Add <pancakes> & syrup  \n* a1 a1\n'});
  assert.match(html, /^<figure class="graph"><svg class="git-graph" [^>]*aria-hidden="true"/);
  assert.match(html, />HEAD → main<\/text>/);
  assert.match(html, />Add &lt;pancakes&gt; &amp; syrup<\/text>/);
  assert.match(html, /<pre class="visually-hidden">\* b2 \(HEAD -&gt; main\) Add &lt;pancakes&gt; &amp; syrup\n\* a1 a1<\/pre><\/figure>$/);
  assert(!html.includes('\n\n'), 'no blank line, which would end the HTML block in Markdown');
});
`````


- [ ] **Step 2: Run the test to see it fail**

Run: `node --test --test-concurrency=1 "tutorial-sources/git/tests/graph.test.mjs"`
Expected: FAIL with `Cannot find module '…/tools/graph.mjs'`.

- [ ] **Step 3: Write the implementation**

`tutorial-sources/git/tools/graph.mjs`:

`````js
// Commit graphs as SVG, drawn from real repository data: one row per commit, newest first (as in
// `git log --graph`), one lane per line of development, with branch, tag and HEAD labels.
import {escapeHtml as esc} from '../../ai/tools/md.mjs';

const ROW = 34;
const LANE = 22;
const TOP = 22;
const LEFT = 18;
const RADIUS = 6;
const CHAR = 7.2; // approximate width of one character of the 12px label font
const COLOURS = ['#2563EB', '#16A34A', '#D97706', '#9333EA', '#DC2626', '#0891B2'];

/**
 * Assigns each commit a row and a lane. `commits` are newest first, in topological order, with full
 * parent hashes, as `git log --all --topo-order` lists them. Returns the commits with {row, lane} added.
 */
export function layout(commits) {
  const lanes = []; // the commit each lane is waiting for
  const placed = new Map();
  commits.forEach((commit, row) => {
    let lane = lanes.indexOf(commit.hash);
    if (lane < 0) {
      lane = lanes.indexOf(null);
      if (lane < 0) lane = lanes.length;
    }
    for (let k = 0; k < lanes.length; k++) if (lanes[k] === commit.hash) lanes[k] = null;
    placed.set(commit.hash, {row, lane});
    const [first, ...others] = commit.parents;
    lanes[lane] = first ?? null;
    for (const parent of others) {
      if (lanes.includes(parent)) continue;
      let free = lanes.indexOf(null);
      if (free < 0) free = lanes.length;
      lanes[free] = parent;
    }
  });
  return commits.map(commit => ({...commit, ...placed.get(commit.hash)}));
}

/** "HEAD -> main, origin/main, tag: v1.0" becomes [{text: 'HEAD → main', kind: 'head'}, {text: 'origin/main', kind: 'remote'}, ...]. */
export function parseRefs(refs) {
  return (refs ? refs.split(', ') : []).filter(ref => !ref.endsWith('/HEAD')).map(ref => {
    if (ref.startsWith('HEAD -> ')) return {text: `HEAD → ${ref.slice(8)}`, kind: 'head'};
    if (ref === 'HEAD') return {text: 'HEAD', kind: 'head'};
    if (ref.startsWith('tag: ')) return {text: ref.slice(5), kind: 'tag'};
    return {text: ref, kind: ref.includes('/') ? 'remote' : 'branch'};
  });
}

const x = lane => LEFT + lane * LANE;
const y = row => TOP + row * ROW;

/** Draws the graph. `text` is the `git log --graph --oneline` output, kept for screen readers. */
export function graphSvg({commits, text}, caption = '') {
  const rows = layout(commits);
  const where = new Map(rows.map(c => [c.hash, c]));
  const width = Math.max(...rows.map(c => c.lane)) + 1;
  const labelX = LEFT + width * LANE + 8;
  const paths = [];
  for (const c of rows) {
    for (const parentHash of c.parents) {
      const p = where.get(parentHash);
      if (!p) continue;
      const colour = COLOURS[Math.max(c.lane, p.lane) % COLOURS.length];
      let d;
      if (p.lane === c.lane) d = `M${x(c.lane)} ${y(c.row)}V${y(p.row)}`;
      else if (p.lane > c.lane) d = `M${x(c.lane)} ${y(c.row)}C${x(c.lane)} ${y(c.row) + ROW / 2} ${x(p.lane)} ${y(c.row) + ROW / 2} ${x(p.lane)} ${y(c.row + 1)}V${y(p.row)}`;
      else d = `M${x(c.lane)} ${y(c.row)}V${y(p.row - 1)}C${x(c.lane)} ${y(p.row) - ROW / 2} ${x(p.lane)} ${y(p.row) - ROW / 2} ${x(p.lane)} ${y(p.row)}`;
      paths.push(`<path d="${d}" stroke="${colour}" stroke-width="2.5" fill="none"/>`);
    }
  }
  let longest = 0;
  const nodes = rows.map(c => {
    const colour = COLOURS[c.lane % COLOURS.length];
    let cursor = labelX;
    let label = `<text x="${cursor}" y="${y(c.row) + 4}" class="g-hash">${esc(c.short)}</text>`;
    cursor += c.short.length * CHAR + 8;
    for (const ref of parseRefs(c.refs)) {
      const w = ref.text.length * CHAR + 12;
      label += `<rect x="${cursor}" y="${y(c.row) - 9}" width="${w.toFixed(1)}" height="18" rx="9" class="g-ref g-${ref.kind}"/><text x="${(cursor + 6).toFixed(1)}" y="${y(c.row) + 4}" class="g-ref-text">${esc(ref.text)}</text>`;
      cursor += w + 6;
    }
    label += `<text x="${cursor.toFixed(1)}" y="${y(c.row) + 4}" class="g-subject">${esc(c.subject)}</text>`;
    longest = Math.max(longest, cursor + c.subject.length * CHAR);
    return `<circle cx="${x(c.lane)}" cy="${y(c.row)}" r="${RADIUS}" fill="#fff" stroke="${colour}" stroke-width="2.5"/>${label}`;
  });
  const svgWidth = Math.ceil(longest + 12);
  const svgHeight = TOP * 2 + (rows.length - 1) * ROW;
  const svg = `<svg class="git-graph" viewBox="0 0 ${svgWidth} ${svgHeight}" width="${svgWidth}" height="${svgHeight}" aria-hidden="true" focusable="false">${paths.join('')}${nodes.join('')}</svg>`;
  const alternative = text.split('\n').map(line => line.trimEnd()).join('\n').trim();
  return `<figure class="graph">${svg}<pre class="visually-hidden">${esc(alternative)}</pre>${caption ? `<figcaption>${esc(caption)}</figcaption>` : ''}</figure>`;
}
`````


- [ ] **Step 4: Run the test to see it pass**

Run: `node --test --test-concurrency=1 "tutorial-sources/git/tests/graph.test.mjs"`
Expected: PASS (`# pass 4`).

- [ ] **Step 5: Commit**

```bash
git add tutorial-sources/git/tools/graph.mjs tutorial-sources/git/tests/graph.test.mjs
git commit -m "Git series: draw commit graphs from repository data" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Command highlighting

**Files:**
- Create: `tutorial-sources/git/tools/highlight.mjs`
- Create: `tutorial-sources/git/tests/highlight.test.mjs`

**Interfaces:**
- Consumes: `escapeHtml` from `md.mjs`.
- Produces:
  - `highlightCommand(line): string`. `git` gets `hljs-keyword`, other programs `hljs-built_in`, the Git subcommand `hljs-title`, options `hljs-attr` and quoted text `hljs-string`. Removing the tags gives the line back exactly.
  - `highlightBlocks(html): string` rewrites `<pre><code class="language-gitcmd">` blocks to `<pre class="command">` with highlighted commands and leaves all other blocks alone.

- [ ] **Step 1: Write the failing test**

`tutorial-sources/git/tests/highlight.test.mjs`:

`````js
import test from 'node:test';
import assert from 'node:assert/strict';
import {highlightCommand, highlightBlocks} from '../tools/highlight.mjs';

const plain = html => html.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');

test('commands are highlighted without changing their text', () => {
  const html = highlightCommand('git commit -m "Add <b> & c"');
  assert.equal(html, '<span class="hljs-keyword">git</span> <span class="hljs-title">commit</span> <span class="hljs-attr">-m</span> <span class="hljs-string">&quot;Add &lt;b&gt; &amp; c&quot;</span>');
  for (const line of ['git log --oneline --all', "git config --global user.name 'Alex Smith'", 'cd recipes', 'ls -a', 'git remote add origin /srv/git/shop.git']) {
    assert.equal(plain(highlightCommand(line)), line);
  }
  assert.equal(highlightCommand('cd recipes'), '<span class="hljs-built_in">cd</span> recipes');
});

test('only command blocks are highlighted, and they get the command class', () => {
  const html = highlightBlocks('<pre><code class="language-gitcmd">git status</code></pre>\n<pre><code class="language-text">git status</code></pre>');
  assert.equal(html, '<pre class="command"><code class="language-gitcmd"><span class="hljs-keyword">git</span> <span class="hljs-title">status</span></code></pre>\n<pre><code class="language-text">git status</code></pre>');
});
`````


- [ ] **Step 2: Run the test to see it fail**

Run: `node --test --test-concurrency=1 "tutorial-sources/git/tests/highlight.test.mjs"`
Expected: FAIL with `Cannot find module '…/tools/highlight.mjs'`.

- [ ] **Step 3: Write the implementation**

`tutorial-sources/git/tools/highlight.mjs`:

`````js
// Highlighting for the commands in session transcripts (code blocks of language "gitcmd"): the
// program, the Git subcommand, options and quoted text. Removing the spans gives back the command.
import {escapeHtml as esc} from '../../ai/tools/md.mjs';

const span = (cls, text) => `<span class="hljs-${cls}">${esc(text)}</span>`;

/** Highlights one command line, such as git commit -m "Add a README". */
export function highlightCommand(line) {
  let out = '';
  let index = 0;
  for (const match of line.matchAll(/\s+|"[^"]*"|'[^']*'|[^\s"']+/g)) {
    const token = match[0];
    if (/^\s+$/.test(token)) { out += esc(token); continue; }
    if (/^["']/.test(token)) out += span('string', token);
    else if (index === 0) out += span(token === 'git' ? 'keyword' : 'built_in', token);
    else if (index === 1 && line.startsWith('git') && !token.startsWith('-')) out += span('title', token);
    else if (token.startsWith('-')) out += span('attr', token);
    else out += esc(token);
    index++;
  }
  return out;
}

const unescapeHtml = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');

/** Highlights every command block of rendered HTML; other code blocks are left alone. */
export function highlightBlocks(html) {
  return html.replace(/<pre([^>]*)><code class="language-gitcmd">([\s\S]*?)<\/code><\/pre>/g, (block, attributes, code) =>
    `<pre${attributes} class="command"><code class="language-gitcmd">${unescapeHtml(code).split('\n').map(line => (line ? highlightCommand(line) : line)).join('\n')}</code></pre>`);
}
`````


- [ ] **Step 4: Run the test to see it pass**

Run: `node --test --test-concurrency=1 "tutorial-sources/git/tests/highlight.test.mjs"`
Expected: PASS (`# pass 2`).

- [ ] **Step 5: Commit**

```bash
git add tutorial-sources/git/tools/highlight.mjs tutorial-sources/git/tests/highlight.test.mjs
git commit -m "Git series: highlight the commands in session transcripts" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Page templates

**Files:**
- Create: `tutorial-sources/git/tools/pages.mjs`
- Create: `tutorial-sources/git/tests/pages.test.mjs`

**Interfaces:**
- Consumes:
  - `makeMd`, `newEnv` and `escapeHtml` from `md.mjs`;
  - `graphSvg` (Task 2);
  - `highlightBlocks` (Task 3);
  - `PERSONAS` (Task 1).
- Produces:
  - `pad`, `lessonFile(n, lang)` (`module_01_EN.html` / `module_01_ZH.html`), `overviewFile(lang)` and `UI` labels.
  - `expandSessions(source, sessions: Map<id, {title, role, record, graphs}>, lang, version): {markdown, used, graphs}`.
    - A session block is `<div class="term" id="term-<id>">` holding:
      - a `.term-head` (label "Try it" or "Solution", and the title);
      - per command, a ```` ````gitcmd ```` fence plus an ```` ````output ```` fence (omitted when the output is empty);
      - per edit, `.term-edit` text followed by a `text` fence;
      - per person switch, `.term-who` text;
      - inline graph figures;
      - a `.term-caption` naming the Git version.
    - The class names avoid `.session`, which the shared study-plan styles and script already use.
  - `renderLesson({meta, lang, source, sessions, version, series, published, figDirs}): {html, record}`, with `record = {sections, sessions, graphs, figures, exercises, solutions, quizAnswers}`. It rejects `<!-- BRIEF` notes, missing figures, `$…$` maths and sessions that don't add up.
  - `checkParity(en, zh, number)`, `checkContract(record, contract, sessions, number)` and `renderOverview({series, published, lang})`.

- [ ] **Step 1: Write the failing test**

`tutorial-sources/git/tests/pages.test.mjs`:

`````js
import test from 'node:test';
import assert from 'node:assert/strict';
import {expandSessions, renderLesson, checkParity, checkContract} from '../tools/pages.mjs';

const VERSION = 'git version 2.50.1 (Apple Git-155)';
const graph = {commits: [{short: 'abc1234', hash: 'abc1234', parents: [], refs: 'HEAD -> main', subject: 'Start'}], text: '* abc1234 (HEAD -> main) Start\n'};
const sessions = new Map([['m01-first', {
  title: {en: 'First steps', zh: '第一步'}, role: 'example', graphs: {start: graph},
  record: [
    {kind: 'command', line: 'git init shop', output: 'Initialized empty Git repository in /home/alex/shop/.git/\n', ok: true},
    {kind: 'command', line: 'cd shop', output: '', ok: true},
    {kind: 'file', path: 'a.txt', content: 'one\n\nthree\n'},
    {kind: 'as', persona: 'sam'},
    {kind: 'graph', label: 'start'},
  ],
}]]);

test('a session marker becomes commands, outputs, edits, a person switch, a graph and a caption', () => {
  const {markdown, used, graphs} = expandSessions('Intro\n\n{{SESSION:m01-first}}\n\n{{GRAPH:m01-first@start}}\n', sessions, 'en', VERSION);
  assert.deepEqual(used, ['m01-first']);
  assert.deepEqual(graphs, ['m01-first@start']);
  assert.match(markdown, /<div class="term" id="term-m01-first">\n<div class="term-head"><span class="term-label">Try it<\/span><span class="term-title">First steps<\/span><\/div>/);
  assert.match(markdown, /````gitcmd\ngit init shop\n````\n\n````output\nInitialized empty Git repository in \/home\/alex\/shop\/\.git\/\n````/);
  assert.match(markdown, /````gitcmd\ncd shop\n````\n\n<div class="term-edit">/, 'no output block for a silent command');
  assert.match(markdown, /Create or edit <code>a\.txt<\/code> so that it contains:<\/div>\n\n````text\none\n\nthree\n````/);
  assert.match(markdown, /<div class="term-who">Now acting as Sam Lee, in Sam's own folder\.<\/div>/);
  assert.equal((markdown.match(/<figure class="graph">/g) || []).length, 2);
  assert.match(markdown, /Output from git version 2\.50\.1 \(Apple Git-155\), run while this page was built\./);
  assert.throws(() => expandSessions('{{SESSION:m01-none}}\n', sessions, 'en', VERSION), /Unknown session "m01-none"/);
  assert.throws(() => expandSessions('{{GRAPH:m01-first@nope}}\n', sessions, 'en', VERSION), /Unknown graph "m01-first@nope"/);
  assert.throws(() => expandSessions('See {{SESSION:m01-first}} here\n', sessions, 'en', VERSION), /line of its own/);
});

const meta = {number: 1, hours: 1, title: {en: 'T', zh: 'T'}, lead: {en: 'L', zh: 'L'}, prerequisites: {en: 'P', zh: 'P'}, outcomes: {en: ['O'], zh: ['O']},
  sessions: [{minutes: 60, title: {en: 'S', zh: 'S'}, activities: [{kind: 'practice', anchor: 's1', minutes: 60, text: {en: 'R', zh: 'R'}}]}]};
const series = {modules: [{number: 1, title: {en: 'T', zh: 'T'}}]};

test('a lesson page highlights commands, keeps outputs plain and reports its structure', () => {
  const source = '## One {#s1}\n\n{{SESSION:m01-first}}\n\n```quiz\n? Q\n- [x] A\n- [ ] B\n> E\n```\n';
  const {html, record} = renderLesson({meta, lang: 'en', source, sessions, version: VERSION, series, published: [1]});
  assert.match(html, /<pre class="command"><code class="language-gitcmd"><span class="hljs-keyword">git<\/span> <span class="hljs-title">init<\/span> shop\n<\/code><\/pre>/);
  assert.match(html, /<div class="output"><div class="output-label">Output<\/div><pre><code>Initialized empty Git repository/);
  assert.match(html, /data-key="git-series:m01:s1"/);
  assert.match(html, /<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=Fraunces[^"]*DM\+Mono[^"]*" rel="stylesheet">/, 'the page loads the fonts the stylesheet names');
  assert.match(html, /<span class="chip">Git 2\.50\.1 \(Apple Git-155\)<\/span>/);
  assert.deepEqual(record, {sections: ['s1'], sessions: ['m01-first'], graphs: [], figures: [], exercises: 0, solutions: 0, quizAnswers: [0]});
  assert.throws(() => renderLesson({meta, lang: 'en', source: '## One {#s1}\n\n<!-- BRIEF later -->\n', sessions, version: VERSION, series, published: [1]}), /BRIEF/);
});

test('parity and contract checks name what is wrong', () => {
  const en = {sections: ['s1', 'quiz'], sessions: ['m01-first'], graphs: [], figures: [], exercises: 1, solutions: 1, quizAnswers: [0, 2]};
  assert.doesNotThrow(() => checkParity(en, structuredClone(en), 1));
  assert.throws(() => checkParity(en, {...en, sessions: []}, 1), /sessions differ/);
  const contract = {sessions: [1, 2], exercises: 1, quiz: [2, 3], sections: ['s1', 'quiz']};
  assert.doesNotThrow(() => checkContract(en, contract, sessions, 1));
  assert.throws(() => checkContract(en, {...contract, sessions: [2, 3]}, sessions, 1), /1 teaching sessions; the contract allows 2–3/);
  assert.throws(() => checkContract({...en, sessions: []}, contract, sessions, 1), /exactly once/);
});
`````


- [ ] **Step 2: Run the test to see it fail**

Run: `node --test --test-concurrency=1 "tutorial-sources/git/tests/pages.test.mjs"`
Expected: FAIL with `Cannot find module '…/tools/pages.mjs'`.

- [ ] **Step 3: Write the implementation**

`tutorial-sources/git/tools/pages.mjs`:

`````js
// Page templates for the Git series. Reuses the AI series' Markdown dialect, styles and page script;
// the structure follows the MDE series' templates.
import assert from 'node:assert/strict';
import {makeMd, newEnv, escapeHtml as esc} from '../../ai/tools/md.mjs';
import {graphSvg} from './graph.mjs';
import {highlightBlocks} from './highlight.mjs';
import {PERSONAS} from './session.mjs';

export const pad = n => String(n).padStart(2, '0');
export const lessonFile = (n, lang) => `module_${pad(n)}_${lang === 'en' ? 'EN' : 'ZH'}.html`;
export const overviewFile = lang => (lang === 'en' ? 'index.html' : 'index_ZH.html');
const other = lang => (lang === 'en' ? 'zh' : 'en');
const htmlLang = lang => (lang === 'en' ? 'en' : 'zh-CN');
// The fonts the shared stylesheet names (as the AI and CS series load them); without them code falls back to a proportional font.
const FONTS = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;0,9..144,700;1,9..144,300&amp;family=DM+Mono:wght@400;500&amp;family=DM+Sans:wght@300;400;500;600&amp;display=swap';
const NOTICE = '<!-- Created by Ran Wei · Licensed under CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/) -->';

export const UI = {
  en: {
    series: 'Git and Version Control', crumb: 'Git Series', module: 'Module', contents: 'Contents',
    skip: 'Skip to content', outcomes: 'By the end you can', before: 'Before you start', progress: 'Progress',
    completed: 'sessions done', study: 'Study plan', session: 'Session', done: 'Done', min: 'min', hours: 'hours',
    language: '中文', roadmap: 'All modules', available: 'Available', planned: 'Planned', overview: 'Series overview',
    read: 'Read', practice: 'Practice', exercises: 'Exercises', quiz: 'Quiz', reading: 'Reading',
    tryIt: 'Try it', solution: 'Solution',
    edit: path => `Create or edit <code>${esc(path)}</code> so that it contains:`,
    as: persona => persona === 'alex' ? `Back to ${PERSONAS.alex.name}, in Alex's own folder.` : `Now acting as ${PERSONAS[persona].name}, in ${PERSONAS[persona].name.split(' ')[0]}'s own folder.`,
    captured: version => `Output from ${version}, run while this page was built. Other versions of Git may word some messages differently.`,
    planLead: 'Times are estimates and include typing the commands. Progress is saved in this browser and shared by both language editions.',
    chipSessions: n => `${n} command sessions`,
  },
  zh: {
    series: 'Git 与版本控制', crumb: 'Git 系列', module: '模块', contents: '目录',
    skip: '跳到正文', outcomes: '完成后你能够', before: '开始之前', progress: '进度',
    completed: '个时段已完成', study: '学习计划', session: '时段', done: '已完成', min: '分钟', hours: '小时',
    language: 'English', roadmap: '全部模块', available: '已开放', planned: '计划中', overview: '系列概览',
    read: '阅读', practice: '动手', exercises: '练习', quiz: '自测', reading: '延伸阅读',
    tryIt: '动手试试', solution: '参考解答',
    edit: path => `创建或编辑 <code>${esc(path)}</code>，使其内容为：`,
    as: persona => persona === 'alex' ? `回到 ${PERSONAS.alex.name}，在 Alex 自己的文件夹中。` : `现在以 ${PERSONAS[persona].name} 的身份操作，在其自己的文件夹中。`,
    captured: version => `以下输出来自 ${version}，在构建本页时实际运行得到。其他版本的 Git 提示措辞可能略有不同。`,
    planLead: '时间为估计值，包含输入命令的时间。进度保存在当前浏览器，中英文版本共享。',
    chipSessions: n => `${n} 个命令练习`,
  },
};

const fence = (language, text) => {
  const body = text.replace(/\n$/, '');
  assert(!/^`{4,}/m.test(body), 'a line starts with four backticks');
  return ['````' + language, body, '````', ''];
};

function sessionBlock(id, session, lang, version) {
  const L = UI[lang];
  const lines = [
    `<div class="term" id="term-${id}">`,
    `<div class="term-head"><span class="term-label">${session.role === 'solution' ? L.solution : L.tryIt}</span><span class="term-title">${esc(session.title[lang])}</span></div>`,
    '',
  ];
  for (const item of session.record) {
    if (item.kind === 'command') {
      lines.push(...fence('gitcmd', item.line));
      if (item.output.trim()) lines.push(...fence('output', item.output.split('\n').map(l => l.trimEnd()).join('\n').trimEnd()));
    } else if (item.kind === 'file') {
      lines.push(`<div class="term-edit">${L.edit(item.path)}</div>`, '', ...fence('text', item.content));
    } else if (item.kind === 'as') {
      lines.push(`<div class="term-who">${esc(L.as(item.persona))}</div>`, '');
    } else if (item.kind === 'graph') {
      lines.push(graphSvg(session.graphs[item.label]), '');
    }
  }
  lines.push(`<div class="term-caption">${esc(L.captured(version))}</div>`, '', '</div>');
  return lines.join('\n');
}

/** Replaces "{{SESSION:id}}" and "{{GRAPH:id@label}}" lines with the session transcript or one of its graphs. */
export function expandSessions(source, sessions, lang, version) {
  const used = [];
  const graphs = [];
  let markdown = source.replace(/^\{\{SESSION:([a-z0-9-]+)\}\}[ \t]*$/gm, (_, id) => {
    const session = sessions.get(id);
    assert(session, `Unknown session "${id}"`);
    used.push(id);
    return sessionBlock(id, session, lang, version);
  });
  markdown = markdown.replace(/^\{\{GRAPH:([a-z0-9-]+)@([a-z0-9-]+)\}\}[ \t]*$/gm, (_, id, label) => {
    const graph = sessions.get(id)?.graphs[label];
    assert(graph, `Unknown graph "${id}@${label}"`);
    graphs.push(`${id}@${label}`);
    return graphSvg(graph);
  });
  assert(!/\{\{(SESSION|GRAPH):/.test(markdown), 'Every {{SESSION:…}} and {{GRAPH:…}} marker must be on a line of its own');
  return {markdown, used, graphs};
}

function head(title, lead, lang) {
  return `${NOTICE}\n<!DOCTYPE html><html lang="${htmlLang(lang)}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(title)} — ${esc(UI[lang].series)}</title><meta name="description" content="${esc(lead)}"><link rel="icon" type="image/svg+xml" href="assets/favicon.svg"><link rel="preconnect" href="https://fonts.googleapis.com"><link href="${FONTS}" rel="stylesheet"><link rel="stylesheet" href="assets/style.css"></head>`;
}

function footer(lang) {
  return `<footer class="site-footer">${lang === 'en' ? 'Created by' : '作者'} Ran Wei · <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></footer>`;
}

function studyPlan(meta, lang) {
  const L = UI[lang];
  assert.equal(meta.sessions.reduce((sum, s) => sum + s.minutes, 0), meta.hours * 60, `Module ${meta.number}: sessions must add up to ${meta.hours} hours`);
  const cards = meta.sessions.map((session, index) => {
    assert.equal(session.activities.reduce((sum, a) => sum + a.minutes, 0), session.minutes, `Module ${meta.number} session ${index + 1}: activities must add up to the session`);
    const activities = session.activities.map(a => {
      assert(typeof L[a.kind] === 'string', `Unknown activity kind "${a.kind}"`);
      return `<li class="act act-${a.kind}"><span class="act-kind">${L[a.kind]}</span><span class="act-what"><a href="#${a.anchor}">${esc(a.text[lang])}</a></span><span class="act-min">${a.minutes}</span></li>`;
    }).join('');
    return `<div class="session"><div class="session-head"><span class="session-n">${L.session} ${index + 1}</span><span class="session-min">${session.minutes} ${L.min}</span></div><div class="session-title">${esc(session.title[lang])}</div><ul class="acts">${activities}</ul><label class="session-done"><input type="checkbox" data-key="git-series:m${pad(meta.number)}:s${index + 1}"> ${L.done}</label></div>`;
  }).join('');
  return `<section class="plan" id="plan"><div class="plan-head"><h2 class="plan-title">${L.study}</h2><span class="plan-total">${meta.hours} ${L.hours}</span></div><p class="plan-lead">${esc(L.planLead)}</p><div class="sessions">${cards}</div></section>`;
}

/** Renders one lesson page. Returns the page and a record used for the English/Chinese parity check. */
export function renderLesson({meta, lang, source, sessions, version, series, published, figDirs = []}) {
  const L = UI[lang];
  const file = lessonFile(meta.number, lang);
  assert(!source.includes('<!-- BRIEF'), `${file}: replace every <!-- BRIEF --> note with finished text`);
  const {markdown, used, graphs} = expandSessions(source, sessions, lang, version);
  const env = newEnv();
  const body = highlightBlocks(makeMd({lang, figDirs}).render(markdown, env));
  assert.deepEqual(env.errors, [], `${file}: ${JSON.stringify(env.errors)}`);
  assert.deepEqual(env.missingFigures, [], `${file}: missing figures ${env.missingFigures.join(', ')}`);
  assert.equal(env.math.length, 0, `${file}: text between two "$" signs was read as maths; write \\$ for a literal dollar sign`);
  const record = {
    sections: env.sections.map(s => s.id),
    sessions: used,
    graphs,
    figures: env.figures,
    exercises: env.counts.exercise,
    solutions: env.counts.solution,
    quizAnswers: [...body.matchAll(/class="quiz-q" data-answer="(\d+)"/g)].map(m => Number(m[1])),
  };
  const title = meta.title[lang];
  const toc = env.sections.map((s, i) => `<a href="#${s.id}"><span class="num">${i + 1}</span><span>${esc(s.title)}</span></a>`).join('');
  const mobile = env.sections.map(s => `<a href="#${s.id}">${esc(s.title)}</a>`).join('');
  const menu = published.map(n => {
    const m = series.modules.find(x => x.number === n);
    return `<a href="${lessonFile(n, lang)}"${n === meta.number ? ' class="active" aria-current="page"' : ''}>${pad(n)} · ${esc(m.title[lang])}</a>`;
  }).join('') + `<a href="${overviewFile(lang)}#modules">${L.roadmap}</a>`;
  const position = published.indexOf(meta.number);
  const previous = published[position - 1];
  const next = published[position + 1];
  const back = previous ? `<a href="${lessonFile(previous, lang)}">← ${L.module} ${pad(previous)}</a>` : `<a href="${overviewFile(lang)}">← ${L.overview}</a>`;
  const forward = next ? `<a href="${lessonFile(next, lang)}">${L.module} ${pad(next)} →</a>` : `<a href="${overviewFile(lang)}#modules">${L.roadmap} →</a>`;
  const teaching = used.filter(id => sessions.get(id).role === 'example').length;
  const chips = [`${meta.hours} ${L.hours}`, `${meta.sessions.length} ${lang === 'en' ? 'study sessions' : '个时段'}`, L.chipSessions(teaching), version.replace(/^git version /, 'Git ')];
  const outcomes = meta.outcomes[lang].map(x => `<li>${esc(x)}</li>`).join('');
  const page = head(title, meta.lead[lang], lang)
    + `<body data-module="${meta.number}"><a class="skip-link" href="#main">${L.skip}</a><div id="progress-bar"></div>`
    + `<header id="topbar"><a href="../../tutorials/" class="brand">Ran <span>Wei</span></a><span class="sep">/</span><a href="${overviewFile(lang)}" class="crumb">${L.crumb}</a><div class="module-dropdown" id="moduleDropdown"><button class="badge" type="button" aria-expanded="false" aria-controls="module-menu">${L.module} ${pad(meta.number)}</button><div class="dropdown-menu" id="module-menu">${menu}</div></div><a class="lang-switch" href="${lessonFile(meta.number, other(lang))}" hreflang="${htmlLang(other(lang))}">${L.language}</a></header>`
    + `<div id="layout"><aside id="sidebar"><div class="side-progress"><div class="side-progress-label">${L.progress}: <span class="side-progress-n">0</span>/${meta.sessions.length} ${L.completed}</div><div class="side-progress-bar"><span></span></div></div><div class="sidebar-label">${L.contents}</div><nav aria-label="${L.contents}">${toc}</nav></aside>`
    + `<main id="main"><div class="module-hero"><div class="series">${L.series} — Ran Wei</div><h1 class="module-title">${esc(title)}</h1><p class="module-lead">${esc(meta.lead[lang])}</p><div class="hero-chips">${chips.map((c, i) => `<span class="chip${i === 0 ? ' chip-time' : ''}">${esc(c)}</span>`).join('')}</div></div>`
    + `<section class="glance"><div class="glance-col"><h2 class="glance-h">${L.outcomes}</h2><ul class="outcomes">${outcomes}</ul></div><div class="glance-col"><h2 class="glance-h">${L.before}</h2><p>${esc(meta.prerequisites[lang])}</p></div></section>`
    + `<details class="mobile-toc"><summary>${L.contents}</summary><nav aria-label="${L.contents}">${mobile}</nav></details>${studyPlan(meta, lang)}<div class="content">${body}</div>`
    + `<nav class="module-nav" aria-label="${L.roadmap}">${back}${forward}</nav>${footer(lang)}</main></div><script src="../ai/assets/tutorial.js" defer></script></body></html>`;
  return {html: page, record};
}

/** English and Chinese editions must have the same structure. */
export function checkParity(en, zh, number) {
  for (const key of ['sections', 'sessions', 'graphs', 'figures', 'exercises', 'solutions', 'quizAnswers']) {
    assert.deepEqual(zh[key], en[key], `Module ${pad(number)}: the Chinese edition's ${key} differ from the English edition's`);
  }
}

/** A module's contract: plan/module_NN.json "contract". `sessions` maps id -> session for this module. */
export function checkContract(record, contract, sessions, number) {
  const where = `Module ${pad(number)}`;
  const teaching = [...sessions.values()].filter(s => s.role === 'example').length;
  assert(teaching >= contract.sessions[0] && teaching <= contract.sessions[1], `${where}: ${teaching} teaching sessions; the contract allows ${contract.sessions.join('–')}`);
  assert.deepEqual([...record.sessions].sort(), [...sessions.keys()].sort(), `${where}: every session must be shown exactly once`);
  assert.equal(record.exercises, contract.exercises, `${where}: ${record.exercises} exercises; the contract needs ${contract.exercises}`);
  assert.equal(record.solutions, contract.exercises, `${where}: every exercise needs a worked solution`);
  const quiz = record.quizAnswers.length;
  assert(quiz >= contract.quiz[0] && quiz <= contract.quiz[1], `${where}: ${quiz} quiz questions; the contract allows ${contract.quiz.join('–')}`);
  for (const id of contract.sections) assert(record.sections.includes(id), `${where}: section {#${id}} is missing`);
}

/** The series overview: introduction, how to study, module cards and acknowledgements. */
export function renderOverview({series, published, lang}) {
  const L = UI[lang];
  const text = series.overview[lang];
  const cards = series.modules.map(m => {
    const available = published.includes(m.number);
    const tag = available ? 'a' : 'article';
    const href = available ? ` href="${lessonFile(m.number, lang)}"` : '';
    return `<${tag}${href} class="module-card${available ? '' : ' planned'}"><div class="card-num">${L.module} ${pad(m.number)}</div><div class="card-title">${esc(m.title[lang])}</div><div class="card-desc">${esc(m.summary[lang])}</div><div class="card-status">${available ? L.available : L.planned} · ${m.hours} ${L.hours}</div><div class="card-footer"><span class="card-theme">${esc(m.focus)}</span><span class="card-lang">EN · 中文</span></div></${tag}>`;
  }).join('');
  const hours = series.modules.reduce((sum, m) => sum + m.hours, 0);
  const paragraphs = list => list.map(p => `<p>${p}</p>`).join('');
  const body = `<body class="index-page"><a class="skip-link" href="#main">${L.skip}</a><nav class="site-nav" aria-label="${L.roadmap}"><a class="nav-brand" href="../../tutorials/">Ran <span>Wei</span></a><span class="nav-sep">/</span><span class="nav-crumb">${L.crumb}</span><a class="lang-switch" href="${overviewFile(other(lang))}" hreflang="${htmlLang(other(lang))}">${L.language}</a></nav>`
    + `<main id="main" style="max-width:none;padding:0"><div class="index-hero"><h1>${L.series}</h1><p class="lead">${esc(text.lead)}</p><div class="hero-tags"><span class="tag tag-module">${series.modules.length} ${lang === 'en' ? 'modules' : '个模块'}</span><span class="tag tag-time">${hours} ${L.hours}</span><span class="tag tag-theme">EN / 中文</span></div></div>`
    + `<div class="index-body"><h2>${lang === 'en' ? 'How to study' : '学习方式'}</h2>${paragraphs(text.study)}<h2 id="modules">${lang === 'en' ? 'The modules' : '模块列表'}</h2></div><div class="index-grid">${cards}</div>`
    + `<div class="index-body"><h2 id="acknowledgements">${lang === 'en' ? 'Acknowledgements' : '致谢'}</h2>${paragraphs(text.acknowledgements)}</div></main>${footer(lang)}</body></html>`;
  return head(L.series, text.lead, lang) + body;
}
`````


Note: the page head loads the same Google Fonts as the AI and CS series. Without them, the shared stylesheet's code font (`'DM Mono', 'Fira Code', Consolas, 'PingFang SC', …`) falls back to a proportional font on macOS, and `--staged` renders like a dash. The MDE series' pages, which omit the link, have this problem.

- [ ] **Step 4: Run the test to see it pass**

Run: `node --test --test-concurrency=1 "tutorial-sources/git/tests/pages.test.mjs"`
Expected: PASS (`# pass 3`).

- [ ] **Step 5: Commit**

```bash
git add tutorial-sources/git/tools/pages.mjs tutorial-sources/git/tests/pages.test.mjs
git commit -m "Git series: lesson and overview page templates" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: The build

**Files:**
- Create: `tutorial-sources/git/build.mjs`
- Create: `tutorial-sources/git/tests/build.test.mjs`
- Create: `tutorial-sources/git/tests/fixtures/series/` (a two-module mini series, files below)

**Interfaces:**
- Consumes: Task 1 (`parseSession`, `runSession`, `gitVersion`) and Task 4 (`renderLesson`, `renderOverview`, `checkParity`, `checkContract`, `lessonFile`, `overviewFile`, `pad`).
- Produces:
  - `runModuleSessions(dir, number, git?): Map<id, session & {record, graphs}>`. It runs each `*.session` in a fresh temporary sandbox and throws, listing every problem, when any session misbehaves.
  - `build({root?, dest?, git?, expectVersion?}): {published, sessions, version}`.
    - It stops unless `git --version` equals `expectVersion`, which defaults to `series.gitVersion`.
    - A module is published when both `src/en` and `src/zh` exist.
    - It copies `root/assets` and passes `figures/<lang>` as the figure folders.
  - CLI: `node tutorial-sources/git/build.mjs` prints `Built modules … in English and Chinese; ran N sessions with git version ….`

- [ ] **Step 1: Create the fixture series**

`tutorial-sources/git/tests/fixtures/series/plan/series.json`:

`````json
{
  "gitVersion": "the tests pass the version of the Git they run",
  "modules": [
    {"number": 1, "hours": 1, "focus": "Basics", "title": {"en": "First steps", "zh": "第一步"}, "summary": {"en": "Make a commit.", "zh": "做一次提交。"}},
    {"number": 2, "hours": 2, "focus": "Later", "title": {"en": "Later", "zh": "稍后"}, "summary": {"en": "Not written yet.", "zh": "尚未编写。"}}
  ],
  "overview": {
    "en": {"lead": "A fixture series.", "study": ["Study well."], "acknowledgements": ["Thanks."]},
    "zh": {"lead": "测试系列。", "study": ["好好学习。"], "acknowledgements": ["致谢。"]}
  }
}
`````

`tutorial-sources/git/tests/fixtures/series/plan/module_01.json`:

`````json
{
  "number": 1,
  "hours": 1,
  "title": {"en": "First steps", "zh": "第一步"},
  "lead": {"en": "Make a commit.", "zh": "做一次提交。"},
  "prerequisites": {"en": "None.", "zh": "无。"},
  "outcomes": {"en": ["Make a commit."], "zh": ["做一次提交。"]},
  "sessions": [
    {"minutes": 60, "title": {"en": "Everything", "zh": "全部"}, "activities": [
      {"kind": "practice", "anchor": "s1", "minutes": 50, "text": {"en": "Practise", "zh": "动手"}},
      {"kind": "quiz", "anchor": "quiz", "minutes": 10, "text": {"en": "Quiz", "zh": "自测"}}
    ]}
  ],
  "contract": {"sessions": [1, 1], "exercises": 1, "quiz": [1, 1], "sections": ["s1", "exercises", "quiz"]}
}
`````

`tutorial-sources/git/tests/fixtures/series/sessions/module_01/m01-hello.session`:

`````text
title: Your first commit
title-zh: 第一次提交
---
$ git init hello
$ cd hello
+file hello.txt
Hello, Git!
+end
$ git add hello.txt
$ git commit -m "Say hello"
@graph first
`````

`tutorial-sources/git/tests/fixtures/series/sessions/module_01/m01-hello-solution.session`:

`````text
title: Two commits
title-zh: 两次提交
role: solution
---
> git init hello
> cd hello
+hidden hello.txt
Hello
+end
> git add hello.txt
> git commit -m "Say hello"
$ git log --oneline
`````

`tutorial-sources/git/tests/fixtures/series/figures/en/fig-01-01.svg`:

`````xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><text>Three areas</text></svg>
`````

`tutorial-sources/git/tests/fixtures/series/figures/zh/fig-01-01.svg`:

`````xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><text>三个区域</text></svg>
`````

`tutorial-sources/git/tests/fixtures/series/assets/style.css`:

`````css
/* fixture */
`````

`tutorial-sources/git/tests/fixtures/series/src/en/module_01.md`:

`````markdown
## Hello {#s1}

::: figure #fig-01-01
The three areas.
:::

{{SESSION:m01-hello}}

{{GRAPH:m01-hello@first}}

## Exercises {#exercises}

::: exercise #e1 level=1 kind=coding minutes=5
Make two commits.
:::

::: solution
{{SESSION:m01-hello-solution}}
:::

## Quiz {#quiz}

```quiz
? Which one?
- [ ] This
- [x] That
> Because.
```
`````

`tutorial-sources/git/tests/fixtures/series/src/zh/module_01.md`:

`````markdown
## 你好 {#s1}

::: figure #fig-01-01
三个区域。
:::

{{SESSION:m01-hello}}

{{GRAPH:m01-hello@first}}

## 练习 {#exercises}

::: exercise #e1 level=1 kind=coding minutes=5
做两次提交。
:::

::: solution
{{SESSION:m01-hello-solution}}
:::

## 自测 {#quiz}

```quiz
? 哪一个？
- [ ] 这个
- [x] 那个
> 因为。
```
`````


- [ ] **Step 2: Write the failing test**

`tutorial-sources/git/tests/build.test.mjs`:

`````js
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {build} from '../build.mjs';
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
`````


- [ ] **Step 3: Run the test to see it fail**

Run: `node --test --test-concurrency=1 "tutorial-sources/git/tests/build.test.mjs"`
Expected: FAIL with `Cannot find module '…/tutorial-sources/git/build.mjs'`.

- [ ] **Step 4: Write the build**

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

/** Parses and runs every sessions/module_NN/*.session. Returns Map(id -> session with its record and graphs). */
export function runModuleSessions(dir, number, git = 'git') {
  const sessions = new Map();
  if (!fs.existsSync(dir)) return sessions;
  const problems = [];
  for (const name of fs.readdirSync(dir).filter(n => n.endsWith('.session')).sort()) {
    const id = name.slice(0, -'.session'.length);
    assert(/^[a-z0-9-]+$/.test(id) && id.startsWith(`m${pad(number)}-`), `${name}: session file names look like m${pad(number)}-<words>.session`);
    const session = parseSession(fs.readFileSync(path.join(dir, name), 'utf8'), name);
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'git-session-'));
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


- [ ] **Step 5: Run the whole suite**

Run: `node --test --test-concurrency=1 "tutorial-sources/git/tests/*.test.mjs"`
Expected: PASS, `# tests 22`, `# pass 22`.

- [ ] **Step 6: Commit**

```bash
git add tutorial-sources/git/build.mjs tutorial-sources/git/tests
git commit -m "Git series: build pages from lessons and sessions, on a pinned Git version" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Series configuration, assets, figure and the Module 1–2 sessions

**Files:**
- Create: `tutorial-sources/git/plan/series.json`, `plan/module_01.json`, `plan/module_02.json`
- Create: `tutorial-sources/git/assets/style.css`, `assets/favicon.svg`
- Create: `tutorial-sources/git/figures/en/fig-02-01.svg`, `figures/zh/fig-02-01.svg`
- Create: `tutorial-sources/git/sessions/module_01/` (4 files) and `sessions/module_02/` (6 files)
- Create: `tutorial-sources/git/tests/series-sessions.test.mjs`

**Interfaces:**
- Consumes: `runModuleSessions` (Task 5).
- Produces: the session ids that the lessons (Tasks 7–8) reference.
  - Module 1 (contract: 3–6 teaching sessions, 6 exercises, a 6–8 question quiz, sections `s1`–`s6`, `exercises`, `quiz`, `reading`):
    - teaching: `m01-version`, `m01-terminal`, `m01-config`;
    - solution: `m01-e4-solution`.
  - Module 2 (the same contract shape):
    - teaching: `m02-init`, `m02-first-commit`, `m02-staging` (graph `three-commits`), `m02-ignore`;
    - solutions: `m02-e3-solution`, `m02-e5-solution`.
  - The figure `fig-02-01`.

- [ ] **Step 1: Write the failing test**

It pins the outputs and hashes the lessons will discuss, so a change to a session cannot silently contradict the text.

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
  assert.deepEqual(graph.commits.map(c => [c.short, c.refs]), [['40bc459', 'HEAD -> main'], ['3f65e55', ''], ['907a979', '']]);
  const ignore = outputs('m02-ignore');
  assert.match(ignore[0], /shopping\.tmp/);
  assert.doesNotMatch(ignore[1], /shopping\.tmp/);
  assert.equal(outputs('m02-e3-solution').at(-1), '0bbe433 Add a soda bread recipe\n78fc921 Add a tomato soup recipe\n');
  assert.doesNotMatch(outputs('m02-e5-solution')[0], /photos/);
});
`````


- [ ] **Step 2: Run the test to see it fail**

Run: `node --test --test-concurrency=1 "tutorial-sources/git/tests/series-sessions.test.mjs"`
Expected: FAIL with `ENOENT: no such file or directory, scandir '…/tutorial-sources/git/sessions'`.

- [ ] **Step 3: Create the series and module configuration**

`tutorial-sources/git/plan/series.json`:

`````json
{
  "gitVersion": "git version 2.50.1 (Apple Git-155)",
  "modules": [
    {"number": 1, "hours": 2, "focus": "Setup", "title": {"en": "Why version control?", "zh": "为什么需要版本控制？"}, "summary": {"en": "The problems version control solves, how Git differs from older tools, installing Git, and telling it who you are.", "zh": "版本控制解决的问题、Git 与旧式工具的区别、安装 Git，以及告诉 Git 你是谁。"}},
    {"number": 2, "hours": 3, "focus": "init · add · commit", "title": {"en": "Your first repository", "zh": "你的第一个仓库"}, "summary": {"en": "Create a repository, learn the working tree, staging area and repository, make focused commits and ignore files Git should not track.", "zh": "创建仓库，认识工作区、暂存区与仓库，做出聚焦的提交，并忽略不该跟踪的文件。"}},
    {"number": 3, "hours": 3, "focus": "log · diff · restore", "title": {"en": "History and undoing", "zh": "查看历史与撤销"}, "summary": {"en": "Read history, compare versions, look at old versions safely, and undo mistakes at every stage.", "zh": "阅读历史、比较版本、安全地查看旧版本，并在各个阶段撤销错误。"}},
    {"number": 4, "hours": 3, "focus": "switch · merge", "title": {"en": "Branches", "zh": "分支"}, "summary": {"en": "Branches as movable labels, HEAD, switching between lines of work, and fast-forward and three-way merges.", "zh": "把分支理解为可移动的标签，认识 HEAD，在不同工作线之间切换，以及快进合并与三方合并。"}},
    {"number": 5, "hours": 2, "focus": "Conflicts", "title": {"en": "Merge conflicts", "zh": "合并冲突"}, "summary": {"en": "Why conflicts happen, how to read conflict markers, and how to resolve, finish or abort a merge.", "zh": "冲突为何发生、如何读懂冲突标记，以及如何解决、完成或放弃一次合并。"}},
    {"number": 6, "hours": 3, "focus": "clone · push · pull", "title": {"en": "Remotes", "zh": "远程仓库"}, "summary": {"en": "Clone, fetch, pull and push with a remote repository, first on your own computer and then on GitHub.", "zh": "与远程仓库进行克隆、获取、拉取和推送，先在自己的电脑上练习，再到 GitHub 上实践。"}},
    {"number": 7, "hours": 3, "focus": "GitHub", "title": {"en": "Collaborating with pull requests", "zh": "用拉取请求协作"}, "summary": {"en": "Feature branches, forks, pull requests, code review and keeping your work up to date with the team.", "zh": "功能分支、复刻、拉取请求、代码评审，以及让你的工作与团队保持同步。"}},
    {"number": 8, "hours": 3, "focus": "rebase · reflog", "title": {"en": "Rewriting history and recovering", "zh": "改写历史与恢复"}, "summary": {"en": "Tidy history with rebase, squash and amend, follow the one rule about shared history, and rescue work with reflog.", "zh": "用变基、压缩和修补整理历史，遵守关于共享历史的那条规则，并用 reflog 找回工作。"}},
    {"number": 9, "hours": 2, "focus": "Objects", "title": {"en": "How Git works inside", "zh": "Git 的内部原理"}, "summary": {"en": "Blobs, trees, commits, hashes and refs: the few ideas that explain everything Git does.", "zh": "数据对象、树对象、提交、哈希与引用：理解 Git 一切行为的少数几个概念。"}},
    {"number": 10, "hours": 3, "focus": "Capstone", "title": {"en": "Capstone: a team project", "zh": "综合项目：团队协作"}, "summary": {"en": "Two people, two clones and one shared repository build a small project from the first commit to a tagged release.", "zh": "两个人、两份克隆和一个共享仓库，从第一次提交到带标签的发布，完成一个小项目。"}}
  ],
  "overview": {
    "en": {
      "lead": "Learn Git from the very beginning: keep the history of your work, undo mistakes without fear, and collaborate with other people on GitHub. Every command in the series is typed on your own computer, and every output shown was produced by real Git.",
      "study": [
        "Each module takes two to three hours. Read a section, then type the commands of its session in your own terminal and compare what you see with the output on the page. Module 1 shows you how to install Git and set it up.",
        "The output on these pages was produced by the Git version named in each caption, with example names, dates and folders. Your names, dates, commit hashes and folders will differ, and other versions of Git word some messages a little differently; what the messages mean stays the same.",
        "Every module ends with exercises with worked solutions and a short self-check quiz. Your progress is saved in this browser and shared by the English and Chinese editions."
      ],
      "acknowledgements": [
        "This series was written for this site. For more depth it recommends, without copying from them, the free book <a href=\"https://git-scm.com/book/en/v2\">Pro Git</a> by Scott Chacon and Ben Straub, the official <a href=\"https://git-scm.com/docs\">Git reference</a>, <a href=\"https://docs.github.com/\">GitHub Docs</a> and, for extra practice with branches, <a href=\"https://learngitbranching.js.org/\">Learn Git Branching</a>."
      ]
    },
    "zh": {
      "lead": "从零开始学习 Git：保存工作的历史，放心地撤销错误，并在 GitHub 上与他人协作。本系列的每条命令都在你自己的电脑上输入，页面上的每段输出都由真实的 Git 产生。",
      "study": [
        "每个模块需要两到三小时。读完一节后，在你自己的终端中输入该节练习的命令，并把看到的结果与页面上的输出进行比较。第 1 模块会介绍如何安装和设置 Git。",
        "页面上的输出由各处说明中注明的 Git 版本产生，使用的是示例的姓名、日期和文件夹。你的姓名、日期、提交哈希和文件夹会有所不同，其他版本的 Git 提示措辞也可能略有差异，但这些提示的含义不变。",
        "每个模块最后都有附参考解答的练习和简短自测。学习进度保存在当前浏览器中，中英文版本共享。"
      ],
      "acknowledgements": [
        "本系列为本站编写。如需深入学习，推荐（但并未摘抄）Scott Chacon 与 Ben Straub 的免费图书 <a href=\"https://git-scm.com/book/zh/v2\">Pro Git</a>、官方 <a href=\"https://git-scm.com/docs\">Git 参考文档</a>、<a href=\"https://docs.github.com/zh\">GitHub 文档</a>，以及用于练习分支的 <a href=\"https://learngitbranching.js.org/?locale=zh_CN\">Learn Git Branching</a>。"
      ]
    }
  }
}
`````

`tutorial-sources/git/plan/module_01.json`:

`````json
{
  "number": 1,
  "hours": 2,
  "title": {"en": "Why version control?", "zh": "为什么需要版本控制？"},
  "lead": {"en": "See what version control is for, install Git, and set it up so that every commit you make says who made it.", "zh": "了解版本控制的用途，安装 Git，并完成设置，让你的每一次提交都写明作者是谁。"},
  "prerequisites": {"en": "A computer running Windows, macOS or Linux on which you can install software. No programming or terminal experience is needed.", "zh": "一台可以安装软件的 Windows、macOS 或 Linux 电脑。无需编程或终端经验。"},
  "outcomes": {
    "en": [
      "Explain the problems that version control solves.",
      "Tell centralised from distributed version control, and Git from GitHub.",
      "Install Git and check which version you have.",
      "Move around folders in a terminal with pwd, ls, cd and mkdir.",
      "Configure your name, email address, default branch and editor."
    ],
    "zh": [
      "解释版本控制所解决的问题。",
      "区分集中式与分布式版本控制，以及 Git 与 GitHub。",
      "安装 Git，并查看你所安装的版本。",
      "在终端中用 pwd、ls、cd 和 mkdir 在文件夹之间移动。",
      "配置你的姓名、电子邮件地址、默认分支和编辑器。"
    ]
  },
  "sessions": [
    {"minutes": 60, "title": {"en": "What version control is for", "zh": "版本控制的用途"}, "activities": [
      {"kind": "read", "anchor": "s1", "minutes": 15, "text": {"en": "Why version control?", "zh": "为什么需要版本控制？"}},
      {"kind": "read", "anchor": "s2", "minutes": 15, "text": {"en": "How version control works", "zh": "版本控制如何工作"}},
      {"kind": "practice", "anchor": "s3", "minutes": 30, "text": {"en": "Install Git", "zh": "安装 Git"}}
    ]},
    {"minutes": 60, "title": {"en": "Getting ready", "zh": "做好准备"}, "activities": [
      {"kind": "practice", "anchor": "s4", "minutes": 15, "text": {"en": "The terminal survival kit", "zh": "终端生存工具包"}},
      {"kind": "practice", "anchor": "s5", "minutes": 15, "text": {"en": "Introduce yourself to Git", "zh": "向 Git 介绍你自己"}},
      {"kind": "read", "anchor": "s6", "minutes": 5, "text": {"en": "Git in editors and apps", "zh": "编辑器和应用中的 Git"}},
      {"kind": "exercises", "anchor": "exercises", "minutes": 20, "text": {"en": "Six exercises", "zh": "六道练习"}},
      {"kind": "quiz", "anchor": "quiz", "minutes": 5, "text": {"en": "Self-check quiz", "zh": "自测"}}
    ]}
  ],
  "contract": {"sessions": [3, 6], "exercises": 6, "quiz": [6, 8], "sections": ["s1", "s2", "s3", "s4", "s5", "s6", "exercises", "quiz", "reading"]}
}
`````

`tutorial-sources/git/plan/module_02.json`:

`````json
{
  "number": 2,
  "hours": 3,
  "title": {"en": "Your first repository", "zh": "你的第一个仓库"},
  "lead": {"en": "Create a repository, understand the three places your work lives, and make small, focused commits with clear messages.", "zh": "创建仓库，理解工作内容所在的三个位置，并做出小而聚焦、说明清楚的提交。"},
  "prerequisites": {"en": "Module 1: Git installed and configured with your name and email address, and the four terminal commands pwd, ls, cd and mkdir.", "zh": "第 1 模块：已安装 Git 并配置好姓名和电子邮件地址，熟悉 pwd、ls、cd 和 mkdir 四个终端命令。"},
  "outcomes": {
    "en": [
      "Create a repository with git init and recognise its .git folder.",
      "Describe the working tree, the staging area and the repository, and how files move between them.",
      "Read git status and act on what it says.",
      "Make commits that each contain one change, with a clear message.",
      "Keep files out of the repository with .gitignore."
    ],
    "zh": [
      "用 git init 创建仓库，并认出其中的 .git 文件夹。",
      "描述工作区、暂存区和仓库，以及文件如何在三者之间移动。",
      "读懂 git status 的输出，并据此行动。",
      "做出每次只包含一项改动、说明清楚的提交。",
      "用 .gitignore 把文件排除在仓库之外。"
    ]
  },
  "sessions": [
    {"minutes": 60, "title": {"en": "Repositories and commits", "zh": "仓库与提交"}, "activities": [
      {"kind": "practice", "anchor": "s1", "minutes": 20, "text": {"en": "Create a repository", "zh": "创建仓库"}},
      {"kind": "read", "anchor": "s2", "minutes": 20, "text": {"en": "The three areas", "zh": "三个区域"}},
      {"kind": "practice", "anchor": "s3", "minutes": 20, "text": {"en": "Your first commit", "zh": "你的第一次提交"}}
    ]},
    {"minutes": 60, "title": {"en": "Committing with care", "zh": "用心提交"}, "activities": [
      {"kind": "practice", "anchor": "s4", "minutes": 25, "text": {"en": "Stage what you mean to commit", "zh": "暂存你想提交的内容"}},
      {"kind": "read", "anchor": "s5", "minutes": 15, "text": {"en": "Good commit messages", "zh": "好的提交说明"}},
      {"kind": "practice", "anchor": "s6", "minutes": 20, "text": {"en": "Ignoring files", "zh": "忽略文件"}}
    ]},
    {"minutes": 60, "title": {"en": "Practice", "zh": "练习"}, "activities": [
      {"kind": "exercises", "anchor": "exercises", "minutes": 45, "text": {"en": "Six exercises", "zh": "六道练习"}},
      {"kind": "quiz", "anchor": "quiz", "minutes": 15, "text": {"en": "Self-check quiz", "zh": "自测"}}
    ]}
  ],
  "contract": {"sessions": [3, 6], "exercises": 6, "quiz": [6, 8], "sections": ["s1", "s2", "s3", "s4", "s5", "s6", "exercises", "quiz", "reading"]}
}
`````


- [ ] **Step 4: Create the assets and the figure**

`tutorial-sources/git/assets/style.css`:

`````css
/* Git series additions to the shared tutorial design. */
@import url('../../ai/assets/style.css');

.skip-link{position:fixed;top:-100px;left:1rem;z-index:2000;background:var(--white);padding:.6rem 1rem;border:2px solid var(--blue);border-radius:6px}.skip-link:focus{top:.5rem}
:focus-visible{outline:3px solid var(--sky);outline-offset:3px}
.visually-hidden{position:absolute!important;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
.module-card.planned:hover{transform:none;box-shadow:none;border-color:var(--border)}
.card-status{font-size:.78rem;color:var(--slate);margin-top:.75rem}
.mobile-toc{display:none}
.index-body{overflow-wrap:anywhere}.index-grid .module-card{min-width:0}.index-hero h1{font-size:clamp(2rem,5vw,3.5rem)}
.content{overflow-wrap:anywhere}.content table{width:100%}

/* Command sessions: one copyable block per command, its output underneath */
.term{border:1px solid var(--border);border-radius:12px;padding:1rem 1.1rem;margin:1.75rem 0;background:var(--white)}
.term-head{display:flex;flex-wrap:wrap;align-items:baseline;gap:.4rem .75rem;margin-bottom:.6rem}
.term-label{font-size:.7rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#C2410C}
.term-title{font-weight:600;color:var(--navy)}
.term pre.command{margin:.6rem 0 0;padding:.6rem 1rem;background:#0F172A;color:#E2E8F0;border-color:#0F172A}
.term pre.command code::before{content:"$ ";color:#64748B;user-select:none}
.term pre.command .hljs-keyword{color:#FDBA74}.term pre.command .hljs-title{color:#7DD3FC;font-weight:600}
.term pre.command .hljs-attr{color:#C4B5FD}.term pre.command .hljs-string{color:#86EFAC}.term pre.command .hljs-built_in{color:#FDBA74}
.term .output{margin:0 0 .6rem;background:#1E293B;border-color:#0F172A;border-top:none;border-radius:0 0 10px 10px}
.term .output-label{display:none}
.term .output pre{padding-top:.5rem}
.term-edit,.term-who{font-size:.9rem;margin:1rem 0 .3rem;color:var(--slate)}
.term-who{font-weight:600;color:var(--navy);border-left:3px solid #C2410C;padding-left:.6rem}
.term-caption{font-size:.78rem;color:var(--slate);margin-top:.9rem}
.graph{margin:1rem 0;padding:.75rem;overflow-x:auto;background:var(--white);border:1px solid var(--border);border-radius:10px}
.graph svg{display:block;max-width:none}
.g-hash{font:600 12px var(--font-mono);fill:#475569}.g-subject{font:13px var(--font-body);fill:#0F172A}
.g-ref{stroke-width:1.2}.g-head{fill:#DBEAFE;stroke:#1D4ED8}.g-branch{fill:#E0F2FE;stroke:#0284C7}
.g-tag{fill:#FEF3C7;stroke:#B45309}.g-remote{fill:#F1F5F9;stroke:#94A3B8}.g-ref-text{font:600 11px var(--font-body);fill:#0F172A}

@media(max-width:900px){.mobile-toc{display:block;margin:1rem 0}.mobile-toc nav{display:flex;flex-wrap:wrap;gap:.5rem;padding:1rem}.mobile-toc a{font-size:.85rem}#main{width:100%}}
@media(max-width:440px){#topbar{padding:0 .75rem;gap:.45rem}.module-dropdown .dropdown-menu{min-width:260px;max-width:calc(100vw - 20px)}.lang-switch{margin-left:0}.index-grid{grid-template-columns:1fr}.term{padding:.8rem}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*,*::before,*::after{transition:none!important}}
@media print{.skip-link,.mobile-toc{display:none!important}details:not([open])>.details-body{display:block!important}.quiz-expl[hidden]{display:block}.term pre.command{background:none;color:inherit}}
`````

`tutorial-sources/git/assets/favicon.svg`:

`````xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#0f172a"/>
  <path d="M20 14v36M20 32c0-8 24-6 24-18" stroke="#f97316" stroke-width="5" fill="none" stroke-linecap="round"/>
  <circle cx="20" cy="14" r="6" fill="#f8fafc"/><circle cx="20" cy="50" r="6" fill="#f8fafc"/><circle cx="44" cy="14" r="6" fill="#f8fafc"/>
</svg>
`````

`tutorial-sources/git/figures/en/fig-02-01.svg`:

`````xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 210" role="img" aria-labelledby="t">
  <title id="t">The working tree, the staging area and the repository</title>
  <defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0L10 5L0 10z" fill="#334155"/></marker></defs>
  <g font-family="system-ui, -apple-system, Segoe UI, sans-serif" text-anchor="middle">
    <rect x="10" y="40" width="180" height="120" rx="12" fill="#EFF6FF" stroke="#2563EB" stroke-width="2"/>
    <text x="100" y="80" font-size="17" font-weight="700" fill="#1E3A8A">Working tree</text>
    <text x="100" y="108" font-size="13" fill="#334155">Your files, as you</text>
    <text x="100" y="128" font-size="13" fill="#334155">edit them</text>
    <rect x="250" y="40" width="180" height="120" rx="12" fill="#FEF3C7" stroke="#D97706" stroke-width="2"/>
    <text x="340" y="80" font-size="17" font-weight="700" fill="#78350F">Staging area</text>
    <text x="340" y="108" font-size="13" fill="#334155">The next commit,</text>
    <text x="340" y="128" font-size="13" fill="#334155">being put together</text>
    <rect x="490" y="40" width="180" height="120" rx="12" fill="#DCFCE7" stroke="#16A34A" stroke-width="2"/>
    <text x="580" y="80" font-size="17" font-weight="700" fill="#14532D">Repository</text>
    <text x="580" y="108" font-size="13" fill="#334155">Every commit: a saved</text>
    <text x="580" y="128" font-size="13" fill="#334155">snapshot of the project</text>
    <line x1="192" y1="100" x2="246" y2="100" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/>
    <text x="219" y="30" font-size="13" font-family="ui-monospace, Menlo, Consolas, monospace" fill="#7C3AED">git add</text>
    <line x1="432" y1="100" x2="486" y2="100" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/>
    <text x="459" y="30" font-size="13" font-family="ui-monospace, Menlo, Consolas, monospace" fill="#7C3AED">git commit</text>
    <text x="340" y="195" font-size="13" fill="#475569">git add copies changes into the staging area; git commit saves it as a new snapshot</text>
  </g>
</svg>
`````

`tutorial-sources/git/figures/zh/fig-02-01.svg`:

`````xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 210" role="img" aria-labelledby="t">
  <title id="t">工作区、暂存区与仓库</title>
  <defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0L10 5L0 10z" fill="#334155"/></marker></defs>
  <g font-family="system-ui, -apple-system, Segoe UI, sans-serif" text-anchor="middle">
    <rect x="10" y="40" width="180" height="120" rx="12" fill="#EFF6FF" stroke="#2563EB" stroke-width="2"/>
    <text x="100" y="80" font-size="17" font-weight="700" fill="#1E3A8A">工作区</text>
    <text x="100" y="108" font-size="13" fill="#334155">你正在编辑的</text>
    <text x="100" y="128" font-size="13" fill="#334155">项目文件</text>
    <rect x="250" y="40" width="180" height="120" rx="12" fill="#FEF3C7" stroke="#D97706" stroke-width="2"/>
    <text x="340" y="80" font-size="17" font-weight="700" fill="#78350F">暂存区</text>
    <text x="340" y="108" font-size="13" fill="#334155">正在组装的</text>
    <text x="340" y="128" font-size="13" fill="#334155">下一次提交</text>
    <rect x="490" y="40" width="180" height="120" rx="12" fill="#DCFCE7" stroke="#16A34A" stroke-width="2"/>
    <text x="580" y="80" font-size="17" font-weight="700" fill="#14532D">仓库</text>
    <text x="580" y="108" font-size="13" fill="#334155">所有提交：项目的</text>
    <text x="580" y="128" font-size="13" fill="#334155">一个个已保存快照</text>
    <line x1="192" y1="100" x2="246" y2="100" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/>
    <text x="219" y="30" font-size="13" font-family="ui-monospace, Menlo, Consolas, monospace" fill="#7C3AED">git add</text>
    <line x1="432" y1="100" x2="486" y2="100" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/>
    <text x="459" y="30" font-size="13" font-family="ui-monospace, Menlo, Consolas, monospace" fill="#7C3AED">git commit</text>
    <text x="340" y="195" font-size="13" fill="#475569">git add 把改动放入暂存区；git commit 把暂存区保存为新的快照</text>
  </g>
</svg>
`````


- [ ] **Step 5: Create the sessions**

`tutorial-sources/git/sessions/module_01/m01-version.session`:

`````text
title: Check that Git is installed
title-zh: 检查 Git 是否已安装
---
$ git --version
`````

`tutorial-sources/git/sessions/module_01/m01-terminal.session`:

`````text
title: A terminal survival kit
title-zh: 终端生存工具包
---
$ pwd
$ mkdir projects
$ ls
$ cd projects
$ pwd
$ mkdir notes
+file notes/hello.txt
Hello from the terminal.
+end
$ ls notes
$ cat notes/hello.txt
$ cd ..
$ pwd
`````

`tutorial-sources/git/sessions/module_01/m01-config.session`:

`````text
title: Introduce yourself to Git
title-zh: 向 Git 介绍你自己
---
$ git config --global user.name "Alex Smith"
$ git config --global user.email alex@example.com
$ git config --global init.defaultBranch main
$ git config --global core.editor "code --wait"
$ git config --global --list
$ git config user.name
`````

`tutorial-sources/git/sessions/module_01/m01-e4-solution.session`:

`````text
title: Switch your editor to nano
title-zh: 把编辑器改为 nano
role: solution
---
> git config --global core.editor "code --wait"
$ git config --global core.editor nano
$ git config --global core.editor
`````

`tutorial-sources/git/sessions/module_02/m02-init.session`:

`````text
title: Create a repository
title-zh: 创建仓库
---
$ mkdir recipes
$ cd recipes
$ git init
$ ls -a
$ git status
`````

`tutorial-sources/git/sessions/module_02/m02-first-commit.session`:

`````text
title: Your first commit
title-zh: 你的第一次提交
---
> mkdir recipes
> cd recipes
> git init
+file README.md
# Family recipes

Recipes we cook again and again.
+end
$ git status
$ git add README.md
$ git status
$ git commit -m "Add a README"
$ git status
$ git log
`````

`tutorial-sources/git/sessions/module_02/m02-staging.session`:

`````text
title: Stage what you mean to commit
title-zh: 暂存你想提交的内容
---
> mkdir recipes
> cd recipes
> git init
+hidden README.md
# Family recipes

Recipes we cook again and again.
+end
> git add README.md
> git commit -m "Add a README"
+file pancakes.md
# Pancakes

- 200 g flour
- 2 eggs
- 300 ml milk
+end
+file README.md
# Family recipes

Recipes we cook again and again, with notes on what worked.
+end
$ git status
$ git add pancakes.md
$ git status
$ git commit -m "Add a pancake recipe"
$ git status
$ git add README.md
$ git commit -m "Say what the notes are for"
$ git log --oneline
@graph three-commits
`````

`tutorial-sources/git/sessions/module_02/m02-ignore.session`:

`````text
title: Ignore files Git should not track
title-zh: 忽略 Git 不该跟踪的文件
---
> mkdir recipes
> cd recipes
> git init
+hidden README.md
# Family recipes
+end
> git add README.md
> git commit -m "Add a README"
+file shopping.tmp
eggs, milk, flour
+end
$ git status
+file .gitignore
# Temporary files from my editor
*.tmp
+end
$ git status
$ git add .gitignore
$ git commit -m "Ignore temporary files"
$ git status
`````

`tutorial-sources/git/sessions/module_02/m02-e3-solution.session`:

`````text
title: Two files, two commits
title-zh: 两个文件，两次提交
role: solution
---
> mkdir recipes
> cd recipes
> git init
+file soup.md
# Tomato soup
+end
+file bread.md
# Soda bread
+end
$ git add soup.md
$ git commit -m "Add a tomato soup recipe"
$ git add bread.md
$ git commit -m "Add a soda bread recipe"
$ git log --oneline
`````

`tutorial-sources/git/sessions/module_02/m02-e5-solution.session`:

`````text
title: Ignore a whole folder
title-zh: 忽略整个文件夹
role: solution
---
> mkdir recipes
> cd recipes
> git init
+hidden photos/pancakes.jpg
(a large photo)
+end
+file .gitignore
# Photos are too large to keep in Git
photos/
+end
$ git status
$ git add .gitignore
$ git commit -m "Keep photos out of the repository"
$ git status
`````


- [ ] **Step 6: Run the test to see it pass**

Run: `node --test --test-concurrency=1 "tutorial-sources/git/tests/*.test.mjs"`
Expected: PASS, `# tests 25`, `# pass 25`.

- [ ] **Step 7: Commit**

```bash
git add tutorial-sources/git/plan tutorial-sources/git/assets tutorial-sources/git/figures tutorial-sources/git/sessions tutorial-sources/git/tests/series-sessions.test.mjs
git commit -m "Git series: roadmap, Modules 1-2 configuration, sessions and figure" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Module 1 in English and Chinese

**Files:**
- Create: `tutorial-sources/git/GLOSSARY.md`
- Create: `tutorial-sources/git/src/en/module_01.md`, `tutorial-sources/git/src/zh/module_01.md`
- Generated (commit them): `docs/tutorials/git/` (`index.html`, `index_ZH.html`, `module_01_EN.html`, `module_01_ZH.html`, `assets/`)

**Interfaces:**
- Consumes: Tasks 5 and 6. The frames reference exactly Module 1's four session ids, and the quiz answer positions are the same in both languages (`1, 2, 1, 3, 0, 2`).
- Produces: a published Module 1.

The frames fix the structure: headings, session placement, the exercises with worked solutions, the quiz and the reading list. The prose is written in this task, replacing each `<!-- BRIEF … -->` note; the build refuses to run while any note remains.

- [ ] **Step 1: Read the official sources the module relies on**

These are the installation pages linked in the frame, the [git config reference](https://git-scm.com/docs/git-config), and [Pro Git chapter 1](https://git-scm.com/book/en/v2/Getting-Started-About-Version-Control). Every command, option and fact must match them (spec §6, item 6). Write in your own words; do not copy from Pro Git, which uses a non-commercial licence.

- [ ] **Step 2: Create the glossary**

`tutorial-sources/git/GLOSSARY.md`:

`````markdown
# English–Chinese glossary

Use these renderings in every Chinese page. On first use in a module, give the English term in parentheses, e.g. 暂存区（staging area）. Commands, options, file names and Git's output are never translated. Names of GitHub features follow GitHub's own Chinese interface.

| English | 中文 | Notes |
|---|---|---|
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

Save this as `tutorial-sources/git/src/en/module_01.md`, then replace each note with finished text that meets its brief, about 2,200 words in total. Style:
- second person, short paragraphs, British spelling;
- every claim about a session's output must match the output the build prints, which Task 6's test pins;
- do not change the exercises, quiz or reading list.

`tutorial-sources/git/src/en/module_01.md`:

`````markdown
## Why version control? {#s1}

<!-- BRIEF (about 350 words)
- Start from familiar pain: folders full of report.docx, report_v2.docx, report_final.docx, report_final_really.docx; work lost by overwriting or deleting; not knowing what changed, when, why or by whom; two people editing the same files and emailing copies back and forth.
- Version control is a system that records the history of a set of files, so that you can see every change, go back to any earlier version, and combine the work of several people.
- It is used for software above all, but also for websites, books, research papers and configuration. This website itself is kept in a Git repository on GitHub.
- End with a ::: keyidea callout: version control keeps every saved version, with who made it, when and why, so you can always go back.
-->

## How version control works {#s2}

<!-- BRIEF (about 400 words)
- A commit is a saved snapshot of the whole project, together with a message, the author and the time. The history is the chain of commits.
- Centralised version control (one server holds the history; Subversion is an example) versus distributed version control (every copy holds the full history; Git). Benefits of distributed: you can commit without a network connection, and every copy is a full backup.
- Git was created by Linus Torvalds in 2005 to manage the source code of the Linux kernel; it is now the most widely used version control system.
- Git versus GitHub: Git is the program on your computer; GitHub is a website that stores Git repositories and adds tools for working together (Modules 6 and 7). GitLab and Bitbucket are similar services.
- Use a ::: analogy callout: commits are like save points in a video game, except that each one also records a note about what you just did.
-->

## Installing Git {#s3}

<!-- BRIEF part 1 (about 350 words)
- Windows: download Git for Windows from <https://git-scm.com/downloads/win> and run the installer; the defaults are fine. It includes Git Bash, a terminal in which every command in this series works exactly as shown. On the page about the default editor, choose one you know (for example Visual Studio Code). On the page about the initial branch name, you may choose "main" (Section 5 sets it anyway).
- macOS: open Terminal and type git --version. If Git is missing, macOS offers to install the "command line developer tools"; accept. (Alternatively, xcode-select --install, or brew install git with Homebrew.)
- Linux: use the package manager, for example sudo apt install git on Debian or Ubuntu, or sudo dnf install git on Fedora; see <https://git-scm.com/downloads/linux> for others.
- Then check that Git works with the session below.
- ::: pitfall callout for Windows: open a new terminal window after installing, otherwise it may not find git.
-->

{{SESSION:m01-version}}

<!-- BRIEF part 2 (about 100 words)
- The output names the version. Any recent 2.x version is fine for this series; the output on these pages came from the version shown, and on macOS the "(Apple Git-…)" suffix shows that Apple built it.
-->

## The terminal survival kit {#s4}

<!-- BRIEF part 1 (about 250 words)
- A terminal is a window in which you type commands and read their output. Use Git Bash or PowerShell on Windows, Terminal on macOS, and any terminal on Linux.
- The prompt waits for a command; every command runs "in" a current folder.
- The commands of the session: pwd (print the current folder), mkdir (make a folder), ls (list what is in a folder), cd (change folder; cd .. goes up one level) and cat (show what a file contains).
- The session's home folder is /home/alex; yours will be your own, such as C:\Users\you or /Users/you.
-->

{{SESSION:m01-terminal}}

<!-- BRIEF part 2 (about 120 words)
- Walk through the output: where pwd changes, why ls prints nothing for an empty folder (no output is normal), and how cat shows the file you saved with your editor.
- ::: tip callout: press Tab to complete file and folder names, and the Up arrow to bring back an earlier command. In PowerShell, ls shows a table instead of a list, but the folders are the same.
-->

## Introduce yourself to Git {#s5}

<!-- BRIEF part 1 (about 250 words)
- Every commit records its author's name and email address, so tell Git who you are before your first commit.
- git config --global stores a setting for every repository you work on as this user, in a file called .gitconfig in your home folder.
- Use the email address you will use on GitHub (Module 6 shows how to keep it private).
- init.defaultBranch main: new repositories start on a branch called main, as GitHub's do (older versions of Git used "master").
- core.editor: the editor Git opens when it needs a longer message. "code --wait" opens Visual Studio Code (its code command must be installed); nano and notepad are alternatives.
-->

{{SESSION:m01-config}}

<!-- BRIEF part 2 (about 100 words)
- git config --global --list shows what you set. The keys appear in lower case (init.defaultbranch) because Git ignores case in key names, so nothing went wrong.
- git config user.name, without a value, reads a setting back.
-->

## Git in editors and apps {#s6}

<!-- BRIEF (about 200 words)
- Visual Studio Code's Source Control view, GitHub Desktop and JetBrains IDEs offer buttons for Git. Underneath, they run the same Git commands.
- This series uses the command line because it shows exactly what happens and works the same everywhere. Once you know the commands, the buttons make sense, including those that combine several commands (for example a "Sync" button that pulls and then pushes).
-->

## Exercises {#exercises}

::: exercise #e1 level=1 kind=conceptual minutes=3
**Spot the problems.** A team keeps its report on a shared drive as `report.docx`, `report_v2.docx`, `report_v2_Sam.docx` and `report_final.docx`. Name three questions that the team cannot easily answer.
:::

::: solution
Any three of these:

- Which file is the current version?
- What changed between `report_v2.docx` and `report_final.docx`, and why?
- Who wrote or deleted a particular paragraph?
- How can Sam's changes be combined with everyone else's?
- How can they get back a paragraph that someone deleted last week?

Version control answers each of them: one folder holds the current version, and the history records every change with its author, time and reason.
:::

::: exercise #e2 level=1 kind=conceptual minutes=3
**Git or GitHub?** Say whether each statement is about Git or about GitHub.

1. "I made a commit on the train, without an internet connection."
2. "I opened a pull request so that my team could review my change."
3. "My laptop holds the whole history of the project."
4. "Our repository has a web page where people report bugs."
:::

::: solution
1. **Git.** Commits are made on your own computer and need no network.
2. **GitHub.** Pull requests are a feature of the GitHub website (Module 7).
3. **Git.** Git is distributed: every copy of a repository holds the full history.
4. **GitHub.** Issues are a feature of the GitHub website.
:::

::: exercise #e3 level=1 kind=coding minutes=4
**Install and check.** Install Git on your computer and run `git --version`. What should you do if the terminal answers that the command is not found?
:::

::: solution
A working installation prints one line such as `git version 2.50.1`; the exact number does not matter. If the command is not found:

- on Windows, close the terminal and open a new one, which picks up the newly installed Git; if that fails, run the installer again;
- on macOS, accept the offer to install the command line developer tools, or run `xcode-select --install`;
- on Linux, install the package called `git` with your distribution's package manager.
:::

::: exercise #e4 level=1 kind=coding minutes=4
**Change your editor.** Make nano the editor Git opens, then check that the setting took effect. How would you switch back to Visual Studio Code?
:::

::: solution
Set the editor, then read the setting back:

{{SESSION:m01-e4-solution}}

To switch back, run `git config --global core.editor "code --wait"`. Setting a key again replaces its old value.
:::

::: exercise #e5 level=1 kind=coding minutes=3
**Find your way around.** In your terminal, make a folder called `git-practice` inside your home folder, go into it, and print where you are. Then go back up to your home folder.
:::

::: solution
Run `mkdir git-practice`, then `cd git-practice`, then `pwd`, which prints your home folder's path followed by `/git-practice` (on Windows, `\git-practice`). Finally run `cd ..` to go back up. These are the same steps as the survival-kit session, with your own folder names.
:::

::: exercise #e6 level=2 kind=conceptual minutes=3
**Global or not?** You set `user.email` with `--global`. Does the setting apply to a repository you create next year? How could you use a different email address for your work projects only?
:::

::: solution
Yes. A `--global` setting is stored in the `.gitconfig` file in your home folder and applies to every repository you use as this user, including future ones.

To use another address for one project, run `git config user.email you@work.example` inside that project's repository, without `--global`. A setting made inside a repository applies to that repository only and takes priority over the global one.
:::

## Self-check quiz {#quiz}

```quiz
? What does a commit record?
- [ ] Only the files you changed since yesterday
- [x] A snapshot of the project, with a message, the author and the time
- [ ] A backup copy of the project on GitHub
- [ ] The name of the computer you used
> A commit is a saved snapshot of the whole project, labelled with who made it, when and why.

? Which statement about distributed version control is true?
- [ ] It needs a constant connection to a server.
- [ ] Only one person can make commits at a time.
- [x] Every copy of the repository holds the full history.
- [ ] It works only for program code.
> In Git, every clone is a complete repository, so you can commit offline and every copy is a backup.

? How are Git and GitHub related?
- [ ] They are two names for the same program.
- [x] Git is a program on your computer; GitHub is a website that hosts Git repositories.
- [ ] GitHub is the program and Git is its website.
- [ ] They are competing version control systems.
> GitHub stores Git repositories online and adds collaboration features; Git itself runs on your own computer.

? What does `cd ..` do?
- [ ] Lists the files in the current folder
- [ ] Makes a new folder called `..`
- [ ] Deletes the current folder
- [x] Moves up to the folder that contains the current one
> `..` means "the folder above this one", and `cd` changes into it.

? Why should you set `user.name` and `user.email` before your first commit?
- [x] Every commit records them as its author.
- [ ] GitHub uses them as your password.
- [ ] They encrypt your repository.
- [ ] Git cannot be installed without them.
> Commits store the author's name and email permanently, so set them before you start.

? `git config --global --list` shows `init.defaultbranch=main`, all in lower case. What does that mean?
- [ ] The setting failed and must be repeated.
- [ ] It applies to the current folder only.
- [x] Nothing is wrong: Git ignores case in the names of settings.
- [ ] You must type `defaultBranch` with a capital B to make it work.
> Git treats setting names case-insensitively and lists them in lower case.
```

## Further reading {#reading}

- Scott Chacon and Ben Straub, [*Pro Git*, chapter 1: Getting Started](https://git-scm.com/book/en/v2/Getting-Started-About-Version-Control): version control, a short history of Git, installation and first-time setup.
- [Git downloads](https://git-scm.com/downloads) for every operating system.
- The [git config reference](https://git-scm.com/docs/git-config), for every setting and where it is stored.
- GitHub Docs, [Set up Git](https://docs.github.com/en/get-started/git-basics/set-up-git).
- Visual Studio Code, [Source control](https://code.visualstudio.com/docs/sourcecontrol/overview), for using Git from the editor.
`````


- [ ] **Step 4: Create the Chinese source from its frame and translate**

Save this as `tutorial-sources/git/src/zh/module_01.md`, then replace each note with a translation of the matching finished English text, following `GLOSSARY.md`:

`tutorial-sources/git/src/zh/module_01.md`:

`````markdown
## 为什么需要版本控制？ {#s1}

<!-- BRIEF Translate the finished English section s1, using GLOSSARY.md. Keep the same callouts. -->

## 版本控制如何工作 {#s2}

<!-- BRIEF Translate the finished English section s2. -->

## 安装 Git {#s3}

<!-- BRIEF Translate English s3 part 1. Keep the download links; installer pages and buttons are named as they appear in English, with a Chinese gloss on first use. -->

{{SESSION:m01-version}}

<!-- BRIEF Translate English s3 part 2. -->

## 终端生存工具包 {#s4}

<!-- BRIEF Translate English s4 part 1. Commands and output stay in English. -->

{{SESSION:m01-terminal}}

<!-- BRIEF Translate English s4 part 2. -->

## 向 Git 介绍你自己 {#s5}

<!-- BRIEF Translate English s5 part 1. Add one sentence: if the computer's language is Chinese, Git may print some messages in Chinese; the meaning is the same as the English output shown here. -->

{{SESSION:m01-config}}

<!-- BRIEF Translate English s5 part 2. -->

## 编辑器和应用中的 Git {#s6}

<!-- BRIEF Translate the finished English section s6. -->

## 练习 {#exercises}

::: exercise #e1 level=1 kind=conceptual minutes=3
**找出问题。** 一个团队把报告存放在共享盘上：`report.docx`、`report_v2.docx`、`report_v2_Sam.docx` 和 `report_final.docx`。请说出这个团队难以回答的三个问题。
:::

::: solution
以下任意三个：

- 哪个文件是当前版本？
- `report_v2.docx` 和 `report_final.docx` 之间改了什么，为什么改？
- 某一段是谁写的，又是谁删掉的？
- Sam 的修改如何与其他人的修改合并？
- 上周被删掉的一段如何找回来？

版本控制能回答每一个问题：一个文件夹保存当前版本，历史记录则保存每一次改动及其作者、时间和原因。
:::

::: exercise #e2 level=1 kind=conceptual minutes=3
**Git 还是 GitHub？** 判断下列说法说的是 Git 还是 GitHub。

1. “我在火车上没有网络的情况下做了一次提交。”
2. “我创建了一个拉取请求，请团队评审我的改动。”
3. “我的笔记本电脑上有项目的全部历史。”
4. “我们的仓库有一个网页，大家可以在上面报告缺陷。”
:::

::: solution
1. **Git。**提交在你自己的电脑上完成，不需要网络。
2. **GitHub。**拉取请求是 GitHub 网站的功能（第 7 模块）。
3. **Git。**Git 是分布式的：每一份仓库副本都包含完整的历史。
4. **GitHub。**议题（issue）是 GitHub 网站的功能。
:::

::: exercise #e3 level=1 kind=coding minutes=4
**安装并检查。** 在你的电脑上安装 Git，并运行 `git --version`。如果终端提示找不到该命令，应该怎么办？
:::

::: solution
安装成功时会输出一行，例如 `git version 2.50.1`；具体版本号无关紧要。如果找不到命令：

- 在 Windows 上，关闭终端并重新打开一个，新终端才能找到刚安装的 Git；如果仍然不行，重新运行安装程序；
- 在 macOS 上，接受系统安装“命令行开发者工具”的提示，或运行 `xcode-select --install`；
- 在 Linux 上，用发行版的包管理器安装名为 `git` 的软件包。
:::

::: exercise #e4 level=1 kind=coding minutes=4
**更换编辑器。** 把 Git 使用的编辑器改为 nano，然后检查设置是否生效。如何改回 Visual Studio Code？
:::

::: solution
先设置编辑器，再读出该设置：

{{SESSION:m01-e4-solution}}

要改回来，运行 `git config --global core.editor "code --wait"`。再次设置同一个键会替换它原来的值。
:::

::: exercise #e5 level=1 kind=coding minutes=3
**认路。** 在终端中，在你的主文件夹里新建一个名为 `git-practice` 的文件夹，进入该文件夹并打印当前位置，然后回到主文件夹。
:::

::: solution
依次运行 `mkdir git-practice`、`cd git-practice` 和 `pwd`，`pwd` 会打印你的主文件夹路径加上 `/git-practice`（在 Windows 上是 `\git-practice`）。最后运行 `cd ..` 回到上一级。这些步骤与终端生存工具包练习相同，只是文件夹名称换成了你自己的。
:::

::: exercise #e6 level=2 kind=conceptual minutes=3
**全局还是局部？** 你用 `--global` 设置了 `user.email`。这个设置对你明年创建的仓库也有效吗？如何只在工作项目中使用另一个电子邮件地址？
:::

::: solution
有效。`--global` 设置保存在你主文件夹中的 `.gitconfig` 文件里，对你以这个用户身份使用的所有仓库都有效，包括以后创建的仓库。

要在某个项目中使用另一个地址，在该项目的仓库中运行 `git config user.email you@work.example`，不加 `--global`。在仓库内做的设置只对该仓库有效，并且优先于全局设置。
:::

## 自测 {#quiz}

```quiz
? 一次提交记录了什么？
- [ ] 只记录自昨天以来你改过的文件
- [x] 项目的一个快照，以及说明、作者和时间
- [ ] 项目在 GitHub 上的一份备份
- [ ] 你所用电脑的名称
> 提交是整个项目的已保存快照，并标明了由谁、在何时、为何做出。

? 关于分布式版本控制，下列哪种说法正确？
- [ ] 它需要与服务器保持连接。
- [ ] 同一时间只能有一个人提交。
- [x] 仓库的每一份副本都包含完整的历史。
- [ ] 它只适用于程序代码。
> 在 Git 中，每一份克隆都是完整的仓库，所以你可以离线提交，而且每一份副本都是备份。

? Git 和 GitHub 是什么关系？
- [ ] 它们是同一个程序的两个名字。
- [x] Git 是你电脑上的程序；GitHub 是托管 Git 仓库的网站。
- [ ] GitHub 是程序，Git 是它的网站。
- [ ] 它们是相互竞争的版本控制系统。
> GitHub 在网上保存 Git 仓库并增加协作功能；Git 本身运行在你自己的电脑上。

? `cd ..` 的作用是什么？
- [ ] 列出当前文件夹中的文件
- [ ] 新建一个名为 `..` 的文件夹
- [ ] 删除当前文件夹
- [x] 回到包含当前文件夹的上一级文件夹
> `..` 表示“上一级文件夹”，`cd` 则进入它。

? 为什么应在第一次提交之前设置 `user.name` 和 `user.email`？
- [x] 每一次提交都会把它们记录为作者。
- [ ] GitHub 把它们用作你的密码。
- [ ] 它们用于加密你的仓库。
- [ ] 没有它们就无法安装 Git。
> 提交会永久保存作者的姓名和电子邮件地址，所以要在开始之前设置好。

? `git config --global --list` 显示 `init.defaultbranch=main`，全是小写。这说明什么？
- [ ] 设置失败了，必须重新设置。
- [ ] 它只对当前文件夹有效。
- [x] 没有问题：Git 不区分设置名称的大小写。
- [ ] 必须把 `defaultBranch` 中的 B 写成大写才能生效。
> Git 不区分设置名称的大小写，并以小写形式列出它们。
```

## 延伸阅读 {#reading}

- Scott Chacon、Ben Straub，[《Pro Git》中文版](https://git-scm.com/book/zh/v2)第 1 章“起步”：版本控制、Git 简史、安装与初次设置。
- 各操作系统的 [Git 下载页](https://git-scm.com/downloads)。
- [git config 参考文档](https://git-scm.com/docs/git-config)（英文）：所有设置及其保存位置。
- GitHub 文档：[设置 Git](https://docs.github.com/zh/get-started/git-basics/set-up-git)。
- Visual Studio Code：[源代码管理](https://code.visualstudio.com/docs/sourcecontrol/overview)（英文），介绍如何在编辑器中使用 Git。
`````


- [ ] **Step 5: Build and read**

Run: `node tutorial-sources/git/build.mjs`
Expected: `Built modules 01 in English and Chinese; ran 4 sessions with git version 2.50.1 (Apple Git-155).`

Open both pages through a local server, for example `python3 -m http.server -d docs 8000`, then read them. Check that the prose matches the transcripts, that each command has a Copy button which copies only the command, and that the Chinese reads naturally.

- [ ] **Step 6: Commit**

```bash
git add tutorial-sources/git/GLOSSARY.md tutorial-sources/git/src docs/tutorials/git
git commit -m "Git series: Module 1 in English and Chinese" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Module 2 in English and Chinese

**Files:**
- Create: `tutorial-sources/git/src/en/module_02.md`, `tutorial-sources/git/src/zh/module_02.md`
- Modify (generated): `docs/tutorials/git/` (adds `module_02_EN.html`, `module_02_ZH.html`; updates the overview and Module 1's menu and navigation)

**Interfaces:**
- Consumes: Tasks 5–7. The frames reference Module 2's six session ids, the graph `three-commits` inside `m02-staging`, and the figure `fig-02-01`. Quiz answer positions are `1, 2, 0, 3, 1, 2, 0` in both languages.
- Produces: a published Module 2.

- [ ] **Step 1: Read the official sources the module relies on**

These are the [git status](https://git-scm.com/docs/git-status), [git add](https://git-scm.com/docs/git-add), [git commit](https://git-scm.com/docs/git-commit) and [gitignore](https://git-scm.com/docs/gitignore) references.

- [ ] **Step 2: Create the English source from its frame and write the prose**

Save this as `tutorial-sources/git/src/en/module_02.md` and replace each note, about 2,600 words in total, in the same style as Module 1:

`tutorial-sources/git/src/en/module_02.md`:

`````markdown
## Create a repository {#s1}

<!-- BRIEF part 1 (about 250 words)
- A repository is a project folder whose history Git keeps. git init turns the current folder into one by creating a hidden .git folder, where Git stores the history; never edit it by hand.
- git status is the command you will use most: it says where you are and what Git sees.
- The session makes a folder for a recipe collection, the project used throughout the series.
-->

{{SESSION:m02-init}}

<!-- BRIEF part 2 (about 120 words)
- Explain the output: the path of the new .git folder; ls -a shows hidden entries, including .git; "No commits yet" and the hint in brackets.
- ::: pitfall callout: run git init inside your project's folder, never in your home folder, which would put everything you own under version control.
-->

## The three areas {#s2}

<!-- BRIEF part 1 (about 200 words)
- Introduce the figure: the working tree (the files as you edit them), the staging area (also called the index: what will go into the next commit) and the repository (the commits).
-->

::: figure #fig-02-01
Changes travel from the working tree to the staging area with `git add`, and from the staging area into the repository with `git commit`.
:::

<!-- BRIEF part 2 (about 200 words)
- Why have a staging area at all: it lets you choose exactly what goes into each commit, and look at it before you commit.
- The states a file can be in: untracked (Git has never stored it), staged, committed (unchanged since the last commit) and modified.
- ::: analogy callout: staging is packing items into a parcel; committing is sealing it and writing the label. You can keep adding to the parcel until you seal it.
-->

## Your first commit {#s3}

<!-- BRIEF part 1 (about 120 words)
- Create README.md in the recipes folder with your editor, then follow the session. Watch how git status describes the file at each step: untracked, then a change to be committed, then a clean working tree.
-->

{{SESSION:m02-first-commit}}

<!-- BRIEF part 2 (about 200 words)
- Read the commit output: the branch (main), "root-commit" because it is the first commit, the short hash, and the summary of files and lines.
- Read git log: the full hash, the author, the date and the message.
- Your hash will differ: it is calculated from the content, the author and the time, so no two commits share one.
-->

## Stage what you mean to commit {#s4}

<!-- BRIEF part 1 (about 150 words)
- Scenario: you added a pancake recipe and, while you were at it, reworded the README. Those are two different changes, so they belong in two commits. Stage only the recipe first.
-->

{{SESSION:m02-staging}}

<!-- BRIEF part 2 (about 200 words)
- Read the two sections of git status: "Changes to be committed" (staged) and "Changes not staged for commit". The hints in brackets suggest next steps; git restore appears in Module 3.
- After both commits, git log --oneline lists one line per commit, newest first.
- The graph shows the same three commits as a straight line, with HEAD → main on the newest. Branches, and what HEAD means, are Module 4's subject.
-->

## Good commit messages {#s5}

<!-- BRIEF (about 350 words)
- A message tells your future self and your team why a change was made; the change itself shows what.
- Write a short summary line (about 50 characters) in the imperative mood: "Add a pancake recipe", as if completing "If applied, this commit will …".
- One change per commit: if the summary needs "and", it is probably two commits.
- For more detail, run git commit without -m: Git opens your editor; write the summary, a blank line, then the explanation.
- Include a table of weak and better messages: "stuff" → "Add a pancake recipe"; "fixed it" → "Fix the oven temperature in the bread recipe"; "changes" → "Say what the notes are for".
-->

## Ignoring files {#s6}

<!-- BRIEF part 1 (about 150 words)
- Some files should never be in the history: temporary files, editor backups, files your operating system creates (.DS_Store on macOS, Thumbs.db on Windows), large or generated files, and above all secrets such as passwords and keys.
- A .gitignore file lists patterns of names for Git to ignore. It is committed like any other file, so everyone working on the project shares it.
-->

{{SESSION:m02-ignore}}

<!-- BRIEF part 2 (about 180 words)
- Explain the two git status outputs: shopping.tmp disappears once .gitignore names *.tmp, and only .gitignore itself is left to commit.
- Pattern basics: *.tmp matches any name ending in .tmp; photos/ matches a folder; lines starting with # are comments.
- .gitignore affects only untracked files: a file that is already committed stays tracked (Module 3 shows how to stop tracking one).
- GitHub keeps ready-made .gitignore templates for many languages and tools: <https://github.com/github/gitignore>.
- ::: pitfall callout: never commit secrets; once a password is in the history, treat it as leaked and change it.
-->

## Exercises {#exercises}

::: exercise #e1 level=1 kind=conceptual minutes=6
**Which area?** For each step, say where the newest version of `pancakes.md` is: the working tree, the staging area or the repository.

1. You save `pancakes.md` in your editor.
2. You run `git add pancakes.md`.
3. You run `git commit -m "Add a pancake recipe"`.
4. You change the recipe again and save it.
:::

::: solution
1. **Working tree** only: Git has not been told about the file.
2. **Staging area** (and still the working tree): the next commit will include this version.
3. **Repository**: the commit has saved it as part of a snapshot; the working tree and staging area now match it.
4. **Working tree**: the file is modified; the repository still holds the version from step 3 until you add and commit again.
:::

::: exercise #e2 level=1 kind=conceptual minutes=6
**Read the status.** Here is part of the output of `git status`:

```text
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
	new file:   pancakes.md

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   README.md
```

Which file will the next `git commit` include? Which file is modified but not staged, and which command would stage it?
:::

::: solution
The next commit will include `pancakes.md` only, because it is under "Changes to be committed". `README.md` is modified but not staged; `git add README.md` would stage it. This is the situation in the middle of the session in Section 4.
:::

::: exercise #e3 level=1 kind=coding minutes=10
**Two files, two commits.** In a new repository, create `soup.md` and `bread.md`, each with a heading. Commit them separately, each with a clear message, then list the history in one line per commit.
:::

::: solution
Stage and commit one file at a time:

{{SESSION:m02-e3-solution}}

`git log --oneline` lists the newest commit first. Your hashes will differ from these.
:::

::: exercise #e4 level=1 kind=conceptual minutes=6
**Improve these messages.** Rewrite each commit message, splitting the commit where that would help: `update`, `fixed typo and added new recipe and changed readme`, `WIP`.
:::

::: solution
- `update` says nothing; name the change, for example `Update the bread recipe for a smaller tin`.
- `fixed typo and added new recipe and changed readme` describes three changes. Make three commits: `Fix a typo in the soup recipe`, `Add a lemon cake recipe` and `Say what the notes are for`.
- `WIP` ("work in progress") gives no reason to keep the commit. Commit when a piece of work is complete, and describe it, for example `Add the first half of the cake recipe`.
:::

::: exercise #e5 level=1 kind=coding minutes=10
**Ignore a whole folder.** Your recipes folder has a `photos` folder full of large pictures. Keep the folder out of the repository and commit the rule.
:::

::: solution
A pattern ending in `/` matches a folder and everything in it:

{{SESSION:m02-e5-solution}}

`git status` lists only `.gitignore`: the `photos` folder no longer appears as untracked.
:::

::: exercise #e6 level=2 kind=conceptual minutes=7
**Too late to ignore?** Yesterday you committed `passwords.txt` by mistake. Today you add `passwords.txt` to `.gitignore`. Is the file safe now? What should you do?
:::

::: solution
No. `.gitignore` affects only untracked files. `passwords.txt` is already tracked, so Git keeps tracking it, and yesterday's commit keeps the passwords in the history.

Change every password in the file at once, and treat the old ones as leaked. Then stop tracking the file (`git rm --cached`, in Module 3) so that `.gitignore` applies from now on. Removing it from old commits means rewriting history (Module 8), which is no help once the repository has been shared. The best protection is never to commit secrets at all.
:::

## Self-check quiz {#quiz}

```quiz
? What does `git init` create?
- [ ] Your first commit
- [x] A hidden `.git` folder that will hold the project's history
- [ ] A repository on GitHub
- [ ] A backup copy of the folder
> `git init` turns a folder into a repository by creating `.git`; the first commit comes later.

? After `git add pancakes.md`, where is that version of the file recorded?
- [ ] Only in the working tree
- [ ] In the repository
- [x] In the staging area
- [ ] On GitHub
> `git add` copies the file's current content into the staging area, ready for the next commit.

? `git status` says "nothing to commit, working tree clean". What does that mean?
- [x] Every change you made is committed.
- [ ] The repository has no commits.
- [ ] Git has deleted your files.
- [ ] You must run `git add` first.
> The working tree, the staging area and the last commit all match.

? Which is the best commit message?
- [ ] `changes`
- [ ] `stuff for Sam`
- [ ] `Fixed things and updated README and recipes`
- [x] `Add a pancake recipe`
> It names one change, in the imperative mood; the third option describes several changes.

? Why might you stage only some of your changes?
- [ ] Git cannot commit more than one file at a time.
- [x] To make each commit contain one change.
- [ ] Staged files are uploaded to GitHub.
- [ ] To make the repository smaller.
> Staging lets you choose what goes into each commit, so every commit tells one story.

? The output of a commit says `(root-commit)`. Why?
- [ ] The commit was made by an administrator.
- [ ] The commit changed the root folder.
- [x] It is the first commit in the repository.
- [ ] The commit failed and must be repeated.
> The root commit has no parent: history starts there.

? Which file belongs in `.gitignore`?
- [x] A temporary file that your editor creates
- [ ] `README.md`
- [ ] A recipe you wrote
- [ ] `.gitignore` itself
> Ignore files that should not be shared; `.gitignore` itself is committed so that everyone shares the rules.
```

## Further reading {#reading}

- Scott Chacon and Ben Straub, [*Pro Git*, section 2.2: Recording Changes to the Repository](https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository).
- The reference pages for [git status](https://git-scm.com/docs/git-status), [git add](https://git-scm.com/docs/git-add) and [git commit](https://git-scm.com/docs/git-commit).
- The reference page for [gitignore](https://git-scm.com/docs/gitignore), with every pattern rule, and GitHub's [collection of .gitignore templates](https://github.com/github/gitignore).
- Chris Beams, [How to write a Git commit message](https://cbea.ms/git-commit/).
`````


- [ ] **Step 3: Create the Chinese source from its frame and translate**

`tutorial-sources/git/src/zh/module_02.md`:

`````markdown
## 创建仓库 {#s1}

<!-- BRIEF Translate English s1 part 1, using GLOSSARY.md. -->

{{SESSION:m02-init}}

<!-- BRIEF Translate English s1 part 2. -->

## 三个区域 {#s2}

<!-- BRIEF Translate English s2 part 1. -->

::: figure #fig-02-01
改动通过 `git add` 从工作区进入暂存区，再通过 `git commit` 从暂存区进入仓库。
:::

<!-- BRIEF Translate English s2 part 2. -->

## 你的第一次提交 {#s3}

<!-- BRIEF Translate English s3 part 1. -->

{{SESSION:m02-first-commit}}

<!-- BRIEF Translate English s3 part 2. -->

## 暂存你想提交的内容 {#s4}

<!-- BRIEF Translate English s4 part 1. -->

{{SESSION:m02-staging}}

<!-- BRIEF Translate English s4 part 2. -->

## 好的提交说明 {#s5}

<!-- BRIEF Translate the finished English section s5. Keep the example commit messages in English (they are what learners will type), and explain them in Chinese; add one sentence noting that teams may also write messages in Chinese, as long as they are consistent. -->

## 忽略文件 {#s6}

<!-- BRIEF Translate English s6 part 1. -->

{{SESSION:m02-ignore}}

<!-- BRIEF Translate English s6 part 2. -->

## 练习 {#exercises}

::: exercise #e1 level=1 kind=conceptual minutes=6
**在哪个区域？** 对于每一步，说出 `pancakes.md` 的最新版本位于哪里：工作区、暂存区还是仓库。

1. 你在编辑器中保存了 `pancakes.md`。
2. 你运行了 `git add pancakes.md`。
3. 你运行了 `git commit -m "Add a pancake recipe"`。
4. 你再次修改并保存了这份食谱。
:::

::: solution
1. **只在工作区**：还没有告诉 Git 这个文件。
2. **暂存区**（工作区中也有）：下一次提交会包含这个版本。
3. **仓库**：提交把它作为快照的一部分保存了下来；此时工作区和暂存区与之一致。
4. **工作区**：文件处于已修改状态；在你再次添加并提交之前，仓库中保存的仍是第 3 步的版本。
:::

::: exercise #e2 level=1 kind=conceptual minutes=6
**读懂状态。** 下面是 `git status` 输出的一部分：

```text
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
	new file:   pancakes.md

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   README.md
```

下一次 `git commit` 会包含哪个文件？哪个文件已修改但未暂存？用什么命令可以暂存它？
:::

::: solution
下一次提交只包含 `pancakes.md`，因为它位于 “Changes to be committed” 之下。`README.md` 已修改但未暂存，运行 `git add README.md` 即可暂存它。这正是第 4 节练习进行到一半时的情形。
:::

::: exercise #e3 level=1 kind=coding minutes=10
**两个文件，两次提交。** 在一个新仓库中创建 `soup.md` 和 `bread.md`，各写一个标题。分别提交它们，每次都写清楚说明，然后以每次提交一行的形式列出历史。
:::

::: solution
一次暂存并提交一个文件：

{{SESSION:m02-e3-solution}}

`git log --oneline` 先列出最新的提交。你的哈希值会与这里的不同。
:::

::: exercise #e4 level=1 kind=conceptual minutes=6
**改进这些说明。** 改写下列提交说明，必要时把提交拆开：`update`、`fixed typo and added new recipe and changed readme`、`WIP`。
:::

::: solution
- `update` 什么也没说明；应写出具体改动，例如 `Update the bread recipe for a smaller tin`。
- `fixed typo and added new recipe and changed readme` 描述了三项改动。应做三次提交：`Fix a typo in the soup recipe`、`Add a lemon cake recipe` 和 `Say what the notes are for`。
- `WIP`（“进行中的工作”）没有给出保留这次提交的理由。应在一项工作完成时再提交并加以描述，例如 `Add the first half of the cake recipe`。
:::

::: exercise #e5 level=1 kind=coding minutes=10
**忽略整个文件夹。** 你的食谱文件夹中有一个装满大图片的 `photos` 文件夹。请把这个文件夹排除在仓库之外，并提交这条规则。
:::

::: solution
以 `/` 结尾的模式匹配一个文件夹及其中的所有内容：

{{SESSION:m02-e5-solution}}

`git status` 只列出了 `.gitignore`：`photos` 文件夹不再显示为未跟踪。
:::

::: exercise #e6 level=2 kind=conceptual minutes=7
**忽略得太晚？** 昨天你误把 `passwords.txt` 提交了。今天你把 `passwords.txt` 加进了 `.gitignore`。这个文件现在安全吗？你应该怎么做？
:::

::: solution
不安全。`.gitignore` 只影响未跟踪的文件。`passwords.txt` 已经被跟踪，Git 会继续跟踪它，而且昨天的提交仍把这些密码保存在历史中。

立即更改文件中的每一个密码，并把旧密码视为已泄露。然后停止跟踪该文件（`git rm --cached`，见第 3 模块），让 `.gitignore` 从此生效。要把它从旧提交中删除就得改写历史（第 8 模块），而仓库一旦共享出去，这样做也无济于事。最好的防护是从不提交任何机密信息。
:::

## 自测 {#quiz}

```quiz
? `git init` 会创建什么？
- [ ] 你的第一次提交
- [x] 一个隐藏的 `.git` 文件夹，用来保存项目的历史
- [ ] GitHub 上的一个仓库
- [ ] 文件夹的一份备份
> `git init` 通过创建 `.git` 把文件夹变成仓库；第一次提交在之后才做。

? 运行 `git add pancakes.md` 之后，文件的这个版本记录在哪里？
- [ ] 只在工作区
- [ ] 在仓库中
- [x] 在暂存区
- [ ] 在 GitHub 上
> `git add` 把文件的当前内容复制到暂存区，准备进入下一次提交。

? `git status` 显示 “nothing to commit, working tree clean”。这是什么意思？
- [x] 你所做的每一项改动都已提交。
- [ ] 仓库中没有任何提交。
- [ ] Git 删除了你的文件。
- [ ] 你必须先运行 `git add`。
> 工作区、暂存区和最近一次提交三者一致。

? 下列哪条提交说明最好？
- [ ] `changes`
- [ ] `stuff for Sam`
- [ ] `Fixed things and updated README and recipes`
- [x] `Add a pancake recipe`
> 它用祈使语气说明了一项改动；第三个选项描述了多项改动。

? 为什么有时只暂存部分改动？
- [ ] Git 一次只能提交一个文件。
- [x] 为了让每次提交只包含一项改动。
- [ ] 暂存的文件会被上传到 GitHub。
- [ ] 为了让仓库变小。
> 暂存让你决定每次提交包含什么，使每次提交都只讲一件事。

? 提交的输出中出现了 `(root-commit)`。为什么？
- [ ] 这次提交是由管理员做出的。
- [ ] 这次提交修改了根文件夹。
- [x] 它是仓库中的第一次提交。
- [ ] 提交失败了，必须重做。
> 根提交没有父提交：历史从这里开始。

? 哪个文件应该写进 `.gitignore`？
- [x] 编辑器生成的临时文件
- [ ] `README.md`
- [ ] 你写的一份食谱
- [ ] `.gitignore` 本身
> 忽略那些不该共享的文件；`.gitignore` 本身要提交，这样大家共享同一套规则。
```

## 延伸阅读 {#reading}

- Scott Chacon、Ben Straub，[《Pro Git》中文版](https://git-scm.com/book/zh/v2)第 2.2 节“记录每次更新到仓库”。
- [git status](https://git-scm.com/docs/git-status)、[git add](https://git-scm.com/docs/git-add) 和 [git commit](https://git-scm.com/docs/git-commit) 的参考文档（英文）。
- [gitignore](https://git-scm.com/docs/gitignore) 参考文档（英文），包含全部模式规则；以及 GitHub 的 [.gitignore 模板集合](https://github.com/github/gitignore)。
- Chris Beams，[How to write a Git commit message](https://cbea.ms/git-commit/)（英文），介绍如何写好提交说明。
`````


- [ ] **Step 4: Build and read**

Run: `node tutorial-sources/git/build.mjs`
Expected: `Built modules 01, 02 in English and Chinese; ran 10 sessions with git version 2.50.1 (Apple Git-155).`
Read both Module 2 pages as in Task 7. Also check:
- the three-areas figure appears in both languages with its translated labels;
- the graph shows three commits with `HEAD → main`.

- [ ] **Step 5: Commit**

```bash
git add tutorial-sources/git/src docs/tutorials/git
git commit -m "Git series: Module 2 in English and Chinese" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Browser validation

**Files:**
- Create: `tutorial-sources/git/validate.mjs`

**Interfaces:**
- Consumes: the built `docs/tutorials/git/`, `plan/series.json`, each module's contract, and the session files.
- Produces: `node tutorial-sources/git/validate.mjs` prints `PASS: …` or throws an assertion naming the page and the check. Screenshots are saved as `wrwei-git-*.png` in the system temp folder.

- [ ] **Step 1: Write the validator**

`tutorial-sources/git/validate.mjs`:

`````js
/* Browser checks for the Git series, using the AI tools' puppeteer-core. From the repository root,
   after build.mjs:   node tutorial-sources/git/validate.mjs
   Set GIT_SERIES_BROWSER_PATH to choose a Chromium-based browser. Screenshots go to the system temp folder. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {dirname, resolve, extname, sep, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {tmpdir} from 'node:os';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(resolve(here, '../ai/tools/package.json'));
const puppeteer = require('puppeteer-core');
const docs = resolve(here, '../../docs');
const site = join(docs, 'tutorials', 'git');
const pad = n => String(n).padStart(2, '0');
const executablePath = process.env.GIT_SERIES_BROWSER_PATH || [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/chromium', '/usr/bin/google-chrome',
].find(fs.existsSync);
assert(executablePath, 'Set GIT_SERIES_BROWSER_PATH to a Chromium-based browser');

const series = JSON.parse(fs.readFileSync(join(here, 'plan', 'series.json'), 'utf8'));
const published = series.modules.map(m => m.number).filter(n => fs.existsSync(join(site, `module_${pad(n)}_EN.html`)));
assert(published.length, 'No module pages found: run build.mjs first');
const sessionIds = n => {
  const dir = join(here, 'sessions', `module_${pad(n)}`);
  return fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith('.session')).map(f => f.slice(0, -8)).sort() : [];
};

const types = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml'};
const server = createServer(async (req, res) => {
  const file = resolve(docs, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
  if (!file.startsWith(docs + sep)) { res.writeHead(403).end(); return; }
  try { res.setHeader('Content-Type', types[extname(file)] || 'text/plain; charset=utf-8'); res.end(await readFile(file)); }
  catch { res.writeHead(404).end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/tutorials/git/`;
let browser;
try {
  browser = await puppeteer.launch({executablePath, headless: true});
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  for (const number of published) {
    const contract = JSON.parse(fs.readFileSync(join(here, 'plan', `module_${pad(number)}.json`), 'utf8')).contract;
    for (const lang of ['EN', 'ZH']) {
      const file = `module_${pad(number)}_${lang}.html`;
      await page.setViewport({width: 1280, height: 900});
      await page.goto(base + file, {waitUntil: 'networkidle0'});
      const missing = await page.evaluate(() => [...document.querySelectorAll('a[href^="#"]')].map(a => a.hash.slice(1)).filter(id => !document.getElementById(id)));
      assert.deepEqual(missing, [], `${file}: in-page links resolve`);
      const terms = await page.$$eval('.term', els => els.map(el => ({
        id: el.id.replace(/^term-/, ''),
        commands: [...el.querySelectorAll('pre.command code')].map(c => c.textContent),
        commandsWithCopy: el.querySelectorAll('pre.command .copy-btn').length,
        outputsWithCopy: el.querySelectorAll('.output .copy-btn').length,
        caption: el.querySelector('.term-caption')?.textContent || '',
      })));
      assert.deepEqual(terms.map(t => t.id).sort(), sessionIds(number), `${file}: shows every session of the module once`);
      for (const t of terms) {
        assert(t.commands.length > 0, `${file} ${t.id}: has commands`);
        assert(t.commands.every(c => !c.startsWith('$')), `${file} ${t.id}: copying a command does not copy the prompt`);
        assert.equal(t.commandsWithCopy, t.commands.length, `${file} ${t.id}: every command can be copied`);
        assert.equal(t.outputsWithCopy, 0, `${file} ${t.id}: outputs have no copy button`);
        assert.match(t.caption, new RegExp(series.gitVersion.replace(/[()]/g, '\\$&')), `${file} ${t.id}: the caption names the Git version`);
      }
      const graphs = await page.$$eval('figure.graph', els => els.map(el => ({svg: !!el.querySelector('svg[aria-hidden="true"]'), text: el.querySelector('pre.visually-hidden')?.textContent.trim() || ''})));
      for (const g of graphs) assert(g.svg && g.text.length > 0, `${file}: every commit graph has a drawing and a text alternative`);
      assert.equal(await page.$$eval('.exercise', els => els.length), contract.exercises, `${file}: exercises`);
      assert.equal(await page.$$eval('details.solution', els => els.length), contract.exercises, `${file}: solutions`);
      const questions = await page.$$eval('.quiz-q', els => els.length);
      assert(questions >= contract.quiz[0] && questions <= contract.quiz[1], `${file}: quiz length`);
      await page.click('#moduleDropdown .badge');
      assert.equal(await page.$eval('#moduleDropdown .badge', el => el.getAttribute('aria-expanded')), 'true');
      await page.keyboard.press('Escape');
      for (const question of await page.$$('.quiz-q')) {
        const answer = await question.evaluate(el => el.dataset.answer);
        await question.$eval(`[data-i="${answer}"]`, el => el.click());
      }
      assert.match(await page.$eval('.quiz-score', el => el.textContent), new RegExp(`${questions} / ${questions}`), `${file}: full marks for right answers`);
      await page.$eval('details.solution summary', el => el.click());
      assert.equal(await page.$eval('details.solution', el => el.open), true, `${file}: solutions open`);
      await page.$eval('.session-done input', el => { el.checked = true; el.dispatchEvent(new Event('change')); });
      await page.reload({waitUntil: 'networkidle0'});
      assert.equal(await page.$eval('.session-done input', el => el.checked), true, `${file}: progress survives a reload`);
      await Promise.all([page.waitForNavigation({waitUntil: 'networkidle0'}), page.click('.lang-switch')]);
      assert(page.url().endsWith(`module_${pad(number)}_${lang === 'EN' ? 'ZH' : 'EN'}.html`), `${file}: language switch`);
      assert.equal(await page.$eval('.session-done input', el => el.checked), true, `${file}: progress is shared across languages`);
      await page.$eval('.session-done input', el => { el.checked = false; el.dispatchEvent(new Event('change')); });
      await page.goto(base + file, {waitUntil: 'networkidle0'});
      for (const width of [360, 390, 768, 1280]) {
        await page.setViewport({width, height: 900});
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${file}: no horizontal scrolling at ${width}px`);
        if (width < 900) assert.equal(await page.$eval('.mobile-toc', el => getComputedStyle(el).display), 'block', `${file}: mobile contents at ${width}px`);
      }
      await page.setViewport({width: 1280, height: 900});
      await page.screenshot({path: join(tmpdir(), `wrwei-git-module-${pad(number)}-${lang}.png`)});
      await page.setViewport({width: 390, height: 844});
      await page.screenshot({path: join(tmpdir(), `wrwei-git-module-${pad(number)}-${lang}-mobile.png`)});
    }
  }
  for (const lang of ['EN', 'ZH']) {
    const index = lang === 'EN' ? 'index.html' : 'index_ZH.html';
    await page.setViewport({width: 1280, height: 900});
    await page.goto(base + index, {waitUntil: 'networkidle0'});
    assert.equal(await page.$$eval('.module-card', els => els.length), series.modules.length, `${index}: one card per module`);
    assert.equal(await page.$$eval('a.module-card', els => els.length), published.length, `${index}: published modules are linked`);
    assert.equal(await page.$$eval('#acknowledgements', els => els.length), 1, `${index}: acknowledgements`);
    for (const width of [360, 1280]) {
      await page.setViewport({width, height: 900});
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${index}: fits ${width}px`);
    }
    await page.screenshot({path: join(tmpdir(), `wrwei-git-overview-${lang}.png`), fullPage: true});
  }
  assert.deepEqual(errors, [], 'No browser runtime errors');
  console.log(`PASS: modules ${published.map(pad).join(', ')} in both languages: sessions, copyable commands, graphs, quiz, solutions, progress, language switch and layouts at 360–1280px.`);
  console.log(`Screenshots: ${join(tmpdir(), 'wrwei-git-*.png')}`);
} finally {
  if (browser) await browser.close();
  server.close();
}
`````


- [ ] **Step 2: Show that it catches a broken page**

```bash
node -e "const f='docs/tutorials/git/module_02_ZH.html',fs=require('fs');fs.writeFileSync(f,fs.readFileSync(f,'utf8').replace('<pre class=\"visually-hidden\">','<pre class=\"hidden-text\">'))"
node tutorial-sources/git/validate.mjs
```

Expected: FAIL with `AssertionError … module_02_ZH.html: every commit graph has a drawing and a text alternative`. The broken page has lost its graph's text for screen readers.

- [ ] **Step 3: Restore the page and run the validator**

```bash
node tutorial-sources/git/build.mjs
node tutorial-sources/git/validate.mjs
```

Expected: `PASS: modules 01, 02 in both languages: sessions, copyable commands, graphs, quiz, solutions, progress, language switch and layouts at 360–1280px.`

- [ ] **Step 4: Look at the screenshots**

Open the `wrwei-git-*.png` files from the temp folder the validator printed. Check that transcripts, graphs and the figure are legible at both widths, and that the Chinese text is not garbled.

- [ ] **Step 5: Commit**

```bash
git add tutorial-sources/git/validate.mjs
git status --short docs/tutorials/git   # must be empty: the rebuild restored the page exactly
git commit -m "Git series: browser validation of the built pages" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Site integration, README and full verification

**Files:**
- Create: `tutorial-sources/git/README.md`
- Modify: `docs/tutorials/index.md` (insert a card after the MDE card)

- [ ] **Step 1: Write the README**

`tutorial-sources/git/README.md`:

`````markdown
# Git and version control: sources

Published pages are built into `docs/tutorials/git/`. Edit these sources, never the generated HTML.
`SPEC.md` is the design, `PLAN.md` the implementation plan for the shared tooling and Modules 1–2,
and `GLOSSARY.md` the English–Chinese terminology.

## Requirements

- Git: exactly the version named in `plan/series.json` ("gitVersion"), because every output on the
  pages comes from it. The build stops on any other version (see "Changing the Git version").
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
  +file README.md           shown file edit; the contents follow, ending with +end
  # Recipes
  +end
  +hidden notes.txt         hidden file edit, ending with +end
  +end
  @as sam                   act as Sam Lee (alex is the default; each has a folder)
  @graph after-merge        draw the commit graph here
  ```

  Commands are `git` or one of the built-ins `pwd`, `ls`, `cd`, `mkdir` and `cat`, with plain
  arguments: no pipes, redirection, wildcards or variables, so that learners can type them in any
  shell. Paths such as `/home/alex`, `/home/sam` and `/srv/git` (a stand-in server) are what the
  lesson shows; the build maps them to a temporary sandbox.
- `figures/en/fig-NN-MM.svg` and `figures/zh/fig-NN-MM.svg`: hand-drawn diagrams, one per language.

## What the build guarantees

- Every session runs in a fresh sandbox with fixed names, dates, configuration and paths, so its
  output and commit hashes are the same on every machine and every build.
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


- [ ] **Step 2: Add the series card to the tutorials index**

In `docs/tutorials/index.md`, insert this block directly after the line `[:octicons-arrow-right-24: Go to MDE Tutorials](mde/index.html)` and its following `---` separator:

```markdown
## Git and Version Control

A 10-module series for complete beginners: why version control matters, your first repository, history and undoing, branches and merges, remotes and GitHub, pull requests, and recovering from mistakes. Every command is typed on your own computer, and every output shown comes from real Git. English and Chinese editions. Modules 1 and 2 are available now; the other modules are in preparation.

[:octicons-arrow-right-24: Go to Git Tutorials](git/index.html)

---
```

- [ ] **Step 3: Full verification**

```bash
node --test --test-concurrency=1 "tutorial-sources/git/tests/*.test.mjs"
node tutorial-sources/git/build.mjs
git status --short docs/tutorials/git
node tutorial-sources/git/validate.mjs
python -m mkdocs build --strict
```

Expected:
- The test command shows `# pass 25` and `# fail 0`.
- The build reports 10 sessions.
- `git status` prints nothing, so the rebuild is byte-identical, hashes included.
- The validator prints `PASS`.
- MkDocs exits 0 (use an environment with `requirements.txt` installed). Delete or ignore the generated `site/` folder afterwards.

- [ ] **Step 4: Commit and stop**

```bash
git add tutorial-sources/git/README.md docs/tutorials/index.md
git commit -m "Git series: tutorials index card and README" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git log --oneline main..git-series
```

Report the branch's commits, the verification results and the screenshots' location to the site owner. **Do not push or merge.**

---

### Task 11: Publication (only when the site owner asks)

- [ ] **Step 1: Merge and push as instructed**

Fast-forward `main` to `git-series` and push, or open a pull request, as the site owner chooses. Pushing `main` runs `.github/workflows/deploy.yml`.

```bash
gh run list --workflow deploy.yml --limit 1
gh run watch <run-id> --exit-status
```

Expected: the deployment succeeds.

- [ ] **Step 2: Check the live site**

```bash
for p in tutorials/git/ tutorials/git/module_01_EN.html tutorials/git/module_02_ZH.html; do curl -s -o /dev/null -w "%{http_code} $p\n" "https://wrwei.github.io/$p"; done
```

Expected: `200` for each page. GitHub Pages can take a minute to update. Open Module 2 in a browser and copy one command with its Copy button to confirm it pastes without the `$`.
