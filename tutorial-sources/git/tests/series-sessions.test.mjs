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

test('Module 9 sessions print what the lesson describes', () => {
  const inside = outputs('m09-look-inside');
  assert.equal(inside[1], 'commit\n');
  assert.equal(inside[2], 'tree 063e1373abab86d50db53df21ded863f36cfc794\nparent 907a97958867987ca6ef7be665cd4b3f86bb08d6\nauthor Alex Smith <alex@example.com> 1767604020 +0000\ncommitter Alex Smith <alex@example.com> 1767604020 +0000\n\nAdd a pancake recipe\n');
  assert.equal(inside[3], '100644 blob 2ecc1f2d65cf3b272e009b477014267d15171467\tREADME.md\n100644 blob 871d830f4cec82e60e46ad67ec042c33f215a834\tpancakes.md\n');
  assert.match(inside[5], /^tree 38a015c41d763382717c898da156ce660f860bea\nauthor /, 'the first commit has no parent line');
  const hash = outputs('m09-hash');
  assert.equal(hash[0], '871d830f4cec82e60e46ad67ec042c33f215a834\n');
  assert.equal(hash[1], hash[0]);
  assert.notEqual(hash[2], hash[0]);
  const objects = outputs('m09-objects');
  assert.equal(objects[0], 'COMMIT_EDITMSG  HEAD  config  description  hooks  index  info  logs  objects  refs\n');
  assert.equal(objects[1], '06  2e  38  87  8b  90  info  pack\n', 'six objects in six folders');
  assert.equal(objects[2], '1d830f4cec82e60e46ad67ec042c33f215a834\n');
  const refs = outputs('m09-refs');
  assert.equal(refs[0], 'ref: refs/heads/main\n');
  assert.equal(refs[2], '8bf3c2d58c2d8d9c541c166d6e80435faab5756a\n');
  assert.equal(refs[5], refs[2]);
  assert.equal(refs[7], 'ref: refs/heads/soups\n');
  assert.equal(outputs('m09-e2-solution')[2], '100644 blob 2ecc1f2d65cf3b272e009b477014267d15171467\tREADME.md\n');
  assert.equal(outputs('m09-e4-solution')[1], '907a97958867987ca6ef7be665cd4b3f86bb08d6\n');
});

test('Module 10 sessions print what the lesson describes', () => {
  assert.match(outputs('m10-start')[4], /^\[main \(root-commit\) db5abad\] Start the family cookbook\n/);
  assert.equal(outputs('m10-start')[10], 'db5abad Start the family cookbook\n');
  assert.deepEqual(people('m10-start'), ['sam']);
  const parallel = outputs('m10-parallel');
  assert.match(parallel[2], /^\[add-soup 7c82c56\] Add a tomato soup recipe\n/);
  assert.match(parallel[6], /^\[add-bread 0070943\] Add a soda bread recipe\n/);
  assert.deepEqual(sessions().get('m10-parallel').graphs['two-branches'].commits.map(c => c.short), ['0070943', 'db5abad'], "Sam's repository has not fetched add-soup");
  const conflict = sessions().get('m10-conflict').record.filter(r => r.kind === 'command');
  assert.equal(conflict[1].ok, false);
  assert.match(conflict[2].output, /<<<<<<< HEAD\n- \[Soda bread\]\(bread\.md\)\n=======\n- \[Tomato soup\]\(soup\.md\)\n>>>>>>> origin\/main\n/);
  assert.match(conflict[4].output, /\] Merge remote-tracking branch 'origin\/main' into add-bread\n/);
  const merged = sessions().get('m10-merge');
  assert.equal(merged.graphs.merged.commits[0].subject, 'Merge pull request #2 from alex/add-bread');
  assert.deepEqual(merged.graphs.merged.commits.slice(-3).map(c => c.short), ['7c82c56', '0070943', 'db5abad']);
  const release = outputs('m10-release');
  assert.equal(release[2], 'To /srv/git/cookbook.git\n * [new tag]         v1.0 -> v1.0\n');
  assert.match(release[4], /^tag v1\.0\nTagger: Alex Smith <alex@example\.com>\n/);
  assert.match(release[5], / \* \[new tag\]         v1\.0       -> v1\.0\n$/);
  assert.match(sessions().get('m10-release').graphs.released.commits[0].refs, /tag: refs\/tags\/v1\.0/);
  assert.equal(outputs('m10-e1-solution').at(-1), 'v1.0\nv1.0.1\n');
  assert.deepEqual(outputs('m10-e3-solution'), ['0070943 Add a soda bread recipe\n', 'Sam Lee, Add a soda bread recipe\n']);
  assert.equal(outputs('m10-e4-solution').at(-1), 'v1.0\n');
});
