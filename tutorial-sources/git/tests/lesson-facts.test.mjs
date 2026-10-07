// Facts in the lessons that a review found wrong once. Each check names the claim it protects, so a
// later edit cannot quietly bring the mistake back.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const lesson = (lang, n) => fs.readFileSync(path.join(ROOT, 'src', lang, `module_${String(n).padStart(2, '0')}.md`), 'utf8');

test('Module 5 does not claim that every kind of conflict is finished the same way', () => {
  assert.doesNotMatch(lesson('en', 5), /the steps to resolve them are the same every time/);
  assert.match(lesson('en', 5), /Only the command that finishes or abandons the operation differs/);
  assert.match(lesson('en', 5), /`git revert --continue`/);
  assert.doesNotMatch(lesson('zh', 5), /解决步骤每次都相同/);
  assert.match(lesson('zh', 5), /`git revert --continue`/);
});

test('Module 5 checks a staged resolution with git diff --staged --check', () => {
  for (const lang of ['en', 'zh']) {
    const text = lesson(lang, 5);
    assert.equal((text.match(/`git diff --staged --check`/g) || []).length, 2, `${lang}: Section 5 and Exercise 6 both name it`);
  }
  assert.doesNotMatch(lesson('en', 5), /without arguments, for your unstaged changes\) before you commit a resolution/);
});

test('Module 5 tells learners how to recreate each situation in their own repository', () => {
  const en = lesson('en', 5);
  assert.match(en, /To follow along, first give your recipe a `- 50 g sugar` line/);
  assert.match(en, /To follow along, create `less-sugar`/);
  assert.match(en, /`less-sugar` is already merged/);
  const zh = lesson('zh', 5);
  assert.match(zh, /要跟着操作，请先给你的食谱加上一行 `- 50 g sugar`/);
  assert.match(zh, /要跟着操作，请创建 `less-sugar`/);
  assert.match(zh, /`less-sugar` 已经合并/);
});

test('coding exercises say how to set up what they assume', () => {
  assert.match(lesson('en', 3), /To try it, first create `passwords\.txt` with any text, and commit it\./);
  assert.match(lesson('zh', 3), /要动手试试，请先创建 `passwords\.txt`（内容随意）并提交它。/);
  assert.match(lesson('en', 3), /keep the lines already there/);
  assert.match(lesson('en', 4), /To try it, first create `experiment`, commit something on it, and switch back to `main`\./);
  assert.match(lesson('zh', 4), /要动手试试，请先创建 `experiment`，在上面提交一些内容，再切换回 `main`。/);
  assert.match(lesson('en', 5), /To try it, make a conflict as in Section 3, then `git add` and commit the file without removing the markers\./);
  assert.match(lesson('zh', 5), /要动手试试，请像第 3 节那样制造一次冲突，然后不删除标记就 `git add` 并提交该文件。/);
});

test('the Chinese Module 3 says that git revert, not every undo, needs a clean working tree', () => {
  assert.doesNotMatch(lesson('zh', 3), /撤销要求工作区是干净的/);
  assert.match(lesson('zh', 3), /`git revert` 要求工作区是干净的/);
});

test('Module 6 tells learners where to put their stand-in server', () => {
  for (const lang of ['en', 'zh']) {
    assert.match(lesson(lang, 6), /`git init --bare \.\.\/server\/recipes\.git`/, lang);
    assert.match(lesson(lang, 6), /`git config user\.name "Sam Lee"`/, `${lang}: Sam's name is set in Sam's clone only`);
  }
  assert.match(lesson('en', 6), /Wherever the pages show `\/srv\/git\/recipes\.git`, type that path instead\./);
  assert.match(lesson('zh', 6), /页面上凡是出现 `\/srv\/git\/recipes\.git` 的地方，请改用这个路径。/);
});

test('Module 7 says to prune before deleting a squash-merged branch', () => {
  assert.match(lesson('en', 7), /Prune first: while `origin\/add-soups` still exists in your repository, `-d` checks against it/);
  assert.match(lesson('zh', 7), /请先清理：只要你的仓库中还存在 `origin\/add-soups`，`-d` 就会以它为准/);
});

test('Module 8 shows the to-do list of its squash session, whose hashes the session tests pin', () => {
  for (const lang of ['en', 'zh']) {
    assert.match(lesson(lang, 8), /`{3}text\npick bc5616c # Add a tomato soup recipe\nfixup 2b52993 # fixup! Add a tomato soup recipe\npick 49f29eb # Add a soda bread recipe\n\n# Rebase 8bf3c2d\.\.2b52993 onto 8bf3c2d \(3 commands\)\n`{3}/, lang);
  }
});

test('Module 8 says which side of a rebase conflict is yours', () => {
  assert.match(lesson('en', 8), /in a rebase, `<<<<<<< HEAD` holds `main`'s version/);
  assert.match(lesson('zh', 8), /在变基中，`<<<<<<< HEAD` 下面是 `main` 的版本/);
});
