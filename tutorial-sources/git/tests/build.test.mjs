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
