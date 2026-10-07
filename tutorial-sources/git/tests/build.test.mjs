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
