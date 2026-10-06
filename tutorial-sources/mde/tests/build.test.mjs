import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {build} from '../build.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const RUNNER = path.join(HERE, '..', 'runner');
const BUNDLE = 'https://example.test/mde/playground/examples.json';

function copyFixture() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mde-build-'));
  const root = path.join(tmp, 'src');
  fs.cpSync(path.join(HERE, 'fixtures', 'series'), root, {recursive: true});
  return {root, dest: path.join(tmp, 'site')};
}

test('build writes both editions, the overview, the Playground bundle and the download', () => {
  const {root, dest} = copyFixture();
  assert.deepEqual(build({root, dest, bundleUrl: BUNDLE, runnerDir: RUNNER}), {published: [1], examples: 2});
  const en = fs.readFileSync(path.join(dest, 'module_01_EN.html'), 'utf8');
  assert.match(en, /Hello from Epsilon/);
  assert.match(en, /\?examples=https%3A%2F%2Fexample\.test%2Fmde%2Fplayground%2Fexamples\.json&amp;m01-hello"/);
  assert.match(fs.readFileSync(path.join(dest, 'module_01_ZH.html'), 'utf8'), /在 Playground 中打开/);
  const overview = fs.readFileSync(path.join(dest, 'index.html'), 'utf8');
  assert.equal((overview.match(/class="module-card/g) || []).length, 2);
  assert.equal((overview.match(/<a href="module_01_EN.html" class="module-card"/g) || []).length, 1);
  const bundle = JSON.parse(fs.readFileSync(path.join(dest, 'playground', 'examples.json'), 'utf8'));
  for (const entry of bundle.examples[0].examples) {
    for (const field of ['program', 'flexmi', 'emfatic']) assert(fs.existsSync(path.join(dest, 'playground', entry[field])), entry[field]);
  }
  assert(fs.existsSync(path.join(dest, 'downloads', 'module_01.zip')));
  assert(fs.existsSync(path.join(dest, 'assets', 'style.css')));
});

test('build rejects a Chinese edition whose structure differs', () => {
  const {root, dest} = copyFixture();
  const zh = path.join(root, 'src', 'zh', 'module_01.md');
  fs.writeFileSync(zh, fs.readFileSync(zh, 'utf8').replace('- [ ] 这个\n- [x] 那个', '- [x] 这个\n- [ ] 那个'));
  assert.throws(() => build({root, dest, bundleUrl: BUNDLE, runnerDir: RUNNER}), /Chinese edition's quizAnswers differ/);
});

test('build rejects a Chinese source that is a copy of the English one', () => {
  const {root, dest} = copyFixture();
  fs.copyFileSync(path.join(root, 'src', 'en', 'module_01.md'), path.join(root, 'src', 'zh', 'module_01.md'));
  assert.throws(() => build({root, dest, bundleUrl: BUNDLE, runnerDir: RUNNER}), /Chinese source is a copy/);
});

test('build rejects an example that does not behave as declared', () => {
  const {root, dest} = copyFixture();
  fs.writeFileSync(path.join(root, 'examples', 'module_01', 'm01-hello', 'hello.eol'), 'Component.all.first().nosuch.println();\n');
  assert.throws(() => build({root, dest, bundleUrl: BUNDLE, runnerDir: RUNNER}), /m01-hello:\n  - expected "ok" but the run ended with "error"/);
});
