# Git and Version Control Series: Modules 9–10 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish-ready Modules 9 (How Git works inside) and 10 (Capstone: a team project) in English and Chinese, completing the ten-module series.

**Architecture:**
- **No tooling changes.** Modules 9–10 use the series tooling as it stands after Modules 6–8.
- **Module 9** reads Git's own data with commands that are safe for learners: `git cat-file`, `git hash-object`, `git rev-parse`, and `cat` and `ls` inside `.git`.
- **Module 10** is a capstone project in five milestones, using the stand-in server and both people. It ends with an annotated tag, drawn as a tag label in the commit graph.
- **Lessons** are finished text, embedded verbatim.

**Tech Stack:**
- Node 22.2+ (`node:test`; `markdown-it` and `puppeteer-core` via `tutorial-sources/ai/tools`);
- Git, exactly `git version 2.50.1 (Apple Git-155)`;
- Chrome or Edge;
- MkDocs (root `requirements.txt`).

**Spec:** `tutorial-sources/git/SPEC.md`:
- §3: Module 9 covers blobs, trees and commits, hashes, refs and `HEAD`, why branches are cheap, and `cat-file`. Module 10 has two people, two clones and a shared remote, with branches, a conflict, a pull request and a release tag.
- §8: Module 10's further reading points to submodules, LFS, hooks, bisect, worktrees and signing.

**Provenance:** before this plan was written, every file in it was run in a scratch copy of branch `git-modules-06-08`, including that branch's review fixes:
- each test failed before its change, for the reasons given;
- all 71 tests then passed;
- `build.mjs` built all ten modules (64 sessions);
- `validate.mjs` passed for Modules 1–10;
- every external link returned HTTP 200 without a redirect.

Then the plan was replayed step by step on a fresh copy, and the result was byte-identical to the scratch copy. Copy every file exactly.

## Global Constraints

- **Separate worktree, stacked branch.** Another agent is editing the MDE series in the main checkout. Work in the worktree `../wrwei.github.io-git-modules` on branch `git-modules-09-10`, created from `git-modules-06-08` to commit this plan.
- **Allowed paths.** Change only `tutorial-sources/git/`, `docs/tutorials/git/` and the Git card in `docs/tutorials/index.md`. Stage files by explicit path.
- **Git version.** The build runs only with `git version 2.50.1 (Apple Git-155)`.
- **Bilingual.** Every module is in English and Simplified Chinese with identical structure. Chinese follows `GLOSSARY.md`.
- **Deterministic sessions.** Sessions must not print anything that depends on the machine. For example, `git count-objects` reports sizes in disk blocks, which differ between file systems, so Module 9 lists `.git/objects` instead.
- **Follow-along.** Every teaching session and coding exercise says how learners recreate its situation, or why their output differs.
- **Commits.** Commit after each task. Messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- **Publishing.** Do not push, merge into `main` or deploy unless the site owner explicitly asks (Task 5).

## Review Focus

1. **Machine-dependent output in an internals session**, such as sizes, timestamps from the file system, or object counts after an automatic `gc`. Expected: two builds are byte-identical. Pinned by the exact `ls .git` and `ls .git/objects` assertions in `tests/series-sessions.test.mjs` (Task 1), and the double build in Task 4.
2. **Learners editing `.git` by hand after reading Module 9.** Expected: the lesson warns against it, and every command it shows only reads. Pinned by `tests/lesson-facts.test.mjs` 'Module 9 warns against editing the .git folder by hand' (Task 2).
3. **The capstone done alone, where GitHub forbids approving your own pull request.** Expected: the lesson says what to do instead. Pinned by `tests/lesson-facts.test.mjs` (Task 3).
4. **A release tag that never reaches GitHub,** because `git push` does not send tags. Expected: the lesson pushes the tag by name and says why. Pinned by `tests/lesson-facts.test.mjs` (Task 3) and the `[new tag]` assertions in `tests/series-sessions.test.mjs` (Task 1).
5. **The capstone's tangled graph misdrawn,** with two pull-request merges and a catch-up merge. Expected: every merge draws both parent lines. Pinned by the parent assertions for `m10-merge` in `tests/series-sessions.test.mjs` (Task 1), and by reading the page in Task 3.

---

### Task 1: Modules 9–10 configuration, sessions, figure and glossary

**Files:**
- Create: `tutorial-sources/git/plan/module_09.json`, `tutorial-sources/git/plan/module_10.json`
- Create: `tutorial-sources/git/sessions/module_09/` (6) and `sessions/module_10/` (8)
- Create: `tutorial-sources/git/figures/en/fig-09-01.svg`, `figures/zh/fig-09-01.svg`
- Modify: `tutorial-sources/git/GLOSSARY.md`, `tutorial-sources/git/tests/series-sessions.test.mjs`

**Interfaces:**
- **Module 9:**
  - teaching: `m09-look-inside`, `m09-hash`, `m09-objects`, `m09-refs`;
  - solutions: `m09-e2-solution`, `m09-e4-solution`;
  - figure: `fig-09-01`;
  - sections `s1`–`s5`.
- **Module 10:**
  - teaching: `m10-start`, `m10-parallel` (graph `two-branches`), `m10-conflict` (`updated`), `m10-merge` (`merged`), `m10-release` (`released`);
  - solutions: `m10-e1-solution`, `m10-e3-solution`, `m10-e4-solution`;
  - sections `s1`–`s6`.
- **Glossary:** objects (对象, 数据对象, 树对象), refs (引用, 符号引用), annotated and lightweight tags (附注标签, 轻量标签), a GitHub release (发行版), semantic versioning (语义化版本), rulesets and branch protection (规则集, 分支保护).

- [ ] **Step 1: Write the failing test**

Replace `tutorial-sources/git/tests/series-sessions.test.mjs` with:

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
`````


- [ ] **Step 2: Run the test to see it fail**

Run: `node --test --test-concurrency=1 "tutorial-sources/git/tests/*.test.mjs"`
Expected: `# tests 69`, `# fail 2`. The tests for Modules 9 and 10 fail with `Cannot read properties of undefined (reading 'record')`.

- [ ] **Step 3: Create the configuration, sessions, figure and glossary**

`tutorial-sources/git/plan/module_09.json`:

`````json
{
  "number": 9,
  "hours": 2,
  "title": {"en": "How Git works inside", "zh": "Git 的内部原理"},
  "lead": {"en": "Look inside the .git folder: the blobs, trees and commits that hold your history, the hashes that name them, and the small files that make branches and HEAD.", "zh": "看看 .git 文件夹的内部：保存历史的数据对象、树对象和提交对象，为它们命名的哈希，以及构成分支和 HEAD 的那些小文件。"},
  "prerequisites": {"en": "Modules 2 to 8. Nothing here is needed for everyday work, but it explains why Git behaves as it does.", "zh": "第 2 至第 8 模块。日常工作并不需要这些内容，但它们能解释 Git 为什么会这样运作。"},
  "outcomes": {
    "en": [
      "Name Git's three main kinds of object, blob, tree and commit, and say what each holds.",
      "Look inside any object with git cat-file.",
      "Explain how hashes are calculated from content, and why changing a commit changes every later hash.",
      "Find where objects, branches and HEAD are stored in the .git folder.",
      "Explain why branches are cheap, and what a detached HEAD is in these terms."
    ],
    "zh": [
      "说出 Git 的三种主要对象：数据对象、树对象和提交对象，以及各自保存的内容。",
      "用 git cat-file 查看任意对象的内部。",
      "解释哈希如何由内容计算得出，以及为什么改动一次提交会改变之后所有提交的哈希。",
      "在 .git 文件夹中找到对象、分支和 HEAD 的存放位置。",
      "用这些概念解释为什么分支很廉价，以及什么是分离的 HEAD。"
    ]
  },
  "sessions": [
    {"minutes": 60, "title": {"en": "Objects", "zh": "对象"}, "activities": [
      {"kind": "read", "anchor": "s1", "minutes": 15, "text": {"en": "Objects and hashes", "zh": "对象与哈希"}},
      {"kind": "practice", "anchor": "s2", "minutes": 25, "text": {"en": "Looking inside a commit", "zh": "查看一次提交的内部"}},
      {"kind": "practice", "anchor": "s3", "minutes": 20, "text": {"en": "Hashes come from content", "zh": "哈希来自内容"}}
    ]},
    {"minutes": 60, "title": {"en": "Storage, refs and practice", "zh": "存储、引用与练习"}, "activities": [
      {"kind": "practice", "anchor": "s4", "minutes": 15, "text": {"en": "Where objects live", "zh": "对象存放在哪里"}},
      {"kind": "practice", "anchor": "s5", "minutes": 15, "text": {"en": "Branches and HEAD", "zh": "分支与 HEAD"}},
      {"kind": "exercises", "anchor": "exercises", "minutes": 20, "text": {"en": "Six exercises", "zh": "六道练习"}},
      {"kind": "quiz", "anchor": "quiz", "minutes": 10, "text": {"en": "Self-check quiz", "zh": "自测"}}
    ]}
  ],
  "contract": {"sessions": [3, 6], "exercises": 6, "quiz": [6, 8], "sections": ["s1", "s2", "s3", "s4", "s5", "exercises", "quiz", "reading"]}
}
`````

`tutorial-sources/git/plan/module_10.json`:

`````json
{
  "number": 10,
  "hours": 3,
  "title": {"en": "Capstone: a team project", "zh": "综合项目：团队协作"},
  "lead": {"en": "Put the whole series to work: two people, two clones and one shared repository build a family cookbook from the first commit to a tagged release, with branches, pull requests, a conflict and a review on the way.", "zh": "把整个系列学到的内容付诸实践：两个人、两个克隆和一个共享仓库，从第一次提交到打上标签的发布版本，共同完成一本家庭食谱，途中经历分支、拉取请求、一次冲突和一次审查。"},
  "prerequisites": {"en": "Modules 1 to 8, and a GitHub account (Module 6). A friend with a GitHub account is welcome, but not required.", "zh": "第 1 至第 8 模块，以及一个 GitHub 账号（第 6 模块）。欢迎找一位有 GitHub 账号的朋友一起做，但这不是必需的。"},
  "outcomes": {
    "en": [
      "Set up a shared repository for a team, with each member working in their own clone.",
      "Develop two features in parallel on branches, each proposed in a pull request.",
      "Resolve a conflict in a pull request by bringing main into the branch.",
      "Review, merge and tidy up, so that everyone's main stays in step.",
      "Tag a release with an annotated tag, push it, and publish it on GitHub."
    ],
    "zh": [
      "为团队建立共享仓库，每位成员在自己的克隆中工作。",
      "在分支上并行开发两项功能，每项都通过拉取请求提出。",
      "通过把 main 带进分支，解决拉取请求中的冲突。",
      "审查、合并并整理，让每个人的 main 都保持同步。",
      "用附注标签为发布版本打标签，推送它，并在 GitHub 上发布。"
    ]
  },
  "sessions": [
    {"minutes": 60, "title": {"en": "Starting together", "zh": "共同起步"}, "activities": [
      {"kind": "read", "anchor": "s1", "minutes": 10, "text": {"en": "The project", "zh": "项目介绍"}},
      {"kind": "practice", "anchor": "s2", "minutes": 20, "text": {"en": "Milestone 1: a shared repository", "zh": "里程碑 1：共享仓库"}},
      {"kind": "practice", "anchor": "s3", "minutes": 30, "text": {"en": "Milestone 2: two features at once", "zh": "里程碑 2：同时开发两项功能"}}
    ]},
    {"minutes": 60, "title": {"en": "Integrating and releasing", "zh": "整合与发布"}, "activities": [
      {"kind": "practice", "anchor": "s4", "minutes": 25, "text": {"en": "Milestone 3: a conflict", "zh": "里程碑 3：一次冲突"}},
      {"kind": "practice", "anchor": "s5", "minutes": 15, "text": {"en": "Milestone 4: review and merge", "zh": "里程碑 4：审查与合并"}},
      {"kind": "practice", "anchor": "s6", "minutes": 20, "text": {"en": "Milestone 5: a release", "zh": "里程碑 5：发布版本"}}
    ]},
    {"minutes": 60, "title": {"en": "Going further", "zh": "更进一步"}, "activities": [
      {"kind": "exercises", "anchor": "exercises", "minutes": 45, "text": {"en": "Six extension tasks", "zh": "六项拓展任务"}},
      {"kind": "quiz", "anchor": "quiz", "minutes": 15, "text": {"en": "Self-check quiz", "zh": "自测"}}
    ]}
  ],
  "contract": {"sessions": [3, 6], "exercises": 6, "quiz": [6, 8], "sections": ["s1", "s2", "s3", "s4", "s5", "s6", "exercises", "quiz", "reading"]}
}
`````


`tutorial-sources/git/sessions/module_09/m09-look-inside.session`:

`````text
title: Look inside a commit
title-zh: 查看一次提交的内部
---
# A recipes repository with two commits
> mkdir recipes
> cd recipes
> git init
+hidden README.md
# Family recipes

Recipes we cook again and again.
+end
> git add README.md
> git commit -m "Add a README"
+hidden pancakes.md
# Pancakes

- 200 g flour
- 2 eggs
- 300 ml milk
+end
> git add pancakes.md
> git commit -m "Add a pancake recipe"
$ git log --oneline
$ git cat-file -t 8bf3c2d
$ git cat-file -p 8bf3c2d
$ git cat-file -p 063e137
$ git cat-file -p 871d830
$ git cat-file -p 907a979
`````

`tutorial-sources/git/sessions/module_09/m09-hash.session`:

