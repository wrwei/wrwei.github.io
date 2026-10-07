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
