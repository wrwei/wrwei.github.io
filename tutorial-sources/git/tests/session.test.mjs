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