`````text
title: Same content, same hash
title-zh: 内容相同，哈希相同
---
# A recipes repository with two commits
> mkdir recipes
> cd recipes
> git init
+hidden README.md
# Family recipes

Recipes we cook again and again.
+end
> git add README.md
> git commit -m "Add a README"
+hidden pancakes.md
# Pancakes

- 200 g flour
- 2 eggs
- 300 ml milk
+end
> git add pancakes.md
> git commit -m "Add a pancake recipe"
$ git hash-object pancakes.md
+file pancakes-copy.md
# Pancakes

- 200 g flour
- 2 eggs
- 300 ml milk
+end
$ git hash-object pancakes-copy.md
+file pancakes-copy.md
# Pancakes

- 200 g flour
- 2 eggs
- 300 ml milk.
+end
$ git hash-object pancakes-copy.md
`````

`tutorial-sources/git/sessions/module_09/m09-objects.session`:

`````text
title: Where the objects live
title-zh: 对象存放在哪里
---
# A recipes repository with two commits
> mkdir recipes
> cd recipes
> git init
+hidden README.md
# Family recipes

Recipes we cook again and again.
+end
> git add README.md
> git commit -m "Add a README"
+hidden pancakes.md
# Pancakes

- 200 g flour
- 2 eggs
- 300 ml milk
+end
> git add pancakes.md
> git commit -m "Add a pancake recipe"
$ ls .git
$ ls .git/objects
$ ls .git/objects/87
$ git cat-file -t 871d830f4cec82e60e46ad67ec042c33f215a834
`````

`tutorial-sources/git/sessions/module_09/m09-refs.session`:

`````text
title: Branches and HEAD are small files
title-zh: 分支和 HEAD 都是小文件
---
# A recipes repository with two commits
> mkdir recipes
> cd recipes
> git init
+hidden README.md
# Family recipes

Recipes we cook again and again.
+end
> git add README.md
> git commit -m "Add a README"
+hidden pancakes.md
# Pancakes

- 200 g flour
- 2 eggs
- 300 ml milk
+end
> git add pancakes.md
> git commit -m "Add a pancake recipe"
$ cat .git/HEAD
$ ls .git/refs/heads
$ cat .git/refs/heads/main
$ git branch soups
$ ls .git/refs/heads
$ cat .git/refs/heads/soups
$ git switch soups
$ cat .git/HEAD
$ git rev-parse HEAD
`````

`tutorial-sources/git/sessions/module_09/m09-e2-solution.session`:

`````text
title: The tree of the first commit
title-zh: 第一次提交的树
role: solution
---
# A recipes repository with two commits
> mkdir recipes
> cd recipes
> git init
+hidden README.md
# Family recipes

Recipes we cook again and again.
+end
> git add README.md
> git commit -m "Add a README"
+hidden pancakes.md
# Pancakes

- 200 g flour
- 2 eggs
- 300 ml milk
+end
> git add pancakes.md
> git commit -m "Add a pancake recipe"
$ git log --oneline
$ git cat-file -p 907a979
$ git cat-file -p 38a015c
`````

`tutorial-sources/git/sessions/module_09/m09-e4-solution.session`:

`````text
title: What HEAD holds when it is detached
title-zh: HEAD 分离时保存的内容
role: solution
---
# A recipes repository with two commits
> mkdir recipes
> cd recipes
> git init
+hidden README.md
# Family recipes

Recipes we cook again and again.
+end
> git add README.md
> git commit -m "Add a README"
+hidden pancakes.md
# Pancakes

- 200 g flour
- 2 eggs
- 300 ml milk
+end
> git add pancakes.md
> git commit -m "Add a pancake recipe"
$ git switch --detach HEAD~1
$ cat .git/HEAD
$ git switch main
$ cat .git/HEAD
`````


`tutorial-sources/git/sessions/module_10/m10-start.session`:

`````text
title: Start the project and share it
title-zh: 启动项目并共享它
---
$ mkdir cookbook
$ cd cookbook
$ git init
+file README.md
# Family cookbook

Our family's recipes, collected by Alex and Sam.
+end
+file index.md
# Recipes

- [Pancakes](pancakes.md)
+end
+file pancakes.md
# Pancakes

- 200 g flour
- 2 eggs
- 300 ml milk
+end
$ git add README.md index.md pancakes.md
$ git commit -m "Start the family cookbook"
$ git init --bare /srv/git/cookbook.git
$ git remote add origin /srv/git/cookbook.git
$ git push -u origin main
@as sam
$ git clone /srv/git/cookbook.git
$ cd cookbook
$ git log --oneline
`````

`tutorial-sources/git/sessions/module_10/m10-parallel.session`:

`````text
title: Two features at once
title-zh: 同时开发两项功能
---
# The cookbook is on the server, and both people have a clone
> mkdir cookbook
> cd cookbook
> git init
+hidden README.md
# Family cookbook

Our family's recipes, collected by Alex and Sam.
+end
+hidden index.md
# Recipes

- [Pancakes](pancakes.md)
+end
+hidden pancakes.md
# Pancakes

- 200 g flour
- 2 eggs
- 300 ml milk
+end
> git add README.md index.md pancakes.md
> git commit -m "Start the family cookbook"
> git init --bare /srv/git/cookbook.git
> git remote add origin /srv/git/cookbook.git
> git push -u origin main
@as sam
> git clone /srv/git/cookbook.git
> cd cookbook
> git log --oneline
@as alex
> git config --global pull.rebase false
@as sam
> git config --global pull.rebase false
@as alex
$ git switch -c add-soup
+file soup.md
# Tomato soup

- 1 kg tomatoes
+end
+file index.md
# Recipes

- [Pancakes](pancakes.md)
- [Tomato soup](soup.md)
+end
$ git add soup.md index.md
$ git commit -m "Add a tomato soup recipe"
$ git push -u origin add-soup
@as sam
$ git switch -c add-bread
+file bread.md
# Soda bread

- 450 g flour
+end
+file index.md
# Recipes

- [Pancakes](pancakes.md)
- [Soda bread](bread.md)
+end
$ git add bread.md index.md
$ git commit -m "Add a soda bread recipe"
$ git push -u origin add-bread
@graph two-branches
`````

`tutorial-sources/git/sessions/module_10/m10-conflict.session`:

`````text
title: Bring a branch up to date, and resolve the conflict
title-zh: 让分支跟上最新进展，并解决冲突
---
# The cookbook is on the server, and both people have a clone
> mkdir cookbook
> cd cookbook
> git init
+hidden README.md
# Family cookbook

Our family's recipes, collected by Alex and Sam.
+end
+hidden index.md
# Recipes

- [Pancakes](pancakes.md)
+end
+hidden pancakes.md
# Pancakes

- 200 g flour
- 2 eggs
- 300 ml milk
+end
> git add README.md index.md pancakes.md
> git commit -m "Start the family cookbook"
> git init --bare /srv/git/cookbook.git
> git remote add origin /srv/git/cookbook.git
> git push -u origin main
@as sam
> git clone /srv/git/cookbook.git
> cd cookbook
> git log --oneline
@as alex
> git config --global pull.rebase false
@as sam
> git config --global pull.rebase false
@as alex
> git switch -c add-soup
+hidden soup.md
# Tomato soup

- 1 kg tomatoes
+end
+hidden index.md
# Recipes

- [Pancakes](pancakes.md)
- [Tomato soup](soup.md)
+end
> git add soup.md index.md
> git commit -m "Add a tomato soup recipe"
> git push -u origin add-soup
@as sam
> git switch -c add-bread
+hidden bread.md
# Soda bread

- 450 g flour
+end
+hidden index.md
# Recipes

- [Pancakes](pancakes.md)
- [Soda bread](bread.md)
+end
> git add bread.md index.md
> git commit -m "Add a soda bread recipe"
> git push -u origin add-bread
@as alex
# Sam reviews Alex's pull request and merges it on GitHub
@as sam
> git fetch
> git switch main
> git merge --no-ff origin/add-soup -m "Merge pull request #1 from alex/add-soup"
> git push
> git push origin --delete add-soup
> git switch add-bread
@as alex
@as sam
$ git fetch
$! git merge origin/main
$ cat index.md
+file index.md
# Recipes

- [Pancakes](pancakes.md)
- [Soda bread](bread.md)
- [Tomato soup](soup.md)
+end
$ git add index.md
$ git commit
$ git push
@graph updated
`````

`tutorial-sources/git/sessions/module_10/m10-merge.session`:

`````text
title: Merge the second pull request and tidy up
title-zh: 合并第二个拉取请求并整理
---
# The cookbook is on the server, and both people have a clone
> mkdir cookbook
> cd cookbook
> git init
+hidden README.md
# Family cookbook

Our family's recipes, collected by Alex and Sam.
+end
+hidden index.md
# Recipes

- [Pancakes](pancakes.md)
+end
+hidden pancakes.md
# Pancakes

- 200 g flour
- 2 eggs
- 300 ml milk
+end
> git add README.md index.md pancakes.md
> git commit -m "Start the family cookbook"
> git init --bare /srv/git/cookbook.git
> git remote add origin /srv/git/cookbook.git
> git push -u origin main
@as sam
> git clone /srv/git/cookbook.git
> cd cookbook
> git log --oneline
@as alex
> git config --global pull.rebase false
@as sam
> git config --global pull.rebase false
@as alex
> git switch -c add-soup
+hidden soup.md
# Tomato soup

- 1 kg tomatoes
+end
+hidden index.md
# Recipes

- [Pancakes](pancakes.md)
- [Tomato soup](soup.md)
+end
> git add soup.md index.md
> git commit -m "Add a tomato soup recipe"
> git push -u origin add-soup
@as sam
> git switch -c add-bread
+hidden bread.md
# Soda bread

- 450 g flour
+end
+hidden index.md
# Recipes

- [Pancakes](pancakes.md)
- [Soda bread](bread.md)
+end
> git add bread.md index.md
> git commit -m "Add a soda bread recipe"
> git push -u origin add-bread
@as alex
# Sam reviews Alex's pull request and merges it on GitHub
@as sam
> git fetch
> git switch main
> git merge --no-ff origin/add-soup -m "Merge pull request #1 from alex/add-soup"
> git push
> git push origin --delete add-soup
> git switch add-bread
@as alex
@as sam
> git fetch
>! git merge origin/main
+hidden index.md
# Recipes

- [Pancakes](pancakes.md)
- [Soda bread](bread.md)
- [Tomato soup](soup.md)
+end
> git add index.md
> git commit
> git push
# Alex reviews Sam's pull request and merges it on GitHub
@as alex
> git fetch
> git switch main
> git pull
> git merge --no-ff origin/add-bread -m "Merge pull request #2 from alex/add-bread"
> git push
> git push origin --delete add-bread
@as sam
$ git switch main
$ git pull
$ git branch -d add-bread
$ git fetch --prune
$ cat index.md
@graph merged
`````

`tutorial-sources/git/sessions/module_10/m10-release.session`:

`````text
title: Tag the first release
title-zh: 为第一个版本打标签
---
# The cookbook is on the server, and both people have a clone
> mkdir cookbook
> cd cookbook
> git init
+hidden README.md
# Family cookbook

Our family's recipes, collected by Alex and Sam.
+end
+hidden index.md
# Recipes

- [Pancakes](pancakes.md)
+end
+hidden pancakes.md
# Pancakes

- 200 g flour
- 2 eggs
- 300 ml milk
+end
> git add README.md index.md pancakes.md
> git commit -m "Start the family cookbook"
> git init --bare /srv/git/cookbook.git
> git remote add origin /srv/git/cookbook.git
> git push -u origin main
@as sam
> git clone /srv/git/cookbook.git
> cd cookbook
> git log --oneline
@as alex
> git config --global pull.rebase false
@as sam
> git config --global pull.rebase false
@as alex
> git switch -c add-soup
+hidden soup.md
# Tomato soup

- 1 kg tomatoes
+end
+hidden index.md
# Recipes

- [Pancakes](pancakes.md)
- [Tomato soup](soup.md)
+end
> git add soup.md index.md
> git commit -m "Add a tomato soup recipe"
> git push -u origin add-soup
@as sam
> git switch -c add-bread
+hidden bread.md
# Soda bread

- 450 g flour
+end
+hidden index.md
# Recipes

- [Pancakes](pancakes.md)
- [Soda bread](bread.md)
+end
> git add bread.md index.md
> git commit -m "Add a soda bread recipe"
> git push -u origin add-bread
@as alex
# Sam reviews Alex's pull request and merges it on GitHub
@as sam
> git fetch
> git switch main
> git merge --no-ff origin/add-soup -m "Merge pull request #1 from alex/add-soup"
> git push
> git push origin --delete add-soup
> git switch add-bread
@as alex
@as sam
> git fetch
>! git merge origin/main
+hidden index.md
# Recipes

- [Pancakes](pancakes.md)
- [Soda bread](bread.md)
- [Tomato soup](soup.md)
+end
> git add index.md
> git commit
> git push
# Alex reviews Sam's pull request and merges it on GitHub
@as alex
> git fetch
> git switch main
> git pull
> git merge --no-ff origin/add-bread -m "Merge pull request #2 from alex/add-bread"
> git push
> git push origin --delete add-bread
# Alex's main is up to date with the merged pull requests
> git switch main
> git pull
> git branch -d add-soup
> git fetch --prune
$ git log --oneline --graph
$ git tag -a v1.0 -m "Family cookbook 1.0"
$ git push origin v1.0
$ git tag
$ git show v1.0 --no-patch
@graph released
@as sam
$ git fetch
`````

`tutorial-sources/git/sessions/module_10/m10-e1-solution.session`:

