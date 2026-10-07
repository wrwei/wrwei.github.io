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
