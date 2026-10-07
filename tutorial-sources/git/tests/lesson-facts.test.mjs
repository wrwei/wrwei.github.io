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