`````text
title: A fix release
title-zh: 一个修正版本
role: solution
---
# The cookbook is on the server, and both people have a clone
> mkdir cookbook
> cd cookbook
> git init
+hidden README.md
# Family cookbook

Our family's recipes, collected by Alex and Sam.
+end
+hidden index.md
# Recipes

- [Pancakes](pancakes.md)
+end
+hidden pancakes.md
# Pancakes

- 200 g flour
- 2 eggs
- 300 ml milk
+end
> git add README.md index.md pancakes.md
> git commit -m "Start the family cookbook"
> git init --bare /srv/git/cookbook.git
> git remote add origin /srv/git/cookbook.git
> git push -u origin main
@as sam
> git clone /srv/git/cookbook.git
> cd cookbook
> git log --oneline
@as alex
> git config --global pull.rebase false
@as sam
> git config --global pull.rebase false
@as alex
> git switch -c add-soup
+hidden soup.md
# Tomato soup

- 1 kg tomatoes
+end
+hidden index.md
# Recipes

- [Pancakes](pancakes.md)
- [Tomato soup](soup.md)
+end
> git add soup.md index.md
> git commit -m "Add a tomato soup recipe"
> git push -u origin add-soup
@as sam
> git switch -c add-bread
+hidden bread.md
# Soda bread

- 450 g flour
+end
+hidden index.md
# Recipes

- [Pancakes](pancakes.md)
- [Soda bread](bread.md)
+end
> git add bread.md index.md
> git commit -m "Add a soda bread recipe"
> git push -u origin add-bread
@as alex
# Sam reviews Alex's pull request and merges it on GitHub
@as sam
> git fetch
> git switch main
> git merge --no-ff origin/add-soup -m "Merge pull request #1 from alex/add-soup"
> git push
> git push origin --delete add-soup
> git switch add-bread
@as alex
@as sam
> git fetch
>! git merge origin/main
+hidden index.md
# Recipes

- [Pancakes](pancakes.md)
- [Soda bread](bread.md)
- [Tomato soup](soup.md)
+end
> git add index.md
> git commit
> git push
# Alex reviews Sam's pull request and merges it on GitHub
@as alex
> git fetch
> git switch main
> git pull
> git merge --no-ff origin/add-bread -m "Merge pull request #2 from alex/add-bread"
> git push
> git push origin --delete add-bread
# Alex's main is up to date with the merged pull requests
> git switch main
> git pull
> git branch -d add-soup
> git fetch --prune
> git log --oneline --graph
> git tag -a v1.0 -m "Family cookbook 1.0"
> git push origin v1.0
> git tag
> git show v1.0 --no-patch
$ git switch -c fix-pancakes
+file pancakes.md
# Pancakes

- 200 g flour
- 2 eggs
- 300 ml milk
- a pinch of salt
+end
$ git commit -am "Add the salt the pancakes were missing"
$ git push -u origin fix-pancakes
# Sam reviews the pull request and merges it on GitHub
@as sam
> git fetch
> git switch main
> git pull
> git merge --no-ff origin/fix-pancakes -m "Merge pull request #3 from alex/fix-pancakes"
> git push
> git push origin --delete fix-pancakes
@as alex
$ git switch main
$ git pull
$ git tag -a v1.0.1 -m "Family cookbook 1.0.1"
$ git push origin v1.0.1
$ git tag
`````

`tutorial-sources/git/sessions/module_10/m10-e3-solution.session`:

`````text
title: Who added this line?
title-zh: 这一行是谁加的？
role: solution
---
# The cookbook is on the server, and both people have a clone
> mkdir cookbook
> cd cookbook
> git init
+hidden README.md
# Family cookbook

Our family's recipes, collected by Alex and Sam.
+end
+hidden index.md
# Recipes

- [Pancakes](pancakes.md)
+end
+hidden pancakes.md
# Pancakes

- 200 g flour
- 2 eggs
- 300 ml milk
+end
> git add README.md index.md pancakes.md
> git commit -m "Start the family cookbook"
> git init --bare /srv/git/cookbook.git
> git remote add origin /srv/git/cookbook.git
> git push -u origin main
@as sam
> git clone /srv/git/cookbook.git
> cd cookbook
> git log --oneline
@as alex
> git config --global pull.rebase false
@as sam
> git config --global pull.rebase false
@as alex
> git switch -c add-soup
+hidden soup.md
# Tomato soup

- 1 kg tomatoes
+end
+hidden index.md
# Recipes

- [Pancakes](pancakes.md)
- [Tomato soup](soup.md)
+end
> git add soup.md index.md
> git commit -m "Add a tomato soup recipe"
> git push -u origin add-soup
@as sam
> git switch -c add-bread
+hidden bread.md
# Soda bread

- 450 g flour
+end
+hidden index.md
# Recipes

- [Pancakes](pancakes.md)
- [Soda bread](bread.md)
+end
> git add bread.md index.md
> git commit -m "Add a soda bread recipe"
> git push -u origin add-bread
@as alex
# Sam reviews Alex's pull request and merges it on GitHub
@as sam
> git fetch
> git switch main
> git merge --no-ff origin/add-soup -m "Merge pull request #1 from alex/add-soup"
> git push
> git push origin --delete add-soup
> git switch add-bread
@as alex
@as sam
> git fetch
>! git merge origin/main
+hidden index.md
# Recipes

- [Pancakes](pancakes.md)
- [Soda bread](bread.md)
- [Tomato soup](soup.md)
+end
> git add index.md
> git commit
> git push
# Alex reviews Sam's pull request and merges it on GitHub
@as alex
> git fetch
> git switch main
> git pull
> git merge --no-ff origin/add-bread -m "Merge pull request #2 from alex/add-bread"
> git push
> git push origin --delete add-bread
# Alex's main is up to date with the merged pull requests
> git switch main
> git pull
> git branch -d add-soup
> git fetch --prune
> git log --oneline --graph
> git tag -a v1.0 -m "Family cookbook 1.0"
> git push origin v1.0
> git tag
> git show v1.0 --no-patch
$ git log --oneline -S "Soda bread"
$ git log -n 1 --format="%an, %s" 0070943
`````

`tutorial-sources/git/sessions/module_10/m10-e4-solution.session`:

`````text
title: Delete a tag pushed by mistake
title-zh: 删除误推送的标签
role: solution
---
# The cookbook is on the server, and both people have a clone
> mkdir cookbook
> cd cookbook
> git init
+hidden README.md
# Family cookbook

Our family's recipes, collected by Alex and Sam.
+end
+hidden index.md
# Recipes

- [Pancakes](pancakes.md)
+end
+hidden pancakes.md
# Pancakes

- 200 g flour
- 2 eggs
- 300 ml milk
+end
> git add README.md index.md pancakes.md
> git commit -m "Start the family cookbook"
> git init --bare /srv/git/cookbook.git
> git remote add origin /srv/git/cookbook.git
> git push -u origin main
@as sam
> git clone /srv/git/cookbook.git
> cd cookbook
> git log --oneline
@as alex
> git config --global pull.rebase false
@as sam
> git config --global pull.rebase false
@as alex
> git switch -c add-soup
+hidden soup.md
# Tomato soup

- 1 kg tomatoes
+end
+hidden index.md
# Recipes

- [Pancakes](pancakes.md)
- [Tomato soup](soup.md)
+end
> git add soup.md index.md
> git commit -m "Add a tomato soup recipe"
> git push -u origin add-soup
@as sam
> git switch -c add-bread
+hidden bread.md
# Soda bread

- 450 g flour
+end
+hidden index.md
# Recipes

- [Pancakes](pancakes.md)
- [Soda bread](bread.md)
+end
> git add bread.md index.md
> git commit -m "Add a soda bread recipe"
> git push -u origin add-bread
@as alex
# Sam reviews Alex's pull request and merges it on GitHub
@as sam
> git fetch
> git switch main
> git merge --no-ff origin/add-soup -m "Merge pull request #1 from alex/add-soup"
> git push
> git push origin --delete add-soup
> git switch add-bread
@as alex
@as sam
> git fetch
>! git merge origin/main
+hidden index.md
# Recipes

- [Pancakes](pancakes.md)
- [Soda bread](bread.md)
- [Tomato soup](soup.md)
+end
> git add index.md
> git commit
> git push
# Alex reviews Sam's pull request and merges it on GitHub
@as alex
> git fetch
> git switch main
> git pull
> git merge --no-ff origin/add-bread -m "Merge pull request #2 from alex/add-bread"
> git push
> git push origin --delete add-bread
# Alex's main is up to date with the merged pull requests
> git switch main
> git pull
> git branch -d add-soup
> git fetch --prune
> git log --oneline --graph
> git tag -a v1.0 -m "Family cookbook 1.0"
> git push origin v1.0
> git tag
> git show v1.0 --no-patch
$ git tag -a v2.0 -m "Family cookbook 2.0"
$ git push origin v2.0
$ git tag -d v2.0
$ git push origin --delete v2.0
$ git tag
`````


`tutorial-sources/git/figures/en/fig-09-01.svg`:

`````text
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 276" role="img" aria-labelledby="t">
  <title id="t">Two commits, their trees and their blobs</title>
  <defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0L10 5L0 10z" fill="#334155"/></marker></defs>
  <g font-family="system-ui, -apple-system, Segoe UI, sans-serif" text-anchor="middle">
    <rect x="400" y="20" width="200" height="52" rx="10" fill="#EFF6FF" stroke="#2563EB" stroke-width="2"/><text x="500.0" y="42" font-size="14" font-weight="700" fill="#1E3A8A">commit</text><text x="500.0" y="61" font-size="12" fill="#334155">Add a pancake recipe</text><rect x="80" y="20" width="200" height="52" rx="10" fill="#EFF6FF" stroke="#2563EB" stroke-width="2"/><text x="180.0" y="42" font-size="14" font-weight="700" fill="#1E3A8A">commit</text><text x="180.0" y="61" font-size="12" fill="#334155">Add a README</text><line x1="398" y1="46" x2="282" y2="46" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/><text x="340" y="38" font-size="12" fill="#7C3AED">parent</text><rect x="440" y="110" width="120" height="34" rx="10" fill="#DCFCE7" stroke="#16A34A" stroke-width="2"/><text x="500.0" y="132" font-size="14" font-weight="700" fill="#14532D">tree</text><rect x="120" y="110" width="120" height="34" rx="10" fill="#DCFCE7" stroke="#16A34A" stroke-width="2"/><text x="180.0" y="132" font-size="14" font-weight="700" fill="#14532D">tree</text><line x1="500" y1="74" x2="500" y2="108" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/><line x1="180" y1="74" x2="180" y2="108" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/><rect x="250" y="180" width="180" height="52" rx="10" fill="#FEF3C7" stroke="#D97706" stroke-width="2"/><text x="340.0" y="202" font-size="14" font-weight="700" fill="#78350F">blob</text><text x="340.0" y="221" font-size="12" fill="#334155">README.md contents</text><rect x="480" y="180" width="180" height="52" rx="10" fill="#FEF3C7" stroke="#D97706" stroke-width="2"/><text x="570.0" y="202" font-size="14" font-weight="700" fill="#78350F">blob</text><text x="570.0" y="221" font-size="12" fill="#334155">pancakes.md contents</text><line x1="180" y1="146" x2="300" y2="178" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/><line x1="470" y1="146" x2="380" y2="178" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/><line x1="530" y1="146" x2="560" y2="178" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/><text x="340" y="262" font-size="13" fill="#475569">A commit points to a tree and to its parent; a tree points to blobs. An unchanged file is stored once.</text>
  </g>
</svg>
`````

`tutorial-sources/git/figures/zh/fig-09-01.svg`:

`````text
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 276" role="img" aria-labelledby="t">
  <title id="t">两次提交及其树对象和数据对象</title>
  <defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0L10 5L0 10z" fill="#334155"/></marker></defs>
  <g font-family="system-ui, -apple-system, Segoe UI, sans-serif" text-anchor="middle">
    <rect x="400" y="20" width="200" height="52" rx="10" fill="#EFF6FF" stroke="#2563EB" stroke-width="2"/><text x="500.0" y="42" font-size="14" font-weight="700" fill="#1E3A8A">提交</text><text x="500.0" y="61" font-size="12" fill="#334155">Add a pancake recipe</text><rect x="80" y="20" width="200" height="52" rx="10" fill="#EFF6FF" stroke="#2563EB" stroke-width="2"/><text x="180.0" y="42" font-size="14" font-weight="700" fill="#1E3A8A">提交</text><text x="180.0" y="61" font-size="12" fill="#334155">Add a README</text><line x1="398" y1="46" x2="282" y2="46" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/><text x="340" y="38" font-size="12" fill="#7C3AED">父提交</text><rect x="440" y="110" width="120" height="34" rx="10" fill="#DCFCE7" stroke="#16A34A" stroke-width="2"/><text x="500.0" y="132" font-size="14" font-weight="700" fill="#14532D">树</text><rect x="120" y="110" width="120" height="34" rx="10" fill="#DCFCE7" stroke="#16A34A" stroke-width="2"/><text x="180.0" y="132" font-size="14" font-weight="700" fill="#14532D">树</text><line x1="500" y1="74" x2="500" y2="108" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/><line x1="180" y1="74" x2="180" y2="108" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/><rect x="250" y="180" width="180" height="52" rx="10" fill="#FEF3C7" stroke="#D97706" stroke-width="2"/><text x="340.0" y="202" font-size="14" font-weight="700" fill="#78350F">数据对象</text><text x="340.0" y="221" font-size="12" fill="#334155">README.md 的内容</text><rect x="480" y="180" width="180" height="52" rx="10" fill="#FEF3C7" stroke="#D97706" stroke-width="2"/><text x="570.0" y="202" font-size="14" font-weight="700" fill="#78350F">数据对象</text><text x="570.0" y="221" font-size="12" fill="#334155">pancakes.md 的内容</text><line x1="180" y1="146" x2="300" y2="178" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/><line x1="470" y1="146" x2="380" y2="178" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/><line x1="530" y1="146" x2="560" y2="178" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/><text x="340" y="262" font-size="13" fill="#475569">提交指向一棵树和它的父提交；树指向数据对象。没有改动的文件只存储一次。</text>
  </g>
</svg>
`````

