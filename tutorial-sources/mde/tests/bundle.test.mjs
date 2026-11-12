import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {playgroundLink, writeBundle, writeZip, zipEntries} from '../tools/bundle.mjs';

test('Playground links name the bundle and select the example', () => {
  assert.equal(playgroundLink('https://wrwei.github.io/tutorials/mde/playground/examples.json', 'm01-tour'),
    'https://eclipse.dev/epsilon/playground/?examples=https%3A%2F%2Fwrwei.github.io%2Ftutorials%2Fmde%2Fplayground%2Fexamples.json&m01-tour');
});

function example() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mde-bundle-'));
  for (const name of ['tour.eol', 'c.emf', 'a.flexmi']) fs.writeFileSync(path.join(dir, name), `contents of ${name}\n`);
  return {id: 'm01-tour', title: {en: 'Tour', zh: '导览'}, language: 'egl', program: 'tour.eol', emfatic: 'c.emf', flexmi: 'a.flexmi', outputType: 'html', dir};
}

test('the bundle groups examples by module with paths relative to examples.json', () => {
  const dest = fs.mkdtempSync(path.join(os.tmpdir(), 'mde-dest-'));
  writeBundle(dest, [{number: 1, title: {en: 'What is MDE?'}, examples: [example()]}, {number: 2, title: {en: 'Later'}, examples: []}]);
  const bundle = JSON.parse(fs.readFileSync(path.join(dest, 'playground', 'examples.json'), 'utf8'));
  assert.deepEqual(bundle, {examples: [{title: 'Module 01: What is MDE?', examples: [{
    id: 'm01-tour', title: 'Tour', language: 'egl',
    program: 'module_01/m01-tour/tour.eol', flexmi: 'module_01/m01-tour/a.flexmi', emfatic: 'module_01/m01-tour/c.emf', outputType: 'html'}]}]});
  assert.equal(fs.readFileSync(path.join(dest, 'playground', 'module_01', 'm01-tour', 'c.emf'), 'utf8'), 'contents of c.emf\n');
});

test('zip downloads open with the JDK jar tool', () => {
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'mde-zip-')), 'module_01.zip');
  writeZip(file, zipEntries([example()]));
  const listing = spawnSync('jar', ['tf', file], {encoding: 'utf8'});
  assert.equal(listing.status, 0, listing.stderr);
  assert.deepEqual(listing.stdout.trim().split(/\r?\n/), ['m01-tour/tour.eol', 'm01-tour/a.flexmi', 'm01-tour/c.emf']);
  const first = fs.readFileSync(file);
  writeZip(file, zipEntries([example()]));
  assert.deepEqual(fs.readFileSync(file), first, 'the same files give the same bytes');
});

test('zip entries use LF line endings, so Windows checkouts produce the same download', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mde-crlf-'));
  fs.writeFileSync(path.join(dir, 'q.eol'), 'a();\r\nb();\r\n');
  const [entry] = zipEntries([{id: 'm01-q', program: 'q.eol', dir}]);
  assert.equal(entry.data.toString('utf8'), 'a();\nb();\n');
});
