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