`tutorial-sources/git/GLOSSARY.md`:

`````markdown
# English–Chinese glossary

Use these renderings in every Chinese page. On first use in a module, give the English term in parentheses, e.g. 暂存区（staging area）. Commands, options, file names and Git's output are never translated. Names of GitHub features follow GitHub's own Chinese interface.

| English | 中文 | Notes |
|---|---|---|
| command session ("Try it" transcript) | 动手环节 | 练习 is only for exercises |
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
| detached HEAD | 分离的 HEAD | first use: 分离的 HEAD（detached HEAD） |
| diff | 差异 | the output of git diff |
| context lines | 上下文 | unchanged lines shown in a diff |
| restore / unstage | 恢复 / 取消暂存 | git restore |
| amend | 修补 | git commit --amend |
| revert | 撤销 | git revert: undo with a new commit |
| merge commit | 合并提交 | |
| parent (commit) | 父提交 | |
| three-way merge | 三方合并 | |
| conflict marker | 冲突标记 | <<<<<<<, =======, >>>>>>> |
| resolve (a conflict) | 解决（冲突） | |
| abort (a merge) | 放弃（合并） | git merge --abort |
| HEAD | HEAD | not translated |
| merge | 合并 | |
| fast-forward | 快进 | |
| merge conflict | 合并冲突 | |
| remote (repository) | 远程仓库 | |
| clone / fetch / pull / push | 克隆 / 获取 / 拉取 / 推送 | |
| tracking branch / upstream | 跟踪分支 / 上游 | |
| remote-tracking branch | 远程跟踪分支 | origin/main |
| bare repository | 裸仓库 | |
| divergent (branches) | 分叉 | |
| feature branch / feature-branch workflow | 功能分支 / 功能分支工作流 | |
| pull request | 拉取请求 | GitHub's Chinese interface |
| fork | 复刻 | GitHub's Chinese interface |
| issue | 议题 | GitHub's Chinese interface |
| code review (the practice) | 代码评审 | |
| review (a pull request) | 审查 | GitHub's Chinese docs; GitHub's buttons stay in English |
| rebase / interactive rebase | 变基 / 交互式变基 | |
| to-do list (of a rebase) | 待办列表 | |
| reset | 重置 | git reset |
| force push | 强制推送 | |
| squash | 压缩 | |
| stash | 贮藏 | as in Pro Git's Chinese edition |
| reflog | 引用日志（reflog） | |
| tag / release (verb) | 标签 / 发布 | |
| annotated tag / lightweight tag | 附注标签 / 轻量标签 | as in Pro Git's Chinese edition |
| release (a GitHub page) | 发行版 | GitHub's Chinese docs |
| semantic versioning | 语义化版本 | |
| ruleset / branch protection | 规则集 / 分支保护 | |
| object / blob / tree | 对象 / 数据对象 / 树对象 | first use: 数据对象（blob） |
| ref / symbolic ref | 引用 / 符号引用 | |
| terminal / command line | 终端 / 命令行 | |
| folder / home folder | 文件夹 / 主文件夹 | |
| editor | 编辑器 | |
| configuration / setting | 配置 / 设置 | |
`````


- [ ] **Step 4: Run the tests to see them pass**

Run: `node --test --test-concurrency=1 "tutorial-sources/git/tests/*.test.mjs"`
Expected: `# tests 69`, `# pass 69`, `# fail 0`.

- [ ] **Step 5: Commit**

```bash
git add tutorial-sources/git/plan/module_09.json tutorial-sources/git/plan/module_10.json tutorial-sources/git/sessions/module_09 tutorial-sources/git/sessions/module_10 tutorial-sources/git/figures/en/fig-09-01.svg tutorial-sources/git/figures/zh/fig-09-01.svg tutorial-sources/git/GLOSSARY.md tutorial-sources/git/tests/series-sessions.test.mjs
git commit -m "Git series: Modules 9-10 configuration, sessions, figure and glossary" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Module 9 in English and Chinese

**Files:**
- Create: `tutorial-sources/git/src/en/module_09.md`, `tutorial-sources/git/src/zh/module_09.md`
- Modify: `tutorial-sources/git/tests/lesson-facts.test.mjs`
- Modify (generated): `docs/tutorials/git/`

**Interfaces:** consumes Task 1's Module 9 sessions and `fig-09-01`. Quiz answer positions are `1, 2, 0, 1, 2, 1, 2` in both languages.

- [ ] **Step 1: Write the failing test**

Append to `tutorial-sources/git/tests/lesson-facts.test.mjs`:

```js

test('Module 9 warns against editing the .git folder by hand', () => {
  assert.match(lesson('en', 9), /Never edit or delete files inside `\.git` by hand\./);
  assert.match(lesson('zh', 9), /永远不要手动编辑或删除 `\.git` 中的文件。/);
});
```

Run: `node --test --test-concurrency=1 "tutorial-sources/git/tests/lesson-facts.test.mjs"`
Expected: 1 failing test, with `ENOENT … src/en/module_09.md`.

- [ ] **Step 2: Create the lessons**

The facts were checked against the [git cat-file](https://git-scm.com/docs/git-cat-file), [git hash-object](https://git-scm.com/docs/git-hash-object), [git rev-parse](https://git-scm.com/docs/git-rev-parse) and [gitrepository-layout](https://git-scm.com/docs/gitrepository-layout) references.

`tutorial-sources/git/src/en/module_09.md`:

`````markdown
## Objects and hashes {#s1}

You can use Git for years without knowing how it stores your work. But a look inside explains much of what you have learned: why commits have hashes, why a branch costs nothing, why rewriting a commit changes every commit after it, and why a detached HEAD is nothing to fear. This module opens the `.git` folder. Everything in it is read-only for you: you only look.

At heart, Git is a small database of **objects**. Each object is stored under a name calculated from its content, its **hash**, a 40-character hexadecimal number such as `8bf3c2d58c2d8d9c541c166d6e80435faab5756a`. Three kinds of object hold your history:

- A **blob** holds the contents of one file: just the bytes, without the file's name.
- A **tree** holds the contents of one folder: a list of names, each with the hash of a blob (for a file) or of another tree (for a subfolder).
- A **commit** holds the hash of the tree for the whole project, the hash of its parent commit (two for a merge, none for the first commit), the author, the committer, the dates and the message.

So a commit is a snapshot: its tree describes every file in the project at that moment. A fourth kind, the **annotated tag**, appears in Module 10.

::: figure #fig-09-01
Two commits from the recipes repository. Each points to its own tree, and the newer one to its parent. Both trees point to the same README blob, because the README did not change between them.
:::

## Looking inside a commit {#s2}

`git cat-file` shows any object: `-t` prints its type, and `-p` ("pretty-print") its contents. You can name an object by its full hash, or by the first few characters as long as no other object starts with them; seven usually suffice.

In the session, you follow the newest commit of the recipes repository down to a file. To follow along in your own repository, start from a hash that `git log --oneline` prints, then copy each hash you see into the next command.

{{SESSION:m09-look-inside}}

- `git cat-file -t 8bf3c2d` says that `8bf3c2d` is a `commit`.
- `-p` shows the whole commit object, and it is short. `tree` gives the hash of the project's tree, and `parent` the hash of the commit before it, `907a979`. `author` and `committer` give the name and email, then the date as seconds since 1 January 1970 (UTC), then the time zone, `+0000`. After a blank line comes the message. That is all a commit is.
- `git cat-file -p 063e137` shows that tree. Each line has a **mode** (`100644` means an ordinary file; `100755` an executable one, and `040000` a subfolder, which is another tree), a type, a hash and a name.
- `git cat-file -p 871d830` shows the blob for `pancakes.md`: exactly the file's contents, with no name and no date. The name lives in the tree.
- The first commit, `907a979`, has a `tree` but no `parent` line: that is what makes it the first.

The author and the committer are usually the same person. They differ when someone applies another person's work, for example when a rebase replays a colleague's commits: the author wrote the change, the committer made this commit of it.

## Hashes come from content {#s3}

Git calculates an object's hash from its content, with a short header that gives the object's type and size. The same content always gives the same hash, on every computer, and any change, however small, gives a completely different one. `git hash-object <file>` calculates the hash a file would have as a blob, without storing anything.

In the session, you compare the hash of `pancakes.md` with that of an identical copy, and then with the copy after changing one character, a full stop. To follow along, use any file in your repository.

{{SESSION:m09-hash}}

`pancakes.md` hashes to `871d830f…`, the same blob hash the tree listed in Section 2. The identical copy gives the same hash, so Git would store it only once, under that name. Adding one full stop gives a hash with nothing in common with the first.

This explains several things you have seen:

- **Unchanged files cost nothing.** A new commit's tree refers to the same blobs as before for every file that did not change. Only changed files add new blobs.
- **History cannot change unnoticed.** A commit contains its tree's hash and its parent's hash. Change anything in an old commit, even a typo in its message, and its hash changes; the next commit names a different parent, so its hash changes too, and so on to the newest commit. This is why amending and rebasing make *new* commits (Modules 3 and 8), and why others notice when shared history is rewritten.
- **Copies agree.** Two clones that have a commit with the same hash have exactly the same history up to that commit.

::: note title="SHA-1 and SHA-256"
Git's hashes are calculated with SHA-1, in a hardened form that detects known attacks. Recent versions of Git can also create repositories that use the stronger SHA-256 (`git init --object-format=sha256`), whose hashes are 64 characters long. Hosting services do not yet generally support them, so stay with the default for now.
:::

## Where objects live {#s4}

Everything Git knows about a repository is in its `.git` folder. In the session, you list it, find the objects, and pick out one by its hash. To follow along, run the same commands in your own repository; your folder names under `objects` will differ.

{{SESSION:m09-objects}}

The entries of `.git`, in the order `ls` lists them:

- `COMMIT_EDITMSG` holds the message of the last commit you made.
- `HEAD` records where you are (Section 5), and `config` holds the repository's settings, including its remotes.
- `description` is used only by an old web viewer, and `hooks` holds sample scripts that Git can run at certain moments.
- `index` is the staging area from Module 2: a list of the files and blobs the next commit will contain.
- `info` holds `exclude`, a private `.gitignore` for this clone only.
- `logs` holds the reflog from Module 8.
- `objects` and `refs` hold the objects and the branches.

Under `objects`, each object is a file named after its hash: the first two characters name a folder, and the other 38 the file. So blob `871d830f…` is the file `1d830f4cec…` in the folder `87`. The six folders correspond to the six objects of the two commits: two commits, two trees and two blobs. The README's blob is shared by both trees, as the figure in Section 1 shows.

The object files are compressed, so you cannot read them with `cat`; use `git cat-file`. As a repository grows, Git packs many objects into a few files under `objects/pack`, storing similar objects as differences from each other. That is why a repository with a long history usually takes less space than you might expect.

::: pitfall
Never edit or delete files inside `.git` by hand. A damaged object or reference can make commits unreadable. Everything this module shows has a Git command that does it safely.
:::

## Branches and HEAD {#s5}

A branch is not an object. It is a **ref**, a reference: a name that points at a commit, stored in `.git/refs/heads/` as a small file containing the commit's hash. **HEAD** is a ref too, usually a *symbolic* one: instead of a hash, it names the branch you are on.

In the session, you read HEAD and `main`, create a branch, switch to it, and watch the files change. To follow along, run the same commands; your hashes will differ.

{{SESSION:m09-refs}}

- `.git/HEAD` contains `ref: refs/heads/main`: you are on `main`. `.git/refs/heads/main` contains one line, the hash of the newest commit, `8bf3c2d…`.
- `git branch soups` creates `.git/refs/heads/soups`, with the same hash. That one small file is the whole branch, which is why creating a branch is instant and copies nothing (Module 4).
- `git switch soups` changes `.git/HEAD` to `ref: refs/heads/soups`. When you commit, Git writes the new commit's hash into the file of the branch that HEAD names, which is how the branch label moves forward.
- `git rev-parse HEAD` turns any name into the hash it stands for. It is the safe way to read refs from scripts.

Other refs follow the same pattern. Remote-tracking branches such as `origin/main` live under `refs/remotes/`, and tags under `refs/tags/`. A **detached HEAD** (Module 3) is simply a `.git/HEAD` that contains a commit's hash directly, instead of the name of a branch, as Exercise 4 shows.

Git does not always keep one file per ref. It can collect many refs in a single file, `.git/packed-refs`, and newer versions offer another storage format altogether. So read refs with commands such as `git rev-parse` and `git branch`, not by opening files.

## Exercises {#exercises}

::: exercise #e1 level=1 kind=conceptual minutes=3
**Which object?** For each, say whether it is stored in a blob, a tree or a commit: the text of `pancakes.md`; the name `pancakes.md`; the commit message; the hash of the parent commit; the fact that `pancakes.md` is an ordinary file, not an executable one.
:::

::: solution
The text: a blob. The name: a tree. The message: a commit. The parent's hash: a commit. The file mode (`100644`): a tree, next to the name.
:::

::: exercise #e2 level=1 kind=coding minutes=4
**The first commit's tree.** List the files in the tree of the first commit of your recipes repository, using only `git log` and `git cat-file`.
:::

::: solution
Find the first commit, read its tree's hash, then show the tree:

{{SESSION:m09-e2-solution}}

The first tree lists only `README.md`. Its blob, `2ecc1f2`, is the same as in the newer tree of Section 2: the README did not change.
:::

::: exercise #e3 level=2 kind=conceptual minutes=3
**One letter.** You correct a typo in the message of a commit that has three commits after it, with `reword` in an interactive rebase. Why do all four commits get new hashes, although only one message changed?
:::

::: solution
The changed commit's content differs, so its hash changes. The next commit contains its parent's hash, which is now different, so its content and hash change as well, and so on for each later commit. Each commit's hash covers the whole history before it.
:::

::: exercise #e4 level=2 kind=coding minutes=4
**A detached HEAD on disk.** Detach HEAD at the commit before the newest one, and look at `.git/HEAD`. Then switch back to `main` and look again.
:::

::: solution
{{SESSION:m09-e4-solution}}

Detached, `.git/HEAD` holds a commit hash; on a branch, it holds `ref: refs/heads/main`. A commit made while detached moves only HEAD, and no branch file records it, which is why such commits are easy to lose (Module 3).
:::

::: exercise #e5 level=2 kind=conceptual minutes=3
**Count the objects.** A new repository gets two commits. The first adds `a.txt` and `b.txt`. The second changes only `b.txt`. How many blobs, trees and commits does the repository hold?
:::

::: solution
Three blobs (`a.txt`, the first `b.txt`, the second `b.txt`), two trees (one per commit, both naming the same `a.txt` blob) and two commits: seven objects.
:::

::: exercise #e6 level=1 kind=conceptual minutes=3
**Cheap branches.** Explain, in terms of what is stored, why creating a branch takes no time, and why deleting a merged branch loses nothing.
:::

::: solution
A branch is one small file holding a commit's hash; creating it writes that file, and copies no objects. Deleting a merged branch deletes only that file. The commits are objects, and the branch they were merged into still reaches them through its own commits' parents.
:::

## Self-check quiz {#quiz}

```quiz
? What does a blob contain?
- [ ] A file's name and contents
- [x] Only a file's contents
- [ ] A list of files in a folder
- [ ] A commit message
> The name is stored in the tree that lists the blob.

? What does a commit object contain?
- [ ] Copies of every changed file
- [ ] Only the message and the date
- [x] A tree hash, parent hashes, author, committer, dates and the message
- [ ] The names of the branches that contain it
> The tree describes the whole project; the parents link the commit into the history.

? Two files in different folders have exactly the same contents. How many blobs does Git store for them?
- [x] One
- [ ] Two
- [ ] None until they are pushed
- [ ] One per commit that contains them
> The same content gives the same hash, so it is stored once.

? Why does changing an old commit change the hashes of all later commits?
- [ ] Git renumbers commits after every change.
- [x] Each commit contains its parent's hash, so a new parent hash changes the next commit's content.
- [ ] Hashes depend on the current date.
- [ ] Only the branch label changes, not the hashes.
> This chain of hashes is what makes history tamper-evident.

? What does `.git/refs/heads/main` usually contain?
- [ ] A copy of every commit on `main`
- [ ] The list of files on `main`
- [x] The hash of the newest commit on `main`
- [ ] The text `ref: main`
> A branch is a name for one commit; the history follows from that commit's parents.

? What does `.git/HEAD` contain when you are on `main`?
- [ ] The hash of the first commit
- [x] `ref: refs/heads/main`
- [ ] The word `main` and a date
- [ ] Nothing: HEAD is not a file
> When HEAD is detached, it contains a commit's hash instead.

? Which command safely shows the contents of any object?
- [ ] `cat .git/objects/…`
- [ ] `git show-object`
- [x] `git cat-file -p`
- [ ] `git log --raw`
> Object files are compressed, and some objects live in packs, so read them through Git.
```

## Further reading {#reading}

- Scott Chacon and Ben Straub, *Pro Git*, sections [10.2: Git Objects](https://git-scm.com/book/en/v2/Git-Internals-Git-Objects) and [10.3: Git References](https://git-scm.com/book/en/v2/Git-Internals-Git-References).
- The reference pages for [git cat-file](https://git-scm.com/docs/git-cat-file), [git hash-object](https://git-scm.com/docs/git-hash-object) and [git rev-parse](https://git-scm.com/docs/git-rev-parse).
- [gitrepository-layout](https://git-scm.com/docs/gitrepository-layout), which describes every file in the `.git` folder.
`````

`tutorial-sources/git/src/zh/module_09.md`:

`````markdown
## 对象与哈希 {#s1}

你可以用 Git 好多年，却不知道它是怎样保存你的工作的。但看一眼内部，就能解释你学过的许多东西：为什么提交有哈希，为什么分支不花任何成本，为什么改写一次提交会改变它之后的每一次提交，以及为什么分离的 HEAD 并不可怕。本模块打开 `.git` 文件夹。其中的一切对你来说都是只读的：你只看，不改。

从本质上说，Git 是一个由**对象**（object）组成的小型数据库。每个对象都以根据其内容计算出的名字存储，这个名字就是它的**哈希**，一个 40 个字符的十六进制数，例如 `8bf3c2d58c2d8d9c541c166d6e80435faab5756a`。有三种对象保存着你的历史：

- **数据对象**（blob）保存一个文件的内容：只有字节，没有文件名。
- **树对象**（tree）保存一个文件夹的内容：一份名字列表，每个名字都带有一个数据对象（对应文件）或另一个树对象（对应子文件夹）的哈希。
- **提交对象**（commit）保存整个项目的树对象的哈希、父提交的哈希（合并提交有两个，第一次提交没有）、作者、提交者、日期和说明。

所以，一次提交就是一个快照：它的树对象描述了那一刻项目中的每个文件。第四种对象，即**附注标签**（annotated tag），会在第 10 模块中出现。

::: figure #fig-09-01
食谱仓库中的两次提交。每次提交都指向自己的树对象，较新的那次还指向它的父提交。两个树对象都指向同一个 README 数据对象，因为 README 在两次提交之间没有变化。
:::

## 查看一次提交的内部 {#s2}

`git cat-file` 可以显示任意对象：`-t` 打印它的类型，`-p`（pretty-print，美观打印）打印它的内容。你可以用完整的哈希指定对象，也可以只用开头的几个字符，只要没有别的对象以它们开头就行；通常七个字符就够了。

在这个动手环节中，你从食谱仓库最新的提交出发，一路追到一个文件。要在你自己的仓库中跟着操作，请从 `git log --oneline` 打印的某个哈希开始，然后把你看到的每个哈希复制到下一条命令中。

{{SESSION:m09-look-inside}}

- `git cat-file -t 8bf3c2d` 说明 `8bf3c2d` 是一个 `commit`。
- `-p` 显示整个提交对象，它很短。`tree` 给出项目树对象的哈希，`parent` 给出前一次提交的哈希 `907a979`。`author` 和 `committer` 给出姓名和邮箱，然后是日期，即自 1970 年 1 月 1 日（UTC）以来的秒数，再后面是时区 `+0000`。空一行之后是说明。一次提交就只有这些内容。
- `git cat-file -p 063e137` 显示那个树对象。每一行都有一个**模式**（mode）（`100644` 表示普通文件；`100755` 表示可执行文件，`040000` 表示子文件夹，也就是另一个树对象）、一个类型、一个哈希和一个名字。
- `git cat-file -p 871d830` 显示 `pancakes.md` 的数据对象：正好是文件的内容，没有名字，也没有日期。名字保存在树对象里。
- 第一次提交 `907a979` 有 `tree`，但没有 `parent` 这一行：正是这一点使它成为第一次提交。

作者和提交者通常是同一个人。当有人应用了别人的工作时，两者就会不同，例如变基重放同事的提交时：作者写出了这项改动，提交者则为它生成了这次提交。

## 哈希来自内容 {#s3}

Git 根据对象的内容计算它的哈希，内容前面还会加上一个简短的头部，写明对象的类型和大小。相同的内容总是得到相同的哈希，在任何一台电脑上都一样；任何改动，无论多么微小，都会得到一个完全不同的哈希。`git hash-object <file>` 计算一个文件作为数据对象时的哈希，但不存储任何东西。

在这个动手环节中，你把 `pancakes.md` 的哈希与一份完全相同的副本的哈希进行比较，然后再与改动了一个字符（一个句点）之后的副本比较。要跟着操作，请使用你仓库中的任意文件。

{{SESSION:m09-hash}}

`pancakes.md` 的哈希是 `871d830f…`，与第 2 节中树对象列出的数据对象哈希相同。完全相同的副本得到相同的哈希，所以 Git 只会以这个名字存储它一次。加上一个句点之后，得到的哈希与原来的毫无共同之处。

这解释了你见过的几件事：

- **没有改动的文件不占额外空间。** 对于每个没有改动的文件，新提交的树对象引用的仍是原来的数据对象。只有改动过的文件才会增加新的数据对象。
- **历史无法被悄悄改动。** 一次提交包含它的树对象的哈希和父提交的哈希。改动一次旧提交中的任何内容，哪怕只是说明里的一个错字，它的哈希就会改变；下一次提交指向的父提交就不同了，所以它的哈希也会改变，如此一直延续到最新的提交。这就是为什么修补和变基会生成*新的*提交（第 3 和第 8 模块），也是为什么共享的历史一旦被改写，别人就会察觉。
- **副本彼此一致。** 两个克隆如果都有某个哈希相同的提交，那么直到这次提交为止，它们的历史完全相同。

::: note title="SHA-1 与 SHA-256"
Git 的哈希用 SHA-1 计算，采用的是能检测已知攻击的加固版本。较新版本的 Git 也可以创建使用更强的 SHA-256 的仓库（`git init --object-format=sha256`），其哈希长 64 个字符。托管服务目前大多还不支持这种仓库，所以暂时请使用默认设置。
:::

## 对象存放在哪里 {#s4}

Git 关于一个仓库所知道的一切都在它的 `.git` 文件夹中。在这个动手环节中，你列出它的内容，找到对象，并按哈希挑出其中一个。要跟着操作，请在你自己的仓库中运行同样的命令；你在 `objects` 下看到的文件夹名会有所不同。

{{SESSION:m09-objects}}

`.git` 中的各项，按 `ls` 列出的顺序：

- `COMMIT_EDITMSG` 保存你最近一次提交的说明。
- `HEAD` 记录你所在的位置（第 5 节），`config` 保存仓库的设置，包括它的远程仓库。
- `description` 只供一个老式的网页查看器使用，`hooks` 保存示例脚本，Git 可以在某些时刻运行这些脚本。
- `index` 就是第 2 模块中的暂存区：一份下一次提交将包含的文件及其数据对象的列表。
- `info` 中有 `exclude`，这是只对这个克隆生效的私有 `.gitignore`。
- `logs` 保存第 8 模块中的 reflog。
- `objects` 和 `refs` 保存对象和分支。

在 `objects` 下，每个对象都是一个以其哈希命名的文件：前两个字符是文件夹名，其余 38 个字符是文件名。所以数据对象 `871d830f…` 就是文件夹 `87` 中的文件 `1d830f4cec…`。这六个文件夹对应两次提交的六个对象：两个提交对象、两个树对象和两个数据对象。README 的数据对象由两个树对象共用，如第 1 节的图所示。

对象文件是压缩过的，所以你无法用 `cat` 阅读它们；请使用 `git cat-file`。随着仓库增长，Git 会把许多对象打包到 `objects/pack` 下的少数几个文件中，并把相似的对象存储为彼此之间的差异。这就是为什么历史很长的仓库占用的空间通常比你预想的少。

::: pitfall
永远不要手动编辑或删除 `.git` 中的文件。损坏的对象或引用可能导致提交无法读取。本模块展示的每一件事，都有能安全完成它的 Git 命令。
:::

## 分支与 HEAD {#s5}

分支不是对象。它是一个**引用**（ref）：一个指向某次提交的名字，以小文件的形式存放在 `.git/refs/heads/` 中，文件内容是那次提交的哈希。**HEAD** 也是一个引用，通常是*符号引用*（symbolic ref）：它不保存哈希，而是写着你所在分支的名字。

在这个动手环节中，你读取 HEAD 和 `main`，创建一个分支并切换过去，然后观察这些文件的变化。要跟着操作，请运行同样的命令；你的哈希会有所不同。

{{SESSION:m09-refs}}

- `.git/HEAD` 中写着 `ref: refs/heads/main`：你在 `main` 上。`.git/refs/heads/main` 只有一行，即最新提交的哈希 `8bf3c2d…`。
- `git branch soups` 创建了 `.git/refs/heads/soups`，其中是同一个哈希。这个小文件就是整个分支，所以创建分支能瞬间完成，而且不复制任何东西（第 4 模块）。
- `git switch soups` 把 `.git/HEAD` 改成了 `ref: refs/heads/soups`。你提交时，Git 会把新提交的哈希写进 HEAD 所指分支的文件中，分支标签就是这样向前移动的。
- `git rev-parse HEAD` 把任何名字转换成它所代表的哈希。在脚本中读取引用时，这是安全的做法。

其他引用也遵循同样的模式。`origin/main` 这样的远程跟踪分支位于 `refs/remotes/` 下，标签位于 `refs/tags/` 下。**分离的 HEAD**（第 3 模块）不过是 `.git/HEAD` 中直接写着某次提交的哈希，而不是分支名，练习 4 会展示这一点。

Git 并不总是为每个引用保存一个文件。它可以把许多引用收集到一个文件 `.git/packed-refs` 中，较新的版本还提供了一种完全不同的存储格式。所以请用 `git rev-parse`、`git branch` 等命令读取引用，而不要直接打开文件。

## 练习 {#exercises}

::: exercise #e1 level=1 kind=conceptual minutes=3
**哪种对象？** 下面每一项分别保存在数据对象、树对象还是提交对象中：`pancakes.md` 的文字；名字 `pancakes.md`；提交说明；父提交的哈希；`pancakes.md` 是普通文件而不是可执行文件这一事实。
:::

::: solution
文字：数据对象。名字：树对象。提交说明：提交对象。父提交的哈希：提交对象。文件模式（`100644`）：树对象，与名字写在一起。
:::

::: exercise #e2 level=1 kind=coding minutes=4
**第一次提交的树。** 只用 `git log` 和 `git cat-file`，列出你的食谱仓库中第一次提交的树对象里的文件。
:::

::: solution
找到第一次提交，读出它的树对象的哈希，再显示这个树对象：

{{SESSION:m09-e2-solution}}

第一个树对象中只列出了 `README.md`。它的数据对象 `2ecc1f2` 与第 2 节中较新的树对象里的相同：README 没有变化。
:::

::: exercise #e3 level=2 kind=conceptual minutes=3
**一个字母。** 你在交互式变基中用 `reword` 修正了一次提交的说明中的错字，而这次提交之后还有三次提交。为什么只改了一条说明，四次提交却都得到了新的哈希？
:::

::: solution
被改动的那次提交内容变了，所以它的哈希也变了。下一次提交包含其父提交的哈希，而这个哈希现在不同了，所以它的内容和哈希也随之改变，之后的每次提交都是如此。每次提交的哈希都涵盖了它之前的全部历史。
:::

::: exercise #e4 level=2 kind=coding minutes=4
**磁盘上的分离 HEAD。** 让 HEAD 分离到最新提交之前的那次提交上，然后查看 `.git/HEAD`。接着切换回 `main`，再看一次。
:::

::: solution
{{SESSION:m09-e4-solution}}

分离时，`.git/HEAD` 中是一个提交的哈希；在分支上时，其中是 `ref: refs/heads/main`。在分离状态下做的提交只会移动 HEAD，没有任何分支文件记录它，所以这样的提交很容易丢失（第 3 模块）。
:::

::: exercise #e5 level=2 kind=conceptual minutes=3
**数一数对象。** 一个新仓库有两次提交。第一次加入 `a.txt` 和 `b.txt`。第二次只改动了 `b.txt`。这个仓库中有多少个数据对象、树对象和提交对象？
:::

::: solution
三个数据对象（`a.txt`、第一版 `b.txt`、第二版 `b.txt`），两个树对象（每次提交一个，都指向同一个 `a.txt` 数据对象），以及两个提交对象：共七个对象。
:::

::: exercise #e6 level=1 kind=conceptual minutes=3
**廉价的分支。** 从存储的角度解释：为什么创建分支不花时间，以及为什么删除一个已合并的分支不会丢失任何东西。
:::

::: solution
分支就是一个保存某次提交哈希的小文件；创建分支只是写下这个文件，不复制任何对象。删除已合并的分支只是删除这个文件。提交是对象，而它们被合并进去的那个分支，仍然能通过自己的提交的父提交找到它们。
:::

## 自测 {#quiz}

```quiz
? 数据对象中保存着什么？
- [ ] 文件的名字和内容
- [x] 只有文件的内容
- [ ] 一个文件夹中的文件列表
- [ ] 一条提交说明
> 名字保存在列出这个数据对象的树对象中。

? 提交对象中保存着什么？
- [ ] 每个改动过的文件的副本
- [ ] 只有说明和日期
- [x] 树对象的哈希、父提交的哈希、作者、提交者、日期和说明
- [ ] 包含它的那些分支的名字
> 树对象描述整个项目；父提交把这次提交与历史连接起来。

? 不同文件夹中的两个文件内容完全相同。Git 为它们存储几个数据对象？
- [x] 一个
- [ ] 两个
- [ ] 推送之前一个也不存
- [ ] 每次包含它们的提交各存一个
> 相同的内容得到相同的哈希，所以只存储一次。

? 为什么改动一次旧提交会改变之后所有提交的哈希？
- [ ] Git 在每次改动后都会重新给提交编号。
- [x] 每次提交都包含父提交的哈希，所以新的父提交哈希会改变下一次提交的内容。
- [ ] 哈希取决于当前日期。
- [ ] 只有分支标签会变，哈希不会变。
> 正是这条哈希链让历史一旦被篡改就会被察觉。

? `.git/refs/heads/main` 中通常是什么？
- [ ] `main` 上每次提交的副本
- [ ] `main` 上的文件列表
- [x] `main` 上最新提交的哈希
- [ ] 文字 `ref: main`
> 分支是某一次提交的名字；历史则由那次提交的父提交依次得出。

? 你在 `main` 上时，`.git/HEAD` 中是什么？
- [ ] 第一次提交的哈希
- [x] `ref: refs/heads/main`
- [ ] 单词 `main` 加上一个日期
- [ ] 什么也没有：HEAD 不是文件
> HEAD 分离时，其中是一个提交的哈希。

? 哪条命令能安全地显示任意对象的内容？
- [ ] `cat .git/objects/…`
- [ ] `git show-object`
- [x] `git cat-file -p`
- [ ] `git log --raw`
> 对象文件是压缩过的，有些对象还存放在包文件中，所以请通过 Git 读取它们。
```

## 延伸阅读 {#reading}

- Scott Chacon 和 Ben Straub，《Pro Git》，第 [10.2 节：Git 对象](https://git-scm.com/book/zh/v2/Git-内部原理-Git-对象)和第 [10.3 节：Git 引用](https://git-scm.com/book/zh/v2/Git-内部原理-Git-引用)。
- [git cat-file](https://git-scm.com/docs/git-cat-file)、[git hash-object](https://git-scm.com/docs/git-hash-object) 和 [git rev-parse](https://git-scm.com/docs/git-rev-parse) 的参考页面。
- [gitrepository-layout](https://git-scm.com/docs/gitrepository-layout)，其中描述了 `.git` 文件夹中的每个文件。
`````


- [ ] **Step 3: Build, test and read**

```bash
node --test --test-concurrency=1 "tutorial-sources/git/tests/*.test.mjs"
node tutorial-sources/git/build.mjs
```

Expected:
- `# tests 70`, `# pass 70`;
- `Built modules 01, 02, 03, 04, 05, 06, 07, 08, 09 in English and Chinese; ran 56 sessions …`.

Read both pages. Check that the figure appears, and that the prose's hashes match the transcripts.

- [ ] **Step 4: Commit**

```bash
git add tutorial-sources/git/src/en/module_09.md tutorial-sources/git/src/zh/module_09.md tutorial-sources/git/tests/lesson-facts.test.mjs docs/tutorials/git
git commit -m "Git series: Module 9 in English and Chinese" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Module 10 in English and Chinese

**Files:**
- Create: `tutorial-sources/git/src/en/module_10.md`, `tutorial-sources/git/src/zh/module_10.md`
- Modify: `tutorial-sources/git/tests/lesson-facts.test.mjs`
- Modify (generated): `docs/tutorials/git/`

**Interfaces:** consumes Task 1's Module 10 sessions. Quiz answer positions are `1, 0, 2, 1, 2, 1, 1` in both languages.

- [ ] **Step 1: Write the failing test**

Append to `tutorial-sources/git/tests/lesson-facts.test.mjs`:

```js

test('Module 10 says that tags need their own push, and that nobody can approve their own pull request', () => {
  assert.match(lesson('en', 10), /Tags are not pushed by `git push`; push each one by name, as in `git push origin v1\.0`\./);
  assert.match(lesson('zh', 10), /`git push` 不会推送标签；请按名字逐个推送，例如 `git push origin v1\.0`。/);
  assert.match(lesson('en', 10), /GitHub does not let anyone approve their own pull request/);
  assert.match(lesson('zh', 10), /GitHub 不允许任何人批准自己的拉取请求/);
});
```

Run: `node --test --test-concurrency=1 "tutorial-sources/git/tests/lesson-facts.test.mjs"`
Expected: 1 failing test, with `ENOENT … src/en/module_10.md`.

- [ ] **Step 2: Create the lessons**

Open the GitHub Docs links in the lesson, about collaborators, protected branches, releases, rulesets and merge conflicts, and confirm that the steps and button names still match.

`tutorial-sources/git/src/en/module_10.md`:

`````markdown
## The project {#s1}

This module puts the whole series to work on one small project, from the first commit to a published release. Alex and Sam build a **family cookbook**: a README, an index of recipes, and one file per recipe. The commands are the ones you already know. What is new is doing all of it together, in order, the way a team works.

The project has five milestones:

1. **A shared repository.** Alex starts the project and shares it; Sam clones it.
2. **Two features at once.** Alex adds a soup recipe and Sam a bread recipe, each on a branch, each proposed in a pull request.
3. **A conflict.** Alex's pull request is merged first, and Sam's now conflicts with it. Sam brings `main` into the branch and resolves the conflict.
4. **Review and merge.** Alex reviews Sam's pull request and merges it, and everyone tidies up.
5. **A release.** Alex tags the result as version 1.0 and publishes it.

The team follows the rules from Module 7: nobody commits to `main` directly, every change goes through a branch and a pull request, and someone other than the author reviews and merges it.

Do the project on GitHub. There are two ways:

- **With a friend.** Each of you has a GitHub account and a computer. One plays Alex and owns the repository; the other plays Sam.
- **On your own.** You play both people, with two folders and two terminal windows, as in Module 6. On GitHub, both people are you. GitHub does not let anyone approve their own pull request, so where the project says *approve*, leave a review comment instead, then merge.

The sessions show every step with the stand-in server from Module 6. Where a step happens on GitHub instead, such as creating the repository, opening a pull request or merging one, the text says how.

## Milestone 1: a shared repository {#s2}

Alex creates the project: a new folder, `git init`, three files and a first commit. Then Alex puts it on the server and pushes `main`, and Sam clones it.

On GitHub:
- Alex creates an empty repository called `cookbook`, as in Module 6, and pushes to its address instead of `/srv/git/cookbook.git`.
- With a friend, Alex then invites Sam to the repository, following [Inviting collaborators to a personal repository](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/repository-access-and-collaboration/inviting-collaborators-to-a-personal-repository). Once Sam accepts, Sam can push branches to it.
- On your own, you need no invitation. Clone the repository into Sam's folder, and set Sam's name and email in that clone as in Module 6.

{{SESSION:m10-start}}

Everything here comes from earlier modules. `git add` names the three files at once. The first commit is a root commit, and `git push -u` creates `main` on the server and makes it the upstream. Sam's clone then has the same single commit, `db5abad`.

::: tip
Teams often ask GitHub to enforce the rules. A **ruleset** or **branch protection** on `main` can require a pull request, and an approving review, before anything is merged. [About protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches) explains the options. It is optional for this project.
:::

## Milestone 2: two features at once {#s3}

Alex and Sam now work at the same time, each on their own branch. Each adds a recipe file and a line for it in `index.md`, under the pancakes. Then each pushes the branch and opens a pull request on GitHub, as in Module 7: Alex's becomes pull request #1, Sam's #2. Write a title and a short description for each.

{{SESSION:m10-parallel}}

Each person's commit touches two files: the new recipe and `index.md`. The graph shows Sam's repository. Sam's branch, `add-bread`, is one commit ahead of `main`. Sam's repository has not fetched Alex's branch, so it does not appear.

Both changes add a line to `index.md` in the same place, straight after the pancakes. Neither person knows yet, but that makes a conflict certain, as Module 5 explained.

## Milestone 3: a conflict {#s4}

Sam reviews pull request #1, approves it and merges it with **Merge pull request**, then deletes the branch with **Delete branch**. Now `main` has the soup, and Sam's pull request #2 no longer merges cleanly. GitHub shows it on the pull request's page: *This branch has conflicts that must be resolved*.

The fix belongs on the branch, so it is Sam's job, as the branch's author: bring the new `main` into `add-bread`, resolve the conflict, and push. That is Module 7's "keeping a branch up to date", with Module 5's conflict resolution in the middle.

To follow along on your own, merge pull request #1 on GitHub first. Then work in Sam's folder, on `add-bread`.

{{SESSION:m10-conflict}}

`git fetch` brings in the merged `main`. `git merge origin/main` stops with a conflict in `index.md`. The markers show Sam's line, `HEAD`, which is the branch Sam is on, against the soup line from `origin/main`. Both lines belong in the index. Sam keeps both, in alphabetical order, and removes the markers. Then `git add`, `git commit` (accepting the ready-made message `Merge remote-tracking branch 'origin/main' into add-bread`) and `git push`.

The graph shows the result: `add-bread` now contains both the bread commit and everything on `main`, including Alex's merged pull request. On GitHub, the pull request updates by itself, and the conflict warning disappears.

## Milestone 4: review and merge {#s5}

Alex reviews pull request #2 in the **Files changed** tab, which now shows only Sam's changes: the new bread file and the resolved index. Alex approves it and merges it. Then both people bring their `main` up to date and delete the merged branches, as in Module 7.

{{SESSION:m10-merge}}

Sam switches to `main`, pulls the merge of pull request #2, deletes the local branch and prunes `origin/add-bread`. `cat index.md` shows the index with all three recipes.

The graph is the most tangled in this series, so read it from the bottom:
- the first commit, `db5abad`;
- the two feature commits, `0070943` (bread) and `7c82c56` (soup);
- the merge of pull request #1;
- Sam's merge of `main` into `add-bread`;
- at the top, the merge of pull request #2.

Every line of work is there, and every merge says where it came from. Such a history is normal for a team that merges; Module 8 showed how rebasing can keep it straighter.

## Milestone 5: a release {#s6}

The cookbook is ready for its first version. A **tag** gives a commit a permanent name, such as `v1.0`, that does not move as new work arrives, unlike a branch.

Git has two kinds of tag:
- a **lightweight tag**, made with `git tag <name>`, is just a name for a commit, like a branch that never moves;
- an **annotated tag**, made with `git tag -a <name> -m "<message>"`, is an object of its own (Module 9). It records who made it, when, and why.

Use annotated tags for releases.

Tags are not pushed by `git push`; push each one by name, as in `git push origin v1.0`. Many projects number their releases with [Semantic Versioning](https://semver.org/): `v1.0.1` for a fix, `v1.1.0` for a new feature that changes nothing existing, and `v2.0.0` for a change that breaks something people rely on.

{{SESSION:m10-release}}

- `git log --oneline --graph` shows the history being released. `git tag -a v1.0 -m "Family cookbook 1.0"` tags the newest commit, the merge of pull request #2.
- `git push origin v1.0` sends the tag: `* [new tag] v1.0 -> v1.0`. `git tag` lists the tags.
- `git show v1.0 --no-patch` shows the tag object (tagger, date and message), followed by the commit it names.
- The graph shows the tag as a yellow label on that commit.
- When Sam fetches, Git brings the new tag along: `* [new tag] v1.0 -> v1.0`.

To publish the release on GitHub, open the repository's **Releases** page, choose **Draft a new release**, select the tag `v1.0`, and write a title and a short list of what is in it. [Managing releases in a repository](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository) shows the steps. A release is a page for people who use the project, built on the tag that Git records.

::: keyidea
That is the whole cycle: branch, commit, push, pull request, review, merge, update, tag. Everything in this series serves one of those steps, and every Git project you join, however large, works this way.
:::

## Exercises {#exercises}

These extension tasks continue the project. Do them in your cookbook, on GitHub.

::: exercise #e1 level=2 kind=coding minutes=10
**A fix release.** The pancake recipe has no salt. As Alex, fix it through a pull request, and release the fix as `v1.0.1`.
:::

::: solution
Branch, commit, push and open a pull request. Once it is merged, update `main`, then tag and push the tag:

{{SESSION:m10-e1-solution}}

In the session, Sam merges pull request #3, as the merge on GitHub would. A fix that changes nothing else gets the next patch number, `v1.0.1`.
:::

::: exercise #e2 level=1 kind=conceptual minutes=6
**Avoid the conflict.** The conflict in Milestone 3 was predictable: every new recipe adds a line in the same place in `index.md`. Suggest two ways the team could avoid such conflicts in future.
:::

::: solution
Any two of these:
- Agree that one person updates the index after each merge, so recipe branches never touch it.
- Keep the index in alphabetical order, so that different recipes usually go on different lines (though neighbouring lines can still conflict).
- Merge `main` into a branch just before opening its pull request, so that whoever is second sees the other change while it is small.
- Generate the index from the recipe files with a script, instead of editing it by hand.
:::

::: exercise #e3 level=2 kind=coding minutes=8
**Who added this?** A new member asks who added the soda bread to the index, and in which commit. Find out with `git log`.
:::

::: solution
`git log -S` lists the commits that added or removed a piece of text:

{{SESSION:m10-e3-solution}}

`-S "Soda bread"` finds `0070943`, the commit that added the text. `--format` then prints its author and message. `git blame index.md` gives a similar answer line by line: it shows, for every line, the last commit that changed it.
:::

::: exercise #e4 level=2 kind=coding minutes=8
**A tag pushed by mistake.** Alex tagged and pushed `v2.0` by mistake. Remove the tag, locally and on the server.
:::

::: solution
Delete the tag locally with `git tag -d`, and on the server with `git push origin --delete`:

{{SESSION:m10-e4-solution}}

Anyone who has already fetched `v2.0` keeps their copy, because fetching never deletes tags. Tags are meant to be permanent, so when a released version turns out to be wrong, release a new one, such as `v1.0.2`, rather than moving or deleting a tag that others may have.
:::

::: exercise #e5 level=1 kind=conceptual minutes=6
**Which kind of tag?** Why does the project use annotated tags for releases rather than lightweight ones? When might a lightweight tag be enough?
:::

::: solution
An annotated tag records who made the release, when, and a message, and GitHub shows that information on the release. It can also be signed. A lightweight tag is only a name for a commit: enough for a private bookmark, such as `before-big-change`, that you do not intend to share.
:::

::: exercise #e6 level=2 kind=conceptual minutes=7
**Protect `main`.** In Milestone 3, nothing stopped Sam from merging pull request #1 without reading it, or from pushing straight to `main`. What could the team set up on GitHub, and what would each person then have to do differently?
:::

::: solution
A ruleset or branch protection on `main` that requires a pull request with at least one approving review. Pushes straight to `main` are then rejected, and the **Merge pull request** button stays disabled until someone other than the author approves. Everyone keeps working exactly as in this project: branch, push, pull request, review.
:::

## Self-check quiz {#quiz}

```quiz
? GitHub says that your pull request *has conflicts that must be resolved*. What do you do?
- [ ] Close the pull request and start again from `main`
- [x] Merge the latest `main` into your branch, resolve the conflict, commit and push
- [ ] Ask the reviewer to merge it anyway
- [ ] Delete `main` and push your branch as `main`
> The pull request updates by itself once the branch contains `main` and the conflict is resolved.

? Who usually resolves a conflict in a pull request?
- [x] The branch's author, on the branch
- [ ] The reviewer, on `main`
- [ ] GitHub, automatically
- [ ] Whoever pushed to `main` last
> The resolution is a change to the branch, so it goes through review with the rest of it.

? What is the difference between a tag and a branch?
- [ ] A tag can point to several commits.
- [ ] A branch cannot be pushed.
- [x] A tag stays on its commit, while a branch moves forward with new commits.
- [ ] There is none.
> A tag names a commit permanently, which is what a release needs.

? You have tagged `v1.0` and run `git push`. Why is the tag not on GitHub?
- [ ] Tags are created on GitHub, not locally.
- [x] `git push` does not send tags; push it with `git push origin v1.0`.
- [ ] Only annotated tags can be pushed.
- [ ] You must fetch before tags are pushed.
> Tags are pushed one by one, or all at once with `--tags`.

? With Semantic Versioning, a release that only fixes a bug in `v1.4.2` is numbered:
- [ ] `v2.0.0`
- [ ] `v1.5.0`
- [x] `v1.4.3`
- [ ] `v1.4.2-fix`
> Fixes raise the last number, new features the middle one, and breaking changes the first.

? What does an annotated tag record that a lightweight tag does not?
- [ ] The files of the release
- [x] Who made it, when, and a message
- [ ] The branches that contain the commit
- [ ] The pull requests that were merged
> An annotated tag is an object of its own; a lightweight tag is only a name for a commit.

? Which order matches the cycle this project followed?
- [ ] Commit to `main`, push, tag, review
- [x] Branch, commit, push, pull request, review, merge, tag
- [ ] Fork, rebase, force-push, tag
- [ ] Tag, branch, merge, push
> Every change went through a branch and a reviewed pull request; the release tag came last.
```

## Further reading {#reading}

- Scott Chacon and Ben Straub, *Pro Git*, section [2.6: Tagging](https://git-scm.com/book/en/v2/Git-Basics-Tagging), and the reference page for [git tag](https://git-scm.com/docs/git-tag).
- GitHub Docs, [About rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets) and [About merge conflicts](https://docs.github.com/en/pull-requests/reference/merge-conflicts).
- Where to go next, when you need them:
  - [submodules](https://git-scm.com/book/en/v2/Git-Tools-Submodules), for a repository inside another;
  - [Git LFS](https://git-lfs.com/), for large files such as videos;
  - [hooks](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks), for scripts that run on commit or push;
  - [git bisect](https://git-scm.com/book/en/v2/Git-Tools-Debugging-with-Git), for finding the commit that introduced a bug;
  - [git worktree](https://git-scm.com/docs/git-worktree), for several branches checked out at once;
  - [signing your work](https://git-scm.com/book/en/v2/Git-Tools-Signing-Your-Work), with GitHub's [commit signature verification](https://docs.github.com/en/authentication/managing-commit-signature-verification/about-commit-signature-verification).
`````

`tutorial-sources/git/src/zh/module_10.md`:

`````markdown
## 项目介绍 {#s1}

本模块把整个系列学到的内容用在一个小项目上，从第一次提交一直到发布一个版本。Alex 和 Sam 要共同编写一本**家庭食谱**：一个 README、一份食谱索引，以及每份食谱一个文件。用到的命令你都已经学过。新的地方在于，要按照团队的工作方式，把所有这些步骤按顺序一起完成。

这个项目有五个里程碑：

1. **共享仓库。** Alex 创建项目并共享出去；Sam 克隆它。
2. **同时开发两项功能。** Alex 加入一份汤的食谱，Sam 加入一份面包的食谱，各自在一个分支上进行，各自用一个拉取请求提出。
3. **一次冲突。** Alex 的拉取请求先被合并，于是 Sam 的拉取请求与之冲突。Sam 把 `main` 带进自己的分支并解决冲突。
4. **审查与合并。** Alex 审查并合并 Sam 的拉取请求，大家各自整理。
5. **发布版本。** Alex 把成果标记为 1.0 版并发布。

团队遵循第 7 模块中的规则：没有人直接向 `main` 提交，每项改动都经过分支和拉取请求，并由作者以外的人审查和合并。

请在 GitHub 上完成这个项目。有两种方式：

- **和朋友一起。** 你们各有一个 GitHub 账号和一台电脑。一人扮演 Alex 并拥有仓库，另一人扮演 Sam。
- **一个人完成。** 你一人分饰两角，像第 6 模块那样使用两个文件夹和两个终端窗口。在 GitHub 上，两个人都是你。GitHub 不允许任何人批准自己的拉取请求，所以项目中说到*批准*的地方，请改为留下一条审查评论，然后合并。

动手环节用第 6 模块中的替身服务器展示每一个步骤。如果某一步要在 GitHub 上进行，例如创建仓库、发起或合并拉取请求，正文会说明怎么做。

## 里程碑 1：共享仓库 {#s2}

Alex 创建项目：一个新文件夹、`git init`、三个文件和第一次提交。然后 Alex 把它放到服务器上并推送 `main`，Sam 再克隆它。

在 GitHub 上：
- Alex 像第 6 模块那样创建一个名为 `cookbook` 的空仓库，并推送到它的地址，而不是 `/srv/git/cookbook.git`。
- 和朋友一起做时，Alex 接着按照[邀请协作者访问个人仓库](https://docs.github.com/zh/repositories/managing-your-repositorys-settings-and-features/repository-access-and-collaboration/inviting-collaborators-to-a-personal-repository)邀请 Sam 加入仓库。Sam 接受邀请之后，就可以向它推送分支了。
- 一个人做时，不需要邀请。把仓库克隆到 Sam 的文件夹中，并像第 6 模块那样在这个克隆中设置 Sam 的姓名和邮箱。

{{SESSION:m10-start}}

这里的每一步都来自前面的模块。`git add` 一次列出三个文件。第一次提交是根提交，`git push -u` 在服务器上创建 `main` 并把它设为上游。随后 Sam 的克隆中也有了同一次提交 `db5abad`。

::: tip
团队常常让 GitHub 来强制执行这些规则。对 `main` 设置**规则集**（ruleset）或**分支保护**（branch protection），可以要求在合并任何东西之前，必须有拉取请求和一次批准的审查。[关于受保护分支](https://docs.github.com/zh/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)解释了这些选项。对本项目来说，这是可选的。
:::

## 里程碑 2：同时开发两项功能 {#s3}

现在 Alex 和 Sam 同时工作，各自在自己的分支上。每人加入一个食谱文件，并在 `index.md` 中煎饼下面为它加上一行。然后每人推送分支，并像第 7 模块那样在 GitHub 上发起拉取请求：Alex 的成为拉取请求 #1，Sam 的成为 #2。请为每个拉取请求写一个标题和一段简短的描述。

{{SESSION:m10-parallel}}

每人的提交都涉及两个文件：新的食谱和 `index.md`。提交图显示的是 Sam 的仓库。Sam 的分支 `add-bread` 比 `main` 领先一次提交。Sam 的仓库还没有获取 Alex 的分支，所以图中没有它。

两处改动都在 `index.md` 的同一个位置，也就是紧接在煎饼之后，加了一行。两个人都还不知道，但正如第 5 模块所解释的，这注定会产生冲突。

## 里程碑 3：一次冲突 {#s4}

Sam 审查拉取请求 #1，批准后用 **Merge pull request** 合并它，再用 **Delete branch** 删除分支。现在 `main` 中有了汤，而 Sam 的拉取请求 #2 已经无法顺利合并了。GitHub 会在拉取请求的页面上显示：*This branch has conflicts that must be resolved*。

修复应该在分支上进行，所以这是 Sam 作为分支作者的工作：把新的 `main` 带进 `add-bread`，解决冲突，然后推送。这就是第 7 模块中的“让分支保持最新”，中间再加上第 5 模块的冲突解决。

一个人跟着做时，请先在 GitHub 上合并拉取请求 #1。然后在 Sam 的文件夹中，在 `add-bread` 上操作。

{{SESSION:m10-conflict}}

`git fetch` 取回了合并后的 `main`。`git merge origin/main` 因 `index.md` 中的冲突而停下。冲突标记把 Sam 的那一行（`HEAD`，即 Sam 所在的分支）与来自 `origin/main` 的汤那一行对照显示。两行都应该留在索引中。Sam 按字母顺序保留两行，并删除标记。然后是 `git add`、`git commit`（接受现成的说明 `Merge remote-tracking branch 'origin/main' into add-bread`）和 `git push`。

提交图显示了结果：`add-bread` 现在既包含面包的提交，也包含 `main` 上的一切，其中有 Alex 已合并的拉取请求。在 GitHub 上，拉取请求会自动更新，冲突警告也随之消失。

## 里程碑 4：审查与合并 {#s5}

Alex 在 **Files changed** 标签页中审查拉取请求 #2，那里现在只显示 Sam 的改动：新的面包文件和解决冲突后的索引。Alex 批准并合并了它。然后两个人都把自己的 `main` 更新到最新，并像第 7 模块那样删除已合并的分支。

{{SESSION:m10-merge}}

Sam 切换到 `main`，拉取拉取请求 #2 的合并，删除本地分支，并清理 `origin/add-bread`。`cat index.md` 显示索引中已有全部三份食谱。

这张提交图是本系列中最复杂的一张，所以请从下往上读：
- 第一次提交 `db5abad`；
- 两次功能提交 `0070943`（面包）和 `7c82c56`（汤）；
- 拉取请求 #1 的合并；
- Sam 把 `main` 合并进 `add-bread`；
- 最上面是拉取请求 #2 的合并。

每一条工作线都在，每一次合并都说明了来自哪里。对于使用合并的团队来说，这样的历史很正常；第 8 模块介绍了如何用变基让它更直一些。

## 里程碑 5：发布版本 {#s6}

食谱已经可以发布第一个版本了。**标签**（tag）给一次提交起一个永久的名字，例如 `v1.0`，它不会像分支那样随着新工作的到来而移动。

Git 有两种标签：
- **轻量标签**（lightweight tag），用 `git tag <name>` 创建，只是某次提交的一个名字，就像一个永远不动的分支；
- **附注标签**（annotated tag），用 `git tag -a <name> -m "<message>"` 创建，本身就是一个对象（第 9 模块）。它记录了谁创建了它、什么时候、为什么。

发布版本请使用附注标签。

`git push` 不会推送标签；请按名字逐个推送，例如 `git push origin v1.0`。许多项目用[语义化版本](https://semver.org/lang/zh-CN/)（Semantic Versioning）给发布版本编号：修正问题用 `v1.0.1`，增加不改变现有内容的新功能用 `v1.1.0`，做出破坏别人所依赖内容的改动则用 `v2.0.0`。

{{SESSION:m10-release}}

- `git log --oneline --graph` 显示即将发布的历史。`git tag -a v1.0 -m "Family cookbook 1.0"` 给最新的提交，即拉取请求 #2 的合并，打上标签。
- `git push origin v1.0` 发送这个标签：`* [new tag] v1.0 -> v1.0`。`git tag` 列出所有标签。
- `git show v1.0 --no-patch` 显示标签对象（打标签者、日期和说明），后面是它所指向的提交。
- 提交图在那次提交上用一个黄色标签显示它。
- Sam 获取时，Git 会把新标签一起带来：`* [new tag] v1.0 -> v1.0`。

要在 GitHub 上发布这个版本，请打开仓库的 **Releases** 页面，选择 **Draft a new release**，选中标签 `v1.0`，再写一个标题和一份简短的内容清单。[管理仓库中的发行版](https://docs.github.com/zh/repositories/releasing-projects-on-github/managing-releases-in-a-repository)展示了具体步骤。发行版是给项目使用者看的页面，建立在 Git 记录的标签之上。

::: keyidea
这就是完整的循环：分支、提交、推送、拉取请求、审查、合并、更新、打标签。本系列的每一部分内容都服务于其中的某一步，你将来加入的每个 Git 项目，无论多大，都是这样运作的。
:::

## 练习 {#exercises}

这些拓展任务是这个项目的延续。请在 GitHub 上你的食谱项目中完成。

::: exercise #e1 level=2 kind=coding minutes=10
**修正版本。** 煎饼食谱里没有盐。请以 Alex 的身份通过拉取请求修正它，并把这次修正发布为 `v1.0.1`。
:::

::: solution
创建分支、提交、推送并发起拉取请求。合并之后，更新 `main`，然后打标签并推送标签：

{{SESSION:m10-e1-solution}}

在动手环节中，Sam 像在 GitHub 上合并那样合并了拉取请求 #3。一个不改动其他内容的修正，得到下一个修订号 `v1.0.1`。
:::

::: exercise #e2 level=1 kind=conceptual minutes=6
**避免冲突。** 里程碑 3 中的冲突是可以预见的：每加一份新食谱，都要在 `index.md` 的同一个位置加一行。请提出两种办法，让团队今后避免这样的冲突。
:::

::: solution
以下任意两种：
- 约定每次合并之后由一个人更新索引，这样食谱分支就永远不碰它。
- 让索引保持字母顺序，这样不同的食谱通常位于不同的行（不过相邻的行仍可能冲突）。
- 在发起拉取请求之前，先把 `main` 合并进分支，这样后提交的人就能在对方的改动还很小时看到它。
- 用脚本根据食谱文件自动生成索引，而不是手工编辑。
:::

::: exercise #e3 level=2 kind=coding minutes=8
**这是谁加的？** 一位新成员问：苏打面包是谁加进索引的？在哪次提交中？请用 `git log` 找出答案。
:::

::: solution
`git log -S` 列出增加或删除了某段文字的提交：

{{SESSION:m10-e3-solution}}

`-S "Soda bread"` 找到了加入这段文字的提交 `0070943`。`--format` 随后打印出它的作者和说明。`git blame index.md` 能逐行给出类似的答案：它为每一行显示最后一次改动它的提交。
:::

::: exercise #e4 level=2 kind=coding minutes=8
**误推送的标签。** Alex 误打并推送了 `v2.0` 标签。请在本地和服务器上删除这个标签。
:::

::: solution
用 `git tag -d` 在本地删除标签，用 `git push origin --delete` 在服务器上删除：

{{SESSION:m10-e4-solution}}

已经获取了 `v2.0` 的人会保留他们的那一份，因为获取从不删除标签。标签本应是永久的，所以当某个已发布的版本有问题时，请发布一个新版本，例如 `v1.0.2`，而不要移动或删除别人可能已经拿到的标签。
:::

::: exercise #e5 level=1 kind=conceptual minutes=6
**用哪种标签？** 为什么这个项目的发布版本使用附注标签而不是轻量标签？什么时候轻量标签就够了？
:::

::: solution
附注标签记录了是谁发布的、什么时候，以及一段说明，GitHub 会在发行版上显示这些信息。它还可以被签名。轻量标签只是某次提交的一个名字：用作不打算分享的私人书签（例如 `before-big-change`）就足够了。
:::

::: exercise #e6 level=2 kind=conceptual minutes=7
**保护 `main`。** 在里程碑 3 中，没有任何东西能阻止 Sam 不看内容就合并拉取请求 #1，或者直接推送到 `main`。团队可以在 GitHub 上设置什么？设置之后，每个人的做法会有什么不同？
:::

::: solution
对 `main` 设置规则集或分支保护，要求必须有拉取请求，并且至少有一次批准的审查。这样，直接推送到 `main` 会被拒绝，而在作者以外的人批准之前，**Merge pull request** 按钮一直不可用。每个人的工作方式与这个项目中完全一样：创建分支、推送、发起拉取请求、审查。
:::

## 自测 {#quiz}

```quiz
? GitHub 提示你的拉取请求 *has conflicts that must be resolved*。你该怎么做？
- [ ] 关闭拉取请求，从 `main` 重新开始
- [x] 把最新的 `main` 合并进你的分支，解决冲突，提交并推送
- [ ] 请审查者无论如何先合并
- [ ] 删除 `main`，把你的分支推送为 `main`
> 分支包含了 `main` 并解决冲突之后，拉取请求会自动更新。

? 拉取请求中的冲突通常由谁来解决？
- [x] 分支的作者，在分支上解决
- [ ] 审查者，在 `main` 上解决
- [ ] GitHub 自动解决
- [ ] 最后一个向 `main` 推送的人
> 解决冲突是对分支的一处改动，所以它会和分支的其他内容一起接受审查。

? 标签和分支有什么区别？
- [ ] 标签可以指向多次提交。
- [ ] 分支无法推送。
- [x] 标签停留在它的提交上，分支则随着新提交向前移动。
- [ ] 没有区别。
> 标签永久地为一次提交命名，这正是发布版本所需要的。

? 你打了 `v1.0` 标签并运行了 `git push`。为什么 GitHub 上没有这个标签？
- [ ] 标签只能在 GitHub 上创建，不能在本地创建。
- [x] `git push` 不发送标签；请用 `git push origin v1.0` 推送它。
- [ ] 只有附注标签才能推送。
- [ ] 推送标签之前必须先获取。
> 标签要逐个推送，或者用 `--tags` 一次全部推送。

? 按照语义化版本，一个只修正了 `v1.4.2` 中某个缺陷的版本编号为：
- [ ] `v2.0.0`
- [ ] `v1.5.0`
- [x] `v1.4.3`
- [ ] `v1.4.2-fix`
> 修正提高最后一位，新功能提高中间一位，破坏性改动提高第一位。

? 附注标签记录了哪些轻量标签没有记录的东西？
- [ ] 发布版本的文件
- [x] 是谁创建的、什么时候，以及一段说明
- [ ] 包含该提交的分支
- [ ] 被合并的拉取请求
> 附注标签本身是一个对象；轻量标签只是某次提交的一个名字。

? 哪种顺序符合这个项目所遵循的循环？
- [ ] 向 `main` 提交、推送、打标签、审查
- [x] 创建分支、提交、推送、拉取请求、审查、合并、打标签
- [ ] 复刻、变基、强制推送、打标签
- [ ] 打标签、创建分支、合并、推送
> 每项改动都经过分支和经审查的拉取请求；发布标签放在最后。
```

## 延伸阅读 {#reading}

- Scott Chacon 和 Ben Straub，《Pro Git》，第 [2.6 节：打标签](https://git-scm.com/book/zh/v2/Git-基础-打标签)，以及 [git tag](https://git-scm.com/docs/git-tag) 的参考页面。
- GitHub 文档：[关于规则集](https://docs.github.com/zh/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)和[关于合并冲突](https://docs.github.com/zh/pull-requests/reference/merge-conflicts)。
- 需要时可以继续深入的方向：
  - [子模块](https://git-scm.com/book/zh/v2/Git-工具-子模块)，用于在一个仓库中包含另一个仓库；
  - [Git LFS](https://git-lfs.com/)，用于视频等大文件；
  - [钩子](https://git-scm.com/book/zh/v2/自定义-Git-Git-钩子)，用于在提交或推送时运行的脚本；
  - [git bisect](https://git-scm.com/book/zh/v2/Git-工具-使用-Git-调试)，用于找出引入缺陷的那次提交；
  - [git worktree](https://git-scm.com/docs/git-worktree)，用于同时检出多个分支；
  - [签署工作](https://git-scm.com/book/zh/v2/Git-工具-签署工作)，以及 GitHub 的[提交签名验证](https://docs.github.com/zh/authentication/managing-commit-signature-verification/about-commit-signature-verification)。
`````


- [ ] **Step 3: Build, test and read**

```bash
node --test --test-concurrency=1 "tutorial-sources/git/tests/*.test.mjs"
node tutorial-sources/git/build.mjs
```

Expected:
- `# tests 71`, `# pass 71`;
- `Built modules 01, 02, 03, 04, 05, 06, 07, 08, 09, 10 in English and Chinese; ran 64 sessions …`.

Read both pages. In `m10-release`, check that:
- the graph draws every merge with two parent lines;
- the yellow `v1.0` label sits on the newest commit;
- Sam's fetch reports `[new tag]`.

- [ ] **Step 4: Commit**

```bash
git add tutorial-sources/git/src/en/module_10.md tutorial-sources/git/src/zh/module_10.md tutorial-sources/git/tests/lesson-facts.test.mjs docs/tutorials/git
git commit -m "Git series: Module 10 in English and Chinese" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: README, tutorials card and full verification

- [ ] **Step 1: Update the README and the card**

In `tutorial-sources/git/README.md`, replace

```
`PLAN-modules-03-05.md` and `PLAN-modules-06-08.md` the plans for Modules 3–5 and 6–8, and `GLOSSARY.md`
```

with

```
`PLAN-modules-03-05.md`, `PLAN-modules-06-08.md` and `PLAN-modules-09-10.md` the plans for the later modules, and `GLOSSARY.md`
```

In `docs/tutorials/index.md`, in the Git card, replace

```
pull requests, and recovering from mistakes.
```

with

```
pull requests, recovering from mistakes, how Git works inside, and a team project from the first commit to a release.
```

and replace

```
Modules 1 to 8 are available now; the other modules are in preparation.
```

with

```
All ten modules are available.
```

- [ ] **Step 2: Full verification**

```bash
node --test --test-concurrency=1 "tutorial-sources/git/tests/*.test.mjs"
node tutorial-sources/git/build.mjs
git status --short docs/tutorials/git
node tutorial-sources/git/build.mjs
git status --short docs/tutorials/git
node tutorial-sources/git/validate.mjs
python -m mkdocs build --strict -d <a temporary folder outside the repository>
```

Expected:
- `# pass 71`, `# fail 0`;
- both builds report 64 sessions, and both `git status` commands print nothing;
- the validator prints `PASS: modules 01, 02, 03, 04, 05, 06, 07, 08, 09, 10 in both languages: …`;
- MkDocs exits 0.

Look at the validator's screenshots for Modules 9 and 10.

- [ ] **Step 3: Commit and stop**

```bash
git add tutorial-sources/git/README.md docs/tutorials/index.md
git commit -m "Git series: all ten modules available" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

Report the commits and the verification results. **Do not push or merge.**

---

### Task 5: Publication (only when the site owner asks)

Merge `git-modules-03-05`, `git-modules-06-08` and `git-modules-09-10` into `main` in that order (or open pull requests), as the site owner chooses.
- Do not stash, reset or commit the other agent's MDE work in the main checkout; stop and ask if a merge would touch it.
- Pushing `main` runs `.github/workflows/deploy.yml`. Watch it with `gh run watch <run-id> --exit-status`.
- Then check that `https://wrwei.github.io/tutorials/git/module_09_EN.html` and `module_10_ZH.html` return 200.
